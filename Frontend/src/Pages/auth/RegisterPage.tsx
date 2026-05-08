import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/auth.api';
import { useToast } from '../../hooks/useToast';
import { isValidEmail, isStrongPassword } from '../../utils/validators';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { add } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Validaciones
  const isNameValid  = name.trim().length >= 2;
  const isEmailValid = isValidEmail(email);
  const pwdStrength  = isStrongPassword(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const isFormValid = isNameValid && isEmailValid && pwdStrength.valid && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setServerError('');
    setIsLoading(true);

    try {
      await authApi.register({ name: name.trim(), email: email.trim(), password });
      add('success', 'Cuenta creada exitosamente. Ahora puedes iniciar sesión.');
      navigate('/login');
    } catch (err: any) {
      if (err.errors) {
        setServerError(err.errors.map((e: any) => e.message).join(', '));
      } else {
        setServerError(err?.message || 'Error al crear la cuenta');
      }
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

      <div className="card animate-fadeIn" style={{ width: '100%', maxWidth: '440px', padding: '32px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '8px', textAlign: 'center' }}>Crear cuenta</h2>
        <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: '24px', fontSize: '14px' }}>
          Únete para empezar a reservar tus vuelos
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Nombre completo</label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="Ej. Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
            {name && !isNameValid && <span className="form-error">Mínimo 2 caracteres</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            {email && !isEmailValid && <span className="form-error">Ingresa un email válido</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                className="form-input"
                placeholder="Mínimo 8 caracteres"
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
            
            {/* Password strength bar */}
            {password.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '6px' }}>
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      style={{
                        flex: 1,
                        borderRadius: '2px',
                        background: level <= pwdStrength.strength ? pwdStrength.color : 'var(--color-border)',
                        transition: 'background 0.3s'
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: pwdStrength.color, fontWeight: 600 }}>{pwdStrength.label}</span>
                  {!pwdStrength.valid && <span style={{ color: 'var(--color-text-secondary)' }}>Faltan requisitos</span>}
                </div>
                {!pwdStrength.valid && (
                  <ul style={{ margin: '4px 0 0 16px', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    {pwdStrength.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="confirm">Confirmar contraseña</label>
            <input
              id="confirm"
              type={showPwd ? 'text' : 'password'}
              className={`form-input ${confirmPassword && !passwordsMatch ? 'error' : ''}`}
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
            {confirmPassword && !passwordsMatch && <span className="form-error">Las contraseñas no coinciden</span>}
          </div>

          {serverError && <div className="form-error" style={{ marginBottom: '16px' }}>{serverError}</div>}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? <LoadingSpinner variant="inline" text="Creando cuenta..." /> : 'Crear cuenta'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>¿Ya tienes cuenta? </span>
          <Link to="/login" style={{ fontWeight: 600 }}>Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
}
