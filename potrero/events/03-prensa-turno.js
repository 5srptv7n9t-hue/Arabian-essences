/* ===== RUEDA DE PRENSA ===== */
let currentPress=null;
function pressTurn(){
  currentPress=PRESS_CONFERENCES[Math.floor(Math.random()*PRESS_CONFERENCES.length)];
  const tag=document.getElementById('ev-tag');
  tag.textContent="Rueda de prensa";tag.className='event-tag';
  document.getElementById('ev-text').innerHTML='🎙️ '+currentPress.q();
  document.getElementById('ev-choices').innerHTML=currentPress.choices.map((c,i)=>
    '<button class="choice" onclick="choosePress('+i+')">'+c.t+'<span class="hint">'+(c.hint||'')+' · 🎲</span></button>').join('');
}
function choosePress(i){
  const c=currentPress.choices[i];
  const picked=resolveRoll(c.roll);
  const deltas=applyEffFull(picked.eff);
  renderOutcome(picked.res,deltas);
}

