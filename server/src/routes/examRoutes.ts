import { Router } from 'express';
import { createExam, getAvailableExams, getExamQuestions, submitExam, getStudentResults, getAllSubmissions, getDashboardStats } from '../controllers/examController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

// Results Routes (Must be before /:id)
router.get('/student/results', authorize(['STUDENT']), getStudentResults);
router.get('/staff/submissions', authorize(['STAFF', 'ADMIN']), getAllSubmissions);
router.get('/stats/dashboard', authorize(['STAFF', 'ADMIN']), getDashboardStats);

// Staff Routes
router.post('/', authorize(['STAFF', 'ADMIN']), createExam);

// Student Routes
router.get('/', getAvailableExams); // List all
router.get('/:id/take', authorize(['STUDENT']), getExamQuestions); // Start/View Questions
router.post('/:id/submit', authorize(['STUDENT']), submitExam);

export default router;
