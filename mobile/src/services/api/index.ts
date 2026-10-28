import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '@config';
import { ApiResponse } from '@types';
import { User, Exercise, Workout, AnalyticsSummary, WeeklyAnalytics, HeartRateAnalytics, FormAccuracyAnalytics } from '@types';

class ApiService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: config.api.baseUrl,
      timeout: config.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      async (request: InternalAxiosRequestConfig) => {
        if (this.token) {
          request.headers.Authorization = `Bearer ${this.token}`;
        }
        return request;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.clearAuth();
        }
        if (axios.isAxiosError(error) && !error.response) {
          // No response received: backend unreachable, wrong URL, or offline.
          return Promise.reject(
            new Error(
              'Network error: could not reach the server. Make sure this phone is on the same Wi-Fi as your computer and the backend is running.'
            )
          );
        }
        return Promise.reject(error);
      }
    );
  }

  async initialize(): Promise<void> {
    this.token = await AsyncStorage.getItem(config.storage.tokenKey);
  }

  setToken(token: string | null): void {
    this.token = token;
    if (token) {
      AsyncStorage.setItem(config.storage.tokenKey, token);
    } else {
      AsyncStorage.removeItem(config.storage.tokenKey);
    }
  }

  async clearAuth(): Promise<void> {
    this.token = null;
    await AsyncStorage.multiRemove([
      config.storage.tokenKey,
      config.storage.userKey,
    ]);
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private handleResponse<T>(response: { data: ApiResponse<T> }): T {
    if (!response.data.success) {
      throw new Error(response.data.message || 'API request failed');
    }
    return response.data.data as T;
  }

  async register(data: { name: string; email: string; password: string; confirmPassword: string }): Promise<{ accessToken: string; user: User }> {
    const response = await this.client.post<ApiResponse<{ accessToken: string; user: User }>>('/auth/register', data);
    return this.handleResponse(response);
  }

  async login(email: string, password: string): Promise<{ accessToken: string; user: User }> {
    const response = await this.client.post<ApiResponse<{ accessToken: string; user: User }>>('/auth/login', { email, password });
    return this.handleResponse(response);
  }

  async getProfile(): Promise<User> {
    const response = await this.client.get<ApiResponse<User>>('/auth/profile');
    return this.handleResponse(response);
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await this.client.put<ApiResponse<User>>('/auth/profile', data);
    return this.handleResponse(response);
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await this.client.put<ApiResponse<void>>('/auth/password', { currentPassword, newPassword });
    return this.handleResponse(response);
  }

  async getExercises(params?: { type?: string; difficulty?: string; isActive?: boolean; page?: number; limit?: number }): Promise<{ exercises: Exercise[]; total: number; page: number; limit: number; totalPages: number }> {
    const response = await this.client.get<ApiResponse<{ exercises: Exercise[]; total: number; page: number; limit: number; totalPages: number }>>('/exercises', { params });
    return this.handleResponse(response);
  }

  async getExerciseByType(type: string): Promise<Exercise> {
    const response = await this.client.get<ApiResponse<Exercise>>(`/exercises/type/${type}`);
    return this.handleResponse(response);
  }

  async createWorkout(data: Record<string, unknown>): Promise<Workout> {
    const response = await this.client.post<ApiResponse<Workout>>('/workouts', data);
    return this.handleResponse(response);
  }

  async getWorkouts(params?: { exerciseType?: string; startDate?: string; endDate?: string; page?: number; limit?: number }): Promise<{ workouts: Workout[]; total: number; page: number; limit: number; totalPages: number }> {
    const response = await this.client.get<ApiResponse<{ workouts: Workout[]; total: number; page: number; limit: number; totalPages: number }>>('/workouts', { params });
    return this.handleResponse(response);
  }

  async getWorkout(id: string): Promise<Workout> {
    const response = await this.client.get<ApiResponse<Workout>>(`/workouts/${id}`);
    return this.handleResponse(response);
  }

  async deleteWorkout(id: string): Promise<void> {
    const response = await this.client.delete<ApiResponse<void>>(`/workouts/${id}`);
    return this.handleResponse(response);
  }

  async getSummary(): Promise<AnalyticsSummary> {
    const response = await this.client.get<ApiResponse<AnalyticsSummary>>('/workouts/summary');
    return this.handleResponse(response);
  }

  async getWeeklyAnalytics(weeks?: number): Promise<WeeklyAnalytics[]> {
    const response = await this.client.get<ApiResponse<WeeklyAnalytics[]>>('/workouts/analytics/weekly', { params: { weeks } });
    return this.handleResponse(response);
  }

  async getHeartRateAnalytics(days?: number): Promise<HeartRateAnalytics[]> {
    const response = await this.client.get<ApiResponse<HeartRateAnalytics[]>>('/workouts/analytics/heart-rate', { params: { days } });
    return this.handleResponse(response);
  }

  async getFormAccuracyAnalytics(days?: number): Promise<FormAccuracyAnalytics[]> {
    const response = await this.client.get<ApiResponse<FormAccuracyAnalytics[]>>('/workouts/analytics/form-accuracy', { params: { days } });
    return this.handleResponse(response);
  }

  async syncWorkouts(): Promise<{ syncedCount: number }> {
    const response = await this.client.post<ApiResponse<{ syncedCount: number }>>('/workouts/sync');
    return this.handleResponse(response);
  }

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const response = await this.client.get<ApiResponse<AnalyticsSummary>>('/analytics/summary');
    return this.handleResponse(response);
  }

  async getWeeklyAnalyticsDirect(weeks?: number): Promise<WeeklyAnalytics[]> {
    const response = await this.client.get<ApiResponse<WeeklyAnalytics[]>>('/analytics/weekly', { params: { weeks } });
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();