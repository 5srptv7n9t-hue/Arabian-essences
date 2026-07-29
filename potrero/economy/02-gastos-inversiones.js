/* ===================== ECONOMÍA: GASTOS, INVERSIONES, JEQUES ===================== */
/* UPGRADES: cosas en las que gastás el sueldo. Efecto permanente por temporada. */
const UPGRADES = {
  prepFisico:  {n:"Preparador físico personal", ic:"🏋️", cost:1.5, desc:"Reduce riesgo de lesión y mejora resistencia con el tiempo.", eff:{lessInjury:0.5, statBias:"resistencia"}},
  psicologo:   {n:"Psicólogo deportivo", ic:"🧠", cost:1.0, desc:"Mejor manejo de la presión: más SP por temporada.", eff:{spBonus:1}},
  kinesiologo: {n:"Kinesiólogo", ic:"🩹", cost:1.2, desc:"Recuperás más rápido de las lesiones.", eff:{fasterHeal:true}},
  chef:        {n:"Chef profesional", ic:"🍽️", cost:0.8, desc:"Mejor alimentación: físico y resistencia suben más.", eff:{statBias:"fisico"}},
  sponsorBotines:{n:"Sponsor de botines pro", ic:"👟", cost:0, income:1.5, desc:"Te PAGAN por usarlos. +ingreso y algo de fama.", eff:{fama:1}},
};
/* INVERSIONES: metés plata, puede rendir o salir mal (50/50 real) */
const INVESTMENTS = [
  {id:"inmueble", n:"Inmuebles", ic:"🏠", risk:0.25, minMult:0.9, maxMult:1.6, desc:"Ladrillo. Seguro pero lento."},
  {id:"cripto", n:"Cripto", ic:"📈", risk:0.55, minMult:0.2, maxMult:3.5, desc:"Puede multiplicar o fundirte."},
  {id:"negocio", n:"Negocio propio (bar/marca)", ic:"🍺", risk:0.45, minMult:0.4, maxMult:2.4, desc:"Tu propia marca. Riesgo medio."},
  {id:"acciones", n:"Acciones/fondos", ic:"💹", risk:0.35, minMult:0.7, maxMult:1.9, desc:"Mercado. Riesgo moderado."}
];
/* VICIOS: gastás en joda/lujos/apuestas: placer corto, riesgo de imagen y plata */
const VICES = [
  {id:"fiestas", n:"Fiestas y lujos", ic:"🎉", cost:2.0, desc:"Autos, relojes, joda. Fama sí, imagen frágil.", roll:[
    {p:60,eff:{fama:4,honor:-3},res:"Te mostraste como una estrella. Fama arriba, pero te empieza a pesar la imagen de agrandado."},
    {p:40,eff:{fama:3,honor:-8},res:"Salió una foto en un boliche a las 6 AM antes de un partido. Escándalo."}
  ]},
  {id:"apuestas", n:"Apuestas", ic:"🎰", cost:1.5, desc:"Plata fácil... o no. Muy peligroso para tu imagen.", roll:[
    {p:35,eff:{money:3,fama:1},res:"Pegaste una apuesta grande y ganaste. Esta vez zafaste."},
    {p:35,eff:{money:-2},res:"Perdiste la plata apostada. Bronca."},
    {p:30,eff:{money:-1,honor:-12,fama:2},res:"Se filtró que apostás y estalló el escándalo. La AFA investiga. Imagen por el piso."}
  ]}
];

function applyUpgradeEffects(){
  // llamado en cada cierre de temporada
  let spBonus=0, lessInjury=0, statBias=null, fasterHeal=false;
  for(const k in P.upgrades){
    if(!P.upgrades[k])continue;
    const u=UPGRADES[k];
    if(u.eff.spBonus)spBonus+=u.eff.spBonus;
    if(u.eff.lessInjury)lessInjury+=u.eff.lessInjury;
    if(u.eff.statBias)statBias=u.eff.statBias;
    if(u.eff.fasterHeal)fasterHeal=true;
  }
  return {spBonus,lessInjury,statBias,fasterHeal};
}
function upgradeIncome(){
  let inc=0;
  for(const k in P.upgrades){ if(P.upgrades[k]&&UPGRADES[k].income) inc+=UPGRADES[k].income; }
  return inc;
}
/* ===================== VIDA MEDIÁTICA / FUERA DE LA CANCHA =====================
   Nuevo efecto: 'star' (barra de estrella mediática 0-100).
   Estos eventos construyen el personaje fuera de la cancha.
*/
const MEDIA_EVENTS = [
  {id:"salidaNoche", type:"",
   text:()=>'Después de una semana dura, unos amigos te invitan a salir a la noche. Hay paparazzi dando vueltas por la zona.',
   choices:[
    {t:"Salir con perfil alto, dejarte ver.",hint:"Fama/exposición · 🎲",roll:[
      {p:50,eff:{star:8,fama:4,honor:-1},res:"Saliste como una estrella, buena onda con todos. Salís en las revistas del corazón, imagen de crack mundial."},
      {p:30,eff:{star:5,fama:3,honor:-2},res:"Buena noche, algunas fotos. Nada grave, sumás presencia mediática."},
      {p:20,eff:{star:6,fama:2,honor:-8},res:"Se filtró una foto tuya a las 5 AM y hay partido en dos días. El DT no está contento."}
    ]},
    {t:"Salir tranqui, perfil bajo.",hint:"Cuidás imagen",roll:[
      {p:70,eff:{honor:2,star:1},res:"Una salida chill, sin cámaras. Descansaste la cabeza y nadie tiene nada que decir."},
      {p:30,eff:{honor:1},res:"Noche tranquila. Volviste temprano, enfocado."}
    ]},
    {t:"Quedarte en casa a descansar.",hint:"Profesional",roll:[
      {p:100,eff:{honor:3,sp:1},res:"Preferiste descansar. Al otro día entrenaste como nunca."}
    ]}]},

  {id:"yate", type:"", minStar:15,
   text:()=>'Tenés la plata y las ganas de organizar una fiesta en un yate para tu cumpleaños. Puede ser un fiestón que dé que hablar.',
   choices:[
    {t:"Organizar el fiestón por todo lo alto.",hint:"Cuesta 2M€ · 🎲",cost:2,roll:[
      {p:45,eff:{star:14,fama:6,honor:-2},res:"Yate, DJ, invitados famosos. Las fotos vuelan por todos lados: quedás como una estrella global del deporte."},
      {p:30,eff:{star:9,fama:4,honor:-1},res:"Fiesta exitosa, buena repercusión. Tu marca personal sube fuerte."},
      {p:25,eff:{star:8,fama:5,honor:-10},res:"Se filtró que la fiesta fue en plena pretemporada. La prensa te cae con todo por poco profesional."}
    ]},
    {t:"Algo más íntimo, solo con amigos.",hint:"Cuesta 0.5M€",cost:0.5,roll:[
      {p:100,eff:{star:3,honor:2},res:"Un festejo tranquilo con tu gente de confianza. Cero escándalo, recargaste energía."}
    ]},
    {t:"Ni fiesta, sigo enfocado.",hint:"Foco total",roll:[
      {p:100,eff:{honor:2,sp:1},res:"Nada de joda. Todo al fútbol. Los puristas te aman."}
    ]}]},

  {id:"revista", type:"", minStar:10,
   text:()=>'Una revista importante te ofrece una nota de tapa sobre tu vida como nueva figura del fútbol.',
   choices:[
    {t:"Hacer la nota y mostrarte.",hint:"Estrella · 🎲",roll:[
      {p:65,eff:{star:10,fama:5,honor:0},res:"Tapa espectacular. Te consolidás como ícono dentro y fuera de la cancha."},
      {p:35,eff:{star:7,fama:4,honor:-3},res:"Salió bien la nota, aunque algunos dicen que te farandulizás demasiado."}
    ]},
    {t:"Rechazar, no es tu estilo.",hint:"Perfil bajo",roll:[
      {p:100,eff:{honor:3,star:-1},res:"Preferiste el perfil bajo. Sos de los que hablan en la cancha."}
    ]}]},

  {id:"conocerPareja", once:true, type:"", minAge:19,
   req:()=>!P.partner,
   text:()=>'Conocés a alguien que te mueve el piso de verdad. Podría ser algo serio.',
   choices:[
    {t:"Empezar una relación y llevarla tranquila.",hint:"Estabilidad",roll:[
      {p:100,eff:{honor:4,sp:1,setPartner:"reservada"},res:"Arrancaste una relación que te da equilibrio. Fuera de las cámaras, te hace bien."}
    ]},
    {t:"Empezar y mostrarla en las redes.",hint:"Pareja mediática · 🎲",roll:[
      {p:60,eff:{star:8,fama:4,setPartner:"mediatica"},res:"La blanqueaste en redes y explotó. Son la pareja del momento."},
      {p:40,eff:{star:6,fama:3,honor:-3,setPartner:"mediatica"},res:"Se volvió muy mediático muy rápido, con presión y rumores encima."}
    ]},
    {t:"No es momento, estoy enfocado.",hint:"Soltero/foco",roll:[
      {p:100,eff:{honor:1,sp:1},res:"Preferiste no complicarte. Todo al fútbol por ahora."}
    ]}]},

  {id:"parejaCrisis", type:"", req:()=>!!P.partner,
   text:()=>'La prensa inventa un rumor sobre una supuesta crisis con tu pareja.',
   choices:[
    {t:"Salir a bancarla públicamente.",hint:"Fiel · 🎲",roll:[
      {p:75,eff:{honor:6,star:3},res:"Saliste a defender tu relación con clase. La gente lo valora."},
      {p:25,eff:{honor:2,star:2},res:"Aclaraste el tema, aunque el rumor ya había hecho ruido."}
    ]},
    {t:"No hablar del tema, es privado.",hint:"Reservado",roll:[
      {p:100,eff:{honor:2,star:-1},res:"Mantuviste tu vida privada donde corresponde. Respeto."}
    ]},
    {t:"Usar el quilombo para más prensa.",hint:"Mediático",roll:[
      {p:45,eff:{star:6,fama:4,honor:-5},res:"Le metiste show al asunto. Fama arriba, pero muchos te ven careta."},
      {p:55,eff:{star:4,fama:2,honor:-9},res:"Se te fue de las manos, quedaste como que buscás cámara. Feo."}
    ]}]},

  {id:"farandula", type:"", minStar:25,
   text:()=>'Un programa de espectáculos te quiere como invitado estrella, lejos del fútbol.',
   choices:[
    {t:"Ir y bancar el personaje mediático.",hint:"Estrella pop · 🎲",roll:[
      {p:55,eff:{star:12,fama:6,honor:-3},res:"La rompiste en la tele, carismático total. Trascendés el fútbol."},
      {p:45,eff:{star:8,fama:4,honor:-8},res:"Te farandulizaste de más. Los hinchas puristas empiezan a dudar de tu foco."}
    ]},
    {t:"Rechazar, sos futbolista no figura de TV.",hint:"Foco",roll:[
      {p:100,eff:{honor:4,star:-2,sp:1},res:"Dijiste que no. Tu lugar es la cancha, y se nota."}
    ]}]}
];

/* ===================== DRAMAS DE PAREJA (tipo oculto) =====================
   El tipo (buena/botinera/interesada) se revela con estos eventos. */
const PARTNER_EVENTS = [
  // BOTINERA: usa tu fama, va por lo mediático, se cuelga de tu éxito
  {id:"botineraFama", req:()=>P.partnerType==='botinera', type:"bad",
   text:()=>'Descubrís que tu pareja está usando tu nombre para meterse en eventos y sacar contratos de publicidad sin decirte.',
   choices:[
    {t:"Encararla y poner límites.",hint:"🎲",roll:[
      {p:55,eff:{honor:3,star:-2},res:"Hablaste claro. Recalculó, al menos por ahora. Te sacaste un peso."},
      {p:45,eff:{honor:-2,star:2,fama:2},res:"Se armó escándalo mediático. Ella lo aprovechó más que vos."}
    ]},
    {t:"Dejarlo pasar, total suma fama.",hint:"Mediático",roll:[
      {p:100,eff:{star:5,fama:3,honor:-4},res:"Dejaste que use tu nombre. Más prensa, pero muchos te ven usado."}
    ]},
    {t:"Cortar la relación.",hint:"Fin",roll:[
      {p:100,eff:{honor:4,star:-3,endPartner:true},res:"Cortaste. Te sacaste una botinera de encima. Foco recuperado."}
    ]}]},

  {id:"botineraFamilia", req:()=>P.partnerType==='botinera', type:"bad",
   text:()=>'Tu pareja se lleva mal con tu familia: tu vieja te avisa que la nota interesada y que se mete en todo.',
   choices:[
    {t:"Bancar a tu familia.",hint:"Sangre",roll:[
      {p:100,eff:{honor:5,endPartner:true},res:"Elegiste a tu familia. La relación se terminó, pero recuperaste la paz."}
    ]},
    {t:"Bancar a tu pareja.",hint:"Riesgo",roll:[
      {p:40,eff:{honor:-2},res:"Le creíste a ella. El tiempo dirá si te equivocaste."},
      {p:60,eff:{honor:-6,money:-2},res:"Te distanciaste de tu familia y ella te terminó costando plata. Mal negocio."}
    ]}]},

  // INTERESADA: va por la plata, gastos, te vacía
  {id:"interesadaGastos", req:()=>P.partnerType==='interesada', type:"bad",
   text:()=>'Tu pareja te pide constantemente lujos caros: carteras, viajes, un auto nuevo.',
   choices:[
    {t:"Darle todo lo que pide.",hint:"Caro · 🎲",cost:3,roll:[
      {p:100,eff:{honor:-2,star:2},res:"Le cumpliste todos los caprichos. Te costó 3M€ y algo de dignidad."}
    ]},
    {t:"Ponerle un freno a los gastos.",hint:"Cabeza",roll:[
      {p:50,eff:{honor:2},res:"Le pusiste límites y lo entendió... por ahora."},
      {p:50,eff:{honor:1,endPartner:true},res:"Se enojó y te dejó al ver que cerrabas la billetera. Se cayó la careta."}
    ]}]},

  {id:"interesadaReveal", req:()=>P.partnerType==='interesada', type:"bad",
   text:()=>'Un amigo te muestra pruebas de que tu pareja habló de que está con vos solo por la plata y la fama.',
   choices:[
    {t:"Confrontarla con las pruebas.",hint:"🎲",roll:[
      {p:70,eff:{honor:4,endPartner:true},res:"La encaraste y no pudo negarlo. Se terminó. Doloroso pero necesario."},
      {p:30,eff:{honor:-3},res:"Lo negó todo y te comió la cabeza. Seguís dudando."}
    ]},
    {t:"Hacer como que no viste nada.",hint:"Negación",roll:[
      {p:100,eff:{honor:-5,money:-1},res:"Preferiste no ver. Te va a seguir costando caro."}
    ]}]},

  // BUENA: te banca, te da equilibrio, buena con la familia
  {id:"buenaApoyo", req:()=>P.partnerType==='buena', type:"good",
   text:()=>'Venís de un mal momento futbolístico y tu pareja te banca incondicionalmente, se lleva de diez con tu familia.',
   choices:[
    {t:"Apoyarte en ella y enfocarte.",hint:"Equilibrio",roll:[
      {p:100,eff:{honor:5,sp:2},res:"Su apoyo te devolvió la confianza. Volviste enfocado y entero. Sacaste un crack a tu lado."}
    ]},
    {t:"Sorprenderla con un gesto.",hint:"Detalle",cost:0.5,roll:[
      {p:100,eff:{honor:6,star:2},res:"Le devolviste el apoyo con un gesto lindo. Son una pareja sólida y querida."}
    ]}]},

  {id:"buenaFamilia", req:()=>P.partnerType==='buena', type:"good",
   text:()=>'Tu pareja organizó una sorpresa juntando a toda tu familia para tu cumpleaños.',
   choices:[
    {t:"Disfrutar el momento con los tuyos.",hint:"Familia",roll:[
      {p:100,eff:{honor:6,sp:1},res:"Un día hermoso rodeado de los que te quieren de verdad. Eso no se compra."}
    ]}]}
];
/* ===================== EVENTOS EXCLUSIVOS DE ARQUERO =====================
   Situaciones ligadas a la participación del arquero: achicar, cortar,
   salir con los pies, errores, penales, distribución. */
const KEEPER_EVENTS = [
  {id:"gkDebut", once:true, maxAge:26, type:"good",
   text:()=>'El técnico del '+P.club+' te confirma: hoy atajás por primera vez como titular. El arco es todo tuyo.',
   choices:[
    {t:"Jugar seguro, achicar y cortar todo.",hint:"Sobrio · 🎲",roll:[
      {p:60,eff:{apps:1,honor:3,fama:2,sp:1,idol:3},res:"Atajada sobria, valla invicta en tu debut. El DT respira tranquilo."},
      {p:40,eff:{apps:1,honor:1,sp:1,idol:1},res:"Cumpliste sin sobresaltos. Buen estreno bajo los tres palos."}
    ]},
    {t:"Arriesgar jugando con los pies como líbero.",hint:"Riesgo · 🎲",roll:[
      {p:45,eff:{apps:1,fama:3,honor:2,sp:2,idol:4},res:"Saliste jugando de arquero moderno, iniciaste jugadas de gol. Impresionaste."},
      {p:55,eff:{apps:1,fama:-1,honor:-3,idol:-2},res:"Quisiste jugar bonito, te robaron la pelota y casi te hacen un gol. Susto."}
    ]}]},

  {id:"gkPenalAtajado", type:"", 
   text:()=>'Penal en contra en un momento clave. Todos en el estadio te miran a vos.',
   choices:[
    {t:"Estudiar al pateador y jugártela.",hint:"🎲 + tu nivel",roll:[
      {p:50,eff:{apps:1,honor:8,fama:6,sp:3,idol:8},res:"🧤 ¡PENAL ATAJADO! Volaste a tu palo y la sacaste. Sos ídolo instantáneo."},
      {p:50,eff:{apps:1,honor:-2,fama:1,idol:-1},res:"Adivinaste el palo pero le pegó muy bien. Gol. Estas cosas pasan."}
    ]}]},

  {id:"gkError", type:"bad",
   text:()=>'Te llega un centro sencillo pero venís con la cabeza caliente. Podés arriesgar a salir o quedarte en el arco.',
   choices:[
    {t:"Salir a cortar el centro.",hint:"🎲",roll:[
      {p:55,eff:{apps:1,honor:4,fama:2,sp:1,idol:3},res:"Saliste con autoridad y despejaste con los puños. Mandaste vos en el área."},
      {p:45,eff:{apps:1,honor:-6,fama:1,idol:-4},res:"Saliste mal, la pelota picó rara y te la clavaron. Blooper que da la vuelta al mundo."}
    ]},
    {t:"Quedarte en la línea, seguro.",hint:"Prudente",roll:[
      {p:70,eff:{apps:1,honor:2,idol:1},res:"Te quedaste bien parado y controlaste sin riesgo. Decisión madura."},
      {p:30,eff:{apps:1,honor:0,idol:0},res:"No saliste y quedó una duda, pero no pasó nada. Bien."}
    ]}]},

  {id:"gkDistribucion", type:"",
   text:()=>'El equipo necesita que manejes los tiempos desde el arco: apurar para contragolpear o pausar para tener la pelota.',
   choices:[
    {t:"Lanzar rápido y largo para el contragolpe.",hint:"🎲",roll:[
      {p:50,eff:{apps:1,assists:1,fama:3,honor:2,sp:2,idol:3},res:"Tu lanzamiento largo terminó en gol. ¡Asistencia del arquero! Golazo de contra."},
      {p:50,eff:{apps:1,honor:1,sp:1},res:"Buscaste el pelotazo pero no prosperó. Igual, buena intención."}
    ]},
    {t:"Pausar y construir desde atrás.",hint:"Control",roll:[
      {p:100,eff:{apps:1,honor:3,sp:1,idol:2},res:"Manejaste los tiempos como un líder. El equipo se acomodó gracias a vos."}]}]},

  {id:"gkVallaInvicta", type:"good",
   text:()=>'Llevás varios partidos sin que te conviertan. La prensa habla de tu racha de vallas invictas.',
   choices:[
    {t:"Mantener el perfil y seguir concentrado.",hint:"Foco",roll:[
      {p:100,eff:{apps:1,honor:4,fama:3,sp:2,idol:4},res:"Otra valla invicta. Tu nombre suena para premios al mejor arquero."}]},
    {t:"Declarar que vas por el récord.",hint:"🎲",roll:[
      {p:45,eff:{apps:1,fama:5,honor:1,idol:3},res:"Te la jugaste con la declaración y la bancaste con otra valla invicta. Crack."},
      {p:55,eff:{apps:1,fama:3,honor:-4,idol:-2},res:"Hablaste de más y al partido siguiente te hicieron dos. Karma."}
    ]}]},

  {id:"gkFigura", type:"good", minAge:23,
   text:()=>'El equipo jugó horrible pero vos tapaste todo. Te dan la figura del partido pese a la derrota.',
   choices:[
    {t:"Bancar a tus compañeros en la nota.",hint:"Líder",roll:[
      {p:100,eff:{honor:6,fama:3,sp:1,idol:5},res:"Elogiaste al equipo pese a todo. Un capitán de verdad, aunque no lleves la cinta."}]},
    {t:"Marcar que los cubriste vos.",hint:"🎲",roll:[
      {p:40,eff:{fama:4,honor:0,idol:1},res:"Fuiste sincero y la gente lo valoró: sin vos, era goleada."},
      {p:60,eff:{fama:3,honor:-5,idol:-3},res:"Sonó a que tirás a tus compañeros abajo. El vestuario te lo marca."}
    ]}]}
];
