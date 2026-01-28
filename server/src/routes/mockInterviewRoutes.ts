import { Router } from 'express';
import { startInterview, chatInterview, endInterview } from '../controllers/mockInterviewController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/start', startInterview);
router.post('/chat', chatInterview);
router.post('/end', endInterview);

export default router;
