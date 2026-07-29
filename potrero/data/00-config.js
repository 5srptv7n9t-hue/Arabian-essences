/* ===================== CONFIG DE BALANCE =====================
   Todos los numeros que definen el balance del juego, en un solo lugar.
   Tocá estos valores para ajustar la dificultad/economia SIN meterte en el
   motor. Cada bloque dice a que afecta. Los valores actuales son los del
   prototipo original (no cambian el balance).
*/
const CONFIG = {

  /* Creacion del jugador: base de cada stat y puntos a repartir al inicio. */
  crear: { baseStat: 40, pool: 45 },

  /* Talento oculto: probabilidad de cada categoria (acumulada) y su techo.
     r<generacional => generacional; si no r<crack => crack; etc.
     mult = velocidad de crecimiento; ceil = media maxima que puede alcanzar. */
  talento: {
    umbrales: { generacional: 0.20, crack: 0.50, bueno: 0.85 },
    tiers: {
      generacional: { tier: "generacional", mult: 1.9,  ceil: 99, label: "generacional" },
      crack:        { tier: "crack",        mult: 1.35, ceil: 93, label: "crack" },
      bueno:        { tier: "bueno",        mult: 1.0,  ceil: 86, label: "bueno" },
      mortal:       { tier: "mortal",       mult: 0.75, ceil: 80, label: "limitado" }
    }
  },

  /* Que puede pasar en cada turno (probabilidades). o = tu media (OVR). */
  turno: {
    gkSaveProb: 0.30,                       // arquero: atajada decisiva
    injuryProb: 0.05,                       // lesion por mala suerte
    jeque: { minOvr: 72, minFama: 14, prob: 0.11 },
    prensaProb: 0.18,                       // rueda de prensa
    mediaProb: 0.34,                        // vida mediatica
    final: { minOvr: 64, prob: 0.34 },      // finales de club
    transfer: { minOvr: 68, prob: 0.45 },   // ofertas de transferencia
    seleccionProb: 0.55                     // torneo de seleccion (si estas citado)
  },

  /* Progresion automatica por temporada (crecimiento por talento y edad). */
  progresion: {
    // factor de crecimiento segun edad (pico joven, declive de veterano)
    ageFactor: { hasta20: 1.4, hasta25: 1.0, hasta29: 0.5, hasta32: 0.15, declive: -0.2 },
    // empujon extra para los mas talentosos
    eliteBoost: { generacional: 1.35, crack: 1.15, otros: 1.0 },
    growthBase: 5.5, growthRand: 2.5,       // puntos base por temporada (+ azar)
    missedMult: 0.4,                        // si te perdiste la temporada por lesion
    keyStatBias: 0.7,                       // 70% de la mejora va a stats de tu puesto
    declineFloor: 35,                       // los stats fisicos no bajan de aca
    declineStats: ['velocidad', 'resistencia', 'fisico']
  },

  /* Cierre de temporada. */
  temporada: {
    turnosPorTemporada: 3,                  // cada 3 turnos se cierra una temporada
    apps: { base: 20, rand: 14 },           // partidos jugados por temporada
    sp: { perfDiv: 6, missed: 1, ovrDiv: 22, goalMult: 2 }, // skill points ganados
    retiro: { minAge: 34, prob: 0.5 },      // ofrecerte retirarte
    seleccionDebut: { minOvr: 74, minHonor: -45 },
    idol: { porTituloClub: 8, permanencia: 2 } // idolatria del club
  },

  /* Simulacion de goles/asistencias por temporada, segun tu tipo de juego. */
  simRendimiento: {
    goles: {
      defensivo:  { div: 60, rand: 2 },
      creador:    { div: 26, rand: 4 },
      goleador:   { tiroMult: 1.3, div: 12, rand: 7 },
      equilibrado:{ div: 20, rand: 5 }
    },
    asist: {
      creador:    { div: 12, rand: 6 },
      goleador:   { div: 28, rand: 2 },
      equilibrado:{ div: 18, rand: 4 }
    }
  },

  /* Sueldos (millones/temporada) y roles de contrato. */
  sueldo: {
    baseByTier: { 1: 14, 2: 8, 3: 4, 4: 1.6, 5: 0.6, 6: 0.2 }, baseDefault: 2,
    // multiplicador por media: media ref=40 => 0.5x ; sube ~+1x cada 40 de media
    ovrMult: { min: 0.4, ref: 40, div: 40, add: 0.5 },
    rolClubGrandeOvr: 78,                   // en clubes tier1/2, media minima para roles top
    rolTierBajoSlack: 10                    // clubes chicos aflojan la media pedida
  },

  /* Transferencias y ofertas de jeque. */
  transfer: { feeOvrMult: 1.4, feeRand: 40 },
  jeque:    { salaryMult: 2.5, feeOvrMult: 2 },

  /* Umbrales de premios individuales (media, fama, goles, probabilidad). */
  premios: {
    liga:        { ovr: 72, prob: 0.35 },
    pichichiGoles: 18,
    botaGoles: 25,
    mvpLiga:     { ovr: 82, fama: 18, prob: 0.3 },
    yashin:      { ovr: 80, prob: 0.4, guanteProb: 0.5 },
    goldenBoy:   { edad: 21, ovr: 76, fama: 12 },
    puskas:      { goles: 12, prob: 0.12 },
    balon:       { ovr: 87, fama: 26, prob: 0.28 },
    theBest:     { ovr: 86, fama: 24, prob: 0.24 },
    mundialClubes:{ ovr: 85, prob: 0.10 }
  },

  /* Lesiones. */
  lesiones: {
    randomLongProb: 0.35,        // si te lesionas de casualidad, chance de que sea grave
    aceptarLargaProbDoble: 0.4,  // lesion grave: 40% => 2 temporadas, si no 1
    rehabRecaidaProb: 0.4        // apurar la rehabilitacion: chance de recaer
  }
};
