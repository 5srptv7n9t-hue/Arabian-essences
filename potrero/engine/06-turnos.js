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
  const C=CONFIG.turno;
  // ARQUEROS: atajadas decisivas frecuentes (reemplazan goles/asist)
  if(isGoalkeeper() && r<C.gkSaveProb){ gkSaveTurn(); return; }
  // lesión random por mala suerte (baja probabilidad)
  if(r<C.injuryProb){ randomInjuryTurn(); return; }
  // oferta de jeque árabe (si tenés cierto nivel/fama)
  if(o>=C.jeque.minOvr && P.fama>=C.jeque.minFama && r<C.jeque.prob && !P.league.includes("Arabia")){ sheikhOffer(); return; }
  // rueda de prensa
  if(r<C.prensaProb){ pressTurn(); return; }
  // vida mediática (salidas, yate, pareja, farándula)
  if(r<C.mediaProb){ normalEvent(true); return; }
  if(o>=C.final.minOvr && r<C.final.prob){ finalTurn(); return; }
  if(o>=C.transfer.minOvr && r<C.transfer.prob){ transferTurn(); return; }
  if(P.seleccion && r<C.seleccionProb){ if(nationalTournamentTurn()) return; }
  normalEvent();
}

