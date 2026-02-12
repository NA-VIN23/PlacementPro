import { Request, Response } from 'express';
import { getLeaderboardData } from '../services/leaderboardService';

export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const rankedLeaderboard = await getLeaderboardData();
        res.json(rankedLeaderboard);
    } catch (err: any) {
        console.error('Leaderboard Error:', err);
        res.status(500).json({ message: 'Failed to calculate leaderboard' });
    }
};
