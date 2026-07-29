/* ===== OVR ponderado por posición ===== */
function ovr(){
  const w=archeData().weight;
  const s=P.stats;
  let sum=0,wsum=0;
  STAT_KEYS.forEach(x=>{
    const wt=w.includes(x.k)?2.2:0.7;
    sum+=s[x.k]*wt; wsum+=wt;
  });
  return Math.round(sum/wsum);
}
function repFromHonor(h){
  if(h>=60)return{t:"Ídolo del pueblo",c:"var(--cyan)"};
  if(h>=20)return{t:"Querido",c:"#6fc8ec"};
  if(h>-20)return{t:"Neutral",c:"var(--gold)"};
  if(h>-60)return{t:"Polémico",c:"#e0954a"};
  return{t:"Villano",c:"var(--blood)"};
}


