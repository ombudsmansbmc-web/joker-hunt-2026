const SUPABASE_URL="https://wbhyezafseewcoxogyzy.supabase.co";
const SUPABASE_KEY="sb_publishable_aFg4-ZXiKZhtOHnxenF2Bg_CCjb7Z3Q";
const TOKEN_KEY="jh_admin_session";

function session(){try{return JSON.parse(localStorage.getItem(TOKEN_KEY)||"null")}catch{return null}}
function saveSession(v){if(v)localStorage.setItem(TOKEN_KEY,JSON.stringify(v));else localStorage.removeItem(TOKEN_KEY)}
function showAdmin(loggedIn){document.getElementById("login-view").hidden=loggedIn;document.getElementById("results-view").hidden=!loggedIn}
function fmtTime(s){if(s==null)return "—";const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return (h?h+":":"")+String(m).padStart(2,"0")+":"+String(sec).padStart(2,"0")}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}

async function login(){
 const email=document.getElementById("admin-email").value.trim(),password=document.getElementById("admin-password").value;
 const f=document.getElementById("login-feedback");f.textContent="SIGNING IN...";
 const r=await fetch(SUPABASE_URL+"/auth/v1/token?grant_type=password",{method:"POST",headers:{"apikey":SUPABASE_KEY,"Content-Type":"application/json"},body:JSON.stringify({email,password})});
 const d=await r.json(); if(!r.ok){f.textContent="SIGN IN FAILED";f.className="feedback error";return}
 saveSession(d);f.textContent="";showAdmin(true);await loadResults();
}
async function refreshTokenIfNeeded(){
 let s=session();if(!s)return null;
 if(s.expires_at && Date.now()/1000 < s.expires_at-30)return s;
 const r=await fetch(SUPABASE_URL+"/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:{"apikey":SUPABASE_KEY,"Content-Type":"application/json"},body:JSON.stringify({refresh_token:s.refresh_token})});
 if(!r.ok){saveSession(null);showAdmin(false);return null}
 s=await r.json();saveSession(s);return s;
}
async function loadResults(){
 const f=document.getElementById("results-feedback");f.textContent="LOADING RESULTS...";
 const s=await refreshTokenIfNeeded();if(!s){f.textContent="";return}
 const cols="team_name,players,total_score,duration_seconds,normal_points,haha_points,socks_points,photo_points,final_code_bonus,final_code_attempts,finished_at";
 const r=await fetch(SUPABASE_URL+"/rest/v1/team_results?select="+encodeURIComponent(cols)+"&order=total_score.desc,duration_seconds.asc",{headers:{"apikey":SUPABASE_KEY,"Authorization":"Bearer "+s.access_token}});
 if(!r.ok){f.textContent="COULD NOT LOAD RESULTS";f.className="feedback error";return}
 const rows=await r.json();const body=document.getElementById("results-body");body.innerHTML="";
 rows.forEach((x,i)=>{const tr=document.createElement("tr");tr.innerHTML=`<td>${i+1}</td><td><strong>${esc(x.team_name)}</strong></td><td>${esc(x.players)}</td><td class="admin-score">${x.total_score??0}/86</td><td>${fmtTime(x.duration_seconds)}</td><td>${x.normal_points??0}/45</td><td>${x.haha_points??0}/10</td><td>${x.socks_points??0}/15</td><td>${x.photo_points??0}/5</td><td>+${x.final_code_bonus??0}</td><td>${x.final_code_attempts??0}</td><td>${x.finished_at?new Date(x.finished_at).toLocaleString():"—"}</td>`;body.appendChild(tr)});
 f.textContent=rows.length+" TEAM"+(rows.length===1?"":"S")+" RECEIVED";f.className="feedback ok";
}
document.getElementById("admin-login").addEventListener("click",()=>login().catch(()=>document.getElementById("login-feedback").textContent="SIGN IN FAILED"));
document.getElementById("admin-password").addEventListener("keydown",e=>{if(e.key==="Enter")document.getElementById("admin-login").click()});
document.getElementById("refresh-results").addEventListener("click",loadResults);
document.getElementById("admin-logout").addEventListener("click",()=>{saveSession(null);showAdmin(false)});
(async()=>{if(session()){showAdmin(true);await loadResults()}else showAdmin(false)})();