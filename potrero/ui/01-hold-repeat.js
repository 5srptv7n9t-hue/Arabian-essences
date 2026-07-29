/* ===== HOLD TO REPEAT ===== */
let holdTimer=null, holdInterval=null;
function bindHolds(){
  document.querySelectorAll('[data-hold]').forEach(btn=>{
    if(btn._holdBound) return; btn._holdBound=true;
    const doFire=()=>{
      const [fn,k,d]=btn.getAttribute('data-hold').split(':');
      if(fn==='editBump') return editBump(k,parseInt(d));
      if(fn==='pendBump') return pendBump(k,parseInt(d));
      return false;
    };
    const start=(e)=>{
      e.preventDefault();
      if(!doFire()) return;
      holdTimer=setTimeout(()=>{
        let speed=140;
        const tick=()=>{ if(!doFire()){stopHold();return} speed=Math.max(35,speed-12); holdInterval=setTimeout(tick,speed); };
        tick();
      },320);
    };
    const stopHold=()=>{clearTimeout(holdTimer);clearTimeout(holdInterval)};
    btn.addEventListener('mousedown',start);
    btn.addEventListener('touchstart',start,{passive:false});
    ['mouseup','mouseleave','touchend','touchcancel'].forEach(ev=>btn.addEventListener(ev,stopHold));
  });
}

