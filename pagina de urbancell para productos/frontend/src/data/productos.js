import auriJBL from "../assets/auriJBL.jpeg";
import AirPods from "../assets/airpods.jpeg";
import Cargadoriphone from "../assets/cargadoriphone.jpeg";
import cargadoriphone2 from "../assets/cargadoriphoneinalambrico.jpeg";
import parlantesJBL from "../assets/parlantesJBL.jpeg";
import cargadorsamsung from "../assets/cargadorsamsung.jpeg";
import parlanteJBL2 from "../assets/parlantesJBL2.jpeg";
import parlanteJBL3 from "../assets/parlantesJBL3.jpeg";
import parlanteJBL4 from "../assets/parlanteJBL4.jpeg"; // Corregido: sin "s" antes de JBL4

export const productos = [
  {
    id: 1,
    titulo: "AirPods Pro (2ª Gen)",
    precio: 145,
    categoria: "audio",
    descripcion: "Cancelación activa de ruido, audio espacial personalizado y estuche de carga MagSafe.",
    imagen: AirPods,
  },
  {
    id: 2,
    titulo: "Cargador MagSafe Apple",
    precio: 45,
    categoria: "carga",
    descripcion: "Carga inalámbrica rápida y alineación magnética perfecta para tu iPhone.",
    imagen: cargadoriphone2,
  },
  {
    id: 3,
    titulo: "Parlante JBL Go 4",
    precio: 65,
    categoria: "audio",
    descripcion: "Diseño ultra portátil, sonido JBL Pro nítido y resistencia al agua IP67.",
    imagen: parlantesJBL,
    imagenes: [
      parlanteJBL2,
      parlanteJBL3,
      parlanteJBL4,
    ],
  },
  {
    id: 4,
    titulo: "cargador Samsung",
    precio: 25,
    categoria: "carga",
    descripcion: "Protección elegante con acabado suave al tacto e imanes integrados.",
    imagen: cargadorsamsung,
  },
  {
    id: 5,
    titulo: "Cable Carga Rápida USB-C a Lightning",
    precio: 18,
    categoria: "carga",
    descripcion: "Cable mallado de alta resistencia para transferencia de datos y carga veloz.",
    imagen: Cargadoriphone,
  },
  {
    id: 6,
    titulo: "Auriculares JBL Tune 510Tb",
    precio: 55,
    categoria: "audio",
    descripcion: "Sonido Pure Bass inalámbrico con hasta 40 horas de batería.",
    imagen: auriJBL,
  }
];