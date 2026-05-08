import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'admin' | 'client';
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // 1. Mientras verifica la cookie, muestra spinner full page
  if (isLoading) return <LoadingSpinner variant="fullPage" />;

  // 2. No autenticado → /login preservando la ruta actual
  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // 3. Role incorrecto → /unauthorized
  if (role && user?.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. OK → renderiza la página
  return <>{children}</>;
}
