
import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import {
    getDashboardStats,
    getDepartmentStaff,
    getDepartmentStudents,
    getDepartmentAnalytics,
    getStaffPerformance,
    compareClasses,
    getStaffStudents
} from '../controllers/hodController';

const router = express.Router();
console.log("Loading HOD Routes...");

// All HOD routes require HOD role
router.use(authenticate, authorize(['HOD']));

router.get('/staff-students/:staffId', (req, res, next) => {
    console.log(`[HOD Route] Hit /staff-students/${req.params.staffId}`);
    next();
}, getStaffStudents);

router.get('/stats', getDashboardStats);
router.get('/staff', getDepartmentStaff);
router.get('/students', getDepartmentStudents);
router.get('/analytics', getDepartmentAnalytics);
router.get('/staff/:staffId/performance', getStaffPerformance);

router.post('/compare-classes', compareClasses);

export default router;
