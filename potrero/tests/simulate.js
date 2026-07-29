/* Test headless con jsdom: carga el index.html modular real (los 31 modulos
   via <script src>) y simula carreras completas cazando crashes de runtime. */
const { JSDOM, ResourceLoader, VirtualConsole } = require("jsdom");
const path = require("path");
const fs = require("fs");

const GAME_DIR = process.argv[2] || require("path").join(__dirname, "..");
const INDEX = path.join(GAME_DIR, "index.html");

let ERRORS = [];

// lee una expresion en el scope global del juego (P es `let`, no vive en window)
function G(win, expr) {
  try { return win.eval(expr); } catch (e) { return undefined; }
}

function loadGame() {
  return new Promise((resolve, reject) => {
    const html = fs.readFileSync(INDEX, "utf-8");
    const vc = new VirtualConsole();
    vc.on("jsdomError", (err) => {
      const m = String(err && err.message || err);
      // ignorar el "Not implemented: navigation" (location.reload del retiro)
      if (/Not implemented|navigation/i.test(m)) return;
      ERRORS.push("jsdomError: " + m);
    });
    const dom = new JSDOM(html, {
      url: "file://" + INDEX,
      runScripts: "dangerously",
      resources: "usable",
      pretendToBeVisual: true,
      virtualConsole: vc,
    });
    const w = dom.window;
    // capturar errores de runtime
    w.addEventListener("error", (e) => {
      ERRORS.push("window.error: " + (e.error ? e.error.stack : e.message));
    });
    w.onerror = (msg, src, line, col, err) => {
      ERRORS.push("onerror: " + (err ? err.stack : msg));
    };
    // esperar a que carguen todos los scripts
    let waited = 0;
    const iv = setInterval(() => {
      waited += 20;
      const ready = typeof w.startCareer === "function" &&
                    typeof w.nextTurn === "function";
      // asegurar que DOMContentLoaded corrio initSelects (selects poblados)
      const posSel = w.document.getElementById("in-pos");
      const populated = posSel && posSel.options.length > 0;
      if (ready && populated) {
        clearInterval(iv);
        resolve(dom);
      } else if (waited > 8000) {
        clearInterval(iv);
        reject(new Error("timeout; ready=" + ready + " populated=" + populated));
      }
    }, 20);
  });
}

function setVal(doc, id, value) {
  const el = doc.getElementById(id);
  el.value = value;
  el.dispatchEvent(new el.ownerDocument.defaultView.Event("change", { bubbles: true }));
}

// Devuelve los botones del elemento de UI "mas fresco" (precedencia realista):
// modal > outcome-box (minijuego/continuar/final/transfer) > ev-choices (evento)
// > slots de lesion. Un humano interactua con lo ultimo que se dibujo.
function actionableButtons(doc) {
  const overlay = doc.getElementById("modal-overlay");
  const modalShown = overlay && overlay.classList.contains("show");
  if (modalShown) {
    return { modal: true, btns: Array.from(doc.querySelectorAll("#modal-box button")) };
  }
  const scopes = ["#outcome-box", "#ev-choices", "#injury-slot-play", "#injury-slot", "#sp-confirm-slot"];
  for (const s of scopes) {
    const root = doc.querySelector(s);
    if (root) {
      const b = Array.from(root.querySelectorAll("button"));
      if (b.length) return { modal: false, btns: b };
    }
  }
  return { modal: false, btns: [] };
}

function pickAndClick(doc, opts) {
  const { modal: modalShown, btns } = actionableButtons(doc);
  if (btns.length === 0) return false;

  let target;
  if (modalShown) {
    // en contratos: firmar la mayoria de las veces; en resultado: entendido
    const sign = btns.find((b) => /Firmar/i.test(b.textContent));
    const ok = btns.find((b) => /Entendido/i.test(b.textContent));
    if (ok) target = ok;
    else if (sign) target = Math.random() < 0.7 ? sign : btns.find((b) => /Rechazar/i.test(b.textContent)) || sign;
    else target = btns[0];
  } else {
    const choices = btns.filter((b) => b.classList.contains("choice"));
    const retireBtn = btns.find((b) => /Colgar los botines|Retirarte|Retirar/i.test(b.textContent));
    const continueBtn = btns.find((b) => /Seguir la carrera|Continuar/i.test(b.textContent));
    if (choices.length) {
      target = choices[Math.floor(Math.random() * choices.length)];
    } else if (continueBtn && retireBtn) {
      // casi siempre seguir; rara vez retirar para testear retiro
      target = Math.random() < (opts.retireChance || 0.02) ? retireBtn : continueBtn;
    } else {
      // minijuego / transferencia / final / gk / injury: click el primero (o skipFinal a veces)
      target = btns[0];
    }
  }
  try {
    target.click();
  } catch (e) {
    ERRORS.push("click threw: " + e.stack);
    return false;
  }
  return true;
}

async function simulate(dom, cfg) {
  const doc = dom.window.document;
  const win = dom.window;
  // configurar formulario
  setVal(doc, "in-name", cfg.name);
  setVal(doc, "in-pos", cfg.pos);      // dispara fillArche
  // elegir arquetipo (primero de la posicion)
  const arche = doc.getElementById("in-arche");
  if (arche.options.length) setVal(doc, "in-arche", arche.options[Math.min(cfg.archeIdx||0, arche.options.length-1)].value);
  // liga/club
  const league = doc.getElementById("in-league");
  if (cfg.leagueIdx != null && league.options[cfg.leagueIdx]) setVal(doc, "in-league", league.options[cfg.leagueIdx].value);
  // repartir puntos al azar
  win.randomize();
  // arrancar
  win.startCareer();

  let steps = 0;
  const maxSteps = cfg.maxSteps || 4000;
  let stuck = 0;
  let maxSeason = 1;
  while (steps < maxSteps) {
    if (G(win, "P && P.retired") === true) break;
    const s = G(win, "P && P.season") || 0;
    if (s > maxSeason) maxSeason = s;
    const clicked = pickAndClick(doc, cfg);
    steps++;
    // procesar timers/microtasks (minijuegos usan setTimeout/rAF; los resolvemos por click)
    await new Promise((r) => setTimeout(r, 0));
    if (!clicked) {
      stuck++;
      if (G(win, "typeof advanceTurn") === "function" && G(win, "currentEvent")) { try { win.eval("advanceTurn()"); } catch(e){ERRORS.push("advanceTurn: "+e.stack);} }
      else if (G(win, "typeof nextTurn") === "function") { try { win.eval("nextTurn()"); } catch(e){ERRORS.push("nextTurn: "+e.stack);} }
      if (stuck > 20) { ERRORS.push("ATASCADO sin botones tras 20 intentos (step "+steps+")"); break; }
    } else {
      stuck = 0;
    }
    if (ERRORS.length > 0 && cfg.stopOnError) break;
  }
  return {
    steps,
    retired: G(win, "P && P.retired") === true,
    age: G(win, "P && P.age"),
    season: G(win, "P && P.season"),
    seasonsPlayed: maxSeason,
    goals: G(win, "P && P.goals"),
    apps: G(win, "P && P.apps"),
    trophies: G(win, "P && P.trophies ? P.trophies.length : 0"),
    money: G(win, "P && P.money"),
    ovr: G(win, "typeof ovr==='function' ? ovr() : null"),
    pos: G(win, "P && P.posGroup"),
    talent: G(win, "P && P.talent ? P.talent.tier : null"),
  };
}

(async () => {
  const runs = [
    { name: "Campo-Delantero", pos: "Delantero",       archeIdx: 0, leagueIdx: 0, maxSteps: 6000, retireChance: 0.06 },
    { name: "Arquero-Test",    pos: "Arquero",         archeIdx: 0, leagueIdx: 1, maxSteps: 6000, retireChance: 0.06 },
    { name: "Campo-Defensor",  pos: "Defensor central",archeIdx: 0, leagueIdx: 2, maxSteps: 6000, retireChance: 0.06 },
    { name: "Campo-Volante",   pos: "Volante central", archeIdx: 1, leagueIdx: 0, maxSteps: 6000, retireChance: 0.06 },
    { name: "Campo-Enganche",  pos: "Enganche",        archeIdx: 0, leagueIdx: 3, maxSteps: 6000, retireChance: 0.06 },
    { name: "Arquero-Libero",  pos: "Arquero",         archeIdx: 1, leagueIdx: 5, maxSteps: 6000, retireChance: 0.06 },
  ];
  let totalOK = 0;
  for (const cfg of runs) {
    ERRORS = [];
    let dom;
    try {
      dom = await loadGame();
    } catch (e) {
      console.log("❌ [" + cfg.name + "] no cargo:", e.message);
      continue;
    }
    const res = await simulate(dom, cfg);
    if (ERRORS.length === 0) {
      totalOK++;
      console.log(`✅ [${cfg.name}] pos=${res.pos} talento=${res.talent} steps=${res.steps} temporadas=${res.seasonsPlayed} edad=${res.age} media=${res.ovr} retirado=${res.retired} goles=${res.goals} PJ=${res.apps} copas=${res.trophies} plata=${res.money}M€`);
    } else {
      console.log(`❌ [${cfg.name}] ${ERRORS.length} error(es). Primeros:`);
      ERRORS.slice(0, 5).forEach((e) => console.log("   - " + e.split("\n").slice(0,3).join(" | ")));
    }
    dom.window.close();
  }
  console.log(`\n=== ${totalOK}/${runs.length} carreras sin crashes ===`);
  process.exit(totalOK === runs.length ? 0 : 1);
})();
