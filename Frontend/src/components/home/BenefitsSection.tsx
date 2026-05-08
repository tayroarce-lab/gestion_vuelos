import { ShieldCheck, Coffee, HeadphonesIcon } from 'lucide-react';
import './BenefitsSection.css';

export default function BenefitsSection() {
  return (
    <section className="benefits-section">
      <div className="benefits-container">
        <div className="benefits-header">
          <h2>La experiencia SkyDesk</h2>
          <p>Nos enorgullece ofrecer el mejor servicio a bordo y en tierra para que tu viaje sea inolvidable.</p>
        </div>
        
        <div className="benefits-grid">
          <div className="benefit-item">
            <div className="benefit-icon-wrapper">
              <ShieldCheck size={40} />
            </div>
            <h3>Vuela Seguro</h3>
            <p>Contamos con los estándares de seguridad más altos de la industria y flexibilidad en cambios de vuelo para tu tranquilidad.</p>
          </div>
          
          <div className="benefit-item">
            <div className="benefit-icon-wrapper">
              <Coffee size={40} />
            </div>
            <h3>Confort Premium</h3>
            <p>Asientos ergonómicos, mayor espacio para las piernas y un menú gastronómico exclusivo incluso en clase económica.</p>
          </div>
          
          <div className="benefit-item">
            <div className="benefit-icon-wrapper">
              <HeadphonesIcon size={40} />
            </div>
            <h3>Soporte 24/7</h3>
            <p>Nuestro equipo de atención al cliente está disponible en todo momento para resolver tus dudas y ayudarte en tu itinerario.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
