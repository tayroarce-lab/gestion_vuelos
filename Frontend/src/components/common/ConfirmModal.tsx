import { useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import './ConfirmModal.css';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'primary' | 'danger';
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  confirmVariant = 'primary',
  isLoading = false,
  onClose,
  onConfirm
}: ConfirmModalProps) {

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  // Bloquear scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onMouseDown={(e) => {
      if (e.target === e.currentTarget && !isLoading) onClose();
    }}>
      <div className="modal-content animate-modalIn">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            className={`btn btn-${confirmVariant}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner variant="inline" text="Procesando..." /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
