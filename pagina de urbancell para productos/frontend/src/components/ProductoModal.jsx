import { useState, useEffect, useCallback } from 'react';

export default function ProductoModal({ producto, moneda = 'UYU', onClose }) {
  const [indiceFoto, setIndiceFoto] = useState(0);
  const [zoomActivo, setZoomActivo] = useState(false);

  const listaFotos = Array.from(
    new Set(
      [
        producto?.imagen,
        ...(Array.isArray(producto?.imagenes) ? producto.imagenes : []),
      ].filter(Boolean)
    )
  );
  if (producto && listaFotos.length === 0) {
    listaFotos.push('/logo.jpg');
  }

  const totalFotos = listaFotos.length;

  const irAnterior = useCallback(() => {
    if (totalFotos <= 1) return;
    setIndiceFoto((prev) => (prev === 0 ? totalFotos - 1 : prev - 1));
    setZoomActivo(false);
  }, [totalFotos]);

  const irSiguiente = useCallback(() => {
    if (totalFotos <= 1) return;
    setIndiceFoto((prev) => (prev === totalFotos - 1 ? 0 : prev + 1));
    setZoomActivo(false);
  }, [totalFotos]);

  useEffect(() => {
    setIndiceFoto(0);
    setZoomActivo(false);
  }, [producto]);

  useEffect(() => {
    if (!producto) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') irAnterior();
      if (e.key === 'ArrowRight') irSiguiente();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [producto, onClose, irAnterior, irSiguiente]);

  if (!producto) return null;

  const fotoActual = listaFotos[indiceFoto] || listaFotos[0];

  const tasasCambio = {
    UYU: { simbolo: '$U', factor: 1 },
    USD: { simbolo: 'USD', factor: 0.024 },
    ARS: { simbolo: 'ARS', factor: 26.5 },
    BRL: { simbolo: 'R$', factor: 0.14 },
  };

  const infoMoneda = tasasCambio[moneda] || tasasCambio.UYU;
  const precioBase = producto.precioUyu || producto.precio || 0;
  const precioConvertido = precioBase * infoMoneda.factor;

  const formatoFinal =
    moneda === 'USD' || moneda === 'BRL'
      ? precioConvertido.toFixed(2)
      : Math.round(precioConvertido).toLocaleString('es-UY');

  const mensajeWhatsApp = encodeURIComponent(
    `Hola Urban Cell! Quiero consultar por el producto: ${producto.titulo}`
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-producto" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Cerrar detalle"
        >
          &times;
        </button>

        <div className="modal-galeria">
          <div className="modal-visor">
            <div
              className={`modal-img-container ${zoomActivo ? 'zoom-activo' : ''}`}
              onClick={() => setZoomActivo((prev) => !prev)}
              title={zoomActivo ? 'Clic para alejar' : 'Clic para hacer zoom'}
            >
              <img
                src={fotoActual}
                alt={`${producto.titulo} - vista ${indiceFoto + 1}`}
                className="modal-img-grande"
              />
            </div>

            {totalFotos > 1 && (
              <>
                <button
                  type="button"
                  className="flecha-carrusel flecha-izq"
                  onClick={(e) => {
                    e.stopPropagation();
                    irAnterior();
                  }}
                  aria-label="Imagen anterior"
                >
                  &#8249;
                </button>
                <button
                  type="button"
                  className="flecha-carrusel flecha-der"
                  onClick={(e) => {
                    e.stopPropagation();
                    irSiguiente();
                  }}
                  aria-label="Imagen siguiente"
                >
                  &#8250;
                </button>
              </>
            )}

            <span className="zoom-badge">
              {zoomActivo ? '🔍 Alejar' : '🔍 Zoom'}
            </span>

            {totalFotos > 1 && (
              <span className="foto-contador">
                {indiceFoto + 1} / {totalFotos}
              </span>
            )}
          </div>

          {totalFotos > 1 && (
            <div className="modal-miniaturas">
              {listaFotos.map((imgUrl, idx) => (
                <button
                  key={`${imgUrl}-${idx}`}
                  type="button"
                  className={`miniatura-btn ${idx === indiceFoto ? 'activa' : ''}`}
                  onClick={() => {
                    setIndiceFoto(idx);
                    setZoomActivo(false);
                  }}
                >
                  <img src={imgUrl} alt={`Miniatura ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="modal-info">
          <span className="card-category-tag">
            {producto.categoriaText || producto.categoria}
          </span>
          <h2 className="modal-title">{producto.titulo}</h2>
          <p className="modal-description">
            {producto.descripcionDetallada ||
              producto.descripcion ||
              'Accesorio seleccionado con garantía y entrega directa en UrbaCell.'}
          </p>

          <div className="modal-footer">
            <span className="modal-price">
              {infoMoneda.simbolo} {formatoFinal}
            </span>
            <a
              href={`https://wa.me/59897305438?text=${mensajeWhatsApp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="card-wa-btn"
            >
              💬 Pedir por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}