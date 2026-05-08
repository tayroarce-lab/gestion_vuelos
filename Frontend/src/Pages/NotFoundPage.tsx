import { useNavigate } from 'react-router-dom';
import { Plane, ArrowRight } from 'lucide-react';
import Navbar from '../components/common/Navbar';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="container page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - var(--navbar-height))' }}>
        <div className="card empty-state" style={{ maxWidth: '400px' }}>
          <Plane size={64} className="empty-icon" style={{ opacity: 0.5, transform: 'rotate(45deg)' }} />
          <h1 style={{ fontSize: '72px', color: 'var(--color-primary)', margin: 0, lineHeight: 1 }}>404</h1>
          <h3 style={{ marginTop: '16px' }}>Página no encontrada</h3>
          <p>Parece que este vuelo se ha desviado. La página que buscas no existe o ha sido movida.</p>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/flights')} 
            style={{ marginTop: '16px' }}
          >
            Ver vuelos disponibles <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
