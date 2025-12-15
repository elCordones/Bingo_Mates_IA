import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

const apiKey = process.env.API_KEY || ''; 

let ai: GoogleGenAI | null = null;
if (apiKey && apiKey.length > 5 && !apiKey.includes("ENGANXA")) {
    try {
        ai = new GoogleGenAI({ apiKey });
    } catch (e) {
        console.warn("Invalid API Key format");
    }
}

// --- Offline Templates Engine ---

const TEMPLATES: Record<Language, Record<string, string[]>> = {
    ca: {
        add: ["Tinc {0} pomes i en compro {1}. Quantes en tinc?", "Veig {0} ocells i en venen {1} més. Quants n'hi ha?", "{0} nens juguen i n'arriben {1}. Quants són?"],
        sub: ["Tenia {0} galetes i me'n menjo {1}. Quantes en queden?", "Hi ha {0} globus i en peten {1}. Quants en queden?", "Tinc {0} euros i en gasto {1}. Quant em sobra?"],
        mul: ["Compro {0} bosses amb {1} caramels cadascuna. Quants caramels tinc?", "Hi ha {0} grups de {1} alumnes. Quants alumnes són?", "Tinc {0} capses de {1} colors. Quants colors tinc?"],
        div: ["Reparteixo {0} cartes entre {1} amics. Quantes per a cadascú?", "Tinc {0} flors en {1} gerros iguals. Quantes per gerro?", "{0} euros repartits entre {1} germans. Quant toca a cadascú?"]
    },
    es: {
        add: ["Tengo {0} manzanas y compro {1}. ¿Cuántas tengo?", "Veo {0} pájaros y llegan {1} más. ¿Cuántos hay?", "{0} niños juegan y llegan {1}. ¿Cuántos son?"],
        sub: ["Tenía {0} galletas y como {1}. ¿Cuántas quedan?", "Hay {0} globos y explotan {1}. ¿Cuántos quedan?", "Tengo {0} euros y gasto {1}. ¿Cuánto sobra?"],
        mul: ["Compro {0} bolsas con {1} caramelos. ¿Cuántos tengo?", "Hay {0} grupos de {1} alumnos. ¿Cuántos son?", "Tengo {0} cajas de {1} colores. ¿Cuántos colores hay?"],
        div: ["Reparto {0} cartas entre {1} amigos. ¿Cuántas cada uno?", "Tengo {0} flores en {1} jarrones. ¿Cuántas por jarrón?", "{0} euros entre {1} hermanos. ¿Cuánto toca a cada uno?"]
    },
    en: {
        add: ["I have {0} apples and buy {1} more. How many?", "I see {0} birds and {1} more arrive. Total?", "{0} kids are playing and {1} join. How many?"],
        sub: ["I had {0} cookies and ate {1}. How many left?", "There are {0} balloons and {1} pop. How many left?", "I have {0} dollars and spend {1}. How much left?"],
        mul: ["I buy {0} bags with {1} candies each. Total?", "There are {0} groups of {1} students. How many?", "{0} boxes with {1} crayons each. Total?"],
        div: ["Share {0} cards among {1} friends. How many each?", "{0} flowers in {1} vases. How many per vase?", "Split {0} dollars among {1} friends. How much each?"]
    },
    gl: {
        add: ["Teño {0} mazás e merco {1}. Cantas teño?", "Vexo {0} paxaros e chegan {1} máis. Cantos hai?", "{0} nenos xogan e chegan {1}. Cantos son?"],
        sub: ["Tiña {0} galletas e como {1}. Cantas quedan?", "Hai {0} globos e estouran {1}. Cantos quedan?", "Teño {0} euros e gasto {1}. Canto sobra?"],
        mul: ["Merco {0} bolsas con {1} caramelos. Cantos teño?", "Hai {0} grupos de {1} alumnos. Cantos son?", "Teño {0} caixas de {1} cores. Cantas cores hai?"],
        div: ["Reparto {0} cartas entre {1} amigos. Cantas cada un?", "Teño {0} flores en {1} xarróns. Cantas por xarrón?", "{0} euros entre {1} irmáns. Canto toca a cada un?"]
    },
    eu: {
        add: ["{0} sagar ditut eta {1} erosten ditut. Zenbat?", "{0} txori ikusten ditut eta {1} gehiago datoz.", "{0} haur jolasten eta {1} iristen dira. Zenbat?"],
        sub: ["{0} gaileta nituen eta {1} jan ditut. Zenbat geratzen dira?", "{0} globo daude eta {1} lehertzen dira.", "{0} euro ditut eta {1} gastatzen ditut. Zenbat?"],
        mul: ["{0} poltsa erosten ditut {1} goxokirekin. Zenbat?", "{0} ikasle talde daude {1}na ikaslerekin.", "{0} kaxa {1} kolorekin. Zenbat kolore?"],
        div: ["{0} karta banatzen ditut {1} lagunen artean.", "{0} lore {1} loreontzitan. Zenbat loreontziko?", "{0} euro {1} anai-arreben artean."]
    }
};

const getOfflineProblem = (mathOp: string, lang: Language): string => {
    // Parse math string like "5 + 3" or "10 ÷ 2"
    const parts = mathOp.match(/(\d+)\s*([+\-×÷])\s*(\d+)/);
    if (!parts) return `Solve: ${mathOp}`;

    const [_, n1, opSymbol, n2] = parts;
    let type = 'add';
    if (opSymbol === '-') type = 'sub';
    if (opSymbol === '×') type = 'mul';
    if (opSymbol === '÷') type = 'div';

    const list = TEMPLATES[lang]?.[type] || TEMPLATES['en'][type];
    const template = list[Math.floor(Math.random() * list.length)];

    return template.replace('{0}', n1).replace('{1}', n2);
};

export const generateMathProblem = async (
    targetAnswer: number, 
    mathOperation: string, 
    language: Language
): Promise<string> => {
    // 1. Try AI if available
    if (ai) {
        try {
            const langNames: Record<Language, string> = {
                ca: 'Catalan', es: 'Spanish', en: 'English', gl: 'Galician', eu: 'Basque'
            };
            const prompt = `Create a fun math word problem for a 7-year-old. Lang: ${langNames[language]}. Operation: ${mathOperation}. Answer MUST be ${targetAnswer}. Don't show answer. Max 15 words.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            if (response.text) return response.text.trim();
        } catch (error) {
            console.warn("AI generation failed, switching to offline template.", error);
        }
    }

    // 2. Fallback to Offline Templates
    return getOfflineProblem(mathOperation, language);
};