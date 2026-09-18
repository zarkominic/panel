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
  $("lema").value = ""; $("dlgMaq").showModal();
}
function html(n, lema, color){
  const tel = (n.telefono || "").replace(/[^0-9+]/g, "");
  const horario = (n.horario || []).map(h => `<li>${h}</li>`).join("") || "<li>Pregúntanos el horario</li>";
  const mapa = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(n.nombre + " " + n.direccion);
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${n.nombre}</title><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;500;700&display=swap" rel="stylesheet">
<style>:root{--a:${color};--t:#191919;--g:#6f6f74;--p:#fbfaf7}*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Manrope,system-ui,sans-serif;background:var(--p);color:var(--t);line-height:1.55;font-size:clamp(1.05rem,.4vw + .95rem,1.2rem);padding-bottom:3rem}
a{color:inherit}.hero{min-height:86vh;display:flex;flex-direction:column;justify-content:center;padding:12vh 7vw 6vh;background:linear-gradient(160deg,var(--a),#0d0d0d);color:#fff}
.ante{letter-spacing:.2em;text-transform:uppercase;font-size:.78rem;opacity:.75;margin-bottom:.9rem}
h1{font-size:clamp(2.3rem,9vw,4.6rem);font-weight:700;line-height:1.05;letter-spacing:-.02em}
.lema{margin-top:1.1rem;font-size:clamp(1.05rem,3.6vw,1.5rem);font-weight:300;opacity:.92;max-width:26ch}
.acc{display:flex;flex-wrap:wrap;gap:.8rem;margin-top:2.2rem}
.btn{padding:1rem 1.5rem;border-radius:2rem;font-weight:700;text-decoration:none;background:#fff;color:var(--t)}
.btn.s{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.55)}
section{padding:7vh 7vw;border-top:1px solid rgba(25,25,25,.1)}h2{font-size:clamp(1.4rem,5vw,2rem);margin-bottom:1rem}
ul{list-style:none}li{padding:.55rem 0;border-bottom:1px solid rgba(25,25,25,.08);color:var(--g)}
.tel{font-size:clamp(1.6rem,7vw,2.4rem);font-weight:700;color:var(--a);text-decoration:none;display:inline-block;margin-top:.4rem}
footer{padding:2.4rem 7vw;color:var(--g);font-size:.85rem}
.aviso{position:fixed;left:0;right:0;bottom:0;background:#191919;color:#fff;padding:.6rem 1rem;font-size:.78rem;text-align:center}</style></head><body>
<div class="hero"><p class="ante">${n.tipo ? n.tipo[0].toUpperCase() + n.tipo.slice(1) : ""}</p><h1>${n.nombre}</h1>
<p class="lema">${lema || ""}</p><div class="acc">
${tel ? `<a class="btn" href="tel:${tel}">Llamar ${n.telefono}</a>` : ""}
<a class="btn s" href="${mapa}" target="_blank" rel="noopener">Cómo llegar</a></div></div>
<section><h2>Dónde estamos</h2><p>${n.direccion}</p></section>
<section><h2>Horario</h2><ul>${horario}</ul></section>
${tel ? `<section><h2>Llámanos</h2><p>Si prefieres, te atendemos por teléfono.</p><a class="tel" href="tel:${tel}">${n.telefono}</a></section>` : ""}
<footer>© ${n.nombre} · ${n.direccion}</footer>
<div class="aviso">Maqueta de muestra con datos públicos de Google</div></body></html>`;
}
$("ver").onclick = () => {
  const doc = html(actual, $("lema").value, color); $("dlgMaq").close();
  const w = window.open("", "_blank"); if (!w) return alert("El navegador ha bloqueado la ventana. Usa Descargar.");
  w.document.write(doc); w.document.close();
};
$("descargar").onclick = () => {
  const doc = html(actual, $("lema").value, color); $("dlgMaq").close();
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([doc], {type: "text/html"}));
  a.download = actual.nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) + ".html"; a.click();
};
$("csv").onclick = () => {
  const cab = ["nombre", "tipo", "direccion", "telefono", "clase", "resenas", "valoracion", "web", "maps"];
  const csv = [cab.join(",")].concat(NEGOCIOS.map(n => cab.map(c => `"${String(n[c] ?? "").replace(/"/g, '""')}"`).join(","))).join("\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], {type: "text/csv"}));
  a.download = "radar_" + new Date().toISOString().slice(0, 10) + ".csv"; a.click();
};
