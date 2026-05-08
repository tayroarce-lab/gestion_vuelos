import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Plane, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { isValidEmail } from '../../utils/validators';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState('');

  const isFormValid = isValidEmail(email) && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      const redirect = searchParams.get('redirect');
      // La redirección por rol se maneja en el AppRouter (<AuthRedirect>) si redirect no existe
      if (redirect) navigate(redirect, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Credenciales incorrectas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--color-bg)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <div style={{ background: 'var(--color-primary)', padding: '12px', borderRadius: '12px' }}>
          <Plane size={32} color="#fff" />
        </div>
        <h1 style={{ fontSize: '32px' }}>SkyDesk</h1>
      </div>

      <div className="card animate-fadeIn" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '8px', textAlign: 'center' }}>Bienvenido de nuevo</h2>
        <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: '24px', fontSize: '14px' }}>
          Ingresa tus credenciales para continuar
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              className={`form-input ${error ? 'error' : ''}`}
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                className={`form-input ${error ? 'error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="input-icon"
                onClick={() => setShowPwd(!showPwd)}
                tabIndex={-1}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="form-error" style={{ marginBottom: '16px' }}>{error}</div>}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={!isFormValid || isLoading}
            style={{ marginTop: '8px' }}
          >
            {isLoading ? <LoadingSpinner variant="inline" text="Iniciando sesión..." /> : 'Iniciar sesión'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>¿No tienes cuenta? </span>
          <Link to="/register" style={{ fontWeight: 600 }}>Regístrate</Link>
        </div>
      </div>
    </div>
  );
}
