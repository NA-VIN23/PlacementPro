import { Router } from 'express';
import { addUser, listUsers, toggleUserParams, updateProfile, getStaffActivityLogs, getStudents, bulkImportUsers, deleteUser } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import multer from 'multer';

// Multer config for file uploads
const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// Base authentication for all routes
router.use(authenticate);

// Profile and Logs - Accessible by Admin and Staff
router.patch('/profile', authorize(['ADMIN', 'STAFF']), updateProfile);
router.get('/logs', authorize(['ADMIN', 'STAFF']), getStaffActivityLogs);
router.get('/students', authorize(['ADMIN', 'STAFF']), getStudents);

// Admin Only Routes
router.post('/add', authorize(['ADMIN']), addUser);
router.post('/import-bulk', authorize(['ADMIN']), upload.single('file'), bulkImportUsers);
router.delete('/:id', authorize(['ADMIN']), deleteUser);
router.get('/', authorize(['ADMIN']), listUsers);
router.patch('/:id/toggle-active', authorize(['ADMIN']), toggleUserParams);

export default router;
