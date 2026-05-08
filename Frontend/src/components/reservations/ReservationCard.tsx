import { useState } from 'react';
import { PlaneTakeoff, Calendar, Users, XCircle } from 'lucide-react';
import type { Reservation } from '../../types/api.types';
import StatusBadge from '../common/StatusBadge';
import { formatDate, formatPrice } from '../../utils/formatters';
import ConfirmModal from '../common/ConfirmModal';
import { reservationsApi } from '../../api/reservations.api';
import { useToast } from '../../hooks/useToast';

interface ReservationCardProps {
  reservation: Reservation;
  onCancelSuccess: () => void;
  isAdmin?: boolean; // Si es true, muestra info del cliente
}

export default function ReservationCard({ reservation, onCancelSuccess, isAdmin = false }: ReservationCardProps) {
  const { add } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Parsear campos planos de la vista MySQL
  const flightNum = reservation.flight_number || reservation.flight?.flightNumber;
  const origin    = reservation.origin || reservation.flight?.origin;
  const dest      = reservation.destination || reservation.flight?.destination;
  const depTime   = reservation.departure_datetime || reservation.flight?.departureDatetime;
  const seats     = reservation.seats_reserved ?? reservation.seatsReserved;
  const total     = reservation.total_price ?? reservation.totalPrice;
  const resDate   = reservation.reservation_date ?? reservation.reservationDate;

  // Lógica de cancelación
  const canCancel = reservation.status !== 'cancelled' && depTime && new Date(depTime as string) > new Date();

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await reservationsApi.cancel(reservation.id);
      add('success', 'Reserva cancelada exitosamente');
      setIsModalOpen(false);
      onCancelSuccess(); // Notifica al padre para recargar/actualizar
    } catch (err: any) {
      add('error', err.message || 'Error al cancelar la reserva');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <div className="card" style={{ padding: '20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Vuelo {flightNum}
              {isAdmin && <span className="navbar-role-badge client" style={{ fontSize: '10px' }}>ID: {reservation.id}</span>}
            </h3>
            {isAdmin && (
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginTop: '4px' }}>
                Cliente: <strong>{reservation.client_name || reservation.user?.name}</strong>
              </span>
            )}
          </div>
          <StatusBadge status={reservation.status} />
        </div>

        {/* Info principal */}
        <div style={{ background: 'var(--color-bg)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontWeight: 600 }}>{origin}</span>
            <PlaneTakeoff size={16} color="var(--color-text-disabled)" />
            <span style={{ fontWeight: 600 }}>{dest}</span>
          </div>
          <div style={{ display: 'flex', gap: '24px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} />
              {formatDate(depTime as string)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={14} />
              {seats} asiento{seats !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Total pagado</span>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {formatPrice(total)}
            </span>
            <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-disabled)', marginTop: '4px' }}>
              Reservado el {formatDate(resDate as string)}
            </span>
          </div>

          {canCancel && (
            <button
              className="btn btn-ghost"
              style={{ color: 'var(--color-error)', borderColor: '#FECACA', padding: '6px 12px' }}
              onClick={() => setIsModalOpen(true)}
            >
              <XCircle size={16} />
              Cancelar reserva
            </button>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleCancel}
        title="Cancelar Reserva"
        message={`¿Estás seguro de cancelar ${isAdmin ? 'esta' : 'tu'} reserva en el vuelo ${flightNum}? Esta acción no se puede deshacer.`}
        confirmLabel="Sí, cancelar reserva"
        confirmVariant="danger"
        isLoading={isCancelling}
      />
    </>
  );
}
