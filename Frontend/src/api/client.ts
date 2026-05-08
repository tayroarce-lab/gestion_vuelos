import type { ApiResponse } from '../types/api.types';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

async function request<T = unknown>(
  method: string,
  endpoint: string,
  body: unknown = null
): Promise<ApiResponse<T>> {
  const options: RequestInit = {
    method,
    credentials: 'include',   // ← CRÍTICO: envía cookies httpOnly automáticamente
    headers: { 'Content-Type': 'application/json' },
  };

  if (body) options.body = JSON.stringify(body);

  const res = await fetch(API_BASE + endpoint, options);

  let data: ApiResponse<T>;
  try {
    data = await res.json();
  } catch {
    throw { success: false, message: 'Respuesta del servidor inválida', data: null, errors: null };
  }

  if (res.status === 401) {
    window.dispatchEvent(new Event('auth:expired'));
    throw data;
  }

  if (res.status === 403) {
    window.location.href = '/unauthorized';
    throw data;
  }

  if (res.status >= 500) {
    window.dispatchEvent(
      new CustomEvent('toast:error', { detail: 'Error del servidor, intenta más tarde' })
    );
    throw data;
  }

  if (!res.ok) throw data;

  return data;
}

export const api = {
  get:    <T = unknown>(endpoint: string)              => request<T>('GET',    endpoint),
  post:   <T = unknown>(endpoint: string, body: unknown) => request<T>('POST',   endpoint, body),
  put:    <T = unknown>(endpoint: string, body: unknown) => request<T>('PUT',    endpoint, body),
  delete: <T = unknown>(endpoint: string)              => request<T>('DELETE', endpoint),
};
