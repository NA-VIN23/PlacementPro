import { Router } from 'express';
import { createExam, getAvailableExams, getExamQuestions, submitExam, getStudentResults, getAllSubmissions, getDashboardStats, getStudentDashboardStats, getAssessmentPageData, runCode, saveCode } from '../controllers/examController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import multer from 'multer';
import { extractPdfContent } from '../controllers/pdfController';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.use(authenticate);

// Results Routes (Must be before /:id)
router.get('/student/results', authorize(['STUDENT']), getStudentResults);
router.get('/student/dashboard-stats', authorize(['STUDENT']), getStudentDashboardStats);
router.get('/student/assessment-page', authorize(['STUDENT']), getAssessmentPageData);
router.get('/staff/submissions', authorize(['STAFF', 'ADMIN']), getAllSubmissions);
router.get('/stats/dashboard', authorize(['STAFF', 'ADMIN']), getDashboardStats);

// Staff Routes
router.post('/extract-pdf', authorize(['STAFF', 'ADMIN']), upload.single('pdf'), extractPdfContent);
router.post('/', authorize(['STAFF', 'ADMIN']), createExam);

// Student Routes
router.get('/', getAvailableExams); // List all
router.get('/:id/take', authorize(['STUDENT']), getExamQuestions); // Start/View Questions
router.post('/:id/submit', authorize(['STUDENT']), submitExam);
router.post('/run-code', authorize(['STUDENT']), runCode as any);
router.post('/save-code', authorize(['STUDENT']), saveCode as any);

export default router;
