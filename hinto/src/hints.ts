import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
    apiKey: "AIzaSyA1VxjVSK_J5HXbes9KkFply_7KuJY7huE"
});

function formatPrompt(guessedWord: string, tries: Number) {
    const prompt = `
        A player guessed the word ${guessedWord} on guess number ${tries}.
        Give one hint guiding the player to the actual word rock".
        Keep the hint one sentence and also give a closeness value between 0 and 100 describing how close the user's word is - 0 is copmletely off, and 100 is the exact same word, and 50 is on the right track.
        Use the following schema for your response: {\n "type": "object",\n "properties": {\n "hint": {\n "type": "string",\n "description": "Hint sentence"\n },\n "closeness": {\n "type": "integer",\n "description": "Closeness value of how similar the words are"\n }\n }.
        Return only the JSON object as a string, without any formatting or newlines.
    `;
    return prompt;
}

export async function getHint(guessedWord: string, tries: Number) {
    const prompt = formatPrompt(guessedWord, tries);
    try {
        const response = await genAI.models.generateContent({
            model: 'gemma-3-27b-it',
            contents: prompt
        });
        const responseText = response.text;
        if (responseText == undefined) {
            return;
        }
        const jsonResponse = JSON.parse(responseText);
        return jsonResponse;
    } catch (err) {
        throw err;
        console.log(err);
    }
}