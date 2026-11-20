import { useState, useEffect } from 'react';
import logoUrbanCell from '../assets/logo.jpg';

export default function Encabezado({ onToggleMenu, busqueda, setBusqueda, moneda, setMoneda }) {
  const [hidden, setHidden] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > lastScrollTop && scrollTop > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      setLastScrollTop(scrollTop <= 0 ? 0 : scrollTop);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollTop]);

  return (
    <header className={`smart-header ${hidden ? 'header-hidden' : ''}`}>
      <div className="header-left">
        <button className="menu-hamburger" onClick={onToggleMenu} aria-label="Menú">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className="header-center">
        <a href="#" className="brand-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <img src={logoUrbanCell} alt="UrbanCell" className="header-logo-img" />
          
          <span className="logo-name">URBAN<span>CELL</span></span>
        </a>
      </div>

      <div className="header-right">
        <div className="search-trigger">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <select 
          className="currency-select" 
          value={moneda}
          onChange={(e) => setMoneda(e.target.value)}
        >
          <option value="UYU">$U</option>
          <option value="USD">USD</option>
          <option value="ARS">ARS</option>
          <option value="BRL">BRL</option>
        </select>
      </div>
    </header>
  );
}