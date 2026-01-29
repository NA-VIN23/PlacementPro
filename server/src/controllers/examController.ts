import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { Exam, Submission } from '../models/types';

// STAFF: Create Exam
export const createExam = async (req: Request, res: Response) => {
    const { title, duration, start_time, end_time, questions } = req.body;
    // @ts-ignore
    const createdBy = req.user?.userId;

    try {
        // 1. Create Exam
        const { data: exam, error: examError } = await supabase
            .from('exams')
            .insert({
                title,
                duration,
                start_time,
                end_time,
                created_by: createdBy
            })
            .select()
            .single();

        if (examError) throw examError;

        // 2. Add Questions
        if (questions && questions.length > 0) {
            const questionsData = questions.map((q: any) => ({
                exam_id: exam.id,
                question_text: q.question_text,
                options: q.options, // JSONB
                correct_answer: q.correct_answer,
                explanation: q.explanation
            }));

            const { error: qError } = await supabase
                .from('questions')
                .insert(questionsData);

            if (qError) throw qError;
        }

        res.status(201).json({ message: 'Exam created successfully', exam });
    } catch (err: any) {
        res.status(500).json({ message: 'Failed to create exam', error: err.message });
    }
};

// STUDENT: Get Available Exams
export const getAvailableExams = async (req: Request, res: Response) => {
    try {
        const { data: exams, error } = await supabase
            .from('exams')
            .select('*')
            .order('start_time', { ascending: true });

        if (error) throw error;
        res.json(exams);
    } catch (err: any) {
        res.status(500).json({ message: 'Failed to fetch exams', error: err.message });
    }
};

// STUDENT: Get Exam Details (Questions) - Only if active
export const getExamQuestions = async (req: Request, res: Response) => {
    const { id } = req.params;
    // @ts-ignore
    const studentId = req.user?.userId;

    try {
        // 1. Fetch Exam
        const { data: exam, error: examError } = await supabase
            .from('exams')
            .select('*')
            .eq('id', id)
            .single();

        if (examError || !exam) return res.status(404).json({ message: 'Exam not found' });

        // 2. Validate Time
        const now = new Date();
        const start = new Date(exam.start_time);
        const end = new Date(exam.end_time);

        if (now < start || now > end) {
            return res.status(403).json({ message: 'Exam is not currently active' });
        }

        // 3. Check Attempts
        const { count, error: countError } = await supabase
            .from('submissions')
            .select('*', { count: 'exact', head: true })
            .eq('exam_id', id)
            .eq('student_id', studentId);

        if (countError) throw countError;

        if (count !== null && count >= 2) {
            return res.status(403).json({ message: 'Maximum attempts reached' });
        }

        // 4. Fetch Questions (Exclude correct_answer)
        const { data: questions, error: qError } = await supabase
            .from('questions')
            .select('id, question_text, options, explanation')
            .eq('exam_id', id);

        if (qError) throw qError;

        res.json({ exam, questions });
    } catch (err: any) {
        res.status(500).json({ message: 'Error loading exam', error: err.message });
    }
};

// STUDENT: Submit Exam
export const submitExam = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { answers } = req.body; // Record<questionId, answer>
    // @ts-ignore
    const studentId = req.user?.userId;

    try {
        // 1. Fetch Correct Answers
        const { data: questions, error: qError } = await supabase
            .from('questions')
            .select('id, correct_answer')
            .eq('exam_id', id);

        if (qError) throw qError;

        // 2. Calculate Score
        let score = 0;
        questions?.forEach(q => {
            if (answers[q.id] === q.correct_answer) {
                score++;
            }
        });

        // 3. Get Attempt Number
        const { count } = await supabase
            .from('submissions')
            .select('*', { count: 'exact', head: true })
            .eq('exam_id', id)
            .eq('student_id', studentId);

        const attempt_no = (count || 0) + 1;

        // 4. Save Submission
        const { error: subError } = await supabase
            .from('submissions')
            .insert({
                student_id: studentId,
                exam_id: id,
                attempt_no,
                score,
                answers // JSONB
            });

        if (subError) throw subError;

        res.json({ message: 'Exam submitted successfully', score, total: questions?.length || 0 });
    } catch (err: any) {
        res.status(500).json({ message: 'Failed to submit exam', error: err.message });
    }
};


// STUDENT: Get My Results
export const getStudentResults = async (req: Request, res: Response) => {
    // @ts-ignore
    const studentId = req.user?.userId;

    try {
        const { data: results, error } = await supabase
            .from('submissions')
            .select(`
                *,
                exams (title, duration)
            `)
            .eq('student_id', studentId)
            .order('submitted_at', { ascending: false });

        if (error) throw error;
        res.json(results);
    } catch (err: any) {
        res.status(500).json({ message: 'Failed to fetch results', error: err.message });
    }
};

// STAFF: Get All Submissions
export const getAllSubmissions = async (req: Request, res: Response) => {
    try {
        const { data: submissions, error } = await supabase
            .from('submissions')
            .select(`
                *,
                users (name, email, registration_number),
                exams (title)
            `)
            .order('submitted_at', { ascending: false });

        if (error) throw error;
        res.json(submissions);
    } catch (err: any) {
        res.status(500).json({ message: 'Failed to fetch submissions', error: err.message });
    }
};

// STAFF: Get Dashboard Stats
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        // 1. Total Students
        const { count: totalStudents, error: studentError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'STUDENT');

        if (studentError) throw studentError;

        // 2. Active Exams
        const now = new Date().toISOString();
        const { count: activeExams, error: examError } = await supabase
            .from('exams')
            .select('*', { count: 'exact', head: true })
            .gt('end_time', now);

        if (examError) throw examError;

        // 3. Avg Performance (Average Score of all submissions for now) 
        // Accurate would be (score/total_questions) * 100, but we store total separately or need to join.
        // For simplicity: Average of 'score' column directly if exams are e.g. 10 marks. 
        // Better: let's just avg the score column.
        const { data: scores, error: scoreError } = await supabase
            .from('submissions')
            .select('score');

        if (scoreError) throw scoreError;

        let avgPerformance = 0;
        if (scores && scores.length > 0) {
            const totalScore = scores.reduce((sum, sub) => sum + sub.score, 0);
            avgPerformance = Math.round((totalScore / scores.length) * 10) / 10; // 1 decimal
        }

        res.json({
            totalStudents: totalStudents || 0,
            activeExams: activeExams || 0,
            avgPerformance: `${avgPerformance}%` // Assuming score is %, fix later if needed
        });
    } catch (err: any) {
        res.status(500).json({ message: 'Failed to fetch dashboard stats', error: err.message });
    }
};
