import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50).optional(),
    age: z.number().int().min(13).max(120).optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    height: z.number().min(50).max(300).optional(),
    weight: z.number().min(20).max(500).optional(),
    fitnessGoal: z.string().max(200).optional(),
  }),
});