/* ===== CREAR ===== */
function startCareer(){
  const name=document.getElementById('in-name').value.trim()||"Sin Nombre";
  const posGroup=document.getElementById('in-pos').value;
  const arche=document.getElementById('in-arche').value;
  const talent=rollTalent();
  const club=document.getElementById('in-club').value;
  P={name,nat:document.getElementById('in-nat').value,posGroup,arche,
     league:document.getElementById('in-league').value,club,
     age:17,season:1,stats:Object.assign({},editStats),
     goals:0,assists:0,apps:0,fama:0,honor:0,sp:0,
     talent,injury:null,injuryEndSeason:0,
     trophies:[],seleccion:false,retired:false,
     money:0,salary:0,role:null,clubIdol:0,
     invest:0,upgrades:{},
     mediaStar:0,partner:null,partnerType:null,partnerSeasons:0,
     agent:{name:pickAgentName(),commission:0.08},lastSearchSeason:-99};
  // contrato inicial acorde a media y club
  signContract(club, true);
  usedOnce={};recentEvents=[];pendingSP={};
  document.getElementById('s-create').classList.remove('active');
  document.getElementById('s-game').classList.add('active');
  window.scrollTo(0,0);refreshPanel();nextTurn();
}

