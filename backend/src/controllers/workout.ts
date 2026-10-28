import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { successResponse } from '../utils/apiResponse';
import {
  createWorkout,
  getWorkoutById,
  listWorkouts,
  deleteWorkout,
  getWorkoutSummary,
  getWeeklyAnalytics,
  getHeartRateAnalytics,
  getFormAccuracyAnalytics,
  markWorkoutSynced,
  getUnsyncedWorkouts,
  WorkoutFilters,
} from '../services/workout';

export const createWorkoutController = async (req: AuthRequest, res: Response) => {
  const workout = await createWorkout(req.userId!, req.body);
  res.status(201).json(successResponse('Workout created successfully', workout));
};

export const getWorkoutController = async (req: AuthRequest, res: Response) => {
  const workout = await getWorkoutById(req.params.id, req.userId!);
  res.json(successResponse('Workout retrieved successfully', workout));
};

export const listWorkoutsController = async (req: AuthRequest, res: Response) => {
  const filters: WorkoutFilters = {
    exerciseType: req.query.exerciseType as string,
    startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
    endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
  };
  const result = await listWorkouts(req.userId!, filters);
  res.json(successResponse('Workouts retrieved successfully', result));
};

export const deleteWorkoutController = async (req: AuthRequest, res: Response) => {
  await deleteWorkout(req.params.id, req.userId!);
  res.json(successResponse('Workout deleted successfully'));
};

export const getSummaryController = async (req: AuthRequest, res: Response) => {
  const summary = await getWorkoutSummary(req.userId!);
  res.json(successResponse('Summary retrieved successfully', summary));
};

export const getWeeklyAnalyticsController = async (req: AuthRequest, res: Response) => {
  const weeks = req.query.weeks ? parseInt(req.query.weeks as string, 10) : 4;
  const analytics = await getWeeklyAnalytics(req.userId!, weeks);
  res.json(successResponse('Weekly analytics retrieved successfully', analytics));
};

export const getHeartRateAnalyticsController = async (req: AuthRequest, res: Response) => {
  const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;
  const analytics = await getHeartRateAnalytics(req.userId!, days);
  res.json(successResponse('Heart rate analytics retrieved successfully', analytics));
};

export const getFormAccuracyAnalyticsController = async (req: AuthRequest, res: Response) => {
  const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
  const analytics = await getFormAccuracyAnalytics(req.userId!, days);
  res.json(successResponse('Form accuracy analytics retrieved successfully', analytics));
};

export const syncWorkoutsController = async (req: AuthRequest, res: Response) => {
  const unsynced = await getUnsyncedWorkouts(req.userId!);
  for (const workout of unsynced) {
    await markWorkoutSynced(workout._id.toString());
  }
  res.json(successResponse('Workouts synced successfully', { syncedCount: unsynced.length }));
};