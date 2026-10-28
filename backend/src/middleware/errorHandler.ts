import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { errorResponse } from '../utils/apiResponse';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json(
      errorResponse(err.message, err.code)
    );
    return;
  }

  if (err.name === 'ValidationError') {
    res.status(400).json(
      errorResponse('Validation failed', 'VALIDATION_ERROR', err.message)
    );
    return;
  }

  if (err.name === 'CastError') {
    res.status(400).json(
      errorResponse('Invalid ID format', 'INVALID_ID')
    );
    return;
  }

  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    res.status(409).json(
      errorResponse('Duplicate field value', 'DUPLICATE_FIELD')
    );
    return;
  }

  if (err.name === 'JsonWebTokenError') {
    res.status(401).json(
      errorResponse('Invalid token', 'INVALID_TOKEN')
    );
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json(
      errorResponse('Token expired', 'TOKEN_EXPIRED')
    );
    return;
  }

  res.status(500).json(
    errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR')
  );
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json(
    errorResponse('Route not found', 'ROUTE_NOT_FOUND')
  );
};