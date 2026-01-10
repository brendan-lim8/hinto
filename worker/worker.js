export default {
    async fetch(request, env, ctx) {
        // =================================================================================

        // Initial request validations

        if (request.method !== 'POST') {
            return new Response(JSON.stringify({ error: "Use POST" }), { status: 405 });
        }

        let body = {};
        try {
            body = await request.json();
        } catch (e) {
            return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
        }

        try {
            const { guess, target } = body;
            if (!guess || !target) {
                return new Response(JSON.stringify({ error: "Missing 'guess' or 'target'" }), { status: 400 });
            }
            if (typeof guess !== 'string' || typeof target !== 'string') {
                return new Response(JSON.stringify({ error: "'guess' and 'target' must be strings" }), { status: 400 });
            }
        } catch (e) {
            return new Response(JSON.stringify({ error: "Error processing request (1)" }), { status: 400 });
        }

        // Validate guess
        let cleaned_guess = body.guess.replace(/[^a-zA-Z]+/g, '').toLowerCase();
        let cleaned_target = body.target.replace(/[^a-zA-Z]+/g, '').toLowerCase();
        if (cleaned_guess === cleaned_target) {
            // Early return if correct, modify response as needed
            return new Response(JSON.stringify({ result: "correct", guessed: cleaned_guess }), { status: 200 });
        }
        // Currently only supporting 5-letter words
        if (cleaned_guess.length === 0 || cleaned_guess.length !== 5 || cleaned_target.length === 0 || cleaned_target.length !== 5) {
            return new Response(JSON.stringify({ error: "Invalid 'guess' or 'target' length after cleaning", guessed: cleaned_guess }), { status: 400 });
        }

        // =================================================================================

        // Build/send Gemini API request

        const api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
        const gemini_key = env.GEMINI_KEY;
        const request_body = {

        }

        // =================================================================================

        // Temporary return

        return new Response(JSON.stringify({ result: "incorrect", guessed: cleaned_guess }), { status: 200 });
    }
};