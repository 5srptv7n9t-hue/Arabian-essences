/* ===== EVENTOS ===== */
function eligibleEvents(){
  let base = EVENTS.slice();
  // arqueros suman sus eventos exclusivos
  if(P.posGroup==='Arquero') base = base.concat(KEEPER_EVENTS.map(e=>Object.assign({keeperOnly:true},e)));
  return base.filter(e=>{
    if(!eventAllowedForPlayer(e)) return false;
    if(e.once && usedOnce[e.id]) return false;
    if(e.minAge && P.age<e.minAge) return false;
    if(e.maxAge && P.age>e.maxAge) return false;
    if(e.req && !e.req()) return false;
    return true;
  });
}
function eligibleRandomEvents(){
  const all=EVENTS_RANDOM.concat(MEDIA_EVENTS).concat(PARTNER_EVENTS);
  return all.filter(e=>{
    if(!eventAllowedForPlayer(e)) return false;
    if(e.once && usedOnce[e.id]) return false;
    if(e.minAge && P.age<e.minAge) return false;
    if(e.maxAge && P.age>e.maxAge) return false;
    if(e.minStar && P.mediaStar<e.minStar) return false;
    if(e.req && !e.req()) return false;
    return true;
  });
}
function normalEvent(preferMedia){
  let pool;
  if(preferMedia){
    const media=MEDIA_EVENTS.concat(PARTNER_EVENTS).filter(e=>{
      if(e.once && usedOnce[e.id]) return false;
      if(e.minAge && P.age<e.minAge) return false;
      if(e.maxAge && P.age>e.maxAge) return false;
      if(e.minStar && P.mediaStar<e.minStar) return false;
      if(e.req && !e.req()) return false;
      return true;
    });
    pool = media.length ? media : eligibleEvents().concat(eligibleRandomEvents());
  } else {
    pool=eligibleEvents().concat(eligibleRandomEvents());
  }
  let fresh=pool.filter(e=>!recentEvents.includes(e.id));
  if(fresh.length>0) pool=fresh;
  if(pool.length===0){ recentEvents=[]; pool=eligibleEvents().concat(eligibleRandomEvents()); }
  currentEvent=pool[Math.floor(Math.random()*pool.length)];
  if(currentEvent.once) usedOnce[currentEvent.id]=true;
  recentEvents.push(currentEvent.id);
  if(recentEvents.length>7) recentEvents.shift();

  const tagEl=document.getElementById('ev-tag');
  tagEl.textContent=(currentEvent.type==='bad'?'Conflicto':currentEvent.type==='good'?'Oportunidad':currentEvent.type==='transfer'?'Carrera':currentEvent.type==='press'?'Rueda de prensa':'Decisión');
  tagEl.className='event-tag '+(currentEvent.type||'');
  document.getElementById('ev-text').textContent=currentEvent.text();
  document.getElementById('ev-choices').innerHTML=currentEvent.choices.map((c,i)=>
    '<button class="choice" onclick="chooseNormal('+i+')">'+c.t+'<span class="hint">'+(c.hint||'')+(c.roll?' · 🎲':'')+'</span></button>').join('');
}
function chooseNormal(i){
  const c=currentEvent.choices[i];
  // costo de la opción (ej: fiesta en el yate)
  if(c.cost){
    if(P.money<c.cost){ 
      renderOutcome('No te alcanza la plata para eso (necesitás '+c.cost+'M€, tenés '+P.money.toFixed(1)+'M€). Elegí otra cosa.', []);
      return;
    }
    P.money=Math.round((P.money-c.cost)*10)/10;
  }
  // Esquema NUEVO: roll ponderado (decisiones 50/50 muy variables)
  if(c.roll){
    const picked=resolveRoll(c.roll);
    const deltas=applyEffFull(picked.eff);
    let extraNote='';
    if(picked.eff.injury){ extraNote += picked.eff.injury.len==='long'?' 🩼 Lesión grave.':' 🩹 Lesión.'; }
    renderOutcome(picked.res+extraNote, deltas);
    if(picked.eff.sp>0)toast('+'+picked.eff.sp+' Skill Points','sp');
    return;
  }
  // Esquema win/lose
  if(c.win && c.lose){
    const p=successChance(c);
    const success=Math.random()<p;
    const branch=success?c.win:c.lose;
    const deltas=applyEff(branch);
    let extraNote='';
    // riesgo de lesión (puede venir en la rama que salió)
    if(branch.injuryRisk && Math.random()<branch.injuryRisk.chance){
      applyInjury(branch.injuryRisk.len,branch.injuryRisk.seasons);
      extraNote = branch.injuryRisk.len==='long' ? ' ⚠️ Y encima caíste con una lesión grave.' : ' ⚠️ Te resentiste físicamente.';
    }
    renderOutcome(branch.res+extraNote, deltas, success?'win':'lose');
    if(branch.sp>0)toast('+'+branch.sp+' Skill Points','sp');
    return;
  }
  // resultado fijo (compatibilidad)
  const deltas=applyEff(c.eff);
  let extraNote='';
  if(c.eff.injuryRisk && Math.random()<c.eff.injuryRisk.chance){
    applyInjury(c.eff.injuryRisk.len,c.eff.injuryRisk.seasons);
    extraNote = c.eff.injuryRisk.len==='long' ? ' ⚠️ Y lo pagaste caro: caíste con una lesión grave.' : ' ⚠️ Te resentiste físicamente.';
  }
  renderOutcome(c.eff.res+extraNote,deltas);
  if(c.eff.sp>0)toast('+'+c.eff.sp+' Skill Points','sp');
}

/* Probabilidad de éxito de una decisión:
   base 50/50, ajustada por las stats relevantes de la opción y el talento.
   c.skill = array de stats que ayudan (opcional). */
function successChance(c){
  let p=0.5;
  if(c.skill && c.skill.length){
    const avg=c.skill.reduce((a,k)=>a+(P.stats[k]||50),0)/c.skill.length;
    p += (avg-55)/160;   // stat alta empuja hasta ~+0.27
  }
  // el talento generacional tiene un plus sutil; el limitado, un menos
  const tt={generacional:0.08,crack:0.04,bueno:0,mortal:-0.05};
  p += (tt[P.talent.tier]||0);
  // riesgo declarado en la opción baja la chance (decisiones arriesgadas)
  if(c.risk) p -= c.risk;
  return Math.max(0.12, Math.min(0.9, p));
}

function applyEff(e){
  const deltas=[];
  for(const k in e){
    if(k==='res'||k==='injuryRisk')continue;
    if(k==='goals'){P.goals+=e[k];if(e[k])deltas.push(['Goles',e[k],'up'])}
    else if(k==='assists'){P.assists+=e[k];if(e[k])deltas.push(['Asist.',e[k],'up'])}
    else if(k==='apps'){P.apps+=e[k]}
    else if(k==='fama'){P.fama=Math.max(0,P.fama+e[k]);if(e[k])deltas.push(['Fama',e[k],e[k]>=0?'up':'down'])}
    else if(k==='honor'){P.honor=Math.max(-100,Math.min(100,P.honor+e[k]));if(e[k])deltas.push(['Imagen',e[k],e[k]>=0?'up':'down'])}
    else if(k==='sp'){P.sp+=e[k];if(e[k])deltas.push(['Skill Points',e[k],'sp'])}
    else if(k==='idol'){P.clubIdol=Math.max(0,Math.min(100,P.clubIdol+e[k]));if(e[k])deltas.push(['Idolatría',e[k],e[k]>=0?'up':'down'])}
    else if(k==='money'){P.money=Math.max(0,Math.round((P.money+e[k])*10)/10);if(e[k])deltas.push(['Dinero '+(e[k]>=0?'+':'')+e[k]+'M€',0,e[k]>=0?'up':'down'])}
    else if(k==='star'){P.mediaStar=Math.max(0,Math.min(100,P.mediaStar+e[k]));if(e[k])deltas.push(['Estrella',e[k],e[k]>=0?'up':'down'])}
    else if(k==='endPartner'){ if(e[k]){P.partner=null;P.partnerType=null;P.partnerSeasons=0;} }
    else if(k==='setPartner'){
      P.partner=e[k];
      // tipo oculto: lo descubrís jugando (sorpresa)
      const types=['buena','buena','botinera','interesada']; // 50% buena, 25% botinera, 25% interesada
      P.partnerType=types[Math.floor(Math.random()*types.length)];
      P.partnerSeasons=0;
    }
  }
  return deltas;
}
/* resolver una opción con roll ponderado 50/50 */
function resolveRoll(rolls){
  const total=rolls.reduce((a,r)=>a+r.p,0);
  let x=Math.random()*total;
  for(const r of rolls){ if(x<r.p) return r; x-=r.p; }
  return rolls[rolls.length-1];
}
/* aplicar efecto que puede incluir injury inline */
function applyEffFull(eff){
  const deltas=applyEff(eff);
  if(eff.injury){ applyInjury(eff.injury.len, eff.injury.seasons); }
  return deltas;
}
function renderOutcome(res,deltas,outcome){
  const dhtml=deltas.map(d=>{
    const cls=d[2]==='sp'?'sp':(d[2]==='up'?'up':'down');
    return '<span class="delta '+cls+'">'+d[0]+' '+(d[1]>=0?'+':'')+d[1]+'</span>'}).join('');
  document.getElementById('ev-choices').innerHTML='';
  const badge = outcome==='win' ? '<div class="res-badge win">✅ Salió bien</div>'
              : outcome==='lose' ? '<div class="res-badge lose">❌ Salió mal</div>' : '';
  document.getElementById('outcome-box').innerHTML=
    '<div class="outcome">'+badge+'<div class="res">'+res+'</div><div class="deltas">'+dhtml+'</div>'+
    '<button class="btn" onclick="advanceTurn()">Continuar ▸</button></div>';
  refreshPanel();
}

