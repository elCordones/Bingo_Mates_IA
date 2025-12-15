import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { TRANSLATIONS, REWARD_EMOJIS } from './constants';
import { SetupScreen } from './components/SetupScreen';
import { GameScreen } from './components/GameScreen';
import { WinScreen } from './components/WinScreen';
import { playSound } from './services/audioEngine';
import { generateMathProblem } from './services/geminiService';
import { UserData, BingoCell, Question, Language, AttemptRecord, GameMode, Operation, Difficulty } from './types';

function App() {
    // --- State ---
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

    // --- Effects ---
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

    // Load AI question when current question changes or mode changes to AI
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

    // --- Logic ---
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
        
        // Randomize grid placement
        const grid = [...cells].sort(() => Math.random() - 0.5);
        setGridData(grid);

        // Randomize question order
        const rawQuestions = [...cells].sort(() => Math.random() - 0.5);
        
        // Map to Question type
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

            {/* Background Animation */}
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

            {/* Header */}
            <header className="p-4 flex justify-between items-center z-20 relative">
                <div className="flex items-center gap-2">
                     <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-md">
                        <i className="fa-solid fa-shapes text-primary text-xl"></i>
                     </div>
                     <h1 className="text-xl font-black text-gray-700 dark:text-white hidden md:block tracking-tight">{t.title}</h1>
                </div>

                {/* Collection Sack */}
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

            {/* Main */}
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

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
}