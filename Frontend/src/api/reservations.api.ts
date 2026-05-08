import { api } from './client';
import type { Reservation } from '../types/api.types';

export const reservationsApi = {
  getMine:  () =>
    api.get<Reservation[]>('/reservations'),

  getAll:   () =>
    api.get<Reservation[]>('/reservations/all'),

  create:   (data: { flightId: number; seatIds: number[] }) =>
    api.post<{ reservationId: number; message: string }>('/reservations', data),

  cancel:   (id: number) =>
    api.put<null>(`/reservations/${id}/cancel`, {}),
};
