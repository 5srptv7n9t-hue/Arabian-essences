const PRESS_CONFERENCES = [
  {id:"pressRival", q:()=>'Rueda de prensa. Un periodista te pincha: "¿Es verdad que el '+randomBig()+' te quiere y vos te querés ir?"',
   choices:[
    {t:"\"Estoy feliz acá, no pienso en otra cosa.\"",hint:"Diplomático",roll:[
      {p:75,eff:{honor:4,idol:5,fama:1},res:"Frase de ídolo. La hinchada te canta esa misma noche."},
      {p:25,eff:{honor:1,idol:1},res:"Sonó a cliché, pero zafaste sin quilombo."}
    ]},
    {t:"\"Ningún jugador le dice que no a un grande.\"",hint:"Sincero/peligroso",roll:[
      {p:40,eff:{fama:4,honor:0,idol:-2},res:"Fue honesto y hasta te respetaron la sinceridad."},
      {p:60,eff:{fama:3,honor:-5,idol:-10},res:"Titular explosivo. La hinchada se siente traicionada."}
    ]},
    {t:"\"Preguntale a mi representante.\"",hint:"Esquivar",roll:[
      {p:100,eff:{honor:-1,idol:0},res:"Esquivaste el bulto. Frío pero efectivo."}
    ]}]},

  {id:"pressDT", q:()=>'En conferencia te preguntan por qué el DT te sacó en el último partido cuando ibas bien.',
   choices:[
    {t:"\"El técnico sabe, yo respeto sus decisiones.\"",hint:"Institucional",roll:[
      {p:80,eff:{honor:5,idol:4},res:"Bancaste al DT en público. El cuerpo técnico te lo agradece."},
      {p:20,eff:{honor:2,idol:1},res:"Respuesta correcta, sin más."}
    ]},
    {t:"\"La verdad no entendí el cambio.\"",hint:"Polémico",roll:[
      {p:50,eff:{fama:3,honor:-4,idol:-3},res:"Se armó ruido. El DT te llama a su oficina."},
      {p:50,eff:{fama:2,honor:-1,idol:0},res:"Muchos hinchas pensaban igual. Zafaste raspando."}
    ]}]},

  {id:"pressGol", q:()=>'Te preguntan si te considerás el mejor jugador del país en tu puesto.',
   choices:[
    {t:"\"Trabajo para eso, lo dirán los hechos.\"",hint:"Medido",roll:[
      {p:85,eff:{honor:4,fama:2,idol:3},res:"Humilde pero con hambre. Perfecto."},
      {p:15,eff:{honor:1,idol:1},res:"Respuesta segura, nada que reprochar."}
    ]},
    {t:"\"Sin dudas, no hay nadie a mi nivel.\"",hint:"Ego",roll:[
      {p:35,eff:{fama:6,honor:-2,idol:2},res:"Te bancaste la frase y la gente lo festejó como personalidad."},
      {p:65,eff:{fama:4,honor:-6,idol:-4},res:"Sonó a agrandado. Te van a marcar cada error de ahora en más."}
    ]}]}
];
function randomBig(){return BIG_CLUBS[Math.floor(Math.random()*BIG_CLUBS.length)];}
