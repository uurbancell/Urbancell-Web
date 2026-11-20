import { useEffect } from 'react';

export default function MenuLateral({ isOpen, onClose, esAdmin, onToggleAdmin }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const irASeccion = (e, id) => {
    e.preventDefault();
    onClose();
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleAdminClick = () => {
    onClose();
    onToggleAdmin();
  };

  return (
    <>
      {isOpen && <div className="drawer-backdrop" onClick={onClose} />}

      <nav className={`nav-drawer ${isOpen ? 'active' : ''}`} aria-label="Menú lateral">
        <button
          type="button"
          className="close-drawer"
          onClick={onClose}
          aria-label="Cerrar menú"
        >
          &times;
        </button>

        <div className="drawer-content">
          <div className="drawer-header">
            <span style={{ color: '#000000ff' }}>URBAN</span>
            <span style={{ color: '#814fffff' }}>CELL</span>®
            {esAdmin && <span className="drawer-admin-badge">ADMIN</span>}
          </div>

          <ul className="drawer-links">
            <li>
              <a href="#catalogo" onClick={(e) => irASeccion(e, 'catalogo')}>
                Catálogo Exclusivo
              </a>
            </li>
            <li>
              <a href="#contacto" onClick={(e) => irASeccion(e, 'contacto')}>
                Atención Directa
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com/urbancell_pay"
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
              >
                Instagram
              </a>
            </li>
            <li className="drawer-admin-item">
              <button
                type="button"
                className={`btn-admin-drawer ${esAdmin ? 'activo' : ''}`}
                onClick={handleAdminClick}
              >
                {esAdmin ? 'Salir de Modo Admin' : 'Modo Admin'}
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}