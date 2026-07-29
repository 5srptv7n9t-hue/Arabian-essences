/* ===== EDITOR INICIAL con topes por arquetipo ===== */
function currentCaps(){
  const pg=document.getElementById('in-pos').value;
  const ar=document.getElementById('in-arche').value;
  return POSITIONS[pg].arche[ar].caps||{};
}
function capFor(k){const c=currentCaps();return c[k]!=null?c[k]:99}
function ptsLeft(){return POOL-STAT_KEYS.reduce((a,s)=>a+(editStats[s.k]-(BASE_STAT+baseBonus(s.k))),0)}
function baseBonus(k){
  const pg=document.getElementById('in-pos').value;
  const ar=document.getElementById('in-arche').value;
  return POSITIONS[pg].arche[ar].base[k]||0;
}
function renderEditor(){
  document.getElementById('stat-editor').innerHTML=STAT_KEYS.map(s=>{
    const cap=capFor(s.k);
    const capped=cap<99;
    return '<div class="stat-row"><span class="name">'+s.n+(capped?' <span style="color:var(--blood);font-size:10px">tope '+cap+'</span>':'')+'</span>'+
    '<div class="bar"><i style="width:'+editStats[s.k]+'%'+(capped?';background:linear-gradient(90deg,#7a2f28,var(--blood))':'')+'"></i></div>'+
    '<div class="stepper">'+
    '<button data-hold="editBump:'+s.k+':-1">−</button>'+
    '<span class="val">'+editStats[s.k]+'</span>'+
    '<button data-hold="editBump:'+s.k+':1">+</button>'+
    '</div></div>';
  }).join('');
  document.getElementById('pts-left').textContent=ptsLeft();
  bindHolds();
}
function editBump(k,d){
  const floor=BASE_STAT+baseBonus(k);
  const nv=editStats[k]+d;
  if(nv<floor||nv>capFor(k)||nv>99)return false;
  if(d>0&&ptsLeft()<=0)return false;
  editStats[k]=nv;renderEditor();return true;
}
function randomize(){
  onArcheChange(); // reset a base
  let p=ptsLeft(),guard=0;
  while(p>0&&guard<500){
    guard++;
    const s=STAT_KEYS[Math.floor(Math.random()*STAT_KEYS.length)];
    if(editStats[s.k]<capFor(s.k)&&editStats[s.k]<99){editStats[s.k]++;p--}
  }
  renderEditor();
}

