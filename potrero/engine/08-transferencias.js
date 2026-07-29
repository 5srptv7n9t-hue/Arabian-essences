/* ===== TRANSFERENCIAS ===== */
function transferTurn(){
  const suitor=BIG_CLUBS[Math.floor(Math.random()*BIG_CLUBS.length)];
  if(suitor===P.club){normalEvent();return}
  const fee=Math.round(ovr()*CONFIG.transfer.feeOvrMult)+Math.floor(Math.random()*CONFIG.transfer.feeRand);
  pendingTransfer={suitor,fee};
  const tag=document.getElementById('ev-tag');
  tag.textContent="Transferencia";tag.className='event-tag transfer';
  document.getElementById('ev-text').innerHTML='📞 El <b>'+suitor+'</b> pone <b>'+fee+'M€</b> para llevarte. El '+P.club+' escucha ofertas.';
  document.getElementById('ev-choices').innerHTML=
    '<button class="choice" onclick="doTransfer(\'accept\')">Aceptar y dar el salto.<span class="hint">Club más grande, más presión</span></button>'+
    '<button class="choice" onclick="doTransfer(\'loyal\')">Quedarme en '+P.club+'.<span class="hint">Lealtad, imagen sube</span></button>'+
    '<button class="choice" onclick="doTransfer(\'force\')">Forzar la salida por prensa.<span class="hint">Te vas seguro, imagen cae</span></button>';
}
function doTransfer(mode){
  let res,deltas;
  if(mode==='accept'){
    // mostrar el PAPEL del contrato del nuevo club antes de concretar
    const newClub=pendingTransfer.suitor;
    const role=pickRole(newClub);
    const salary=computeSalary(newClub, role);
    contractCallbacks={
      sign:()=>{
        const old=P.club;P.club=newClub;relocateLeague();
        P.clubIdol=0;P.role=role;P.salary=salary;
        const d=applyEff({fama:4,honor:2,sp:1});
        renderOutcome('Firmaste con el '+P.club+' por '+pendingTransfer.fee+'M€. Dejás '+old+'. Rol: '+role.label+', '+salary+'M€/temp.',d);
        toast('✈ Ahora jugás en '+P.club);
      },
      reject:()=>{
        const d=applyEff({honor:3,idol:2});
        renderOutcome('Rechazaste el contrato del '+newClub+'. Te quedás en '+P.club+'. La hinchada lo valora.',d);
      }
    };
    showContractModal(newClub, role, salary, {fee:pendingTransfer.fee});
    return;
  }else if(mode==='loyal'){
    deltas=applyEff({honor:9,fama:1,sp:1,idol:5});
    res='Rechazaste al '+pendingTransfer.suitor+'. La hinchada de '+P.club+' te idolatra.';
  }else{
    const old=P.club;P.club=pendingTransfer.suitor;relocateLeague();
    P.clubIdol=0;signContract(P.club,false);
    deltas=applyEff({fama:3,honor:-9,sp:1});
    res='Forzaste la salida al '+P.club+'. Los hinchas de '+old+' te silban de por vida. Nuevo rol: '+P.role.label+'.';
    toast('✈ Ahora jugás en '+P.club);
  }
  renderOutcome(res,deltas);
}
function relocateLeague(){for(const lg in LEAGUES){if(LEAGUES[lg].includes(P.club)){P.league=lg;return}}}

