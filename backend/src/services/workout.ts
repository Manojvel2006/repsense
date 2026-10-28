import { Workout, IWorkout } from '../models/Workout';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import mongoose from 'mongoose';

export interface WorkoutFilters {
  exerciseType?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface PaginatedWorkouts {
  workouts: IWorkout[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WorkoutSummary {
  totalWorkouts: number;
  totalReps: number;
  totalDuration: number;
  totalCalories: number;
  averageFormAccuracy: number;
}

export const createWorkout = async (
  userId: string,
  data: Partial<IWorkout>
): Promise<IWorkout> => {
  return Workout.create({ ...data, userId });
};

export const getWorkoutById = async (id: string, userId: string): Promise<IWorkout> => {
  const workout = await Workout.findOne({ _id: id, userId });
  if (!workout) {
    throw new NotFoundError('Workout not found', 'WORKOUT_NOT_FOUND');
  }
  return workout;
};

export const listWorkouts = async (
  userId: string,
  filters: WorkoutFilters
): Promise<PaginatedWorkouts> => {
  const { exerciseType, startDate, endDate, page = 1, limit = 20 } = filters;

  const query: Record<string, unknown> = { userId };
  if (exerciseType) query.exerciseType = exerciseType;
  if (startDate || endDate) {
    query.startTime = {};
    if (startDate) (query.startTime as Record<string, Date>).$gte = startDate;
    if (endDate) (query.startTime as Record<string, Date>).$lte = endDate;
  }

  const [workouts, total] = await Promise.all([
    Workout.find(query)
      .sort({ startTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Workout.countDocuments(query),
  ]);

  return {
    workouts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const deleteWorkout = async (id: string, userId: string): Promise<void> => {
  const workout = await Workout.findOneAndDelete({ _id: id, userId });
  if (!workout) {
    throw new NotFoundError('Workout not found', 'WORKOUT_NOT_FOUND');
  }
};

export const getWorkoutSummary = async (userId: string): Promise<WorkoutSummary> => {
  const result = await Workout.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalWorkouts: { $sum: 1 },
        totalReps: { $sum: '$totalReps' },
        totalDuration: { $sum: '$duration' },
        totalCalories: { $sum: '$estimatedCalories' },
        averageFormAccuracy: { $avg: '$formAccuracy' },
      },
    },
  ]);

  if (result.length === 0) {
    return {
      totalWorkouts: 0,
      totalReps: 0,
      totalDuration: 0,
      totalCalories: 0,
      averageFormAccuracy: 0,
    };
  }

  const summary = result[0];
  return {
    totalWorkouts: summary.totalWorkouts,
    totalReps: summary.totalReps,
    totalDuration: summary.totalDuration,
    totalCalories: summary.totalCalories,
    averageFormAccuracy: Math.round(summary.averageFormAccuracy * 10) / 10,
  };
};

export const getWeeklyAnalytics = async (userId: string, weeks: number = 4) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - weeks * 7);

  const workouts = await Workout.find({
    userId,
    startTime: { $gte: startDate },
  }).sort({ startTime: 1 });

  const weeklyData: Record<string, { reps: number; calories: number; duration: number; count: number }> = {};

  for (const workout of workouts) {
    const weekStart = new Date(workout.startTime);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const key = weekStart.toISOString().split('T')[0];

    if (!weeklyData[key]) {
      weeklyData[key] = { reps: 0, calories: 0, duration: 0, count: 0 };
    }
    weeklyData[key].reps += workout.totalReps;
    weeklyData[key].calories += workout.estimatedCalories;
    weeklyData[key].duration += workout.duration;
    weeklyData[key].count += 1;
  }

  return Object.entries(weeklyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, data]) => ({
      week,
      totalReps: data.reps,
      totalCalories: data.calories,
      totalDuration: data.duration,
      workoutCount: data.count,
      averageFormAccuracy: 0,
    }));
};

export const getHeartRateAnalytics = async (userId: string, days: number = 7) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const workouts = await Workout.find({
    userId,
    startTime: { $gte: startDate },
    averageHeartRate: { $exists: true, $ne: null },
  }).sort({ startTime: 1 });

  return workouts.map(w => ({
    date: w.startTime.toISOString().split('T')[0],
    averageHeartRate: w.averageHeartRate,
    maxHeartRate: w.maxHeartRate,
  }));
};

export const getFormAccuracyAnalytics = async (userId: string, days: number = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const workouts = await Workout.find({
    userId,
    startTime: { $gte: startDate },
  }).sort({ startTime: 1 });

  return workouts.map(w => ({
    date: w.startTime.toISOString().split('T')[0],
    formAccuracy: w.formAccuracy,
    totalReps: w.totalReps,
    correctReps: w.correctReps,
  }));
};

export const markWorkoutSynced = async (id: string): Promise<void> => {
  await Workout.findByIdAndUpdate(id, { synced: true });
};

export const getUnsyncedWorkouts = async (userId: string): Promise<IWorkout[]> => {
  return Workout.find({ userId, synced: false }).sort({ startTime: 1 });
};