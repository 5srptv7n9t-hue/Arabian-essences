/* ===================== PANEL + SP ===================== */
function refreshPanel(){
  document.getElementById('g-age').textContent=P.age+" años";
  document.getElementById('g-club').innerHTML="<span style='display:inline-flex;align-items:center;gap:6px'>"+clubCrest(P.club,22)+P.club+"</span> · "+shortPos()+" · <span style='color:var(--gold)'>"+P.money.toFixed(1)+"M€</span>";
  document.getElementById('p-name').textContent=P.name;
  document.getElementById('p-meta').textContent=flagFor(P.nat)+" "+P.nat+" · "+P.arche;
  document.getElementById('p-badge').textContent=P.name.charAt(0).toUpperCase();
  document.getElementById('p-ovr').textContent=ovr();
  document.getElementById('k-gk').textContent=P.goals;
  document.getElementById('k-as').textContent=P.assists;
  document.getElementById('k-pj').textContent=P.apps;
  document.getElementById('k-fama').textContent=P.fama;
  document.getElementById('honor-mark').style.left=((P.honor+100)/2)+"%";
  const rep=repFromHonor(P.honor),rt=document.getElementById('rep-tag');
  rt.textContent=rep.t;rt.style.color=rep.c;rt.style.border="1px solid "+rep.c;
  // lesión banner
  const injHtml = P.injury
    ? '<div class="injury-banner">🩼 <b>Lesionado:</b> '+P.injury.name+
      (P.injury.seasons>0?' · fuera '+P.injury.seasons+' temporada'+(P.injury.seasons>1?'s':''):' · vuelve pronto')+'</div>'
    : '';
  ['injury-slot','injury-slot-play'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML=injHtml;});
  // barra mediática
  const sm=document.getElementById('star-mark');
  if(sm)sm.style.left=P.mediaStar+'%';
  const pt=document.getElementById('partner-tag');
  if(pt)pt.textContent = P.partner ? ('En pareja'+(P.partner==='mediatica'?' (mediática)':' (reservada)')) : '';
  updateSPUI(); renderStatEditor(); renderPalmares();
  if(typeof autosave === 'function') autosave();
}
function shortPos(){
  const map={"Arquero":"ARQ","Defensor central":"DFC","Lateral":"LAT","Volante central":"MC","Enganche":"ENG","Extremo":"EXT","Delantero":"DEL"};
  return map[P.posGroup]||P.posGroup;
}

function pendingTotal(){return STAT_KEYS.reduce((a,s)=>a+(pendingSP[s.k]||0),0)}
function spRemaining(){return P.sp-pendingTotal()}

function updateSPUI(){
  const tabBtn=document.getElementById('tab-btn-panel');
  let dot=tabBtn.querySelector('.dot');
  if(P.sp>0&&!dot){dot=document.createElement('span');dot.className='dot';tabBtn.appendChild(dot)}
  if(P.sp<=0&&dot)dot.remove();
  const rem=spRemaining();
  document.getElementById('sp-banner-slot').innerHTML = P.sp>0
    ? '<div class="sp-banner"><div class="big">'+rem+'</div><div class="txt">Tenés <b>'+rem+' punto'+(rem!==1?'s':'')+'</b> para repartir.<br>Usá <b>+</b> y <b>−</b> (mantené apretado) y <b>Confirmá</b>. Ojo con los topes de tu posición.</div></div>' : '';
  document.getElementById('sp-inline').textContent = P.sp>0 ? rem+' SP' : '';
}

function renderStatEditor(){
  const rem=spRemaining();
  document.getElementById('panel-stats').innerHTML=STAT_KEYS.map(s=>{
    const pend=pendingSP[s.k]||0;
    const base=P.stats[s.k];
    const shown=base+pend;
    const cap=statCap(s.k);
    const atCap=shown>=cap;
    const pendTxt=pend!==0?' <span class="pending">('+(pend>0?'+':'')+pend+')</span>':'';
    const capTxt=cap<99?'<span style="color:var(--blood);font-size:9px;display:block;margin-top:1px">tope '+cap+'</span>':'';
    const canUp = P.sp>0 && rem>0 && shown<99 && shown<cap;
    const canDn = P.sp>0 && pend>0;
    return '<div class="stat-edit"><span class="nm">'+s.n+capTxt+'</span>'+
      '<div class="bar"><i style="width:'+shown+'%'+(atCap?';background:linear-gradient(90deg,#7a2f28,var(--blood))':'')+'"></i></div>'+
      '<span class="vv">'+shown+pendTxt+'</span>'+
      (P.sp>0?('<div class="mm">'+
        '<button class="dn" data-hold="pendBump:'+s.k+':-1" '+(canDn?'':'disabled')+'>−</button>'+
        '<button class="up" data-hold="pendBump:'+s.k+':1" '+(canUp?'':'disabled')+'>+</button>'+
      '</div>'):'')+
      '</div>';
  }).join('');
  const slot=document.getElementById('sp-confirm-slot');
  if(P.sp>0 && pendingTotal()>0){
    slot.innerHTML='<button class="btn sp" onclick="confirmSP()">Confirmar '+pendingTotal()+' punto'+(pendingTotal()!==1?'s':'')+'</button>'+
      '<button class="btn ghost" onclick="resetSP()">Cancelar</button>';
  }else slot.innerHTML='';
  bindHolds();
}

function pendBump(k,d){
  const rem=spRemaining();
  const pend=pendingSP[k]||0;
  const cap=statCap(k);
  if(d>0){
    if(rem<=0) return false;
    if(P.stats[k]+pend>=99) return false;
    if(P.stats[k]+pend>=cap) return false;   // respeta tope de posición
    pendingSP[k]=pend+1;
  }else{
    if(pend<=0) return false;
    pendingSP[k]=pend-1;
  }
  updateSPUI();renderStatEditor();return true;
}
function confirmSP(){
  const total=pendingTotal();
  if(total<=0)return;
  STAT_KEYS.forEach(s=>{
    const pend=pendingSP[s.k]||0;
    if(pend>0){P.stats[s.k]=Math.min(99,Math.min(statCap(s.k),P.stats[s.k]+pend))}
  });
  P.sp-=total;pendingSP={};refreshPanel();
  toast('+'+total+' repartido'+(total!==1?'s':''),'sp');
}
function resetSP(){pendingSP={};refreshPanel()}

function renderPalmares(){
  const pl=document.getElementById('palmares-list');
  if(P.trophies.length===0){pl.innerHTML='<div class="empty">Todavía no ganaste nada. Andá a jugar.</div>';return}
  // agrupar por competencia específica (comp) o, si no la hay, por el nombre
  // genérico del trofeo. Así el palmarés muestra "3× Ligue 1", "Copa Argentina",
  // etc., como la app de referencia.
  const groups={}; // grupo -> { id -> {key,name,count,dets:[]} }
  P.trophies.forEach(t=>{
    const g=TROPHIES[t.key].grp;
    const name=t.comp || TROPHIES[t.key].n;
    const id=t.key+'::'+name;
    groups[g]=groups[g]||{};
    groups[g][id]=groups[g][id]||{key:t.key,name:name,count:0,dets:[]};
    groups[g][id].count++;
    if(t.detail) groups[g][id].dets.push(t.detail);
  });
  const order=["Individuales","Selección","Clubes"];
  let html='';
  order.forEach(g=>{
    if(!groups[g])return;
    html+='<div class="pgroup-title">'+g+'</div>';
    Object.keys(groups[g]).forEach(id=>{
      const it=groups[g][id];
      // ícono real (PNG) si existe para esa competencia, si no el emoji
      const icono = (typeof compLogoOrEmoji==='function')
        ? compLogoOrEmoji(it.name, TROPHIES[it.key].ic, 26)
        : '<span class="ic">'+TROPHIES[it.key].ic+'</span>';
      // subtítulo: temporadas ganadas (o el detalle si no hay número)
      const temps=it.dets.map(d=>{const m=/Temp\.?\s*(\d+)/.exec(d||'');return m?m[1]:null}).filter(Boolean);
      const sub = temps.length ? 'Temp. '+temps.join(' · ') : (it.dets[0]||'');
      html+='<div class="trophy-row"><span class="ic">'+icono+'</span>'+
        '<span><b>'+it.name+(it.count>1?' ×'+it.count:'')+'</b><br>'+
        '<span style="color:var(--mute);font-size:12px">'+sub+'</span></span></div>';
    });
  });
  pl.innerHTML=html;
}

function showTab(which,el){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('tab-play').style.display=which==='play'?'block':'none';
  document.getElementById('tab-panel').style.display=which==='panel'?'block':'none';
  document.getElementById('tab-finance').style.display=which==='finance'?'block':'none';
  document.getElementById('tab-palmares').style.display=which==='palmares'?'block':'none';
  if(which!=='play'){pendingSP={};refreshPanel()}
  if(which==='finance'){renderFinance()}
}
