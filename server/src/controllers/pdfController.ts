import { Request, Response } from 'express';
import { parseAssessmentPdf } from '../utils/pdfParser';

export const extractPdfContent = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const data = await parseAssessmentPdf(req.file.buffer);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ message: 'Extraction Failed', error: error.message });
    }
};
