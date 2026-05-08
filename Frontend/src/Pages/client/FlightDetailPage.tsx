import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { PlaneTakeoff, Clock, Calendar, Info, Users } from 'lucide-react';
import { flightsApi } from '../../api/flights.api';
import { reservationsApi } from '../../api/reservations.api';
import type { Flight } from '../../types/api.types';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatDate, formatDuration, calcDuration, formatPrice } from '../../utils/formatters';
import Navbar from '../../components/common/Navbar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function FlightDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { add } = useToast();

  const [flight, setFlight] = useState<Flight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const [seatsToReserve, setSeatsToReserve] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReserving, setIsReserving] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    flightsApi.getById(Number(id))
      .then(res => setFlight(res.data))
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <><Navbar /><LoadingSpinner variant="fullPage" /></>;
  if (error || !flight) return <><Navbar /><div className="page-content"><ErrorState message="No se encontró el vuelo" onRetry={() => navigate('/flights')} /></div></>;

  const flightNum = flight.flightNumber || flight.flight_number;
  const depTime   = flight.departureDatetime || flight.departure_datetime;
  const arrTime   = flight.arrivalDatetime || flight.arrival_datetime;
  const avail     = flight.availableSeats ?? flight.available_seats;
  const total     = flight.totalSeats ?? flight.total_seats;
  const priceNum  = typeof flight.price === 'string' ? parseFloat(flight.price) : flight.price;

  const duration  = (depTime && arrTime) ? calcDuration(depTime, arrTime) : 0;
  const isSoldOut = avail === 0;
  const totalPrice = priceNum * seatsToReserve;

  // Manejo de cambios en el input de asientos
  const handleSeatsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;
    const max = Math.min(9, avail as number);
    if (val < 1) val = 1;
    if (val > max) val = max;
    setSeatsToReserve(val);
  };

  const handleReserveClick = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    setIsModalOpen(true);
  };

  const executeReservation = async () => {
    setIsReserving(true);
    try {
      await reservationsApi.create({ flightId: flight.id, seatsReserved: seatsToReserve });
      add('success', '¡Reserva confirmada exitosamente!');
      setIsModalOpen(false);
      navigate('/reservations');
    } catch (err: any) {
      add('error', err.message || 'Error al procesar la reserva');
      setIsModalOpen(false);
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container page-content">
        <div className="breadcrumb">
          <Link to="/flights">Vuelos disponibles</Link>
          <span className="separator">/</span>
          <span className="current">{flightNum}</span>
        </div>

        <div className="grid-3" style={{ marginTop: '24px' }}>
          
          {/* Detalles del vuelo (Col 1 y 2) */}
          <div style={{ gridColumn: 'span 2' }}>
            <div className="card" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  Vuelo {flightNum}
                  <StatusBadge status={flight.status} />
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                <h2 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '36px' }}>{flight.origin}</h2>
                <PlaneTakeoff size={32} color="var(--color-text-disabled)" />
                <h2 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '36px' }}>{flight.destination}</h2>
              </div>

              <div className="grid-2" style={{ gap: '32px', marginBottom: '32px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                    <Calendar size={18} />
                    <span style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '13px' }}>Salida</span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    {formatDate(depTime as string)}
                  </div>
                </div>
                
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                    <Calendar size={18} />
                    <span style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '13px' }}>Llegada</span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    {formatDate(arrTime as string)}
                  </div>
                </div>
              </div>

              <div className="divider"></div>

              <div className="grid-3">
                <div>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Duración</span>
                  <span style={{ fontSize: '16px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} /> {formatDuration(duration)}
                  </span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Avión</span>
                  <span style={{ fontSize: '16px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={16} /> {total} pasajeros max
                  </span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Precio unitario</span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-accent)' }}>
                    {formatPrice(priceNum)}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Panel de Reserva (Col 3) */}
          <div style={{ alignSelf: 'start', position: 'sticky', top: '100px' }}>
            <div className="card" style={{ borderTop: '4px solid var(--color-primary)' }}>
              <h3 style={{ marginBottom: '8px' }}>Reservar este vuelo</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: isSoldOut ? 'var(--color-error)' : 'var(--color-success)', fontSize: '14px', fontWeight: 500 }}>
                <Info size={16} />
                {isSoldOut ? 'No hay asientos disponibles' : `${avail} asientos disponibles`}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="seats">Cantidad de pasajeros (max 9)</label>
                <input
                  id="seats"
                  type="number"
                  className="form-input"
                  min="1"
                  max={Math.min(9, avail as number)}
                  value={seatsToReserve}
                  onChange={handleSeatsChange}
                  disabled={isSoldOut || (user?.role === 'admin')}
                />
              </div>

              <div style={{ background: 'var(--color-bg)', padding: '16px', borderRadius: 'var(--radius-md)', margin: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Total ({seatsToReserve} {seatsToReserve === 1 ? 'pasajero' : 'pasajeros'}):</span>
                <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <button
                className="btn btn-primary btn-full btn-lg"
                onClick={handleReserveClick}
                disabled={isSoldOut || (user?.role === 'admin')}
              >
                {!isAuthenticated 
                  ? 'Inicia sesión para reservar' 
                  : user?.role === 'admin' 
                    ? 'Los admins no pueden reservar' 
                    : isSoldOut 
                      ? 'Vuelo agotado' 
                      : 'Reservar ahora'}
              </button>
            </div>
          </div>

        </div>
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={executeReservation}
        title="Confirmar reserva"
        message={`Estás a punto de reservar ${seatsToReserve} asiento(s) en el vuelo ${flightNum} de ${flight.origin} a ${flight.destination}. El cargo total será de ${formatPrice(totalPrice)}.`}
        confirmLabel="Confirmar y reservar"
        isLoading={isReserving}
      />
    </>
  );
}
