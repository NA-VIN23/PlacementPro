import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || '';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || '';
const LIVEKIT_URL = process.env.LIVEKIT_URL || '';

/**
 * Generate LiveKit token for student to join interview room
 * Also creates a mock_interviews record in the database
 */
export const startInterview = async (req: Request, res: Response) => {
    try {
        const studentId = (req as any).user?.userId || 'demo-student';
        const studentName = 'Student';

        // Create unique room name for this interview
        const roomName = `interview-${Date.now()}-${studentId}`;

        // Check if LiveKit credentials are configured
        if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
            console.error('LiveKit credentials missing:', {
                hasKey: !!LIVEKIT_API_KEY,
                hasSecret: !!LIVEKIT_API_SECRET,
                hasUrl: !!LIVEKIT_URL
            });
            return res.status(500).json({ error: 'LiveKit configuration missing' });
        }

        // Use require for CommonJS compatibility
        const { AccessToken } = require('livekit-server-sdk');

        // Generate LiveKit access token for student
        const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
            identity: studentId,
            name: studentName,
        });

        // Grant permissions to join room and publish audio
        token.addGrant({
            roomJoin: true,
            room: roomName,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
        });

        const jwt = await token.toJwt();

        // Create interview record in database
        const { data: interview, error: dbError } = await supabase
            .from('mock_interviews')
            .insert({
                student_id: studentId,
                interview_type: 'HR',
                room_name: roomName,
            })
            .select('id')
            .single();

        if (dbError) {
            console.error('Failed to create interview record:', dbError);
            // Don't block the interview — continue even if DB insert fails
        }

        const interviewId = interview?.id || `int-${Date.now()}`;

        console.log('Interview started:', { roomName, studentId, interviewId, livekitUrl: LIVEKIT_URL });

        res.json({
            interviewId,
            roomName,
            token: jwt,
            livekitUrl: LIVEKIT_URL,
        });

    } catch (error: any) {
        console.error('Failed to start interview:', error);
        res.status(500).json({ error: 'Failed to start interview session', details: error.message });
    }
};

/**
 * End interview — scores are saved separately by the agent via /scores endpoint
 */
export const endInterview = async (req: Request, res: Response) => {
    try {
        const { interviewId } = req.body;
        console.log('Interview ended:', interviewId);
        res.json({ message: 'Interview ended successfully' });
    } catch (error) {
        console.error('Failed to end interview:', error);
        res.status(500).json({ error: 'Failed to end interview' });
    }
};

/**
 * Save interview scores — called by the Python LiveKit agent after parsing scores
 * No auth required (server-to-server call)
 */
export const saveScores = async (req: Request, res: Response) => {
    try {
        const {
            roomName,
            fluencyScore,
            grammarScore,
            communicationScore,
            confidenceScore,
            correctnessScore,
            overallScore,
            feedback,
        } = req.body;

        if (!roomName) {
            return res.status(400).json({ error: 'roomName is required' });
        }

        const { data, error } = await supabase
            .from('mock_interviews')
            .update({
                fluency_score: fluencyScore || 0,
                grammar_score: grammarScore || 0,
                communication_score: communicationScore || 0,
                confidence_score: confidenceScore || 0,
                correctness_score: correctnessScore || 0,
                score: overallScore || 0,
                feedback: feedback || '',
            })
            .eq('room_name', roomName)
            .select();

        if (error) {
            console.error('Failed to save scores:', error);
            return res.status(500).json({ error: 'Failed to save scores', details: error.message });
        }

        console.log('Scores saved for room:', roomName, data);
        res.json({ message: 'Scores saved successfully', data });
    } catch (error: any) {
        console.error('Failed to save scores:', error);
        res.status(500).json({ error: 'Failed to save scores', details: error.message });
    }
};

/**
 * Get interview history for student
 */
export const getInterviewHistory = async (req: Request, res: Response) => {
    try {
        const studentId = (req as any).user?.userId;

        if (!studentId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { data, error } = await supabase
            .from('mock_interviews')
            .select('*')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Failed to fetch interview history:', error);
            return res.status(500).json({ error: 'Failed to fetch history' });
        }

        res.json(data || []);
    } catch (error) {
        console.error('Failed to fetch interview history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};
