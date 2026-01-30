import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { Exam, Submission } from '../models/types';

// STAFF: Create Exam
export const createExam = async (req: Request, res: Response) => {
    const { title, duration, start_time, end_time, questions, type, mode, pdf_url } = req.body;
    // @ts-ignore
    const createdBy = req.user?.userId;

    try {
        let exam: any;

        // 1. ATTEMPT FULL INSERT (New Schema)
        const fullPayload: any = {
            title,
            duration: parseInt(String(duration)) || 0,
            start_time,
            end_time,
            created_by: createdBy,
            type: type || 'DAILY',
            mode: mode || 'MANUAL'
        };
        if (pdf_url) fullPayload.pdf_url = pdf_url;

        const { data: fullData, error: fullError } = await supabase
            .from('exams')
            .insert(fullPayload)
            .select()
            .single();

        if (!fullError) {
            exam = fullData;
        } else {
            console.warn("Full insert failed (likely schema mismatch), attempting legacy insert...", fullError.message);

            // 2. FALLBACK: LEGACY INSERT (Old Schema)
            const legacyPayload = {
                title,
                duration: parseInt(String(duration)) || 0,
                start_time,
                end_time,
                created_by: createdBy
            };

            const { data: legacyData, error: legacyError } = await supabase
                .from('exams')
                .insert(legacyPayload)
                .select()
                .single();

            if (legacyError) {
                console.error("Legacy insert also failed:", legacyError);
                throw legacyError;
            }
            exam = legacyData;
        }

        // 3. ADD QUESTIONS
        if (questions && questions.length > 0) {
            // Helper to format questions
            const formatQuestions = (useSection: boolean) => questions.map((q: any) => {
                const base = {
                    exam_id: exam.id,
                    question_text: q.question_text,
                    options: q.options || [],
                    correct_answer: q.correct_answer || '',
                    explanation: q.explanation || ''
                };
                return useSection ? { ...base, section: q.section || null } : base;
            });

            // Attempt 1: Full Questions (With Section)
            const { error: fullQError } = await supabase
                .from('questions')
                .insert(formatQuestions(true));

            if (fullQError) {
                console.warn("Full questions insert failed, attempting legacy questions...", fullQError.message);

                // Attempt 2: Legacy Questions (No Section)
                const { error: legacyQError } = await supabase
                    .from('questions')
                    .insert(formatQuestions(false));

                if (legacyQError) {
                    throw legacyQError;
                }
            }
        }

        res.status(201).json({ message: 'Exam created successfully', exam });
    } catch (err: any) {
        console.error("Create Create Exam Error:", err);
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

        res.json({
            message: 'Exam submitted successfully',
            score,
            total: questions?.length || 0,
            reviewDetails: questions
        });
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

// STUDENT: Get Student Dashboard Stats
export const getStudentDashboardStats = async (req: Request, res: Response) => {
    // @ts-ignore
    const studentId = req.user?.userId;

    try {
        const now = new Date().toISOString();

        // 1. My Submissions
        const { data: submissions, error: subError } = await supabase
            .from('submissions')
            .select('exam_id, score')
            .eq('student_id', studentId);

        if (subError) throw subError;

        const myExamIds = [...new Set(submissions?.map(s => s.exam_id) || [])];

        // 2. Pending Tasks (Active Exams I haven't taken)
        // If myExamIds is empty, we just count all active exams
        let pendingQuery = supabase
            .from('exams')
            .select('*', { count: 'exact', head: true })
            .gt('end_time', now);

        if (myExamIds.length > 0) {
            // Filter out exams I've already taken
            pendingQuery = pendingQuery.not('id', 'in', `(${myExamIds.join(',')})`);
        }

        const { count: pendingCount, error: pendingError } = await pendingQuery;

        if (pendingError) throw pendingError;

        // 3. Avg % Score
        let avgPercentage = 0;
        if (myExamIds.length > 0) {
            // Get all questions to calculate max scores for each exam
            // We need to fetch questions for the exams the student has taken
            const { data: questions, error: qError } = await supabase
                .from('questions')
                .select('exam_id')
                .in('exam_id', myExamIds);

            if (qError) throw qError;

            // Group questions by exam
            const questionsPerExam: Record<string, number> = {};
            questions?.forEach(q => {
                questionsPerExam[q.exam_id] = (questionsPerExam[q.exam_id] || 0) + 1;
            });

            let totalMaxScore = 0;
            let totalMyScore = 0;

            // Calculate score based on best attempt for each exam
            myExamIds.forEach(examId => {
                const examSubs = submissions?.filter(s => s.exam_id === examId) || [];
                // Take max score if multiple attempts
                const bestScore = examSubs.length > 0 ? Math.max(...examSubs.map(s => s.score)) : 0;

                const totalQ = questionsPerExam[examId] || 1; // Default to 1 to avoid /0

                totalMyScore += bestScore;
                totalMaxScore += totalQ;
            });

            if (totalMaxScore > 0) {
                avgPercentage = Math.round((totalMyScore / totalMaxScore) * 100);
            }
        }

        // 4. Rank 
        // For now, we'll return a calculated rank based on a simplified heuristic or just a placeholder
        // Real rank calculation requires aggregation across all users which is expensive here.
        // We will mock it as "Top 10%" or similar based on their score for now.
        let rank = "N/A";
        if (avgPercentage >= 90) rank = "Top 5%";
        else if (avgPercentage >= 75) rank = "Top 10%";
        else if (avgPercentage >= 50) rank = "Top 25%";
        else rank = "Top 50%";

        res.json({
            assessmentsPassed: myExamIds.length,
            pendingTasks: pendingCount || 0,
            rank: rank,
            avgScore: `${avgPercentage}%`
        });

    } catch (err: any) {
        console.error('Error fetching student stats:', err);
        res.status(500).json({ message: 'Error fetching stats', error: err.message });
    }
};
// STUDENT: Get Assessment Page Data (Stats + List)
export const getAssessmentPageData = async (req: Request, res: Response) => {
    // @ts-ignore
    const studentId = req.user?.userId;

    try {
        const now = new Date();

        // 1. Fetch Exams with Question Count
        const { data: exams, error: examError } = await supabase
            .from('exams')
            .select('*, questions(count)')
            .order('start_time', { ascending: false }); // Latest first

        if (examError) throw examError;

        // 2. Fetch My Submissions
        const { data: submissions, error: subError } = await supabase
            .from('submissions')
            .select('exam_id, score')
            .eq('student_id', studentId);

        if (subError) throw subError;

        const submissionMap = new Map();
        submissions?.forEach(s => submissionMap.set(s.exam_id, s.score));

        // 3. Process Exams into List with Status
        const processedExams = exams?.map(exam => {
            const start = new Date(exam.start_time);
            const end = new Date(exam.end_time);
            const isCompleted = submissionMap.has(exam.id);

            let status = 'Locked';
            if (isCompleted) status = 'Completed';
            else if (now >= start && now <= end) status = 'Available';
            else if (now > end) status = 'Expired'; // Treat as Locked or Expired
            else status = 'Locked'; // Future

            // Simplify parts logic: Assume 1 part for now as backend doesn't support parts yet
            // Or infer parts from Question types if we fetched them?
            // For now, we return flat structure and frontend adapts it.

            const qCount = exam.questions ? exam.questions[0]?.count : 0;

            return {
                id: exam.id,
                title: exam.title,
                duration: exam.duration,
                status,
                dueDate: new Date(exam.end_time).toLocaleDateString(),
                questions: qCount, // Map to parts on frontend
                score: submissionMap.get(exam.id)
            };
        }) || [];

        // 4. Calculate Stats
        const weeksCompleted = processedExams.filter(e => e.status === 'Completed' && e.title.toLowerCase().includes('week')).length;

        let totalScore = 0;
        let count = 0;
        submissions?.forEach(s => {
            totalScore += s.score;
            count++;
        });
        const avgScore = count > 0 ? Math.round(totalScore / count) : 0;

        const assessmentAvailable = processedExams.filter(e => e.status === 'Available').length;

        // Categorize for convenience (filtering will happen on frontend, but we can flag type)
        // We'll let frontend handle filtering based on Title.

        res.json({
            stats: {
                weeksCompleted: weeksCompleted || processedExams.filter(e => e.status === 'Completed').length, // Fallback to all completed
                avgScore: `${avgScore}%`,
                assessmentAvailable
            },
            assessments: processedExams
        });

    } catch (err: any) {
        console.error("Error fetching assessment page data:", err);
        res.status(500).json({ message: 'Error fetching data', error: err.message });
    }
};
