/* ===================== ESTADO ===================== */
let P=null;
const BASE_STAT=CONFIG.crear.baseStat, POOL=CONFIG.crear.pool;   // rebalanceo: base más baja y menos puntos al inicio
let editStats={};
let usedOnce={};
let recentEvents=[];
let pendingSP={};

function opt(v){return '<option>'+v+'</option>'}
function optS(v,sel){return '<option'+(v===sel?' selected':'')+'>'+v+'</option>'}
function initSelects(){
  document.getElementById('in-nat').innerHTML=NATIONS.map(opt).join('');
  document.getElementById('in-league').innerHTML=Object.keys(LEAGUES).map(opt).join('');
  document.getElementById('in-pos').innerHTML=Object.keys(POSITIONS).map(opt).join('');
  fillClubs(); fillArche();
}
function fillClubs(){const lg=document.getElementById('in-league').value;document.getElementById('in-club').innerHTML=LEAGUES[lg].map(opt).join('')}
function fillArche(){
  const pg=document.getElementById('in-pos').value;
  const arches=Object.keys(POSITIONS[pg].arche);
  document.getElementById('in-arche').innerHTML=arches.map(opt).join('');
  onArcheChange();
}
function onArcheChange(){
  // resetear editor a base del arquetipo y mostrar topes
  const pg=document.getElementById('in-pos').value;
  const ar=document.getElementById('in-arche').value;
  const data=POSITIONS[pg].arche[ar];
  editStats={};
  STAT_KEYS.forEach(s=>editStats[s.k]=BASE_STAT+(data.base[s.k]||0));
  renderEditor();
}

