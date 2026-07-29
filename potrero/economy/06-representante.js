/* ===================== REPRESENTANTE ===================== */
function renderAgent(){
  const slot=document.getElementById('agent-slot');
  if(!slot)return;
  const canSearch = P.season > P.lastSearchSeason; // 1 búsqueda por temporada
  slot.innerHTML=
    '<div class="agent-name">🕴️ '+P.agent.name+'</div>'+
    '<div style="font-size:12px;color:var(--mute);margin:2px 0 10px">Tu representante. Se lleva el <b style="color:var(--gold)">'+Math.round(P.agent.commission*100)+'%</b> de comisión en cada contrato que cierra.</div>'+
    (canSearch
      ? '<button class="btn cyan" onclick="agentSearch()">Pedirle que busque equipos</button>'
      : '<div style="font-size:12px;color:var(--mute);text-align:center;padding:8px">Ya lo mandaste a buscar esta temporada. Esperá a la próxima.</div>');
}
function agentSearch(){
  P.lastSearchSeason=P.season;
  const o=ovr();
  // cantidad y calidad de ofertas según tu nivel/fama
  const nOffers = o>=82?3 : o>=72?2 : o>=62?1 : (Math.random()<0.5?1:0);
  if(nOffers===0){
    showResultModal('🕴️ '+P.agent.name, 'Sin novedades', 'Tu representante movió cielo y tierra pero por ahora no hay clubes interesados en tu nivel. Seguí sumando y volvé a intentar la próxima temporada.', []);
    return;
  }
  // generar ofertas
  agentOffers=[];
  const pool=(o>=78?BIG_CLUBS:Object.values(LEAGUES).flat()).filter(c=>c!==P.club);
  for(let i=0;i<nOffers;i++){
    const club=pool[Math.floor(Math.random()*pool.length)];
    const role=pickRole(club);
    const salary=computeSalary(club,role);
    const fee=Math.round(o*1.3)+Math.floor(Math.random()*50);
    agentOffers.push({club,role,salary,fee});
  }
  showAgentOffers();
}
let agentOffers=[];
function showAgentOffers(){
  let html='<div class="modal-title">🕴️ Ofertas conseguidas</div>'+
    '<div class="modal-sub">'+P.agent.name+' te consiguió '+agentOffers.length+' opción'+(agentOffers.length>1?'es':'')+'</div>'+
    '<div style="font-size:12px;color:var(--mute);text-align:center;margin-bottom:12px">Comisión del agente: '+Math.round(P.agent.commission*100)+'% del sueldo</div>';
  agentOffers.forEach((of,i)=>{
    const net=Math.round(of.salary*(1-P.agent.commission)*10)/10;
    html+='<div class="offer-card">'+
      '<div class="offer-club">'+of.club+'</div>'+
      '<div class="offer-role">'+of.role.label+'</div>'+
      '<div class="offer-salary">'+of.salary+'M€/temp <span>(neto '+net+'M€ tras comisión)</span></div>'+
      '<button class="fin-buy" style="width:100%;margin-top:8px" onclick="acceptAgentOffer('+i+')">Ver contrato y decidir</button>'+
      '</div>';
  });
  html+='<button class="btn ghost" onclick="closeModal()">Quedarme donde estoy</button>';
  document.getElementById('modal-box').innerHTML=html;
  document.getElementById('modal-overlay').classList.add('show');
}
function acceptAgentOffer(i){
  const of=agentOffers[i];
  contractCallbacks={
    sign:()=>{
      const old=P.club;P.club=of.club;relocateLeague();
      P.clubIdol=0;P.role=of.role;
      // el sueldo neto ya considera comisión
      P.salary=Math.round(of.salary*(1-P.agent.commission)*10)/10;
      const d=applyEff({fama:3,honor:1,sp:1});
      renderOutcome('Firmaste con el '+P.club+' (gestión de '+P.agent.name+'). Dejaste '+old+'. Sueldo neto: '+P.salary+'M€/temp tras comisión.',d);
      toast('✈ Ahora jugás en '+P.club);
      // volver a la pantalla de juego
      document.querySelector('.tab').click();
    },
    reject:()=>{ showAgentOffers(); }  // vuelve a la lista
  };
  showContractModal(of.club, of.role, of.salary, {fee:of.fee});
}
