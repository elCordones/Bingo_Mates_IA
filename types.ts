export type Language = 'ca' | 'es' | 'en' | 'gl' | 'eu';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Operation = 'add' | 'sub' | 'mul' | 'div';
export type GameMode = 'classic' | 'ai_story';

export interface BingoCell {
    id: number;
    question: string; // The math display (e.g., "2 + 2")
    answer: number;
    emoji: string;
    status: 'pending' | 'correct' | 'assisted';
}

export interface Question {
    id: number;
    mathQuestion: string; // "2 + 2"
    textQuestion?: string; // "If I have 2 apples..." (Populated by AI)
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