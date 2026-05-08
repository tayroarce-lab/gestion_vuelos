import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = 'Ha ocurrido un error',
  message,
  onRetry
}: ErrorStateProps) {
  return (
    <div className="empty-state">
      <AlertCircle size={48} className="empty-icon" style={{ color: 'var(--color-error)' }} />
      <h3>{title}</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry}>
          Intentar de nuevo
        </button>
      )}
    </div>
  );
}
