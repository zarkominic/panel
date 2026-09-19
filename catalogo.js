/* catalogo.js — qué se busca al barrer una zona, y a qué molde va cada cosa.
   Cada línea: [lo que se le pide a Google, molde, grupo].
   Son 28 consultas por barrido: con las 1.000 gratis al mes salen unos 35 barridos. */
const CATALOGO = [
  // comer y beber
  ["bar", "cercano", "Comer y beber"],
  ["cafetería", "cercano", "Comer y beber"],
  ["restaurante", "carta", "Comer y beber"],
  ["pizzería", "carta", "Comer y beber"],
  ["asador", "carta", "Comer y beber"],
  ["panadería", "cercano", "Comer y beber"],
  ["pastelería", "cercano", "Comer y beber"],
  ["heladería", "cercano", "Comer y beber"],
  ["carnicería", "escaparate", "Comer y beber"],
  ["pescadería", "escaparate", "Comer y beber"],
  ["frutería", "escaparate", "Comer y beber"],
  // cuidarse
  ["peluquería", "cita", "Belleza y salud"],
  ["barbería", "cita", "Belleza y salud"],
  ["centro de estética", "cita", "Belleza y salud"],
  ["clínica dental", "cita", "Belleza y salud"],
  ["fisioterapia", "cita", "Belleza y salud"],
  ["gimnasio", "cita", "Belleza y salud"],
  ["farmacia", "cercano", "Belleza y salud"],
  // oficios
  ["taller mecánico", "oficio", "Oficios y reformas"],
  ["ferretería", "oficio", "Oficios y reformas"],
  ["cerrajería", "oficio", "Oficios y reformas"],
  ["reformas", "oficio", "Oficios y reformas"],
  ["carpintería", "oficio", "Oficios y reformas"],
  // tiendas
  ["tienda de ropa", "escaparate", "Tiendas"],
  ["zapatería", "escaparate", "Tiendas"],
  ["floristería", "escaparate", "Tiendas"],
  ["librería", "escaparate", "Tiendas"],
  ["tienda de regalos", "escaparate", "Tiendas"],
];

const GRUPOS = ["Comer y beber", "Belleza y salud", "Oficios y reformas", "Tiendas"];

/* La foto que le pega a cada tipo */
const FOTO_TIPO = {
  "bar": "bar", "cafetería": "bar", "restaurante": "restaurante", "pizzería": "restaurante", "asador": "restaurante",
  "panadería": "panaderia", "pastelería": "panaderia", "heladería": "panaderia",
  "carnicería": "tienda", "pescadería": "tienda", "frutería": "tienda",
  "peluquería": "peluqueria", "barbería": "peluqueria", "centro de estética": "peluqueria",
  "clínica dental": "peluqueria", "fisioterapia": "peluqueria", "gimnasio": "peluqueria", "farmacia": "generico",
  "taller mecánico": "taller", "ferretería": "ferreteria", "cerrajería": "ferreteria", "reformas": "taller", "carpintería": "taller",
  "tienda de ropa": "tienda", "zapatería": "tienda", "floristería": "tienda", "librería": "tienda", "tienda de regalos": "tienda",
};

/* Cuánto merece la pena: mucha gente contenta y ninguna web = el mejor cliente.
   Reseñas pesan (son clientes reales), la nota ajusta, y tener web resta. */
function oportunidad(n){
  const base = Math.log10((n.resenas || 0) + 1) * 40;
  const nota = n.valoracion ? (n.valoracion / 5) : 0.8;
  const penal = n.clase === "sin" ? 1 : n.clase === "red" ? 0.55 : 0.12;
  return Math.round(base * nota * penal);
}

/* ── ZONAS ── La Comunidad de Madrid no se puede barrer de una vez: Google devuelve
   20 negocios por consulta. Se trocea en distritos y municipios, y se barre uno a uno. */
const ZONAS = {
  "Madrid · distritos": ["Centro", "Arganzuela", "Retiro", "Salamanca", "Chamartín", "Tetuán", "Chamberí",
    "Fuencarral-El Pardo", "Moncloa-Aravaca", "Latina", "Carabanchel", "Usera", "Puente de Vallecas",
    "Moratalaz", "Ciudad Lineal", "Hortaleza", "Villaverde", "Villa de Vallecas", "Vicálvaro",
    "San Blas-Canillejas", "Barajas"].map(d => d + ", Madrid"),
  "Sur": ["Móstoles", "Fuenlabrada", "Leganés", "Getafe", "Alcorcón", "Parla", "Pinto", "Valdemoro", "Aranjuez"],
  "Este y corredor": ["Alcalá de Henares", "Torrejón de Ardoz", "Coslada", "San Fernando de Henares", "Arganda del Rey", "Rivas-Vaciamadrid"],
  "Norte y oeste": ["Alcobendas", "San Sebastián de los Reyes", "Tres Cantos", "Colmenar Viejo", "Las Rozas",
    "Majadahonda", "Pozuelo de Alarcón", "Boadilla del Monte", "Collado Villalba", "Villanueva de la Cañada"],
};

/* Los seis tipos que más rinden: negocios de barrio con clientes y sin web. */
const ESENCIALES = ["bar", "restaurante", "peluquería", "panadería", "taller mecánico", "tienda de ropa"];
