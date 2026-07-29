/* ===== TALENTO OCULTO: 1 de cada 5 = crack generacional ===== */
function rollTalent(){
  const r=Math.random(), T=CONFIG.talento;
  if(r<T.umbrales.generacional) return Object.assign({}, T.tiers.generacional);
  if(r<T.umbrales.crack)        return Object.assign({}, T.tiers.crack);
  if(r<T.umbrales.bueno)        return Object.assign({}, T.tiers.bueno);
  return                                Object.assign({}, T.tiers.mortal);
}

