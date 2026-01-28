import { Request, Response } from 'express';
import { MockInterview } from '../models/types';

export let MOCK_INTERVIEWS_DB: MockInterview[] = [];

// START Interview (Initialize context)
export const startInterview = (req: Request, res: Response) => {
    const { type, resumeText } = req.body; // HR or TECHNICAL

    // In a real app, we would initialize an OpenAI/Gemini session here with the resume context
    res.json({
        message: 'Interview session started',
        sessionId: Date.now().toString(),
        firstQuestion: `Hello, I see you are applying for a specific role. Can you walk me through your resume?`
    });
};

// CHAT Interaction
export const chatInterview = (req: Request, res: Response) => {
    const { sessionId, userMessage } = req.body;

    // Mock AI Response logic
    const responses = [
        "That's interesting. Can you elaborate on your experience with React?",
        "How do you handle conflict in a team setting?",
        "Explain the difference between SQL and NoSQL databases.",
        "Good answer. Let's move to the next topic."
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    res.json({
        response: randomResponse,
        sessionId
    });
};

// END Interview (Submit Feedback)
export const endInterview = (req: Request, res: Response) => {
    const { sessionId } = req.body;
    // @ts-ignore
    const studentId = req.user?.userId || 'unknown';

    const newInterview: MockInterview = {
        id: Date.now().toString(),
        student_id: studentId,
        interview_type: 'HR', // Logic to track type needed
        score: Math.floor(Math.random() * 5) + 5, // Mock score 5-10
        feedback: 'Good confidence, but work on technical definitions.',
        created_at: new Date()
    };

    MOCK_INTERVIEWS_DB.push(newInterview);

    res.json({
        message: 'Interview completed',
        result: newInterview
    });
};
