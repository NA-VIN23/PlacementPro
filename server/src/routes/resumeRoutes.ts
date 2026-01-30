import { Router } from 'express';
import { generateResume, downloadResume } from '../controllers/resumeController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

// Secure generation
router.post('/generate', authenticate, authorize(['STUDENT']), generateResume);

// Public download (by ID) to support window.open from frontend without auth headers
router.get('/download', downloadResume);

export default router;
