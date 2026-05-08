import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from './ProtectedRoute';

// Auth
import LoginPage    from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Client
import DashboardPage     from '../pages/client/DashboardPage';
import FlightsPage       from '../pages/client/FlightsPage';
import FlightDetailPage  from '../Pages/client/FlightDetailNew';
import ReservationsPage  from '../pages/client/ReservationsPage';

// Admin
import AdminDashboardPage    from '../pages/admin/AdminDashboardPage';
import AdminFlightsPage      from '../pages/admin/AdminFlightsPage';
import AdminFlightFormPage   from '../pages/admin/AdminFlightFormPage';
import AdminReservationsPage from '../pages/admin/AdminReservationsPage';

// System
import UnauthorizedPage from '../pages/UnauthorizedPage';
import NotFoundPage     from '../pages/NotFoundPage';

function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/flights" replace />;
  return user?.role === 'admin'
    ? <Navigate to="/admin/dashboard" replace />
    : <Navigate to="/dashboard" replace />;
}

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    return user?.role === 'admin'
      ? <Navigate to="/admin/dashboard" replace />
      : <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export default function AppRouter() {
  return (
    <Routes>
      {/* ── Raíz ── */}
      <Route path="/" element={<RootRedirect />} />

      {/* ── Auth (redirige si ya autenticado) ── */}
      <Route path="/login"    element={<AuthRedirect><LoginPage /></AuthRedirect>} />
      <Route path="/register" element={<AuthRedirect><RegisterPage /></AuthRedirect>} />

      {/* ── Público ── */}
      <Route path="/flights"    element={<FlightsPage />} />
      <Route path="/flights/:id" element={<FlightDetailPage />} />

      {/* ── Área cliente ── */}
      <Route path="/dashboard" element={
        <ProtectedRoute role="client"><DashboardPage /></ProtectedRoute>
      } />
      <Route path="/reservations" element={
        <ProtectedRoute role="client"><ReservationsPage /></ProtectedRoute>
      } />

      {/* ── Área admin ── */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute role="admin"><AdminDashboardPage /></ProtectedRoute>
      } />
      <Route path="/admin/flights" element={
        <ProtectedRoute role="admin"><AdminFlightsPage /></ProtectedRoute>
      } />
      <Route path="/admin/flights/new" element={
        <ProtectedRoute role="admin"><AdminFlightFormPage /></ProtectedRoute>
      } />
      <Route path="/admin/flights/:id/edit" element={
        <ProtectedRoute role="admin"><AdminFlightFormPage /></ProtectedRoute>
      } />
      <Route path="/admin/reservations" element={
        <ProtectedRoute role="admin"><AdminReservationsPage /></ProtectedRoute>
      } />

      {/* ── Sistema ── */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*"             element={<NotFoundPage />} />
    </Routes>
  );
}
