/* ===================== AVANCE / TEMPORADA / PREMIOS ===================== */
function advanceTurn(){
  turnCount++;
  if(turnCount%3===0){ endSeason(); }
  else { refreshPanel(); nextTurn(); window.scrollTo({top:0,behavior:'smooth'}); }
}

function simGoals(){
  const s=P.stats, sim=archeData().sim;
  if(sim==='arquero') return 0;
  if(sim==='defensivo') return Math.max(0,Math.round((s.definicion+s.tiro)/60 + Math.random()*2));
  if(sim==='creador')   return Math.max(0,Math.round((s.definicion+s.tiro)/26 + Math.random()*4));
  if(sim==='goleador')  return Math.max(0,Math.round((s.definicion*1.3+s.tiro)/12 + Math.random()*7));
  return Math.max(0,Math.round((s.definicion+s.tiro)/20 + Math.random()*5)); // equilibrado
}
function simAssists(){
  const s=P.stats, sim=archeData().sim;
  if(sim==='arquero') return 0;
  if(sim==='creador')   return Math.max(0,Math.round(s.pase/12 + Math.random()*6));
  if(sim==='goleador')  return Math.max(0,Math.round(s.pase/28 + Math.random()*2));
  return Math.max(0,Math.round(s.pase/18 + Math.random()*4));
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
    simG=simGoals();simA=simAssists();simApps=Math.round(20+Math.random()*14);
    P.goals+=simG;P.assists+=simA;P.apps+=simApps;
  }

  /* ===== PROGRESIÓN AUTOMÁTICA por talento (rebalanceo) =====
     El jugador mejora solo, lento, según su talento y edad.
     Los generacionales suben rápido y alto; los mortales apenas. */
  autoProgress(missedSeason);

  // efectos de upgrades
  const ue=applyUpgradeEffects();
  // SP por rendimiento (más chico que antes) + bonus psicólogo
  const perf=simG*2+simA+Math.round(ovr()/22);
  const seasonSP=(missedSeason?1:Math.max(1,Math.round(perf/6)))+ue.spBonus;
  P.sp+=seasonSP;
  // COBRAR SUELDO + ingresos de sponsors
  const income=P.salary+upgradeIncome();
  P.money=Math.round((P.money+income)*10)/10;
  // sesgo de stat por chef/preparador
  if(ue.statBias && P.stats[ue.statBias]<Math.min(statCap(ue.statBias),P.talent.ceil,99)){ P.stats[ue.statBias]++; }
  // idolatría por títulos ganados esta temporada se maneja en addTrophy

  // debut selección: ahora depende de media más alta (progresión lenta lo hace más tardío)
  if(!P.seleccion && ovr()>=74 && P.honor>-45){P.seleccion=true;addTrophy('seleccion',P.nat)}

  const trophiesBefore=P.trophies.length;
  awardSeason(simG);
  // subir idolatría por títulos de club ganados
  const newClubTrophies=P.trophies.slice(trophiesBefore).filter(t=>TROPHIES[t.key].grp==='Clubes').length;
  if(newClubTrophies>0){ P.clubIdol=Math.min(100,P.clubIdol+newClubTrophies*8); }
  // permanencia: cada temporada en el club sube un poco la idolatría
  P.clubIdol=Math.min(100,P.clubIdol+2);

  const tag=document.getElementById('ev-tag');
  tag.textContent="Fin de temporada "+(P.season-1);tag.className='event-tag';
  const talentHint = P.season<=3 ? '' : (P.talent.tier==='generacional'?'<br><span style="color:var(--gold)">✨ Sentís que tenés algo distinto. Estás naciendo para ser leyenda.</span>':'');
  document.getElementById('ev-text').innerHTML = (missedSeason
    ? 'Te <b>perdiste la temporada entera</b> por la lesión. Volvés con hambre.<br>Ganás <b style="color:var(--sp)">+'+seasonSP+' SP</b>.'
    : 'Cerraste con <b>'+simG+' goles</b> y <b>'+simA+' asistencias</b> en '+simApps+' partidos.<br>Ganaste <b style="color:var(--sp)">+'+seasonSP+' SP</b> y tu talento hizo que mejores algo solo.'+talentHint)
    + '<br>💶 Cobraste <b style="color:var(--gold)">'+income.toFixed(1)+'M€</b> (tenés '+P.money.toFixed(1)+'M€). Repartilos en la pestaña $.';
  document.getElementById('ev-choices').innerHTML='';

  let retireBtn='';
  if(P.age>=34 && Math.random()<0.5){ retireBtn='<button class="btn ghost" onclick="retire()">Retirarme como leyenda</button>'; }
  document.getElementById('outcome-box').innerHTML=
    '<div class="outcome"><div class="res">Temporada '+(P.season-1)+' cerrada. Repartí tus puntos en el Panel.</div>'+
    '<button class="btn" onclick="continueAfterSeason()">Seguir la carrera ▸</button>'+retireBtn+'</div>';
  refreshPanel();
  toast('Temp. '+(P.season-1)+(missedSeason?': lesionado':': '+simG+'G '+simA+'A')+' · +'+seasonSP+' SP','sp');
  window.scrollTo({top:0,behavior:'smooth'});
}

