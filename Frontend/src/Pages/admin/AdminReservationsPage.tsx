import { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { reservationsApi } from '../../api/reservations.api';
import type { Reservation } from '../../types/api.types';
import Navbar from '../../components/common/Navbar';
import SkeletonTable from '../../components/common/SkeletonTable';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDateShort, formatPrice } from '../../utils/formatters';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useToast } from '../../hooks/useToast';

export default function AdminReservationsPage() {
  const { add } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filtros
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Cancelación
  const [resToCancel, setResToCancel] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Paginación
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const fetchReservations = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await reservationsApi.getAll();
      setReservations(res.data);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); }, []);

  const processedReservations = useMemo(() => {
    let result = [...reservations];

    if (statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r => {
        const clientName = (r.client_name || r.user?.name || '').toLowerCase();
        const clientEmail = (r.client_email || r.user?.email || '').toLowerCase();
        const flightNum = (r.flight_number || r.flight?.flightNumber || '').toLowerCase();
        return clientName.includes(q) || clientEmail.includes(q) || flightNum.includes(q);
      });
    }

    // Ordenar por fecha de reserva (las más nuevas primero)
    result.sort((a, b) => {
      const d1 = new Date(b.reservation_date || b.reservationDate!).getTime();
      const d2 = new Date(a.reservation_date || a.reservationDate!).getTime();
      return d1 - d2;
    });

    return result;
  }, [reservations, statusFilter, search]);

  const totalPages = Math.ceil(processedReservations.length / itemsPerPage);
  const paginatedRes = processedReservations.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => { setPage(1); }, [statusFilter, search]);

  const handleCancel = async () => {
    if (!resToCancel) return;
    setIsCancelling(true);
    try {
      await reservationsApi.cancel(resToCancel);
      add('success', 'Reserva cancelada exitosamente');
      await fetchReservations();
    } catch (err: any) {
      add('error', err.message || 'Error al cancelar la reserva');
    } finally {
      setIsCancelling(false);
      setResToCancel(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container page-content">
        <div className="page-header">
          <h1>Todas las Reservas</h1>
          <p>Supervisa las reservas de todos los clientes en tiempo real</p>
        </div>

        <div className="filters-bar">
          <div className="filter-group" style={{ flex: 2 }}>
            <label className="filter-label">Buscar</label>
            <div className="input-wrapper">
              <input
                type="text"
                className="form-input"
                placeholder="Cliente, email o vuelo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Search size={16} className="input-icon" />
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Estado de Reserva</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">Todas</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <SkeletonTable rows={10} columns={7} />
        ) : error ? (
          <ErrorState message="Error al cargar las reservas." onRetry={fetchReservations} />
        ) : processedReservations.length === 0 ? (
          <div className="empty-state card">
            <p>No se encontraron reservas que coincidan con la búsqueda.</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Vuelo</th>
                    <th>Ruta</th>
                    <th>Asientos</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'right' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRes.map(res => {
                    const clientName = res.client_name || res.user?.name;
                    const clientEmail = res.client_email || res.user?.email;
                    const flightNum = res.flight_number || res.flight?.flightNumber;
                    const route = res.route || (res.flight ? `${res.flight.origin} → ${res.flight.destination}` : '');
                    
                    const canCancel = res.status !== 'cancelled' && 
                                      res.departure_datetime && 
                                      new Date(res.departure_datetime) > new Date();

                    return (
                      <tr key={res.id}>
                        <td style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>#{res.id}</td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{clientName}</div>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{clientEmail}</div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{flightNum}</td>
                        <td style={{ fontSize: '13px' }}>{route}</td>
                        <td>{res.seats_reserved ?? res.seatsReserved}</td>
                        <td style={{ fontWeight: 600 }}>{formatPrice(res.total_price ?? res.totalPrice)}</td>
                        <td><StatusBadge status={res.status} /></td>
                        <td style={{ textAlign: 'right' }}>
                          {canCancel ? (
                            <button 
                              className="btn btn-ghost btn-sm" 
                              style={{ color: 'var(--color-error)', padding: '4px 8px' }}
                              onClick={() => setResToCancel(res.id)}
                            >
                              Cancelar
                            </button>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--color-text-disabled)' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button className="btn btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Ant.</button>
                <span className="pagination-info">Pág. {page} de {totalPages}</span>
                <button className="btn btn-ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Sig.</button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={resToCancel !== null}
        onClose={() => setResToCancel(null)}
        onConfirm={handleCancel}
        title="Cancelar reserva de cliente"
        message="Como administrador, puedes cancelar esta reserva. El asiento se liberará en el vuelo correspondiente."
        confirmLabel="Confirmar cancelación"
        confirmVariant="danger"
        isLoading={isCancelling}
      />
    </>
  );
}
