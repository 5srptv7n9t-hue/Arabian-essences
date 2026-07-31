/* ===== COMPETENCIAS POR PAÍS (título de liga + copa nacional) =====
   Para que el palmarés muestre el nombre real del torneo según tu club/país
   (Ligue 1, Serie A, Copa Argentina, Coupe de France, FA Cup, etc.), como la
   app de referencia, en vez de un genérico "Título de Liga / Copa Nacional". */

/* liga del juego -> nombre del título de esa liga */
const LEAGUE_TITLE = {
  "Argentina — Primera División":"Liga Profesional",
  "Argentina — Primera Nacional (2ª)":"Primera Nacional",
  "Argentina — Primera B Metro (3ª)":"Primera B Metropolitana",
  "Argentina — Primera C (4ª)":"Primera C",
  "Inglaterra — Premier League":"Premier League",
  "Inglaterra — Championship (2ª)":"Championship",
  "España — LaLiga":"LaLiga",
  "España — LaLiga 2 (2ª)":"LaLiga 2",
  "Italia — Serie A":"Serie A",
  "Italia — Serie B (2ª)":"Serie B",
  "Alemania — Bundesliga":"Bundesliga",
  "Alemania — 2. Bundesliga (2ª)":"2. Bundesliga",
  "Francia — Ligue 1":"Ligue 1",
  "Brasil — Brasileirão":"Brasileirão",
  "Países Bajos — Eredivisie":"Eredivisie",
  "Portugal — Primeira Liga":"Primeira Liga",
  "EE.UU. — MLS":"MLS",
  "México — Liga MX":"Liga MX",
  "Arabia — Saudi Pro League":"Saudi Pro League"
};

/* país -> copa nacional */
const COUNTRY_CUP = {
  "Argentina":"Copa Argentina","Inglaterra":"FA Cup","España":"Copa del Rey",
  "Italia":"Coppa Italia","Alemania":"DFB-Pokal","Francia":"Coupe de France",
  "Brasil":"Copa do Brasil","Países Bajos":"KNVB Beker","Portugal":"Taça de Portugal",
  "EE.UU.":"US Open Cup","México":"Copa MX","Arabia":"Copa del Rey de Campeones"
};

function countryOf(league){ return (league||"").split("—")[0].trim(); }
function leagueTitleName(league){ return LEAGUE_TITLE[league] || "Título de Liga"; }
function nationalCupName(league){ return COUNTRY_CUP[countryOf(league)] || "Copa Nacional"; }
