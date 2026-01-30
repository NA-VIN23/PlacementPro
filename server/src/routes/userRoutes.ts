import { Router } from 'express';
import { addUser, listUsers, toggleUserParams, updateProfile, getStaffActivityLogs } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

// Base authentication for all routes
router.use(authenticate);

// Profile and Logs - Accessible by Admin and Staff
router.patch('/profile', authorize(['ADMIN', 'STAFF']), updateProfile);
router.get('/logs', authorize(['ADMIN', 'STAFF']), getStaffActivityLogs);

// Admin Only Routes
router.post('/add', authorize(['ADMIN']), addUser);
router.get('/', authorize(['ADMIN']), listUsers);
router.patch('/:id/toggle-active', authorize(['ADMIN']), toggleUserParams);

export default router;
