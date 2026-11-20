import express from "express";

const router = express.Router();

const MODELOS = ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.0-flash"];

router.post("/recomendar", async (req, res) => {
  try {
    const { consulta, productos = [] } = req.body;

    if (!consulta || !consulta.trim()) {
      return res.status(400).json({ error: "Escribe una consulta para recomendar." });
    }

    const catalogoResumido = productos.map((p) => ({
      nombre: p.nombre || p.titulo || "",
      categoria: p.categoria || "",
      precio: p.precio ?? p.precioUyu ?? 0,
      moneda: p.moneda || "UYU",
      descripcion: p.descripcion || ""
    }));

    const prompt = `
Eres el asistente de ventas y recomendador de URBAN CELL®.
Responde en español, de forma clara, amable y breve.
Usa ÚNICAMENTE los productos del catálogo proporcionado; no inventes productos ni precios que no estén ahí.
Si no hay coincidencia exacta, sugiere la alternativa más cercana disponible en el catálogo e invita a usar Atención Directa o Pedir.

Catálogo disponible:
${JSON.stringify(catalogoResumido, null, 2)}

Consulta del cliente:
"${consulta}"
`;

    let ultimoError = "El servicio de IA está con alta demanda en este momento.";

    for (const modelo of MODELOS) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        const respuesta =
          data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
          "No pude generar una recomendación en este momento.";
        return res.json({ respuesta });
      }

      ultimoError = data?.error?.message || ultimoError;

      // Si es por alta demanda / cuota / modelo no disponible, probamos el siguiente modelo
      const esTemporal =
        response.status === 429 ||
        response.status === 503 ||
        response.status === 404 ||
        /demand|quota|overloaded|not found|available/i.test(ultimoError);

      if (!esTemporal) {
        return res.status(response.status).json({ error: ultimoError });
      }
    }

    return res.status(503).json({
      error: "Los modelos tienen alta demanda en este momento. Intenta enviar tu consulta de nuevo en unos segundos."
    });
  } catch (err) {
    console.error("Error en /api/ia/recomendar:", err);
    return res.status(500).json({ error: "Error interno del servidor de IA." });
  }
});

export default router;