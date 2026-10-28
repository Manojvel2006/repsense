import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getSummaryController,
  getWeeklyAnalyticsController,
  getHeartRateAnalyticsController,
  getFormAccuracyAnalyticsController,
} from '../controllers/workout';

const router = Router();

router.use(authenticate);

router.get('/summary', getSummaryController);
router.get('/weekly', getWeeklyAnalyticsController);
router.get('/heart-rate', getHeartRateAnalyticsController);
router.get('/form-accuracy', getFormAccuracyAnalyticsController);

export default router;