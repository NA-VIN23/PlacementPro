import { Request, Response } from 'express';
import { parseAssessmentPdf } from '../utils/pdfParser';

export const extractPdfContent = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            console.log("No file received in request.");
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log(`[PDF Controller] Received File: ${req.file.originalname}, Size: ${req.file.size}, Mime: ${req.file.mimetype}`);

        const data = await parseAssessmentPdf(req.file.buffer);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ message: 'Extraction Failed', error: error.message });
    }
};
