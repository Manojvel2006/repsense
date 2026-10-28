import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import exerciseRoutes from './routes/exercise';
import workoutRoutes from './routes/workout';
import analyticsRoutes from './routes/analytics';

const app = express();

app.use(helmet());

app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later', error: { code: 'RATE_LIMITED' } },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'RepSense API is healthy',
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/exercises', exerciseRoutes);
app.use('/api/v1/workouts', workoutRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;