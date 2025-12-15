import React, { useEffect } from 'react';
import { Translations } from '../types';

interface WinProps {
    t: Translations;
    name: string;
    score: number;
    collectedItems: string[];
    onDownload: () => void;
    onRestart: () => void;
}

export const WinScreen: React.FC<WinProps> = ({ t, name, score, collectedItems, onDownload, onRestart }) => {
    
    // Trigger confetti on mount
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