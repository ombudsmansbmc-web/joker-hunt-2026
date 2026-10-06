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
    storyTitle:"THE FIRST TRAIL",
    story:"Joker has escaped from Arkham Asylum and made his way to Bonaire. Batman tracked his first movements to this area. Somewhere around Willemstoren, Joker left behind the first pieces of his twisted game. Find his trail and discover where he went next.",
    p1:"18 ÷ 3 + 2 × 2 − 3 = ?",
    p1answers:["7"],
    p2:"You stop here as a group more often, but you are not the only ones. Many people stop here to search for something underwater. Long ago this place had a very different purpose. Where people once came for help, Joker now uses the building across the road for his experiments. What kind of place are you looking for?",
    p2answers:["laboratory","lab","old laboratory"],
    qr:["plan"],
    photo:"Take a photo of Willemstoren. Make sure the lighthouse is clearly visible."
  },
  2:{
    title:"STOP 2",
    storyTitle:"THE LABORATORY",
    story:"You've found the old laboratory. Joker wasn't hiding here without a reason. Evidence shows he has been using this abandoned place to develop a mysterious serum. He left in a hurry, but he also left clues behind. Search carefully and discover what kind of serum Joker has created.",
    p1:"(20 − 8) ÷ 3 = ?",
    p1answers:["4"],
    p2:"AYERA — AWE — SEMPER. What do these words mean?",
    p2answers:["yesterday today always","yesterday today and always","gisteren vandaag altijd","gisteren vandaag en altijd"],
    p2b:"You can find these words on a monument overlooking Kralendijk. Where on Bonaire can you find this monument?",
    p2banswers:["seru largu"],
    qr:["look"],
    photo:"Take a photo of the old laboratory at Karpata. Make sure the building is clearly visible."
  },
  3:{
    title:"STOP 3",
    storyTitle:"JOKER'S PLAN",
    story:"The clues have led you high above the island. Joker came here for the perfect overview of Bonaire — not to enjoy the scenery, but to determine how far his laughing serum would need to spread. He left in a hurry and left more clues behind. Find them before it's too late.",
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
  document.getElementById("story-title").textContent=data.storyTitle;
  document.getElementById("story-text").textContent=data.story;
  document.getElementById("stop-eyebrow").textContent="JOKER TRANSMISSION // "+data.title;
  document.getElementById("photo-instruction").textContent=data.photo;
  document.getElementById("video-check").hidden=false;
  document.getElementById("video-status").innerHTML="<strong>VIDEO COMING SOON — TEST MODE</strong>";
  document.getElementById("puzzle1-text").textContent=data.p1;
  document.getElementById("puzzle2-text").textContent=data.p2;
  const p2bCard=document.getElementById("puzzle2b-card");
  p2bCard.hidden=!data.p2b;
  if(data.p2b){
    document.getElementById("puzzle2b-text").textContent=data.p2b;
    document.getElementById("puzzle2b-answer").value="";
    document.getElementById("puzzle2b-answer").disabled=false;
    document.getElementById("puzzle2b-feedback").textContent="";
    document.getElementById("puzzle2b-feedback").className="feedback";
    p2bCard.classList.remove("unlocked");
  }
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
  document.getElementById("check-puzzle2").onclick=()=>{
    if(data.p2b){
      checkAnswer("puzzle2-answer",data.p2answers,"puzzle2-feedback",()=>p2bCard.classList.add("unlocked"),"s"+n+"_p2");
    }else{
      checkAnswer("puzzle2-answer",data.p2answers,"puzzle2-feedback",()=>document.getElementById("qr-card").classList.add("unlocked"));
    }
  };
  document.getElementById("check-puzzle2b").onclick=()=>{
    checkAnswer("puzzle2b-answer",data.p2banswers||[],"puzzle2b-feedback",()=>document.getElementById("qr-card").classList.add("unlocked"),"s"+n+"_p2",true);
  };
  document.getElementById("check-qr").onclick=()=>checkAnswer("qr-answer",data.qr,"qr-feedback",()=>{
    if(n<3){state.stage=n+1;save();renderMission();setTimeout(()=>show("mission"),450)}
    else{state.stage=4;save();setTimeout(()=>show("finale"),450)}
  });
}

function checkAnswer(inputId,answers,feedbackId,onOk,keyOverride,keepExisting){
  const input=document.getElementById(inputId),feedback=document.getElementById(feedbackId),value=normalize(input.value);
  const stopNumber=Number(document.getElementById("stop-heading").textContent.replace(/\D/g,""))||0;
  const key=keyOverride||("s"+stopNumber+"_"+inputId);
  const ok=answers.map(normalize).includes(value);
  const attemptKey=keyOverride ? key+"_"+inputId : key;
  state.attempts[attemptKey]=(state.attempts[attemptKey]||0)+1;
  const attempts=state.attempts[attemptKey];

  if(ok){
    if(keepExisting){
      const prev=state.results[key];
      const combinedAttempts=(prev&&prev.correct?prev.attempts:2)+attempts-1;
      state.results[key]={correct:true,attempts:Math.min(2,combinedAttempts)};
    }else{
      state.results[key]={correct:true,attempts:attempts};
    }
    feedback.textContent=attempts===1?"CORRECT — FULL POINTS":"CORRECT — SECOND ATTEMPT";
    feedback.className="feedback ok";
    input.disabled=true;
    save();
    onOk&&onOk();
    return;
  }

  if(attempts===1){
    feedback.textContent="INCORRECT — HAHAHA… TRY AGAIN.";
    feedback.className="feedback bad";
    save();
    return;
  }

  if(!keepExisting) state.results[key]={correct:false,attempts:attempts};
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
  if(document.getElementById("submit-finale").disabled){setTimeout(()=>show("return"),500);}
});

document.getElementById("back-at-base").addEventListener("click",()=>show("debrief"));

function calculateFinalScore(){
  let normal=0;
  Object.entries(state.results||{}).forEach(([key,value])=>{
    if(!/^(s[1-3]_(p1|p2|control))$/.test(key)) return;
    if(!value||!value.correct) return;
    normal += value.attempts===1 ? 5 : value.attempts===2 ? 3 : 0;
  });

  const haha=String(state.results.final_haha_count||"").trim()==="22" ? 10 : 0;
  const socks=normalize(state.results.final_socks||"")==="green" ? 15 : 0;
  const photo=state.results.final_photo===true ? 5 : 0;
  const finalCode=(state.results.final_code&&state.results.final_code.correct===true) ? 11 : 0;

  return {
    normal_puzzles:normal,
    haha_signs:haha,
    green_socks:socks,
    joker_photo:photo,
    final_code_bonus:finalCode,
    total:normal+haha+socks+photo+finalCode,
    maximum:86
  };
}

const SUPABASE_URL="https://wbhyezafseewcoxogyzy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_aFg4-ZXiKZhtOHnxenF2Bg_CCjb7Z3Q";

async function submitTeamResult(){
  const score=state.results.score||calculateFinalScore();
  const started=state.start ? new Date(state.start) : null;
  const finished=state.results.finished_at ? new Date(state.results.finished_at) : new Date();
  const payload={
    team_name:state.team||"UNKNOWN TEAM",
    players:Array.isArray(state.players)?state.players.join(", "):String(state.players||""),
    started_at:started?started.toISOString():null,
    finished_at:finished.toISOString(),
    duration_seconds:started?Math.max(0,Math.round((finished-started)/1000)):null,
    normal_points:score.normal_puzzles||0,
    haha_answer:Number(state.results.final_haha_count)||0,
    haha_points:score.haha_signs||0,
    socks_answer:String(state.results.final_socks||""),
    socks_points:score.green_socks||0,
    joker_photo:state.results.final_photo===true,
    photo_points:score.joker_photo||0,
    final_code_correct:state.results.final_code?.correct===true,
    final_code_attempts:state.results.final_code?.attempts||0,
    final_code_bonus:score.final_code_bonus||0,
    total_score:score.total||0,
    game_data:state.results
  };
  const res=await fetch(SUPABASE_URL+"/rest/v1/team_results",{
    method:"POST",
    headers:{
      "apikey":SUPABASE_PUBLISHABLE_KEY,
      "Authorization":"Bearer "+SUPABASE_PUBLISHABLE_KEY,
      "Content-Type":"application/json",
      "Prefer":"return=minimal"
    },
    body:JSON.stringify(payload)
  });
  if(!res.ok) throw new Error("Result upload failed: "+res.status);
  localStorage.setItem("jh_result_submitted","1");
}

document.getElementById("submit-final-answers").addEventListener("click",async()=>{
  const haha=document.getElementById("haha-count").value.trim();
  const socks=document.getElementById("joker-socks").value.trim();
  const feedback=document.getElementById("debrief-feedback");
  if(haha===""||socks===""){
    feedback.textContent="ANSWER BOTH QUESTIONS BEFORE FINISHING.";
    feedback.className="feedback bad";
    return;
  }
  state.results.final_haha_count=haha;
  state.results.final_socks=socks;
  state.results.final_socks_correct=normalize(socks)==="green";
  state.results.final_haha_correct=haha==="22";
  state.results.score=calculateFinalScore();
  state.results.finished_at=Date.now();
  save();
  feedback.textContent="SUBMITTING FINAL RESULT...";
  feedback.className="feedback";
  try{
    await submitTeamResult();
    state.stage=5;
    save();
    document.getElementById("complete-team").textContent=state.team||"UNKNOWN TEAM";
    show("complete");
  }catch(err){
    feedback.textContent="COULD NOT SEND RESULT — CHECK YOUR INTERNET AND TRY AGAIN.";
    feedback.className="feedback bad";
    console.error(err);
  }
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
