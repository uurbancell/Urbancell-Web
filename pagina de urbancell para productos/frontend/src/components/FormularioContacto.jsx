import { useState } from 'react';

const rawApiUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? 'http://localhost:4000/api'
    : 'https://urbancell-web.onrender.com/api');

const API_URL = rawApiUrl.endsWith('/api')
  ? rawApiUrl
  : `${rawApiUrl.replace(/\/+$/, '')}/api`;

export default function FormularioContacto() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [estadoMensaje, setEstadoMensaje] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nombreLimpio = nombre.trim();
    const emailLimpio = email.trim();
    const consultaLimpia = mensaje.trim();

    if (!nombreLimpio || !consultaLimpia) {
      setEstadoMensaje({
        tipo: 'aviso',
        texto: 'Completa tu nombre y tu consulta antes de enviar.',
      });
      return;
    }

    setEnviando(true);
    setEstadoMensaje(null);

    try {
      const res = await fetch(`${API_URL}/contacto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombreLimpio,
          email: emailLimpio,
          consulta: consultaLimpia,
          mensaje: consultaLimpia,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.ok === false) {
        throw new Error(data.error || `Error HTTP ${res.status}`);
      }

      setNombre('');
      setEmail('');
      setMensaje('');
      setEstadoMensaje({
        tipo: 'exito',
        texto: 'Mensaje enviado y guardado en MongoDB correctamente.',
      });
    } catch (err) {
      setEstadoMensaje({
        tipo: 'aviso',
        texto:
          err?.message && !err.message.includes('fetch')
            ? `No se pudo guardar en MongoDB: ${err.message}`
            : 'No se pudo conectar con el servidor para guardar en MongoDB. Verifica que el backend esté encendido y que VITE_API_URL sea correcta.',
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="atencion-card-final">
      <div className="atencion-header-final">
        <h2>Atención Directa</h2>
        <p>Escribinos y te asesoramos al instante sobre tu próximo accesorio.</p>
      </div>

      <form onSubmit={handleSubmit} className="atencion-form-final">
        <div className="atencion-campo-final">
          <label htmlFor="atencion-nombre">Nombre completo</label>
          <input
            id="atencion-nombre"
            type="text"
            placeholder="Tu nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div className="atencion-campo-final">
          <label htmlFor="atencion-email">Correo electrónico</label>
          <input
            id="atencion-email"
            type="email"
            placeholder="Tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="atencion-campo-final">
          <label htmlFor="atencion-consulta">Consulta o accesorio que buscás</label>
          <textarea
            id="atencion-consulta"
            rows="4"
            placeholder="Tu mensaje"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn-enviar-mensaje-final"
          disabled={enviando}
        >
          {enviando ? 'Enviando...' : 'Enviar Mensaje'}
        </button>

        {estadoMensaje && (
          <div
            className={`atencion-alerta-final ${
              estadoMensaje.tipo === 'exito' ? 'alerta-ok' : 'alerta-aviso'
            }`}
          >
            {estadoMensaje.texto}
          </div>
        )}
      </form>
    </div>
  );
}