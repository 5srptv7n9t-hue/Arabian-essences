/* ===================== MODALES ===================== */
/* Modal de resultado con deltas (para fiesta, apuestas, etc.) */
function showResultModal(title, sub, body, deltas){
  const dhtml=(deltas||[]).map(d=>{
    const cls=d[2]==='sp'?'sp':(d[2]==='up'?'up':'down');
    const val = d[1]===0 ? d[0] : (d[0]+' '+(d[1]>=0?'+':'')+d[1]);
    return '<span class="delta '+cls+'">'+val+'</span>';
  }).join('');
  document.getElementById('modal-box').innerHTML=
    '<div class="modal-title">'+title+'</div>'+
    (sub?'<div class="modal-sub">'+sub+'</div>':'')+
    '<div class="modal-body">'+body+'</div>'+
    (dhtml?'<div class="modal-deltas">'+dhtml+'</div>':'')+
    '<button class="btn" onclick="closeModal()">Entendido</button>';
  document.getElementById('modal-overlay').classList.add('show');
}
function closeModal(){
  document.getElementById('modal-overlay').classList.remove('show');
  document.getElementById('modal-box').innerHTML='';
}

/* Modal de CONTRATO: papel con firmar / rechazar.
   onSign / onReject son callbacks. */
let contractCallbacks={sign:null,reject:null};
function showContractModal(club, role, salary, opts){
  opts=opts||{};
  const tier=clubTier(club);
  const tierName={1:"Gigante de Europa",2:"Club grande",3:"Primera división",4:"Segunda división",5:"Tercera división",6:"Cuarta división"}[tier]||"Club";
  const dur=opts.years||(2+Math.floor(Math.random()*4));
  document.getElementById('modal-box').innerHTML=
    '<div class="contract-paper">'+
      '<h3>Contrato profesional</h3>'+
      '<div class="club-line">'+club+' · '+tierName+'</div>'+
      '<div class="contract-role-big">'+role.label+'</div>'+
      '<div class="contract-desc">"'+role.desc+'"</div>'+
      '<div class="contract-clause"><span class="lbl">Sueldo</span><span class="val">'+salary+'M€ / temporada</span></div>'+
      '<div class="contract-clause"><span class="lbl">Duración</span><span class="val">'+dur+' temporadas</span></div>'+
      '<div class="contract-clause"><span class="lbl">Rol</span><span class="val">'+role.label+'</span></div>'+
      (opts.fee?'<div class="contract-clause"><span class="lbl">Traspaso</span><span class="val">'+opts.fee+'M€</span></div>':'')+
      '<div class="contract-signature">✍ '+P.name+'</div>'+
    '</div>'+
    '<div class="modal-btns">'+
      '<button class="btn ghost" onclick="contractReject()">Rechazar</button>'+
      '<button class="btn" onclick="contractSign()">Firmar</button>'+
    '</div>';
  document.getElementById('modal-overlay').classList.add('show');
}
function contractSign(){ closeModal(); if(contractCallbacks.sign)contractCallbacks.sign(); contractCallbacks={sign:null,reject:null}; }
function contractReject(){ closeModal(); if(contractCallbacks.reject)contractCallbacks.reject(); contractCallbacks={sign:null,reject:null}; }
