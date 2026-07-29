/* ===== OFERTA DE JEQUE ÁRABE ===== */
function sheikhOffer(){
  const club=["Al-Hilal","Al-Nassr","Al-Ittihad","Al-Ahli"][Math.floor(Math.random()*4)];
  const money=Math.round((computeSalary(club,CONTRACT_ROLES[0])*CONFIG.jeque.salaryMult)*10)/10;
  pendingTransfer={suitor:club,fee:Math.round(ovr()*CONFIG.jeque.feeOvrMult),sheikh:true,money};
  const tag=document.getElementById('ev-tag');
  tag.textContent="💰 Oferta millonaria";tag.className='event-tag transfer';
  document.getElementById('ev-text').innerHTML='🛢️ Un jeque del <b>'+club+'</b> te ofrece <b>'+money+'M€/temporada</b>. Plata que no vas a ver en ningún otro lado, pero lejos de la elite competitiva.';
  document.getElementById('ev-choices').innerHTML=
    '<button class="choice" onclick="doSheikh(\'take\')">Aceptar la fortuna.<span class="hint">Te llenás de plata, resignás prestigio</span></button>'+
    '<button class="choice" onclick="doSheikh(\'stay\')">Rechazar, priorizar tu carrera.<span class="hint">Imagen sube, seguís compitiendo</span></button>';
}
function doSheikh(mode){
  if(mode==='take'){
    const newClub=pendingTransfer.suitor;
    const money=pendingTransfer.money;
    contractCallbacks={
      sign:()=>{
        const old=P.club;P.club=newClub;relocateLeague();
        P.salary=money;P.clubIdol=0;P.role=CONTRACT_ROLES[0];
        const d=applyEff({fama:5,honor:-4});
        renderOutcome('Firmaste con el '+P.club+' por '+money+'M€/temp. Dejaste '+old+' y la elite. La billetera explota, el prestigio deportivo baja.',d);
        toast('🛢️ Ahora jugás en '+P.club);
      },
      reject:()=>{
        const d=applyEff({honor:8,fama:2,idol:6});
        renderOutcome('A último momento rechazaste la millonada para seguir compitiendo al máximo nivel. La hinchada te idolatra.',d);
      }
    };
    showContractModal(newClub, CONTRACT_ROLES[0], money, {fee:pendingTransfer.fee});
  }else{
    const d=applyEff({honor:8,fama:2,idol:6});
    renderOutcome('Rechazaste la millonada para seguir compitiendo al máximo nivel. La hinchada te idolatra por la decisión.',d);
  }
}


