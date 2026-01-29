export type UserRole = 'ADMIN' | 'STAFF' | 'STUDENT';

export interface User {
    id: string; // UUID from DB
    role: UserRole;
    email: string | null;
    registration_number?: string | null;
    department?: string;
    batch?: string;
    is_active: boolean;
    name?: string; // Optional, might mock or add to DB later
    avatar?: string;
}

export interface Exam {
    id: string;
    title: string;
    duration: number;
    start_time: string; // ISO Date String
    end_time: string;
}

export interface Question {
    id: string;
    question_text: string;
    options: string[];
    explanation?: string;
    // correct_answer is hidden from frontend usually
}

export interface AuthResponse {
    token: string;
    role: UserRole;
    id: string;
    name: string;
    email: string;
    department?: string;
    batch?: string;
    registration_number?: string;
}
