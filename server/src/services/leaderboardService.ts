import { supabase } from '../config/supabase';

export const getLeaderboardData = async () => {
    try {
        console.log('Starting getLeaderboardData...');
        // 1. Fetch Students
        const { data: students, error: userError } = await supabase
            .from('users')
            .select('id, name, batch, registration_number') // Added registration_number
            .eq('role', 'STUDENT');

        if (userError) throw userError;

        // 2. Fetch Submissions (Optimized select)
        const { data: submissions, error: subError } = await supabase
            .from('submissions')
            .select('student_id, exam_id, score, answers, submitted_at');

        if (subError) throw subError;

        // 3. Fetch Questions
        const { data: questions, error: qError } = await supabase
            .from('questions')
            .select('id, exam_id, correct_answer');

        if (qError) throw qError;

        // 4. Fetch Exams & Creators for Streak Logic
        const { data: exams, error: examError } = await supabase
            .from('exams')
            .select('id, created_by, start_time, end_time');

        if (examError) throw examError;

        // Get unique creator IDs
        const creatorIds = [...new Set(exams?.map(e => e.created_by) || [])];
        const { data: creators, error: creatorError } = await supabase
            .from('users')
            .select('id, batch')
            .in('id', creatorIds);

        if (creatorError) throw creatorError;

        const creatorMap = new Map();
        creators?.forEach(c => creatorMap.set(c.id, c.batch));

        console.log(`Fetched ${students?.length} students, ${submissions?.length} submissions.`);

        // Pre-process Questions Map: examId -> { qId: correct_answer }
        const keyMap: Record<string, Record<string, string>> = {};
        questions?.forEach(q => {
            if (!keyMap[q.exam_id]) keyMap[q.exam_id] = {};
            keyMap[q.exam_id][q.id] = q.correct_answer;
        });

        // Helper: Check if exam is assigned to student (Logic from examController)
        const isExamAssigned = (exam: any, student: any) => {
            const creatorBatch = creatorMap.get(exam.created_by);
            if (!creatorBatch) return true; // Default public if no batch logic? Or assume assigned.

            if (creatorBatch.startsWith('RANGE:')) {
                const mainSplit = creatorBatch.split('|');
                const rangePart = mainSplit[0];
                const extrasPart = mainSplit[1] || '';
                const rangeParts = rangePart.split(':');
                if (rangeParts.length !== 3) return false;

                const startRegNo = rangeParts[1];
                const endRegNo = rangeParts[2];
                const extras = extrasPart ? extrasPart.split(',') : [];
                const studentRegNo = student.registration_number;
                if (!studentRegNo) return false;

                const inRange = (startRegNo && endRegNo) ? (studentRegNo >= startRegNo && studentRegNo <= endRegNo) : false;
                const inExtras = extras.includes(studentRegNo);
                return inRange || inExtras;
            }
            return true; // Use default visibility if not range-restricted
        };

        // 5. Calculate Scores per Student
        const leaderboard = students?.map(student => {
            const studentSubs = submissions?.filter(s => s.student_id === student.id) || [];

            // Deduplicate exams - Take BEST attempt based on calculated Leaderboard Score
            const bestAttempts: Record<string, any> = {};

            studentSubs.forEach(sub => {
                // Calculate metrics for this submission
                const examKeys = keyMap[sub.exam_id] || {};
                const answers = sub.answers || {}; // JSON Record<qId, answer>

                let C = 0; // Correct
                let W = 0; // Wrong
                let A = 0; // Attempted

                // Safety check for answers
                if (answers && typeof answers === 'object') {
                    Object.keys(answers).forEach(qId => {
                        const ans = answers[qId];
                        // Count as attempted if answer is not null/undefined
                        if (ans !== undefined && ans !== null && String(ans).trim() !== '') {
                            A++;
                            if (examKeys[qId] === ans) {
                                C++;
                            } else {
                                W++;
                            }
                        }
                    });
                }

                const V = 0; // Violations
                const M = 1; // Mark per Q
                const N = 0; // Negative Mark

                const rawScore = C * M;
                const penalty = W * N;
                const finalScore = rawScore - penalty;

                const accuracy = A > 0 ? (C / A) * 100 : 0;

                // Formula: adjustedAccuracy = accuracy - (V * 2)
                let adjustedAccuracy = accuracy - (V * 2);
                if (adjustedAccuracy < 0) adjustedAccuracy = 0;

                // Formula: leaderboardScore = (finalScore * 0.7) + (adjustedAccuracy * 0.3) - (V * 5)
                let lbScore = (finalScore * 0.7) + (adjustedAccuracy * 0.3) - (V * 5);

                // Edge Case: leaderboardScore < 0 -> set to 0
                if (lbScore < 0) lbScore = 0;

                // Store best attempt
                if (!bestAttempts[sub.exam_id] || bestAttempts[sub.exam_id].lbScore < lbScore) {
                    bestAttempts[sub.exam_id] = {
                        lbScore,
                        submitted_at: sub.submitted_at
                    };
                }
            });

            // Aggregate Data
            const examIds = Object.keys(bestAttempts);
            let totalScore = 0;
            const submittedDates: Set<string> = new Set();

            examIds.forEach(eid => {
                totalScore += bestAttempts[eid].lbScore;
                try {
                    const dateStr = new Date(bestAttempts[eid].submitted_at).toISOString().split('T')[0];
                    submittedDates.add(dateStr);
                } catch (e) {
                    // Ignore date parse errors
                }
            });

            // --- Streak Calculation (New Logic) ---
            // 1. Identify all exams assigned to this student
            const assignedExams = exams?.filter(e => isExamAssigned(e, student)) || [];

            // 2. Collect all "Assigned Dates" (using end_time as the reference for assignment day)
            // If an exam ends on 2023-10-10, it counts as an assigned task for that day.
            const assignedDates: Set<string> = new Set();
            assignedExams.forEach(e => {
                // Use end_time local date string to match submission tracking
                // If usage defines start_time as the 'day', switch this. 
                // Usually deadlines (end_time) define "when you should have done it".
                const d = new Date(e.end_time).toISOString().split('T')[0];
                assignedDates.add(d);
            });

            // Calculate range: First assignment to Today
            const today = new Date().toISOString().split('T')[0];
            const sortedAssignedDates = Array.from(assignedDates).sort();
            const firstDate = sortedAssignedDates.length > 0 ? sortedAssignedDates[0] : today;

            // Iterate day by day from first possible assignment to today
            let currentStreak = 0;
            // We need to iterate chronologically. 
            // Finding max range.
            const start = new Date(firstDate);
            const end = new Date(today);

            // Loop date
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];

                const isSubmitted = submittedDates.has(dateStr);
                const isAssigned = assignedDates.has(dateStr);

                if (isSubmitted) {
                    // Attended test: Maintain/Increment
                    currentStreak++;
                } else if (isAssigned) {
                    // Assigned BUT NOT Submitted: Break
                    currentStreak = 0;
                } else {
                    // Not Assigned: Maintain (Do nothing)
                }
            }

            // Avatar Initials
            const initials = student.name
                ? student.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                : '??';

            return {
                id: student.id,
                name: student.name || 'Student',
                batch: student.batch || 'N/A',
                score: Math.round(totalScore),
                tests: examIds.length,
                streak: currentStreak,
                trend: 'same',
                avatar: initials
            };
        });

        // 6. Sort by Score DESC
        leaderboard?.sort((a, b) => b.score - a.score);

        // 7. Assign Rank
        const rankedLeaderboard = leaderboard?.map((user, index) => ({
            ...user,
            rank: index + 1
        }));

        console.log('Leaderboard calculation complete.');
        return rankedLeaderboard || [];
    } catch (err) {
        console.error("Critical error in getLeaderboardData:", err);
        throw err;
    }
};
