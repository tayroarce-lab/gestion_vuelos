import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { reservationsApi } from '../../api/reservations.api';
import type { Reservation } from '../../types/api.types';
import Navbar from '../../components/common/Navbar';
import ReservationCard from '../../components/reservations/ReservationCard';
import SkeletonCard from '../../components/common/SkeletonCard';
import ErrorState from '../../components/common/ErrorState';

export default function ReservationsPage() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchReservations = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await reservationsApi.getMine();
      setReservations(res.data);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container page-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1>Mis Reservas</h1>
            <p>Historial de tus próximos viajes y vuelos pasados</p>
          </div>
          {!isLoading && !error && (
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary)', background: 'var(--color-primary-light)', padding: '6px 12px', borderRadius: 'var(--radius-full)' }}>
              {reservations.length} {reservations.length === 1 ? 'reserva' : 'reservas'}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid-2">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <ErrorState message="No pudimos cargar tus reservas. Intenta de nuevo." onRetry={fetchReservations} />
        ) : reservations.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={48} className="empty-icon" />
            <h3>Aún no tienes reservas</h3>
            <p>Explora nuestros vuelos disponibles y planea tu próximo viaje.</p>
            <button className="btn btn-primary" onClick={() => navigate('/flights')}>
              Buscar vuelos
            </button>
          </div>
        ) : (
          <div className="grid-2">
            {reservations.map(res => (
              <ReservationCard 
                key={res.id} 
                reservation={res} 
                onCancelSuccess={fetchReservations} 
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
