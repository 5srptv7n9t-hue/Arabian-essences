/* ===== ESCUDOS DE CLUB (generados) =====
   Genera un escudo por club: forma de escudo + colores reales del club +
   iniciales. Los colores de un club NO son marca registrada (a diferencia del
   logo), asi que esto es seguro y escala a TODOS los clubes. Si un club no
   esta en el mapa, se le derivan colores a partir del nombre. */

/* Colores [principal, acento] de los clubes conocidos (aprox. a sus camisetas) */
const CLUB_COLORS = {
  // Argentina
  "River Plate":["#ffffff","#d81e2c"], "Boca Juniors":["#0a2a66","#f2b100"],
  "Racing":["#4aa3df","#ffffff"], "Independiente":["#d81e2c","#111111"],
  "San Lorenzo":["#123a8f","#c81d25"], "Estudiantes":["#d81e2c","#ffffff"],
  "Vélez":["#ffffff","#0a2a66"], "Talleres":["#1a2b6b","#ffffff"],
  "Huracán":["#ffffff","#d81e2c"], "Lanús":["#7a1f2b","#ffffff"],
  "Defensa y Justicia":["#00843d","#f2c200"], "Newell's":["#d81e2c","#111111"],
  "Colón":["#111111","#d81e2c"], "Chacarita":["#d81e2c","#111111"],
  // Inglaterra
  "Manchester City":["#6cabdd","#ffffff"], "Arsenal":["#ef0107","#ffffff"],
  "Liverpool":["#c8102e","#ffffff"], "Man United":["#da291c","#f2c200"],
  "Chelsea":["#034694","#ffffff"], "Tottenham":["#ffffff","#132257"],
  "Newcastle":["#111111","#ffffff"], "Aston Villa":["#670e36","#95bfe5"],
  "Brighton":["#0057b8","#ffffff"], "West Ham":["#7a263a","#1bb1e7"],
  "Leeds":["#ffffff","#1d428a"], "Leicester":["#003090","#fdbe11"],
  "Southampton":["#d71920","#ffffff"], "Sunderland":["#d81e2c","#ffffff"],
  // España
  "Real Madrid":["#ffffff","#00327d"], "Barcelona":["#0b1d51","#a50044"],
  "Atlético":["#ce3524","#ffffff"], "Sevilla":["#ffffff","#d81e2c"],
  "Real Sociedad":["#0b3b8f","#ffffff"], "Villarreal":["#ffd400","#004c9b"],
  "Betis":["#00954c","#ffffff"], "Athletic":["#ee2523","#ffffff"],
  "Valencia":["#ffffff","#f18e00"], "Girona":["#d81e2c","#ffffff"],
  "Espanyol":["#0072ce","#ffffff"], "Zaragoza":["#ffffff","#0a2a66"],
  // Italia
  "Inter":["#0b1f8f","#111111"], "Milan":["#111111","#d81e2c"],
  "Juventus":["#111111","#ffffff"], "Napoli":["#12a0d7","#ffffff"],
  "Roma":["#8e1f2f","#f2b100"], "Lazio":["#87d8f7","#ffffff"],
  "Atalanta":["#111111","#1b71b8"], "Fiorentina":["#5b2a86","#ffffff"],
  "Bologna":["#a21c2b","#0a2a66"], "Torino":["#7a1f2b","#ffffff"],
  // Alemania
  "Bayern":["#dc052d","#ffffff"], "Dortmund":["#fde100","#111111"],
  "Leipzig":["#ffffff","#dd0741"], "Leverkusen":["#e32219","#111111"],
  "Frankfurt":["#111111","#d81e2c"], "Wolfsburg":["#65b32e","#ffffff"],
  "Stuttgart":["#ffffff","#d81e2c"], "Union Berlin":["#e21b2c","#ffe600"],
  "Schalke 04":["#004d9d","#ffffff"], "Hamburgo":["#ffffff","#0a2a66"],
  // Francia
  "PSG":["#0a1a4f","#d81e2c"], "Marsella":["#2faee0","#ffffff"],
  "Mónaco":["#e51b22","#ffffff"], "Lyon":["#ffffff","#0a2a66"],
  "Lille":["#d81e2c","#0a2a66"], "Niza":["#111111","#d81e2c"],
  "Rennes":["#111111","#d81e2c"], "Lens":["#f2c200","#d81e2c"],
  // Brasil
  "Flamengo":["#d81e2c","#111111"], "Palmeiras":["#006437","#ffffff"],
  "Fluminense":["#7a1f4e","#00674a"], "Corinthians":["#111111","#ffffff"],
  "São Paulo":["#ffffff","#d81e2c"], "Grêmio":["#0d80bf","#111111"],
  "Internacional":["#d81e2c","#ffffff"], "Botafogo":["#111111","#ffffff"],
  "Vasco":["#111111","#ffffff"],
  // Otras
  "Ajax":["#ffffff","#d2122e"], "PSV":["#e2001a","#ffffff"],
  "Feyenoord":["#d81e2c","#ffffff"], "Benfica":["#e40521","#ffffff"],
  "Porto":["#0a3d91","#ffffff"], "Sporting":["#1a8c4a","#ffffff"],
  "Inter Miami":["#f7b5cd","#111111"], "LA Galaxy":["#00245d","#f2c200"],
  "LAFC":["#111111","#c39e6d"], "América":["#ffe600","#0a2a66"],
  "Chivas":["#ffffff","#d81e2c"], "Cruz Azul":["#0a2a66","#ffffff"],
  "Monterrey":["#0a2a66","#ffffff"], "Tigres":["#f2b100","#0a2a66"],
  "Al-Hilal":["#0b56a4","#ffffff"], "Al-Nassr":["#f2c200","#0a2a66"],
  "Al-Ittihad":["#111111","#f2c200"], "Al-Ahli":["#00954c","#ffffff"]
};

function crestColorsFor(club){
  if(CLUB_COLORS[club]) return CLUB_COLORS[club];
  // color derivado del nombre (determinista) para los que no estan en el mapa
  let h=0; for(let i=0;i<club.length;i++) h=(h*31+club.charCodeAt(i))>>>0;
  const hue=h%360, hue2=(hue+38)%360;
  return ['hsl('+hue+',52%,34%)','hsl('+hue2+',70%,58%)'];
}

function clubInitials(club){
  const stop=["de","y","del","la","el","fc","cf","sc","ac"];
  const words=club.replace(/[().]/g,'').split(/[\s-]+/).filter(w=>w && stop.indexOf(w.toLowerCase())<0);
  let ini=words.map(w=>w[0]).join('').toUpperCase();
  if(ini.length>3) ini=ini.slice(0,3);
  if(ini.length<2) ini=club.replace(/[^A-Za-zÀ-ÿ]/g,'').slice(0,3).toUpperCase();
  return ini;
}

/* color de texto legible segun el fondo (para colores #hex; los hsl que usamos
   como fallback son oscuros -> texto blanco) */
function textOn(color){
  const m=/^#([0-9a-fA-F]{6})$/.exec(color);
  if(!m) return '#fff';
  const n=parseInt(m[1],16), r=(n>>16)&255, g=(n>>8)&255, b=n&255;
  const lum=(0.299*r+0.587*g+0.114*b)/255;
  return lum>0.62 ? '#15213f' : '#ffffff';
}

/* devuelve un <svg> con el escudo GENERADO del club (fallback) */
function clubCrestSVG(club, size){
  size=size||34;
  const cols=crestColorsFor(club), c1=cols[0], c2=cols[1];
  const ini=clubInitials(club), tcol=textOn(c1);
  const fs=(ini.length>=3?13:16);
  return '<svg class="crest" width="'+size+'" height="'+size+'" viewBox="0 0 40 44" '+
    'style="vertical-align:middle;flex:0 0 auto;filter:drop-shadow(0 2px 3px rgba(0,0,0,.4))" aria-hidden="true">'+
    '<path d="M3 3 H37 V25 Q37 37 20 42 Q3 37 3 25 Z" fill="'+c1+'" stroke="rgba(0,0,0,.45)" stroke-width="1.5"/>'+
    '<path d="M3 3 H37 V13 H3 Z" fill="'+c2+'"/>'+
    '<path d="M3 3 H37 V25 Q37 37 20 42 Q3 37 3 25 Z" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="1"/>'+
    '<text x="20" y="32" text-anchor="middle" font-family="Anton,\'Barlow Condensed\',sans-serif" '+
    'font-size="'+fs+'" font-weight="700" fill="'+tcol+'">'+ini+'</text>'+
    '</svg>';
}

/* preview del escudo en la pantalla de creacion (al elegir liga/club) */
function updateClubPreview(){
  const el=document.getElementById('club-crest-preview');
  if(!el) return;
  const club=document.getElementById('in-club').value;
  const liga=document.getElementById('in-league')?document.getElementById('in-league').value:'';
  if(!club){ el.innerHTML=''; return; }
  el.innerHTML='<div style="display:flex;align-items:center;justify-content:center;gap:10px">'+
    clubCrest(club,44)+'<span style="font-family:\'Barlow Condensed\';text-transform:uppercase;letter-spacing:.1em;color:var(--chalk)">'+club+'</span>'+
    (liga?ligaLogoOpcional(liga,26):'')+'</div>';
}

/* ===== capa "logo REAL si existe, si no el generado" =====
   Los PNG reales los baja recursos_juego/descargar_recursos.py en la compu.
   Mientras no existan, cada <img> falla y cae en el fallback (generado/emoji),
   asi que el juego se ve igual que ahora y no se rompe nada. */
const RUTA_ESCUDOS='recursos_juego/escudos/';
const RUTA_COMPETENCIAS='recursos_juego/competencias/';

/* slug identico al del script Python (para que los nombres de archivo coincidan) */
function slugRecurso(s){
  s=String(s).normalize('NFKD').replace(/[̀-ͯ]/g,'');
  s=s.replace(/[^A-Za-z0-9]+/g,'-').replace(/^-+|-+$/g,'').toLowerCase();
  return s||'x';
}
function _escAttr(s){ return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;'); }

/* <img> del recurso real; si no existe (onerror), se reemplaza por fallbackHTML */
function recursoImg(src, fallbackHTML, size, style){
  return '<img src="'+src+'" width="'+size+'" height="'+size+'" '+
    'style="object-fit:contain;vertical-align:middle;display:inline-block;'+(style||'')+'" '+
    'data-fb="'+_escAttr(fallbackHTML)+'" '+
    "onerror=\"this.onerror=null;this.outerHTML=this.getAttribute('data-fb')\">";
}

/* ESCUDO de club: logo real si existe, si no el escudo generado */
function clubCrest(club, size){
  size=size||34;
  return recursoImg(RUTA_ESCUDOS+slugRecurso(club)+'.png', clubCrestSVG(club,size), size);
}

/* Emblema GENERADO para un trofeo/premio/competencia: medalla circular con
   color propio (por nombre) y el icono en el centro. Es el fallback cuando no
   hay un logo real, para que cada premio tenga su "logo" y no un emoji pelado. */
function trofeoEmblema(nombre, emoji, size){
  size=size||24;
  let h=0; for(let i=0;i<nombre.length;i++) h=(h*31+nombre.charCodeAt(i))>>>0;
  const hue=h%360;
  const c1='hsl('+hue+',60%,42%)', c2='hsl('+((hue+28)%360)+',65%,30%)';
  return '<svg class="crest" width="'+size+'" height="'+size+'" viewBox="0 0 40 40" '+
    'style="vertical-align:middle;flex:0 0 auto;filter:drop-shadow(0 1px 2px rgba(0,0,0,.5))" aria-hidden="true">'+
    '<circle cx="20" cy="20" r="19" fill="#e8ad2a"/>'+
    '<circle cx="20" cy="20" r="18.5" fill="none" stroke="#8a6410" stroke-width="1"/>'+
    '<circle cx="20" cy="20" r="15" fill="'+c1+'"/>'+
    '<circle cx="20" cy="20" r="15" fill="none" stroke="rgba(255,255,255,.30)" stroke-width="1"/>'+
    '<text x="20" y="27" text-anchor="middle" font-size="17">'+emoji+'</text>'+
    '</svg>';
}

/* LOGO de competencia/premio: real si existe (ícono/logo tal cual), si no el
   emblema generado. El logo real NO se recorta en círculo. */
function compLogoOrEmoji(nombre, emoji, size){
  size=size||24;
  return recursoImg(RUTA_COMPETENCIAS+slugRecurso(nombre)+'.png',
                    trofeoEmblema(nombre, emoji, size), size, '');
}

/* LOGO de liga (opcional): si no hay archivo, no muestra nada */
function ligaLogoOpcional(liga, size){
  return '<img src="'+RUTA_COMPETENCIAS+slugRecurso(liga)+'.png" height="'+size+'" '+
    'style="object-fit:contain;vertical-align:middle" onerror="this.remove()">';
}
