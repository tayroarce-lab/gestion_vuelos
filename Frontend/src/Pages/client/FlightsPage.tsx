import { useState, useEffect, useMemo } from 'react';
import { Plane, Filter, X } from 'lucide-react';
import { flightsApi } from '../../api/flights.api';
import type { Flight } from '../../types/api.types';
import Navbar from '../../components/common/Navbar';
import FlightCard from '../../components/flights/FlightCard';
import SkeletonCard from '../../components/common/SkeletonCard';
import ErrorState from '../../components/common/ErrorState';

export default function FlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filtros locales
  const [originFilter, setOriginFilter] = useState('');
  const [destFilter, setDestFilter] = useState('');
  const [sortBy, setSortBy] = useState('dateAsc'); // dateAsc, dateDesc, priceAsc, priceDesc
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

  useEffect(() => {
    fetchFlights();
  }, []);

  // Filtrado y Ordenamiento Local
  const processedFlights = useMemo(() => {
    let result = flights.filter(f => f.status === 'scheduled' || f.status === 'delayed');

    if (originFilter) {
      result = result.filter(f => f.origin.toLowerCase().includes(originFilter.toLowerCase()));
    }
    if (destFilter) {
      result = result.filter(f => f.destination.toLowerCase().includes(destFilter.toLowerCase()));
    }

    result.sort((a, b) => {
      const dateA = new Date(a.departureDatetime || a.departure_datetime!).getTime();
      const dateB = new Date(b.departureDatetime || b.departure_datetime!).getTime();
      const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
      const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;

      switch (sortBy) {
        case 'dateAsc':  return dateA - dateB;
        case 'dateDesc': return dateB - dateA;
        case 'priceAsc': return priceA - priceB;
        case 'priceDesc': return priceB - priceA;
        default: return 0;
      }
    });

    return result;
  }, [flights, originFilter, destFilter, sortBy]);

  // Paginación
  const totalPages = Math.ceil(processedFlights.length / itemsPerPage);
  const paginatedFlights = processedFlights.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Reset page al cambiar filtros
  useEffect(() => { setPage(1); }, [originFilter, destFilter, sortBy]);

  const handleClearFilters = () => {
    setOriginFilter('');
    setDestFilter('');
    setSortBy('dateAsc');
  };

  return (
    <>
      <Navbar />
      <div className="container page-content">
        <div className="page-header">
          <h1>Vuelos disponibles</h1>
          <p>Encuentra y reserva tu próximo destino</p>
        </div>

        {/* Barra de Filtros */}
        <div className="filters-bar">
          <div className="filter-group">
            <label className="filter-label" htmlFor="origin">Origen</label>
            <div className="input-wrapper">
              <input
                id="origin"
                type="text"
                className="form-input"
                placeholder="Ej. San José"
                value={originFilter}
                onChange={(e) => setOriginFilter(e.target.value)}
              />
              {originFilter && (
                <button className="input-icon" onClick={() => setOriginFilter('')}><X size={16}/></button>
              )}
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label" htmlFor="dest">Destino</label>
            <div className="input-wrapper">
              <input
                id="dest"
                type="text"
                className="form-input"
                placeholder="Ej. Madrid"
                value={destFilter}
                onChange={(e) => setDestFilter(e.target.value)}
              />
              {destFilter && (
                <button className="input-icon" onClick={() => setDestFilter('')}><X size={16}/></button>
              )}
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label" htmlFor="sort">Ordenar por</label>
            <select
              id="sort"
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="dateAsc">Fecha: Más próximos</option>
              <option value="dateDesc">Fecha: Más lejanos</option>
              <option value="priceAsc">Precio: Menor a mayor</option>
              <option value="priceDesc">Precio: Mayor a menor</option>
            </select>
          </div>
          {(originFilter || destFilter || sortBy !== 'dateAsc') && (
            <button className="btn btn-ghost" onClick={handleClearFilters} style={{ height: '42px' }}>
              <Filter size={16} /> Limpiar
            </button>
          )}
        </div>

        {/* Contenido */}
        {isLoading ? (
          <div className="grid-2">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <ErrorState message="No pudimos cargar los vuelos. Por favor, intenta de nuevo." onRetry={fetchFlights} />
        ) : paginatedFlights.length === 0 ? (
          <div className="empty-state">
            <Plane size={48} className="empty-icon" />
            <h3>No se encontraron vuelos</h3>
            <p>Intenta ajustar los filtros de búsqueda para ver más resultados.</p>
            <button className="btn btn-secondary" onClick={handleClearFilters}>Limpiar filtros</button>
          </div>
        ) : (
          <>
            <div className="grid-2">
              {paginatedFlights.map(flight => (
                <FlightCard key={flight.id} flight={flight} />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="pagination">
                <button className="btn btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  Anterior
                </button>
                <span className="pagination-info">Página {page} de {totalPages}</span>
                <button className="btn btn-ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
