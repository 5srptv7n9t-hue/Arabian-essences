/* ===== TOAST + INIT ===== */
let toastT;
function toast(msg,cls){
  const t=document.getElementById('toast');
  t.textContent=msg;t.className='toast show'+(cls?' '+cls:'');
  clearTimeout(toastT);toastT=setTimeout(()=>t.className='toast',2300);
}
window.addEventListener('DOMContentLoaded',()=>{ initSelects(); });

function starLegacy(){
  const s=P.mediaStar;
  if(s>=70)return 'Fuiste un <b>ícono global</b>, estrella dentro y fuera de la cancha.';
  if(s>=40)return 'Te convertiste en una <b>figura mediática</b> reconocida.';
  if(s>=15)return 'Tuviste tu costado <b>mediático</b>, sin perder el foco.';
  return 'Te mantuviste <b>alejado de las cámaras</b>, puro fútbol.';
}
