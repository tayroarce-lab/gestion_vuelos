import { api } from './client';
import type { Flight } from '../types/api.types';

export interface CreateFlightData {
  flightNumber: string;
  origin: string;
  destination: string;
  departureDatetime: string;
  arrivalDatetime: string;
  price: number;
  totalSeats: number;
}

export const flightsApi = {
  getAll:  () =>
    api.get<Flight[]>('/flights'),

  getById: (id: number) =>
    api.get<Flight>(`/flights/${id}`),

  create:  (data: CreateFlightData) =>
    api.post<Flight>('/flights', data),

  update:  (id: number, data: Partial<CreateFlightData> & { status?: string }) =>
    api.put<Flight>(`/flights/${id}`, data),

  cancel:  (id: number) =>
    api.delete<null>(`/flights/${id}`),
    
  getSeats: (id: number) =>
    api.get<{
      airplane: string;
      rows: number;
      colsPerRow: number;
      seats: {
        id: number;
        row: number;
        column: string;
        type: string;
        isTaken: boolean;
      }[];
    }>(`/flights/${id}/seats`),
};
