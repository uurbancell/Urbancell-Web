import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Producto from './models/Producto.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares (límite amplio para fotos subidas en base64)
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Conexión a MongoDB Atlas
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch((err) => console.error('❌ Error al conectar a MongoDB:', err));

// Ruta de prueba para verificar que el servidor está vivo
app.get('/', (req, res) => {
  res.send('API de URBAN CELL® funcionando correctamente');
});

// 1. GET: Obtener todos los productos
app.get('/api/productos', async (req, res) => {
  try {
    const productos = await Producto.find().sort({ createdAt: 1 });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener productos', error: error.message });
  }
});

// 2. POST: Crear un producto nuevo
app.post('/api/productos', async (req, res) => {
  try {
    const datos = { ...req.body };
    delete datos._id;
    delete datos.id;

    const nuevoProducto = new Producto({
      ...datos,
      titulo: datos.titulo || datos.nombre,
      nombre: datos.nombre || datos.titulo,
      precioUyu: Number(datos.precioUyu ?? datos.precio ?? 0),
      precio: Number(datos.precio ?? datos.precioUyu ?? 0),
      modificadoEnAdmin: true,
    });

    const guardado = await nuevoProducto.save();
    res.status(201).json(guardado);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al guardar producto', error: error.message });
  }
});

// 3. PUT: Modificar un producto existente (precio, fotos, descripción, etc.)
app.put('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = { ...req.body };
    delete datosActualizados._id;
    delete datosActualizados.id;

    const actualizado = await Producto.findByIdAndUpdate(
      id,
      { ...datosActualizados, modificadoEnAdmin: true },
      { new: true }
    );

    if (!actualizado) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    res.json(actualizado);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar producto', error: error.message });
  }
});

// 4. DELETE: Eliminar un producto por su _id
app.delete('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Producto.findByIdAndDelete(id);

    if (!eliminado) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al eliminar producto', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});