# panel

Radar de negocios y maquetas, en una página. Funciona en el navegador, también
en el móvil: https://zarkominic.github.io/panel/

**Qué hace**: buscas una zona y unos tipos de negocio, y te dice cuáles **no
tienen web** (ordenados por reseñas, que son los que tienen clientes). De cada
uno: teléfono que llama al pulsarlo, enlace a Maps, y un botón **Maqueta** que
arma su web —nombre, dirección, horario de Google y el teléfono en grande— y la
abre en otra pestaña para enseñársela al dueño ahí mismo.

**En el móvil**: el diálogo sube desde abajo a pantalla completa, y la maqueta se
abre en la misma pestaña (`ver.html`), porque los móviles bloquean las ventanas
nuevas. Un botón «← Panel» arriba vuelve. Medido a 390 px: no desborda.

**La clave de Google no está aquí**. La escribes una vez en el propio panel y se
queda en tu navegador. En Google Cloud: habilita *Places API (New)*, crea una
clave y restríngela a esa API y a `zarkominic.github.io`.

**Coste**: mil consultas gratis al mes; un barrio con tres tipos son unas seis.

**Reglas**:
- Los datos de Places no se guardan: viven mientras la página está abierta
  (Google no permite archivarlos más de 30 días ni hacer bases de datos).
- Nada de correo ni WhatsApp en frío: la LSSI lo prohíbe sin consentimiento.
  El teléfono público de un negocio, para hablar de su negocio, sí.
- «Sin web» significa «la ficha de Google no tiene enlace»: comprueba en Maps
  antes de llamar.
