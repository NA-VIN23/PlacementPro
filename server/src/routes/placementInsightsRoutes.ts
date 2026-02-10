import express from 'express';
import { getOverview, getCompanies, getCompanyDetail, getUpcomingDrives } from '../controllers/placementInsightsController';

const router = express.Router();

console.log('LOADING PLACEMENT INSIGHTS ROUTES');

router.use((req, res, next) => {
    console.log('Placement Insights Request:', req.method, req.url);
    next();
});

// Define routes for Placement Insights Module
router.get('/overview', getOverview);
router.get('/companies', getCompanies);
router.get('/companies/:id', getCompanyDetail);
router.get('/upcoming', getUpcomingDrives);

export default router;
