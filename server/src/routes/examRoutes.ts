import { Router } from 'express';
import { createExam, getAvailableExams, getExamQuestions, submitExam } from '../controllers/examController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

// Staff Routes
router.post('/', authorize(['STAFF', 'ADMIN']), createExam);

// Student Routes (also accessible by Staff for preview potentially, but main use is Student)
router.get('/', getAvailableExams); // List all
router.get('/:id/take', authorize(['STUDENT']), getExamQuestions); // Start/View Questions
router.post('/:id/submit', authorize(['STUDENT']), submitExam);

export default router;
