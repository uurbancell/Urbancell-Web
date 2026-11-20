import React from 'react';

const Encabezado = () => {
  return (
    <header className="encabezado-principal">
      <div className="logo-container">
        <h1>Urbancell</h1>
      </div>    
      <nav className="nav-links">
        <a href="#inicio">Inicio</a>
        <a href="#catalogo">Catálogo</a>
        <a href="#contacto">Contacto</a>
      </nav>
    </header>
  );
};

export default Encabezado;