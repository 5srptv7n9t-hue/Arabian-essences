/* ===== PROGRESIÓN AUTOMÁTICA (el corazón del rebalanceo) ===== */
function autoProgress(missed){
  const t=P.talent, PC=CONFIG.progresion;
  // pico de crecimiento entre 17 y 27, decrece después
  const AF=PC.ageFactor;
  let ageFactor;
  if(P.age<=20) ageFactor=AF.hasta20;
  else if(P.age<=25) ageFactor=AF.hasta25;
  else if(P.age<=29) ageFactor=AF.hasta29;
  else if(P.age<=32) ageFactor=AF.hasta32;
  else ageFactor=AF.declive; // declive
  // puntos de mejora por temporada
  const EB=PC.eliteBoost;
  let eliteBoost = (EB[t.tier]!=null?EB[t.tier]:EB.otros);
  let growth = (missed? PC.missedMult:1) * t.mult * eliteBoost * ageFactor * (PC.growthBase + Math.random()*PC.growthRand);
  growth=Math.round(growth);
  const weight=archeData().weight;
  if(growth>0){
    for(let i=0;i<growth;i++){
      // priorizar stats de la posición, respetando topes y el techo de talento
      const pool=STAT_KEYS.filter(s=>{
        const cap=Math.min(statCap(s.k), t.ceil);
        return P.stats[s.k]<cap;
      });
      if(pool.length===0)break;
      // 70% en stats clave de la posición
      let pick;
      const keyPool=pool.filter(s=>weight.includes(s.k));
      if(keyPool.length && Math.random()<PC.keyStatBias) pick=keyPool[Math.floor(Math.random()*keyPool.length)];
      else pick=pool[Math.floor(Math.random()*pool.length)];
      P.stats[pick.k]++;
    }
  }else if(growth<0){
    // declive físico: baja velocidad/resistencia/fisico
    const phys=PC.declineStats;
    for(let i=0;i<Math.abs(growth);i++){
      const k=phys[Math.floor(Math.random()*phys.length)];
      if(P.stats[k]>PC.declineFloor)P.stats[k]--;
    }
  }
}

function continueAfterSeason(){ nextTurn(); window.scrollTo({top:0,behavior:'smooth'}); }

function awardSeason(simG){
  const o=ovr(), sim=archeData().sim, PR=CONFIG.premios;
  if(o>PR.liga.ovr&&Math.random()<PR.liga.prob)addTrophy('liga',P.club+' · Temp. '+(P.season-1),leagueTitleName(P.league));
  if(simG>=PR.pichichiGoles)addTrophy('pichichi',simG+' goles · Temp. '+(P.season-1));
  if(simG>=PR.botaGoles && !isSudamerican())addTrophy('botaOro',simG+' goles · Temp. '+(P.season-1));
  if(o>PR.mvpLiga.ovr&&P.fama>PR.mvpLiga.fama&&Math.random()<PR.mvpLiga.prob)addTrophy('mvpLiga','Temp. '+(P.season-1));
  if(sim==='arquero'&&o>PR.yashin.ovr&&Math.random()<PR.yashin.prob){addTrophy('yashin','Temp. '+(P.season-1));if(Math.random()<PR.yashin.guanteProb)addTrophy('guante','Temp. '+(P.season-1))}
  if(P.age<=PR.goldenBoy.edad&&o>PR.goldenBoy.ovr&&P.fama>PR.goldenBoy.fama&&!hasTrophy('goldenBoy'))addTrophy('goldenBoy','A los '+(P.age-1)+' · Temp. '+(P.season-1));
  if(simG>=PR.puskas.goles&&Math.random()<PR.puskas.prob)addTrophy('puskas','Temp. '+(P.season-1));
  if(o>PR.balon.ovr&&P.fama>PR.balon.fama&&Math.random()<PR.balon.prob)addTrophy('balon','Temp. '+(P.season-1));
  if(o>PR.theBest.ovr&&P.fama>PR.theBest.fama&&Math.random()<PR.theBest.prob)addTrophy('theBest','Temp. '+(P.season-1));
  if(o>PR.mundialClubes.ovr&&Math.random()<PR.mundialClubes.prob)addTrophy('mundialClubes','Con '+P.club+' · Temp. '+(P.season-1));
}
function hasTrophy(key){return P.trophies.some(t=>t.key===key)}
function addTrophy(key,detail,comp){P.trophies.push({key,detail,comp:comp||null});toast(TROPHIES[key].ic+' '+(comp||TROPHIES[key].n)+'!')}

