import { Plane, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3><Plane size={28} /> SkyDesk</h3>
            <p>Conectando personas y destinos con la mejor experiencia de vuelo. Tu viaje ideal comienza aquí.</p>
            <div className="social-links">
              <a href="#" className="social-link"><Facebook size={18} /></a>
              <a href="#" className="social-link"><Twitter size={18} /></a>
              <a href="#" className="social-link"><Instagram size={18} /></a>
              <a href="#" className="social-link"><Linkedin size={18} /></a>
            </div>
          </div>
          
          <div className="footer-col">
            <h4>Nuestra Compañía</h4>
            <ul>
              <li><a href="#">Sobre Nosotros</a></li>
              <li><a href="#">Trabaja con Nosotros</a></li>
              <li><a href="#">Inversionistas</a></li>
              <li><a href="#">Sostenibilidad</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>Viajeros</h4>
            <ul>
              <li><a href="#">Estado de Vuelos</a></li>
              <li><a href="#">Equipaje</a></li>
              <li><a href="#">Check-in Online</a></li>
              <li><a href="#">Asistencia Especial</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>Soporte</h4>
            <ul>
              <li><a href="#">Centro de Ayuda</a></li>
              <li><a href="#">Contáctanos</a></li>
              <li><a href="#">Reembolsos</a></li>
              <li><a href="#">Facturación</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SkyDesk Airlines. Todos los derechos reservados.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacidad</a>
            <a href="#">Términos de Servicio</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
