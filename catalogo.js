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
