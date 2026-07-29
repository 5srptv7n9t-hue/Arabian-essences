/* ===================== DATOS ===================== */
const NATIONS = ["Argentina","Brasil","Uruguay","Colombia","España","Francia","Inglaterra","Portugal","Italia","Alemania","Países Bajos","México","Chile","Croacia","Nigeria","Japón","Marruecos","Senegal","Estados Unidos","Bélgica"];

/* Bandera (emoji) por país. Cero problema de licencia. */
const NATION_FLAGS = {
  "Argentina":"🇦🇷","Brasil":"🇧🇷","Uruguay":"🇺🇾","Colombia":"🇨🇴","España":"🇪🇸",
  "Francia":"🇫🇷","Inglaterra":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Portugal":"🇵🇹","Italia":"🇮🇹","Alemania":"🇩🇪",
  "Países Bajos":"🇳🇱","México":"🇲🇽","Chile":"🇨🇱","Croacia":"🇭🇷","Nigeria":"🇳🇬",
  "Japón":"🇯🇵","Marruecos":"🇲🇦","Senegal":"🇸🇳","Estados Unidos":"🇺🇸","Bélgica":"🇧🇪"
};
function flagFor(nat){ return NATION_FLAGS[nat] || "🏳️"; }

