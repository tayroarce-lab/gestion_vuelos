import { Clock, CheckCircle, XCircle, Circle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'scheduled' | 'delayed' | 'cancelled' | 'completed' | 'pending' | 'confirmed';
}

const config = {
  // Vuelos
  scheduled: { bg: 'var(--color-info-light)',    color: '#1D4ED8', text: 'Programado', Icon: Circle },
  delayed:   { bg: 'var(--color-warning-light)', color: '#92400E', text: 'Demorado',   Icon: Clock },
  cancelled: { bg: 'var(--color-error-light)',   color: '#991B1B', text: 'Cancelado',  Icon: XCircle },
  completed: { bg: '#F1F5F9',                    color: '#475569', text: 'Completado', Icon: CheckCircle },
  // Reservas
  pending:   { bg: 'var(--color-warning-light)', color: '#92400E', text: 'Pendiente',  Icon: Clock },
  confirmed: { bg: 'var(--color-success-light)', color: '#166534', text: 'Confirmada', Icon: CheckCircle },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = config[status];
  if (!cfg) return null;

  const { Icon } = cfg;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      backgroundColor: cfg.bg,
      color: cfg.color,
      borderRadius: '999px',
      padding: '3px 10px',
      fontSize: '12px',
      fontWeight: 500,
      whiteSpace: 'nowrap'
    }}>
      <Icon size={14} strokeWidth={2.5} />
      {cfg.text}
    </span>
  );
}
