import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    titulo: { type: String, trim: true },
    categoria: { type: String, default: 'Audio', trim: true },
    descripcion: { type: String, default: '' },
    precio: { type: Number, required: true, default: 0 },
    precioUyu: { type: Number, default: 0 },
    monedaOriginal: { type: String, default: 'UYU' },
    precioOriginal: { type: Number, default: 0 },
    imagen: { type: String, default: '/logo.jpg' },
    imagenes: { type: [String], default: ['/logo.jpg'] },
    modificadoEnAdmin: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Producto', productoSchema);