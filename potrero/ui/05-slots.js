/* ===== PANTALLA DE PARTIDAS (slots) ===== */
/* Menu inicial: continuar una partida, empezar una nueva (sin pisar las
   otras) o borrar. Usa las clases de estilo que ya existen: no cambia la
   estetica del juego. */

let _slotConfirmDelete = null;

function activateScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const el = document.getElementById(id);
  if(el) el.classList.add('active');
  window.scrollTo(0,0);
}
function showCreate(){ activateScreen('s-create'); }
function showGameScreen(){ activateScreen('s-game'); }

function escapeHtml(s){
  return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

/* Empezar una carrera nueva: reserva un slot fresco y va al editor. Las demas
   partidas quedan intactas. */
function newGame(){
  currentSlotId = newSlotId();
  _slotConfirmDelete = null;
  initSelects();      // resetea el formulario y el editor de atributos
  showCreate();
}

/* Retomar una partida guardada */
function continueSlot(id){
  if(loadSlot(id)){
    showGameScreen();
    const tabs = document.querySelectorAll('.tabs .tab');
    tabs.forEach(t=>t.classList.remove('active'));
    if(tabs[0]){ tabs[0].classList.add('active'); showTab('play', tabs[0]); }
    refreshPanel();
    if(P.retired){ retire(); } else { nextTurn(); }
  }else{
    toast('No se pudo cargar la partida', 'lose');
    renderSlots();
  }
}

function askDeleteSlot(id){ _slotConfirmDelete = id; renderSlots(); }
function cancelDeleteSlot(){ _slotConfirmDelete = null; renderSlots(); }
function confirmDeleteSlot(id){ deleteSlot(id); _slotConfirmDelete = null; renderSlots(); }

function renderSlots(){
  const list = document.getElementById('slots-list');
  if(!list) return;
  const saves = listSaves();
  if(saves.length === 0){
    list.innerHTML = '<div class="empty">Todavía no tenés partidas guardadas. Empezá una nueva.</div>';
    return;
  }
  list.innerHTML = saves.map(s=>{
    const m = s.meta || {};
    const estado = m.retired ? '🎬 Carrera terminada' : (m.age + ' años · Temporada ' + m.season);
    const line2 = escapeHtml(m.club || '—') + ' · media ' + (m.ovr!=null?m.ovr:'--') + ' · ' + (m.goals||0) + ' goles · ' + (m.trophies||0) + ' 🏆';
    const btns = (_slotConfirmDelete === s.id)
      ? '<div class="modal-btns">'
        + '<button class="btn ghost" onclick="cancelDeleteSlot()">Cancelar</button>'
        + '<button class="btn" style="background:linear-gradient(180deg,var(--blood),#b53c33);color:#fff;box-shadow:none" onclick="confirmDeleteSlot(\''+s.id+'\')">Sí, borrar</button>'
        + '</div>'
      : '<div class="modal-btns">'
        + '<button class="btn ghost" onclick="askDeleteSlot(\''+s.id+'\')">Borrar</button>'
        + '<button class="btn cyan" onclick="continueSlot(\''+s.id+'\')">Continuar ▸</button>'
        + '</div>';
    return '<div class="card">'
      + '<h2>' + escapeHtml(m.name || 'Jugador') + '</h2>'
      + '<div style="color:var(--mute);font-size:13px;margin-bottom:2px">' + estado + '</div>'
      + '<div style="color:var(--mute);font-size:13px">' + line2 + '</div>'
      + btns
      + '</div>';
  }).join('');
}

function showSlots(){ _slotConfirmDelete = null; renderSlots(); activateScreen('s-slots'); }

/* volver al menu (usado por el boton de retiro y el "volver" del editor) */
function backToMenu(){
  if(storageOK()) showSlots();
  else location.reload();
}

/* pantalla inicial: si hay partidas guardadas mostramos el menu de slots;
   si no, dejamos la pantalla de creacion (que ya viene activa). */
function bootScreen(){
  if(!currentSlotId) currentSlotId = newSlotId();
  if(storageOK() && listSaves().length > 0){ showSlots(); }
}
// igual que initSelects: si el DOM ya cargo (juego inyectado en un visor),
// arrancamos en el acto en vez de esperar un evento que ya paso.
if(document.readyState==='loading') window.addEventListener('DOMContentLoaded', bootScreen);
else bootScreen();
