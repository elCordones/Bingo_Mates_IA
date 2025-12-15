import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export type Language = 'ca' | 'es' | 'en' | 'gl' | 'eu';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Operation = 'add' | 'sub' | 'mul' | 'div';
export type GameMode = 'classic' | 'ai_story';

export interface BingoCell {
    id: number;
    question: string;
    answer: number;
    emoji: string;
    status: 'pending' | 'correct' | 'assisted';
}

export interface Question {
    id: number;
    mathQuestion: string;
    textQuestion?: string;
    answer: number;
    emoji: string;
}

export interface UserData {
    name: string;
    difficulty: Difficulty;
    ops: Operation[];
    mode: GameMode;
}

export interface AttemptRecord {
    question: string;
    answer: number;
    attempts: number;
    status: 'success' | 'failed';
}

export interface Translations {
    title: string;
    setup_title: string;
    name_label: string;
    diff_label: string;
    diff_easy: string;
    diff_medium: string;
    diff_hard: string;
    ops_label: string;
    mode_label: string;
    mode_classic: string;
    mode_ai: string;
    start_btn: string;
    score: string;
    attempts: string;
    collection: string;
    question: string;
    bingo_shout: string;
    congrats: string;
    download: string;
    restart: string;
    loading_ai: string;
    err_select_ops: string;
    err_enter_name: string;
    max_attempts_reached: string;
    failed_status: string;
}

// ==========================================
// 2. CONSTANTS
// ==========================================

export const REWARD_EMOJIS = [
    '🦄', '🦖', '🚀', '🍕', '🎮', '🌈', '🐱', '🤖', '🍦', 
    '🦁', '🎸', '⚽', '🦋', '🍪', '🎨', '🐶', '🎁', '⭐',
    '🍎', '🚗', '🎈', '🐼', '🍩', '🌍', '🏰', '🍄', '🐢'
];

export const TRANSLATIONS: Record<Language, Translations> = {
    ca: {
        title: "Bingo Matemàtic",
        setup_title: "Configuració",
        name_label: "Com et dius?",
        diff_label: "Nivell:",
        diff_easy: "Fàcil",
        diff_medium: "Normal",
        diff_hard: "Difícil",
        ops_label: "Operacions:",
        mode_label: "Mode de Joc:",
        mode_classic: "Clàssic (Números)",
        mode_ai: "Mode Història (Text)",
        start_btn: "COMENÇAR! 🚀",
        score: "Punts",
        attempts: "Vides",
        collection: "Col·lecció",
        question: "Resol:",
        bingo_shout: "BINGO!",
        congrats: "Felicitats",
        download: "Resultats 📥",
        restart: "Tornar a jugar 🔄",
        loading_ai: "Preparant el problema...",
        err_select_ops: "Selecciona una operació!",
        err_enter_name: "Escriu el teu nom!",
        max_attempts_reached: "Oh no! La resposta era:",
        failed_status: "No superat"
    },
    es: {
        title: "Bingo Matemático",
        setup_title: "Configuración",
        name_label: "¿Cómo te llamas?",
        diff_label: "Nivel:",
        diff_easy: "Fácil",
        diff_medium: "Normal",
        diff_hard: "Difícil",
        ops_label: "Operaciones:",
        mode_label: "Modo de Juego:",
        mode_classic: "Clásico (Números)",
        mode_ai: "Modo Historia (Texto)",
        start_btn: "¡EMPEZAR! 🚀",
        score: "Puntos",
        attempts: "Vidas",
        collection: "Colección",
        question: "Resuelve:",
        bingo_shout: "¡BINGO!",
        congrats: "Felicidades",
        download: "Resultados 📥",
        restart: "Volver a jugar 🔄",
        loading_ai: "Preparando el problema...",
        err_select_ops: "¡Selecciona una operación!",
        err_enter_name: "¡Escribe tu nombre!",
        max_attempts_reached: "¡Oh no! La respuesta era:",
        failed_status: "No superado"
    },
    en: {
        title: "Math Bingo",
        setup_title: "Setup",
        name_label: "Your Name?",
        diff_label: "Level:",
        diff_easy: "Easy",
        diff_medium: "Normal",
        diff_hard: "Hard",
        ops_label: "Operations:",
        mode_label: "Game Mode:",
        mode_classic: "Classic (Numbers)",
        mode_ai: "Story Mode (Text)",
        start_btn: "START! 🚀",
        score: "Score",
        attempts: "Lives",
        collection: "Collection",
        question: "Solve:",
        bingo_shout: "BINGO!",
        congrats: "Congratulations",
        download: "Results 📥",
        restart: "Play Again 🔄",
        loading_ai: "Preparing problem...",
        err_select_ops: "Select an operation!",
        err_enter_name: "Enter your name!",
        max_attempts_reached: "Oh no! The answer was:",
        failed_status: "Failed"
    },
    gl: {
        title: "Bingo Matemático",
        setup_title: "Configuración",
        name_label: "Como te chamas?",
        diff_label: "Nivel:",
        diff_easy: "Fácil",
        diff_medium: "Normal",
        diff_hard: "Difícil",
        ops_label: "Operacións:",
        mode_label: "Modo de Xogo:",
        mode_classic: "Clásico (Números)",
        mode_ai: "Modo Historia (Texto)",
        start_btn: "COMEZAR! 🚀",
        score: "Puntos",
        attempts: "Vidas",
        collection: "Colección",
        question: "Resolve:",
        bingo_shout: "BINGO!",
        congrats: "Parabéns",
        download: "Resultados 📥",
        restart: "Xogar de novo 🔄",
        loading_ai: "Preparando problema...",
        err_select_ops: "Selecciona unha operación!",
        err_enter_name: "Escribe o teu nome!",
        max_attempts_reached: "Vaya! A resposta era:",
        failed_status: "Non superado"
    },
    eu: {
        title: "Matematika Bingoa",
        setup_title: "Konfigurazioa",
        name_label: "Izena?",
        diff_label: "Maila:",
        diff_easy: "Erraza",
        diff_medium: "Arrunta",
        diff_hard: "Zaila",
        ops_label: "Eragiketak:",
        mode_label: "Joko Modua:",
        mode_classic: "Klasikoa (Zenbakiak)",
        mode_ai: "Istorio Modua (Testua)",
        start_btn: "HASI! 🚀",
        score: "Puntuak",
        attempts: "Bizitzak",
        collection: "Bilduma",
        question: "Ebatzi:",
        bingo_shout: "BINGO!",
        congrats: "Zorionak",
        download: "Emaitzak 📥",
        restart: "Berriro jokatu 🔄",
        loading_ai: "Arazoa prestatzen...",
        err_select_ops: "Aukeratu eragiketa bat!",
        err_enter_name: "Idatzi zure izena!",
        max_attempts_reached: "Ai ene! Erantzuna hau zen:",
        failed_status: "Ez da gainditu"
    }
};

// ==========================================
// 3. SERVICES (Audio & Gemini)
// ==========================================

const playSound = (type: 'correct' | 'pop' | 'wrong' | 'fail' | 'win') => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
        case 'correct':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start();
            osc.stop(now + 0.5);
            break;
        case 'pop':
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start();
            osc.stop(now + 0.1);
            break;
        case 'wrong':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.3);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
            osc.start();
            osc.stop(now + 0.3);
            break;
        case 'fail':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
            osc.start();
            osc.stop(now + 0.5);
            break;
        case 'win':
            const freqs = [523.25, 659.25, 783.99, 1046.50];
            freqs.forEach((freq, i) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.connect(g);
                g.connect(ctx.destination);
                o.type = 'triangle';
                o.frequency.value = freq;
                g.gain.setValueAtTime(0.1, now + i*0.1);
                g.gain.exponentialRampToValueAtTime(0.001, now + i*0.1 + 0.5);
                o.start(now + i*0.1);
                o.stop(now + i*0.1 + 0.5);
            });
            break;
    }
};

// GEMINI SERVICE
const apiKey = (window as any).process?.env?.API_KEY || ''; 

let ai: GoogleGenAI | null = null;
if (apiKey && apiKey.length > 5 && !apiKey.includes("ENGANXA")) {
    try {
        ai = new GoogleGenAI({ apiKey });
    } catch (e) {
        console.warn("Invalid API Key format");
    }
}

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

const generateMathProblem = async (targetAnswer: number, mathOperation: string, language: Language): Promise<string> => {
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
    return getOfflineProblem(mathOperation, language);
};

// ==========================================
// 4. COMPONENTS
// ==========================================

// --- SetupScreen ---
interface SetupProps {
    t: Translations;
    onStart: (data: UserData) => void;
}

const SetupScreen: React.FC<SetupProps> = ({ t, onStart }) => {
    const [name, setName] = useState('');
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [ops, setOps] = useState<Operation[]>(['add']);
    const [mode, setMode] = useState<GameMode>('classic');

    const toggleOp = (op: Operation) => {
        if (ops.includes(op)) {
            if (ops.length > 1) setOps(ops.filter(o => o !== op));
        } else {
            setOps([...ops, op]);
        }
    };

    return (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-md z-10 animate-pop border-4 border-secondary">
            <h2 className="text-3xl font-black mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-sm">
                {t.setup_title}
            </h2>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold mb-1 text-gray-600 dark:text-gray-300">{t.name_label}</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-secondary focus:ring-4 focus:ring-secondary/20 focus:outline-none dark:bg-gray-700 dark:border-gray-600 transition-all font-bold text-lg"
                        placeholder="..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2 text-gray-600 dark:text-gray-300">{t.mode_label}</label>
                    <div className="flex gap-2">
                         <button 
                            onClick={() => setMode('classic')}
                            className={`flex-1 p-3 rounded-xl font-bold transition-all border-b-4 active:border-b-0 active:translate-y-1 ${mode === 'classic' ? 'bg-blue-500 border-blue-700 text-white' : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500'}`}
                        >
                            <i className="fa-solid fa-calculator mr-2"></i>
                            {t.mode_classic}
                        </button>
                        <button 
                            onClick={() => setMode('ai_story')}
                            className={`flex-1 p-3 rounded-xl font-bold transition-all border-b-4 active:border-b-0 active:translate-y-1 ${mode === 'ai_story' ? 'bg-purple-500 border-purple-700 text-white' : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500'}`}
                        >
                             <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
                            {t.mode_ai}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2 text-gray-600 dark:text-gray-300">{t.diff_label}</label>
                    <div className="flex gap-2">
                        {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                             <button 
                                key={d}
                                onClick={() => setDifficulty(d)}
                                className={`flex-1 py-2 px-1 rounded-lg font-bold text-sm transition-all border-b-4 active:border-b-0 active:translate-y-1 uppercase ${
                                    difficulty === d 
                                    ? (d === 'easy' ? 'bg-green-400 border-green-600 text-white' : d === 'medium' ? 'bg-yellow-400 border-yellow-600 text-white' : 'bg-red-400 border-red-600 text-white')
                                    : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400'
                                }`}
                            >
                                {t[`diff_${d}` as keyof Translations]}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2 text-gray-600 dark:text-gray-300">{t.ops_label}</label>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { id: 'add', label: '+', color: 'bg-green-400 border-green-600' },
                            { id: 'sub', label: '-', color: 'bg-blue-400 border-blue-600' },
                            { id: 'mul', label: '×', color: 'bg-purple-400 border-purple-600' },
                            { id: 'div', label: '÷', color: 'bg-orange-400 border-orange-600' }
                        ].map((op) => (
                             <button 
                                key={op.id}
                                onClick={() => toggleOp(op.id as Operation)}
                                className={`aspect-square rounded-xl text-2xl font-black transition-all border-b-4 active:border-b-0 active:translate-y-1 ${
                                    ops.includes(op.id as Operation) 
                                    ? `${op.color} text-white`
                                    : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400'
                                }`}
                            >
                                {op.label}
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={() => onStart({ name, difficulty, ops, mode })}
                    className="w-full py-4 mt-2 bg-gradient-to-b from-primary to-red-500 border-b-4 border-red-700 active:border-b-0 active:translate-y-1 text-white text-xl font-black rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                >
                    {t.start_btn}
                </button>
            </div>
        </div>
    );
};

// --- GameScreen ---
interface GameProps {
    t: Translations;
    gridData: BingoCell[];
    currentQuestion: Question | null;
    onAnswer: (id: number, answer: number) => void;
    score: number;
    attempts: number;
    flyingEmoji: string | null;
    isAiLoading: boolean;
}

const GameScreen: React.FC<GameProps> = ({ 
    t, gridData, currentQuestion, onAnswer, score, attempts, flyingEmoji, isAiLoading
}) => {
    
    const getCellStyle = (status: BingoCell['status']) => {
        if (status === 'correct') return 'bg-green-500 border-green-700 text-white opacity-40 cursor-default scale-95';
        if (status === 'assisted') return 'bg-warn border-orange-600 text-white opacity-60 cursor-default scale-95'; 
        return 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-yellow-50 dark:hover:bg-gray-600 text-gray-700 dark:text-white hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:border-b-0';
    };

    const getIcon = (status: BingoCell['status']) => {
        if (status === 'correct') return '✅';
        if (status === 'assisted') return '⚠️';
        return null;
    };

    return (
        <div className="flex flex-col items-center w-full max-w-lg z-10 mx-auto">
            
            <div className="flex gap-4 mb-6 w-full justify-center">
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur px-6 py-3 rounded-2xl shadow-lg border-b-4 border-gray-200 dark:border-gray-700 flex flex-col items-center min-w-[100px]">
                     <span className="text-xs font-bold text-gray-400 uppercase">{t.score}</span>
                    <span className="text-2xl font-black text-secondary">{score}</span>
                </div>
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur px-6 py-3 rounded-2xl shadow-lg border-b-4 border-gray-200 dark:border-gray-700 flex flex-col items-center min-w-[100px]">
                    <span className="text-xs font-bold text-gray-400 uppercase">{t.attempts}</span>
                    <span className="text-2xl font-black text-primary flex gap-1">
                         {[...Array(3)].map((_, i) => (
                             <i key={i} className={`fa-solid fa-heart ${i < (3 - attempts) ? 'text-primary' : 'text-gray-300'}`}></i>
                         ))}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full bg-secondary/20 backdrop-blur-sm p-4 rounded-3xl border-4 border-secondary shadow-2xl">
                {gridData.map((cell) => (
                    <button 
                        key={cell.id}
                        onClick={() => (cell.status !== 'correct' && cell.status !== 'assisted') && onAnswer(cell.id, cell.answer)}
                        disabled={cell.status === 'correct' || cell.status === 'assisted'}
                        className={`
                            bingo-cell aspect-square rounded-2xl text-4xl font-black flex items-center justify-center shadow-sm border-b-4 transition-all duration-200
                            ${getCellStyle(cell.status)}
                        `}
                    >
                        {getIcon(cell.status) || cell.answer}
                    </button>
                ))}
            </div>

            <div className="mt-6 w-full relative">
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl w-full text-center border-b-8 border-primary animate-pop relative overflow-hidden">
                    <p className="text-gray-400 dark:text-gray-500 uppercase tracking-widest text-xs font-bold mb-2">{t.question}</p>
                    
                    {isAiLoading ? (
                        <div className="py-8 flex flex-col items-center gap-2 animate-pulse">
                            <i className="fa-solid fa-wand-magic-sparkles text-3xl text-purple-400 animate-spin"></i>
                            <span className="text-sm font-bold text-purple-400">{t.loading_ai}</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <div className={`font-black text-gray-800 dark:text-white font-mono transition-all duration-300 ${currentQuestion?.textQuestion ? 'text-xl md:text-2xl leading-tight' : 'text-6xl'}`}>
                                {currentQuestion?.textQuestion || currentQuestion?.mathQuestion || '...'}
                            </div>

                             {currentQuestion?.textQuestion && (
                                 <div className="text-sm text-gray-400 font-mono mt-2">({currentQuestion.mathQuestion})</div>
                             )}
                            
                            <div className="mt-4 text-5xl relative h-16 w-16 flex items-center justify-center">
                                <span style={{opacity: flyingEmoji ? 0 : 1, transition: 'opacity 0.2s', transform: flyingEmoji ? 'scale(0)' : 'scale(1)'}}>
                                    {currentQuestion?.emoji || '❓'}
                                </span>

                                {flyingEmoji && (
                                    <span className="animate-fly-up absolute inset-0 flex items-center justify-center">
                                        {flyingEmoji}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- WinScreen ---
interface WinProps {
    t: Translations;
    name: string;
    score: number;
    collectedItems: string[];
    onDownload: () => void;
    onRestart: () => void;
}

const WinScreen: React.FC<WinProps> = ({ t, name, score, collectedItems, onDownload, onRestart }) => {
    
    useEffect(() => {
        const end = Date.now() + 3000;
        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D'];

        (function frame() {
            const confetti = (window as any).confetti;
            if(!confetti) return;

            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }, []);

    return (
        <div className="text-center z-10 animate-pop w-full max-w-2xl px-4 flex flex-col items-center">
            <div className="text-8xl mb-4 animate-bounce">🏆</div>
            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-warn mb-4 drop-shadow-sm">{t.bingo_shout}</h2>
            <p className="text-2xl text-gray-600 dark:text-gray-300 mb-8 font-medium">
                {t.congrats}, <span className="text-secondary font-bold underline decoration-wavy">{name}</span>!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 w-full">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border-4 border-gray-100 dark:border-gray-700">
                    <div className="text-sm text-gray-400 uppercase font-bold tracking-widest">{t.score}</div>
                    <div className="text-5xl font-black text-secondary mt-2">⭐ {score}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border-4 border-gray-100 dark:border-gray-700">
                    <div className="text-sm text-gray-400 uppercase font-bold tracking-widest">{t.collection}</div>
                    <div className="text-3xl mt-4 flex flex-wrap justify-center gap-1">
                        {collectedItems.map((item, i) => (
                            <span key={i} className="animate-pop" style={{animationDelay: `${i * 100}ms`}}>{item}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <button 
                    onClick={onDownload} 
                    className="flex-1 bg-secondary hover:bg-teal-400 text-white px-8 py-4 rounded-2xl font-bold shadow-lg border-b-4 border-teal-600 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                    <i className="fa-solid fa-download"></i> {t.download}
                </button>
                <button 
                    onClick={onRestart} 
                    className="flex-1 bg-white dark:bg-gray-700 text-gray-600 dark:text-white px-8 py-4 rounded-2xl font-bold shadow-lg border-b-4 border-gray-300 dark:border-gray-900 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                    <i className="fa-solid fa-rotate-right"></i> {t.restart}
                </button>
            </div>
        </div>
    );
};

// ==========================================
// 5. MAIN APP COMPONENT
// ==========================================

function App() {
    const [lang, setLang] = useState<Language>('ca');
    const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
    const [gameState, setGameState] = useState<'setup' | 'playing' | 'win'>('setup');
    const [userData, setUserData] = useState<UserData>({ name: '', difficulty: 'medium', ops: ['add'], mode: 'classic' });
    
    const [gridData, setGridData] = useState<BingoCell[]>([]);
    const [questionQueue, setQuestionQueue] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [isPlayingMusic, setIsPlayingMusic] = useState(false);
    const [bgEmojis, setBgEmojis] = useState<string[]>(['🦁', '🚀', '⭐', '🎈']);

    const [currentAttempts, setCurrentAttempts] = useState(0);
    const [attemptHistory, setAttemptHistory] = useState<AttemptRecord[]>([]);
    const [collectedItems, setCollectedItems] = useState<string[]>([]);
    const [flyingEmoji, setFlyingEmoji] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const musicRef = useRef<HTMLAudioElement>(null);
    const MAX_ATTEMPTS = 3;
    const BG_MUSIC_URL = "https://cdn.pixabay.com/download/audio/2022/03/24/audio_343272f280.mp3?filename=happy-logo-17366.mp3"; 

    const t = TRANSLATIONS[lang];

    useEffect(() => {
        const root = window.document.documentElement;
        const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (isDark) root.classList.add('dark');
        else root.classList.remove('dark');
    }, [theme]);

    useEffect(() => {
        const interval = setInterval(() => {
            const randomEmojis = [];
            for(let i=0; i<4; i++) {
                randomEmojis.push(REWARD_EMOJIS[Math.floor(Math.random() * REWARD_EMOJIS.length)]);
            }
            setBgEmojis(randomEmojis);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (gameState === 'playing' && userData.mode === 'ai_story') {
            const q = questionQueue[currentQuestionIndex];
            if (q && !q.textQuestion) {
                setIsAiLoading(true);
                generateMathProblem(q.answer, q.mathQuestion, lang)
                    .then(text => {
                        setQuestionQueue(prev => prev.map((item, idx) => 
                            idx === currentQuestionIndex ? { ...item, textQuestion: text } : item
                        ));
                    })
                    .finally(() => setIsAiLoading(false));
            }
        }
    }, [currentQuestionIndex, gameState, userData.mode, lang]);

    const generateLevel = (difficulty: Difficulty, selectedOps: Operation[]): BingoCell[] => {
        let maxNum = 10, maxFactor = 5, maxDivisor = 5;
        if (difficulty === 'medium') { maxNum = 50; maxFactor = 9; maxDivisor = 9; }
        if (difficulty === 'hard') { maxNum = 100; maxFactor = 12; maxDivisor = 12; }

        const pairs: BingoCell[] = [];
        const usedAnswers = new Set<number>();
        const shuffledEmojis = [...REWARD_EMOJIS].sort(() => Math.random() - 0.5);

        while(pairs.length < 9) {
            const opType = selectedOps[Math.floor(Math.random() * selectedOps.length)];
            let q = '', a = 0, num1 = 0, num2 = 0;

            switch(opType) {
                case 'add':
                    num1 = Math.floor(Math.random() * maxNum) + 1;
                    num2 = Math.floor(Math.random() * maxNum) + 1;
                    a = num1 + num2;
                    q = `${num1} + ${num2}`;
                    break;
                case 'sub':
                    num1 = Math.floor(Math.random() * maxNum) + 1;
                    num2 = Math.floor(Math.random() * (num1)) + 1; 
                    a = num1 - num2;
                    q = `${num1} - ${num2}`;
                    break;
                case 'mul':
                    num1 = Math.floor(Math.random() * maxFactor) + 1;
                    num2 = Math.floor(Math.random() * maxFactor) + 1;
                    a = num1 * num2;
                    q = `${num1} × ${num2}`;
                    break;
                case 'div':
                    num2 = Math.floor(Math.random() * maxDivisor) + 2; 
                    a = Math.floor(Math.random() * 10) + 1; 
                    num1 = num2 * a;
                    q = `${num1} ÷ ${num2}`;
                    break;
            }

            if (!usedAnswers.has(a)) {
                usedAnswers.add(a);
                pairs.push({ 
                    id: pairs.length, 
                    question: q, 
                    answer: a, 
                    status: 'pending',
                    emoji: shuffledEmojis[pairs.length] 
                }); 
            }
        }
        return pairs;
    };

    const startGame = (data: UserData) => {
        if (!data.name) return alert(t.err_enter_name);
        if (data.ops.length === 0) return alert(t.err_select_ops);

        setUserData(data);
        const cells = generateLevel(data.difficulty, data.ops);
        
        const grid = [...cells].sort(() => Math.random() - 0.5);
        setGridData(grid);

        const rawQuestions = [...cells].sort(() => Math.random() - 0.5);
        
        const questions: Question[] = rawQuestions.map(c => ({
            id: c.id,
            mathQuestion: c.question,
            answer: c.answer,
            emoji: c.emoji
        }));
        
        setQuestionQueue(questions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setCurrentAttempts(0);
        setAttemptHistory([]);
        setCollectedItems([]);
        setGameState('playing');
        
        if(isPlayingMusic && musicRef.current) musicRef.current.play().catch(()=>{});
    };

    const handleAnswer = (cellId: number, cellAnswer: number) => {
        if (flyingEmoji || isAiLoading) return;

        const currentQ = questionQueue[currentQuestionIndex];

        if (cellAnswer === currentQ.answer) {
            playSound('correct');
            const finalAttempts = currentAttempts + 1;
            setFlyingEmoji(currentQ.emoji);

            setGridData(prev => prev.map(cell => 
                cell.id === cellId ? { ...cell, status: 'correct' } : cell
            ));

            setTimeout(() => {
                setCollectedItems(prev => [...prev, currentQ.emoji]);
                playSound('pop');
                setFlyingEmoji(null);
                
                setAttemptHistory(prev => [...prev, { 
                    question: currentQ.mathQuestion, 
                    answer: currentQ.answer, 
                    attempts: finalAttempts,
                    status: 'success'
                }]);

                const pointsEarned = Math.max(10, 100 - ((finalAttempts - 1) * 20));
                setScore(s => s + pointsEarned);

                nextTurn();
            }, 800);

        } else {
            const newAttempts = currentAttempts + 1;
            setCurrentAttempts(newAttempts);

            if (newAttempts >= MAX_ATTEMPTS) {
                playSound('fail');
                alert(`${t.max_attempts_reached} ${currentQ.answer}`);

                setAttemptHistory(prev => [...prev, { 
                    question: currentQ.mathQuestion, 
                    answer: currentQ.answer, 
                    attempts: MAX_ATTEMPTS,
                    status: 'failed'
                }]);

                setGridData(prev => prev.map(cell => 
                    cell.answer === currentQ.answer ? { ...cell, status: 'assisted' } : cell
                ));
                nextTurn();
            } else {
                playSound('wrong');
            }
        }
    };

    const nextTurn = () => {
        if (currentQuestionIndex + 1 >= 9) {
            playSound('win');
            setGameState('win');
        } else {
            setCurrentQuestionIndex(prev => prev + 1);
            setCurrentAttempts(0); 
        }
    };

    const downloadResults = () => {
        const detailsText = attemptHistory.map(item => {
            const statusTxt = item.status === 'success' 
                ? `${item.attempts} attempt(s)` 
                : `${t.failed_status} (${item.attempts} attempts)`;
            return `   • ${item.question} = ${item.answer} [${statusTxt}]`;
        }).join('\n');

        const text = `
🎓 ${t.title} - Results
📅 ${new Date().toLocaleString()}
👤 Name: ${userData.name}
🎮 Level: ${userData.difficulty} | Mode: ${userData.mode}
🏆 Score: ${score} / 900
✅ Solved: 9/9
📝 Details:
${detailsText}
        `.trim();
        
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Bingo_${userData.name}.txt`;
        a.click();
    };

    const toggleMusic = () => {
        if (musicRef.current) {
            if (isPlayingMusic) musicRef.current.pause();
            else musicRef.current.play().catch(console.error);
            setIsPlayingMusic(!isPlayingMusic);
        }
    };

    return (
        <div className="flex flex-col min-h-screen relative overflow-hidden font-sans">
            <audio ref={musicRef} src={BG_MUSIC_URL} loop />

            <div className="absolute inset-0 pointer-events-none opacity-10 dark:opacity-5 transition-all duration-1000">
                {bgEmojis.map((emoji, i) => (
                    <div key={`${emoji}-${i}`} className="absolute text-7xl animate-float-fade" 
                         style={{
                             top: i % 2 === 0 ? '10%' : '70%', 
                             left: i < 2 ? '10%' : '80%', 
                             animationDelay: `${i * 0.5}s`
                         }}>
                        {emoji}
                    </div>
                ))}
            </div>

            <header className="p-4 flex justify-between items-center z-20 relative">
                <div className="flex items-center gap-2">
                     <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-md">
                        <i className="fa-solid fa-shapes text-primary text-xl"></i>
                     </div>
                     <h1 className="text-xl font-black text-gray-700 dark:text-white hidden md:block tracking-tight">{t.title}</h1>
                </div>

                {gameState === 'playing' && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                        <div className="flex gap-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur p-2 rounded-full shadow-inner min-w-[120px] justify-center h-12 items-center px-4 border-2 border-gray-100 dark:border-gray-700">
                            {collectedItems.map((emoji, i) => (
                                <span key={i} className="text-lg animate-pop">{emoji}</span>
                            ))}
                            {[...Array(9 - collectedItems.length)].map((_, i) => (
                                <div key={`empty-${i}`} className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-600"></div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-3">
                    <button onClick={toggleMusic} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-100 shadow-sm transition">
                        {isPlayingMusic ? <i className="fa-solid fa-volume-high text-secondary"></i> : <i className="fa-solid fa-volume-xmark text-gray-400"></i>}
                    </button>
                    <select value={lang} onChange={(e) => setLang(e.target.value as Language)} className="p-2 rounded-xl border-none bg-white dark:bg-gray-800 shadow-sm font-bold text-sm cursor-pointer outline-none">
                        <option value="ca">CA</option>
                        <option value="es">ES</option>
                        <option value="en">EN</option>
                        <option value="gl">GL</option>
                        <option value="eu">EU</option>
                    </select>
                    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-100 shadow-sm transition">
                         <i className={`fa-solid ${theme === 'dark' ? 'fa-sun text-yellow-500' : 'fa-moon text-indigo-500'}`}></i>
                    </button>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center p-4 relative z-10">
                {gameState === 'setup' && <SetupScreen t={t} onStart={startGame} />}
                
                {gameState === 'playing' && (
                    <GameScreen 
                        t={t} 
                        gridData={gridData} 
                        currentQuestion={questionQueue[currentQuestionIndex]} 
                        onAnswer={handleAnswer}
                        score={score}
                        attempts={currentAttempts}
                        flyingEmoji={flyingEmoji}
                        isAiLoading={isAiLoading}
                    />
                )}

                {gameState === 'win' && (
                    <WinScreen 
                        t={t} 
                        name={userData.name} 
                        score={score} 
                        collectedItems={collectedItems}
                        onDownload={downloadResults} 
                        onRestart={() => setGameState('setup')} 
                    />
                )}
            </main>

            <footer className="p-4 text-center text-xs text-gray-400 dark:text-gray-600 font-bold z-10">
                Math Bingo AI • Powered by Google Gemini
            </footer>
        </div>
    );
}

// ==========================================
// 6. ROOT RENDER
// ==========================================

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
}