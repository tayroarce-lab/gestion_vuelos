import { ArrowRight } from 'lucide-react';
import './FeaturedDestinations.css';

const destinations = [
  {
    id: 1,
    city: 'París',
    country: 'Francia',
    image: 'https://images.unsplash.com/photo-1502602898657-3e90760b646e?auto=format&fit=crop&w=800&q=80',
    price: 499,
  },
  {
    id: 2,
    city: 'Tokio',
    country: 'Japón',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
    price: 850,
  },
  {
    id: 3,
    city: 'Nueva York',
    country: 'Estados Unidos',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
    price: 320,
  },
  {
    id: 4,
    city: 'Roma',
    country: 'Italia',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
    price: 550,
  }
];

export default function FeaturedDestinations() {
  return (
    <section className="destinations-section">
      <div className="destinations-header">
        <h2>Destinos Populares</h2>
        <p>Descubre el mundo con nuestras mejores tarifas</p>
      </div>
      
      <div className="destinations-grid">
        {destinations.map((dest) => (
          <div key={dest.id} className="destination-card">
            <div className="destination-image">
              <img src={dest.image} alt={`${dest.city}, ${dest.country}`} />
              <div className="destination-overlay"></div>
            </div>
            <div className="destination-info">
              <div className="destination-text">
                <h3>{dest.city}</h3>
                <span>{dest.country}</span>
              </div>
              <div className="destination-price">
                <span className="price-label">Desde</span>
                <span className="price-value">${dest.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="destinations-action">
        <button className="btn-outline">
          Ver todos los destinos <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}
