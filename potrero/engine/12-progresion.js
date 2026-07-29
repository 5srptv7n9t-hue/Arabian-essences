/* ===== PROGRESIÓN AUTOMÁTICA (el corazón del rebalanceo) ===== */
function autoProgress(missed){
  const t=P.talent;
  // pico de crecimiento entre 17 y 27, decrece después
  let ageFactor;
  if(P.age<=20) ageFactor=1.4;
  else if(P.age<=25) ageFactor=1.0;
  else if(P.age<=29) ageFactor=0.5;
  else if(P.age<=32) ageFactor=0.15;
  else ageFactor=-0.2; // declive
  // puntos de mejora por temporada
  let eliteBoost = (t.tier==='generacional'?1.35:t.tier==='crack'?1.15:1.0);
  let growth = (missed? 0.4:1) * t.mult * eliteBoost * ageFactor * (5.5 + Math.random()*2.5);
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
      if(keyPool.length && Math.random()<0.7) pick=keyPool[Math.floor(Math.random()*keyPool.length)];
      else pick=pool[Math.floor(Math.random()*pool.length)];
      P.stats[pick.k]++;
    }
  }else if(growth<0){
    // declive físico: baja velocidad/resistencia/fisico
    const phys=['velocidad','resistencia','fisico'];
    for(let i=0;i<Math.abs(growth);i++){
      const k=phys[Math.floor(Math.random()*phys.length)];
      if(P.stats[k]>35)P.stats[k]--;
    }
  }
}

function continueAfterSeason(){ nextTurn(); window.scrollTo({top:0,behavior:'smooth'}); }

function awardSeason(simG){
  const o=ovr(), sim=archeData().sim;
  if(o>72&&Math.random()<0.35)addTrophy('liga',P.club+' · Temp. '+(P.season-1));
  if(simG>=18)addTrophy('pichichi',simG+' goles · Temp. '+(P.season-1));
  if(simG>=25 && !isSudamerican())addTrophy('botaOro',simG+' goles · Temp. '+(P.season-1));
  if(o>82&&P.fama>18&&Math.random()<0.3)addTrophy('mvpLiga','Temp. '+(P.season-1));
  if(sim==='arquero'&&o>80&&Math.random()<0.4){addTrophy('yashin','Temp. '+(P.season-1));if(Math.random()<0.5)addTrophy('guante','Temp. '+(P.season-1))}
  if(P.age<=21&&o>76&&P.fama>12&&!hasTrophy('goldenBoy'))addTrophy('goldenBoy','A los '+(P.age-1)+' · Temp. '+(P.season-1));
  if(simG>=12&&Math.random()<0.12)addTrophy('puskas','Temp. '+(P.season-1));
  if(o>87&&P.fama>26&&Math.random()<0.28)addTrophy('balon','Temp. '+(P.season-1));
  if(o>86&&P.fama>24&&Math.random()<0.24)addTrophy('theBest','Temp. '+(P.season-1));
  if(o>85&&Math.random()<0.10)addTrophy('mundialClubes','Con '+P.club+' · Temp. '+(P.season-1));
}
function hasTrophy(key){return P.trophies.some(t=>t.key===key)}
function addTrophy(key,detail){P.trophies.push({key,detail});toast(TROPHIES[key].ic+' '+TROPHIES[key].n+'!')}

