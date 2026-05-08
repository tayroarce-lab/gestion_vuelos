import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Flight } from '../../types/api.types';
import type { CreateFlightData } from '../../api/flights.api';
import { isAfterDate, isValidFlightNumber } from '../../utils/validators';
import LoadingSpinner from '../common/LoadingSpinner';

// Para poder usar la func 'toDatetimeLocal' como en el doc
// Re-implementando rápido para no depender de refactor
const formatDtLocal = (isoString?: string) => {
  if (!isoString) return '';
  // Convert UTC Date to local datetime-local string format YYYY-MM-DDTHH:mm
  const d = new Date(isoString);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

interface FlightFormProps {
  initialData?: Flight;
  onSubmit: (data: CreateFlightData) => Promise<void>;
  isLoading: boolean;
}

export default function FlightForm({ initialData, onSubmit, isLoading }: FlightFormProps) {
  const navigate = useNavigate();

  // Estados del formulario
  const [flightNumber, setFlightNumber] = useState(initialData?.flightNumber || initialData?.flight_number || '');
  const [origin, setOrigin] = useState(initialData?.origin || '');
  const [destination, setDestination] = useState(initialData?.destination || '');
  
  // Datetimes necesitan formato 'YYYY-MM-DDTHH:mm'
  const [departureDatetime, setDepartureDatetime] = useState(initialData ? formatDtLocal(initialData.departureDatetime || initialData.departure_datetime) : '');
  const [arrivalDatetime, setArrivalDatetime] = useState(initialData ? formatDtLocal(initialData.arrivalDatetime || initialData.arrival_datetime) : '');
  
  const [price, setPrice] = useState(initialData ? String(initialData.price) : '');
  const [totalSeats, setTotalSeats] = useState(initialData ? String(initialData.totalSeats || initialData.total_seats) : '');

  // Validaciones en tiempo real
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!flightNumber) newErrors.flightNumber = 'El número de vuelo es requerido';
    else if (!isValidFlightNumber(flightNumber)) newErrors.flightNumber = 'Solo letras mayúsculas y números, max 10';

    if (!origin) newErrors.origin = 'El origen es requerido';
    if (!destination) newErrors.destination = 'El destino es requerido';
    if (origin && destination && origin.toLowerCase().trim() === destination.toLowerCase().trim()) {
      newErrors.destination = 'El destino debe ser distinto al origen';
    }

    if (!departureDatetime) newErrors.departureDatetime = 'La salida es requerida';
    else if (!initialData && new Date(departureDatetime) < new Date()) {
      newErrors.departureDatetime = 'La fecha debe ser futura';
    }

    if (!arrivalDatetime) newErrors.arrivalDatetime = 'La llegada es requerida';
    else if (departureDatetime && !isAfterDate(arrivalDatetime, departureDatetime)) {
      newErrors.arrivalDatetime = 'La llegada debe ser posterior a la salida';
    }

    const numPrice = parseFloat(price);
    if (!price || isNaN(numPrice) || numPrice <= 0) newErrors.price = 'Ingresa un precio mayor a 0';

    const numSeats = parseInt(totalSeats, 10);
    if (!totalSeats || isNaN(numSeats) || numSeats < 1 || numSeats > 500) {
      newErrors.totalSeats = 'Debe ser un número entre 1 y 500';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Revalidar en cambios para quitar errores
  useEffect(() => {
    if (Object.keys(errors).length > 0) validate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flightNumber, origin, destination, departureDatetime, arrivalDatetime, price, totalSeats]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      flightNumber,
      origin,
      destination,
      // Convertimos el local datetime de HTML a ISO string para la DB
      departureDatetime: new Date(departureDatetime).toISOString(),
      arrivalDatetime: new Date(arrivalDatetime).toISOString(),
      price: parseFloat(price),
      totalSeats: parseInt(totalSeats, 10)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Número de Vuelo</label>
          <input
            type="text"
            className={`form-input ${errors.flightNumber ? 'error' : ''}`}
            placeholder="Ej: AV101"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
            disabled={isLoading || !!initialData} // No permitir cambiar número en edición
          />
          {errors.flightNumber && <span className="form-error">{errors.flightNumber}</span>}
          {initialData && <span className="form-hint">El número de vuelo no se puede modificar</span>}
        </div>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Origen</label>
          <input
            type="text"
            className={`form-input ${errors.origin ? 'error' : ''}`}
            placeholder="Ej: San José (SJO)"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            disabled={isLoading}
          />
          {errors.origin && <span className="form-error">{errors.origin}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Destino</label>
          <input
            type="text"
            className={`form-input ${errors.destination ? 'error' : ''}`}
            placeholder="Ej: Madrid (MAD)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            disabled={isLoading}
          />
          {errors.destination && <span className="form-error">{errors.destination}</span>}
        </div>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Fecha y Hora de Salida</label>
          <input
            type="datetime-local"
            className={`form-input ${errors.departureDatetime ? 'error' : ''}`}
            value={departureDatetime}
            onChange={(e) => setDepartureDatetime(e.target.value)}
            disabled={isLoading}
          />
          {errors.departureDatetime && <span className="form-error">{errors.departureDatetime}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Fecha y Hora de Llegada</label>
          <input
            type="datetime-local"
            className={`form-input ${errors.arrivalDatetime ? 'error' : ''}`}
            value={arrivalDatetime}
            onChange={(e) => setArrivalDatetime(e.target.value)}
            disabled={isLoading}
          />
          {errors.arrivalDatetime && <span className="form-error">{errors.arrivalDatetime}</span>}
        </div>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Precio por Asiento (USD)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            className={`form-input ${errors.price ? 'error' : ''}`}
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={isLoading}
          />
          {errors.price && <span className="form-error">{errors.price}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Asientos Totales</label>
          <input
            type="number"
            min="1"
            max="500"
            className={`form-input ${errors.totalSeats ? 'error' : ''}`}
            placeholder="150"
            value={totalSeats}
            onChange={(e) => setTotalSeats(e.target.value)}
            disabled={isLoading || !!initialData} // Prevenir bugs de capacidad en edición
          />
          {errors.totalSeats && <span className="form-error">{errors.totalSeats}</span>}
          {initialData && <span className="form-hint">La capacidad total no se puede modificar post-creación</span>}
        </div>
      </div>

      <div className="divider"></div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => navigate('/admin/flights')}
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || Object.keys(errors).length > 0}
        >
          {isLoading ? <LoadingSpinner variant="inline" text="Guardando..." /> : 'Guardar Vuelo'}
        </button>
      </div>
    </form>
  );
}
