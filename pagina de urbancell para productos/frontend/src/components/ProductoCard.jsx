export default function ProductoCard({
  producto,
  moneda = 'UYU',
  onSeleccionar,
  onAgregarCarrito,
}) {
  if (!producto) return null;

  const tasasCambio = {
    UYU: { simbolo: '$U', factor: 1 },
    USD: { simbolo: 'USD', factor: 0.024 },
    ARS: { simbolo: 'ARS', factor: 26.5 },
    BRL: { simbolo: 'R$', factor: 0.14 },
  };

  const monedaNormalizada = String(moneda).toUpperCase();
  const infoMoneda = tasasCambio[monedaNormalizada] || tasasCambio.UYU;

  const precioBase = Number(producto.precioUyu ?? producto.precio ?? 0);
  const precioConvertido = precioBase * infoMoneda.factor;

  const formatoFinal =
    monedaNormalizada === 'USD' || monedaNormalizada === 'BRL'
      ? precioConvertido.toFixed(2)
      : Math.round(precioConvertido).toLocaleString('es-UY');

  const tituloSeguro = producto.titulo || 'este producto';
  const mensajeWhatsApp = encodeURIComponent(
    `Hola Urban Cell! Quiero consultar por el producto ${tituloSeguro}`
  );

  return (
    <article
      className="catalog-card"
      data-category={producto.categoria || ''}
      onClick={() => onSeleccionar && onSeleccionar(producto)}
      style={{ cursor: 'pointer' }}
    >
      <div className="card-img-wrapper">
        <img
          src={producto.imagen || '/logo.jpg'}
          alt={tituloSeguro}
        />
      </div>

      <span className="card-category-tag">
        {producto.categoriaText || producto.categoria || 'General'}
      </span>

      <h3 className="card-title">{tituloSeguro}</h3>
      <p className="card-description">{producto.descripcion || ''}</p>

      <div className="card-bottom">
        <span className="card-price">
          {infoMoneda.simbolo} {formatoFinal}
        </span>

        <a
          href={`https://wa.me/59897305438?text=${mensajeWhatsApp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="card-wa-btn"
          onClick={(e) => e.stopPropagation()}
        >
          💬 Pedir
        </a>

        {onAgregarCarrito && (
          <button
            type="button"
            className="btn-agregar-carrito"
            onClick={(e) => {
              e.stopPropagation();
              onAgregarCarrito(producto);
            }}
          >
            Agregar al carrito
          </button>
        )}
      </div>
    </article>
  );
}