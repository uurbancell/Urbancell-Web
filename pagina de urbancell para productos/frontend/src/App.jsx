import { useState, useEffect } from 'react';
import Encabezado from './components/Encabezado';
import Hero from './components/Hero';
import FiltroCategorias from './components/FiltroCategorias';
import ProductoCard from './components/ProductoCard';
import ProductoModal from './components/ProductoModal';
import MenuLateral from './components/MenuLateral';
import PanelAgregarProducto from './components/PanelAgregarProducto';
import FormularioContacto from './components/FormularioContacto';
import PiePagina from './components/PiePagina';
import { productos } from './Data/productos';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const CORREO_ADMIN = 'lautaemer09@gmail.com';
const CLAVE_ADMIN = 'Urb@Cell#2026!Pay';
const STORAGE_KEY = 'urbancell_productos_tienda';
const CARRITO_KEY = 'urbancell_carrito';
const CATEGORIAS_VALIDAS = ['audio', 'carga', 'fundas'];

// Cambia esto por tu número real en formato internacional sin '+' ni espacios (ej: 59899123456)
const NUMERO_WHATSAPP = '59890000000';

const TASAS_A_UYU = {
  UYU: 1,
  USD: 42,
  BRL: 7.5,
  ARS: 0.042,
};

const normalizarCategoria = (cat) => {
  const lower = String(cat || '').trim().toLowerCase();
  if (lower === 'audio' || lower === 'auriculares' || lower === 'jbl') return 'Audio';
  if (lower === 'carga' || lower === 'cargadores' || lower === 'magsafe') return 'Carga';
  if (lower === 'fundas') return 'Fundas';
  return 'Audio';
};

const normalizarProducto = (prod) => {
  const imgs =
    Array.isArray(prod.imagenes) && prod.imagenes.length > 0
      ? prod.imagenes
      : prod.imagen
      ? [prod.imagen]
      : ['/logo.jpg'];

  const tituloFinal = prod.titulo || prod.nombre || 'Producto sin nombre';
  const precioFinal = Number(prod.precioUyu ?? prod.precio ?? 0);
  const categoriaFinal = normalizarCategoria(prod.categoria);

  return {
    ...prod,
    id: prod._id || prod.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    nombre: prod.nombre || tituloFinal,
    titulo: tituloFinal,
    categoria: categoriaFinal,
    descripcion: prod.descripcion || '',
    precio: precioFinal,
    precioUyu: precioFinal,
    imagen: imgs[0],
    imagenes: imgs,
    modificadoEnAdmin: true,
  };
};

const leerArchivosComoDataUrl = (archivos) => {
  const lista = Array.from(archivos || []);
  return Promise.all(
    lista.map(
      (archivo) =>
        new Promise((resolve, reject) => {
          const lector = new FileReader();
          lector.onload = () => resolve(lector.result);
          lector.onerror = reject;
          lector.readAsDataURL(archivo);
        })
    )
  );
};

export default function App() {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('all');
  const [moneda, setMoneda] = useState('UYU');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [esAdmin, setEsAdmin] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // Estado para modificar un producto existente en el Modo Admin
  const [productoEditando, setProductoEditando] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editCategoria, setEditCategoria] = useState('Audio');
  const [editPrecio, setEditPrecio] = useState('');
  const [editMoneda, setEditMoneda] = useState('UYU');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editImagenes, setEditImagenes] = useState([]);

  // Estado del carrito de compras
  const [carrito, setCarrito] = useState(() => {
    try {
      const guardado = localStorage.getItem(CARRITO_KEY);
      if (guardado) {
        const parsed = JSON.parse(guardado);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignorar errores de lectura
    }
    return [];
  });
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  const [listaProductos, setListaProductos] = useState(() => {
    try {
      const guardados = localStorage.getItem(STORAGE_KEY);
      if (guardados) {
        const parsed = JSON.parse(guardados);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizarProducto);
        }
      }
    } catch {
      // Ignorar errores de lectura de localStorage
    }
    return productos.map(normalizarProducto);
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listaProductos));
    } catch {
      // Si supera el límite de almacenamiento por imágenes, se mantiene en memoria
    }
  }, [listaProductos]);

  useEffect(() => {
    try {
      localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
    } catch {
      // Ignorar errores de escritura
    }
  }, [carrito]);

  const cargarCambiosDelAdmin = async () => {
    try {
      const res = await fetch(`${API_URL}/productos`);
      if (!res.ok) return;
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) return;

      const productosBackend = data.map(normalizarProducto);

      setListaProductos((prev) => {
        const idsBackend = new Set(productosBackend.map((p) => String(p.id)));
        const soloLocales = prev.filter(
          (p) => !idsBackend.has(String(p.id)) && !p._id
        );
        return [...productosBackend, ...soloLocales];
      });
    } catch {
      // Si el backend no está activo, se mantiene el catálogo guardado
    }
  };

  useEffect(() => {
    cargarCambiosDelAdmin();

    const alVolver = () => cargarCambiosDelAdmin();
    window.addEventListener('focus', alVolver);
    return () => window.removeEventListener('focus', alVolver);
  }, []);

  const handleToggleAdmin = () => {
    if (esAdmin) {
      setEsAdmin(false);
      setProductoEditando(null);
      return;
    }

    const correoIngresado = window.prompt('Ingresa tu correo de administrador:');
    if (correoIngresado === null) return;

    const claveIngresada = window.prompt('Ingresa la contraseña de administrador:');
    if (claveIngresada === null) return;

    const correoValido =
      correoIngresado.trim().toLowerCase() === CORREO_ADMIN.toLowerCase();
    const claveValida = claveIngresada === CLAVE_ADMIN;

    if (correoValido && claveValida) {
      setEsAdmin(true);
    } else {
      alert('Correo o contraseña incorrectos.');
    }
  };

  const agregarProductoALista = (nuevoProd) => {
    if (!nuevoProd) return;
    const normalizado = normalizarProducto(nuevoProd);
    setListaProductos((prev) => [...prev, normalizado]);
  };

  const iniciarModificacion = (prod) => {
    const idActual = prod.id || prod._id;
    const imgs =
      Array.isArray(prod.imagenes) && prod.imagenes.length > 0
        ? prod.imagenes
        : prod.imagen
        ? [prod.imagen]
        : ['/logo.jpg'];

    setProductoEditando(idActual);
    setEditNombre(prod.nombre || prod.titulo || '');
    setEditCategoria(normalizarCategoria(prod.categoria));
    setEditPrecio(String(prod.precioUyu ?? prod.precio ?? 0));
    setEditMoneda('UYU');
    setEditDescripcion(prod.descripcion || '');
    setEditImagenes(imgs);
  };

  const agregarFotosAEdicion = async (e) => {
    const archivos = e.target.files;
    if (!archivos || archivos.length === 0) return;

    try {
      const nuevasFotos = await leerArchivosComoDataUrl(archivos);
      setEditImagenes((prev) => [...prev, ...nuevasFotos]);
    } catch {
      alert('No se pudieron cargar las nuevas imágenes.');
    } finally {
      e.target.value = '';
    }
  };

  const quitarFotoDeEdicion = (indice) => {
    setEditImagenes((prev) => prev.filter((_, idx) => idx !== indice));
  };

  const guardarModificacionProducto = async (e) => {
    e.preventDefault();
    if (!productoEditando) return;

    const monto = Number(editPrecio);
    const tasa = TASAS_A_UYU[editMoneda] || 1;
    const precioFinalUyu = Math.round(monto * tasa * 100) / 100;
    const fotosFinales = editImagenes.length > 0 ? editImagenes : ['/logo.jpg'];
    const nombreLimpio = editNombre.trim() || 'Producto sin nombre';

    const original = listaProductos.find(
      (p) => (p.id || p._id) === productoEditando
    );

    const actualizado = normalizarProducto({
      ...original,
      nombre: nombreLimpio,
      titulo: nombreLimpio,
      categoria: normalizarCategoria(editCategoria),
      descripcion: editDescripcion.trim(),
      precio: precioFinalUyu,
      precioUyu: precioFinalUyu,
      imagen: fotosFinales[0],
      imagenes: fotosFinales,
      modificadoEnAdmin: true,
    });

    if (original?._id) {
      try {
        await fetch(`${API_URL}/productos/${original._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(actualizado),
        });
      } catch {
        // Si el backend no responde, igual se actualiza en la tienda
      }
    }

    setListaProductos((prev) =>
      prev.map((p) => ((p.id || p._id) === productoEditando ? actualizado : p))
    );
    setProductoEditando(null);
  };

  const eliminarProductoDeLista = async (idProducto) => {
    const confirmar = window.confirm(
      '¿Seguro que quieres eliminar este producto de la tienda?'
    );
    if (!confirmar) return;

    const objetivo = listaProductos.find((p) => (p.id || p._id) === idProducto);
    if (objetivo?._id) {
      try {
        await fetch(`${API_URL}/productos/${objetivo._id}`, {
          method: 'DELETE',
        });
      } catch {
        // Si falla la red, igual se elimina de la tienda
      }
    }

    setListaProductos((prev) =>
      prev.filter((prod) => (prod.id || prod._id) !== idProducto)
    );
    if (productoEditando === idProducto) {
      setProductoEditando(null);
    }
  };

  // Funciones del carrito de compras
  const agregarAlCarrito = (prod) => {
    const normalizado = normalizarProducto(prod);
    setCarrito((prev) => {
      const idx = prev.findIndex((item) => String(item.id) === String(normalizado.id));
      if (idx >= 0) {
        const copia = [...prev];
        copia[idx] = { ...copia[idx], cantidad: copia[idx].cantidad + 1 };
        return copia;
      }
      return [
        ...prev,
        {
          id: normalizado.id,
          nombre: normalizado.nombre || normalizado.titulo,
          precioUyu: Number(normalizado.precioUyu ?? normalizado.precio ?? 0),
          imagen: normalizado.imagenes?.[0] || normalizado.imagen || '/logo.jpg',
          cantidad: 1,
        },
      ];
    });
    setCarritoAbierto(true);
  };

  const cambiarCantidadCarrito = (idItem, delta) => {
    setCarrito((prev) =>
      prev
        .map((item) =>
          String(item.id) === String(idItem)
            ? { ...item, cantidad: item.cantidad + delta }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const quitarDelCarrito = (idItem) => {
    setCarrito((prev) => prev.filter((item) => String(item.id) !== String(idItem)));
  };

  const convertirPrecioDesdeUyu = (precioUyu) => {
    const baseUyu = Number(precioUyu || 0);
    const tasa = TASAS_A_UYU[moneda] || 1;
    const convertido = baseUyu / tasa;
    return moneda === 'ARS'
      ? Math.round(convertido)
      : Math.round(convertido * 100) / 100;
  };

  const totalCarritoMoneda = carrito.reduce(
    (acc, item) => acc + convertirPrecioDesdeUyu(item.precioUyu) * item.cantidad,
    0
  );

  const cantidadTotalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  const enviarPedidoWhatsApp = () => {
    if (carrito.length === 0) return;

    const lineas = carrito.map((item) => {
      const unitario = convertirPrecioDesdeUyu(item.precioUyu);
      const subtotal = unitario * item.cantidad;
      return `• ${item.nombre} x${item.cantidad} (${moneda} ${unitario}) = ${moneda} ${subtotal}`;
    });

    const mensaje = [
      '¡Hola URBAN CELL®! Quisiera hacer el siguiente pedido:',
      '',
      ...lineas,
      '',
      `Total a pagar: ${moneda} ${totalCarritoMoneda}`,
    ].join('\n');

    const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const productosFiltrados = listaProductos.filter((prod) => {
    const catProd = String(prod.categoria || '').toLowerCase();
    const catFiltro = String(categoriaActiva || 'all').toLowerCase();

    const esValidaEnCatalogo = CATEGORIAS_VALIDAS.includes(catProd);
    const coincideCategoria =
      catFiltro === 'all' || catFiltro === 'todos'
        ? esValidaEnCatalogo
        : catProd === catFiltro;

    const texto = busqueda.toLowerCase();
    const coincideTexto =
      !texto ||
      prod.titulo?.toLowerCase().includes(texto) ||
      prod.nombre?.toLowerCase().includes(texto) ||
      prod.descripcion?.toLowerCase().includes(texto);

    return coincideCategoria && coincideTexto;
  });

  if (esAdmin) {
    return (
      <div className="app-container admin-solo-vista">
        <div className="admin-wrapper">
          <div className="admin-header">
            <div>
              <h2>Modo Administrador — URBAN CELL®</h2>
              <p className="admin-subtexto">Sesión activa: {CORREO_ADMIN}</p>
            </div>
            <button
              type="button"
              className="btn-secundario"
              onClick={() => {
                setEsAdmin(false);
                setProductoEditando(null);
              }}
            >
              Salir y volver a la tienda
            </button>
          </div>

          <section id="admin-panel">
            <PanelAgregarProducto
              onProductoAgregado={agregarProductoALista}
              productosReferencia={listaProductos}
            />
          </section>

          {productoEditando && (
            <section className="panel-agregar panel-modificar">
              <h3>✏️ Modificar Producto</h3>
              <form onSubmit={guardarModificacionProducto} className="form-producto">
                <input
                  type="text"
                  placeholder="Nombre del producto"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  required
                />

                <select
                  value={editCategoria}
                  onChange={(e) => setEditCategoria(e.target.value)}
                >
                  <option value="Audio">Audio</option>
                  <option value="Carga">Carga</option>
                  <option value="Fundas">Fundas</option>
                </select>

                <div className="precio-moneda-grupo">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Nuevo precio"
                    value={editPrecio}
                    onChange={(e) => setEditPrecio(e.target.value)}
                    required
                  />

                  <select
                    value={editMoneda}
                    onChange={(e) => setEditMoneda(e.target.value)}
                  >
                    <option value="UYU">UYU ($)</option>
                    <option value="USD">USD (US$)</option>
                    <option value="BRL">BRL (R$)</option>
                    <option value="ARS">ARS ($Arg)</option>
                  </select>
                </div>

                <textarea
                  rows="3"
                  placeholder="Descripción"
                  value={editDescripcion}
                  onChange={(e) => setEditDescripcion(e.target.value)}
                />

                <label className="label-subir-fotos">
                  <span>Agregar más fotos a este producto</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={agregarFotosAEdicion}
                    className="input-archivo"
                  />
                </label>

                {editImagenes.length > 0 && (
                  <div className="preview-fotos-grid">
                    {editImagenes.map((src, index) => (
                      <div key={index} className="preview-foto-item">
                        <img src={src} alt={`Foto ${index + 1}`} />
                        <button
                          type="button"
                          className="btn-quitar-foto"
                          onClick={() => quitarFotoDeEdicion(index)}
                          aria-label="Quitar foto"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="acciones-edicion-admin">
                  <button type="submit" className="btn-primario">
                    Guardar Cambios
                  </button>
                  <button
                    type="button"
                    className="btn-secundario"
                    onClick={() => setProductoEditando(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="admin-lista">
            <h3>Productos registrados en la tienda ({listaProductos.length})</h3>
            {listaProductos.length === 0 ? (
              <p className="admin-subtexto">No hay productos cargados todavía.</p>
            ) : (
              listaProductos.map((prod) => {
                const idActual = prod.id || prod._id;
                const imgSrc = prod.imagenes?.[0] || prod.imagen || '/logo.jpg';
                return (
                  <div key={idActual} className="admin-item">
                    <div className="admin-item-info">
                      <img src={imgSrc} alt={prod.nombre || prod.titulo} />
                      <div>
                        <strong>{prod.nombre || prod.titulo}</strong>
                        <span>
                          {prod.categoria} · ${prod.precioUyu ?? prod.precio} ·{' '}
                          {(prod.imagenes?.length || 1)} foto(s)
                        </span>
                      </div>
                    </div>
                    <div className="admin-item-acciones">
                      <button
                        type="button"
                        className="btn-modificar"
                        onClick={() => iniciarModificacion(prod)}
                      >
                        Modificar
                      </button>
                      <button
                        type="button"
                        className="btn-eliminar"
                        onClick={() => eliminarProductoDeLista(idActual)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Encabezado
        onToggleMenu={() => setMenuAbierto((prev) => !prev)}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        moneda={moneda}
        setMoneda={setMoneda}
      />

      <MenuLateral
        isOpen={menuAbierto}
        onClose={() => setMenuAbierto(false)}
        esAdmin={esAdmin}
        onToggleAdmin={handleToggleAdmin}
      />

      <Hero />

      <main className="main-layout" id="catalogo">
        <section className="catalog-section">
          <div className="catalog-header">
            <h3 className="section-title">
              <span className="titulo-izq">Catálogo</span>
              <span className="marca-der"></span>
            </h3>

            <p className="section-subtitle">
              Accesorios seleccionados con garantía y entrega directa en Paysandú
            </p>

            <FiltroCategorias
              categoriaActiva={categoriaActiva}
              onCambiarCategoria={setCategoriaActiva}
            />
          </div>

          <div className="productos-grid">
            {productosFiltrados && productosFiltrados.length > 0 ? (
              productosFiltrados.map((prod) => (
                <ProductoCard
                  key={prod.id || prod._id}
                  producto={prod}
                  moneda={moneda}
                  onSeleccionar={setProductoSeleccionado}
                  onAgregarCarrito={agregarAlCarrito}
                />
              ))
            ) : (
              <p
                style={{
                  textAlign: 'center',
                  gridColumn: '1 / -1',
                  color: '#9CA3AF',
                  padding: '2rem',
                }}
              >
                No se encontraron productos para "{busqueda}".
              </p>
            )}
          </div>
        </section>

        <section id="contacto">
          <FormularioContacto />
        </section>
      </main>

      {/* Botón flotante y cajón del Carrito de Compras */}
      <button
        type="button"
        className="btn-carrito-flotante"
        onClick={() => setCarritoAbierto((prev) => !prev)}
      >
        🛒 Carrito ({cantidadTotalItems})
      </button>

      {carritoAbierto && (
        <aside className="carrito-panel">
          <div className="carrito-header">
            <h3>Tu Pedido</h3>
            <button
              type="button"
              className="close-drawer"
              onClick={() => setCarritoAbierto(false)}
              aria-label="Cerrar carrito"
            >
              &times;
            </button>
          </div>

          {carrito.length === 0 ? (
            <p className="admin-subtexto">Tu carrito está vacío.</p>
          ) : (
            <>
              <div className="carrito-items">
                {carrito.map((item) => {
                  const precioUnit = convertirPrecioDesdeUyu(item.precioUyu);
                  return (
                    <div key={item.id} className="carrito-item">
                      <img src={item.imagen} alt={item.nombre} />
                      <div className="carrito-item-info">
                        <strong>{item.nombre}</strong>
                        <span>
                          {moneda} {precioUnit}
                        </span>
                        <div className="carrito-controles">
                          <button
                            type="button"
                            onClick={() => cambiarCantidadCarrito(item.id, -1)}
                          >
                            -
                          </button>
                          <span>{item.cantidad}</span>
                          <button
                            type="button"
                            onClick={() => cambiarCantidadCarrito(item.id, 1)}
                          >
                            +
                          </button>
                          <button
                            type="button"
                            className="btn-quitar-item"
                            onClick={() => quitarDelCarrito(item.id)}
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="carrito-footer">
                <div className="carrito-total">
                  <span>Total:</span>
                  <strong>
                    {moneda} {totalCarritoMoneda}
                  </strong>
                </div>
                <button
                  type="button"
                  className="btn-primario btn-whatsapp-pedido"
                  onClick={enviarPedidoWhatsApp}
                >
                  Enviar pedido por WhatsApp
                </button>
              </div>
            </>
          )}
        </aside>
      )}

      <ProductoModal
        producto={productoSeleccionado}
        moneda={moneda}
        onClose={() => setProductoSeleccionado(null)}
        onAgregarCarrito={agregarAlCarrito}
      />

      <PiePagina />
    </div>
  );
}