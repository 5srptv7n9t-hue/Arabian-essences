/* ===== PERSISTENCIA: guardado de partida (localStorage) ===== */
/* Guarda el estado completo de la carrera en el navegador. Soporta varias
   partidas (slots). El autosave se dispara desde refreshPanel(), asi que se
   guarda solo despues de cada cambio de estado. Si el navegador no permite
   almacenamiento, el juego sigue funcionando igual pero sin guardar. */

const SAVE_PREFIX = 'potrero.save.';
let currentSlotId = null;

/* ¿Se puede usar localStorage? (algunos navegadores/modos lo bloquean) */
function storageOK(){
  try{
    const k = '__potrero_test__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  }catch(e){ return false; }
}

function newSlotId(){ return 'p' + Date.now() + Math.floor(Math.random()*1000); }

/* snapshot serializable de todo lo que hace falta para retomar la carrera */
function collectState(){
  return {
    P: P,
    usedOnce: usedOnce,
    recentEvents: recentEvents,
    pendingSP: pendingSP,
    turnCount: turnCount
  };
}

/* guarda la partida actual en su slot (no rompe el juego si algo falla) */
function autosave(){
  if(!P || !currentSlotId || !storageOK()) return;
  try{
    const data = {
      v: 1,
      ts: Date.now(),
      meta: {
        name: P.name, club: P.club, posGroup: P.posGroup, arche: P.arche,
        age: P.age, season: P.season, ovr: ovr(), retired: !!P.retired,
        goals: P.goals, trophies: (P.trophies ? P.trophies.length : 0)
      },
      state: collectState()
    };
    localStorage.setItem(SAVE_PREFIX + currentSlotId, JSON.stringify(data));
  }catch(e){ /* p.ej. cuota llena: ignoramos para no cortar la partida */ }
}

/* lista de partidas guardadas (mas reciente primero) */
function listSaves(){
  if(!storageOK()) return [];
  const out = [];
  for(let i=0;i<localStorage.length;i++){
    const k = localStorage.key(i);
    if(k && k.indexOf(SAVE_PREFIX) === 0){
      try{
        const d = JSON.parse(localStorage.getItem(k));
        out.push({ id: k.slice(SAVE_PREFIX.length), ts: d.ts||0, meta: d.meta||{} });
      }catch(e){ /* slot corrupto: lo salteamos */ }
    }
  }
  out.sort((a,b)=>b.ts-a.ts);
  return out;
}

/* carga un slot y restaura el estado global. Devuelve true si salio bien. */
function loadSlot(id){
  if(!storageOK()) return false;
  const raw = localStorage.getItem(SAVE_PREFIX + id);
  if(!raw) return false;
  let d;
  try{ d = JSON.parse(raw); }catch(e){ return false; }
  const s = d.state || {};
  if(!s.P) return false;
  P = s.P;
  usedOnce = s.usedOnce || {};
  recentEvents = s.recentEvents || [];
  pendingSP = s.pendingSP || {};
  turnCount = s.turnCount || 0;
  currentEvent = null;
  pendingTransfer = null;
  currentSlotId = id;
  return true;
}

function deleteSlot(id){
  try{ localStorage.removeItem(SAVE_PREFIX + id); }catch(e){}
  if(currentSlotId === id) currentSlotId = null;
}
