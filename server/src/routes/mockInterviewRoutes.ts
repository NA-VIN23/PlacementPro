import { Router } from 'express';
import { startInterview, endInterview, getInterviewHistory } from '../controllers/mockInterviewController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);
router.use(authorize(['STUDENT']));

// Start a new interview session (get LiveKit token)
router.post('/start', startInterview);

// End interview session
router.post('/end', endInterview);

// Get interview history
router.get('/history', getInterviewHistory);

export default router;
