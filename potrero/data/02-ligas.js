/* ===== LIGAS (muestra ampliada con clubes REALES, incl. divisiones de Argentina) ===== */
const LEAGUES = {
  // ===== ARGENTINA (1ª a 4ª, en orden) =====
  "Argentina — Primera División": ["River Plate","Boca Juniors","Racing","Independiente","San Lorenzo","Estudiantes","Vélez","Talleres","Huracán","Lanús","Defensa y Justicia","Newell's"],
  "Argentina — Primera Nacional (2ª)": ["San Martín SJ","Chacarita","Ferro","Almirante Brown","Colón","Gimnasia Mendoza","Estudiantes RC","Chaco For Ever","Deportivo Morón","Nueva Chicago"],
  "Argentina — Primera B Metro (3ª)": ["Acassuso","Colegiales","San Miguel","Argentino de Quilmes","Talleres RE","Almagro","Los Andes","Fénix","Comunicaciones"],
  "Argentina — Primera C (4ª)": ["Real Pilar","Puerto Nuevo","Central Ballester","Lugano","Sportivo Barracas","Yupanqui","Deportivo Español","Cañuelas"],
  // ===== INGLATERRA =====
  "Inglaterra — Premier League": ["Manchester City","Arsenal","Liverpool","Man United","Chelsea","Tottenham","Newcastle","Aston Villa","Brighton","West Ham"],
  "Inglaterra — Championship (2ª)": ["Leeds","Leicester","Southampton","Norwich","Middlesbrough","West Brom","Sunderland","Sheffield Utd"],
  // ===== ESPAÑA =====
  "España — LaLiga": ["Real Madrid","Barcelona","Atlético","Sevilla","Real Sociedad","Villarreal","Betis","Athletic","Valencia","Girona"],
  "España — LaLiga 2 (2ª)": ["Levante","Espanyol","Sporting Gijón","Racing Santander","Zaragoza","Eibar","Oviedo","Tenerife"],
  // ===== ITALIA =====
  "Italia — Serie A": ["Inter","Milan","Juventus","Napoli","Roma","Lazio","Atalanta","Fiorentina","Bologna","Torino"],
  "Italia — Serie B (2ª)": ["Sampdoria","Palermo","Parma","Bari","Cremonese","Como","Venezia","Spezia"],
  // ===== ALEMANIA =====
  "Alemania — Bundesliga": ["Bayern","Dortmund","Leipzig","Leverkusen","Frankfurt","Wolfsburg","Stuttgart","Union Berlin","Freiburg","Hoffenheim"],
  "Alemania — 2. Bundesliga (2ª)": ["Hamburgo","Schalke 04","Hertha","Düsseldorf","Nürnberg","Kaiserslautern","St. Pauli","Hannover"],
  // ===== FRANCIA =====
  "Francia — Ligue 1": ["PSG","Marsella","Mónaco","Lyon","Lille","Niza","Rennes","Lens","Nantes","Estrasburgo"],
  // ===== BRASIL =====
  "Brasil — Brasileirão": ["Flamengo","Palmeiras","Fluminense","Corinthians","São Paulo","Grêmio","Internacional","Atlético-MG","Botafogo","Vasco"],
  // ===== OTRAS =====
  "Países Bajos — Eredivisie": ["Ajax","PSV","Feyenoord","AZ Alkmaar","Twente","Utrecht","Vitesse"],
  "Portugal — Primeira Liga": ["Benfica","Porto","Sporting","Braga","Vitória SC","Boavista"],
  "EE.UU. — MLS": ["Inter Miami","LA Galaxy","LAFC","Atlanta United","Seattle","NY Red Bulls","Cincinnati","Austin FC"],
  "México — Liga MX": ["América","Chivas","Cruz Azul","Monterrey","Tigres","Pumas","Toluca","Santos"],
  "Arabia — Saudi Pro League": ["Al-Hilal","Al-Nassr","Al-Ittihad","Al-Ahli","Al-Ettifaq"]
};
/* clubes "grandes" para ofertas de transferencia y rivales de final */
const BIG_CLUBS = ["Real Madrid","Barcelona","Manchester City","Bayern","PSG","Liverpool","Inter","Arsenal","Al-Hilal"];
const SUDAMERICAN_LEAGUES = ["Argentina — Primera División","Argentina — Primera Nacional (2ª)","Argentina — Primera B Metro (3ª)","Argentina — Primera C (4ª)","Brasil — Brasileirão"];
function isSudamerican(){ return SUDAMERICAN_LEAGUES.includes(P.league); }

