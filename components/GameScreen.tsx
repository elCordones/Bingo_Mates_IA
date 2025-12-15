import React, { useEffect } from 'react';
import { BingoCell, Question, Translations } from '../types';

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

export const GameScreen: React.FC<GameProps> = ({ 
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
            
            {/* Score Board */}
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

            {/* Bingo Grid */}
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

            {/* Question Card */}
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
                             {/* Show Text Question if available (AI Mode), otherwise Math Question */}
                            <div className={`font-black text-gray-800 dark:text-white font-mono transition-all duration-300 ${currentQuestion?.textQuestion ? 'text-xl md:text-2xl leading-tight' : 'text-6xl'}`}>
                                {currentQuestion?.textQuestion || currentQuestion?.mathQuestion || '...'}
                            </div>

                             {/* If AI mode, show the math hint small below */}
                             {currentQuestion?.textQuestion && (
                                 <div className="text-sm text-gray-400 font-mono mt-2">({currentQuestion.mathQuestion})</div>
                             )}
                            
                            {/* Emoji Target Display */}
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