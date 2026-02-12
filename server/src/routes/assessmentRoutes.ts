import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import multer from 'multer';
import { extractPdfContent } from '../controllers/pdfController';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.use(authenticate);

// POST /api/assessment/parse-pdf
router.post('/parse-pdf', authorize(['STAFF', 'ADMIN']), upload.single('pdf'), extractPdfContent);

export default router;
