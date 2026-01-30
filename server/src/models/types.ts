export type UserRole = 'ADMIN' | 'STAFF' | 'STUDENT';

export interface User {
    id: string; // UUID
    role: UserRole;
    email: string; // For Staff/Admin
    registration_number?: string; // For Students
    department?: string;
    batch?: string;
    password_hash: string;
    is_active: boolean;
    created_at?: Date;
}

export interface Exam {
    id: string; // UUID
    title: string;
    duration: number; // in minutes
    start_time: Date;
    end_time: Date;
    created_by: string; // User ID (Staff)
    created_at?: Date;
}

export interface Question {
    id: string; // UUID
    exam_id: string;
    question_text: string;
    options: string[]; // JSON array of options
    correct_answer: string; // The correct option content or index
    explanation?: string;
}

export interface Submission {
    id: string; // UUID
    student_id: string;
    exam_id: string;
    attempt_no: number;
    score: number;
    submitted_at: Date;
    answers: Record<string, string>; // Question ID -> Answer
}

export interface MockInterview {
    id: string; // UUID
    student_id: string;
    interview_type: 'HR' | 'TECHNICAL';
    score: number;
    feedback: string;
    created_at?: Date;
}
