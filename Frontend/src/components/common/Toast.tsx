import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import type { Toast as ToastType } from '../../hooks/useToast';
import './Toast.css';

interface ToastProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

const icons = {
  success: <CheckCircle size={20} className="toast-icon success" />,
  error:   <AlertCircle size={20} className="toast-icon error" />,
  info:    <Info size={20} className="toast-icon info" />,
};

export default function Toast({ toasts, onRemove }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item ${toast.type} animate-slideInRight`}>
          <div className="toast-content">
            {icons[toast.type]}
            <p>{toast.message}</p>
          </div>
          <button className="toast-close" onClick={() => onRemove(toast.id)} aria-label="Cerrar">
            <X size={16} />
          </button>
          <div className="toast-progress"></div>
        </div>
      ))}
    </div>
  );
}
