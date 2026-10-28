import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import {
  createExerciseController,
  getExerciseController,
  getExerciseByTypeController,
  listExercisesController,
  updateExerciseController,
  deleteExerciseController,
  seedExercisesController,
} from '../controllers/exercise';
import {
  createExerciseSchema,
  updateExerciseSchema,
  getExerciseSchema,
  listExercisesSchema,
} from '../validators/exercise';

const router = Router();

router.get('/', validate(listExercisesSchema), listExercisesController);
router.get('/seed', authenticate, seedExercisesController);
router.get('/type/:type', getExerciseByTypeController);
router.get('/:id', validate(getExerciseSchema), getExerciseController);

router.use(authenticate);
router.post('/', validate(createExerciseSchema), createExerciseController);
router.put('/:id', validate(updateExerciseSchema), updateExerciseController);
router.delete('/:id', validate(getExerciseSchema), deleteExerciseController);

export default router;