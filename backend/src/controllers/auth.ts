import { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { AuthRequest } from '../middleware/auth';
import { successResponse } from '../utils/apiResponse';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
} from '../services/auth';

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, password } = req.body;
  const result = await registerUser(name, email, password);
  res.status(201).json(successResponse('Registration successful', result));
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;
  const result = await loginUser(email, password);
  res.json(successResponse('Login successful', result));
});

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await getUserProfile(req.userId!);
  res.json(successResponse('Profile retrieved successfully', user));
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await updateUserProfile(req.userId!, req.body);
  res.json(successResponse('Profile updated successfully', user));
});

export const updatePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  await changePassword(req.userId!, currentPassword, newPassword);
  res.json(successResponse('Password updated successfully'));
});