import { Router } from 'express';
import { startInterview, chatInterview, endInterview } from '../controllers/mockInterviewController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);
router.use(authorize(['STUDENT'])); // Only students can access interviews

router.post('/start', startInterview);
router.post('/chat', chatInterview);
router.post('/end', endInterview);

export default router;
