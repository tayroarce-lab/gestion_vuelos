import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, XCircle, Plus, Search } from 'lucide-react';
import { flightsApi } from '../../api/flights.api';
import type { Flight } from '../../types/api.types';
import { useToast } from '../../hooks/useToast';
import { formatDateShort, formatPrice } from '../../utils/formatters';
import Navbar from '../../components/common/Navbar';
import SkeletonTable from '../../components/common/SkeletonTable';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function AdminFlightsPage() {
  const navigate = useNavigate();
  const { add } = useToast();

  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filtros
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  // Modal de cancelación
  const [flightToCancel, setFlightToCancel] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Paginación
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const fetchFlights = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await flightsApi.getAll();
      setFlights(res.data);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchFlights(); }, []);

  const processedFlights = useMemo(() => {
    let result = [...flights];

    if (statusFilter !== 'all') {
      result = result.filter(f => f.status === statusFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(f => 
        (f.flightNumber || f.flight_number || '').toLowerCase().includes(q) ||
        f.origin.toLowerCase().includes(q) ||
        f.destination.toLowerCase().includes(q)
      );
    }

    // Ordenar por fecha de salida desc por defecto
    result.sort((a, b) => {
      const d1 = new Date(b.departureDatetime || b.departure_datetime!).getTime();
      const d2 = new Date(a.departureDatetime || a.departure_datetime!).getTime();
      return d1 - d2;
    });

    return result;
  }, [flights, statusFilter, search]);

  const totalPages = Math.ceil(processedFlights.length / itemsPerPage);
  const paginatedFlights = processedFlights.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => { setPage(1); }, [statusFilter, search]);

  const handleCancel = async () => {
    if (!flightToCancel) return;
    setIsCancelling(true);
    try {
      await flightsApi.cancel(flightToCancel);
      add('success', 'Vuelo cancelado');
      await fetchFlights();
    } catch (err: any) {
      add('error', err.message || 'Error al cancelar vuelo');
    } finally {
      setIsCancelling(false);
      setFlightToCancel(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container page-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1>Gestión de Vuelos</h1>
            <p>Administra todos los vuelos del sistema</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/admin/flights/new')}>
            <Plus size={18} /> Nuevo Vuelo
          </button>
        </div>

        <div className="filters-bar">
          <div className="filter-group" style={{ flex: 2 }}>
            <label className="filter-label">Buscar</label>
            <div className="input-wrapper">
              <input
                type="text"
                className="form-input"
                placeholder="Número, origen o destino..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Search size={16} className="input-icon" />
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Estado</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="scheduled">Programados</option>
              <option value="delayed">Demorados</option>
              <option value="cancelled">Cancelados</option>
              <option value="completed">Completados</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <SkeletonTable rows={10} columns={7} />
        ) : error ? (
          <ErrorState message="Error al cargar la tabla de vuelos." onRetry={fetchFlights} />
        ) : processedFlights.length === 0 ? (
          <div className="empty-state card">
            <p>No se encontraron vuelos que coincidan con la búsqueda.</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Ruta</th>
                    <th>Salida</th>
                    <th>Precio</th>
                    <th>Ocupación</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedFlights.map(flight => {
                    const avail = flight.availableSeats ?? flight.available_seats;
                    const total = flight.totalSeats ?? flight.total_seats;
                    const occupied = (total as number) - (avail as number);
                    const canEdit = flight.status !== 'completed' && flight.status !== 'cancelled';
                    
                    return (
                      <tr key={flight.id}>
                        <td style={{ fontWeight: 600 }}>{flight.flightNumber || flight.flight_number}</td>
                        <td>{flight.origin} → {flight.destination}</td>
                        <td>
                          {formatDateShort(flight.departureDatetime || flight.departure_datetime!)}
                          <br/>
                          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                            {new Date(flight.departureDatetime || flight.departure_datetime!).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td>{formatPrice(flight.price)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '60px', height: '6px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${(occupied / (total as number)) * 100}%`, height: '100%', background: 'var(--color-primary)' }}></div>
                            </div>
                            <span style={{ fontSize: '12px' }}>{occupied}/{total}</span>
                          </div>
                        </td>
                        <td><StatusBadge status={flight.status} /></td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button 
                              className="btn-icon" 
                              onClick={() => navigate(`/admin/flights/${flight.id}/edit`)}
                              aria-label="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            {canEdit && (
                              <button 
                                className="btn-icon danger" 
                                onClick={() => setFlightToCancel(flight.id)}
                                aria-label="Cancelar"
                              >
                                <XCircle size={16} />
                              </button>
                            )}
                          </div>
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
        isOpen={flightToCancel !== null}
        onClose={() => setFlightToCancel(null)}
        onConfirm={handleCancel}
        title="Cancelar vuelo"
        message="¿Estás seguro? Todas las reservas asociadas serán canceladas y reembolsadas automáticamente."
        confirmLabel="Sí, cancelar vuelo"
        confirmVariant="danger"
        isLoading={isCancelling}
      />
    </>
  );
}
