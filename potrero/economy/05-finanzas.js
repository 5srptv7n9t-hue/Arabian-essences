/* ===================== PANTALLA DE FINANZAS ===================== */
function renderFinance(){
  // contrato
  const cb=document.getElementById('contract-box');
  if(P.role){
    cb.innerHTML='<div class="contract-role">'+P.role.label+'</div>'+
      '<div style="font-size:13px;color:var(--mute);margin:4px 0 8px">'+P.role.desc+'</div>'+
      '<div class="contract-salary">💶 '+P.salary+'M€ <span>por temporada</span></div>';
  } else cb.innerHTML='<div class="empty">Sin contrato.</div>';

  // idolatría
  document.getElementById('idol-pct').textContent=Math.round(P.clubIdol)+'%';
  document.getElementById('idol-mark').style.left=P.clubIdol+'%';

  // plata
  document.getElementById('money-amount').textContent=P.money.toFixed(1)+'M€';

  // acciones
  const fa=document.getElementById('finance-actions');
  let html='';
  // UPGRADES (cuerpo técnico + sponsors)
  html+='<div class="fin-section-title">Cuerpo técnico y sponsors</div>';
  for(const k in UPGRADES){
    const u=UPGRADES[k];
    const owned=P.upgrades[k];
    const affordable=P.money>=u.cost;
    html+='<div class="fin-item">'+
      '<div class="fin-ic">'+u.ic+'</div>'+
      '<div class="fin-info"><b>'+u.n+'</b><br><span>'+u.desc+'</span></div>'+
      (owned
        ? '<div class="fin-owned">✓ Activo</div>'
        : '<button class="fin-buy" '+(affordable?'':'disabled')+' onclick="buyUpgrade(\''+k+'\')">'+(u.cost>0?u.cost+'M€':'Gratis')+'</button>')+
      '</div>';
  }
  // INVERSIONES
  html+='<div class="fin-section-title">Inversiones (riesgo real 🎲)</div>';
  INVESTMENTS.forEach(inv=>{
    const affordable=P.money>=1;
    html+='<div class="fin-item">'+
      '<div class="fin-ic">'+inv.ic+'</div>'+
      '<div class="fin-info"><b>'+inv.n+'</b><br><span>'+inv.desc+'</span></div>'+
      '<button class="fin-buy" '+(affordable?'':'disabled')+' onclick="invest(\''+inv.id+'\')">Invertir 1M€</button>'+
      '</div>';
  });
  // VICIOS
  html+='<div class="fin-section-title">Lujos, joda y apuestas (peligro ⚠️)</div>';
  VICES.forEach(v=>{
    const affordable=P.money>=v.cost;
    html+='<div class="fin-item vice">'+
      '<div class="fin-ic">'+v.ic+'</div>'+
      '<div class="fin-info"><b>'+v.n+'</b><br><span>'+v.desc+'</span></div>'+
      '<button class="fin-buy" '+(affordable?'':'disabled')+' onclick="doVice(\''+v.id+'\')">'+v.cost+'M€</button>'+
      '</div>';
  });
  fa.innerHTML=html;
  renderAgent();
}

function buyUpgrade(k){
  const u=UPGRADES[k];
  if(P.money<u.cost)return;
  P.money=Math.round((P.money-u.cost)*10)/10;
  P.upgrades[k]=true;
  toast(u.ic+' '+u.n+' contratado');
  renderFinance();refreshPanel();
}
function invest(id){
  if(P.money<1)return;
  const inv=INVESTMENTS.find(x=>x.id===id);
  P.money=Math.round((P.money-1)*10)/10;
  // resultado 50/50 según riesgo
  const bad=Math.random()<inv.risk;
  let mult, body, title;
  if(bad){ mult=inv.minMult; title='📉 '+inv.n; body='Salió mal. De 1M€ invertido recuperás solo '+(mult).toFixed(1)+'M€. A veces se pierde.'; }
  else { mult=inv.minMult+Math.random()*(inv.maxMult-inv.minMult); title='📈 '+inv.n; body='¡Rindió! Tu 1M€ se convirtió en '+(mult).toFixed(1)+'M€. Buen movimiento.'; }
  P.money=Math.round((P.money+mult)*10)/10;
  const net=Math.round((mult-1)*10)/10;
  showResultModal(title, 'Inversión', body, [['Neto', (net>=0?'+':'')+net+'M€', net>=0?'up':'down']]);
  renderFinance();refreshPanel();
}
function doVice(id){
  const v=VICES.find(x=>x.id===id);
  if(P.money<v.cost)return;
  P.money=Math.round((P.money-v.cost)*10)/10;
  const picked=resolveRoll(v.roll);
  const deltas=applyEff(picked.eff);
  // deltas incluye el gasto de entrada
  deltas.unshift(['Gasto', -v.cost+'M€', 'down']);
  const title = id==='apuestas' ? '🎰 Apuestas' : '🎉 Fiestas y lujos';
  showResultModal(title, 'Resultado', picked.res, deltas);
  renderFinance();refreshPanel();
}

