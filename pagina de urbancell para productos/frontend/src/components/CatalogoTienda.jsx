import { useState } from 'react';
import TarjetaProducto from './ProductCard';
import FormularioContacto from './FormularioContacto';

export default function CatalogoTienda({ productos = [], busqueda = '', moneda }) {
  const [filtroCategoria, setFiltroCategoria] = useState('all');

  // Filtramos de forma segura por categoría y por texto de búsqueda
  const productosFiltrados = productos.filter((prod) => {
    const coincideCategoria = filtroCategoria === 'all' || prod.categoria?.toLowerCase() === filtroCategoria;
    const coincideTexto = prod.titulo?.toLowerCase().includes((busqueda || '').toLowerCase()) || 
                          prod.descripcion?.toLowerCase().includes((busqueda || '').toLowerCase());
    return coincideCategoria && coincideTexto;
  });

  return (
    <main className="main-layout">
      <section id="catalogo" className="catalog-section">
        <div className="catalog-header">
          <h2 className="section-title">Catálogo <span>Urban Cell</span></h2>
          <p className="section-subtitle">Accesorios seleccionados con garantía y entrega directa en Paysandú</p>
          
          <div className="catalog-filters">
            <button className={`filter-tab ${filtroCategoria === 'all' ? 'active' : ''}`} onClick={() => setFiltroCategoria('all')}>Todos</button>
            <button className={`filter-tab ${filtroCategoria === 'audio' ? 'active' : ''}`} onClick={() => setFiltroCategoria('audio')}>Audio</button>
            <button className={`filter-tab ${filtroCategoria === 'carga' ? 'active' : ''}`} onClick={() => setFiltroCategoria('carga')}>Cargadores & Cables</button>
            <button className={`filter-tab ${filtroCategoria === 'fundas' ? 'active' : ''}`} onClick={() => setFiltroCategoria('fundas')}>Fundas & Protección</button>
          </div>
        </div>

        <div className="products-grid">
          {productosFiltrados.length > 0 ? (
            productosFiltrados.map(prod => (
              <TarjetaProducto key={prod._id || prod.id} producto={prod} moneda={moneda} />
            ))
          ) : (
            <p style={{ textAlign: 'center', gridColumn: '1 / -1', color: '#6e6e73' }}>
              No se encontraron productos para "{busqueda}".
            </p>
          )}
        </div>
      </section>

      <FormularioContacto />
    </main>
  );
}