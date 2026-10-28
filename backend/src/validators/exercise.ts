import { z } from 'zod';

export const exerciseTypeSchema = z.enum([
  'BICEP_CURL',
  'SQUAT',
  'PUSH_UP',
  'SHOULDER_PRESS',
  'LATERAL_RAISE',
  'TRICEP_EXTENSION',
]);

export const createExerciseSchema = z.object({
  body: z.object({
    type: exerciseTypeSchema,
    name: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    muscleGroups: z.array(z.string().min(1)).min(1),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    instructions: z.array(z.string()).optional(),
    formCues: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateExerciseSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().min(1).max(500).optional(),
    muscleGroups: z.array(z.string().min(1)).min(1).optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    instructions: z.array(z.string()).optional(),
    formCues: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid exercise ID'),
  }),
});

export const getExerciseSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid exercise ID'),
  }),
});

export const listExercisesSchema = z.object({
  query: z.object({
    type: exerciseTypeSchema.optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    // Express query params always arrive as strings (?isActive=true).
    // Accept "true"/"false", true/false, 1/0 and coerce to boolean.
    isActive: z
      .preprocess((v) => {
        if (v === undefined || v === '') return undefined;
        if (typeof v === 'boolean') return v;
        if (typeof v === 'string') {
          const s = v.toLowerCase().trim();
          if (s === 'true' || s === '1') return true;
          if (s === 'false' || s === '0') return false;
        }
        if (typeof v === 'number') {
          if (v === 1) return true;
          if (v === 0) return false;
        }
        return v;
      }, z.boolean().optional()),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
});