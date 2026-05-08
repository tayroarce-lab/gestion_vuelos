import { api } from './client';
import type { ApiResponse, User } from '../types/api.types';

interface LoginCredentials { email: string; password: string; }
interface RegisterData { name: string; email: string; password: string; }

export const authApi = {
  login:    (credentials: LoginCredentials) =>
    api.post<User>('/auth/login', credentials),

  register: (data: RegisterData) =>
    api.post<User>('/auth/register', data),

  logout:   () =>
    api.post<null>('/auth/logout', {}),

  getMe:    () =>
    api.get<User>('/auth/me'),
};
