const EVENTS = [
  {id:"debut", once:true, maxAge:26, type:"good",
   text:()=>'El técnico del '+P.club+' te lo dice de frente: hoy sos titular por primera vez. Todo el vestuario espera tu reacción.',
   choices:[
    {t:"Jugar tranquilo, tocar y no arriesgar.",hint:"Seguro",skill:["pase","liderazgo"],risk:0.05,
      win:{apps:1,fama:1,honor:2,sp:1,res:"Partido sobrio y maduro. El DT te da confianza para lo que viene."},
      lose:{apps:1,honor:-1,res:"Jugaste tan a lo seguro que pasaste desapercibido. El DT esperaba más personalidad."}},
    {t:"Salir a comerte la cancha.",hint:"Riesgo/brillo",skill:["gambeta","definicion"],risk:0.2,
      win:{apps:1,goals:1,fama:3,honor:1,sp:2,res:"Gambeta que levantó la tribuna y gol en tu debut. Nace una promesa."},
      lose:{apps:1,fama:-1,honor:-2,res:"Quisiste ser figura y te comiste un partido para el olvido. Perdiste pelotas, te silbaron."}},
    {t:"Jugar para el capitán y el equipo.",hint:"Vestuario",skill:["pase"],risk:0.08,
      win:{apps:1,assists:1,honor:3,fama:1,sp:1,res:"Asistencia al capitán en tu estreno. El vestuario te adopta al toque."},
      lose:{apps:1,honor:1,res:"Te escondiste un poco detrás de los grandes. Partido correcto, nada más."}}]},

  {id:"primerGol", once:true, maxAge:28, type:"good",
   text:()=>'Se te presenta la chance de tu primer gol profesional. Cara a cara con el arquero.',
   choices:[
    {t:"Definir cruzado, a lo seguro.",hint:"Frío",skill:["definicion"],risk:0.1,
      win:{goals:1,apps:1,fama:2,honor:2,sp:1,res:"Cruzado abajo, imposible. Tu primer grito profesional."},
      lose:{apps:1,honor:-1,res:"Te temblaron las piernas y la mandaste afuera. Vas a soñar con esa."}},
    {t:"Picarla por encima del arquero.",hint:"Huevos",skill:["definicion","tiro"],risk:0.3,
      win:{goals:1,apps:1,fama:4,honor:1,sp:2,res:"La picaste con una frialdad de crack. La cancha se vino abajo."},
      lose:{apps:1,fama:-1,honor:-2,res:"Quisiste hacerte el vivo y el arquero la agarró sin moverse. Papelón."}},
    {t:"Amagar y buscar el caño.",hint:"Show",skill:["gambeta"],risk:0.28,
      win:{goals:1,apps:1,fama:3,honor:-1,sp:1,res:"Caño al arquero y a cobrar. Golazo con sello."},
      lose:{apps:1,honor:-2,res:"El arquero te leyó el amague y te robó la pelota. Te van a cargar toda la semana."}}]},

  {id:"clasico", type:"",
   text:()=>'En el clásico, tu marca te provoca durante todo el partido.',
   choices:[
    {t:"Humillarlo con un caño y festejarlo.",hint:"Show",skill:["gambeta","velocidad"],risk:0.25,
      win:{fama:4,honor:-4,goals:1,apps:1,sp:1,res:"Caño, baile y gol. La tribuna explota, el rival te jura venganza."},
      lose:{apps:1,honor:-3,res:"Quisiste humillarlo, te sacó la pelota y arrancó el contragolpe del gol rival. Te comés la bronca de todos."}},
    {t:"Ignorarlo y jugar tu partido.",hint:"Frío",skill:["liderazgo","pase"],risk:0.1,
      win:{honor:5,goals:1,apps:1,sp:1,res:"No le diste bola y metiste un gol serio. Pura clase."},
      lose:{apps:1,honor:1,res:"Lo ignoraste pero tampoco pesaste en el partido. Empate gris."}},
    {t:"Encararlo y plantarte.",hint:"Caliente",skill:["fisico"],risk:0.35,
      win:{honor:2,fama:2,apps:1,res:"Le ganaste el duelo físico y psicológico. Se calló la boca."},
      lose:{apps:1,honor:-6,res:"Caíste en la provocación, viste la amarilla y casi la roja. Un desastre."}}]},

  {id:"molestiaFisica", type:"bad",
   text:()=>'Venís con una molestia y hay partido clave. El médico duda si arriesgarte.',
   choices:[
    {t:"Jugar infiltrado igual.",hint:"Riesgo de lesión",skill:["fisico","resistencia"],risk:0.15,
      win:{apps:1,goals:1,fama:2,honor:4,sp:1,res:"Aguantaste el dolor y fuiste decisivo. Corazón puro."},
      lose:{apps:1,honor:2,injuryRisk:{chance:0.7,len:'long',seasons:1},res:"Forzaste y el cuerpo dijo basta en pleno partido."}},
    {t:"Descansar y cuidarte.",hint:"Responsable",
      eff:{honor:1,sp:2,res:"Paraste a tiempo. Volviste entero y enfocado."}},
    {t:"Pedir segunda opinión.",hint:"Prudente",skill:["liderazgo"],risk:0.05,
      win:{honor:3,sp:1,res:"Otro médico te frenó. Zafaste de una lesión mayor por poco."},
      lose:{honor:0,res:"Perdiste tiempo con consultas y te quedaste afuera igual. Nada grave, pero medio al pedo."}}]},

  /* ===== RUEDAS DE PRENSA ===== */
  {id:"prensaClasico", type:"press",
   text:()=>'🎤 RUEDA DE PRENSA. Periodista: "¿Te considerás mejor que la estrella del rival de este fin de semana?"',
   choices:[
    {t:"\"Obvio que soy mejor, y lo voy a demostrar.\"",hint:"Caliente",
      eff:{fama:5,honor:-5,res:"Titular en todos lados. Media hinchada te ama, la otra te quiere ver perder."}},
    {t:"\"El que juega en la cancha decide, no las palabras.\"",hint:"Diplomático",
      eff:{fama:1,honor:5,sp:1,res:"Respuesta madura. Hasta los rivales te respetan."}},
    {t:"\"Prefiero que hablen mis actuaciones.\"",hint:"Humilde",
      eff:{honor:4,res:"Bajaste el tono. Los hinchas del rival no tienen con qué cargarte."}},
    {t:"Contestar con un chiste y cambiar de tema.",hint:"Esquivo",
      eff:{fama:2,honor:2,res:"La rompiste con humor. Ganaste a la sala de prensa."}}]},

  {id:"prensaDerrota", type:"press",
   text:()=>'🎤 RUEDA DE PRENSA tras una derrota fea. Periodista: "¿Qué le pasó al equipo hoy? ¿Es culpa del técnico?"',
   choices:[
    {t:"\"El técnico no tiene nada que ver, fallamos los jugadores.\"",hint:"Bancar al DT",
      eff:{honor:7,fama:1,sp:1,res:"Diste la cara por el grupo. El vestuario y el cuerpo técnico te lo agradecen."}},
    {t:"\"Hay cosas del planteo que no funcionaron.\"",hint:"Tirar la bomba",
      eff:{fama:4,honor:-6,res:"Dejaste al DT expuesto. Se pudre el clima interno."}},
    {t:"\"No es momento de buscar culpables.\"",hint:"Diplomático",
      eff:{honor:3,sp:1,res:"Cerraste el tema con elegancia. Nadie queda pegado."}},
    {t:"Levantarte y cortar la conferencia.",hint:"Caliente",
      eff:{fama:3,honor:-4,res:"Te fuiste picado frente a cámara. Se viraliza, pero te deja mal parado."}}]},

  {id:"prensaFichaje", type:"press",
   text:()=>'🎤 RUEDA DE PRENSA. Periodista: "Se te vincula con clubes de Europa. ¿Te querés ir del '+P.club+'?"',
   choices:[
    {t:"\"Estoy feliz acá, no pienso en otra cosa.\"",hint:"Lealtad",
      eff:{honor:7,fama:1,res:"La hinchada te canta como bandera. Renovaste el amor con el club."}},
    {t:"\"Uno nunca sabe lo que depara el futuro.\"",hint:"Ambiguo",
      eff:{fama:3,honor:-1,res:"Dejaste la puerta abierta. La hinchada queda con la duda."}},
    {t:"\"Cualquier jugador quiere jugar en Europa.\"",hint:"Sincericidio",
      eff:{fama:4,honor:-5,res:"Fuiste demasiado honesto. Los hinchas sienten que ya tenés un pie afuera."}},
    {t:"\"Hablen con mi representante, yo solo juego.\"",hint:"Esquivo",
      eff:{honor:2,res:"Sacaste el tema de encima con oficio."}}]},

  {id:"prensaPolemica", type:"press",
   text:()=>'🎤 RUEDA DE PRENSA. Un periodista te tira una pregunta picante sobre un cruce que tuviste con un árbitro.',
   choices:[
    {t:"Descargar contra el arbitraje sin filtro.",hint:"Caliente",
      eff:{fama:5,honor:-7,res:"Explotaste contra los árbitros. Fecha de suspensión y multa casi seguras."}},
    {t:"Admitir que te calentaste de más.",hint:"Humilde",
      eff:{honor:8,sp:1,res:"Reconociste tu error como un grande. Te ganaste respeto insospechado."}},
    {t:"\"Prefiero no hablar de los árbitros.\"",hint:"Diplomático",
      eff:{honor:3,res:"Esquivaste el barro con inteligencia."}}]},

  {id:"potrero", type:"good",
   text:()=>'El potrero de tu barrio, donde empezaste, está por cerrar. Te piden ayuda.',
   choices:[
    {t:"Financiar la refacción vos mismo.",hint:"Gesto enorme",eff:{honor:14,fama:3,res:"Reconstruiste el potrero. Te hacen un mural. Ídolo del barrio."}},
    {t:"Hacer un partido benéfico.",hint:"Sumás a todos",skill:["fama","liderazgo"],risk:0.1,
      win:{honor:8,fama:2,sp:1,res:"Partido a beneficio, estadio lleno. Hermoso."},
      lose:{honor:3,res:"El evento fue chico y no juntó lo esperado, pero la intención quedó."}},
    {t:"No involucrarte, estás enfocado.",hint:"Frío",eff:{honor:-6,sp:1,res:"No te metiste. En el barrio no te lo perdonan."}}]},

  {id:"mentorPibe", type:"good",
   text:()=>'Un pibe de inferiores te pide quedarse a entrenar tiros libres con vos.',
   choices:[
    {t:"Quedarte a enseñarle.",hint:"Mentor",eff:{honor:7,sp:1,res:"Le enseñaste tu técnica. Va a hablar bien de vos siempre."}},
    {t:"Entrenar vos solo, enfocado.",hint:"Productivo",skill:["resistencia"],risk:0.12,
      win:{honor:-1,sp:2,res:"Entrenaste durísimo solo. Ganaste habilidad extra."},
      lose:{honor:-1,injuryRisk:{chance:0.3,len:'short',seasons:0},res:"Te exigiste de más entrenando solo y te resentiste."}},
    {t:"Irte temprano.",hint:"Nada",eff:{honor:-2,res:"Te fuiste. Se notó."}}]},

  {id:"fiesta", type:"bad", maxAge:30,
   text:()=>'Te invitan a una fiesta la noche antes de un partido.',
   choices:[
    {t:"Ir y quedarte hasta tarde.",hint:"Riesgo",skill:["resistencia"],risk:0.4,
      win:{honor:-2,fama:3,res:"Zafaste: rendiste igual y encima la pasaste bien. Esta vez."},
      lose:{honor:-7,fama:2,apps:1,res:"Salió una foto tuya de joda y jugaste apagado al otro día. Doble papelón."}},
    {t:"Ir un rato y volver temprano.",hint:"Equilibrio",eff:{honor:0,fama:1,sp:1,res:"Te mostraste sin excederte."}},
    {t:"Quedarte a descansar.",hint:"Profesional",eff:{honor:3,sp:1,res:"Dormiste bien y rendiste. Profesionalismo puro."}}]},

  {id:"capitania", once:true, minAge:24, type:"good",
   text:()=>'El técnico del '+P.club+' te ofrece la cinta de capitán de forma permanente.',
   choices:[
    {t:"Aceptar y liderar de frente.",hint:"Liderazgo",skill:["liderazgo"],risk:0.1,
      win:{honor:8,fama:2,sp:1,res:"Sos el nuevo capitán y el vestuario te sigue a muerte."},
      lose:{honor:2,res:"Aceptaste pero te pesó el rol al principio. Con el tiempo se acomoda."}},
    {t:"Aceptar con humildad.",hint:"Sereno",eff:{honor:6,sp:1,res:"Tomaste la cinta sin agrandarte. Respeto total."}},
    {t:"Rechazar, liderás sin cinta.",hint:"Perfil bajo",eff:{honor:3,sp:1,res:"Cediste la cinta pero seguís siendo referente."}}]},

  {id:"contrato", type:"transfer",
   text:()=>'El '+P.club+' te ofrece renovar con aumento, pero por más años.',
   choices:[
    {t:"Renovar y comprometerte.",hint:"Lealtad",eff:{honor:6,fama:1,sp:1,res:"Firmaste. La hinchada te canta como bandera."}},
    {t:"Renovar pidiendo cláusula de salida.",hint:"Astuto",skill:["liderazgo"],risk:0.15,
      win:{honor:1,fama:1,sp:1,res:"Firmaste dejándote una puerta abierta. Bien jugado."},
      lose:{honor:-2,res:"El club se plantó y la negociación quedó tensa."}},
    {t:"No renovar, querés otro rumbo.",hint:"Frío",eff:{honor:-4,fama:2,sp:1,res:"Rechazaste. El club se ofende, la prensa habla."}}]},

  {id:"bajon", type:"bad",
   text:()=>'Llevás varios partidos sin rendir y la prensa te castiga.',
   choices:[
    {t:"Encerrarte a entrenar el doble.",hint:"Trabajo",skill:["resistencia","liderazgo"],risk:0.2,
      win:{honor:2,sp:3,res:"Doble turno de laburo y saliste del pozo. Volviste enchufado."},
      lose:{honor:1,sp:1,injuryRisk:{chance:0.35,len:'short',seasons:0},res:"Te exigiste tanto que te sobrecargaste. Un paso atrás."}},
    {t:"Salir a hablar y bancar la crítica.",hint:"Frente",eff:{honor:4,fama:1,sp:1,res:"Diste la cara. Los hinchas valoran los huevos."}},
    {t:"Echarle la culpa a los compañeros.",hint:"Tóxico",eff:{honor:-10,res:"Tiraste a otros abajo. Se pudre el vestuario."}}]},

  {id:"fairplay", type:"bad",
   text:()=>'En una jugada, podés entrar fuerte a un rival ya lesionado.',
   choices:[
    {t:"Entrar fuerte igual.",hint:"Sucio",eff:{honor:-12,fama:1,apps:1,res:"Lo lesionaste feo. Todo el fútbol te repudia."}},
    {t:"Frenar y no arriesgarlo.",hint:"Fair play",eff:{honor:10,apps:1,sp:1,res:"Frenaste para no dañarlo. Ovación por el gesto."}},
    {t:"Disputarla limpio.",hint:"Normal",skill:["fisico"],risk:0.1,
      win:{honor:2,apps:1,sp:1,res:"Ganaste la pelota limpio, sin drama."},
      lose:{honor:0,apps:1,res:"Llegaste tarde y te comiste una amarilla boba."}}]},

  {id:"vestuarioPelea", type:"bad",
   text:()=>'Dos compañeros se pelean fuerte en el vestuario y todos miran cómo reaccionás.',
   choices:[
    {t:"Meterte a poner orden.",hint:"Líder",skill:["liderazgo","fisico"],risk:0.15,
      win:{honor:8,sp:1,res:"Frenaste la pelea y hablaste claro. Liderazgo real."},
      lose:{honor:-2,res:"Te metiste en el medio y casi te comés un golpe. Quedó peor."}},
    {t:"Hacerte el distraído.",hint:"Evasivo",eff:{honor:-3,res:"Miraste para otro lado. El grupo lo nota."}},
    {t:"Tomar partido por uno.",hint:"Bando",eff:{honor:-4,fama:1,res:"Elegiste un lado. Partiste el vestuario."}}]},

  {id:"nenePredio", type:"good",
   text:()=>'Un nene con tu camiseta te espera horas en la puerta del predio.',
   choices:[
    {t:"Pararte a sacarte fotos con todos.",hint:"Ídolo",eff:{honor:8,fama:2,res:"Te quedaste con cada pibe. Imágenes que dan la vuelta al país."}},
    {t:"Saludar rápido y seguir.",hint:"Cordial",eff:{honor:3,sp:1,res:"Un saludo corto pero cálido."}},
    {t:"Pasar de largo, apurado.",hint:"Frío",eff:{honor:-7,res:"Pasaste sin mirar. Un llanto que sale en la tele."}}]},

  {id:"jovenPromesa", type:"", minAge:29,
   text:()=>'Llega un pibe de 17 que quiere tu puesto y te pide consejos.',
   choices:[
    {t:"Ayudarlo aunque te tape.",hint:"Grandeza",eff:{honor:10,sp:1,res:"Lo ayudaste sabiendo que puede reemplazarte. Eso es ser leyenda."}},
    {t:"Ayudarlo pero marcar territorio.",hint:"Zorro",eff:{honor:3,sp:2,res:"Lo guiaste sin regalar tu lugar. Sabio."}},
    {t:"Ignorarlo, es competencia.",hint:"Frío",eff:{honor:-6,res:"Lo dejaste solo. Feo en un veterano."}}]},

  {id:"capitanSeleccionOffer", once:true, minAge:28, type:"good", req:()=>P.seleccion,
   text:()=>'El DT de '+P.nat+' evalúa darte la cinta de capitán de la selección.',
   choices:[
    {t:"Aceptar con el pecho inflado.",hint:"Orgullo",eff:{honor:10,fama:4,sp:1,res:"Sos el capitán de tu país. El sueño máximo."}},
    {t:"Aceptar con humildad total.",hint:"Sereno",eff:{honor:8,fama:3,sp:1,res:"Tomaste la cinta más pesada sin agrandarte."}}]},

  {id:"retiroPiensa", once:true, minAge:34, type:"",
   text:()=>'Sentís el cuerpo pesado. Los medios preguntan si pensás en el retiro.',
   choices:[
    {t:"\"Juego hasta que el cuerpo aguante.\"",hint:"Guerrero",eff:{honor:6,fama:2,sp:1,res:"Dejaste claro que no aflojás. Los hinchas te aman más."}},
    {t:"Anunciar que será tu última temporada.",hint:"Emotivo",eff:{honor:9,fama:3,res:"Anunciaste el final. Cada cancha te va a despedir."}},
    {t:"Esquivar el tema.",hint:"Reservado",eff:{honor:1,sp:1,res:"No confirmaste nada. El misterio sigue."}}]},

  {id:"malaSuerte", type:"bad",
   text:()=>'Te enfermás justo antes de un partido decisivo.',
   choices:[
    {t:"Jugar con fiebre igual.",hint:"Sacrificio/riesgo",skill:["resistencia","fisico"],risk:0.3,
      win:{apps:1,honor:6,fama:1,res:"Jugaste hecho bolsa y la rompiste igual. Épico."},
      lose:{apps:1,honor:2,injuryRisk:{chance:0.4,len:'short',seasons:0},res:"Jugaste al 40% y te resentiste. No valió la pena."}},
    {t:"Quedarte en cama.",hint:"Cabeza",eff:{honor:-1,sp:1,res:"Te cuidaste. El equipo perdió pero volviste sano."}}]},

  {id:"apuesta", type:"bad",
   text:()=>'Un allegado te ofrece meterte en un negocio raro que promete mucha plata.',
   choices:[
    {t:"Entrar sin preguntar mucho.",hint:"Peligro",skill:["liderazgo"],risk:0.45,
      win:{honor:1,fama:2,res:"Sonó la flauta y saliste antes de que se pudra. Zafaste raspando."},
      lose:{honor:-10,fama:2,res:"Salió pésimo y salpicó tu nombre en todos los medios. Lección carísima."}},
    {t:"Consultarlo con tu gente de confianza.",hint:"Prudente",eff:{honor:3,sp:1,res:"Frenaste a tiempo. Zafaste de un quilombo."}},
    {t:"Decir que no de una.",hint:"Limpio",eff:{honor:5,res:"Ni lo dudaste. Tu entorno te respeta más."}}]}
];
/* ===================== EVENTOS 50/50 Y RUEDAS DE PRENSA =====================
   Estructura nueva: una opción puede tener 'roll':[{p,eff,res}, ...]
   donde p es peso. Se elige uno al azar ponderado. Así "salir a comerte la
   cancha" puede salir crack o desastre.
*/
