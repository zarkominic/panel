/* panel.js — todo en el navegador: sin servidor, funciona en GitHub Pages y desde el móvil.
   La clave de Google se guarda solo en este navegador (localStorage), nunca en el repositorio. */
const $ = id => document.getElementById(id);
const URL_PLACES = "https://places.googleapis.com/v1/places:searchText";
const CAMPOS = "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.googleMapsUri,places.businessStatus,places.regularOpeningHours.weekdayDescriptions,nextPageToken";
const REDES = ["facebook.", "instagram.", "linktr.ee", "wa.me", "whatsapp.", "tiktok.", "x.com", "twitter."];
const COLORES = ["#1f4d3a", "#1b2f7a", "#b3402b", "#6b3fa0", "#8a6410", "#17171a"];
let NEGOCIOS = [], filtro = "sin", actual = null, color = COLORES[0];

const clave = () => localStorage.getItem("places") || "";
const claseWeb = u => !u ? "sin" : (REDES.some(r => u.toLowerCase().includes(r)) ? "red" : "propia");
const espera = ms => new Promise(r => setTimeout(r, ms));

/* ── clave ── */
$("ajustes").onclick = () => { $("clave").value = clave(); $("dlgClave").showModal(); };
$("guardarClave").onclick = () => { localStorage.setItem("places", $("clave").value.trim()); $("dlgClave").close(); };
document.querySelectorAll("[data-cerrar]").forEach(b => b.onclick = () => b.closest("dialog").close());
if (!clave()) $("dlgClave").showModal();

/* ── buscar ── */
async function pagina(texto, token){
  const cuerpo = {textQuery: texto, languageCode: "es", regionCode: "ES", pageSize: 20};
  if (token) cuerpo.pageToken = token;
  const r = await fetch(URL_PLACES, {method: "POST", headers: {"Content-Type": "application/json", "X-Goog-Api-Key": clave(), "X-Goog-FieldMask": CAMPOS}, body: JSON.stringify(cuerpo)});
  const d = await r.json();
  if (!r.ok) throw new Error((d.error && d.error.message) || "Google no responde bien. Revisa la clave.");
  return d;
}
$("form").onsubmit = async e => {
  e.preventDefault();
  if (!clave()) return $("dlgClave").showModal();
  $("error").hidden = true; $("buscar").disabled = true; $("buscar").textContent = "Buscando…";
  try {
    const tipos = $("tipos").value.split(",").map(t => t.trim()).filter(Boolean), vistos = new Set();
    NEGOCIOS = [];
    for (const tipo of tipos){
      let token = null;
      for (let p = 0; p < 2; p++){
        const d = await pagina(`${tipo} en ${$("zona").value}`, token);
        for (const s of d.places || []){
          if (vistos.has(s.id) || s.businessStatus === "CLOSED_PERMANENTLY") continue;
          vistos.add(s.id);
          const web = s.websiteUri || "";
          NEGOCIOS.push({id: s.id, tipo, nombre: (s.displayName || {}).text || "", direccion: s.formattedAddress || "",
            telefono: s.nationalPhoneNumber || "", web, clase: claseWeb(web), valoracion: s.rating || "",
            resenas: s.userRatingCount || 0, maps: s.googleMapsUri || "",
            horario: ((s.regularOpeningHours || {}).weekdayDescriptions) || []});
        }
        token = d.nextPageToken; if (!token) break; await espera(1600);
      }
    }
    const orden = {sin: 0, red: 1, propia: 2};
    NEGOCIOS.sort((a, b) => orden[a.clase] - orden[b.clase] || b.resenas - a.resenas);
    pinta();
  } catch(err){ $("error").textContent = err.message; $("error").hidden = false; }
  $("buscar").disabled = false; $("buscar").textContent = "Buscar";
};

document.querySelectorAll(".pill").forEach(p => p.onclick = () => {
  filtro = p.dataset.f; document.querySelectorAll(".pill").forEach(x => x.classList.toggle("on", x === p)); pinta(); });

function pinta(){
  const n = c => NEGOCIOS.filter(x => x.clase === c).length;
  $("nSin").textContent = n("sin"); $("nRed").textContent = n("red"); $("nProp").textContent = n("propia");
  const hay = NEGOCIOS.length > 0;
  $("resumen").hidden = $("filtros").hidden = !hay; $("vacio").hidden = hay;
  const etiqueta = {sin: "Sin web", red: "Solo redes", propia: "Con web"};
  const lista = NEGOCIOS.filter(x => filtro === "todo" || x.clase === filtro);
  $("lista").innerHTML = lista.map(x => `<div class="ficha">
      <div class="alto"><div><div class="nombre">${x.nombre}</div>
        <div class="mini">${x.tipo} · ${x.direccion}</div>
        <div class="mini">${x.resenas} reseñas${x.valoracion ? " · " + x.valoracion + " ★" : ""}</div></div>
        <span class="tag ${x.clase}">${etiqueta[x.clase]}</span></div>
      <div class="acciones">
        ${x.telefono ? `<a href="tel:${x.telefono.replace(/[^0-9+]/g, "")}">📞 ${x.telefono}</a>` : ""}
        <a href="${x.maps}" target="_blank" rel="noopener">Maps</a>
        ${x.web ? `<a href="${x.web}" target="_blank" rel="noopener">Su web</a>` : ""}
        <button class="princ" data-maq="${x.id}" type="button">Maqueta</button>
      </div></div>`).join("") || `<p class="mini">Nada con ese filtro.</p>`;
  document.querySelectorAll("[data-maq]").forEach(b => b.onclick = () => abrirMaqueta(b.dataset.maq));
}

/* ── maqueta: se arma aquí mismo y se abre en otra pestaña ── */
$("colores").innerHTML = COLORES.map((c, i) => `<span data-c="${c}" class="${i ? "" : "on"}" style="background:${c}"></span>`).join("");
$("colores").onclick = e => { if (!e.target.dataset.c) return; color = e.target.dataset.c;
  [...$("colores").children].forEach(s => s.classList.toggle("on", s === e.target)); };

function abrirMaqueta(id){
  actual = NEGOCIOS.find(x => x.id === id);
  $("mqNombre").textContent = actual.nombre; $("mqDir").textContent = actual.direccion;
  $("lema").value = ""; $("whatsapp").value = localStorage.getItem("wa") || "";
  const m = moldePara(actual.tipo + " " + actual.nombre);
  $("molde").value = m; $("foto").value = fotoPara(actual.tipo + " " + actual.nombre);
  $("detalle").value = "det_" + ({panaderia:"panaderia",bar:"bar",peluqueria:"peluqueria",restaurante:"restaurante",taller:"taller",tienda:"tienda"}[$("foto").value] || "tienda");
  ayudaMolde();
  $("tituloPuntos").value = ""; ["p1","p2","p3"].forEach(i => $(i).value = "");
  $("dlgMaq").showModal();
}
const FOTOS = ["panaderia","bar","peluqueria","restaurante","tienda","ferreteria","taller","generico"];
const PISTAS = {panaderia:["panader","pastel","horno"], bar:["bar","cerve","taberna","cafeter","cafe"], peluqueria:["peluqu","barber","estetic","spa","uñas","belleza"],
  restaurante:["restaur","comida","cocina","asador","pizzer","marisqu"], tienda:["tienda","ropa","moda","boutique","zapat","regalo","libr","flor"],
  ferreteria:["ferret","bricolaje","pintur","electric","fontaner"], taller:["taller","reparac","mecan","carpint","costur","tapicer"]};
function fotoPara(tipo){ const t=(tipo||"").toLowerCase();
  for (const [f, claves] of Object.entries(PISTAS)) if (claves.some(c => t.includes(c))) return f;
  return "generico"; }

function opciones(){
  return {color, molde: $("molde").value, foto: $("foto").value, detalle: $("detalle").value,
          lema: $("lema").value.trim(), whatsapp: $("whatsapp").value.trim(),
          tituloMotivos: $("tituloPuntos").value.trim(),
          motivos: [$("p1").value, $("p2").value, $("p3").value]};
}
const html = (n, o) => MOLDES[o.molde].fn(n, o);
$("ver").onclick = () => {
  const o = opciones(); localStorage.setItem("wa", o.whatsapp || "");
  const base = location.origin + location.pathname.replace(/[^/]*$/, "");
  const doc = html(actual, o).replace(/src="img\//g, 'src="' + base + 'img/');
  sessionStorage.setItem("maqueta", doc); $("dlgMaq").close();
  location.href = "ver.html";   // misma pestaña: el móvil bloquea las ventanas nuevas
};
$("descargar").onclick = () => {
  const doc = html(actual, opciones()); $("dlgMaq").close();
  const abs = doc.replace('src="img/', 'src="' + location.origin + location.pathname.replace(/[^/]*$/, "") + 'img/');
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([abs], {type: "text/html"}));
  a.download = actual.nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) + ".html"; a.click();
};
$("csv").onclick = () => {
  const cab = ["nombre", "tipo", "direccion", "telefono", "clase", "resenas", "valoracion", "web", "maps"];
  const csv = [cab.join(",")].concat(NEGOCIOS.map(n => cab.map(c => `"${String(n[c] ?? "").replace(/"/g, '""')}"`).join(","))).join("\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], {type: "text/csv"}));
  a.download = "radar_" + new Date().toISOString().slice(0, 10) + ".csv"; a.click();
};

/* la ayuda de los tres campos cambia según el molde: no es lo mismo un plato que un motivo */
function ayudaMolde(){
  const a = MOLDES[$("molde").value].ayuda;
  ["p1","p2","p3"].forEach(i => $(i).placeholder = a);
  $("tituloPuntos").placeholder = "Título de esa sección";
}
$("molde").onchange = ayudaMolde;
