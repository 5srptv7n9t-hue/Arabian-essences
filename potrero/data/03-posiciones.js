/* ===== STATS ===== */
const STAT_KEYS = [
  {k:"velocidad",n:"Velocidad"},{k:"fisico",n:"Físico"},{k:"tiro",n:"Tiro"},{k:"definicion",n:"Definición"},
  {k:"gambeta",n:"Gambeta"},{k:"pase",n:"Pase"},{k:"defensa",n:"Defensa"},{k:"resistencia",n:"Resistencia"},{k:"liderazgo",n:"Liderazgo"}
];

/* ===== POSICIONES Y ARQUETIPOS =====
   Cada arquetipo define:
   caps: tope máximo por stat (lo que NO figura = 99 libre)
   base: pequeño bonus inicial temático (se suma a 40 base)
   weight: qué stats definen tu media y tu rendimiento en la posición
   sim: cómo simula goles/asist la temporada ('goleador','creador','equilibrado','defensivo','arquero')
*/
const POSITIONS = {
  "Arquero": {
    arche: {
      "Arquero clásico": {caps:{gambeta:25,definicion:30,tiro:35,velocidad:60}, base:{defensa:12,liderazgo:6,fisico:8}, weight:["defensa","fisico","liderazgo","resistencia"], sim:"arquero"},
      "Arquero líbero (juega con los pies)": {caps:{gambeta:40,definicion:35,tiro:45}, base:{defensa:10,pase:10,liderazgo:5}, weight:["defensa","pase","fisico","liderazgo"], sim:"arquero"}
    }
  },
  "Defensor central": {
    arche: {
      "Marcador central (stopper)": {caps:{gambeta:30,definicion:35,tiro:45,velocidad:75}, base:{defensa:14,fisico:12,liderazgo:8}, weight:["defensa","fisico","liderazgo"], sim:"defensivo"},
      "Central con salida (líbero)": {caps:{gambeta:45,definicion:40,tiro:55}, base:{defensa:12,pase:12,liderazgo:8}, weight:["defensa","pase","fisico","liderazgo"], sim:"defensivo"}
    }
  },
  "Lateral": {
    arche: {
      "Lateral defensivo": {caps:{gambeta:55,definicion:45,tiro:55}, base:{defensa:12,resistencia:12,velocidad:8}, weight:["defensa","velocidad","resistencia","fisico"], sim:"defensivo"},
      "Lateral-volante (wing-back)": {caps:{definicion:55,tiro:60}, base:{velocidad:12,resistencia:14,pase:8,defensa:6}, weight:["velocidad","resistencia","pase","defensa"], sim:"equilibrado"}
    }
  },
  "Volante central": {
    arche: {
      "Volante central (5, recuperador)": {caps:{gambeta:60,definicion:55,velocidad:75}, base:{defensa:12,pase:12,fisico:10,liderazgo:6}, weight:["defensa","pase","fisico","resistencia"], sim:"defensivo"},
      "Box-to-box (mixto)": {caps:{}, base:{resistencia:14,pase:10,fisico:8,defensa:6}, weight:["resistencia","pase","fisico","defensa","tiro"], sim:"equilibrado"},
      "Volante de creación (regista)": {caps:{defensa:65,fisico:70}, base:{pase:16,liderazgo:8,gambeta:6}, weight:["pase","gambeta","tiro","liderazgo"], sim:"creador"}
    }
  },
  "Enganche": {
    arche: {
      "Enganche clásico (10)": {caps:{defensa:45,fisico:70}, base:{pase:14,gambeta:12,definicion:6}, weight:["pase","gambeta","definicion","tiro"], sim:"creador"},
      "Media-punta llegador": {caps:{defensa:50}, base:{definicion:12,tiro:12,gambeta:8}, weight:["definicion","tiro","gambeta","pase"], sim:"equilibrado"},
      "Enganche-organizador": {caps:{defensa:55,fisico:72}, base:{pase:16,liderazgo:8}, weight:["pase","gambeta","liderazgo","tiro"], sim:"creador"}
    }
  },
  "Extremo": {
    arche: {
      "Extremo driblador": {caps:{defensa:45}, base:{gambeta:16,velocidad:12,definicion:4}, weight:["gambeta","velocidad","definicion","pase"], sim:"equilibrado"},
      "Extremo goleador (invertido)": {caps:{defensa:45}, base:{definicion:12,tiro:12,velocidad:10}, weight:["definicion","tiro","velocidad","gambeta"], sim:"goleador"},
      "Extremo velocista": {caps:{tiro:70,defensa:50}, base:{velocidad:18,resistencia:10,gambeta:6}, weight:["velocidad","gambeta","resistencia","definicion"], sim:"equilibrado"}
    }
  },
  "Delantero": {
    arche: {
      "9 killer (área)": {caps:{gambeta:70,pase:65,defensa:40}, base:{definicion:16,tiro:10,fisico:8}, weight:["definicion","tiro","fisico","velocidad"], sim:"goleador"},
      "9 completo": {caps:{defensa:45}, base:{definicion:12,fisico:10,tiro:8,pase:4}, weight:["definicion","tiro","fisico","pase","velocidad"], sim:"goleador"},
      "Falso 9": {caps:{defensa:50}, base:{pase:12,gambeta:12,definicion:8}, weight:["pase","gambeta","definicion","tiro"], sim:"creador"},
      "Segundo punta / cazagoles": {caps:{defensa:45}, base:{definicion:14,velocidad:10,gambeta:8}, weight:["definicion","velocidad","gambeta","tiro"], sim:"goleador"}
    }
  }
};
function archeData(){ return POSITIONS[P.posGroup].arche[P.arche]; }
function statCap(k){ const c=archeData().caps; return (c && c[k]!=null)?c[k]:99; }

const TROPHIES = {
  liga:{n:"Título de Liga",ic:"🏆",grp:"Clubes"},
  copaNac:{n:"Copa Nacional",ic:"🥇",grp:"Clubes"},
  libertadores:{n:"Copa Libertadores",ic:"🌎",grp:"Clubes"},
  sudamericana:{n:"Copa Sudamericana",ic:"🥈",grp:"Clubes"},
  champions:{n:"Champions League",ic:"⚽",grp:"Clubes"},
  europaleague:{n:"Europa League",ic:"🎖️",grp:"Clubes"},
  mundialClubes:{n:"Mundial de Clubes",ic:"🌐",grp:"Clubes"},
  intercontinental:{n:"Copa Intercontinental",ic:"🏆",grp:"Clubes"},
  ascenso:{n:"Ascenso de división",ic:"⬆️",grp:"Clubes"},
  mundial:{n:"Copa del Mundo",ic:"🌍",grp:"Selección"},
  copaAmerica:{n:"Copa América",ic:"🏆",grp:"Selección"},
  eurocopa:{n:"Eurocopa",ic:"🇪🇺",grp:"Selección"},
  nations:{n:"Nations League",ic:"🎗️",grp:"Selección"},
  olimpicos:{n:"Juegos Olímpicos",ic:"🥇",grp:"Selección"},
  seleccion:{n:"Debut en la Selección",ic:"🎽",grp:"Selección"},
  balon:{n:"Balón de Oro",ic:"⭐",grp:"Individuales"},
  theBest:{n:"The Best FIFA",ic:"🌟",grp:"Individuales"},
  botaOro:{n:"Bota de Oro",ic:"👟",grp:"Individuales"},
  pichichi:{n:"Máximo Goleador de Liga",ic:"🎯",grp:"Individuales"},
  mvpLiga:{n:"MVP de la Liga",ic:"🏅",grp:"Individuales"},
  puskas:{n:"Premio Puskás",ic:"✨",grp:"Individuales"},
  goldenBoy:{n:"Golden Boy",ic:"👦",grp:"Individuales"},
  yashin:{n:"Trofeo Yashin",ic:"🧤",grp:"Individuales"},
  guante:{n:"Guante de Oro",ic:"🧤",grp:"Individuales"},
  mvpFinal:{n:"MVP de una Final",ic:"🎇",grp:"Individuales"}
};

