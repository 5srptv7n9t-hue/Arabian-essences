/* ===== LESIONES ===== */
const INJURIES_SHORT=["desgarro leve","esguince de tobillo","sobrecarga muscular","golpe en la rodilla"];
const INJURIES_LONG=["rotura de ligamentos cruzados","fractura de peroné","rotura de menisco","pubalgia crónica"];
function applyInjury(len,seasons){
  if(len==='long'){
    P.injury={name:INJURIES_LONG[Math.floor(Math.random()*INJURIES_LONG.length)],seasons:Math.max(1,seasons||1)};
    toast('🩼 Lesión grave: '+P.injury.name);
  }else{
    P.injury={name:INJURIES_SHORT[Math.floor(Math.random()*INJURIES_SHORT.length)],seasons:0};
    toast('🩹 Lesión: '+P.injury.name);
  }
}
function randomInjuryTurn(){
  const long=Math.random()<CONFIG.lesiones.randomLongProb;
  const tag=document.getElementById('ev-tag');
  tag.textContent="Mala suerte";tag.className='event-tag bad';
  document.getElementById('ev-text').innerHTML= long
    ? '💥 En una jugada fortuita caés mal y sentís un crack feo. Los estudios confirman lo peor.'
    : '💥 Pisás mal y sentís un tirón. Vas a tener que parar un tiempo.';
  document.getElementById('ev-choices').innerHTML=
    '<button class="choice" onclick="acceptInjury(\''+(long?'long':'short')+'\')">Asumir la lesión y arrancar la recuperación.<span class="hint">No hay otra</span></button>';
}
function acceptInjury(len){
  applyInjury(len, len==='long'?(Math.random()<CONFIG.lesiones.aceptarLargaProbDoble?2:1):0);
  const d=applyEff({honor:1});
  renderOutcome(len==='long'
    ? 'Te operaron. Se te viene una recuperación larga y solitaria. El club te banca, pero el camino de vuelta es duro.'
    : 'Nada grave, pero tenés que parar unas semanas. Paciencia.', d);
}
function recoveryTurn(){
  const tag=document.getElementById('ev-tag');
  tag.textContent="Recuperación";tag.className='event-tag bad';
  document.getElementById('ev-text').innerHTML='🩼 Seguís recuperándote de <b>'+P.injury.name+'</b>. Te perdés partidos. ¿Cómo encarás la rehabilitación?';
  document.getElementById('ev-choices').innerHTML=
    '<button class="choice" onclick="rehab(\'push\')">Acelerar la vuelta, forzar los tiempos.<span class="hint">Riesgo de recaída</span></button>'+
    '<button class="choice" onclick="rehab(\'smart\')">Hacer la rehabilitación completa, sin apurar.<span class="hint">Volvés entero</span></button>'+
    '<button class="choice" onclick="rehab(\'mental\')">Trabajar la cabeza y estudiar el juego mientras tanto.<span class="hint">+SP, no apura físico</span></button>';
}
function rehab(mode){
  let res,d;
  if(mode==='push'){
    if(Math.random()<CONFIG.lesiones.rehabRecaidaProb){ // recaída
      P.injury.seasons+=1;
      d=applyEff({honor:-2});
      res='Forzaste y recaíste. La lesión se alarga. Bronca pura.';
    }else{
      P.injury.seasons=Math.max(0,P.injury.seasons-1);
      d=applyEff({honor:2,fama:1});
      res='Apuraste y salió bien esta vez. Estás más cerca de volver.';
    }
  }else if(mode==='smart'){
    P.injury.seasons=Math.max(0,P.injury.seasons-1);
    d=applyEff({honor:2});
    res='Rehabilitación seria, sin atajos. El cuerpo lo agradece.';
  }else{
    P.injury.seasons=Math.max(0,P.injury.seasons-1);
    d=applyEff({sp:2,honor:1});
    res='Aprovechaste el parate para crecer mentalmente. Volvés más inteligente.';
  }
  // si llegó a 0, se cura al cerrar temporada
  if(P.injury.seasons<=0){ P.injury=null; toast('✅ ¡Recuperado! Listo para volver'); }
  renderOutcome(res,d);
}

