import { Request, Response } from 'express';

export const startInterview = async (req: Request, res: Response) => {
    res.json({ message: 'Interview started (placeholder)' });
};

export const chatInterview = async (req: Request, res: Response) => {
    res.json({ message: 'Chat response (placeholder)' });
};

export const endInterview = async (req: Request, res: Response) => {
    res.json({ message: 'Interview ended (placeholder)' });
};
