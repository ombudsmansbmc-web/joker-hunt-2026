const screens=[...document.querySelectorAll(".screen")];
const state={
  team:localStorage.getItem("jh_team")||"",
  players:Number(localStorage.getItem("jh_players")||0),
  start:Number(localStorage.getItem("jh_start")||0),
  stage:Number(localStorage.getItem("jh_stage")||0)
};

const stops={
  1:{
    title:"STOP 1",
    p1:"18 ÷ 3 + 2 × 2 − 3 = ?",
    p1answers:["7"],
    p2:"You stop here as a group more often, but you are not the only ones. Many people stop here to search for something underwater. Long ago this place had a very different purpose. Where people once came for help, Joker now uses the building across the road for his experiments. What kind of place are you looking for?",
    p2answers:["old lab","laboratory","lab","medical lab","old laboratory"],
    qr:["plan"]
  },
  2:{
    title:"STOP 2",
    p1:"(20 − 8) ÷ 3 = ?",
    p1answers:["4"],
    p2:"AYERA — AWE — SEMPER. What do these words mean, and where on Bonaire can you find them while looking out over the town?",
    p2answers:["seru largu","gisteren vandaag altijd","yesterday today always","yesterday today and always"],
    qr:["look"]
  },
  3:{
    title:"STOP 3",
    p1:"(18 ÷ 3) + (12 ÷ 4) = ?",
    p1answers:["9"],
    p2:"Joker left only three compass directions: NORTH — SOUTH — WEST. Which direction is missing?",
    p2answers:["east","oost"],
    qr:["over"]
  }
};

function normalize(v){return String(v||"").trim().toLowerCase().replace(/\s+/g," ")}
function show(name){screens.forEach(s=>s.classList.toggle("active",s.id==="screen-"+name));window.scrollTo(0,0)}
function save(){localStorage.setItem("jh_team",state.team);localStorage.setItem("jh_players",state.players);localStorage.setItem("jh_start",state.start);localStorage.setItem("jh_stage",state.stage)}

document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>show(b.dataset.go)));

document.getElementById("team-form").addEventListener("submit",e=>{
  e.preventDefault();
  state.team=document.getElementById("team-name").value.trim();
  state.players=Number(document.getElementById("player-count").value);
  save();
  show("briefing");
});

document.getElementById("begin-mission").addEventListener("click",()=>{
  if(!state.start) state.start=Date.now();
  state.stage=Math.max(state.stage,0);
  save();
  renderMission();
  show("mission");
  tick();
});

function tick(){
  if(!state.start)return;
  const s=Math.floor((Date.now()-state.start)/1000),h=String(Math.floor(s/3600)).padStart(2,"0"),m=String(Math.floor((s%3600)/60)).padStart(2,"0"),x=String(s%60).padStart(2,"0");
  const el=document.getElementById("timer"); if(el) el.textContent=h+":"+m+":"+x
}
setInterval(tick,1000);

function renderMission(){
  document.getElementById("active-team").textContent=state.team||"UNKNOWN TEAM";
  const title=document.getElementById("mission-title"), copy=document.getElementById("mission-copy"), status=document.getElementById("mission-status");
  if(state.stage===0){title.textContent="FIND THE FIRST TRAIL";copy.textContent="Your first destination is revealed in Batman's briefing. Complete that stop and scan its QR code to continue."}
  if(state.stage===1){title.textContent="STOP 1 UNLOCKED";copy.textContent="Complete Stop 1 in order: Puzzle 1, Puzzle 2, then Joker's QR check."}
  if(state.stage===2){title.textContent="STOP 2 UNLOCKED";copy.textContent="Complete Stop 2 in order. Do not skip ahead."}
  if(state.stage===3){title.textContent="STOP 3 UNLOCKED";copy.textContent="Complete Stop 3 in order. The finale comes next."}
  if(state.stage>=4){title.textContent="FINAL MISSION";copy.textContent="Joker is waiting for you live.";status.textContent="FINALE UNLOCKED"}
}

function unlockStop(n){
  state.stage=Math.max(state.stage,n);
  save();
  loadStop(n);
  show("stop");
}

function loadStop(n){
  const data=stops[n];
  document.getElementById("stop-heading").textContent=data.title;
  document.getElementById("stop-eyebrow").textContent="JOKER TRANSMISSION // "+data.title;
  document.getElementById("puzzle1-text").textContent=data.p1;
  document.getElementById("puzzle2-text").textContent=data.p2;
  ["puzzle1-answer","puzzle2-answer","qr-answer"].forEach(id=>document.getElementById(id).value="");
  ["puzzle1-feedback","puzzle2-feedback","qr-feedback"].forEach(id=>{const e=document.getElementById(id);e.textContent="";e.className="feedback"});
  document.getElementById("puzzle2-card").classList.remove("unlocked");
  document.getElementById("qr-card").classList.remove("unlocked");
  document.getElementById("check-puzzle1").onclick=()=>checkAnswer("puzzle1-answer",data.p1answers,"puzzle1-feedback",()=>document.getElementById("puzzle2-card").classList.add("unlocked"));
  document.getElementById("check-puzzle2").onclick=()=>checkAnswer("puzzle2-answer",data.p2answers,"puzzle2-feedback",()=>document.getElementById("qr-card").classList.add("unlocked"));
  document.getElementById("check-qr").onclick=()=>checkAnswer("qr-answer",data.qr,"qr-feedback",()=>{
    if(n<3){state.stage=n+1;save();renderMission();setTimeout(()=>unlockStop(n+1),450)}
    else{state.stage=4;save();setTimeout(()=>show("finale"),450)}
  });
}

function checkAnswer(inputId,answers,feedbackId,onOk){
  const input=document.getElementById(inputId),feedback=document.getElementById(feedbackId),value=normalize(input.value);
  const ok=answers.map(normalize).includes(value);
  feedback.textContent=ok?"CORRECT — ACCESS GRANTED":"WRONG ANSWER — TRY AGAIN";
  feedback.className="feedback "+(ok?"ok":"bad");
  if(ok){input.disabled=true;onOk&&onOk()}
}

document.getElementById("submit-finale").addEventListener("click",()=>{
  const a=normalize(document.getElementById("final-code-1").value),b=normalize(document.getElementById("final-code-2").value),f=document.getElementById("final-feedback");
  if(a==="497"||b==="497"){
    f.textContent="CODE ACCEPTED — JOKER'S LOCK IS OPEN";
    f.className="feedback ok";
    document.getElementById("complete-team").textContent=state.team||"UNKNOWN TEAM";
    state.stage=5;save();
    setTimeout(()=>show("complete"),700);
  } else {
    f.textContent="CODE REJECTED";
    f.className="feedback bad";
  }
});

document.getElementById("reset-game").addEventListener("click",()=>{
  if(!confirm("Reset all Joker Hunt progress on this device?"))return;
  ["jh_team","jh_players","jh_start","jh_stage"].forEach(k=>localStorage.removeItem(k));
  location.href=location.pathname;
});

const params=new URLSearchParams(location.search);
const unlock=Number(params.get("unlock")||0);
if(unlock){
  if(!state.start){show("denied")}
  else if(unlock===1&&state.stage===0){unlockStop(1)}\n  else if(unlock>state.stage){show("denied")}
  else if(unlock>=1&&unlock<=3){unlockStop(unlock)}
  else if(unlock===4&&state.stage>=4){show("finale")}
}else if(state.start){
  renderMission();
  show(state.stage===5?"complete":"mission");
}