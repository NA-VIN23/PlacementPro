import { Router } from 'express';
import { addUser, listUsers, toggleUserParams } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

// Protect all routes: Admin only
router.use(authenticate, authorize(['ADMIN']));

router.post('/add', addUser);
router.get('/', listUsers);
router.patch('/:id/toggle-active', toggleUserParams);

export default router;
