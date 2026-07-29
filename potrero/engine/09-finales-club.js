/* ===== FINALES DE CLUB con minijuego ===== */
function finalTurn(){
  let comp;
  if(isSudamerican()){
    comp=[["Copa Libertadores","libertadores"],["Copa Sudamericana","sudamericana"],["Copa Argentina","copaNac"]][Math.floor(Math.random()*3)];
  }else{
    comp=[["Champions League","champions"],["Europa League","europaleague"],["Copa Nacional","copaNac"]][Math.floor(Math.random()*3)];
  }
  const rival=BIG_CLUBS[Math.floor(Math.random()*BIG_CLUBS.length)];
  const tag=document.getElementById('ev-tag');
  tag.textContent="FINAL · "+comp[0];tag.className='event-tag final';
  document.getElementById('ev-text').innerHTML='🏆 <b>FINAL de la '+comp[0]+'</b> contra '+(rival===P.club?'un rival durísimo':rival)+'. Empate y el partido depende de vos.';
  document.getElementById('ev-choices').innerHTML=
    '<button class="choice" onclick="playFinal(\''+comp[1]+'\',\''+comp[0].replace(/'/g,"")+'\')">Tomar la responsabilidad.<span class="hint">Minijuego decisivo</span></button>'+
    '<button class="choice" onclick="skipFinal(\''+comp[1]+'\',\''+comp[0].replace(/'/g,"")+'\')">Dejársela a otro.<span class="hint">Seguro pero sin gloria</span></button>';
}
function skipFinal(key,name){
  const won=Math.random()<0.5;
  if(won){
    addTrophy(key,'Con '+P.club+' · Temp. '+P.season);
    const d=applyEff({apps:1,honor:1,fama:1});
    renderOutcome('Un compañero definió y salieron campeones de la '+name+'. Ganaste el título pero la gloria fue de otro.',d);
  }else{
    const d=applyEff({apps:1,honor:-1});
    renderOutcome('Le tocó a otro y falló. Perdieron la final de la '+name+'.',d);
  }
}
function playFinal(key,name){
  // arqueros definen la final atajando, no pateando
  if(isGoalkeeper()){
    const mg=GK_MINIGAMES[Math.floor(Math.random()*GK_MINIGAMES.length)];
    mg('Final al rojo vivo','La final se define y todo depende de tu atajada.',(q)=>{
      if(q==='perfect'){
        addTrophy(key,'Con '+P.club+' · Temp. '+P.season);
        addTrophy('mvpFinal','Final de la '+name+' · Temp. '+P.season);
        const d=applyEff({apps:1,honor:9,fama:7,sp:3,idol:8});
        renderOutcome('🧤 ¡ATAJASTE LO INATAJABLE! Definiste la final de la '+name+' con una atajada de leyenda. Campeón y figura. Sos ídolo eterno.',d);
      }else if(q==='good'){
        addTrophy(key,'Con '+P.club+' · Temp. '+P.season);
        const d=applyEff({apps:1,honor:6,fama:5,sp:2,idol:5});
        renderOutcome('🧤 ¡La sacaste en el momento clave! Campeón de la '+name+'. El arco fue tuyo.',d);
      }else{
        const d=applyEff({apps:1,honor:-4,fama:1});
        renderOutcome('⚽ Te la clavaron en el peor momento. Perdieron la final de la '+name+'. Duele, pero seguís.',d);
      }
    });
    return;
  }
  const mg=ALL_MINIGAMES[Math.floor(Math.random()*ALL_MINIGAMES.length)];
  const scenarios=[
    ["¡Penal decisivo!","La final se define desde los doce pasos."],
    ["Tiro libre al ángulo","Falta al borde del área en el último minuto."],
    ["Mano a mano","Quedaste solo contra el arquero."]
  ];
  const sc=scenarios[Math.floor(Math.random()*scenarios.length)];
  mg(sc[0],sc[1],(q)=>{
    if(q==='perfect'){
      addTrophy(key,'Con '+P.club+' · Temp. '+P.season);
      addTrophy('mvpFinal','Final de la '+name+' · Temp. '+P.season);
      const d=applyEff({goals:1,apps:1,honor:8,fama:6,sp:2});
      renderOutcome('¡GOLAZO! Definiste la final de la '+name+' con frialdad de leyenda. Campeón y MVP. El estadio grita tu nombre.',d);
    }else if(q==='good'){
      addTrophy(key,'Con '+P.club+' · Temp. '+P.season);
      const d=applyEff({goals:1,apps:1,honor:5,fama:4,sp:1});
      renderOutcome('¡La metiste! Campeón de la '+name+'. Sos el héroe.',d);
    }else{
      const d=applyEff({apps:1,honor:-4,fama:1});
      renderOutcome('La erraste. El estadio enmudece y pierden la final de la '+name+'. De esto se aprende.',d);
    }
  });
}

