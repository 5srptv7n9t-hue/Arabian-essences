/* ===== TORNEOS DE SELECCIÓN ===== */
function availableNationalComps(){
  const comps=[];
  const isEuro=["España","Francia","Inglaterra","Portugal","Italia","Alemania","Países Bajos","Croacia","Bélgica"].includes(P.nat);
  comps.push(["Copa del Mundo","mundial"]);
  if(isEuro) comps.push(["Eurocopa","eurocopa"],["Nations League","nations"]);
  else comps.push(["Copa América","copaAmerica"]);
  if(P.age<=23) comps.push(["Juegos Olímpicos","olimpicos"]);
  return comps;
}
function nationalTournamentTurn(){
  const comps=availableNationalComps();
  const comp=comps[Math.floor(Math.random()*comps.length)];
  const tag=document.getElementById('ev-tag');
  tag.textContent="SELECCIÓN · "+comp[0];tag.className='event-tag final';
  document.getElementById('ev-text').innerHTML='🎽 <b>Final de la '+comp[0]+'</b> con '+P.nat+'. El país entero te mira.';
  document.getElementById('ev-choices').innerHTML=
    '<button class="choice" onclick="playFinal(\''+comp[1]+'\',\''+comp[0].replace(/'/g,"")+'\')">Agarrar la pelota y definir.<span class="hint">Minijuego decisivo</span></button>'+
    '<button class="choice" onclick="skipFinal(\''+comp[1]+'\',\''+comp[0].replace(/'/g,"")+'\')">Confiar en un compañero.<span class="hint">Seguro pero sin gloria</span></button>';
  return true;
}

