/* moldes.js — cinco moldes de maqueta. Cada uno recibe:
     n  = el negocio de Google (nombre, tipo, direccion, telefono, valoracion, resenas, horario)
     o  = lo que eliges tú (foto, detalle, lema, whatsapp, motivos, color inicial)
   y devuelve el HTML completo de una web de una página.

   Los cinco comparten:
   - selector de color dentro de la propia maqueta: el dueño elige y la web cambia delante de él
   - barra fija abajo: llamar, WhatsApp, cómo llegar
   - aviso de que es una muestra y de que las fotos serían las suyas
*/
const PALETA = [
  ["#8a6410", "Tostado"], ["#1f4d3a", "Verde"], ["#b3402b", "Teja"],
  ["#1b2f7a", "Azul"], ["#6b3fa0", "Morado"], ["#17171a", "Negro"],
];

function comun(n, o){
  const tel = (n.telefono || "").replace(/[^0-9+]/g, "");
  const wa = (o.whatsapp || "").replace(/[^0-9]/g, "");
  const q = encodeURIComponent(n.nombre + " " + n.direccion);
  const barrio = (n.direccion.split(",")[2] || "").trim().replace(/^\d{5}\s*/, "");
  return {tel, wa, q,
    mapa: "https://www.google.com/maps/search/?api=1&query=" + q,
    embed: "https://maps.google.com/maps?q=" + q + "&z=16&output=embed",
    barrio, tipo: n.tipo ? n.tipo[0].toUpperCase() + n.tipo.slice(1) : "",
    horario: (n.horario || []).map(h => `<li>${h}</li>`).join("") || "<li>Pregúntanos el horario</li>",
    estrellas: n.valoracion ? "★".repeat(Math.round(n.valoracion)) : "",
    motivos: (o.motivos || []).filter(Boolean).map(p => { const [t, ...r] = p.split("|"); return {t: t.trim(), d: (r.join("|") || "").trim()}; }),
    anio: new Date().getFullYear()};
}

/* estilos y piezas que se repiten */
const CSS_BASE = c => `:root{--a:${c};--t:#17171a;--g:#6f6f74;--p:#fbfaf7;--linea:rgba(23,23,26,.1)}
*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}
body{font-family:Manrope,system-ui,sans-serif;background:var(--p);color:var(--t);line-height:1.55;font-size:clamp(1.05rem,.4vw + .95rem,1.2rem);padding-bottom:4.6rem;overflow-x:clip}
a{color:inherit}img{max-width:100%;display:block}
h1{font-weight:800;letter-spacing:-.025em;line-height:1.05;overflow-wrap:break-word}
h2{font-size:clamp(1.5rem,5vw,2.2rem);font-weight:700;margin-bottom:1.1rem;letter-spacing:-.01em}
section{padding:8vh 6vw;border-top:1px solid var(--linea)}
.ante{letter-spacing:.2em;text-transform:uppercase;font-size:.76rem;opacity:.85;margin-bottom:.8rem}
.btn{padding:1rem 1.5rem;border-radius:2rem;font-weight:700;text-decoration:none;background:var(--a);color:#fff;display:inline-block}
.btn.b{background:#fff;color:var(--t)}.btn.s{background:transparent;border:1px solid currentColor}
.btn.wa{background:#25d366;color:#fff}
.val{display:inline-flex;align-items:center;gap:.5rem;padding:.45rem .9rem;border-radius:2rem;font-size:.9rem}
.val b{font-weight:800}
ul.horario{list-style:none}ul.horario li{padding:.55rem 0;border-bottom:1px solid var(--linea);color:var(--g)}
iframe{width:100%;aspect-ratio:4/3;border:0;border-radius:14px}
.motivos{display:grid;gap:1.5rem}@media(min-width:760px){.motivos{grid-template-columns:repeat(3,1fr)}}
.motivos b{display:block;font-size:1.12rem;margin-bottom:.25rem;color:var(--a)}.motivos span{color:var(--g)}
.tel{font-size:clamp(1.7rem,7vw,2.6rem);font-weight:800;color:var(--a);text-decoration:none;display:inline-block;letter-spacing:-.02em}
footer{padding:2.6rem 6vw;color:var(--g);font-size:.85rem;border-top:1px solid var(--linea);display:flex;justify-content:space-between;flex-wrap:wrap;gap:.6rem}
.fijo{position:fixed;left:0;right:0;bottom:0;z-index:9;display:flex;gap:.6rem;padding:.7rem 6vw;background:rgba(251,250,247,.94);backdrop-filter:blur(8px);border-top:1px solid var(--linea)}
.fijo a{flex:1;text-align:center;padding:.85rem;border-radius:2rem;font-weight:700;text-decoration:none;background:var(--a);color:#fff}
.fijo a.s{background:#fff;color:var(--t);border:1px solid var(--linea)}
.aviso{position:fixed;top:0;left:0;right:0;z-index:20;background:#17171a;color:#fff;padding:.45rem 1rem;font-size:.74rem;text-align:center}
/* selector de color: lo usa el dueño delante de ti */
.colores{position:fixed;right:1rem;bottom:5.2rem;z-index:11;display:flex;flex-direction:column;gap:.5rem;align-items:center}
.colores button{width:34px;height:34px;border-radius:50%;border:3px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,.28);cursor:pointer;padding:0}
.colores .eti{background:rgba(23,23,26,.8);color:#fff;font-size:.68rem;padding:.2rem .55rem;border-radius:1rem;font-family:inherit}`;

const PIE = (n, c) => `<footer><span>© ${c.anio} ${n.nombre}</span><span>${n.direccion}</span></footer>
<div class="fijo">${c.tel ? `<a href="tel:${c.tel}">Llamar</a>` : ""}${c.wa ? `<a class="s" href="https://wa.me/${c.wa}" target="_blank" rel="noopener">WhatsApp</a>` : ""}<a class="s" href="${c.mapa}" target="_blank" rel="noopener">Cómo llegar</a></div>
<div class="colores">${PALETA.map(([col, nom]) => `<button title="${nom}" style="background:${col}" onclick="pinta('${col}')"></button>`).join("")}<span class="eti">color</span></div>
<script>function pinta(c){document.documentElement.style.setProperty('--a',c);}</script>`;

const CABEZA = (n, c, css) => `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${n.nombre}${c.barrio ? " — " + c.barrio : ""}</title>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;500;700;800&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<style>${css}</style></head><body>
<div class="aviso">Maqueta de muestra · las fotos son de archivo: en tu web irían las tuyas</div>`;

/* ══════════ 1. CERCANO — para bar, panadería, tienda de barrio ══════════ */
function moldeCercano(n, o){
  const c = comun(n, o);
  return CABEZA(n, c, CSS_BASE(o.color) + `
.hero{position:relative;min-height:86vh;display:flex;flex-direction:column;justify-content:flex-end;padding:0 6vw 7vh;color:#fff;overflow:hidden}
.hero img.f{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero .v{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.3),rgba(0,0,0,.1) 35%,rgba(0,0,0,.82))}
.hero .x{position:relative}h1{font-size:clamp(2rem,8vw,4.4rem)}
.lema{margin-top:1rem;font-size:clamp(1.05rem,3.6vw,1.5rem);font-weight:300;opacity:.95;max-width:28ch}
.hero .val{background:rgba(255,255,255,.16);backdrop-filter:blur(6px);margin-top:1.1rem}
.acc{display:flex;flex-wrap:wrap;gap:.7rem;margin-top:1.8rem}
.dos{display:grid;gap:2.2rem}@media(min-width:860px){.dos{grid-template-columns:1fr 1fr}}`) + `
<div class="hero"><img class="f" src="img/${o.foto}.jpg" alt=""><div class="v"></div><div class="x">
  <p class="ante">${[c.tipo, c.barrio].filter(Boolean).join(" · ")}</p><h1>${n.nombre}</h1>
  ${o.lema ? `<p class="lema">${o.lema}</p>` : ""}
  ${n.valoracion ? `<div class="val"><b>${n.valoracion}</b> ${c.estrellas} <span style="opacity:.85">· ${n.resenas} reseñas</span></div>` : ""}
  <div class="acc">${c.tel ? `<a class="btn b" href="tel:${c.tel}">Llamar ${n.telefono}</a>` : ""}${c.wa ? `<a class="btn wa" href="https://wa.me/${c.wa}">WhatsApp</a>` : ""}<a class="btn s" style="color:#fff" href="#donde">Cómo llegar</a></div>
</div></div>
${c.motivos.length ? `<section><h2>${o.tituloMotivos || "Por qué venir"}</h2><div class="motivos">${c.motivos.map(m => `<div><b>${m.t}</b><span>${m.d}</span></div>`).join("")}</div></section>` : ""}
<section id="donde"><div class="dos"><div><h2>Dónde estamos</h2><p>${n.direccion}</p>
  <p style="margin-top:1.2rem"><a class="btn" href="${c.mapa}" target="_blank" rel="noopener">Abrir en el mapa</a></p>
  <div style="margin-top:2.4rem"><h2>Horario</h2><ul class="horario">${c.horario}</ul></div></div>
  <iframe loading="lazy" src="${c.embed}" title="Mapa"></iframe></div></section>
${c.tel ? `<section><h2>Llámanos</h2><p>Te atendemos nosotros, no una máquina.</p><a class="tel" href="tel:${c.tel}">${n.telefono}</a></section>` : ""}
` + PIE(n, c) + `</body></html>`;
}

/* ══════════ 2. CARTA — para restaurante y bar de comidas ══════════ */
function moldeCarta(n, o){
  const c = comun(n, o);
  const platos = (o.motivos || []).filter(Boolean).map(p => { const [t, d, pr] = p.split("|"); return {t: (t||"").trim(), d: (d||"").trim(), pr: (pr||"").trim()}; });
  return CABEZA(n, c, CSS_BASE(o.color) + `
.hero{position:relative;min-height:74vh;display:grid;place-items:center;text-align:center;color:#fff;overflow:hidden;padding:12vh 6vw 8vh}
.hero img.f{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero .v{position:absolute;inset:0;background:rgba(0,0,0,.52)}
.hero .x{position:relative}
h1{font-family:"Instrument Serif",Georgia,serif;font-weight:400;font-size:clamp(2.2rem,9vw,5.2rem);letter-spacing:-.01em}
.lema{font-family:"Instrument Serif",serif;font-style:italic;font-size:clamp(1.2rem,4.4vw,1.9rem);margin-top:.6rem;opacity:.95}
.hero .val{background:rgba(255,255,255,.16);margin-top:1.4rem}
.carta{display:grid;gap:1.1rem;max-width:720px;margin:0 auto}
.plato{display:grid;grid-template-columns:1fr auto;gap:.6rem 1rem;padding-bottom:.9rem;border-bottom:1px dashed var(--linea)}
.plato b{font-family:"Instrument Serif",serif;font-weight:400;font-size:1.35rem}
.plato span{color:var(--g);font-size:.95rem;grid-column:1}
.plato .pr{font-weight:700;color:var(--a);white-space:nowrap}
.centro{text-align:center}.centro h2{font-family:"Instrument Serif",serif;font-weight:400;font-size:clamp(1.8rem,6vw,2.6rem)}
.det{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:14px;margin-bottom:2rem}`) + `
<div class="hero"><img class="f" src="img/${o.foto}.jpg" alt=""><div class="v"></div><div class="x">
  <p class="ante">${[c.tipo, c.barrio].filter(Boolean).join(" · ")}</p><h1>${n.nombre}</h1>
  ${o.lema ? `<p class="lema">${o.lema}</p>` : ""}
  ${n.valoracion ? `<div class="val"><b>${n.valoracion}</b> ${c.estrellas} <span style="opacity:.85">· ${n.resenas} reseñas</span></div>` : ""}
</div></div>
${platos.length ? `<section class="centro"><h2>${o.tituloMotivos || "La carta"}</h2>
  ${o.detalle ? `<img class="det" src="img/${o.detalle}.jpg" alt="">` : ""}
  <div class="carta">${platos.map(p => `<div class="plato"><b>${p.t}</b>${p.pr ? `<span class="pr">${p.pr}</span>` : "<span></span>"}${p.d ? `<span>${p.d}</span>` : ""}</div>`).join("")}</div></section>` : ""}
<section id="donde" class="centro"><h2>Reserva o pásate</h2><p>${n.direccion}</p>
  <p style="margin:1.4rem 0"><a class="btn" href="tel:${c.tel}">Reservar por teléfono</a></p>
  <ul class="horario" style="max-width:420px;margin:2rem auto 0;text-align:left">${c.horario}</ul>
  <div style="max-width:560px;margin:2rem auto 0"><iframe loading="lazy" src="${c.embed}" title="Mapa"></iframe></div></section>
` + PIE(n, c) + `</body></html>`;
}

/* ══════════ 3. CITA — para peluquería, estética, clínica, spa ══════════ */
function moldeCita(n, o){
  const c = comun(n, o);
  const servicios = (o.motivos || []).filter(Boolean).map(p => { const [t, d, pr] = p.split("|"); return {t: (t||"").trim(), d: (d||"").trim(), pr: (pr||"").trim()}; });
  return CABEZA(n, c, CSS_BASE(o.color) + `
.hero{display:grid;gap:0;min-height:80vh;padding-top:2.4rem}
@media(min-width:860px){.hero{grid-template-columns:1fr 1fr;align-items:center}}
.hero .x{padding:8vh 6vw}
.hero img.f{width:100%;height:100%;min-height:42vh;object-fit:cover}
h1{font-size:clamp(2rem,7vw,3.8rem)}
.lema{margin-top:1rem;color:var(--g);font-size:clamp(1.05rem,3.4vw,1.4rem);max-width:30ch}
.val{background:rgba(23,23,26,.06);margin-top:1.2rem}
.acc{display:flex;flex-wrap:wrap;gap:.7rem;margin-top:1.8rem}
.serv{display:grid;gap:.8rem;max-width:720px}
.serv div{display:grid;grid-template-columns:1fr auto;gap:.3rem 1rem;background:#fff;border:1px solid var(--linea);border-radius:14px;padding:1rem 1.2rem}
.serv b{font-size:1.1rem}.serv .pr{font-weight:800;color:var(--a);white-space:nowrap}
.serv span.d{grid-column:1/-1;color:var(--g);font-size:.92rem}
.paso{display:grid;grid-template-columns:2.2rem 1fr;gap:1rem;padding:1rem 0;border-bottom:1px solid var(--linea)}
.paso b{color:var(--a);font-size:1.3rem}`) + `
<div class="hero"><div class="x">
  <p class="ante">${[c.tipo, c.barrio].filter(Boolean).join(" · ")}</p><h1>${n.nombre}</h1>
  ${o.lema ? `<p class="lema">${o.lema}</p>` : ""}
  ${n.valoracion ? `<div class="val"><b>${n.valoracion}</b> ${c.estrellas} <span style="color:var(--g)">· ${n.resenas} reseñas</span></div>` : ""}
  <div class="acc">${c.tel ? `<a class="btn" href="tel:${c.tel}">Pedir cita: ${n.telefono}</a>` : ""}${c.wa ? `<a class="btn wa" href="https://wa.me/${c.wa}">Pedir por WhatsApp</a>` : ""}</div>
</div><img class="f" src="img/${o.foto}.jpg" alt=""></div>
${servicios.length ? `<section><h2>${o.tituloMotivos || "Servicios"}</h2><div class="serv">${servicios.map(s => `<div><b>${s.t}</b>${s.pr ? `<span class="pr">${s.pr}</span>` : "<span></span>"}${s.d ? `<span class="d">${s.d}</span>` : ""}</div>`).join("")}</div></section>` : ""}
<section><h2>Cómo pedir cita</h2>
  <div class="paso"><b>1</b><div><b>Llama o escribe</b><div style="color:var(--g)">Al ${n.telefono || "teléfono"}${c.wa ? ", o por WhatsApp" : ""}.</div></div></div>
  <div class="paso"><b>2</b><div><b>Te damos hora</b><div style="color:var(--g)">La que mejor te venga, y te la recordamos.</div></div></div>
  <div class="paso"><b>3</b><div><b>Te esperamos</b><div style="color:var(--g)">${n.direccion}</div></div></div></section>
<section id="donde"><h2>Dónde y cuándo</h2><p>${n.direccion}</p>
  <ul class="horario" style="margin-top:1.4rem">${c.horario}</ul>
  <div style="margin-top:2rem;max-width:620px"><iframe loading="lazy" src="${c.embed}" title="Mapa"></iframe></div></section>
` + PIE(n, c) + `</body></html>`;
}

/* ══════════ 4. OFICIO — para taller, reforma, mecánico, servicios ══════════ */
function moldeOficio(n, o){
  const c = comun(n, o);
  return CABEZA(n, c, CSS_BASE(o.color) + `
body{background:#111}
.hero{position:relative;min-height:78vh;display:flex;align-items:flex-end;padding:0 6vw 7vh;color:#fff;overflow:hidden}
.hero img.f{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:grayscale(.25) contrast(1.05)}
.hero .v{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.45),rgba(0,0,0,.85))}
.hero .x{position:relative}
h1{font-size:clamp(1.7rem,7vw,4.2rem);text-transform:uppercase;letter-spacing:-.02em}
.lema{margin-top:1rem;font-size:clamp(1.05rem,3.4vw,1.4rem);opacity:.9;max-width:30ch}
.hero .val{background:rgba(255,255,255,.14);margin-top:1.2rem}
.acc{display:flex;flex-wrap:wrap;gap:.7rem;margin-top:1.8rem}
section{background:#fbfaf7;border-top:0}
section.oscura{background:#17171a;color:#fff}section.oscura .motivos span{color:rgba(255,255,255,.7)}
.num{display:grid;gap:1.4rem}@media(min-width:760px){.num{grid-template-columns:repeat(3,1fr)}}
.num div b{display:block;font-size:2.4rem;color:var(--a);line-height:1}
.num div span{color:var(--g)}
.dos{display:grid;gap:2.2rem}@media(min-width:860px){.dos{grid-template-columns:1fr 1fr}}`) + `
<div class="hero"><img class="f" src="img/${o.foto}.jpg" alt=""><div class="v"></div><div class="x">
  <p class="ante">${[c.tipo, c.barrio].filter(Boolean).join(" · ")}</p><h1>${n.nombre}</h1>
  ${o.lema ? `<p class="lema">${o.lema}</p>` : ""}
  ${n.valoracion ? `<div class="val"><b>${n.valoracion}</b> ${c.estrellas} <span style="opacity:.85">· ${n.resenas} reseñas</span></div>` : ""}
  <div class="acc">${c.tel ? `<a class="btn b" href="tel:${c.tel}">Pedir presupuesto</a>` : ""}${c.wa ? `<a class="btn wa" href="https://wa.me/${c.wa}">WhatsApp</a>` : ""}</div>
</div></div>
${c.motivos.length ? `<section class="oscura"><h2>${o.tituloMotivos || "Lo que hacemos"}</h2><div class="motivos">${c.motivos.map(m => `<div><b>${m.t}</b><span>${m.d.replace(/\|/g, " · ")}</span></div>`).join("")}</div></section>` : ""}
${n.valoracion ? `<section><h2>Lo dicen los clientes</h2><div class="num">
  <div><b>${n.valoracion}</b><span>de 5 en Google</span></div>
  <div><b>${n.resenas}</b><span>reseñas</span></div>
  <div><b>${c.barrio || "Aquí"}</b><span>donde trabajamos</span></div></div></section>` : ""}
<section id="donde"><div class="dos"><div><h2>Dónde estamos</h2><p>${n.direccion}</p>
  <div style="margin-top:2rem"><h2>Horario</h2><ul class="horario">${c.horario}</ul></div>
  ${c.tel ? `<p style="margin-top:2rem"><a class="tel" href="tel:${c.tel}">${n.telefono}</a></p>` : ""}</div>
  <iframe loading="lazy" src="${c.embed}" title="Mapa"></iframe></div></section>
` + PIE(n, c) + `</body></html>`;
}

/* ══════════ 5. ESCAPARATE — para tienda y comercio con producto ══════════ */
function moldeEscaparate(n, o){
  const c = comun(n, o);
  const prods = (o.motivos || []).filter(Boolean).map(p => { const [t, d, pr] = p.split("|"); return {t: (t||"").trim(), d: (d||"").trim(), pr: (pr||"").trim()}; });
  return CABEZA(n, c, CSS_BASE(o.color) + `
.hero{padding:14vh 6vw 6vh;display:grid;gap:2rem}
@media(min-width:860px){.hero{grid-template-columns:1.1fr 1fr;align-items:center}}
h1{font-size:clamp(2.1rem,8vw,4.4rem)}
.lema{margin-top:1rem;color:var(--g);font-size:clamp(1.05rem,3.4vw,1.4rem);max-width:30ch}
.val{background:rgba(23,23,26,.06);margin-top:1.2rem}
.acc{display:flex;flex-wrap:wrap;gap:.7rem;margin-top:1.6rem}
.hero img.f{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:18px}
.rej{display:grid;gap:1.2rem}@media(min-width:620px){.rej{grid-template-columns:repeat(3,1fr)}}
.prod{background:#fff;border:1px solid var(--linea);border-radius:16px;overflow:hidden}
.prod img{width:100%;aspect-ratio:1;object-fit:cover}
.prod .t{padding:.9rem 1rem}.prod b{display:block}.prod span{color:var(--g);font-size:.9rem}
.prod .pr{font-weight:800;color:var(--a);margin-top:.3rem;display:block}
.dos{display:grid;gap:2.2rem}@media(min-width:860px){.dos{grid-template-columns:1fr 1fr}}`) + `
<div class="hero"><div>
  <p class="ante">${[c.tipo, c.barrio].filter(Boolean).join(" · ")}</p><h1>${n.nombre}</h1>
  ${o.lema ? `<p class="lema">${o.lema}</p>` : ""}
  ${n.valoracion ? `<div class="val"><b>${n.valoracion}</b> ${c.estrellas} <span style="color:var(--g)">· ${n.resenas} reseñas</span></div>` : ""}
  <div class="acc">${c.wa ? `<a class="btn wa" href="https://wa.me/${c.wa}">Pedir por WhatsApp</a>` : ""}${c.tel ? `<a class="btn" href="tel:${c.tel}">Llamar</a>` : ""}</div>
</div><img class="f" src="img/${o.foto}.jpg" alt=""></div>
${prods.length ? `<section><h2>${o.tituloMotivos || "Lo que tenemos"}</h2><div class="rej">${prods.map(p => `<div class="prod">${o.detalle ? `<img src="img/${o.detalle}.jpg" alt="">` : ""}<div class="t"><b>${p.t}</b>${p.d ? `<span>${p.d}</span>` : ""}${p.pr ? `<span class="pr">${p.pr}</span>` : ""}</div></div>`).join("")}</div>
<p style="margin-top:1.6rem;color:var(--g)">¿Quieres algo que no ves aquí? Pregúntanos.</p></section>` : ""}
<section id="donde"><div class="dos"><div><h2>Dónde estamos</h2><p>${n.direccion}</p>
  <div style="margin-top:2rem"><h2>Horario</h2><ul class="horario">${c.horario}</ul></div></div>
  <iframe loading="lazy" src="${c.embed}" title="Mapa"></iframe></div></section>
` + PIE(n, c) + `</body></html>`;
}

const MOLDES = {
  cercano:    {nombre: "Cercano · bar, panadería, barrio", fn: moldeCercano, ayuda: "Motivo | explicación"},
  carta:      {nombre: "Carta · restaurante, comidas",     fn: moldeCarta,   ayuda: "Plato | descripción | 12 €"},
  cita:       {nombre: "Cita · peluquería, estética, clínica", fn: moldeCita, ayuda: "Servicio | descripción | 25 €"},
  oficio:     {nombre: "Oficio · taller, reformas, servicios", fn: moldeOficio, ayuda: "Trabajo | explicación"},
  escaparate: {nombre: "Escaparate · tienda, producto",    fn: moldeEscaparate, ayuda: "Producto | descripción | 19 €"},
};

/* qué molde propone el panel según el tipo de negocio */
function moldePara(tipo){
  const t = (tipo || "").toLowerCase();
  if (/restaur|comida|cocina|asador|pizzer|marisqu|tapas/.test(t)) return "carta";
  if (/peluqu|barber|estetic|spa|uñas|belleza|clinic|dentist|fisio/.test(t)) return "cita";
  if (/taller|reparac|mecan|carpint|fontaner|electric|reforma|ferret|pintur/.test(t)) return "oficio";
  if (/tienda|ropa|moda|boutique|zapat|regalo|libr|flor|joyer|opti/.test(t)) return "escaparate";
  return "cercano";
}
