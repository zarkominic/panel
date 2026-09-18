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
  $("foto").value = fotoPara(actual.tipo + " " + actual.nombre);
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

function html(n, o){
  const tel = (n.telefono || "").replace(/[^0-9+]/g, "");
  const wa = (o.whatsapp || "").replace(/[^0-9]/g, "");
  const dias = n.horario || [];
  const horario = dias.map(h => `<li>${h}</li>`).join("") || "<li>Pregúntanos el horario</li>";
  const q = encodeURIComponent(n.nombre + " " + n.direccion);
  const mapa = "https://www.google.com/maps/search/?api=1&query=" + q;
  const embed = "https://maps.google.com/maps?q=" + q + "&z=16&output=embed";
  const estrellas = n.valoracion ? "★".repeat(Math.round(n.valoracion)) : "";
  const puntos = (o.puntos || []).filter(Boolean);
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${n.nombre} — ${n.direccion.split(",")[0]}</title>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;500;700;800&display=swap" rel="stylesheet">
<style>:root{--a:${o.color};--t:#17171a;--g:#6f6f74;--p:#fbfaf7;--linea:rgba(23,23,26,.1)}
*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}
body{font-family:Manrope,system-ui,sans-serif;background:var(--p);color:var(--t);line-height:1.55;font-size:clamp(1.05rem,.4vw + .95rem,1.2rem);padding-bottom:4.5rem;overflow-x:clip}
a{color:inherit}
.barra{position:fixed;top:0;left:0;right:0;z-index:9;display:flex;justify-content:space-between;align-items:center;padding:.9rem 6vw;color:#fff;font-weight:700;background:linear-gradient(180deg,rgba(0,0,0,.45),transparent)}
.barra .n{font-size:1rem;letter-spacing:.02em}.barra a{font-size:.85rem;font-weight:500;opacity:.9;margin-left:1rem;text-decoration:none}
.hero{position:relative;min-height:88vh;display:flex;flex-direction:column;justify-content:flex-end;padding:0 6vw 7vh;color:#fff;overflow:hidden}
.hero img.fondo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero .velo{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.35) 0%,rgba(0,0,0,.15) 35%,rgba(0,0,0,.82) 100%)}
.hero .txt{position:relative}
.ante{letter-spacing:.2em;text-transform:uppercase;font-size:.78rem;opacity:.85;margin-bottom:.8rem}
h1{font-size:clamp(2rem,8vw,4.6rem);font-weight:800;line-height:1.05;letter-spacing:-.025em;overflow-wrap:break-word;hyphens:auto}
.lema{margin-top:1rem;font-size:clamp(1.1rem,3.6vw,1.6rem);font-weight:300;opacity:.95;max-width:28ch}
.val{display:inline-flex;align-items:center;gap:.5rem;margin-top:1.2rem;background:rgba(255,255,255,.14);backdrop-filter:blur(6px);padding:.45rem .9rem;border-radius:2rem;font-size:.9rem}
.val b{font-weight:800}
.acc{display:flex;flex-wrap:wrap;gap:.7rem;margin-top:2rem}
.btn{padding:1rem 1.5rem;border-radius:2rem;font-weight:700;text-decoration:none;background:#fff;color:var(--t);display:inline-block}
.btn.s{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.6)}
.btn.wa{background:#25d366;color:#fff}
section{padding:8vh 6vw;border-top:1px solid var(--linea)}
h2{font-size:clamp(1.5rem,5vw,2.2rem);font-weight:700;margin-bottom:1.2rem;letter-spacing:-.01em}
.puntos{display:grid;gap:1.6rem;margin-top:.6rem}
@media(min-width:760px){.puntos{grid-template-columns:repeat(3,1fr)}}
.puntos div b{display:block;font-size:1.15rem;margin-bottom:.3rem;color:var(--a)}
.puntos div span{color:var(--g)}
.dos{display:grid;gap:2.4rem}@media(min-width:860px){.dos{grid-template-columns:1fr 1fr;align-items:start}}
ul.horario{list-style:none}ul.horario li{padding:.55rem 0;border-bottom:1px solid var(--linea);color:var(--g)}
iframe{width:100%;aspect-ratio:4/3;border:0;border-radius:14px;filter:grayscale(.15)}
.tel{font-size:clamp(1.7rem,7vw,2.6rem);font-weight:800;color:var(--a);text-decoration:none;display:inline-block;margin-top:.4rem;letter-spacing:-.02em}
footer{padding:2.6rem 6vw;color:var(--g);font-size:.85rem;border-top:1px solid var(--linea);display:flex;justify-content:space-between;flex-wrap:wrap;gap:.6rem}
.fijo{position:fixed;left:0;right:0;bottom:0;z-index:9;display:flex;gap:.6rem;padding:.7rem 6vw;background:rgba(251,250,247,.94);backdrop-filter:blur(8px);border-top:1px solid var(--linea)}
.fijo a{flex:1;text-align:center;padding:.85rem;border-radius:2rem;font-weight:700;text-decoration:none;background:var(--a);color:#fff}
.fijo a.s{background:#fff;color:var(--t);border:1px solid var(--linea)}
.aviso{position:fixed;top:0;left:0;right:0;z-index:20;background:#17171a;color:#fff;padding:.45rem 1rem;font-size:.75rem;text-align:center}
.aviso + .barra{top:1.9rem}
</style></head><body>
<div class="aviso">Maqueta de muestra · la foto es de archivo: en tu web irían las tuyas</div>
<div class="barra"><span class="n">${n.nombre}</span><span><a href="#donde">Dónde</a><a href="#horario">Horario</a>${tel?`<a href="tel:${tel}">Llamar</a>`:""}</span></div>

<div class="hero">
  <img class="fondo" src="img/${o.foto}.jpg" alt="">
  <div class="velo"></div>
  <div class="txt">
    <p class="ante">${[n.tipo ? n.tipo[0].toUpperCase() + n.tipo.slice(1) : "", (n.direccion.split(",")[2] || "").trim().replace(/^\d{5}\s*/, "")].filter(Boolean).join(" · ")}</p>
    <h1>${n.nombre}</h1>
    ${o.lema ? `<p class="lema">${o.lema}</p>` : ""}
    ${n.valoracion ? `<div class="val"><b>${n.valoracion}</b> <span>${estrellas}</span> <span style="opacity:.8">· ${n.resenas} reseñas en Google</span></div>` : ""}
    <div class="acc">
      ${tel ? `<a class="btn" href="tel:${tel}">Llamar ${n.telefono}</a>` : ""}
      ${wa ? `<a class="btn wa" href="https://wa.me/${wa}" target="_blank" rel="noopener">WhatsApp</a>` : ""}
      <a class="btn s" href="#donde">Cómo llegar</a>
    </div>
  </div>
</div>

${puntos.length ? `<section><h2>${o.tituloPuntos || "Por qué venir"}</h2><div class="puntos">
  ${puntos.map(p => { const [t, ...r] = p.split("|"); return `<div><b>${t.trim()}</b><span>${(r.join("|") || "").trim()}</span></div>`; }).join("")}
</div></section>` : ""}

<section id="donde"><div class="dos">
  <div><h2>Dónde estamos</h2><p>${n.direccion}</p>
    <p style="margin-top:1.2rem"><a class="btn" style="background:var(--a);color:#fff" href="${mapa}" target="_blank" rel="noopener">Abrir en el mapa</a></p>
    <div id="horario" style="margin-top:2.4rem"><h2>Horario</h2><ul class="horario">${horario}</ul></div>
  </div>
  <iframe loading="lazy" src="${embed}" title="Mapa"></iframe>
</div></section>

${tel ? `<section><h2>Llámanos</h2><p>Te atendemos nosotros, no una máquina.</p><a class="tel" href="tel:${tel}">${n.telefono}</a></section>` : ""}

<footer><span>© ${new Date().getFullYear()} ${n.nombre}</span><span>${n.direccion}</span></footer>
<div class="fijo">${tel ? `<a href="tel:${tel}">Llamar</a>` : ""}${wa ? `<a class="s" href="https://wa.me/${wa}" target="_blank" rel="noopener">WhatsApp</a>` : ""}<a class="s" href="${mapa}" target="_blank" rel="noopener">Cómo llegar</a></div>
</body></html>`;
}

function opciones(){
  return {color, foto: $("foto").value, lema: $("lema").value.trim(), whatsapp: $("whatsapp").value.trim(),
          tituloPuntos: $("tituloPuntos").value.trim(),
          puntos: [$("p1").value, $("p2").value, $("p3").value]};
}
$("ver").onclick = () => {
  const doc = html(actual, opciones()); $("dlgMaq").close();
  const w = window.open("", "_blank"); if (!w) return alert("El navegador ha bloqueado la ventana. Usa Descargar.");
  const abs = doc.replace('src="img/', 'src="' + location.origin + location.pathname.replace(/[^/]*$/, "") + 'img/');
  w.document.write(abs); w.document.close();
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
