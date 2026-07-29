# El Camino — Carrera de Potrero ⚽

Modo carrera de jugador de fútbol (RPG), mobile-first, en español rioplatense.
De potrero a leyenda: decisiones estilo "elegí tu aventura", finales, premios,
plata, prensa, pareja y fama.

## Cómo jugar

Abrí **`index.html`** en cualquier navegador (doble clic alcanza). No necesita
servidor ni internet: la foto de fondo va embebida y el juego corre entero en
el navegador.

## Cómo está organizado (paso 1: modularización)

Antes era **un solo `potrero.html`** con todo el código adentro. Ahora está
partido en archivos chicos, ordenados por tema, pero **funciona exactamente
igual** (no cambió ni una coma de la lógica ni del diseño).

```
potrero/
├── index.html                 ← la página; carga el CSS y los módulos en orden
├── styles.css                 ← todo el estilo (paleta, fondo del estadio)
├── data/                      ← todos los datos del juego
│   ├── 01-naciones.js
│   ├── 02-ligas.js            ← ligas y clubes reales
│   ├── 03-posiciones.js       ← posiciones, arquetipos y topes por stat
│   ├── 04-eventos.js          ← eventos normales (decisiones)
│   ├── 05-eventos-random.js   ← eventos aleatorios / 50-50
│   └── 06-prensa.js           ← preguntas de ruedas de prensa
├── engine/                    ← el motor (estado, turnos, temporada, retiro…)
│   ├── 01-estado.js  02-editor.js  03-talento.js  04-crear.js  05-ovr.js
│   ├── 06-turnos.js  07-lesiones.js  08-transferencias.js
│   ├── 09-finales-club.js  10-seleccion.js
│   └── 11-temporada.js  12-progresion.js  13-retiro.js
├── events/                    ← lógica de eventos (usa los datos de data/)
│   ├── 02-eventos.js  03-prensa-turno.js  04-arquero.js
├── economy/                   ← plata, contratos, gastos, jeques, representante
│   ├── 01-clubes-sueldos.js  02-gastos-inversiones.js  03-contratos.js
│   ├── 04-jeque.js  05-finanzas.js  06-representante.js
├── ui/                        ← lo que se ve y se toca
│   ├── 01-hold-repeat.js  02-panel.js  03-toast-init.js  04-modales.js
├── minigames/
│   └── 01-minijuegos.js       ← timing, potencia, reflejos, suerte y los de arco
└── tests/
    └── simulate.js            ← test headless (jsdom)
```

**Detalle técnico importante:** los archivos se cargan como *scripts clásicos*
en el orden que fija `index.html` (no como ES modules). Es a propósito: así se
mantienen los `onclick` del HTML y el juego se puede abrir con doble clic sin
servidor. El orden de carga es el mismo orden que tenían las secciones en el
`potrero.html` original, por eso el comportamiento es idéntico.

## Testeo

El prototipo se valida simulando carreras completas con un DOM headless
(jsdom): crea jugadores (de campo y arqueros, varias posiciones/arquetipos),
juega decenas de temporadas, resuelve eventos, minijuegos, transferencias,
contratos, lesiones y prensa, y verifica que **no haya crashes**.

```bash
cd potrero
npm install      # instala jsdom (solo la primera vez)
npm test
```

Salida esperada: `=== 6/6 carreras sin crashes ===`.

## Qué sigue (roadmap acordado)

1. ✅ **Modularizar** el HTML monolítico (este paso).
2. ⬜ Persistencia / guardado de partida (localStorage, varios slots).
3. ⬜ Sacar el balance a un archivo de configuración.
4. ⬜ Todas las ligas del mundo con clubes reales (dataset offline vía API).
5. ⬜ Contenido nuevo (historial, estadísticas, eliminatorias, hitos, retiro).
