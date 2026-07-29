/* ===================== AVANCE / TEMPORADA / PREMIOS ===================== */
function advanceTurn(){
  turnCount++;
  if(turnCount%CONFIG.temporada.turnosPorTemporada===0){ endSeason(); }
  else { refreshPanel(); nextTurn(); window.scrollTo({top:0,behavior:'smooth'}); }
}

function simGoals(){
  const s=P.stats, sim=archeData().sim, G=CONFIG.simRendimiento.goles;
  if(sim==='arquero') return 0;
  if(sim==='defensivo') return Math.max(0,Math.round((s.definicion+s.tiro)/G.defensivo.div + Math.random()*G.defensivo.rand));
  if(sim==='creador')   return Math.max(0,Math.round((s.definicion+s.tiro)/G.creador.div + Math.random()*G.creador.rand));
  if(sim==='goleador')  return Math.max(0,Math.round((s.definicion*G.goleador.tiroMult+s.tiro)/G.goleador.div + Math.random()*G.goleador.rand));
  return Math.max(0,Math.round((s.definicion+s.tiro)/G.equilibrado.div + Math.random()*G.equilibrado.rand)); // equilibrado
}
function simAssists(){
  const s=P.stats, sim=archeData().sim, A=CONFIG.simRendimiento.asist;
  if(sim==='arquero') return 0;
  if(sim==='creador')   return Math.max(0,Math.round(s.pase/A.creador.div + Math.random()*A.creador.rand));
  if(sim==='goleador')  return Math.max(0,Math.round(s.pase/A.goleador.div + Math.random()*A.goleador.rand));
  return Math.max(0,Math.round(s.pase/A.equilibrado.div + Math.random()*A.equilibrado.rand));
}

function endSeason(){
  P.age++;P.season++;
  // resolver lesión: si tenía temporadas, se descuentan; si estaba en 0 se cura
  let missedSeason=false;
  if(P.injury){
    const heal=applyUpgradeEffects().fasterHeal?2:1;
    if(P.injury.seasons>0){ P.injury.seasons-=heal; missedSeason=true; if(P.injury.seasons<=0){P.injury=null} }
    else { P.injury=null; }
  }
  let simG=0,simA=0,simApps=0;
  if(missedSeason){
    // se perdió la temporada entera
  }else{
    simG=simGoals();simA=simAssists();simApps=Math.round(CONFIG.temporada.apps.base+Math.random()*CONFIG.temporada.apps.rand);
    P.goals+=simG;P.assists+=simA;P.apps+=simApps;
  }

  /* ===== PROGRESIÓN AUTOMÁTICA por talento (rebalanceo) =====
     El jugador mejora solo, lento, según su talento y edad.
     Los generacionales suben rápido y alto; los mortales apenas. */
  autoProgress(missedSeason);

  // efectos de upgrades
  const ue=applyUpgradeEffects();
  // SP por rendimiento (más chico que antes) + bonus psicólogo
  const SPC=CONFIG.temporada.sp;
  const perf=simG*SPC.goalMult+simA+Math.round(ovr()/SPC.ovrDiv);
  const seasonSP=(missedSeason?SPC.missed:Math.max(1,Math.round(perf/SPC.perfDiv)))+ue.spBonus;
  P.sp+=seasonSP;
  // COBRAR SUELDO + ingresos de sponsors
  const income=P.salary+upgradeIncome();
  P.money=Math.round((P.money+income)*10)/10;
  // sesgo de stat por chef/preparador
  if(ue.statBias && P.stats[ue.statBias]<Math.min(statCap(ue.statBias),P.talent.ceil,99)){ P.stats[ue.statBias]++; }
  // idolatría por títulos ganados esta temporada se maneja en addTrophy

  // debut selección: ahora depende de media más alta (progresión lenta lo hace más tardío)
  if(!P.seleccion && ovr()>=CONFIG.temporada.seleccionDebut.minOvr && P.honor>CONFIG.temporada.seleccionDebut.minHonor){P.seleccion=true;addTrophy('seleccion',P.nat)}

  const trophiesBefore=P.trophies.length;
  awardSeason(simG);
  // subir idolatría por títulos de club ganados
  const newClubTrophies=P.trophies.slice(trophiesBefore).filter(t=>TROPHIES[t.key].grp==='Clubes').length;
  if(newClubTrophies>0){ P.clubIdol=Math.min(100,P.clubIdol+newClubTrophies*CONFIG.temporada.idol.porTituloClub); }
  // permanencia: cada temporada en el club sube un poco la idolatría
  P.clubIdol=Math.min(100,P.clubIdol+CONFIG.temporada.idol.permanencia);

  const tag=document.getElementById('ev-tag');
  tag.textContent="Fin de temporada "+(P.season-1);tag.className='event-tag';
  const talentHint = P.season<=3 ? '' : (P.talent.tier==='generacional'?'<br><span style="color:var(--gold)">✨ Sentís que tenés algo distinto. Estás naciendo para ser leyenda.</span>':'');
  document.getElementById('ev-text').innerHTML = (missedSeason
    ? 'Te <b>perdiste la temporada entera</b> por la lesión. Volvés con hambre.<br>Ganás <b style="color:var(--sp)">+'+seasonSP+' SP</b>.'
    : 'Cerraste con <b>'+simG+' goles</b> y <b>'+simA+' asistencias</b> en '+simApps+' partidos.<br>Ganaste <b style="color:var(--sp)">+'+seasonSP+' SP</b> y tu talento hizo que mejores algo solo.'+talentHint)
    + '<br>💶 Cobraste <b style="color:var(--gold)">'+income.toFixed(1)+'M€</b> (tenés '+P.money.toFixed(1)+'M€). Repartilos en la pestaña $.';
  document.getElementById('ev-choices').innerHTML='';

  let retireBtn='';
  if(P.age>=CONFIG.temporada.retiro.minAge && Math.random()<CONFIG.temporada.retiro.prob){ retireBtn='<button class="btn ghost" onclick="retire()">Retirarme como leyenda</button>'; }
  document.getElementById('outcome-box').innerHTML=
    '<div class="outcome"><div class="res">Temporada '+(P.season-1)+' cerrada. Repartí tus puntos en el Panel.</div>'+
    '<button class="btn" onclick="continueAfterSeason()">Seguir la carrera ▸</button>'+retireBtn+'</div>';
  refreshPanel();
  toast('Temp. '+(P.season-1)+(missedSeason?': lesionado':': '+simG+'G '+simA+'A')+' · +'+seasonSP+' SP','sp');
  window.scrollTo({top:0,behavior:'smooth'});
}

