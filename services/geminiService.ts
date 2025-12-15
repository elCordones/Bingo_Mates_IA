import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

// In a real production app, you might want to proxy this request or use a secured backend.
// For this client-side demo, we use the env variable.
const apiKey = process.env.API_KEY || ''; 

let ai: GoogleGenAI | null = null;
if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
}

export const generateMathProblem = async (
    targetAnswer: number, 
    mathOperation: string, // e.g., "5 + 3"
    language: Language
): Promise<string> => {
    if (!ai) {
        console.warn("Gemini API Key missing");
        return `Solve: ${mathOperation}`;
    }

    const langNames: Record<Language, string> = {
        ca: 'Catalan', es: 'Spanish', en: 'English', gl: 'Galician', eu: 'Basque'
    };

    const prompt = `
        Create a very short, simple, and fun math word problem for a 7-year-old child.
        Language: ${langNames[language]}.
        The operation to practice is based on: ${mathOperation}.
        The answer MUST be exactly ${targetAnswer}.
        Do not include the answer in the text.
        Do not use markdown. Just the text.
        Keep it under 20 words.
        Use emojis if appropriate.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text?.trim() || `Solve: ${mathOperation}`;
    } catch (error) {
        console.error("Gemini Error:", error);
        // Fallback to classic math if AI fails
        return `Solve: ${mathOperation}`;
    }
};