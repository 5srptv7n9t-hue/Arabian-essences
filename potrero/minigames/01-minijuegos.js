/* ===================== MINIJUEGOS DE FINALES ===================== */
/* Cada minijuego llama a onWin(quality) / onLose() al terminar.
   quality: 'perfect' | 'good' | 'fail'  */

let miniRAF=null, miniActive=false;

function clearMini(){ if(miniRAF){cancelAnimationFrame(miniRAF);miniRAF=null} miniActive=false; }

/* --- 1) TIMING: barra con cursor que rebota, frenás en la zona verde/dorada --- */
function miniTiming(title, desc, onResult){
  clearMini();miniActive=true;
  const zoneW=18+Math.random()*10;          // ancho zona verde (%)
  const zoneX=15+Math.random()*(70-zoneW);   // pos zona (%)
  const perfW=zoneW*0.34;
  const perfX=zoneX+(zoneW-perfW)/2;
  document.getElementById('outcome-box').innerHTML=
    '<div class="outcome mini-wrap">'+
    '<div class="final-badge">Definición</div>'+
    '<div class="mini-title">'+title+'</div>'+
    '<div class="mini-desc">'+desc+'</div>'+
    '<div class="timing-track" id="tt">'+
      '<div class="timing-zone" style="left:'+zoneX+'%;width:'+zoneW+'%"></div>'+
      '<div class="timing-zone perfect" style="left:'+perfX+'%;width:'+perfW+'%"></div>'+
      '<div class="timing-cursor" id="tc" style="left:0%"></div>'+
    '</div>'+
    '<div class="mini-hint">Tocá STOP cuando el cursor esté en la zona (dorado = perfecto)</div>'+
    '<button class="btn" id="stopBtn">STOP</button>'+
    '</div>';
  let pos=0,dir=1,speed=1.15+Math.random()*0.5;
  const cursor=document.getElementById('tc');
  const loop=()=>{
    if(!miniActive)return;
    pos+=dir*speed;
    if(pos>=100){pos=100;dir=-1}
    if(pos<=0){pos=0;dir=1}
    cursor.style.left=pos+'%';
    miniRAF=requestAnimationFrame(loop);
  };
  loop();
  document.getElementById('stopBtn').onclick=()=>{
    if(!miniActive)return;
    clearMini();
    let q='fail';
    if(pos>=perfX&&pos<=perfX+perfW) q='perfect';
    else if(pos>=zoneX&&pos<=zoneX+zoneW) q='good';
    onResult(q);
  };
}

/* --- 2) POWER+AIM: barra de potencia que sube/baja, parás cerca del target --- */
function miniPower(title, desc, onResult){
  clearMini();miniActive=true;
  const targetX=45+Math.random()*35;
  document.getElementById('outcome-box').innerHTML=
    '<div class="outcome mini-wrap">'+
    '<div class="final-badge">Potencia</div>'+
    '<div class="mini-title">'+title+'</div>'+
    '<div class="mini-desc">'+desc+'</div>'+
    '<div class="power-track">'+
      '<div class="power-fill" id="pf" style="width:0%"></div>'+
      '<div class="power-target" style="left:'+targetX+'%"></div>'+
    '</div>'+
    '<div class="mini-hint">Soltá la barra lo más cerca posible de la línea blanca</div>'+
    '<button class="btn" id="pwBtn">PEGARLE</button>'+
    '</div>';
  let pw=0,dir=1,speed=1.3+Math.random()*0.4;
  const fill=document.getElementById('pf');
  const loop=()=>{
    if(!miniActive)return;
    pw+=dir*speed;
    if(pw>=100){pw=100;dir=-1}
    if(pw<=0){pw=0;dir=1}
    fill.style.width=pw+'%';
    miniRAF=requestAnimationFrame(loop);
  };
  loop();
  document.getElementById('pwBtn').onclick=()=>{
    if(!miniActive)return;
    clearMini();
    const diff=Math.abs(pw-targetX);
    let q='fail';
    if(diff<=5)q='perfect';else if(diff<=15)q='good';
    onResult(q);
  };
}

/* --- 3) QTE: aparece una flecha, tenés que tocar el botón correcto rápido --- */
function miniQTE(title, desc, onResult){
  clearMini();miniActive=true;
  const dirs=[['◀','IZQ'],['▶','DER'],['▲','ARRIBA'],['▼','ABAJO']];
  const correct=Math.floor(Math.random()*4);
  document.getElementById('outcome-box').innerHTML=
    '<div class="outcome mini-wrap">'+
    '<div class="final-badge">Reflejos</div>'+
    '<div class="mini-title">'+title+'</div>'+
    '<div class="mini-desc">'+desc+'</div>'+
    '<div style="font-family:Anton;font-size:60px;color:var(--gold);margin:6px 0" id="qteArrow">'+dirs[correct][0]+'</div>'+
    '<div class="mini-hint" id="qteHint">Tocá la dirección correcta antes de que se acabe el tiempo</div>'+
    '<div class="qte-btns" id="qteBtns">'+
      dirs.map((d,i)=>'<button class="qte-btn" data-i="'+i+'">'+d[0]+'</button>').join('')+
    '</div></div>';
  let answered=false;
  const timeLimit=1300;
  const t0=performance.now();
  document.querySelectorAll('#qteBtns .qte-btn').forEach(b=>{
    b.onclick=()=>{
      if(answered||!miniActive)return;answered=true;clearMini();
      const i=parseInt(b.getAttribute('data-i'));
      const dt=performance.now()-t0;
      let q='fail';
      if(i===correct){ q = dt<600?'perfect':'good'; }
      onResult(q);
    };
  });
  // timeout
  miniActive=true;
  const to=setTimeout(()=>{
    if(answered||!miniActive)return;answered=true;clearMini();onResult('fail');
  },timeLimit);
  // guardamos para poder cancelar
  clearMini._to=to;
}

const MINIGAMES=[miniTiming,miniPower,miniQTE];

/* --- 4) SUERTE 50/50: elegís un lado, el destino decide --- */
function miniLuck(title, desc, onResult){
  clearMini();miniActive=true;
  document.getElementById('outcome-box').innerHTML=
    '<div class="outcome mini-wrap">'+
    '<div class="final-badge">Suerte · 50/50</div>'+
    '<div class="mini-title">'+title+'</div>'+
    '<div class="mini-desc">'+desc+'</div>'+
    '<div class="mini-hint">Elegí un palo. Es 50 y 50: mitad habilidad, mitad destino.</div>'+
    '<div class="qte-btns" style="margin-top:14px">'+
      '<button class="qte-btn" id="luckL">◀ IZQUIERDA</button>'+
      '<button class="qte-btn" id="luckR">DERECHA ▶</button>'+
    '</div></div>';
  const decide=(pick)=>{
    if(!miniActive)return;clearMini();
    const goalSide=Math.random()<0.5?'L':'R';
    // 50/50 puro, pero un pelín de ventaja si tu definicion es alta
    const edge=(P.stats.definicion-50)/300; // ±~0.16
    const win = pick===goalSide ? true : (Math.random()< (0.12+Math.max(0,edge)));
    onResult(win?'good':'fail');
  };
  document.getElementById('luckL').onclick=()=>decide('L');
  document.getElementById('luckR').onclick=()=>decide('R');
}

const ALL_MINIGAMES=[miniTiming,miniPower,miniQTE,miniLuck];

/* ===================== MINIJUEGOS DE ARQUERO =====================
   Mezcla: el minijuego manda, pero la stat de defensa te da ventaja
   (zona de atajada más grande / más margen). */
function gkAdvantage(){
  // defensa 40 → 0 ventaja; defensa 90 → +0.5 factor
  return Math.max(0, (P.stats.defensa-45)/90);
}

/* 1) ATAJAR PENAL: elegís palo + timing. La def te agranda la ventana. */
function gkPenalty(title, desc, onResult){
  clearMini();miniActive=true;
  const goalSide=Math.random()<0.5?'L':'R';
  document.getElementById('outcome-box').innerHTML=
    '<div class="outcome mini-wrap">'+
    '<div class="final-badge">Atajada · Arquero</div>'+
    '<div class="mini-title">'+title+'</div>'+
    '<div class="mini-desc">'+desc+'</div>'+
    '<div class="mini-hint">Adiviná el palo. Tu nivel de arquero te da ventaja si acertás el lado.</div>'+
    '<div class="qte-btns" style="margin-top:14px">'+
      '<button class="qte-btn" id="gkL">◀ VOLAR IZQ</button>'+
      '<button class="qte-btn" id="gkR">VOLAR DER ▶</button>'+
    '</div></div>';
  const decide=(pick)=>{
    if(!miniActive)return;clearMini();
    if(pick===goalSide){
      // acertaste el lado: la atajada depende de tu nivel (mezcla)
      const chance=0.55+gkAdvantage()*0.7; // def alta => casi seguro
      if(Math.random()<Math.min(0.95,chance)) onResult('perfect');
      else onResult('good'); // rozaste, córner
    } else {
      // erraste el lado: solo un arquerazo la saca
      const chance=0.08+gkAdvantage()*0.25;
      onResult(Math.random()<chance?'good':'fail');
    }
  };
  document.getElementById('gkL').onclick=()=>decide('L');
  document.getElementById('gkR').onclick=()=>decide('R');
}

/* 2) MANO A MANO: timing para achicar en el momento justo. Def agranda la zona. */
function gkOneOnOne(title, desc, onResult){
  clearMini();miniActive=true;
  const adv=gkAdvantage();
  const zoneW=16+adv*18+Math.random()*8; // def alta => zona más grande
  const zoneX=15+Math.random()*(72-zoneW);
  const perfW=zoneW*0.32;
  const perfX=zoneX+(zoneW-perfW)/2;
  document.getElementById('outcome-box').innerHTML=
    '<div class="outcome mini-wrap">'+
    '<div class="final-badge">Mano a mano · Arquero</div>'+
    '<div class="mini-title">'+title+'</div>'+
    '<div class="mini-desc">'+desc+'</div>'+
    '<div class="timing-track" id="tt">'+
      '<div class="timing-zone" style="left:'+zoneX+'%;width:'+zoneW+'%"></div>'+
      '<div class="timing-zone perfect" style="left:'+perfX+'%;width:'+perfW+'%"></div>'+
      '<div class="timing-cursor" id="tc" style="left:0%"></div>'+
    '</div>'+
    '<div class="mini-hint">Achicá en el momento justo (STOP en la zona). Tu nivel agranda la ventana.</div>'+
    '<button class="btn" id="stopBtn">¡ACHICAR!</button>'+
    '</div>';
  let pos=0,dir=1,speed=1.2+Math.random()*0.5;
  const cursor=document.getElementById('tc');
  const loop=()=>{
    if(!miniActive)return;
    pos+=dir*speed;
    if(pos>=100){pos=100;dir=-1}
    if(pos<=0){pos=0;dir=1}
    cursor.style.left=pos+'%';
    miniRAF=requestAnimationFrame(loop);
  };
  loop();
  document.getElementById('stopBtn').onclick=()=>{
    if(!miniActive)return;clearMini();
    let q='fail';
    if(pos>=perfX&&pos<=perfX+perfW) q='perfect';
    else if(pos>=zoneX&&pos<=zoneX+zoneW) q='good';
    onResult(q);
  };
}

const GK_MINIGAMES=[gkPenalty,gkOneOnOne];
