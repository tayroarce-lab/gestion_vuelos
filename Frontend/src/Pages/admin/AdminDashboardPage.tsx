import { useState, useEffect } from 'react';
import { PlaneTakeoff, BookOpen, CheckCircle, DollarSign } from 'lucide-react';
import { flightsApi } from '../../api/flights.api';
import { reservationsApi } from '../../api/reservations.api';
import type { Flight, Reservation } from '../../types/api.types';
import Navbar from '../../components/common/Navbar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import { formatDateShort, formatPrice } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';

export default function AdminDashboardPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const [flightsRes, resRes] = await Promise.all([
        flightsApi.getAll(),
        reservationsApi.getAll()
      ]);
      setFlights(flightsRes.data);
      setReservations(resRes.data);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (isLoading) return <><Navbar /><LoadingSpinner variant="fullPage" /></>;
  if (error) return <><Navbar /><div className="page-content"><ErrorState message="Error cargando métricas" onRetry={fetchData} /></div></>;

  // Calcular métricas
  const activeFlights = flights.filter(f => f.status === 'scheduled').length;
  const totalRes = reservations.length;
  const confirmedRes = reservations.filter(r => r.status === 'confirmed').length;
  
  const totalIncome = reservations
    .filter(r => r.status === 'confirmed')
    .reduce((sum, r) => sum + (typeof r.total_price === 'string' ? parseFloat(r.total_price) : Number(r.totalPrice || r.total_price || 0)), 0);

  // Tablas resumen
  const latestFlights = [...flights]
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, 5);

  const latestReservations = [...reservations]
    .sort((a, b) => new Date(b.reservation_date || b.reservationDate!).getTime() - new Date(a.reservation_date || a.reservationDate!).getTime())
    .slice(0, 5);

  return (
    <>
      <Navbar />
      <div className="container page-content">
        <div className="page-header">
          <h1>Panel de Administración</h1>
          <p>Visión general del sistema SkyDesk</p>
        </div>

        <div className="grid-4" style={{ marginBottom: '40px' }}>
          <div className="metric-card">
            <div className="metric-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              <PlaneTakeoff size={20} />
            </div>
            <span className="metric-label">Vuelos Programados</span>
            <span className="metric-value">{activeFlights}</span>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#F3E8FF', color: '#9333EA' }}>
              <BookOpen size={20} />
            </div>
            <span className="metric-label">Total Reservas</span>
            <span className="metric-value">{totalRes}</span>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
              <CheckCircle size={20} />
            </div>
            <span className="metric-label">Reservas Confirmadas</span>
            <span className="metric-value">{confirmedRes}</span>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
              <DollarSign size={20} />
            </div>
            <span className="metric-label">Ingresos Totales</span>
            <span className="metric-value" style={{ color: '#D97706' }}>{formatPrice(totalIncome)}</span>
          </div>
        </div>

        <div className="grid-2">
          {/* Tabla Vuelos Recientes */}
          <div className="card" style={{ padding: '24px 0 0 0', overflow: 'hidden' }}>
            <h3 style={{ padding: '0 24px 16px 24px', fontSize: '18px' }}>Últimos vuelos creados</h3>
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Ruta</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {latestFlights.map(f => (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 600 }}>{f.flightNumber || f.flight_number}</td>
                      <td style={{ fontSize: '13px' }}>{f.origin} → {f.destination}</td>
                      <td><StatusBadge status={f.status} /></td>
                    </tr>
                  ))}
                  {latestFlights.length === 0 && (
                    <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Sin datos</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla Reservas Recientes */}
          <div className="card" style={{ padding: '24px 0 0 0', overflow: 'hidden' }}>
            <h3 style={{ padding: '0 24px 16px 24px', fontSize: '18px' }}>Últimas reservas recibidas</h3>
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Vuelo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {latestReservations.map(r => (
                    <tr key={r.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{r.client_name || r.user?.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{formatDateShort(r.reservation_date || r.reservationDate!)}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{r.flight_number || r.flight?.flightNumber}</td>
                      <td><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                  {latestReservations.length === 0 && (
                    <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Sin datos</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
