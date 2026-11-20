const mongoose = require('mongoose');
const Producto = require('./models/Producto');

const MONGO_URI = "mongodb+srv://estudiante:Urban2026@cluster0.abtwk81.mongodb.net/urbancell?retryWrites=true&w=majority";

const productosIniciales = [
    {
        categoria: "Audio",
        titulo: "JBL Tune 510BT",
        descripcion: "Hasta 40 horas de batería y sonido Pure Bass.",
        precio: "2.490",
        imagen: "/images/jbl.jpg"
    },
    {
        categoria: "Audio",
        titulo: "Apple AirPods",
        descripcion: "Ajuste anatómico y estuche de carga rápida.",
        precio: "6.990",
        imagen: "/images/airpods.jpg"
    },
    {
        categoria: "redmi",
        titulo: "Auricular",
        descripcion: "Auricular compatible con iPhone y iPad.",
        precio: "650",
        imagen: "/images/redmi.jpg"
    },
    {
        categoria: "Funda",
        titulo: "Fundas",
        descripcion: "Funda para iphone 11.",
        precio: "250",
        imagen: "/images/fundas.jpg"
    }
];

async function poblarBaseDeDatos() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Conectado a MongoDB para poblar datos...");

    await Producto.deleteMany({});
    console.log("Productos eliminados.");

    // Insertamos los nuevos
    await Producto.insertMany(productosIniciales);
    console.log("¡Productos de Urban Cell cargados con éxito!");

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error al poblar la base de datos:", error);
  }
}

poblarBaseDeDatos();