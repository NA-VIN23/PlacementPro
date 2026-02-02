import { Router } from 'express';
import { getStudentProfile, updateStudentProfile } from '../controllers/studentController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);
router.use(authorize(['STUDENT']));

router.get('/profile', getStudentProfile);
router.post('/profile', updateStudentProfile);

export default router;
