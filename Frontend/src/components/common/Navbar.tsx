import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Plane, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    await logout();
  };

  const navLinks = isAuthenticated
    ? user?.role === 'admin'
      ? [
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'Vuelos', path: '/admin/flights' },
          { label: 'Reservas', path: '/admin/reservations' },
        ]
      : [
          { label: 'Inicio', path: '/dashboard' },
          { label: 'Vuelos', path: '/flights' },
          { label: 'Mis Reservas', path: '/reservations' },
        ]
    : [
        { label: 'Vuelos', path: '/flights' },
      ];

  return (
    <nav className="navbar">
      <div className="navbar-container container">

        {/* Logo */}
        <Link to={isAuthenticated ? (user?.role === 'admin' ? '/admin/dashboard' : '/dashboard') : '/'} className="navbar-logo" onClick={closeMenu}>
          <Plane size={24} color="#fff" />
          <span>SkyDesk</span>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-desktop-menu">
          <ul className="navbar-links">
            {navLinks.map((link) => (
              <li key={link.path}>
                <NavLink to={link.path} className={({ isActive }) => isActive ? 'active' : ''}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="navbar-actions">
            {!isAuthenticated ? (
              <>
                <button className="btn btn-ghost" style={{ color: '#fff', borderColor: 'transparent' }} onClick={() => navigate('/login')}>
                  Iniciar sesión
                </button>
                <button className="btn btn-primary" style={{ background: '#fff', color: 'var(--color-primary)' }} onClick={() => navigate('/register')}>
                  Registrarse
                </button>
              </>
            ) : (
              <div className="navbar-user">
                <div className="navbar-user-info">
                  <span className="navbar-user-name">{user?.name}</span>
                  <span className={`navbar-role-badge ${user?.role === 'admin' ? 'admin' : 'client'}`}>
                    {user?.role === 'admin' ? 'Admin' : 'Cliente'}
                  </span>
                </div>
                <button className="btn-icon" onClick={handleLogout} aria-label="Cerrar sesión" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="navbar-mobile-toggle" onClick={toggleMenu} aria-label="Menú">
          {isMenuOpen ? <X size={24} color="#fff" /> : <Menu size={24} color="#fff" />}
        </button>
      </div>

      {/* Mobile Nav */}
      <div className={`navbar-mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <ul className="navbar-mobile-links">
          {navLinks.map((link) => (
            <li key={link.path}>
              <NavLink to={link.path} onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="navbar-mobile-actions">
          {!isAuthenticated ? (
            <>
              <button className="btn btn-ghost btn-full" onClick={() => { closeMenu(); navigate('/login'); }}>
                Iniciar sesión
              </button>
              <button className="btn btn-primary btn-full" onClick={() => { closeMenu(); navigate('/register'); }}>
                Registrarse
              </button>
            </>
          ) : (
            <div className="navbar-mobile-user">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span className="navbar-user-name" style={{ color: 'var(--color-text-primary)' }}>{user?.name}</span>
                <span className={`navbar-role-badge ${user?.role === 'admin' ? 'admin' : 'client'}`}>
                  {user?.role === 'admin' ? 'Admin' : 'Cliente'}
                </span>
              </div>
              <button className="btn btn-ghost btn-full" onClick={handleLogout}>
                <LogOut size={18} style={{ marginRight: '8px' }} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
