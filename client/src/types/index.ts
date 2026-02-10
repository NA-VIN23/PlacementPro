export type UserRole = 'ADMIN' | 'STAFF' | 'STUDENT' | 'HOD';

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
    type?: 'DAILY' | 'WEEKLY';
    mode?: 'MANUAL' | 'PDF';
    attemptCount?: number;
    pdf_url?: string;
}

export interface Question {
    id: string;
    question_text: string;
    options: string[];
    explanation?: string;
    section?: string;
    question_type?: 'MCQ' | 'CODING' | 'TEXT';
    code_template?: string;
    constraints?: string;
    test_cases?: { input: string; output: string; hidden: boolean }[];
    function_name?: string;
    exam_id?: string;
    marks?: number;
    input_format?: string;
    output_format?: string;
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
