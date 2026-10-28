export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: unknown;
  };
}

export const successResponse = <T>(
  message: string,
  data?: T
): ApiResponse<T> => ({
  success: true,
  message,
  data,
});

export const errorResponse = (
  message: string,
  code: string,
  details?: unknown
): ApiResponse => ({
  success: false,
  message,
  error: { code, details },
});