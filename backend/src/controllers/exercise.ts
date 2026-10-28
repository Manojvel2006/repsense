import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { successResponse } from '../utils/apiResponse';
import {
  createExercise,
  getExerciseById,
  getExerciseByType,
  listExercises,
  updateExercise,
  deleteExercise,
  seedDefaultExercises,
  ExerciseFilters,
} from '../services/exercise';

export const createExerciseController = async (req: AuthRequest, res: Response) => {
  const exercise = await createExercise(req.body);
  res.status(201).json(successResponse('Exercise created successfully', exercise));
};

export const getExerciseController = async (req: AuthRequest, res: Response) => {
  const exercise = await getExerciseById(req.params.id);
  res.json(successResponse('Exercise retrieved successfully', exercise));
};

export const getExerciseByTypeController = async (req: AuthRequest, res: Response) => {
  const exercise = await getExerciseByType(req.params.type as any);
  res.json(successResponse('Exercise retrieved successfully', exercise));
};

export const listExercisesController = async (req: AuthRequest, res: Response) => {
  const rawActive: unknown = req.query.isActive;
  const isActive =
    rawActive === undefined || rawActive === ''
      ? undefined
      : rawActive === true || rawActive === 'true' || rawActive === '1'
        ? true
        : rawActive === false || rawActive === 'false' || rawActive === '0'
          ? false
          : undefined;
  const filters: ExerciseFilters = {
    type: req.query.type as any,
    difficulty: req.query.difficulty as any,
    isActive,
    page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
  };
  const result = await listExercises(filters);
  res.json(successResponse('Exercises retrieved successfully', result));
};

export const updateExerciseController = async (req: AuthRequest, res: Response) => {
  const exercise = await updateExercise(req.params.id, req.body);
  res.json(successResponse('Exercise updated successfully', exercise));
};

export const deleteExerciseController = async (req: AuthRequest, res: Response) => {
  await deleteExercise(req.params.id);
  res.json(successResponse('Exercise deleted successfully'));
};

export const seedExercisesController = async (_req: AuthRequest, res: Response) => {
  await seedDefaultExercises();
  res.json(successResponse('Default exercises seeded successfully'));
};