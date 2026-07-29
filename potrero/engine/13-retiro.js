/* ===== RETIRO ===== */
function retire(){
  P.retired=true;clearMini();
  const legend = P.trophies.length>=15?'una LEYENDA ETERNA del fútbol':P.trophies.length>=8?'un GRANDE recordado por generaciones':P.trophies.length>=3?'un jugador querido y respetado':'un profesional que dejó todo';
  const tt = P.talent.tier==='generacional'?'Naciste crack generacional y lo demostraste.':'';
  document.getElementById('ev-tag').textContent="El final del camino";
  document.getElementById('ev-tag').className='event-tag final';
  document.getElementById('ev-text').innerHTML=
    '🎬 A los <b>'+P.age+' años</b>, colgás los botines tras <b>'+(P.season-1)+' temporadas</b>.<br><br>'+
    'Te retirás con <b>'+P.goals+' goles</b>, <b>'+P.assists+' asistencias</b> y <b>'+P.trophies.length+' trofeos</b>.<br>'+
    'Media final: <b>'+ovr()+'</b> · Imagen: <b>'+repFromHonor(P.honor).t+'</b>.<br>'+starLegacy()+'<br><br>'+tt+'<br>Te vas siendo <b>'+legend+'</b>.';
  document.getElementById('ev-choices').innerHTML='';
  document.getElementById('outcome-box').innerHTML=
    '<div class="outcome"><div class="res">Gracias por el viaje. Mirá todo tu palmarés en la pestaña Palmarés.</div>'+
    '<button class="btn" onclick="location.reload()">Empezar una nueva carrera</button></div>';
  refreshPanel();window.scrollTo({top:0,behavior:'smooth'});
}

