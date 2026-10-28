import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User, IUser } from '../models/User';
import { UnauthorizedError, ConflictError, NotFoundError } from '../utils/errors';

export interface AuthTokens {
  accessToken: string;
  user: Omit<IUser, 'password'>;
}

const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });
};

const sanitizeUser = (user: IUser): Omit<IUser, 'password'> => {
  const { password, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
};

export const registerUser = async (
  name: string,
  email: string,
  password: string
): Promise<AuthTokens> => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError('Email already registered', 'EMAIL_EXISTS');
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id.toString());

  return {
    accessToken: token,
    user: sanitizeUser(user),
  };
};

export const loginUser = async (
  email: string,
  password: string
): Promise<AuthTokens> => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
  }

  const token = generateToken(user._id.toString());

  return {
    accessToken: token,
    user: sanitizeUser(user),
  };
};

export const getUserProfile = async (userId: string): Promise<Omit<IUser, 'password'>> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found', 'USER_NOT_FOUND');
  }
  return sanitizeUser(user);
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<Omit<IUser, 'password' | 'email' | 'createdAt' | 'updatedAt'>>
): Promise<Omit<IUser, 'password'>> => {
  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    throw new NotFoundError('User not found', 'USER_NOT_FOUND');
  }
  return sanitizeUser(user);
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new NotFoundError('User not found', 'USER_NOT_FOUND');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new UnauthorizedError('Current password is incorrect', 'INVALID_CURRENT_PASSWORD');
  }

  user.password = newPassword;
  await user.save();
};