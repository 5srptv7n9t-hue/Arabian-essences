/* Prueba de EQUIVALENCIA de balance.
   Siembra Math.random con un PRNG y juega con decisiones 100% deterministas,
   capturando un "hash" del recorrido de estado del jugador. Sirve para
   confirmar que un refactor (p.ej. sacar numeros a config) NO cambia el balance:
   si el hash queda igual, el comportamiento es identico.

   Uso:
     node tests/equivalence.js            -> imprime hashes de la version actual
     node tests/equivalence.js baseline.json  -> compara contra un baseline guardado
*/
const { JSDOM, VirtualConsole } = require("jsdom");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const GAME_DIR = path.join(__dirname, "..");
const INDEX = path.join(GAME_DIR, "index.html");
const BASELINE = process.argv[2] ? path.resolve(process.argv[2]) : null;

// PRNG determinista (mulberry32)
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeLocalStorage(store) {
  return {
    getItem(k) { return store.has(String(k)) ? store.get(String(k)) : null; },
    setItem(k, v) { store.set(String(k), String(v)); },
    removeItem(k) { store.delete(String(k)); },
    clear() { store.clear(); },
    key(i) { const ks = Array.from(store.keys()); return i < ks.length ? ks[i] : null; },
    get length() { return store.size; },
  };
}

function loadSeeded(seed) {
  return new Promise((resolve, reject) => {
    const html = fs.readFileSync(INDEX, "utf-8");
    const vc = new VirtualConsole();
    const errors = [];
    vc.on("jsdomError", (e) => { const m = String(e && e.message || e); if (!/Not implemented|navigation/i.test(m)) errors.push(m); });
    const dom = new JSDOM(html, {
      url: "file://" + INDEX,
      runScripts: "dangerously",
      resources: "usable",
      pretendToBeVisual: true,
      virtualConsole: vc,
      beforeParse(window) {
        // congelar aleatoriedad y tiempo para trazas reproducibles
        window.Math.random = mulberry32(seed);
        const fixedNow = 1700000000000;
        window.Date.now = () => fixedNow;
        Object.defineProperty(window, "localStorage", { value: makeLocalStorage(new Map()), configurable: true });
      },
    });
    dom._errors = errors;
    const w = dom.window;
    let waited = 0;
    const iv = setInterval(() => {
      waited += 20;
      const ready = typeof w.startCareer === "function" && typeof w.nextTurn === "function";
      const pos = w.document.getElementById("in-pos");
      if (ready && pos && pos.options.length > 0) { clearInterval(iv); resolve(dom); }
      else if (waited > 8000) { clearInterval(iv); reject(new Error("timeout")); }
    }, 20);
  });
}

function setVal(doc, id, value) {
  const el = doc.getElementById(id);
  el.value = value;
  el.dispatchEvent(new doc.defaultView.Event("change", { bubbles: true }));
}

// politica 100% determinista: primer boton accionable, sin usar Math.random
function firstButton(doc) {
  const overlay = doc.getElementById("modal-overlay");
  if (overlay && overlay.classList.contains("show")) {
    const b = doc.querySelectorAll("#modal-box button");
    if (b.length) {
      // preferir Firmar / Entendido para avanzar de forma estable
      const sign = Array.from(b).find(x => /Firmar|Entendido/i.test(x.textContent));
      return sign || b[0];
    }
  }
  for (const s of ["#outcome-box", "#ev-choices", "#injury-slot-play", "#injury-slot"]) {
    const root = doc.querySelector(s);
    if (root) { const b = root.querySelectorAll("button"); if (b.length) return b[0]; }
  }
  return null;
}

function fingerprint(win) {
  const f = win.eval(`(function(){
    if(!P) return 'noP';
    var st = STAT_KEYS.map(function(s){return P.stats[s.k]}).join(',');
    return [P.age,P.season,P.goals,P.assists,P.apps,P.fama,P.honor,P.sp,
            P.money,P.mediaStar,P.clubIdol,ovr(),
            (P.injury?P.injury.seasons:'-'),
            P.club,(P.role?P.role.id:'-'),P.talent.tier,
            P.trophies.length, st].join('|');
  })()`);
  return f;
}

async function runTrace(cfg) {
  const dom = await loadSeeded(cfg.seed);
  const win = dom.window, doc = win.document;
  setVal(doc, "in-name", cfg.name);
  setVal(doc, "in-pos", cfg.pos);
  const arche = doc.getElementById("in-arche");
  if (arche.options.length) setVal(doc, "in-arche", arche.options[Math.min(cfg.archeIdx || 0, arche.options.length - 1)].value);
  const league = doc.getElementById("in-league");
  if (cfg.leagueIdx != null && league.options[cfg.leagueIdx]) setVal(doc, "in-league", league.options[cfg.leagueIdx].value);
  win.randomize();
  win.startCareer();

  const h = crypto.createHash("sha256");
  const checkpoints = {};
  let steps = 0;
  while (steps < cfg.steps) {
    if (win.eval("P && P.retired") === true) break;
    const b = firstButton(doc);
    if (!b) { try { win.eval("advanceTurn()"); } catch (e) {} steps++; await new Promise(r => setTimeout(r, 0)); continue; }
    b.click();
    await new Promise(r => setTimeout(r, 0));
    const fp = fingerprint(win);
    h.update(fp + "\n");
    steps++;
    if (steps === 50 || steps === 150 || steps === cfg.steps) checkpoints["step" + steps] = fp;
  }
  const errs = dom._errors.slice();
  dom.window.close();
  return { hash: h.digest("hex"), steps, checkpoints, errors: errs };
}

(async () => {
  const cfgs = [
    { name: "EqDelantero", pos: "Delantero", archeIdx: 0, leagueIdx: 0, seed: 12345, steps: 300 },
    { name: "EqArquero", pos: "Arquero", archeIdx: 0, leagueIdx: 1, seed: 67890, steps: 300 },
    { name: "EqVolante", pos: "Volante central", archeIdx: 1, leagueIdx: 2, seed: 24680, steps: 300 },
  ];
  const results = {};
  let anyErr = false;
  for (const c of cfgs) {
    const r = await runTrace(c);
    results[c.name] = r;
    if (r.errors.length) anyErr = true;
    console.log(`[${c.name}] steps=${r.steps} hash=${r.hash.slice(0, 24)}${r.errors.length ? " ERRORES:" + r.errors.length : ""}`);
  }

  if (BASELINE) {
    const base = JSON.parse(fs.readFileSync(BASELINE, "utf-8"));
    let allSame = true;
    console.log("\n--- Comparacion contra baseline ---");
    for (const name in base) {
      const same = base[name].hash === (results[name] && results[name].hash);
      if (!same) {
        allSame = false;
        console.log(`   ❌ ${name}: DIFIERE`);
        // mostrar primer checkpoint que difiere
        const b = base[name].checkpoints || {}, n = (results[name] || {}).checkpoints || {};
        for (const k in b) if (b[k] !== n[k]) { console.log(`       ${k}\n         base: ${b[k]}\n         now : ${n[k]}`); break; }
      } else {
        console.log(`   ✅ ${name}: identico`);
      }
    }
    console.log(allSame && !anyErr ? "\n=== BALANCE IDENTICO ===" : "\n=== ¡DIFERENCIAS DETECTADAS! ===");
    process.exit(allSame && !anyErr ? 0 : 1);
  } else {
    const out = {};
    for (const n in results) out[n] = { hash: results[n].hash, checkpoints: results[n].checkpoints };
    const dest = path.join(__dirname, "balance-baseline.json");
    fs.writeFileSync(dest, JSON.stringify(out, null, 2));
    console.log("\nbaseline guardado en " + dest);
    process.exit(anyErr ? 1 : 0);
  }
})();
