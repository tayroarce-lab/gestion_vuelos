import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { flightsApi } from '../../api/flights.api';
import { reservationsApi } from '../../api/reservations.api';
import type { Flight, Reservation } from '../../types/api.types';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/common/Navbar';
import HeroVideo from '../../components/common/HeroVideo';
import Footer from '../../components/common/Footer';
import FlightCard from '../../components/flights/FlightCard';
import ReservationCard from '../../components/reservations/ReservationCard';
import SkeletonCard from '../../components/common/SkeletonCard';
import ErrorState from '../../components/common/ErrorState';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [flights, setFlights] = useState<Flight[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  
  const [loadingFlights, setLoadingFlights] = useState(true);
  const [loadingRes, setLoadingRes] = useState(true);
  
  const [errorFlights, setErrorFlights] = useState(false);
  const [errorRes, setErrorRes] = useState(false);

  const fetchDashboardData = () => {
    setLoadingFlights(true);
    setLoadingRes(true);
    setErrorFlights(false);
    setErrorRes(false);

    // Fetch reservas (solo tomamos las 3 más recientes)
    reservationsApi.getMine()
      .then(res => setReservations(res.data.slice(0, 3)))
      .catch(() => setErrorRes(true))
      .finally(() => setLoadingRes(false));

    // Fetch vuelos (solo tomamos 4 programados recientes)
    flightsApi.getAll()
      .then(res => {
        const available = res.data.filter(f => f.status === 'scheduled' || f.status === 'delayed');
        setFlights(available.slice(0, 4));
      })
      .catch(() => setErrorFlights(false)) // No bloqueamos la UI por fallar vuelos
      .finally(() => setLoadingFlights(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Formato simple de fecha
  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <>
      <Navbar />
      <HeroVideo 
        onExploreClick={() => {
          document.querySelector('.page-content')?.scrollIntoView({ behavior: 'smooth' });
        }} 
      />
      <div className="container page-content">
        <div className="page-header" style={{ marginBottom: '48px' }}>
          <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{today}</span>
          <h1>Bienvenido de nuevo, {user?.name.split(' ')[0]} 👋</h1>
        </div>

        {/* Sección: Mis últimas reservas */}
        <section style={{ marginBottom: '56px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px' }}>Mis últimas reservas</h2>
            {reservations.length > 0 && (
              <button className="btn btn-ghost" onClick={() => navigate('/reservations')} style={{ padding: '6px 12px' }}>
                Ver todas <ArrowRight size={16} />
              </button>
            )}
          </div>

          {loadingRes ? (
            <div className="grid-3">
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : errorRes ? (
            <ErrorState message="No pudimos cargar tus reservas recientes." onRetry={fetchDashboardData} />
          ) : reservations.length === 0 ? (
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '32px' }}>
              <div style={{ background: 'var(--color-primary-light)', padding: '16px', borderRadius: '50%' }}>
                <BookOpen size={32} color="var(--color-primary)" />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0' }}>Aún no tienes reservas</h3>
                <p style={{ margin: '0 0 16px 0', color: 'var(--color-text-secondary)' }}>Tu próxima aventura te espera.</p>
                <button className="btn btn-primary" onClick={() => navigate('/flights')}>Explorar vuelos</button>
              </div>
            </div>
          ) : (
            <div className="grid-3">
              {reservations.map(res => (
                <ReservationCard 
                  key={res.id} 
                  reservation={res} 
                  onCancelSuccess={fetchDashboardData} 
                />
              ))}
            </div>
          )}
        </section>

        <div className="divider"></div>

        {/* Sección: Vuelos recomendados/recientes */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px' }}>Vuelos disponibles</h2>
          </div>

          {loadingFlights ? (
            <div className="grid-2">
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : errorFlights ? (
             <ErrorState message="No pudimos cargar los vuelos disponibles." />
          ) : (
            <>
              <div className="grid-2" style={{ marginBottom: '32px' }}>
                {flights.map(flight => (
                  <FlightCard key={flight.id} flight={flight} />
                ))}
              </div>
              <div style={{ textAlign: 'center' }}>
                <button className="btn btn-secondary" onClick={() => navigate('/flights')}>
                  Ver todos los vuelos
                </button>
              </div>
            </>
          )}
        </section>

      </div>
      <Footer />
    </>
  );
}
