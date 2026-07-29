/* ===== TALENTO OCULTO: 1 de cada 5 = crack generacional ===== */
function rollTalent(){
  const r=Math.random();
  if(r<0.20) return {tier:"generacional", mult:1.9, ceil:99, label:"generacional"};
  if(r<0.50) return {tier:"crack",        mult:1.35,ceil:93, label:"crack"};
  if(r<0.85) return {tier:"bueno",        mult:1.0, ceil:86, label:"bueno"};
  return               {tier:"mortal",       mult:0.75,ceil:80, label:"limitado"};
}

