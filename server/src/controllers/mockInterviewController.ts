import { Request, Response } from 'express';

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || '';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || '';
const LIVEKIT_URL = process.env.LIVEKIT_URL || '';

/**
 * Generate LiveKit token for student to join interview room
 */
export const startInterview = async (req: Request, res: Response) => {
    try {
        const studentId = (req as any).user?.userId || 'demo-student';
        const studentName = 'Student'; // req.user doesn't have name in jwt usually, strictly from DB

        // Create unique room name for this interview
        const roomName = `interview-${Date.now()}-${studentId}`;
        const interviewId = `int-${Date.now()}`;

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

        console.log('Interview started:', { roomName, studentId, livekitUrl: LIVEKIT_URL });

        res.json({
            interviewId: interviewId,
            roomName: roomName,
            token: jwt,
            livekitUrl: LIVEKIT_URL,
        });

    } catch (error: any) {
        console.error('Failed to start interview:', error);
        res.status(500).json({ error: 'Failed to start interview session', details: error.message });
    }
};

/**
 * End interview and save feedback
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
 * Get interview history for student
 */
export const getInterviewHistory = async (req: Request, res: Response) => {
    try {
        // Return empty array for now (no database)
        res.json([]);
    } catch (error) {
        console.error('Failed to fetch interview history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};
