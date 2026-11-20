import { useState } from 'react';

const rawApiUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? 'http://localhost:4000/api'
    : 'https://urbancell-web.onrender.com/api');

const API_URL = rawApiUrl.endsWith('/api')
  ? rawApiUrl
  : `${rawApiUrl.replace(/\/+$/, '')}/api`;

// Tasas de referencia respecto a UYU (ajustables según tu cotización actual)
const TASAS_A_UYU = {
  UYU: 1,
  USD: 42,
  BRL: 7.5,
  ARS: 0.042,
};

const CATEGORIAS_PERMITIDAS = ['Audio', 'Carga', 'Fundas'];

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

export default function PanelAgregarProducto({
  onProductoAgregado,
  productosReferencia = [],
}) {
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('Audio');
  const [precio, setPrecio] = useState('');
  const [monedaIngreso, setMonedaIngreso] = useState('UYU');
  const [descripcion, setDescripcion] = useState('');
  const [imagenesSubidas, setImagenesSubidas] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);

  const handleSeleccionarFotos = async (e) => {
    const archivos = e.target.files;
    if (!archivos || archivos.length === 0) return;

    try {
      const fotosBase64 = await leerArchivosComoDataUrl(archivos);
      setImagenesSubidas((prev) => [...prev, ...fotosBase64]);
      setMensaje('');
    } catch {
      setMensaje('❌ No se pudieron leer las imágenes seleccionadas.');
    } finally {
      e.target.value = '';
    }
  };

  const quitarFoto = (indice) => {
    setImagenesSubidas((prev) => prev.filter((_, idx) => idx !== indice));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje('');

    const montoIngresado = Number(precio);
    const tasa = TASAS_A_UYU[monedaIngreso] || 1;
    const precioEnUyu = Math.round(montoIngresado * tasa * 100) / 100;

    const fotosFinales =
      imagenesSubidas.length > 0 ? imagenesSubidas : ['/logo.jpg'];

    const baseProducto =
      Array.isArray(productosReferencia) && productosReferencia.length > 0
        ? { ...productosReferencia[0] }
        : {};

    delete baseProducto._id;

    const nuevoId = Date.now();
    const textoNombre = nombre.trim();
    const categoriaLimpia = CATEGORIAS_PERMITIDAS.includes(categoria)
      ? categoria
      : 'Audio';
    const textoDescripcion =
      descripcion.trim() ||
      `${textoNombre} - Disponible en URBAN CELL® Paysandú.`;

    const nuevoProducto = {
      ...baseProducto,
      id: nuevoId,
      nombre: textoNombre,
      titulo: textoNombre,
      categoria: categoriaLimpia,
      descripcion: textoDescripcion,
      precio: precioEnUyu,
      precioUyu: precioEnUyu,
      monedaOriginal: monedaIngreso,
      precioOriginal: montoIngresado,
      imagen: fotosFinales[0],
      imagenes: fotosFinales,
      modificadoEnAdmin: true,
    };

    try {
      const res = await fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoProducto),
      });

      if (res.ok) {
        const guardadoBackend = await res.json();
        const prodBackend =
          guardadoBackend && typeof guardadoBackend === 'object'
            ? guardadoBackend.producto || guardadoBackend
            : null;

        onProductoAgregado({
          ...nuevoProducto,
          ...(prodBackend || {}),
          id: prodBackend?._id || prodBackend?.id || nuevoId,
          nombre: prodBackend?.nombre || prodBackend?.titulo || textoNombre,
          titulo: prodBackend?.titulo || prodBackend?.nombre || textoNombre,
          categoria: CATEGORIAS_PERMITIDAS.includes(prodBackend?.categoria)
            ? prodBackend.categoria
            : categoriaLimpia,
          descripcion: prodBackend?.descripcion || textoDescripcion,
          precio: Number(prodBackend?.precioUyu ?? prodBackend?.precio ?? precioEnUyu),
          precioUyu: Number(prodBackend?.precioUyu ?? prodBackend?.precio ?? precioEnUyu),
          imagenes:
            Array.isArray(prodBackend?.imagenes) && prodBackend.imagenes.length > 0
              ? prodBackend.imagenes
              : fotosFinales,
          imagen:
            (Array.isArray(prodBackend?.imagenes) && prodBackend.imagenes[0]) ||
            prodBackend?.imagen ||
            fotosFinales[0],
          modificadoEnAdmin: true,
        });
      } else {
        onProductoAgregado(nuevoProducto);
      }
    } catch {
      onProductoAgregado(nuevoProducto);
    }

    setMensaje(
      `✅ Producto registrado (${montoIngresado} ${monedaIngreso} → $${precioEnUyu} UYU).`
    );
    setNombre('');
    setPrecio('');
    setDescripcion('');
    setImagenesSubidas([]);
    setGuardando(false);
  };

  return (
    <div className="panel-agregar">
      <h3>➕ Agregar Nuevo Producto</h3>

      <form onSubmit={handleSubmit} className="form-producto">
        <input
          type="text"
          placeholder="Nombre del producto"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
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
            placeholder="Precio"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            required
          />

          <select
            value={monedaIngreso}
            onChange={(e) => setMonedaIngreso(e.target.value)}
            aria-label="Moneda del precio"
          >
            <option value="UYU">UYU ($)</option>
            <option value="USD">USD (US$)</option>
            <option value="BRL">BRL (R$)</option>
            <option value="ARS">ARS ($Arg)</option>
          </select>
        </div>

        <textarea
          rows="3"
          placeholder="Descripción del producto (opcional)"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        <label className="label-subir-fotos">
          <span>Subir una o varias fotos desde tu dispositivo</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleSeleccionarFotos}
            className="input-archivo"
          />
        </label>

        {imagenesSubidas.length > 0 && (
          <div className="preview-fotos-grid">
            {imagenesSubidas.map((src, index) => (
              <div key={index} className="preview-foto-item">
                <img src={src} alt={`Vista previa ${index + 1}`} />
                <button
                  type="button"
                  className="btn-quitar-foto"
                  onClick={() => quitarFoto(index)}
                  aria-label="Quitar foto"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          className="btn-primario"
          disabled={guardando}
        >
          {guardando ? 'Registrando...' : 'Registrar Producto en la Tienda'}
        </button>
      </form>

      {mensaje && <p className="mensaje-estado">{mensaje}</p>}
    </div>
  );
}