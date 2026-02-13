import { Router } from 'express';
import { startInterview, endInterview, getInterviewHistory, saveScores } from '../controllers/mockInterviewController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

// Agent-to-server score submission (no auth — called by the Python agent)
router.post('/scores', saveScores);

// Protected student routes
router.use(authenticate);
router.use(authorize(['STUDENT']));

// Start a new interview session (get LiveKit token)
router.post('/start', startInterview);

// End interview session
router.post('/end', endInterview);

// Get interview history
router.get('/history', getInterviewHistory);

export default router;
