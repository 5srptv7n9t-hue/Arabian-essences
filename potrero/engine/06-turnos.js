/* ===================== MOTOR DE TURNOS ===================== */
let currentEvent=null, pendingTransfer=null, turnCount=0;

/* Eventos "de cancha" que un ARQUERO no puede protagonizar (goles, gambetas, definir penales a favor) */
const FIELD_ONLY_EVENTS = ["debut","primerGol","clasico","debut50","penal50","caño50"];
function eventAllowedForPlayer(e){
  // si sos arquero, no te llegan los eventos de cancha
  if(P.posGroup==='Arquero' && FIELD_ONLY_EVENTS.includes(e.id)) return false;
  // los eventos de arquero SOLO le llegan al arquero
  if(e.keeperOnly && P.posGroup!=='Arquero') return false;
  return true;
}

function nextTurn(){
  document.getElementById('outcome-box').innerHTML='';
  document.getElementById('ev-choices').innerHTML='';
  clearMini();if(clearMini._to)clearTimeout(clearMini._to);

  // si está lesionado largo, no juega finales/eventos normales de cancha: evento de recuperación
  if(P.injury && P.injury.seasons>0){ recoveryTurn(); return; }

  const o=ovr();
  const r=Math.random();
  // ARQUEROS: atajadas decisivas frecuentes (reemplazan goles/asist)
  if(isGoalkeeper() && r<0.30){ gkSaveTurn(); return; }
  // lesión random por mala suerte (baja probabilidad)
  if(r<0.05){ randomInjuryTurn(); return; }
  // oferta de jeque árabe (si tenés cierto nivel/fama)
  if(o>=72 && P.fama>=14 && r<0.11 && !P.league.includes("Arabia")){ sheikhOffer(); return; }
  // rueda de prensa
  if(r<0.18){ pressTurn(); return; }
  // vida mediática (salidas, yate, pareja, farándula)
  if(r<0.34){ normalEvent(true); return; }
  if(o>=64 && r<0.34){ finalTurn(); return; }
  if(o>=68 && r<0.45){ transferTurn(); return; }
  if(P.seleccion && r<0.55){ if(nationalTournamentTurn()) return; }
  normalEvent();
}

