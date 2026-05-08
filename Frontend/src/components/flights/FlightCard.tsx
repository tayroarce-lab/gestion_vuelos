import { Link } from 'react-router-dom';
import { PlaneTakeoff } from 'lucide-react';
import type { Flight } from '../../types/api.types';
import StatusBadge from '../common/StatusBadge';
import { formatDateShort, formatDuration, calcDuration, formatPrice } from '../../utils/formatters';

interface FlightCardProps {
  flight: Flight;
}

export default function FlightCard({ flight }: FlightCardProps) {
  // Manejador seguro para campos snake_case vs camelCase
  const flightNum = flight.flightNumber || flight.flight_number;
  const depTime   = flight.departureDatetime || flight.departure_datetime;
  const arrTime   = flight.arrivalDatetime || flight.arrival_datetime;
  const avail     = flight.availableSeats ?? flight.available_seats;
  const total     = flight.totalSeats ?? flight.total_seats;

  const duration = (depTime && arrTime) ? calcDuration(depTime, arrTime) : 0;
  const isSoldOut = avail === 0;

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>VUELO</span>
          <h3 style={{ margin: 0, fontSize: '18px' }}>{flightNum}</h3>
        </div>
        <StatusBadge status={flight.status} />
      </div>

      {/* Ruta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <h4 style={{ margin: 0, color: 'var(--color-primary)' }}>{flight.origin}</h4>
        <PlaneTakeoff size={18} color="var(--color-text-disabled)" />
        <h4 style={{ margin: 0, color: 'var(--color-primary)' }}>{flight.destination}</h4>
      </div>

      {/* Tiempos */}
      <div className="grid-3" style={{ gap: '12px', marginBottom: '24px', flex: 1 }}>
        <div>
          <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Salida</span>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{formatDateShort(depTime as string)}</span>
          <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            {new Date(depTime as string).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Llegada</span>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{formatDateShort(arrTime as string)}</span>
          <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            {new Date(arrTime as string).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Duración</span>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{formatDuration(duration)}</span>
        </div>
      </div>

      <div className="divider" style={{ margin: '0 0 20px 0' }}></div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Precio por asiento</span>
          <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-accent)' }}>
            {formatPrice(flight.price)}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: isSoldOut ? 'var(--color-error)' : 'var(--color-text-primary)' }}>
            {isSoldOut ? 'Agotado' : `${avail} disp.`}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>de {total} asientos</span>
        </div>
      </div>

      <Link
        to={`/flights/${flight.id}`}
        className="btn btn-secondary btn-full"
        style={{ textDecoration: 'none' }}
      >
        Ver vuelo
      </Link>
    </div>
  );
}
