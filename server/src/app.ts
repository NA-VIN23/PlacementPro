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

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/interviews', mockInterviewRoutes);

export default app;
