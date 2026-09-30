const screens=[...document.querySelectorAll(".screen")];
const state={team:localStorage.getItem("jh_team")||"",players:Number(localStorage.getItem("jh_players")||0),start:Number(localStorage.getItem("jh_start")||0)};
function show(name){screens.forEach(s=>s.classList.toggle("active",s.id==="screen-"+name));window.scrollTo(0,0)}
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>show(b.dataset.go)));
document.getElementById("team-form").addEventListener("submit",e=>{e.preventDefault();state.team=document.getElementById("team-name").value.trim();state.players=Number(document.getElementById("player-count").value);localStorage.setItem("jh_team",state.team);localStorage.setItem("jh_players",state.players);show("briefing")});
document.getElementById("begin-mission").addEventListener("click",()=>{state.start=Date.now();localStorage.setItem("jh_start",state.start);document.getElementById("active-team").textContent=state.team||"UNKNOWN TEAM";show("mission");tick()});
function tick(){if(!state.start)return;const s=Math.floor((Date.now()-state.start)/1000),h=String(Math.floor(s/3600)).padStart(2,"0"),m=String(Math.floor((s%3600)/60)).padStart(2,"0"),x=String(s%60).padStart(2,"0");document.getElementById("timer").textContent=h+":"+m+":"+x}
setInterval(tick,1000);
const params=new URLSearchParams(location.search);if(params.has("unlock")&&!state.start)show("denied");