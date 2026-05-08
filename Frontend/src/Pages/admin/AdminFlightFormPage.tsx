import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { flightsApi } from '../../api/flights.api';
import type { Flight } from '../../types/api.types';
import type { CreateFlightData } from '../../api/flights.api';
import { useToast } from '../../hooks/useToast';
import Navbar from '../../components/common/Navbar';
import FlightForm from '../../components/flights/FlightForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import ConfirmModal from '../../components/common/ConfirmModal';
import StatusBadge from '../../components/common/StatusBadge';

export default function AdminFlightFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { add } = useToast();

  const [flight, setFlight] = useState<Flight | null>(null);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(false);
  
  // Cancelación
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (isEditing) {
      flightsApi.getById(Number(id))
        .then(res => setFlight(res.data))
        .catch(() => setError(true))
        .finally(() => setIsLoading(false));
    }
  }, [id, isEditing]);

  const handleSubmit = async (data: CreateFlightData) => {
    setIsSaving(true);
    try {
      if (isEditing) {
        await flightsApi.update(Number(id), data);
        add('success', 'Vuelo actualizado exitosamente');
      } else {
        await flightsApi.create(data);
        add('success', `Vuelo ${data.flightNumber} creado exitosamente`);
      }
      navigate('/admin/flights');
    } catch (err: any) {
      if (err.errors) {
        add('error', err.errors.map((e: any) => e.message).join(', '));
      } else {
        add('error', err.message || 'Error al guardar el vuelo');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelFlight = async () => {
    setIsCancelling(true);
    try {
      await flightsApi.cancel(Number(id));
      add('success', 'Vuelo cancelado exitosamente');
      navigate('/admin/flights');
    } catch (err: any) {
      add('error', err.message || 'Error al cancelar el vuelo');
    } finally {
      setIsCancelling(false);
      setIsCancelModalOpen(false);
    }
  };

  if (isLoading) return <><Navbar /><LoadingSpinner variant="fullPage" /></>;
  if (error) return <><Navbar /><div className="page-content"><ErrorState message="No se pudo cargar el vuelo." onRetry={() => navigate('/admin/flights')} /></div></>;

  const canBeCancelled = isEditing && flight?.status !== 'cancelled' && flight?.status !== 'completed';

  return (
    <>
      <Navbar />
      <div className="container page-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>{isEditing ? 'Editar vuelo' : 'Crear nuevo vuelo'}</h1>
            {isEditing && flight && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: 600 }}>{flight.flightNumber || flight.flight_number}</span>
                <StatusBadge status={flight.status} />
              </div>
            )}
          </div>
        </div>

        <FlightForm 
          initialData={flight || undefined} 
          onSubmit={handleSubmit} 
          isLoading={isSaving} 
        />

        {canBeCancelled && (
          <div className="danger-zone" style={{ marginTop: '48px' }}>
            <h4>Zona de peligro</h4>
            <p>Cancelar este vuelo cambiará su estado a "Cancelado" y reembolsará todas las reservas activas automáticamente (vía SP). Esta acción no se puede deshacer.</p>
            <button 
              className="btn btn-danger" 
              onClick={() => setIsCancelModalOpen(true)}
            >
              <XCircle size={16} /> Cancelar este vuelo
            </button>
          </div>
        )}
      </div>

      {isEditing && (
        <ConfirmModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={handleCancelFlight}
          title="¿Cancelar este vuelo?"
          message={`Esta acción cancelará el vuelo ${flight?.flightNumber || flight?.flight_number} y todas sus reservas activas. ¿Estás absolutamente seguro?`}
          confirmLabel="Sí, cancelar vuelo"
          confirmVariant="danger"
          isLoading={isCancelling}
        />
      )}
    </>
  );
}
