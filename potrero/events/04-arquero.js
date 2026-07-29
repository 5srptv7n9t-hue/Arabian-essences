/* ===== ARQUERO: atajada decisiva ===== */
function isGoalkeeper(){ return P.posGroup==='Arquero'; }
function gkSaveTurn(){
  const scenarios=[
    {mg:'gkPenalty', t:'¡Penal en contra!', d:'El árbitro cobró penal sobre la hora. El partido está en tus guantes.'},
    {mg:'gkOneOnOne', t:'¡Mano a mano!', d:'El delantero rival quedó solo contra vos. Definí el momento de achicar.'},
    {mg:'gkPenalty', t:'Penal decisivo', d:'Empate y penal en el último minuto. Todo depende de tu atajada.'},
    {mg:'gkOneOnOne', t:'Contraataque letal', d:'Se escapó un delantero y viene derecho al arco. Salí a cortarlo.'}
  ];
  const sc=scenarios[Math.floor(Math.random()*scenarios.length)];
  const mg = sc.mg==='gkPenalty'?gkPenalty:gkOneOnOne;
  const tag=document.getElementById('ev-tag');
  tag.textContent="Atajada decisiva";tag.className='event-tag final';
  document.getElementById('ev-text').innerHTML='🧤 '+sc.d;
  document.getElementById('ev-choices').innerHTML=
    '<button class="choice" onclick="playGkSave(\''+sc.mg+'\')">Ir a por la atajada.<span class="hint">Minijuego de arquero</span></button>';
}
function playGkSave(which){
  const mg = which==='gkPenalty'?gkPenalty:gkOneOnOne;
  const titles = which==='gkPenalty'?['¡Volá!','Adiviná el palo']:['¡Achicá!','El momento justo'];
  mg('Atajada', 'Es tu momento, arquero.', (q)=>{
    if(q==='perfect'){
      const d=applyEff({apps:1,honor:8,fama:6,sp:3,idol:6});
      renderOutcome('🧤 ¡ATAJADÓN! La sacaste de manera imposible. El estadio corea tu nombre, sos la figura del partido.',d);
      if(ovr()>78 && Math.random()<0.25) addTrophy('guante','Atajada histórica · Temp. '+P.season);
    }else if(q==='good'){
      const d=applyEff({apps:1,honor:5,fama:3,sp:2,idol:3});
      renderOutcome('🧤 ¡La sacaste! No fue perfecta pero salvaste al equipo. Aplausos de la tribuna.',d);
    }else{
      const d=applyEff({apps:1,honor:-4,fama:1});
      renderOutcome('⚽ No llegaste. Gol en contra y bronca. De los arqueros se habla siempre, para bien o para mal.',d);
    }
  });
}
