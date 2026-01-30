import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Mock AI Service (Replace with actual OpenAI/Gemini call later)
const generateAIResponse = async (history: any[], message: string) => {
    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple keyword matching for demo
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('intro')) return "Good introduction. Can you tell me about your strengths?";
    if (lowerMsg.includes('java')) return "Java is a popular language. Explain OOP concepts.";
    if (lowerMsg.includes('react')) return "React is great. What are hooks?";
    return "That's interesting. Please elaborate further.";
};

export const startInterview = async (req: Request, res: Response) => {
    try {
        const { type } = req.body;
        const studentId = (req as any).user.id; // Added by auth middleware

        const { data, error } = await supabase
            .from('mock_interviews')
            .insert({
                student_id: studentId,
                interview_type: type,
                status: 'IN_PROGRESS',
                history: [{ role: 'system', content: `You are an interviewer conducting a ${type} interview.` }],
                created_at: new Date()
            })
            .select()
            .single();

        if (error) throw error;

        // Initial greeting
        const greeting = `Hello! I am your AI interviewer for this ${type} round. Please introduce yourself.`;

        // Update history with greeting
        const updatedHistory = [...data.history, { role: 'ai', content: greeting }];
        await supabase
            .from('mock_interviews')
            .update({ history: updatedHistory })
            .eq('id', data.id);

        res.json({
            interviewId: data.id,
            message: greeting,
            history: updatedHistory
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to start interview' });
    }
};

export const chatInterview = async (req: Request, res: Response) => {
    try {
        const { interviewId, message } = req.body;

        // fetch current interview
        const { data: interview, error: fetchError } = await supabase
            .from('mock_interviews')
            .select('*')
            .eq('id', interviewId)
            .single();

        if (fetchError || !interview) return res.status(404).json({ error: 'Interview not found' });

        const newHistory = [...interview.history, { role: 'user', content: message }];

        // Generate AI response
        const aiResponse = await generateAIResponse(newHistory, message);
        newHistory.push({ role: 'ai', content: aiResponse });

        // Update DB
        const { error: updateError } = await supabase
            .from('mock_interviews')
            .update({ history: newHistory })
            .eq('id', interviewId);

        if (updateError) throw updateError;

        res.json({ message: aiResponse, history: newHistory });

    } catch (error) {
        res.status(500).json({ error: 'Failed to process chat' });
    }
};

export const endInterview = async (req: Request, res: Response) => {
    try {
        const { interviewId } = req.body;

        // Calculate dummy score
        const score = Math.floor(Math.random() * 5) + 5; // 5-10
        const feedback = "Good effort. Improve confidence and technical depth.";

        const { error } = await supabase
            .from('mock_interviews')
            .update({
                status: 'COMPLETED',
                score,
                feedback
            })
            .eq('id', interviewId);

        if (error) throw error;

        res.json({ message: 'Interview completed', score, feedback });

    } catch (error) {
        res.status(500).json({ error: 'Failed to end interview' });
    }
};
