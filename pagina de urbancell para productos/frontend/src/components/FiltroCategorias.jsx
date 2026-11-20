import React from 'react';

export default function FiltroCategorias({ categoriaActiva, onCambiarCategoria }) {
  const categorias = [
    { id: 'all', label: 'Todos' },
    { id: 'audio', label: 'Audio' },
     { id: 'carga', label: 'Carga' },
    { id: 'fundas', label: 'Fundas' },
  ];

  return (
    <div className="filtro-categorias">
      {categorias.map((cat) => (
        <button
          key={cat.id}
          type="button"
          className={categoriaActiva === cat.id ? 'activo' : ''}
          onClick={() => onCambiarCategoria(cat.id)}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}

