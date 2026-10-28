import { z } from 'zod';

export const createWorkoutSchema = z.object({
  body: z.object({
    exerciseType: z.string().min(1, 'Exercise type is required'),
    startTime: z.string().datetime({ offset: true }),
    endTime: z.string().datetime({ offset: true }),
    duration: z.number().int().positive('Duration must be positive'),
    totalReps: z.number().int().min(0).default(0),
    correctReps: z.number().int().min(0).default(0),
    partialReps: z.number().int().min(0).default(0),
    fastReps: z.number().int().min(0).default(0),
    incorrectReps: z.number().int().min(0).default(0),
    formAccuracy: z.number().min(0).max(100).default(0),
    averageHeartRate: z.number().min(0).max(300).optional(),
    maxHeartRate: z.number().min(0).max(300).optional(),
    averageSpO2: z.number().min(0).max(100).optional(),
    estimatedCalories: z.number().min(0).default(0),
  }).refine(data => new Date(data.endTime) > new Date(data.startTime), {
    message: 'End time must be after start time',
    path: ['endTime'],
  }),
});

export const getWorkoutSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid workout ID'),
  }),
});

export const listWorkoutsSchema = z.object({
  query: z.object({
    exerciseType: z.string().optional(),
    startDate: z.string().datetime({ offset: true }).optional(),
    endDate: z.string().datetime({ offset: true }).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
});

export const deleteWorkoutSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid workout ID'),
  }),
});