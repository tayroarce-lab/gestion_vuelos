import { useState, useEffect } from 'react';
import { Plane } from 'lucide-react';
import './HeroVideo.css';

interface HeroVideoProps {
  onExploreClick?: () => void;
}

const VIDEO_PLAYLIST = [
  "https://videos.pexels.com/video-files/2864625/2864625-uhd_2560_1440_24fps.mp4", // Airplane takeoff
  "https://videos.pexels.com/video-files/1093662/1093662-hd_1920_1080_30fps.mp4", // Tropical Beach
  "https://videos.pexels.com/video-files/853889/853889-hd_1920_1080_25fps.mp4", // City/Architecture
  "https://videos.pexels.com/video-files/856956/856956-hd_1920_1080_25fps.mp4"  // Mountains/Nature
];

export default function HeroVideo({ onExploreClick }: HeroVideoProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % VIDEO_PLAYLIST.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);
  return (
    <div className="hero-video-container">
      {VIDEO_PLAYLIST.map((src, index) => (
        <video 
          key={src}
          className={`hero-video ${index === currentVideoIndex ? 'active' : ''}`}
          autoPlay 
          muted 
          loop
          playsInline
          style={{ 
            opacity: index === currentVideoIndex ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out'
          }}
        >
          <source src={src} type="video/mp4" />
        </video>
      ))}
      
      <div className="hero-overlay"></div>

      <div className="hero-content">
        <h1 className="hero-title">Descubre el mundo con nosotros</h1>
        <p className="hero-subtitle">
          Vuelos increíbles, destinos de ensueño y la mejor experiencia de viaje 
          te están esperando. Prepárate para despegar hacia tu próxima aventura.
        </p>
        <button className="hero-button" onClick={onExploreClick}>
          <Plane size={20} />
          <span>Explorar Vuelos</span>
        </button>
      </div>
    </div>
  );
}
