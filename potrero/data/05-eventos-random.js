const EVENTS_RANDOM = [
  {id:"debut50", once:true, maxAge:26, type:"good",
   text:()=>'El técnico del '+P.club+' te lo dice de frente: hoy sos titular por primera vez. Todo el estadio te mira.',
   choices:[
    {t:"Salir a comerte la cancha.",hint:"Alto riesgo",roll:[
      {p:38,eff:{apps:1,goals:1,fama:4,honor:2,sp:2,idol:6},res:"¡La rompiste! Gambeta, gol y ovación. Nació una estrella."},
      {p:32,eff:{apps:1,fama:1,honor:0,sp:1,idol:1},res:"Arrancaste bien pero te fuiste apagando. Partido correcto, nada más."},
      {p:30,eff:{apps:1,fama:-1,honor:-3,sp:1,idol:-3},res:"Quisiste hacer de más y te salió pésimo. Perdiste pelotas clave, te silbaron."}
    ]},
    {t:"Jugar tranquilo y seguro.",hint:"Bajo riesgo",roll:[
      {p:65,eff:{apps:1,fama:1,honor:2,sp:1,idol:2},res:"Partido sobrio y maduro. El DT te da confianza."},
      {p:35,eff:{apps:1,honor:0,sp:1,idol:0},res:"No brillaste pero cumpliste. Aprobado justo."}
    ]},
    {t:"Jugar para el equipo, sin protagonismo.",hint:"Vestuario",roll:[
      {p:55,eff:{apps:1,assists:1,honor:3,sp:1,idol:3},res:"Asististe y te ganaste al grupo en tu debut."},
      {p:45,eff:{apps:1,honor:1,sp:1,idol:1},res:"Pasaste desapercibido, pero el vestuario valora tu humildad."}
    ]}]},

  {id:"penal50", type:"", 
   text:()=>'Penal a favor en el minuto 89, empate en el marcador. El capitán te pregunta si querés patearlo.',
   choices:[
    {t:"Agarrar la pelota y patearlo.",hint:"Huevos",roll:[
      {p:55,eff:{apps:1,goals:1,fama:4,honor:5,sp:2,idol:8},res:"¡Gol! Lo definiste vos. Héroe del partido."},
      {p:45,eff:{apps:1,fama:-2,honor:-4,sp:1,idol:-6},res:"Lo erraste. El arquero lo atajó y el estadio se vino abajo. Noche para el olvido."}
    ]},
    {t:"Dejárselo al pateador designado.",hint:"Prudente",roll:[
      {p:60,eff:{apps:1,honor:1,idol:1},res:"El especialista lo metió. Bien pensado."},
      {p:40,eff:{apps:1,honor:0,idol:-1},res:"Lo erró él. Igual nadie te reprocha nada a vos."}
    ]}]},

  {id:"caño50", type:"",
   text:()=>'Encarás al último defensor con la cancha de frente. Podés intentar un caño humillante o jugar simple.',
   choices:[
    {t:"Intentar el caño.",hint:"Show/riesgo",roll:[
      {p:45,eff:{fama:5,honor:2,sp:1,idol:5,goals:1,apps:1},res:"¡Caño y gol! Golazo que da la vuelta al mundo."},
      {p:55,eff:{fama:-1,honor:-3,apps:1,idol:-3},res:"Te lo cortaron y arrancó el contragolpe. El DT te putea desde el banco."}
    ]},
    {t:"Jugar simple y asistir.",hint:"Seguro",roll:[
      {p:70,eff:{assists:1,honor:2,sp:1,idol:2,apps:1},res:"Pase justo, gol del compañero. Jugada de crack inteligente."},
      {p:30,eff:{honor:0,apps:1,idol:0},res:"La jugada no terminó en nada, pero elegiste bien."}
    ]}]},

  {id:"lesionRiesgo50", type:"bad",
   text:()=>'Sentís una molestia pero es la final y el equipo te necesita. ¿Jugás?',
   choices:[
    {t:"Jugar infiltrado.",hint:"Riesgo real de lesión",roll:[
      {p:45,eff:{apps:1,goals:1,honor:8,fama:3,sp:1,idol:8},res:"Aguantaste el dolor y fuiste la figura. Ídolo total."},
      {p:30,eff:{apps:1,honor:5,idol:4},res:"Jugaste con lo justo, sin brillar, pero estuviste."},
      {p:25,eff:{apps:1,honor:4,idol:2,injury:{len:'long',seasons:1}},res:"Te rompiste en el intento. La molestia se volvió lesión grave. Corazón, pero lo pagás caro."}
    ]},
    {t:"No arriesgar, avisar que no estás.",hint:"Cabeza fría",roll:[
      {p:100,eff:{honor:0,sp:1,idol:-1},res:"Priorizaste tu cuerpo. Algunos hinchas lo entienden, otros no."}
    ]}]}
];

/* RUEDAS DE PRENSA: pregunta + opciones de respuesta con resultado 50/50 */
