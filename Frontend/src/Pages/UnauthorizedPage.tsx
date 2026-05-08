import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Navbar from '../components/common/Navbar';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="container page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - var(--navbar-height))' }}>
        <div className="card empty-state" style={{ maxWidth: '400px', borderTop: '4px solid var(--color-error)' }}>
          <ShieldAlert size={64} className="empty-icon" style={{ color: 'var(--color-error)' }} />
          <h3>Acceso Denegado</h3>
          <p>No tienes los permisos necesarios para acceder a esta área del sistema.</p>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate(-1)} 
            style={{ marginTop: '16px' }}
          >
            <ArrowLeft size={16} /> Volver atrás
          </button>
        </div>
      </div>
    </>
  );
}
