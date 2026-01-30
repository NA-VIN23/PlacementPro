import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        // 1. Fetch Students
        const { data: students, error: userError } = await supabase
            .from('users')
            .select('id, name, batch')
            .eq('role', 'STUDENT');

        if (userError) throw userError;

        // 2. Fetch Submissions
        const { data: submissions, error: subError } = await supabase
            .from('submissions')
            .select('*'); // Need answers, student_id, exam_id, submitted_at

        if (subError) throw subError;

        // 3. Fetch Questions (Need correct answers for C/W calculation)
        const { data: questions, error: qError } = await supabase
            .from('questions')
            .select('id, exam_id, correct_answer');

        if (qError) throw qError;

        // Pre-process Questions Map: examId -> { qId: correct_answer }
        const keyMap: Record<string, Record<string, string>> = {};
        questions?.forEach(q => {
            if (!keyMap[q.exam_id]) keyMap[q.exam_id] = {};
            keyMap[q.exam_id][q.id] = q.correct_answer;
        });

        // 4. Calculate Scores per Student
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

                const V = 0; // Violations - Assume 0 as per rules (no table)
                const M = 1; // Mark per Q - Derived from examController
                const N = 0; // Negative Mark - Derived from examController

                const rawScore = C * M;
                const penalty = W * N;
                const finalScore = rawScore - penalty;

                const accuracy = A > 0 ? (C / A) * 100 : 0;

                // Formula: adjustedAccuracy = accuracy - (V * 2)
                let adjustedAccuracy = accuracy - (V * 2);
                if (adjustedAccuracy < 0) adjustedAccuracy = 0; // explicit check though prompt implied checking V*5 logic

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
            const dates: Set<string> = new Set();

            examIds.forEach(eid => {
                totalScore += bestAttempts[eid].lbScore;
                const dateStr = new Date(bestAttempts[eid].submitted_at).toISOString().split('T')[0];
                dates.add(dateStr);
            });

            // Streak Calculation (Consecutive Days or Count of Active Days?)
            // Usually streak is consecutive days ending today.
            // Simplified: Max consecutive days in history.
            const uniqueDates = Array.from(dates).sort();
            let currentStreak = 0;
            let maxStreak = 0;
            let prevDate: Date | null = null;

            // Simple logic: if dates are consecutive, increment streak.
            uniqueDates.forEach(dateStr => {
                const d = new Date(dateStr);
                if (prevDate) {
                    const diffTime = Math.abs(d.getTime() - prevDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays === 1) {
                        currentStreak++;
                    } else {
                        currentStreak = 1;
                    }
                } else {
                    currentStreak = 1;
                }
                if (currentStreak > maxStreak) maxStreak = currentStreak;
                prevDate = d;
            });

            // Avatar Initials
            const initials = student.name
                ? student.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                : '??';

            return {
                id: student.id,
                name: student.name || 'Student',
                batch: student.batch || 'N/A',
                score: Math.round(totalScore), // Integer score
                tests: examIds.length,
                streak: maxStreak,
                trend: 'same', // Static as we don't store historical snapshots
                avatar: initials
            };
        });

        // 5. Sort by Score DESC
        leaderboard?.sort((a, b) => b.score - a.score);

        // 6. Assign Rank
        const rankedLeaderboard = leaderboard?.map((user, index) => ({
            ...user,
            rank: index + 1
        }));

        res.json(rankedLeaderboard);

    } catch (err: any) {
        console.error('Leaderboard Error:', err);
        res.status(500).json({ message: 'Failed to calculate leaderboard' });
    }
};
