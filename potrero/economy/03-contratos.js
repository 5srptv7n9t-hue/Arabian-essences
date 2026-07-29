/* ===== CONTRATOS Y SUELDO ===== */
function computeSalary(club, role){
  const tier=clubTier(club);
  // base por tier (millones/temporada)
  const baseByTier=CONFIG.sueldo.baseByTier;
  let base=baseByTier[tier]||CONFIG.sueldo.baseDefault;
  // ajuste por media
  const o=ovr();
  const om=CONFIG.sueldo.ovrMult;
  const ovrMult=Math.max(om.min, (o-om.ref)/om.div + om.add); // media 40=0.5x, 80=1.5x, 99≈1.97x
  base=base*ovrMult*role.payMult;
  return Math.round(base*10)/10;
}
function pickRole(club){
  const tier=clubTier(club), o=ovr();
  // clubes grandes te ofrecen roles según tu nivel
  let candidates=CONTRACT_ROLES.filter(r=>o>=r.minOvr);
  // en clubes tier1/2 si no sos crack, sos suplente/promesa
  if(tier<=2 && o<CONFIG.sueldo.rolClubGrandeOvr){ candidates=CONTRACT_ROLES.filter(r=>['rotacion','suplente','promesa'].includes(r.id)); }
  if(tier>=4){ candidates=CONTRACT_ROLES.filter(r=>['estrella','titular','rotacion'].includes(r.id) && o>=r.minOvr-CONFIG.sueldo.rolTierBajoSlack); }
  if(candidates.length===0) candidates=[CONTRACT_ROLES[3]];
  return candidates[Math.floor(Math.random()*candidates.length)];
}
function signContract(club, silent){
  const role=pickRole(club);
  P.role=role;
  P.salary=computeSalary(club, role);
  if(!silent) toast('📝 '+role.label+' · '+P.salary+'M€/temp');
}

function pickAgentName(){
  const names=["Jorge Mendes Jr.","Fernando Vlassich","Martín Sosa","Ricardo Pentrelli","Diego Almada","Andrés Kovač"];
  return names[Math.floor(Math.random()*names.length)];
}
