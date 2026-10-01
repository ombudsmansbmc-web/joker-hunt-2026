const screens=[...document.querySelectorAll(".screen")];
const state={
  team:localStorage.getItem("jh_team")||"",
  players:Number(localStorage.getItem("jh_players")||0),
  start:Number(localStorage.getItem("jh_start")||0),
  stage:Number(localStorage.getItem("jh_stage")||0),
  attempts:JSON.parse(localStorage.getItem("jh_attempts")||"{}"),
  results:JSON.parse(localStorage.getItem("jh_results")||"{}")
};

const stops={
  1:{
    title:"STOP 1",
    p1:"18 ÷ 3 + 2 × 2 − 3 = ?",
    p1answers:["7"],
    p2:"You stop here as a group more often, but you are not the only ones. Many people stop here to search for something underwater. Long ago this place had a very different purpose. Where people once came for help, Joker now uses the building across the road for his experiments. What kind of place are you looking for?",
    p2answers:["laboratory","lab","old laboratory"],
    qr:["plan"],
    photo:"Take a photo of Willemstoren. Make sure the lighthouse is clearly visible."
  },
  2:{
    title:"STOP 2",
    p1:"(20 − 8) ÷ 3 = ?",
    p1answers:["4"],
    p2:"AYERA — AWE — SEMPER. What do these words mean, and where on Bonaire can you find them while looking out over the town?",
    p2answers:["seru largu","gisteren vandaag altijd","yesterday today always","yesterday today and always"],
    qr:["look"],
    photo:"Take a photo of the old laboratory at Karpata. Make sure the building is clearly visible."
  },
  3:{
    title:"STOP 3",
    p1:"(18 ÷ 3) + (12 ÷ 4) = ?",
    p1answers:["9"],
    p2:"Joker left only three compass directions: NORTH — SOUTH — WEST. Which direction is missing?",
    p2answers:["east","oost"],
    qr:["over"],
    photo:"Take a photo of the entire monument at Seru Largu. Make sure the monument is clearly visible."
  }
};

function normalize(v){return String(v||"").trim().toLowerCase().replace(/\s+/g," ")}
function show(name){screens.forEach(s=>s.classList.toggle("active",s.id==="screen-"+name));window.scrollTo(0,0)}
function save(){localStorage.setItem("jh_team",state.team);localStorage.setItem("jh_players",state.players);localStorage.setItem("jh_start",state.start);localStorage.setItem("jh_stage",state.stage);localStorage.setItem("jh_attempts",JSON.stringify(state.attempts));localStorage.setItem("jh_results",JSON.stringify(state.results))}

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
  if(state.stage===0){title.textContent="FIND THE FIRST TRAIL";copy.textContent="Your first destination is revealed in Batman's briefing. When you arrive, take the requested location photo to unlock the mission."}
  if(state.stage===1){title.textContent="STOP 1 UNLOCKED";copy.textContent="Complete Stop 1 in order: Puzzle 1, Puzzle 2, then Joker's QR check."}
  if(state.stage===2){title.textContent="STOP 2 UNLOCKED";copy.textContent="You have reached the next location. Press the button below to start the location mission."}
  if(state.stage===3){title.textContent="STOP 3 UNLOCKED";copy.textContent="Complete Stop 3 in order. The finale comes next."}
  if(state.stage>=4){title.textContent="FINAL MISSION";copy.textContent="Joker is waiting for you live.";status.textContent="FINALE UNLOCKED"}
}

document.getElementById("continue-mission").addEventListener("click",()=>{
  let n=state.stage;
  if(n===0) n=1;
  if(n>=1 && n<=3) unlockStop(n);
  else if(n>=4) show("finale");
});

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
  document.getElementById("photo-instruction").textContent=data.photo;
  document.getElementById("video-check").hidden=false;
  document.getElementById("video-status").innerHTML="<strong>VIDEO COMING SOON — TEST MODE</strong>";
  document.getElementById("puzzle1-text").textContent=data.p1;
  document.getElementById("puzzle2-text").textContent=data.p2;
  ["puzzle1-answer","puzzle2-answer","qr-answer"].forEach(id=>{const e=document.getElementById(id);e.value="";e.disabled=false});
  ["puzzle1-feedback","puzzle2-feedback","qr-feedback"].forEach(id=>{const e=document.getElementById(id);e.textContent="";e.className="feedback"});
  document.getElementById("puzzle1-card").classList.remove("unlocked");
  document.getElementById("puzzle2-card").classList.remove("unlocked");
  document.getElementById("qr-card").classList.remove("unlocked");
  const photo=document.getElementById("location-photo"),preview=document.getElementById("photo-preview"),photoFeedback=document.getElementById("photo-feedback");
  photo.value=""; preview.hidden=true; preview.removeAttribute("src"); photoFeedback.textContent=""; photoFeedback.className="feedback";
  photo.onchange=()=>{
    const file=photo.files&&photo.files[0];
    if(!file)return;
    preview.src=URL.createObjectURL(file); preview.hidden=false;
    photoFeedback.textContent="PHOTO RECEIVED — MISSION UNLOCKED";
    photoFeedback.className="feedback ok";
    document.getElementById("puzzle1-card").classList.add("unlocked");
  };
  document.getElementById("check-puzzle1").onclick=()=>checkAnswer("puzzle1-answer",data.p1answers,"puzzle1-feedback",()=>document.getElementById("puzzle2-card").classList.add("unlocked"));
  document.getElementById("check-puzzle2").onclick=()=>checkAnswer("puzzle2-answer",data.p2answers,"puzzle2-feedback",()=>document.getElementById("qr-card").classList.add("unlocked"));
  document.getElementById("check-qr").onclick=()=>checkAnswer("qr-answer",data.qr,"qr-feedback",()=>{
    if(n<3){state.stage=n+1;save();renderMission();setTimeout(()=>show("mission"),450)}
    else{state.stage=4;save();setTimeout(()=>show("finale"),450)}
  });
}

function checkAnswer(inputId,answers,feedbackId,onOk){
  const input=document.getElementById(inputId),feedback=document.getElementById(feedbackId),value=normalize(input.value);
  const stopNumber=Number(document.getElementById("stop-heading").textContent.replace(/\D/g,""))||0;
  const key="s"+stopNumber+"_"+inputId;
  const ok=answers.map(normalize).includes(value);
  state.attempts[key]=(state.attempts[key]||0)+1;

  if(ok){
    state.results[key]={correct:true,attempts:state.attempts[key]};
    feedback.textContent=state.attempts[key]===1?"CORRECT — FULL POINTS":"CORRECT — SECOND ATTEMPT";
    feedback.className="feedback ok";
    input.disabled=true;
    save();
    onOk&&onOk();
    return;
  }

  if(state.attempts[key]===1){
    feedback.textContent="INCORRECT — HAHAHA… TRY AGAIN.";
    feedback.className="feedback bad";
    save();
    return;
  }

  state.results[key]={correct:false,attempts:state.attempts[key]};
  feedback.textContent="STILL WRONG — JOKER WINS THIS ONE. CONTINUE THE HUNT.";
  feedback.className="feedback bad";
  input.disabled=true;
  save();
  setTimeout(()=>{onOk&&onOk()},700);
}

let finaleTimer=null;

document.getElementById("arrived-finale").addEventListener("click",()=>{
  document.getElementById("final-arrival").hidden=true;
  document.getElementById("final-game").hidden=false;
  localStorage.setItem("jh_final_attempts","0");
  const endTime=Date.now()+300000;
  localStorage.setItem("jh_final_end",String(endTime));
  function updateFinalTimer(){
    const left=Math.max(0,Math.ceil((endTime-Date.now())/1000));
    document.getElementById("final-timer").textContent=String(Math.floor(left/60)).padStart(2,"0")+":"+String(left%60).padStart(2,"0");
    if(left===0){
      clearInterval(finaleTimer);
      document.getElementById("final-code-1").disabled=true;
      document.getElementById("submit-finale").disabled=true;
      document.getElementById("final-feedback").textContent="TIME IS UP — THE LOCK IS CLOSED.";
    }
  }
  updateFinalTimer();
  finaleTimer=setInterval(updateFinalTimer,500);
});

document.getElementById("submit-finale").addEventListener("click",()=>{
  const input=document.getElementById("final-code-1");
  const feedback=document.getElementById("final-feedback");
  let attempts=Number(localStorage.getItem("jh_final_attempts")||0)+1;
  localStorage.setItem("jh_final_attempts",String(attempts));
  if(normalize(input.value)==="497"){
    clearInterval(finaleTimer);
    state.results.final_code={correct:true,attempts:attempts,bonus:11};
    save();
    feedback.textContent="CODE ACCEPTED — JOKER'S LOCK IS OPEN";
    feedback.className="feedback ok";
    document.getElementById("final-attempts").textContent="LOCK OPEN";
    input.disabled=true;
    document.getElementById("submit-finale").disabled=true;
  }else if(attempts>=2){
    state.results.final_code={correct:false,attempts:attempts,bonus:0};
    save();
    feedback.textContent="SECOND ATTEMPT INCORRECT — THE LOCK IS CLOSED.";
    feedback.className="feedback bad";
    document.getElementById("final-attempts").textContent="ATTEMPTS REMAINING: 0";
    input.disabled=true;
    document.getElementById("submit-finale").disabled=true;
  }else{
    feedback.textContent="INCORRECT — ONE ATTEMPT REMAINS.";
    feedback.className="feedback bad";
    document.getElementById("final-attempts").textContent="ATTEMPTS REMAINING: 1";
    input.value="";
  }
});

document.getElementById("joker-photo").addEventListener("change",e=>{
  const file=e.target.files&&e.target.files[0];
  if(!file)return;
  const preview=document.getElementById("joker-photo-preview");
  preview.src=URL.createObjectURL(file);
  preview.hidden=false;
  const feedback=document.getElementById("joker-photo-feedback");
  feedback.textContent="ARREST PHOTO RECEIVED";
  feedback.className="feedback ok";
  state.results.final_photo=true;
  save();
});

const testReset=new URLSearchParams(location.search).get("testreset");
if(testReset==="1"){
  ["jh_team","jh_players","jh_start","jh_stage","jh_attempts","jh_results"].forEach(k=>localStorage.removeItem(k));
  state.team="";
  state.players=0;
  state.start=0;
  state.stage=0;
  state.attempts={};
  state.results={};
  show("home");
}

const params=new URLSearchParams(location.search);
const unlock=Number(params.get("unlock")||0);

if(unlock>=1 && unlock<=3){
  if(!state.start) state.start=Date.now();
  if(!state.team) state.team="TEST TEAM";
  if(!state.players) state.players=2;
  state.stage=unlock;
  save();
  unlockStop(unlock);
}else if(unlock===4){
  if(!state.start) state.start=Date.now();
  state.stage=4;
  save();
  show("finale");
}else if(state.start){
  if(state.stage>=1 && state.stage<=3){
    loadStop(state.stage);
    show("stop");
  }else if(state.stage===4){
    show("finale");
  }else if(state.stage===5){
    show("complete");
  }else{
    renderMission();
    show("mission");
  }
}
