import { useState } from 'react';

export default function FormularioContacto() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [respuestaForm, setRespuestaForm] = useState({ texto: '', tipo: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim() || !email.trim() || !mensaje.trim()) {
      setRespuestaForm({ texto: "Por favor, completa todos los campos.", tipo: "error" });
      return;
    }

    setEnviando(true);
    setRespuestaForm({ texto: '', tipo: '' });

    try {
      const respuesta = await fetch('http://localhost:3000/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, mensaje })
      });

      const datos = await respuesta.json();

      if (datos.success || respuesta.ok) {
        setRespuestaForm({
          texto: `¡Gracias ${nombre}! Tu mensaje fue enviado y guardado con éxito.`,
          tipo: "success"
        });
        setNombre('');
        setEmail('');
        setMensaje('');
      } else {
        setRespuestaForm({ texto: "Hubo un problema al guardar el mensaje.", tipo: "error" });
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setRespuestaForm({
        texto: "No se pudo conectar con el servidor backend.",
        tipo: "error"
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section id="contacto" className="contact-section">
      <div className="contact-card">
        <div className="contact-header">
          <h4 className="section-title"><span>Atención Directa</span></h4>
          <p className="section-subtitle">Escribinos y te asesoramos al instante sobre tu próximo accesorio.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre completo</label>
            <input
              type="text"
              id="nombre"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              placeholder="Tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mensaje">Consulta o accesorio que buscás</label>
            <textarea
              id="mensaje"
              placeholder="Tu mensaje"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              required
            ></textarea>
          </div>

          <button type="submit" id="submitBtn" disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar Mensaje"}
          </button>

          {respuestaForm.texto && (
            <div
              className="form-response visible"
              style={{

              }}
            >
              {respuestaForm.texto}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}