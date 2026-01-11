export default {
    async fetch(request, env, ctx) {
        // =================================================================================

        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        // Handle OPTIONS preflight request
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // Initial request validations

        if (request.method !== 'POST') {
            return new Response(JSON.stringify({ error: "Use POST" }), {
                status: 405,
                headers: corsHeaders
            });
        }

        let body = {};
        try {
            body = await request.json();
        } catch (e) {
            return new Response(JSON.stringify({ error: "Invalid JSON" }), {
                status: 400,
                headers: corsHeaders
            });
        }

        try {
            const { guess, target, history } = body;
            if (!guess || !target) {
                return new Response(JSON.stringify({ error: "Missing 'guess' or 'target'" }), {
                    status: 400,
                    headers: corsHeaders
                });
            }
            if (typeof guess !== 'string' || typeof target !== 'string') {
                return new Response(JSON.stringify({ error: "'guess' and 'target' must be strings" }), {
                    status: 400,
                    headers: corsHeaders
                });
            }
        } catch (e) {
            return new Response(JSON.stringify({ error: "Error processing request (1)" }), {
                status: 400,
                headers: corsHeaders
            });
        }

        // Validate guess
        let cleaned_guess = body.guess.replace(/[^a-zA-Z]+/g, '').toLowerCase();
        let cleaned_target = body.target.replace(/[^a-zA-Z]+/g, '').toLowerCase();
        if (cleaned_guess === cleaned_target) {
            // Early return if correct, modify response as needed
            return new Response(JSON.stringify({ result: "correct", guessed: cleaned_guess }), {
                status: 200,
                headers: corsHeaders
            });
        }
        // Currently only supporting 5-letter words
        if (cleaned_guess.length === 0 || cleaned_guess.length > 20 || cleaned_target.length === 0 || cleaned_target.length > 20) {
            return new Response(JSON.stringify({ error: "Invalid 'guess' or 'target' length after cleaning", guessed: cleaned_guess }), {
                status: 400,
                headers: corsHeaders
            });
        }

        // =================================================================================

        // Build/send Gemini API request

        const previous_guesses_and_hints = body.history ? body.history.map(item => `Guess: ${item.guess}, Hint: ${item.hint}`).join('\n') : "No previous guesses.";

        const api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent";
        const gemini_key = env.GEMINI_KEY;
        const request_body = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": `A player is trying to guess a secret word. The target word is "${cleaned_target}".
The player has made a new guess: "${cleaned_guess}".

Here are the previous guesses and the hints they received:
${previous_guesses_and_hints}

Your task is to provide a helpful hint based on the new guess.

**Instructions:**
1.  **Analyze the connection:** Compare the new guess "${cleaned_guess}" to the target word "${cleaned_target}".
2.  **Consider the history:** Use the previous hints to give a progressively more revealing hint. Don't give hints too similar to past ones. Instead, offer insight about how the target word is used.
3.  **Give a helpful hint:** The hint should connect the guess to the target word. If they are far off, give a more general direction (e.g., "Not quite - think of something living."). As the guess gets closer, the hint should be more specific.
4.  **Keep it short:** The hint must be a single sentence under 10 words.
5.  **Provide a closeness score:** Rate the closeness of the guess to the target on a scale of 0-10 (0=unrelated, 3=some connection, 5=similar category, 8=very close, 10=identical). Base the score on meaning and category.

**CRITICAL: Your response must be in this exact JSON format with no extra characters, markdown, or code blocks:**
{"hint": "your helpful hint here", "closeness": number}

**Example:**
If the target is "fruit" and the guess is "apple", your response might be:
{"hint": "You're in the right category.", "closeness": 8}

Do NOT use markdown. Do NOT use code blocks. Do NOT use backticks. Do NOT use \`\`\`json or \`\`\`. Do NOT add any explanatory text before or after. Start your response immediately with { and end with }. Nothing else.`
                        }
                    ]
                }
            ]
        }
        const headers = {
            "x-goog-api-key": gemini_key,
            'Content-Type': 'application/json'
        }
        let gemini_response;
        try {
            gemini_response = await fetch(api_url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(request_body)
            });
        }
        catch (e) {
            return new Response(JSON.stringify({ error: "Error contacting Gemini API" }), {
                status: 500,
                headers: corsHeaders
            });
        }

        if (!gemini_response.ok) {
            return new Response(JSON.stringify({ error: "Gemini API returned an error", details: await gemini_response.text() }), {
                status: 500,
                headers: corsHeaders
            });
        }

        let gemini_data;
        try {
            gemini_data = await gemini_response.json();
        } catch (e) {
            return new Response(JSON.stringify({ error: "Error parsing Gemini API response" }), {
                status: 500,
                headers: corsHeaders
            });
        }

        const responseText = gemini_data.candidates[0].content.parts[0].text.trim();
        let parsed_response;
        try {
            parsed_response = JSON.parse(responseText);
        } catch (e) {
            return new Response(JSON.stringify({ error: "Error parsing Gemini response JSON", responseText: responseText }), {
                status: 500,
                headers: corsHeaders
            });
        }
        return new Response(JSON.stringify({ result: "incorrect", guessed: cleaned_guess, hint: parsed_response.hint, closeness: parsed_response.closeness }), {
            status: 200,
            headers: corsHeaders
        });

        // =================================================================================

        // Temporary return

        return new Response(JSON.stringify({ result: "incorrect", guessed: cleaned_guess }), {
            status: 200,
            headers: corsHeaders
        });
    }
};