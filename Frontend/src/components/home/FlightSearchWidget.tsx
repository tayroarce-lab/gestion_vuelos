import { useState } from 'react';
import { PlaneTakeoff, PlaneLanding, Calendar, Users, Search } from 'lucide-react';
import './FlightSearchWidget.css';

export default function FlightSearchWidget() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const handleSearch = () => {
    // Smooth scroll down to the flights list and simulate setting a filter
    const filters = document.querySelector('.filters-bar');
    if (filters) {
      filters.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="search-widget">
      <div className="search-widget-tabs">
        <button className="tab active">Vuelo Ida y Vuelta</button>
        <button className="tab">Solo Ida</button>
        <button className="tab">Múltiples Destinos</button>
      </div>
      <div className="search-widget-form">
        <div className="input-group">
          <label>Origen</label>
          <div className="input-with-icon">
            <PlaneTakeoff size={20} />
            <input 
              type="text" 
              placeholder="Ej. Madrid (MAD)" 
              value={origin} 
              onChange={(e) => setOrigin(e.target.value)} 
            />
          </div>
        </div>
        <div className="input-group">
          <label>Destino</label>
          <div className="input-with-icon">
            <PlaneLanding size={20} />
            <input 
              type="text" 
              placeholder="Ej. Tokio (NRT)" 
              value={destination} 
              onChange={(e) => setDestination(e.target.value)} 
            />
          </div>
        </div>
        <div className="input-group date-group">
          <label>Fechas</label>
          <div className="input-with-icon">
            <Calendar size={20} />
            <input type="text" placeholder="Ida - Vuelta" />
          </div>
        </div>
        <div className="input-group">
          <label>Pasajeros</label>
          <div className="input-with-icon">
            <Users size={20} />
            <input type="text" placeholder="1 Adulto, Económica" />
          </div>
        </div>
        <button className="btn-search" onClick={handleSearch}>
          <Search size={20} />
          Buscar
        </button>
      </div>
    </div>
  );
}
