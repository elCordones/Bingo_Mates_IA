import React, { useState } from 'react';
import { UserData, Difficulty, Operation, Translations, GameMode } from '../types.ts';

interface SetupProps {
    t: Translations;
    onStart: (data: UserData) => void;
}

export const SetupScreen: React.FC<SetupProps> = ({ t, onStart }) => {
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