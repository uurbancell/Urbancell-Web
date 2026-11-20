import mongoose from 'mongoose';

const consultaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email: { type: String, default: '', trim: true },
    consulta: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Consulta =
  mongoose.models.Consulta || mongoose.model('Consulta', consultaSchema);

app.post('/api/contacto', async (req, res) => {
  try {
    const { nombre, email, consulta, mensaje } = req.body || {};
    const textoConsulta = String(consulta || mensaje || '').trim();

    if (!String(nombre || '').trim() || !textoConsulta) {
      return res.status(400).json({
        ok: false,
        error: 'Nombre y consulta son obligatorios.',
      });
    }

    const creada = await Consulta.create({
      nombre: String(nombre).trim(),
      email: String(email || '').trim(),
      consulta: textoConsulta,
    });

    return res.status(201).json({
      ok: true,
      id: creada._id,
      data: creada,
    });
  } catch (error) {
    console.error('Error guardando consulta en MongoDB:', error);
    return res.status(500).json({
      ok: false,
      error: 'Error al guardar en la base de datos.',
    });
  }
});