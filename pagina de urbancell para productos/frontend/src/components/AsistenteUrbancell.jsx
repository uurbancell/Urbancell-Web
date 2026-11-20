import { useState } from "react";

export default function AsistenteUrbancell({ productos = [], apiUrl = "" }) {
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensajes, setMensajes] = useState([
    {
      rol: "ia",
      texto: "¡Hola! Soy el recomendador de URBAN CELL®. Dime qué accesorio buscas o qué presupuesto tienes y te sugiero opciones del catálogo."
    }
  ]);

  const enviarConsulta = async (e) => {
    e.preventDefault();
    const texto = mensaje.trim();
    if (!texto || cargando) return;

    setMensajes((prev) => [...prev, { rol: "usuario", texto }]);
    setMensaje("");
    setCargando(true);

    try {
      const res = await fetch(`${apiUrl}/api/ia/recomendar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consulta: texto, productos })
      });

      const data = await res.json();
      setMensajes((prev) => [
        ...prev,
        {
          rol: "ia",
          texto: data.respuesta || data.error || "No se obtuvo respuesta."
        }
      ]);
    } catch {
      setMensajes((prev) => [
        ...prev,
        {
          rol: "ia",
          texto: "Hubo un problema al conectar con el recomendador. Puedes escribirnos por Atención Directa."
        }
      ]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "20px", left: "20px", zIndex: 250 }}>
      {!abierto ? (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          style={{
            backgroundColor: "#090b10",
            color: "#ffffff",
            border: "1px solid #d4d4d8",
            borderRadius: "999px",
            padding: "0.75rem 1.15rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 10px 24px rgba(0, 0, 0, 0.25)"
          }}
        >
          IA Recomendador
        </button>
      ) : (
        <div
          style={{
            width: "330px",
            maxWidth: "calc(100vw - 40px)",
            backgroundColor: "#ffffff",
            color: "#090b10",
            border: "1px solid #d4d4d8",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 14px 32px rgba(0, 0, 0, 0.28)",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <div
            style={{
              backgroundColor: "#090b10",
              color: "#ffffff",
              padding: "0.8rem 1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontWeight: 700,
              fontSize: "0.92rem"
            }}
          >
            <span>URBAN CELL® · Recomendador IA</span>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              style={{
                background: "transparent",
                color: "#ffffff",
                border: "none",
                fontSize: "1.2rem",
                cursor: "pointer"
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              padding: "0.85rem",
              maxHeight: "260px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
              backgroundColor: "#f8fafc"
            }}
          >
            {mensajes.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.rol === "usuario" ? "flex-end" : "flex-start",
                  backgroundColor: m.rol === "usuario" ? "#090b10" : "#ffffff",
                  color: m.rol === "usuario" ? "#ffffff" : "#090b10",
                  border: "1px solid #e4e4e7",
                  borderRadius: "12px",
                  padding: "0.55rem 0.75rem",
                  fontSize: "0.86rem",
                  lineHeight: 1.4,
                  maxWidth: "88%",
                  whiteSpace: "pre-line"
                }}
              >
                {m.texto}
              </div>
            ))}
            {cargando && (
              <div style={{ fontSize: "0.82rem", color: "#52525b" }}>Buscando en el catálogo...</div>
            )}
          </div>

          <form
            onSubmit={enviarConsulta}
            style={{
              display: "flex",
              gap: "0.45rem",
              padding: "0.7rem",
              borderTop: "1px solid #e4e4e7",
              backgroundColor: "#ffffff"
            }}
          >
            <input
              type="text"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Ej: auriculares inalámbricos..."
              style={{
                flex: 1,
                padding: "0.55rem 0.7rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                color: "#090b10",
                fontSize: "0.88rem"
              }}
            />
            <button
              type="submit"
              disabled={cargando}
              style={{
                backgroundColor: "#090b10",
                color: "#ffffff",
                border: "1px solid #090b10",
                borderRadius: "8px",
                padding: "0.55rem 0.85rem",
                fontWeight: 700,
                fontSize: "0.86rem",
                cursor: "pointer"
              }}
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}