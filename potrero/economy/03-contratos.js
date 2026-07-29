/* ===== CONTRATOS Y SUELDO ===== */
function computeSalary(club, role){
  const tier=clubTier(club);
  // base por tier (millones/temporada)
  const baseByTier={1:14,2:8,3:4,4:1.6,5:0.6,6:0.2};
  let base=baseByTier[tier]||2;
  // ajuste por media
  const o=ovr();
  const ovrMult=Math.max(0.4, (o-40)/40 + 0.5); // media 40=0.5x, 80=1.5x, 99≈1.97x
  base=base*ovrMult*role.payMult;
  return Math.round(base*10)/10;
}
function pickRole(club){
  const tier=clubTier(club), o=ovr();
  // clubes grandes te ofrecen roles según tu nivel
  let candidates=CONTRACT_ROLES.filter(r=>o>=r.minOvr);
  // en clubes tier1/2 si no sos crack, sos suplente/promesa
  if(tier<=2 && o<78){ candidates=CONTRACT_ROLES.filter(r=>['rotacion','suplente','promesa'].includes(r.id)); }
  if(tier>=4){ candidates=CONTRACT_ROLES.filter(r=>['estrella','titular','rotacion'].includes(r.id) && o>=r.minOvr-10); }
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
