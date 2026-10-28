import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import {
  createWorkoutController,
  getWorkoutController,
  listWorkoutsController,
  deleteWorkoutController,
  getSummaryController,
  getWeeklyAnalyticsController,
  getHeartRateAnalyticsController,
  getFormAccuracyAnalyticsController,
  syncWorkoutsController,
} from '../controllers/workout';
import {
  createWorkoutSchema,
  getWorkoutSchema,
  listWorkoutsSchema,
  deleteWorkoutSchema,
} from '../validators/workout';

const router = Router();

router.use(authenticate);

router.post('/', validate(createWorkoutSchema), createWorkoutController);
router.get('/', validate(listWorkoutsSchema), listWorkoutsController);
router.get('/summary', getSummaryController);
router.get('/analytics/weekly', getWeeklyAnalyticsController);
router.get('/analytics/heart-rate', getHeartRateAnalyticsController);
router.get('/analytics/form-accuracy', getFormAccuracyAnalyticsController);
router.post('/sync', syncWorkoutsController);
router.get('/:id', validate(getWorkoutSchema), getWorkoutController);
router.delete('/:id', validate(deleteWorkoutSchema), deleteWorkoutController);

export default router;