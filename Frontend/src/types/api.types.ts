// ── Tipos compartidos de la API ──────────────────────────────────────────────

export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
  errors: { field: string; message: string }[] | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'client';
  isActive: number;
  createdAt?: string;
}

export interface Flight {
  id: number;
  flightNumber: string;
  flight_number?: string;
  origin: string;
  destination: string;
  departureDatetime: string;
  departure_datetime?: string;
  arrivalDatetime: string;
  arrival_datetime?: string;
  price: number | string;
  totalSeats: number;
  total_seats?: number;
  availableSeats: number;
  available_seats?: number;
  status: 'scheduled' | 'delayed' | 'cancelled' | 'completed';
  createdBy?: number;
  created_by?: number;
  creator?: { id: number; name: string; email: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface Reservation {
  id: number;
  userId?: number;
  user_id?: number;
  flightId?: number;
  flight_id?: number;
  seatsReserved: number;
  seats_reserved?: number;
  totalPrice: number | string;
  total_price?: number | string;
  status: 'pending' | 'confirmed' | 'cancelled';
  reservationDate?: string;
  reservation_date?: string;
  createdAt?: string;
  // Campos extra del SP/vista
  flight?: Flight;
  user?: User;
  // Campos planos de la vista sp_get_user_reservations
  flight_number?: string;
  origin?: string;
  destination?: string;
  departure_datetime?: string;
  arrival_datetime?: string;
  price?: number | string;
  client_name?: string;
  client_email?: string;
  // Campos de vw_reservations_detail
  route?: string;
}

export type FlightStatus = Flight['status'];
export type ReservationStatus = Reservation['status'];
