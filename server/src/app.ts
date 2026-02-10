import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'PlacementPrePro Server is running' });
});


// Routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import examRoutes from './routes/examRoutes';
import mockInterviewRoutes from './routes/mockInterviewRoutes';
import resumeRoutes from './routes/resumeRoutes';
import leaderboardRoutes from './routes/leaderboardRoutes';
import studentRoutes from './routes/studentRoutes';

import assessmentRoutes from './routes/assessmentRoutes';
import placementInsightsRoutes from './routes/placementInsightsRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/interviews', mockInterviewRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/placement-insights', placementInsightsRoutes);

export default app;
