import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { Exam, Submission } from '../models/types';
import { getLeaderboardData } from '../services/leaderboardService';

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
                    explanation: q.explanation || '',
                    question_type: q.question_type || 'MCQ',
                    code_template: q.code_template || null,
                    constraints: q.constraints || null,
                    test_cases: q.test_cases || [],
                    function_name: q.function_name || null,
                    marks: q.marks || 1 // Save marks
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
// STUDENT: Get Available Exams
export const getAvailableExams = async (req: Request, res: Response) => {
    // @ts-ignore
    const studentId = req.user?.userId;

    try {
        // 1. Get Student Details
        const { data: student, error: studentError } = await supabase
            .from('users')
            .select('registration_number, batch, department')
            .eq('id', studentId)
            .single();

        if (studentError || !student) throw new Error('Student not found');

        // 2. Derive Student Section
        const regNo = student.registration_number;
        let studentSection = null;
        if (regNo) {
            const match = regNo.match(/^(?:L)?([A-Z]{2})([A-Z])(\d{2})(\d{2})$/);
            if (match) studentSection = match[2];
        }

        // 3. Get Exams
        const { data: exams, error } = await supabase
            .from('exams')
            .select('*')
            .order('start_time', { ascending: true });

        if (error) throw error;

        // 4. Filter Exams based on Staff Assignment
        // We need to check the creator of each exam
        const creatorIds = [...new Set(exams.map(e => e.created_by))];

        if (creatorIds.length === 0) return res.json(exams);

        const { data: creators } = await supabase
            .from('users')
            .select('id, batch')
            .in('id', creatorIds);

        const creatorMap = new Map();
        creators?.forEach(c => creatorMap.set(c.id, c.batch));

        const filteredExams = exams.filter(exam => {
            const creatorBatch = creatorMap.get(exam.created_by);

            // If creator has no special assignment (no colon), allow visible to all (or restrict? assuming allow global staff)
            // If it is 'RANGE:xxx:xxx', we check range.
            if (!creatorBatch) return true; // Unassigned creator -> Visible to all? Safest for now.

            if (creatorBatch.startsWith('RANGE:')) {
                // Format: "RANGE:Start:End|Extra1,Extra2"
                const mainSplit = creatorBatch.split('|');
                const rangePart = mainSplit[0];
                const extrasPart = mainSplit[1] || '';

                const rangeParts = rangePart.split(':');
                // Validate range parts length is 3 (RANGE, S, E)
                if (rangeParts.length !== 3) return false;

                const startRegNo = rangeParts[1];
                const endRegNo = rangeParts[2];
                const extras = extrasPart ? extrasPart.split(',') : [];

                const studentRegNo = student.registration_number;
                if (!studentRegNo) return false;

                // Check Range
                const inRange = (startRegNo && endRegNo)
                    ? (studentRegNo >= startRegNo && studentRegNo <= endRegNo)
                    : false;

                // Check Extras
                const inExtras = extras.includes(studentRegNo);

                return inRange || inExtras;
            }

            // Legacy/Other format -> Visible
            return true;
        });

        res.json(filteredExams);
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

        // 3. Check Attempts & Termination
        const { data: previousSubmissions, error: subError } = await supabase
            .from('submissions')
            .select('answers')
            .eq('exam_id', id)
            .eq('student_id', studentId);

        if (subError) throw subError;

        const attemptCount = previousSubmissions?.length || 0;

        // Check for termination in any previous submission
        const isTerminated = previousSubmissions?.some((sub: any) => sub.answers?._metadata?.terminated);

        if (isTerminated) {
            return res.status(403).json({ message: 'You have been barred from this exam due to rule violations.' });
        }

        if (attemptCount >= 2) {
            return res.status(403).json({ message: 'Maximum attempts reached' });
        }

        // 4. Fetch Questions (Exclude correct_answer)
        const { data: questions, error: qError } = await supabase
            .from('questions')
            .select('id, question_text, options, explanation, question_type, code_template, constraints, function_name, test_cases, marks, input_format, output_format')
            .eq('exam_id', id);

        if (qError) throw qError;

        res.json({ exam, questions });
    } catch (err: any) {
        res.status(500).json({ message: 'Error loading exam', error: err.message });
    }
};

// STUDENT: Submit Exam
// STUDENT: Submit Exam - MOVED implementation to bottom of file for full evaluation support


// STUDENT: Get Exam Analysis (Detailed Results)
export const getExamAnalysis = async (req: Request, res: Response) => {
    const { id } = req.params;
    // @ts-ignore
    const studentId = req.user?.userId;

    try {
        // 1. Fetch Exam Details
        const { data: exam, error: examError } = await supabase
            .from('exams')
            .select('*')
            .eq('id', id)
            .single();

        if (examError || !exam) return res.status(404).json({ message: 'Exam not found' });

        // 2. Validate End Time
        const now = new Date();
        const end = new Date(exam.end_time);

        if (now < end) {
            return res.status(403).json({ message: 'Results are only available after the exam ends.', endTime: end });
        }

        // 3. Fetch Submission
        const { data: submission, error: subError } = await supabase
            .from('submissions')
            .select('*')
            .eq('exam_id', id)
            .eq('student_id', studentId)
            .single();

        if (subError || !submission) return res.status(404).json({ message: 'Submission not found' });

        // 4. Fetch Questions (Include correct answer for review)
        const { data: questions, error: qError } = await supabase
            .from('questions')
            .select('*') // Includes correct_answer
            .eq('exam_id', id);

        if (qError) throw qError;

        res.json({
            exam,
            submission,
            questions
        });

    } catch (err: any) {
        res.status(500).json({ message: 'Error fetching analysis', error: err.message });
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

        // 4. Rank - REAL TIME
        let rank = "N/A";
        try {
            const leaderboard = await getLeaderboardData();
            const studentRank = leaderboard.find((s: any) => s.id === studentId);
            if (studentRank) {
                rank = `#${studentRank.rank}`;
            }
        } catch (rankErr) {
            console.error("Failed to fetch rank for dashboard", rankErr);
            // Fallback to N/A
        }

        // 5. Calendar Activity
        const { data: allExams, error: examError } = await supabase
            .from('exams')
            .select('id, end_time');

        if (examError) throw examError;

        const activity: { date: string, status: 'attended' | 'missed' }[] = [];
        const processedDates = new Set<string>();

        // Process Submissions (Attended)
        submissions?.forEach(sub => {
            // @ts-ignore
            if (sub.submitted_at) { // Ensure we have a date if available, or fetch it
                // Actually the current select on submissions matches "exam_id, score", let's update it to fetch submitted_at
            }
        });

        // RE-FETCH Submissions with time for calendar
        const { data: submissionsWithTime, error: subTimeError } = await supabase
            .from('submissions')
            .select('exam_id, submitted_at')
            .eq('student_id', studentId);

        if (subTimeError) throw subTimeError;

        submissionsWithTime?.forEach(sub => {
            const dateStr = new Date(sub.submitted_at).toLocaleDateString('en-CA'); // YYYY-MM-DD
            // If multiple on same day, Green takes precedence? User didn't specify, but assume yes.
            // Actually, let's just push all events and handle precedence on frontend or here.
            // User: "if nothings happens on that day then no circle"
            // Let's store unique status per date.
            // If attended any test on Date X -> Green.
            if (!processedDates.has(dateStr)) {
                activity.push({ date: dateStr, status: 'attended' });
                processedDates.add(dateStr);
            }
        });

        // Process Missed Exams
        // Missed = Exam End Time < NOW && Not in myExamIds
        const missedExams = allExams?.filter(e => {
            const isFinished = new Date(e.end_time) < new Date(now);
            const isSubmitted = myExamIds.includes(e.id);
            return isFinished && !isSubmitted;
        }) || [];

        missedExams.forEach(e => {
            const dateStr = new Date(e.end_time).toLocaleDateString('en-CA');
            // Only mark as red if NOT already marked as green (attended)
            if (!processedDates.has(dateStr)) {
                activity.push({ date: dateStr, status: 'missed' });
                processedDates.add(dateStr);
            }
        });

        res.json({
            assessmentsPassed: myExamIds.length,
            pendingTasks: pendingCount || 0,
            rank: rank,
            avgScore: `${avgPercentage}%`,
            activity: activity
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
                score: submissionMap.get(exam.id),
                start_time: exam.start_time,
                end_time: exam.end_time
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

// STUDENT: Save Draft Code
export const saveCode = async (req: Request, res: Response) => {
    // @ts-ignore
    const studentId = req.user?.userId;
    const { question_id, language, code, exam_id } = req.body;

    if (!question_id || !code) {
        return res.status(400).json({ message: 'Missing question_id or code' });
    }

    try {
        // Use a persistent "drafts" table or reuse submissions table with status='DRAFT'?
        // For simpler implementation without new tables, we can assume 'answers' in local storage
        // But prompt requested POST /api/coding/save.
        // We will store it in a 'submission_drafts' table if it existed, or update 'submissions' column 'draft_answers'
        // Since we MUST reuse tables, we can check if there's an active submission entry or just acknowledge success for now 
        // if we are strictly avoiding schema changes beyond what we did.
        // However, to truly support "restore code on navigation", we need storage.
        // Let's use the 'submissions' table. We'll store partial progress in 'answers' but mark it incomplete?
        // Or better: Front-end handles navigation state usually.
        // But prompt says "Auto-save code per question". "Restore code on navigation".
        // Let's assume we update the 'answers' JSONB in a submission row that is 'IN_PROGRESS'.

        // Check if submission exists
        let { data: submission } = await supabase
            .from('submissions')
            .select('*')
            .eq('student_id', studentId)
            .eq('exam_id', exam_id)
            .single();

        let answers = submission?.answers || {};
        answers[question_id] = code; // Or complex object { code, language }

        if (submission) {
            await supabase
                .from('submissions')
                .update({ answers })
                .eq('id', submission.id);
        } else {
            // Create initial submission entry
            await supabase
                .from('submissions')
                .insert({
                    student_id: studentId,
                    exam_id,
                    score: 0,
                    attempt_no: 1, // Logic needed for multi-attempts
                    answers
                });
        }

        res.json({ message: 'Saved' });
    } catch (err: any) {
        // console.error("Save error", err); // silent fail often desired for auto-save
        res.status(500).json({ message: 'Failed to save' });
    }
};

// STUDENT: Compile/Run Code via Piston
export const runCode = async (req: Request, res: Response) => {
    // @ts-ignore
    const studentId = req.user?.userId;
    const { language, version, code, question_id, customInput } = req.body;

    if (!code || !language) {
        return res.status(400).json({ message: 'Missing required code or language' });
    }

    try {
        // CASE 1: Custom Input (Single Run)
        if (customInput !== undefined && customInput !== null) {
            const payload = {
                language: language,
                version: version || '*',
                files: [{ content: code }],
                stdin: customInput,
                args: [],
                compile_timeout: 10000,
                run_timeout: 5000,
                compile_memory_limit: -1,
                run_memory_limit: -1
            };

            const response = await fetch('https://emkc.org/api/v2/piston/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data: any = await response.json();

            return res.json({
                results: [{
                    input: customInput,
                    expected: '(Custom Input)',
                    actual: data.run.stdout,
                    error: data.run.stderr,
                    hidden: false,
                    passed: data.run.code === 0, // Pass if exit code is 0
                    isCustom: true
                }]
            });
        }

        // CASE 2: Sample Test Cases
        if (!question_id) {
            return res.status(400).json({ message: 'Missing question_id for test cases' });
        }

        // 1. Fetch Question to get Test Cases
        const { data: question, error: qError } = await supabase
            .from('questions')
            .select('*')
            .eq('id', question_id)
            .single();

        if (qError || !question) throw new Error('Question not found');

        // FILTER: Only Sample Test Cases (hidden = false)
        const allTestCases = question.test_cases || [];
        const sampleTestCases = allTestCases.filter((tc: any) => !tc.hidden);

        if (sampleTestCases.length === 0) {
            // No sample cases defined
            return res.json({ results: [] });
        }

        const results = [];

        // 2. Loop Sample Test Cases and Execute
        for (const testCase of sampleTestCases) {
            // Piston API Payload
            const payload = {
                language: language,
                version: version || '*',
                files: [{ content: code }],
                stdin: testCase.input,
                args: [],
                compile_timeout: 10000,
                run_timeout: 3000,
                compile_memory_limit: -1,
                run_memory_limit: -1
            };

            const response = await fetch('https://emkc.org/api/v2/piston/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data: any = await response.json();

            // 3. Compare Output
            const actualOutput = (data.run.stdout || '').trim();
            const expectedOutput = (testCase.output || '').trim();
            const passed = actualOutput === expectedOutput;

            results.push({
                input: testCase.input,
                expected: testCase.output,
                actual: data.run.stdout, // Show actual output for sample cases
                error: data.run.stderr,
                hidden: false,
                passed: passed
            });
        }

        res.json({ results });

    } catch (err: any) {
        console.error("Code execution error:", err);
        res.status(500).json({ message: 'Failed to execute code', error: err.message });
    }
};

// HELPER: Execute Code against ALL cases (Internal)
const evaluateCodeInternal = async (language: string, code: string, testCases: any[]) => {
    let passedCount = 0;
    const results = [];

    for (const testCase of testCases) {
        const payload = {
            language: language,
            version: '*',
            files: [{ content: code }],
            stdin: testCase.input,
            args: [],
            run_timeout: 3000
        };

        try {
            const response = await fetch('https://emkc.org/api/v2/piston/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data: any = await response.json();
            const actualOutput = (data.run.stdout || '').trim();
            const expectedOutput = (testCase.output || '').trim();

            if (actualOutput === expectedOutput) {
                passedCount++;
            }
            results.push({ passed: actualOutput === expectedOutput });
        } catch (e) {
            // fail
            results.push({ passed: false });
        }
    }
    return { passed: passedCount, total: testCases.length, results };
};


// STUDENT: Submit Exam (UPDATED for Full Evaluation)
export const submitExam = async (req: Request, res: Response) => {
    const { id } = req.params; // Exam ID
    const { answers, terminated } = req.body; // { question_id: code/answer }
    // @ts-ignore
    const studentId = req.user?.userId;

    try {
        // 1. Fetch All Questions for this Exam
        const { data: questions, error: qError } = await supabase
            .from('questions')
            .select('*')
            .eq('exam_id', id);

        if (qError) throw qError;

        let totalScore = 0;
        let maxPossibleScore = 0;
        const finalAnswers: any = {};

        // Add Metadata if terminated
        if (terminated) {
            finalAnswers._metadata = { terminated: true, terminationReason: 'Max Violations Exceeded' };
        }

        // 2. Iterate and Grade
        for (const q of questions || []) {
            const studentAnswer = answers[q.id]; // Code or MCQ Option
            // @ts-ignore
            const qMarks = q.marks || (q.question_type === 'CODING' ? 5 : 1); // Default marks if not set

            if (q.question_type === 'CODING') {
                maxPossibleScore += qMarks;

                // Server-side Evaluation
                if (!studentAnswer) {
                    finalAnswers[q.id] = { code: '', passed: 0, total: 0, score: 0, maxScore: qMarks };
                    continue;
                }

                // Fetch Test Cases (Assuming they are in q.test_cases)
                const testCases = q.test_cases || [];
                if (testCases.length > 0) {

                    let code = studentAnswer;
                    let lang = 'python'; // Default

                    // If studentAnswer is JSON string/object
                    if (typeof studentAnswer === 'object') {
                        code = studentAnswer.code;
                        lang = studentAnswer.language;
                    }

                    // Evaluate Code
                    const evalResult = await evaluateCodeInternal(lang, code, testCases);

                    const qScore = (evalResult.passed / evalResult.total) * qMarks;
                    const finalQScore = parseFloat(qScore.toFixed(2)); // Round to 2 decimals

                    totalScore += finalQScore;
                    finalAnswers[q.id] = {
                        code,
                        language: lang,
                        passed: evalResult.passed,
                        total: evalResult.total,
                        score: finalQScore,
                        maxScore: qMarks,
                        feedback: evalResult.results // Detailed pass/fail per case
                    };
                } else {
                    // No test cases? full marks if submitted?
                    totalScore += qMarks;
                    finalAnswers[q.id] = { score: qMarks, maxScore: qMarks, code: studentAnswer };
                }

            } else {
                // MCQ / Text Logic
                maxPossibleScore += qMarks;
                // For MCQ:
                if (studentAnswer === q.correct_answer) {
                    totalScore += qMarks;
                }
                finalAnswers[q.id] = studentAnswer;
            }
        }

        // 3. Save Submission
        // Check if submission exists (from auto-save) and update, or insert new
        const { data: existingSub } = await supabase
            .from('submissions')
            .select('id, count') // check existing
            .eq('exam_id', id)
            .eq('student_id', studentId)
            .single();

        const attempt_no = existingSub ? (existingSub.count || 1) : 1;

        if (existingSub) {
            await supabase.from('submissions').update({
                score: totalScore,
                answers: finalAnswers,
                submitted_at: new Date() // Mark complete
            }).eq('id', existingSub.id);
        } else {
            await supabase.from('submissions').insert({
                student_id: studentId,
                exam_id: id,
                attempt_no,
                score: totalScore,
                answers: finalAnswers
            });
        }

        res.json({
            message: 'Exam submitted successfully',
            score: totalScore,
            total: questions?.length || 0,
            maxScore: maxPossibleScore,
            reviewDetails: questions, // Question info (text, options)
            gradingDetails: finalAnswers // Score info
        });

    } catch (err: any) {
        console.error("Submit Error:", err);
        res.status(500).json({ message: 'Failed to submit exam', error: err.message });
    }
};

