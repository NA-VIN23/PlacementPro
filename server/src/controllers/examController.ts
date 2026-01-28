import { Request, Response } from 'express';
import { Exam, Question, Submission } from '../models/types';
// MOCK STORES
export let EXAMS_DB: Exam[] = [];
export let QUESTIONS_DB: Question[] = [];
export let SUBMISSIONS_DB: Submission[] = [];

// STAFF: Create Exam
export const createExam = (req: Request, res: Response) => {
    const { title, duration, start_time, end_time, questions } = req.body;
    // req.user is populated by authMiddleware
    // @ts-ignore
    const createdBy = req.user?.userId || 'unknown';

    const newExam: Exam = {
        id: Date.now().toString(),
        title,
        duration,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        created_by: createdBy,
        created_at: new Date()
    };

    EXAMS_DB.push(newExam);

    // Add Questions
    if (questions && Array.isArray(questions)) {
        questions.forEach((q: any) => {
            QUESTIONS_DB.push({
                id: Date.now().toString() + Math.random().toString().slice(2, 5),
                exam_id: newExam.id,
                question_text: q.question_text,
                options: q.options,
                correct_answer: q.correct_answer,
                explanation: q.explanation
            });
        });
    }

    res.status(201).json({ message: 'Exam created', exam: newExam });
};

// STUDENT: Get Available Exams
export const getAvailableExams = (req: Request, res: Response) => {
    const now = new Date();
    // Filter exams that are active (or all if just listing)
    // Requirement: View assigned exams. For now, showing all active or upcoming.
    res.json(EXAMS_DB);
};

// STUDENT: Get Exam Details (Questions) - Only if active
export const getExamQuestions = (req: Request, res: Response) => {
    const { id } = req.params;
    const exam = EXAMS_DB.find(e => e.id === id);

    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    // Validate Time Window
    const now = new Date();
    if (now < exam.start_time || now > exam.end_time) {
        return res.status(403).json({ message: 'Exam is not currently active' });
    }

    // Check Attempts (Limit 2)
    // @ts-ignore
    const studentId = req.user?.userId;
    const attempts = SUBMISSIONS_DB.filter(s => s.exam_id === id && s.student_id === studentId).length;
    if (attempts >= 2) {
        return res.status(403).json({ message: 'Maximum attempts reached' });
    }

    const questions = QUESTIONS_DB.filter(q => q.exam_id === id).map(({ correct_answer, explanation, ...q }) => q); // Hide answers
    res.json({ exam, questions });
};

// STUDENT: Submit Exam
export const submitExam = (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { answers } = req.body; // Record<questionId, answer>
    // @ts-ignore
    const studentId = req.user?.userId;

    const examQuestions = QUESTIONS_DB.filter(q => q.exam_id === id);
    let score = 0;

    examQuestions.forEach(q => {
        if (answers[q.id] === q.correct_answer) {
            score++;
        }
    });

    const attempt_no = SUBMISSIONS_DB.filter(s => s.exam_id === id && s.student_id === studentId).length + 1;

    const submission: Submission = {
        id: Date.now().toString(),
        student_id: studentId,
        exam_id: id,
        attempt_no,
        score,
        submitted_at: new Date(),
        answers
    };

    SUBMISSIONS_DB.push(submission);
    res.json({ message: 'Exam submitted', score, total: examQuestions.length });
};
