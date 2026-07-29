/* ===== ECONOMÍA: nivel de club, sueldos, roles ===== */
// tier del club: define presupuesto y sueldo base (en millones/temporada, ajustado por media)
const CLUB_TIER = {}; // se llena abajo
const TIER1=["Real Madrid","Barcelona","Manchester City","Bayern","PSG","Liverpool","Inter","Arsenal","Al-Hilal","Al-Nassr","Man United","Chelsea","Juventus","Milan","Atlético"];
const TIER2=["Tottenham","Newcastle","Napoli","Dortmund","Roma","Sevilla","Aston Villa","Leipzig","Benfica","Porto","Flamengo","Palmeiras","River Plate","Boca Juniors","Ajax","Marsella","Al-Ittihad","Al-Ahli","Tigres","Monterrey","Inter Miami"];
function clubTier(club){
  if(TIER1.includes(club))return 1;
  if(TIER2.includes(club))return 2;
  // por liga: primeras divisiones tier 3, segundas tier 4, etc.
  for(const lg in LEAGUES){
    if(LEAGUES[lg].includes(club)){
      if(lg.includes("(4ª)"))return 6;
      if(lg.includes("(3ª)"))return 5;
      if(lg.includes("(2ª)"))return 4;
      return 3;
    }
  }
  return 3;
}
// roles de contrato con su efecto
const CONTRACT_ROLES = [
  {id:"estrella", label:"Estrella del proyecto", desc:"Armaron el equipo alrededor tuyo. Presión máxima, sueldo top.", payMult:1.6, minOvr:80},
  {id:"titular", label:"Titular indiscutido", desc:"Vas a jugar siempre. Sos pieza clave.", payMult:1.2, minOvr:72},
  {id:"rotacion", label:"Titular con competencia", desc:"Vas a pelear el puesto, pero tenés lugar.", payMult:1.0, minOvr:64},
  {id:"suplente", label:"Suplente con minutos garantizados", desc:"Entrás desde el banco, sumás minutos para crecer.", payMult:0.75, minOvr:0},
  {id:"promesa", label:"Promesa para el futuro", desc:"Te fichan pensando en unos años. Paciencia.", payMult:0.6, minOvr:0}
];
/* ===================== EVENTOS =====================
   Dos formatos de opción:
   A) FIJO:      {t,hint,eff:{...,res}}                     -> resultado siempre igual
   B) VARIABLE:  {t,hint,skill:[...],risk:0..1,win:{...,res},lose:{...,res}}
      -> se tira dado: éxito usa win, fracaso usa lose. skill sube la chance, risk la baja.
   Ramas/efectos: goals,assists,apps,fama,honor,sp,injuryRisk. res = texto.
*/
