(function(){
"use strict";
const $=s=>document.querySelector(s);
const MAXT=5000, LET=["A","B","C","D"];
let curErr="#err", ws=null, me=0, names=["",""], scores=[0,0], phase="home", t0=0, raf=0, locked=false, cur={n:1,final:false}, tm=[];

function show(id){["auth","menu","home","hbbc","tl","cr","lobby","game","end"].forEach(k=>$("#s-"+k).classList.toggle("hidden",k!==id));}
function toast(m){const t=document.createElement("div");t.className="toast";t.textContent=m;document.body.appendChild(t);setTimeout(()=>t.remove(),2600);}
function later(fn,ms){tm.push(setTimeout(fn,ms));}
function clearTm(){tm.forEach(clearTimeout);tm=[];cancelAnimationFrame(raf);}
function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){return null;}}
$("#name").value=store("name")||"";

/* ---- Âm thanh ---- */
let AC=null;
function audio(){try{if(!AC){const C=window.AudioContext||window.webkitAudioContext;if(C)AC=new C();}if(AC&&AC.state==="suspended")AC.resume();}catch(e){}}
function beep(f,d,ty,v,dl){if(!AC)return;try{const o=AC.createOscillator(),g=AC.createGain(),lp=AC.createBiquadFilter();lp.type="lowpass";lp.frequency.value=1400;o.type="sine";o.frequency.value=f;o.connect(g);g.connect(lp);lp.connect(AC.destination);const t=AC.currentTime+(dl||0),vol=(v||.05)*.55,dur=d*1.6;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.03);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.start(t);o.stop(t+dur+.03);}catch(e){}}

/* ---- Kết nối ---- */
function connect(cb){
  if(ws&&ws.readyState===1){cb();return;}
  $(curErr).textContent="Đang kết nối máy chủ…";
  let opened=false;
  try{ws=new WebSocket((location.protocol==="https:"?"wss://":"ws://")+location.host);}catch(e){$(curErr).textContent="Không kết nối được máy chủ.";return;}
  ws.onopen=()=>{opened=true;$(curErr).textContent="";if(user&&user.token)ws.send(JSON.stringify({t:"auth",token:user.token}));cb();};
  ws.onmessage=e=>{let d;try{d=JSON.parse(e.data);}catch{return;}handle(d);};
  ws.onclose=()=>{
    if(!opened){$(curErr).textContent="Không kết nối được máy chủ. Máy chủ miễn phí có thể cần ~30 giây để thức dậy, hãy thử lại.";return;}
    if(mp){toast("Mất kết nối với máy chủ");mp=null;TL=null;clearTimeout(hT);clearInterval(hCd);show("menu");return;}
    if(phase!=="home"){toast("Mất kết nối với máy chủ");goHome();}
  };
}
function send(o){if(ws&&ws.readyState===1)ws.send(JSON.stringify(o));}
function goHome(){clearTm();phase="home";document.body.classList.remove("final");show("home");}

$("#b-create").onclick=()=>{audio();const n=$("#name").value.trim();store("name",n);connect(()=>send({t:"create",name:n}));};
$("#b-join").onclick=join;
document.querySelectorAll("[data-bot]").forEach(b=>{b.onclick=()=>{audio();const n=$("#name").value.trim();store("name",n);connect(()=>send({t:"bot",level:b.dataset.bot,name:n}));};});
$("#code").addEventListener("keydown",e=>{if(e.key==="Enter")join();});
function join(){
  audio();
  const c=$("#code").value.trim().toUpperCase();
  if(c.length!==4){$("#err").textContent="Mã phòng gồm 4 chữ cái.";return;}
  const n=$("#name").value.trim();store("name",n);
  connect(()=>send({t:"join",code:c,name:n}));
}
$("#b-cancel").onclick=()=>{send({t:"leave"});goHome();};
$("#b-share").onclick=async()=>{
  const code=$("#l-code").textContent;
  const text="Vào chơi Var Nhau với mình! Mã phòng: "+code+"\n"+location.origin;
  try{if(navigator.share){await navigator.share({text});return;}}catch(e){return;}
  try{await navigator.clipboard.writeText(text);toast("Đã sao chép lời mời");}catch(e){toast("Mã phòng: "+code);}
};
$("#b-again").onclick=()=>{send({t:"again"});$("#b-again").disabled=true;$("#b-again").textContent="Chờ đối thủ…";};
$("#b-home").onclick=()=>{send({t:"leave"});goHome();};

/* ---- Xử lý tin nhắn từ máy chủ ---- */
function handle(d){
  if(d.t==="c:msg"||d.t==="c:emo"||d.t==="c:slow")return onChat(d);
  if(d.t==="w:upd")return onWallet(d.wallet,d.gain,d.why);
  if(d.t==="auth:ok")return setWallet(d.wallet);
  if(d.t==="auth:fail")return onAuthFail();
  if(d.t.startsWith("v:"))return voiceHandle(d);
  if(/^(m|tl|hb|cr):/.test(d.t))return mpHandle(d);
  switch(d.t){
    case "err": $("#err").textContent=d.msg||"Có lỗi xảy ra."; break;
    case "room":
      me=d.you;names=d.names;vnCode=d.code;botRoom=!!d.bot;vnFull=!!d.full;vnAvs=d.avs||[];
      if(phase==="home"){phase="lobby";if(!d.bot)show("lobby");}
      $("#l-code").textContent=d.code;
      $("#l-wait").textContent=d.full?"Đối thủ đã vào, sắp bắt đầu…":"Đang chờ người chơi thứ hai nhập mã này…";
      $("#l-wait").classList.toggle("pulse",!d.full);
      break;
    case "round": onRound(d); break;
    case "q": onQ(d); break;
    case "opp":
      if(phase==="play"&&!locked){$("#feed").innerHTML="";const w=document.createElement("div");w.className="warn";w.textContent="Đối thủ đã chốt! Nhanh lên!";$("#feed").appendChild(w);}
      break;
    case "result": onResult(d); break;
    case "end": onEnd(d); break;
    case "rematch": if(phase==="end")toast("Đối thủ muốn chơi lại!"); break;
    case "left": toast("Đối thủ đã thoát phòng");goHome(); break;
  }
}

function setRound(){
  const r=$("#g-rd");r.textContent="Câu "+cur.n+"/5";
  if(cur.final){const x=document.createElement("span");x.className="x2";x.textContent="x2";r.appendChild(x);}
}
function setScores(sc,pop){
  $("#g-n0").textContent=names[me];$("#g-n1").textContent=names[1-me];
  $("#g-a0").innerHTML=avHtml(curAv(),26);$("#g-a1").innerHTML=avHtml(vnAvs[1-me]||"a0",26);
  $("#g-s0").textContent=sc[me];$("#g-s1").textContent=sc[1-me];
  if(pop){const s=$("#g-s0");s.classList.remove("pop");void s.offsetWidth;s.classList.add("pop");}
}
function buildAnswers(){
  const box=$("#answers");box.innerHTML="";
  for(let k=0;k<4;k++){
    const b=document.createElement("button");b.className="ans";b.disabled=true;
    b.innerHTML='<span class="ch"></span><span class="t"></span>';
    b.querySelector(".ch").textContent=LET[k];
    b.addEventListener("pointerdown",ev=>{ev.preventDefault();pick(k);});
    box.appendChild(b);
  }
}
function btns(){return Array.from(document.querySelectorAll("#answers .ans"));}

function onRound(d){
  clearTm();phase="intro";locked=true;cur={n:d.n,final:d.final};
  document.body.classList.toggle("final",d.final);
  show("game");buildAnswers();setRound();setScores(d.scores,false);
  $("#bar").style.setProperty("--f",1);$("#pot").textContent="";$("#feed").textContent="";
  if(d.final){const w=document.createElement("div");w.className="warn";w.textContent="Câu cuối: điểm nhân đôi!";$("#feed").appendChild(w);}
  const q=$("#q");
  let c=3;
  (function tick(){
    if(c>0){q.className="qtext count";q.style.animation="none";void q.offsetWidth;q.style.animation="";q.textContent=String(c);beep(440,.12,"sine",.04);c--;later(tick,650);}
    else{q.className="qtext";q.textContent="Sẵn sàng…";}
  })();
}
function onQ(d){
  clearTm();phase="play";locked=false;cur={n:d.n,final:d.final};
  $("#q").className="qtext";$("#q").textContent=d.q;$("#feed").textContent="";
  btns().forEach((b,k)=>{b.disabled=false;b.querySelector(".t").textContent=d.opts[k];});
  beep(587,.18,"sine",.06);
  t0=performance.now();raf=requestAnimationFrame(loop);
}
function loop(){
  if(phase!=="play")return;
  const t=performance.now()-t0;
  if(t>=MAXT){$("#bar").style.setProperty("--f",0);btns().forEach(b=>b.disabled=true);if(!locked)$("#pot").textContent="Hết giờ!";return;}
  const f=1-t/MAXT;
  $("#bar").style.setProperty("--f",f.toFixed(4));
  if(!locked){const st=Math.min(4,Math.floor(t/1000));$("#pot").textContent="+"+Math.round(200*(cur.final?2:1)*(1-0.1*st));}
  raf=requestAnimationFrame(loop);
}
function pick(k){
  if(phase!=="play"||locked)return;
  const ms=performance.now()-t0;if(ms>=MAXT)return;
  locked=true;
  send({t:"ans",idx:k,ms:Math.round(ms)});
  btns().forEach((b,i)=>{b.disabled=true;if(i===k)b.classList.add("sel");});
  $("#pot").textContent="";
  $("#feed").textContent="Đã chốt, chờ đối thủ…";
  beep(494,.1,"sine",.05);
}
function onResult(d){
  cancelAnimationFrame(raf);phase="reveal";
  const mine=d.res[me],theirs=d.res[1-me];
  btns().forEach((b,k)=>{
    b.disabled=true;b.classList.remove("sel");
    if(k===d.ci)b.classList.add("correct");
    else if(mine&&k===mine.idx)b.classList.add("wrong");
    else b.classList.add("dim");
  });
  $("#bar").style.setProperty("--f",0);$("#pot").textContent="";
  const f=$("#feed");f.innerHTML="";
  const a=document.createElement("div");
  if(mine&&mine.ok){a.className="good";f.className="feed good";const l=document.createElement("span");l.className="me-l";l.textContent="+"+mine.pts;const s=document.createElement("small");s.textContent=" ("+(mine.t/1000).toFixed(2)+"s)";l.appendChild(s);f.appendChild(l);}
  else{f.className="feed";const l=document.createElement("div");l.className="bad";l.textContent=mine?"Sai rồi, +0":"Hết giờ, +0";f.appendChild(l);}
  const o=document.createElement("small");
  o.textContent=names[1-me]+": "+(theirs?(theirs.ok?"+"+theirs.pts+" ("+(theirs.t/1000).toFixed(2)+"s)":"sai"):"không kịp trả lời");
  f.appendChild(o);
  setScores(d.scores,!!(mine&&mine.ok));
  if(mine&&mine.ok){beep(523,.14,"sine",.06);beep(659,.22,"sine",.06,.12);}else{beep(220,.3,"sine",.045);}
}
function onEnd(d){
  clearTm();phase="end";document.body.classList.remove("final");
  names=d.names;
  const my=d.scores[me],op=d.scores[1-me];
  const title=$("#e-title");
  if(my===op){title.textContent="Hòa nhau!";title.style.color="var(--gold)";}
  else if(my>op){title.textContent="Bạn thắng! 🎉";title.style.color="var(--ok)";}
  else{title.textContent="Đối thủ thắng";title.style.color="var(--op)";}
  $("#e-sub").textContent=my===op?"Hai bạn ngang tài ngang sức.":"Chênh lệch "+Math.abs(my-op)+" điểm.";
  const bd=$("#e-board");bd.innerHTML="";
  [me,1-me].forEach((p,i)=>{
   const c=document.createElement("div");c.className="pbox c"+i+(d.scores[p]>d.scores[1-p]?" win":"");
    const n=document.createElement("div");n.className="n";n.textContent=(d.scores[p]>d.scores[1-p]?"👑 ":"")+d.names[p]+(p===me?" (bạn)":"");
    const s=document.createElement("div");s.className="s";s.textContent=d.scores[p];
    c.append(n,s);bd.appendChild(c);
  });
  const lg=$("#e-log");lg.innerHTML="";
  const h=document.createElement("div");h.className="row";
  ["Câu","Bạn","Đối thủ"].forEach((t,i)=>{const c=document.createElement("div");if(i)c.className="c";c.textContent=t;h.appendChild(c);});
  lg.appendChild(h);
  d.log.forEach((e,i)=>{
    const r=document.createElement("div");r.className="row";
    const l=document.createElement("div");l.textContent=(i+1)+(e.final?" x2":"");if(e.final)l.className="fin";r.appendChild(l);
    [me,1-me].forEach(p=>{
      const x=e.res[p],c=document.createElement("div");
      c.className="c "+(x&&x.ok?"ok":"no");
      c.textContent=x?(x.ok?"+"+x.pts+" ("+(x.t/1000).toFixed(1)+"s)":"Sai"):"Hết giờ";
      r.appendChild(c);
    });
    lg.appendChild(r);
  });
  $("#b-again").disabled=false;$("#b-again").textContent="Chơi lại";
  show("end");$("#s-end").scrollTop=0;
  if(my>=op)[392,494,587,784].forEach((f,i)=>beep(f,.2,"sine",.05,i*.14));
}

/* Bàn phím (khi chơi trên máy tính) */
document.addEventListener("keydown",e=>{
  if(phase!=="play")return;
  const m={KeyA:0,KeyS:1,KeyD:2,KeyF:3,Digit1:0,Digit2:1,Digit3:2,Digit4:3}[e.code];
  if(m!==undefined&&!(e.target&&e.target.tagName==="INPUT")){e.preventDefault();pick(m);}
});

/* ---- Tài khoản, menu, Đuổi hình bắt chữ ---- */
let user=null, mode="login", W=null;
async function api(path,body){
  const h={"Content-Type":"application/json"};if(user&&user.token)h.Authorization="Bearer "+user.token;
  let r;try{r=await fetch(path,{method:body===undefined?"GET":"POST",headers:h,body:body===undefined?undefined:JSON.stringify(body)});}
  catch(e){throw new Error("Không kết nối được máy chủ. Máy chủ miễn phí có thể cần ~1 phút để thức dậy, hãy thử lại.");}
  let j={};try{j=await r.json();}catch(e){}
  if(!r.ok){const er=new Error(j.error||"Có lỗi xảy ra.");er.status=r.status;throw er;}
  return j;
}
function saveUser(){if(user)store("user",JSON.stringify(user));}
function setUser(u){
  user=u;W=u.guest?null:(u.wallet||null);saveUser();
  $("#name").value=u.name;store("name",u.name);
  $("#m-hi").textContent="Xin chào, "+u.name+(u.guest?" (khách)":"")+" 👋";
  profileRefresh();show("menu");
}
function doLogout(){voiceStop(true);store("user","");user=null;W=null;show("auth");}
function setMode(m){mode=m;$("#a-t-login").classList.toggle("on",m==="login");$("#a-t-reg").classList.toggle("on",m==="register");$("#a-pw2w").classList.toggle("hidden",m!=="register");$("#a-go").textContent=m==="login"?"Đăng nhập":"Đăng ký";$("#a-err").textContent="";}
$("#a-t-login").onclick=()=>setMode("login");
$("#a-t-reg").onclick=()=>setMode("register");
$("#a-go").onclick=async()=>{
  audio();
  const n=$("#a-user").value.trim(),p=$("#a-pw").value,e=$("#a-err");e.textContent="";
  if(n.length<2){e.textContent="Tên cần ít nhất 2 ký tự.";return;}
  if(p.length<4){e.textContent="Mật khẩu cần ít nhất 4 ký tự.";return;}
  if(mode==="register"&&p!==$("#a-pw2").value){e.textContent="Hai mật khẩu chưa giống nhau.";return;}
  const btn=$("#a-go");btn.disabled=true;e.textContent="Đang xử lý…";
  try{
    const r=await api(mode==="register"?"/api/register":"/api/login",{name:n,password:p});
    $("#a-pw").value="";$("#a-pw2").value="";e.textContent="";
    setUser({name:r.wallet.name,token:r.token,wallet:r.wallet});
  }catch(er){e.textContent=er.message;}
  btn.disabled=false;
};
$("#a-pw").addEventListener("keydown",e=>{if(e.key==="Enter")$("#a-go").click();});
$("#a-guest").onclick=()=>{audio();setUser({name:"Khách"+(100+Math.floor(Math.random()*900)),guest:true});};
$("#m-vn").onclick=()=>{phase="home";curErr="#err";show("home");};
$("#m-hb").onclick=()=>{audio();hbStart();};
$("#m-out").onclick=doLogout;
$("#b-menu").onclick=()=>show("menu");

/* ---- Phòng nhiều người: Tiến lên, Đuổi hình bắt chữ ---- */
let mp=null,TL=null,hT=0,hCd=0;
const tlSel=new Set();
const myName=()=>(user&&user.name)||$("#name").value.trim();
function mpSend(errSel,msg){curErr=errSel;$(errSel).textContent="";connect(()=>send(msg));}
async function shareText(text,code){try{if(navigator.share){await navigator.share({text});return;}}catch(e){return;}try{await navigator.clipboard.writeText(text);toast("Đã sao chép lời mời");}catch(e){toast("Mã phòng: "+code);}}
const view=(p,ids,id)=>ids.forEach(k=>$("#"+p+"-"+k).classList.toggle("hidden",k!==id));
const tlView=id=>view("t",["setup","lobby","game","end"],id),hbView=id=>view("h",["setup","lobby","play","end"],id);
function toMenu(){crStop();if(mp)send({t:"m:leave"});mp=null;TL=null;clearTimeout(hT);clearInterval(hCd);show("menu");}
function joinRoom(game,inp,err){audio();const c=$(inp).value.trim().toUpperCase();if(c.length!==4){$(err).textContent="Mã phòng gồm 4 chữ cái.";return;}mpSend(err,{t:"m:join",game,code:c,name:myName()});}
$("#m-tl").onclick=()=>{audio();mp=null;TL=null;tlView("setup");$("#t-err").textContent="";show("tl");};
$("#m-hb").onclick=()=>{audio();mp=null;clearTimeout(hT);clearInterval(hCd);hbView("setup");$("#h-err").textContent="";show("hbbc");};
$("#t-back").onclick=$("#h-back").onclick=$("#t-home").onclick=$("#h-home").onclick=toMenu;
document.querySelectorAll("[data-tl]").forEach(b=>{b.onclick=()=>{audio();mpSend("#t-err",{t:"m:create",game:"tl",name:myName(),n:+b.dataset.tl});};});
$("#t-join").onclick=()=>joinRoom("tl","#t-codein","#t-err");
$("#t-codein").addEventListener("keydown",e=>{if(e.key==="Enter")$("#t-join").click();});
$("#h-create").onclick=()=>{audio();mpSend("#h-err",{t:"m:create",game:"hb",name:myName()});};
$("#h-join").onclick=()=>joinRoom("hb","#h-codein","#h-err");
$("#h-codein").addEventListener("keydown",e=>{if(e.key==="Enter")$("#h-join").click();});
$("#t-share").onclick=()=>{if(mp)shareText("Vào chơi Tiến lên với mình! Mã phòng: "+mp.code+"\n"+location.origin,mp.code);};
$("#h-share").onclick=()=>{if(mp)shareText("Vào chơi Đuổi Hình Bắt Chữ với mình! Mã phòng: "+mp.code+"\n"+location.origin,mp.code);};

function mpHandle(d){
  switch(d.t){
    case "m:err":toast(d.msg);$(curErr).textContent=d.msg;break;
    case "m:room":onMRoom(d);break;
    case "m:left":toast(d.name+" đã thoát phòng");mp=null;TL=null;clearTimeout(hT);clearInterval(hCd);show("menu");break;
    case "m:rematch":toast("Mọi người muốn chơi lại!");break;
    case "tl:state":onTlState(d);break;
    case "tl:end":onTlEnd(d);break;
    case "hb:q":onHbQ(d);break;
    case "hb:no":{const f=$("#h-feed");f.style.color="var(--bad)";f.textContent="Chưa đúng, thử lại nhé!";beep(247,.2,"sine",.035);break;}
    case "hb:hint":if(hbRound)$("#h-blanks").textContent=hbBl(hbRound.w,d.f);break;
    case "hb:res":onHbRes(d);break;
    case "hb:end":onHbEnd(d);break;
    case "cr:state":onCrState(d);break;
  }
}
function onMRoom(d){
  mp={game:d.game,code:d.code,you:d.you,names:d.names,avs:d.avs||[],max:d.max};
  const p={tl:"t",hb:"h",cr:"c"}[d.game];
  $("#"+p+"-code").textContent=d.code;
  $("#"+p+"-wait").textContent=d.full?"Đủ người rồi, sắp bắt đầu…":"Đã có "+d.names.length+"/"+d.max+" người. Đang chờ thêm người nhập mã này…";
  $("#"+p+"-wait").classList.toggle("pulse",!d.full);
  if(d.game==="tl"){tlView("lobby");show("tl");}else if(d.game==="cr"){crView("lobby");show("cr");}else{hbView("lobby");show("hbbc");}
}

/* ---- Tiến lên ---- (lá bài là số 0..51: hạng*4+chất) */
const RK=["3","4","5","6","7","8","9","10","J","Q","K","A","2"],ST=["♠","♣","♦","♥"];
const esc=s=>String(s).replace(/[<>&"]/g,"");
function cls(ids){
  const n=ids.length;if(!n)return null;
  const a=ids.slice().sort((x,y)=>x-y),r=a.map(x=>x>>2),key=a[n-1];
  if(n<=4&&r.every(x=>x===r[0]))return{type:["single","pair","triple","quad"][n-1],len:n,key,two:r[0]===12};
  if(n>=3&&r.every((x,i)=>x<12&&(i===0||x===r[i-1]+1)))return{type:"straight",len:n,key};
  if(n>=6&&n%2===0){for(let i=0;i<n;i+=2){if(r[i]!==r[i+1]||r[i]>=12||(i>0&&r[i]!==r[i-2]+1))return null;}return{type:"pairthru",len:n/2,key};}
  return null;
}
function beats(p,c){
  if(c.type===p.type&&c.len===p.len)return c.key>p.key;
  if(p.type==="single"&&p.two)return c.type==="quad"||(c.type==="pairthru"&&c.len>=3);
  if(p.type==="pair"&&p.two)return c.type==="quad"||(c.type==="pairthru"&&c.len>=4);
  if(p.type==="pairthru"&&p.len===3)return c.type==="quad"||(c.type==="pairthru"&&c.len>=4);
  if(p.type==="quad")return c.type==="pairthru"&&c.len>=4;
  return false;
}
function cardEl(id,x){const s=id&3;return'<div class="pc'+(s>=2?" red":"")+(x||"")+'"><b>'+RK[id>>2]+"</b><i>"+ST[s]+"</i></div>";}
function onTlState(d){
  const prev=TL&&TL.last?TL.last.ids.join():"";
  TL=d;TL.over=false;
  Array.from(tlSel).forEach(id=>{if(!d.hand.includes(id))tlSel.delete(id);});
  $("#t-again").disabled=false;$("#t-again").textContent="Chơi lại";
  tlView("game");show("tl");
  if(d.last&&d.last.ids.join()!==prev)beep(392,.1,"sine",.05);
  tlRender();
}
function tlRender(){
  const T=TL;if(!T)return;const my=T.turn===T.you&&!T.over;
  $("#t-opps").innerHTML=T.names.map((nm,i)=>i===T.you?"":'<div class="opp'+(T.turn===i&&!T.over?" on":"")+(T.passed[i]?" ps":"")+'">'+avHtml(tlAv(i),30)+'<b>'+esc(nm)+"</b><span>🂠 "+T.counts[i]+"</span><em>"+(T.passed[i]?"bỏ lượt":(T.turn===i&&!T.over?"đang nghĩ…":""))+"</em></div>").join("");
  $("#t-table").innerHTML=T.last?"<span>"+esc(T.names[T.last.by])+(T.last.by===T.you?" (bạn)":"")+' đánh</span><div class="cs">'+T.last.ids.map(id=>cardEl(id," mini")).join("")+"</div>":"<span>Vòng mới: "+esc(T.names[T.turn])+(T.turn===T.you?" (bạn)":"")+" đi đầu</span>";
  $("#t-msg").textContent=T.over?"":(my?(T.last?"Đến lượt bạn: chặt hoặc bỏ lượt":"Bạn đi đầu: chọn bài rồi bấm Đánh"):"Đang chờ "+T.names[T.turn]+"…");
  $("#t-hand").innerHTML=T.hand.map(id=>cardEl(id,tlSel.has(id)?" sel":"").replace("<div",'<div data-id="'+id+'"')).join("");
  $("#t-hand").querySelectorAll(".pc").forEach(el=>{el.onclick=()=>{if(!my)return;const id=+el.dataset.id;tlSel.has(id)?tlSel.delete(id):tlSel.add(id);beep(494,.06,"sine",.03);tlRender();};});
  ["#t-play","#t-pass","#t-clear"].forEach(s=>{$(s).disabled=!my;});
}
$("#t-play").onclick=()=>{
  if(!TL||TL.over||TL.turn!==TL.you)return;
  const ids=TL.hand.filter(id=>tlSel.has(id));
  if(!ids.length)return toast("Chọn bài trước đã nhé.");
  const c=cls(ids);if(!c)return toast("Bộ bài không hợp lệ.");
  if(TL.last&&!beats(cls(TL.last.ids),c))return toast("Bài chưa đủ lớn để chặt.");
  tlSel.clear();send({t:"tl:play",ids});
};
$("#t-pass").onclick=()=>{if(!TL||TL.over||TL.turn!==TL.you)return;if(!TL.last)return toast("Bạn đang đi đầu, hãy đánh một bộ.");tlSel.clear();send({t:"tl:pass"});};
$("#t-clear").onclick=()=>{tlSel.clear();tlRender();};
function onTlEnd(d){
  if(!TL)return;TL.over=true;tlRender();
  const rows=d.names.map((nm,i)=>({nm,l:d.counts[i]})).sort((a,b)=>a.l-b.l);
  $("#t-title").textContent=d.winner===TL.you?"Bạn thắng! 🎉":esc(d.names[d.winner])+" thắng";
  $("#t-rank").innerHTML=rows.map((r,k)=>'<div class="row2">'+(k+1)+". "+esc(r.nm)+(r.l?" — còn "+r.l+" lá":" — hết bài")+"</div>").join("");
  tlView("end");
  if(d.winner===TL.you)[523,659,784].forEach((f,i)=>beep(f,.2,"sine",.05,i*.14));
}
$("#t-again").onclick=()=>{send({t:"m:again"});$("#t-again").disabled=true;$("#t-again").textContent="Chờ mọi người…";};

/* ---- Đuổi hình bắt chữ ---- */
const HB=[
 {e:["☀️","🌻"],a:["hoa hướng dương","hướng dương"]},
 {e:["🚒","🔥"],a:["xe cứu hỏa","cứu hỏa"]},
 {e:["🎂","🕯️","🎉"],a:["sinh nhật","bánh sinh nhật","tiệc sinh nhật"]},
 {e:["🌧️","☀️","🌈"],a:["cầu vồng"]},
 {e:["🦁","👑"],a:["vua sư tử","sư tử"]},
 {e:["🏖️","🌊","☀️"],a:["bãi biển","biển","đi biển"]},
 {e:["📚","🏫","🎒"],a:["đi học","trường học","học sinh","học"]},
 {e:["🔔","🎄","🎅"],a:["giáng sinh","noel","lễ giáng sinh"]},
 {e:["🏮","🌕","🥮"],a:["trung thu","tết trung thu","bánh trung thu"]},
 {e:["🎤","🎶","😀"],a:["ca hát","hát","karaoke","ca sĩ"]},
 {e:["🐼","🎋"],a:["gấu trúc","panda"]},
 {e:["🚀","🌌"],a:["vũ trụ","du hành vũ trụ","tên lửa"]},
 {e:["🐢","🐇","🏁"],a:["rùa và thỏ","thỏ và rùa","rùa thỏ","thỏ rùa","cuộc đua"]},
 {e:["⛈️","⚡"],a:["sấm sét","sấm chớp","sét","giông bão","bão"]}
];
const hnorm=s=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/[^a-z0-9]/g,"");
let hq=[],hi=0,hs=0,hh=false,hlock=false,hbMode="solo",hbRound=null;
const hbTiles=a=>a.map((x,k)=>(k?'<span class="eplus">+</span>':"")+'<div class="etile" style="animation-delay:'+(k*.2)+'s">'+x+"</div>").join("");
const hbBl=(w,f)=>w.map((n,k)=>Array.from({length:n},(_,i)=>f&&i===0?f[k].toUpperCase():"_").join(" ")).join("   ");
const hbWords=a=>a.split(" ").map(x=>Array.from(x).length),hbFirsts=a=>a.split(" ").map(x=>Array.from(x)[0]);
function hbSolo(){hbMode="solo";hbRound=null;clearTimeout(hT);clearInterval(hCd);hq=HB.slice().sort(()=>Math.random()-.5).slice(0,8);hi=0;hs=0;$("#h-hint").classList.remove("hidden");$("#h-skip").classList.remove("hidden");show("hbbc");hbView("play");hbShow();}
$("#h-solo").onclick=()=>{audio();hbSolo();};
function hbShow(){
  if(hi>=hq.length){claimOffline("hb",{score:hs});$("#h-title").textContent="Hoàn thành!";$("#h-final").textContent=hs+" / "+hq.length*10;$("#h-again").disabled=false;$("#h-again").textContent="Chơi lại";hbView("end");return;}
  hh=false;hlock=false;const p=hq[hi];
  $("#h-n").textContent="Câu "+(hi+1)+"/"+hq.length;$("#h-s").textContent="Điểm: "+hs;
  $("#h-emo").classList.remove("win");$("#h-emo").innerHTML=hbTiles(p.e);$("#h-blanks").textContent=hbBl(hbWords(p.a[0]));
  $("#h-in").value="";$("#h-in").disabled=false;$("#h-feed").textContent="";$("#h-hint").disabled=false;
}
function hbNext(ms){hlock=true;hT=setTimeout(()=>{hi++;hbShow();},ms);}
function hbCheck(){
  const raw=$("#h-in").value.trim();
  if(hbMode==="room"){if(raw&&!hlock)send({t:"hb:ans",text:raw});return;}
  if(hlock)return;const v=hnorm(raw);if(!v)return;const f=$("#h-feed");
  if(hq[hi].a.some(x=>hnorm(x)===v)){
    const p=hh?5:10;hs+=p;$("#h-s").textContent="Điểm: "+hs;
    $("#h-emo").classList.add("win");f.style.color="var(--ok)";f.textContent="Chính xác! +"+p;beep(659,.18,"sine",.05);hbNext(900);
  }else{f.style.color="var(--bad)";f.textContent="Chưa đúng, thử lại nhé!";beep(247,.2,"sine",.035);}
}
$("#h-ok").onclick=hbCheck;
$("#h-in").addEventListener("keydown",e=>{if(e.key==="Enter")hbCheck();});
$("#h-hint").onclick=()=>{if(hbMode!=="solo"||hlock||hh)return;hh=true;const a=hq[hi].a[0];$("#h-blanks").textContent=hbBl(hbWords(a),hbFirsts(a));$("#h-hint").disabled=true;};
$("#h-skip").onclick=()=>{if(hbMode!=="solo"||hlock)return;const f=$("#h-feed");f.style.color="var(--muted)";f.textContent="Đáp án: "+hq[hi].a[0];hbNext(1400);};
$("#h-again").onclick=()=>{if(hbMode==="room"){send({t:"m:again"});$("#h-again").disabled=true;$("#h-again").textContent="Chờ đối thủ…";}else hbSolo();};
/* chế độ 2 người (qua phòng) */
function hbScore(sc){if(mp)$("#h-s").textContent="Bạn "+sc[mp.you]+" – "+sc[1-mp.you]+" "+esc(mp.names[1-mp.you]);}
function hbTick(){if(!hbRound)return;const l=Math.max(0,Math.ceil((hbRound.end-Date.now())/1000));$("#h-n").textContent="Câu "+hbRound.n+"/"+hbRound.total+" · "+l+"s";}
function onHbQ(d){
  if(!mp)return;hbMode="room";hlock=false;hbRound={n:d.n,total:d.total,w:d.w,end:Date.now()+d.ms};
  $("#h-hint").classList.add("hidden");$("#h-skip").classList.add("hidden");
  $("#h-again").disabled=false;$("#h-again").textContent="Chơi lại";
  show("hbbc");hbView("play");hbScore(d.scores);
  $("#h-emo").classList.remove("win");$("#h-emo").innerHTML=hbTiles(d.e);$("#h-blanks").textContent=hbBl(d.w);
  $("#h-in").value="";$("#h-in").disabled=false;$("#h-feed").textContent="";
  clearInterval(hCd);hCd=setInterval(hbTick,250);hbTick();
}
function onHbRes(d){
  if(!mp)return;clearInterval(hCd);hlock=true;$("#h-in").disabled=true;hbScore(d.scores);
  const f=$("#h-feed");$("#h-blanks").textContent=d.answer.toUpperCase();
  if(d.winner===mp.you){$("#h-emo").classList.add("win");f.style.color="var(--ok)";f.textContent="Chính xác! +10";beep(659,.18,"sine",.05);}
  else if(d.winner>=0){f.style.color="var(--bad)";f.textContent=esc(mp.names[d.winner])+" đã đoán đúng trước!";beep(247,.2,"sine",.035);}
  else{f.style.color="var(--muted)";f.textContent="Hết giờ! Không ai đoán được.";}
}
function onHbEnd(d){
  if(!mp)return;clearInterval(hCd);const a=d.scores[mp.you],b=d.scores[1-mp.you];
  $("#h-title").textContent=a>b?"Bạn thắng! 🎉":a<b?esc(mp.names[1-mp.you])+" thắng":"Hòa nhau!";
  $("#h-final").textContent=a+" – "+b;hbView("end");
  if(a>=b)[392,494,587].forEach((f,i)=>beep(f,.2,"sine",.05,i*.14));
}

/* ---- Cờ Ca Rô ---- */
/*CR-ENGINE-START*/
const CN=15,CD4=[[0,1],[1,0],[1,1],[1,-1]];
const crIn=(r,c)=>r>=0&&c>=0&&r<CN&&c<CN;
function crWinLine(b,r,c,v){
  for(const [dr,dc] of CD4){
    const line=[[r,c]];
    for(const s of [1,-1]){let rr=r+dr*s,cc=c+dc*s;while(crIn(rr,cc)&&b[rr*CN+cc]===v){line.push([rr,cc]);rr+=dr*s;cc+=dc*s;}}
    if(line.length>=5)return line;
  }
  return null;
}
function crPat(b,r,c,p){
  let s=0;
  for(const [dr,dc] of CD4){
    let n=1,open=0;
    for(const g of [1,-1]){let rr=r+dr*g,cc=c+dc*g;while(crIn(rr,cc)&&b[rr*CN+cc]===p){n++;rr+=dr*g;cc+=dc*g;}if(crIn(rr,cc)&&b[rr*CN+cc]===0)open++;}
    if(n>=5)s+=1e6;else if(open>0)s+=({4:[0,1e3,1e4],3:[0,100,1e3],2:[0,10,100],1:[0,1,10]})[n][open];
  }
  return s;
}
function crAiPick(b,me,level){
  const op=3-me,cfg=({easy:{atk:1,def:.5,noise:.7,miss:.4,top:5},medium:{atk:1,def:.95,noise:.15,miss:0,top:2},hard:{atk:1.1,def:1.1,noise:.02,miss:0,top:1}})[level]||{atk:1,def:.95,noise:.15,miss:0,top:2};
  let any=false;const cand=[];
  for(let r=0;r<CN;r++)for(let c=0;c<CN;c++){
    if(b[r*CN+c]){any=true;continue;}
    let near=false;
    for(let dr=-2;dr<=2&&!near;dr++)for(let dc=-2;dc<=2;dc++){const rr=r+dr,cc=c+dc;if(crIn(rr,cc)&&b[rr*CN+cc]){near=true;break;}}
    if(near)cand.push([r,c]);
  }
  if(!any){const m=CN>>1;return [m+Math.floor(Math.random()*3)-1,m+Math.floor(Math.random()*3)-1];}
  if(!cand.length){for(let r=0;r<CN;r++)for(let c=0;c<CN;c++)if(!b[r*CN+c])return [r,c];return null;}
  const sc=cand.map(([r,c])=>({r,c,a:crPat(b,r,c,me),d:crPat(b,r,c,op)}));
  const win=sc.find(x=>x.a>=1e6);if(win)return [win.r,win.c];
  if(Math.random()>=cfg.miss){const blk=sc.find(x=>x.d>=1e6);if(blk)return [blk.r,blk.c];}
  sc.forEach(x=>{const mid=(7-Math.abs(x.r-7))+(7-Math.abs(x.c-7));const base=x.a*cfg.atk+x.d*cfg.def+mid*.5;x.s=base*(1+(Math.random()*2-1)*cfg.noise);});
  sc.sort((x,y)=>y.s-x.s);
  const pick=sc[Math.floor(Math.random()*Math.min(cfg.top,sc.length))];
  return [pick.r,pick.c];
}
/*CR-ENGINE-END*/

let CR=null,crT=0,crAI=null;
const CRN={easy:"Dễ",medium:"Vừa",hard:"Khó"};
const crView=id=>view("c",["setup","lobby","play"],id);
function crStop(){clearTimeout(crT);crT=0;crAI=null;CR=null;}
function crBuild(){
  const bd=$("#c-board");if(bd.children.length)return;
  for(let k=0;k<CN*CN;k++){const b=document.createElement("button");b.type="button";b.className="cc";b.dataset.k=k;b.setAttribute("aria-label","Hàng "+(Math.floor(k/CN)+1)+", cột "+(k%CN+1));bd.appendChild(b);}
  bd.addEventListener("click",e=>{const b=e.target.closest(".cc");if(b)crClick(+b.dataset.k);});
}
function crRender(){
  const S=CR;if(!S)return;crBuild();
  const cells=$("#c-board").children,ls=new Set((S.line||[]).map(p=>p[0]*CN+p[1])),li=S.last?S.last[0]*CN+S.last[1]:-1;
  for(let k=0;k<cells.length;k++){const v=S.board[k],el=cells[k],t=v===1?"X":v===2?"O":"";if(el.textContent!==t)el.textContent=t;el.className="cc"+(v===1?" x":v===2?" o":"")+(k===li?" last":"")+(ls.has(k)?" win":"");}
  const me=S.you,op=1-me;
  [[0,me],[1,op]].forEach(([slot,pl])=>{
    const el=$("#c-p"+slot);el.classList.toggle("on",!S.over&&S.turn===pl);
    const mk=el.querySelector(".mk");mk.textContent=pl===0?"X":"O";mk.className="mk "+(pl===0?"x":"o");
    el.querySelector(".avs").innerHTML=avHtml((S.avs&&S.avs[pl])||"a0",26);
    el.querySelector(".nm").textContent=(slot===0?"Bạn · ":"")+esc(S.names[pl]);
    el.querySelector(".w").textContent=S.wins[pl];
  });
  const st=$("#c-st"),en=$("#c-end");
  if(S.over){
    st.textContent="";en.classList.remove("hidden");
    $("#c-title").textContent=S.winner===me?"Bạn thắng! 🎉":S.winner===-1?"Hòa nhau!":esc(S.names[op])+" thắng";
    $("#c-title").style.color=S.winner===me?"var(--ok)":S.winner===-1?"var(--gold)":"var(--op)";
    $("#c-sc").textContent="Tỉ số: "+S.wins[me]+" – "+S.wins[op];
  }else{
    en.classList.add("hidden");
    st.textContent=S.turn===me?"Đến lượt bạn":"Đợi "+esc(S.names[op])+"…";
    $("#c-again").disabled=false;$("#c-again").textContent="Chơi lại";
  }
}
function onCrState(d){
  const wasOver=!!(CR&&CR.over);
  const prev=CR&&CR.online?CR.board.filter(Boolean).length:-1;
  CR={online:true,you:d.you,names:d.names,board:d.board.split("").map(Number),turn:d.turn,last:d.last,over:d.over,winner:d.winner,line:d.line,wins:d.wins,avs:(mp&&mp.avs)||[]};
  crView("play");show("cr");crRender();
  const n=CR.board.filter(Boolean).length;
  if(n>prev&&n>0)beep(CR.turn===CR.you||CR.over?520:660,.06,"sine",.04);
  if(CR.over&&CR.winner===CR.you)[392,494,587].forEach((f,i)=>beep(f,.2,"sine",.05,i*.14));
}
function crLocal(p,r,c){
  const S=CR;S.board[r*CN+c]=p+1;S.last=[r,c];beep(p===0?560:480,.06,"sine",.04);
  const line=crWinLine(S.board,r,c,p+1);
  if(line){S.over=true;S.winner=p;S.line=line;S.wins[p]++;if(p===S.you)[392,494,587].forEach((f,i)=>beep(f,.2,"sine",.05,i*.14));}
  else if(S.board.every(Boolean)){S.over=true;S.winner=-1;}
  else S.turn=1-p;
  if(S.over&&!S.awarded){S.awarded=true;claimOffline("caro",{level:crAI?crAI.level:"medium",result:S.winner===S.you?"win":S.winner===-1?"draw":"loss"});}
  crRender();
}
function crClick(k){
  const S=CR;if(!S||S.over||S.turn!==S.you||S.board[k])return;
  const r=Math.floor(k/CN),c=k%CN;
  if(S.online){send({t:"cr:move",r,c});return;}
  crLocal(S.you,r,c);
  if(!CR.over)crT=setTimeout(crAiTurn,350+Math.random()*450);
}
function crAiTurn(){
  if(!CR||CR.online||CR.over||!crAI)return;
  const m=crAiPick(CR.board,2,crAI.level);if(m)crLocal(1,m[0],m[1]);
}
function crNewLocal(){
  crAI.first=crAI.first===null?0:1-crAI.first;
  CR={online:false,you:0,names:[myName()||"Bạn","Anh HyM ("+CRN[crAI.level]+")"],avs:[curAv(),"hym"],board:Array(CN*CN).fill(0),turn:crAI.first,last:null,over:false,winner:null,line:null,wins:CR?CR.wins:[0,0]};
  crRender();
  if(crAI.first===1)crT=setTimeout(crAiTurn,500);
}
$("#m-cr").onclick=()=>{audio();mp=null;crStop();crView("setup");$("#c-err").textContent="";show("cr");};
$("#c-back").onclick=$("#c-menu").onclick=toMenu;
$("#c-create").onclick=()=>{audio();crStop();mpSend("#c-err",{t:"m:create",game:"cr",name:myName()});};
$("#c-join").onclick=()=>{crStop();joinRoom("cr","#c-codein","#c-err");};
$("#c-codein").addEventListener("keydown",e=>{if(e.key==="Enter")$("#c-join").click();});
$("#c-share").onclick=()=>{if(mp)shareText("Vào chơi Cờ Ca Rô với mình! Mã phòng: "+mp.code+"\n"+location.origin,mp.code);};
document.querySelectorAll("[data-cr]").forEach(b=>{b.onclick=()=>{audio();mp=null;crStop();crAI={level:b.dataset.cr,first:null};crNewLocal();crView("play");show("cr");};});
$("#c-again").onclick=()=>{
  if(CR&&CR.online){send({t:"m:again"});$("#c-again").disabled=true;$("#c-again").textContent="Chờ đối thủ…";}
  else if(crAI){const w=CR.wins;clearTimeout(crT);crNewLocal();CR.wins=w;crRender();}
};

/* ---- Chat và thả icon (chỉ khi đang ở phòng online có người thật) ---- */
const EMOS=["😂","😍","😎","😡","😭","😱","🤔","👍","👎","👏","🔥","❤️"];
let vnCode="",botRoom=false,vnFull=false,chat={key:"",unread:0},fabPos={x:0,y:0},peekT=0,fdrag=null;
const fab=$("#chat-fab"),tray=$("#chat-tray"),sheet=$("#chat"),clist=$("#chat-list"),cinp=$("#chat-input"),cpeek=$("#chat-peek");
function chatKey(){
  if(!ws||ws.readyState!==1)return "";
  if(mp)return mp.names.length>=2?"m"+mp.game+mp.code:"";
  if(phase!=="home"&&!botRoom&&vnCode&&vnFull)return "v"+vnCode;
  return "";
}
function chatRefresh(){
  const k=chatKey();
  if(k!==chat.key){
    voiceStop(true);chat={key:k,unread:0};clist.innerHTML="";
    if(!k){tray.classList.add("hidden");sheet.classList.add("hidden");cpeek.classList.add("hidden");}
  }
  fab.classList.toggle("hidden",!k);micEl().classList.toggle("hidden",!k);
  const b=$("#chat-badge");b.textContent=chat.unread>9?"9+":String(chat.unread);b.classList.toggle("hidden",!chat.unread);
}
setInterval(chatRefresh,400);
function fabPlace(x,y){
  x=Math.max(4,Math.min(innerWidth-50,x));y=Math.max(4,Math.min(innerHeight-50,y));
  fab.style.left=x+"px";fab.style.top=y+"px";fabPos={x,y};micPlace();
}
(function(){let p=null;try{p=JSON.parse(store("chatpos")||"null");}catch(e){}
  fabPlace(p&&isFinite(p.x)?p.x:innerWidth-54,p&&isFinite(p.y)?p.y:Math.round(innerHeight*.3));})();
addEventListener("resize",()=>fabPlace(fabPos.x,fabPos.y));
function showTray(){
  tray.classList.remove("hidden");
  const r=fab.getBoundingClientRect(),tw=tray.offsetWidth,th=tray.offsetHeight;
  tray.style.left=Math.max(8,Math.min(innerWidth-tw-8,r.right-tw))+"px";
  tray.style.top=(r.top-th-8>=8?r.top-th-8:r.bottom+8)+"px";
}
function openChat(){tray.classList.add("hidden");cpeek.classList.add("hidden");sheet.classList.remove("hidden");chat.unread=0;chatRefresh();clist.scrollTop=clist.scrollHeight;try{cinp.focus();}catch(e){}}
function closeChat(){sheet.classList.add("hidden");}
function toggleTray(){
  if(!sheet.classList.contains("hidden")){closeChat();return;}
  if(!tray.classList.contains("hidden")){tray.classList.add("hidden");return;}
  if(chat.unread>0)openChat();else showTray();
}
fab.addEventListener("pointerdown",e=>{fdrag={sx:e.clientX,sy:e.clientY,ox:fabPos.x,oy:fabPos.y,moved:false};try{fab.setPointerCapture(e.pointerId);}catch(_){}});
fab.addEventListener("pointermove",e=>{
  if(!fdrag)return;const dx=e.clientX-fdrag.sx,dy=e.clientY-fdrag.sy;
  if(!fdrag.moved&&Math.hypot(dx,dy)>8)fdrag.moved=true;
  if(fdrag.moved){fabPlace(fdrag.ox+dx,fdrag.oy+dy);tray.classList.add("hidden");}
});
fab.addEventListener("pointerup",()=>{if(!fdrag)return;const mv=fdrag.moved;fdrag=null;if(mv)store("chatpos",JSON.stringify(fabPos));else toggleTray();});
fab.addEventListener("pointercancel",()=>{fdrag=null;});
fab.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();toggleTray();}});
[tray,$("#chat-emo")].forEach(c=>EMOS.forEach(em=>{
  const b=document.createElement("button");b.type="button";b.textContent=em;b.setAttribute("aria-label","Thả "+em);
  b.onclick=()=>send({t:"c:emo",e:em});c.insertBefore(b,c.querySelector(".open"));
}));
$("#chat-open").onclick=openChat;$("#chat-x").onclick=closeChat;cpeek.onclick=openChat;
function chatSend(){const t=cinp.value.replace(/\s+/g," ").trim();if(!t)return;send({t:"c:msg",text:t.slice(0,120)});cinp.value="";}
$("#chat-send").onclick=chatSend;
cinp.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();chatSend();}});
function chatFly(e,name){
  const layer=$("#fly-layer");if(layer.children.length>24)return;
  const el=document.createElement("div");el.className="fly";el.style.left=(8+Math.random()*72)+"vw";
  el.append(e);const s=document.createElement("small");s.textContent=name;el.appendChild(s);
  layer.appendChild(el);setTimeout(()=>el.remove(),2600);
}
function chatPeek(t){cpeek.textContent=t;cpeek.classList.remove("hidden");clearTimeout(peekT);peekT=setTimeout(()=>cpeek.classList.add("hidden"),3200);}
function onChat(d){
  if(!chat.key)return;
  if(d.t==="c:slow"){toast("Gửi chậm lại một chút nhé");return;}
  if(d.t==="c:emo"){chatFly(d.e,d.mine?"Bạn":d.name);return;}
  const el=document.createElement("div");el.className="cm"+(d.mine?" mine":"");
  const n=document.createElement("b");n.textContent=d.mine?"Bạn":d.name;
  const t=document.createElement("span");t.textContent=d.text;el.append(n,t);clist.appendChild(el);
  while(clist.children.length>60)clist.removeChild(clist.firstChild);
  clist.scrollTop=clist.scrollHeight;
  if(sheet.classList.contains("hidden")&&!d.mine){chat.unread++;chatPeek(d.name+": "+d.text);beep(740,.08,"sine",.04);chatRefresh();}
}

/* ---- Avatar (hình trong assets/avatars), túi, shop và điểm ---- */
let AVS=[{id:"a0",name:"Tân binh",ring:["#8ea0b8","#5b6b85"],free:true}],EXCH=50,DEFPRICE=100;
function avPrice(a){return typeof a.price==="number"?a.price:DEFPRICE;}
function avEl(id,s){
  const a=AVS.find(x=>x.id===id)||AVS[0],sp=document.createElement("span");sp.className="av";
  sp.style.setProperty("--s",s+"px");sp.style.setProperty("--r1",(a.ring||[])[0]||"#8ea0b8");sp.style.setProperty("--r2",(a.ring||[])[1]||"#5b6b85");
  const im=document.createElement("img");im.src="/assets/avatars/"+encodeURIComponent(a.id)+".svg";im.alt=a.name;im.draggable=false;
  sp.appendChild(im);return sp;
}
function avHtml(id,s){return avEl(id,s).outerHTML;}
let vnAvs=[];
function tlAv(i){return (mp&&mp.avs&&mp.avs[i])||"a0";}
function fmt(n){return Number(n||0).toLocaleString("vi-VN");}
function ico(n){return '<img class="ico" src="/assets/ui/'+n+'.svg" alt="">';}
function curAv(){return W&&W.eq?W.eq:"a0";}
function setWallet(w){
  if(!user||user.guest||!w)return;
  W=w;user.wallet=w;saveUser();profileRefresh();
  if(!$("#av-modal").classList.contains("hidden"))avRender();
}
function onWallet(w,gain,why){
  if(!user||user.guest||!w)return;
  const before=W?W.shop:0;setWallet(w);
  if(gain>0){const ds=w.shop-before;toast("+"+fmt(gain)+" điểm"+(why?" · "+why:"")+(ds>0?" (+"+ds+" điểm shop)":""));}
}
function onAuthFail(){if(user&&!user.guest){toast("Phiên đăng nhập hết hạn, hãy đăng nhập lại.");if(!mp&&phase==="home")doLogout();}}
async function claimOffline(kind,params){
  if(!user||user.guest||!user.token)return;           // khách không bao giờ lưu điểm
  try{const r=await api("/api/award",Object.assign({kind},params));onWallet(r.wallet,r.gain,kind==="caro"?"Cờ ca rô":"Đuổi hình");}
  catch(e){if(e.status!==401&&e.status!==503)toast(e.message);}
}
function profileRefresh(){
  if(!user)return;
  $("#prof-av").innerHTML=avHtml(curAv(),64);
  $("#prof-name").textContent=user.name+(user.guest?" (khách)":"");
  $("#prof-pts").innerHTML=user.guest?"Khách · không lưu điểm":(W?ico("coin")+" "+fmt(W.shop)+" điểm shop · "+fmt(W.points)+" điểm":"…");
}
let avTab="bag",avArm=null,avArmT=0;
function avRender(){
  const guest=!user||user.guest,w=W||{shop:0,points:0,owned:["a0"],eq:"a0",next:EXCH};
  const owned=guest?["a0"]:w.owned,eq=guest?"a0":w.eq;
  $("#avm-pts").innerHTML=guest?"Khách · không lưu điểm":ico("coin")+" <b>"+fmt(w.shop)+"</b> điểm shop · "+fmt(w.points)+" điểm (còn "+fmt(w.next)+" điểm nữa được +1)";
  $("#avt-bag").classList.toggle("on",avTab==="bag");$("#avt-shop").classList.toggle("on",avTab==="shop");
  const g=$("#avm-grid");g.innerHTML="";
  AVS.filter(a=>!a.hidden&&(avTab==="shop"||owned.includes(a.id))).forEach(a=>{
    const has=owned.includes(a.id),price=a.free?0:avPrice(a),c=document.createElement("div");
    c.className="avc"+(eq===a.id?" eq":"");c.appendChild(avEl(a.id,64));
    const nm=document.createElement("b");nm.textContent=a.name;c.appendChild(nm);
    const need=document.createElement("span");need.className="need";
    const b=document.createElement("button");b.type="button";
    if(avTab==="bag"){b.textContent=eq===a.id?"Đang dùng ✓":"Dùng";b.disabled=eq===a.id||guest;b.onclick=()=>avEquip(a.id);}
    else if(has){b.textContent="Đã có";b.disabled=true;}
    else{
      b.className="buy";b.innerHTML=avArm===a.id?"Chạm lần nữa để mua":ico("coin")+" "+fmt(price);
      if(guest){b.disabled=true;need.textContent="Cần đăng ký";}
      else if(w.shop<price){b.disabled=true;need.textContent="Thiếu "+fmt(price-w.shop)+" điểm shop";}
      b.onclick=()=>avBuy(a.id);
    }
    c.append(b,need);g.appendChild(c);
  });
  const n=AVS.filter(a=>!a.hidden).length;
  $("#avm-note").textContent=avTab==="bag"
    ?"Đã có "+owned.length+"/"+n+" avatar. Chạm vào avatar để dùng. Avatar hiện cạnh tên bạn trong các trận online."
    :(guest?"Tài khoản khách không bao giờ lưu điểm nên không mua được avatar. Hãy đăng ký tài khoản để tích điểm.":
      "Quy đổi: "+EXCH+" điểm = 1 điểm shop. Mỗi avatar giá "+DEFPRICE+" điểm shop (= "+fmt(EXCH*DEFPRICE)+" điểm). Kiếm điểm: Var Nhau = số điểm trong ván · Cờ ca rô thắng +300 (với máy +100/200/300) · Tiến lên thắng +400 · Đuổi hình bắt chữ: điểm × 5.");
}
async function avEquip(id){try{const r=await api("/api/equip",{id});setWallet(r.wallet);}catch(e){toast(e.message);}}
async function avBuy(id){
  const a=AVS.find(x=>x.id===id);if(!a||!W)return;
  if(avArm!==id){avArm=id;clearTimeout(avArmT);avArmT=setTimeout(()=>{avArm=null;avRender();},3000);avRender();return;}
  clearTimeout(avArmT);avArm=null;
  try{const r=await api("/api/buy",{id});setWallet(r.wallet);toast("Đã mua "+a.name+" và đang dùng!");}catch(e){toast(e.message);avRender();}
}
function avOpen(tab){avTab=tab;avArm=null;$("#av-modal").classList.remove("hidden");avRender();}
function avClose(){$("#av-modal").classList.add("hidden");avArm=null;}
$("#bag-btn").onclick=()=>avOpen("bag");
$("#shop-btn").onclick=()=>avOpen("shop");
$("#avt-bag").onclick=()=>{avTab="bag";avArm=null;avRender();};
$("#avt-shop").onclick=()=>{avTab="shop";avArm=null;avRender();};
$("#avm-x").onclick=avClose;
$("#av-modal").addEventListener("click",e=>{if(e.target.id==="av-modal")avClose();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")avClose();});

/* ---- Voice chat (WebRTC, nói chuyện trực tiếp giữa các điện thoại) ---- */
const V={joined:false,joining:false,muted:true,stream:null,peers:new Map(),ice:null,me:"",tick:0};
function micEl(){return document.getElementById("mic-fab");}
function micPlace(){
  const f=micEl();if(!f)return;
  let y=fabPos.y+54;if(y>innerHeight-50)y=fabPos.y-54;
  f.style.left=fabPos.x+"px";f.style.top=Math.max(4,y)+"px";
}
function micRender(){
  const f=micEl();if(!f)return;
  f.classList.toggle("on",V.joined&&!V.muted);f.classList.toggle("muted",V.joined&&V.muted);
  f.querySelector("img").src="/assets/ui/"+(V.joined&&!V.muted?"mic":"mic-off")+".svg";
  const t=!V.joined?"Bật mic để nói chuyện":(V.muted?"Mic đang tắt, bấm để bật":"Mic đang bật, bấm để tắt");
  f.title=t;f.setAttribute("aria-label",t);
  const l=document.getElementById("voice-leave");if(l)l.classList.toggle("hidden",!V.joined);
}
async function voiceIce(){
  if(V.ice)return V.ice;
  try{const r=await fetch("/ice.json");V.ice=(await r.json()).iceServers;}catch(e){V.ice=[{urls:"stun:stun.l.google.com:19302"}];}
  return V.ice;
}
async function voiceJoin(){
  if(V.joined||V.joining)return;
  if(!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.RTCPeerConnection)){toast("Thiết bị này chưa hỗ trợ nói chuyện bằng mic.");return;}
  V.joining=true;
  try{V.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});}
  catch(e){V.joining=false;toast(e&&(e.name==="NotAllowedError"||e.name==="SecurityError")?"Bạn chưa cho phép dùng mic. Hãy cấp quyền mic cho app hoặc trình duyệt.":"Không mở được mic.");return;}
  await voiceIce();
  V.joined=true;V.joining=false;
  setMute(false);send({t:"v:join"});
  clearInterval(V.tick);V.tick=setInterval(speakTick,220);
}
function setMute(m){V.muted=m;if(V.stream)V.stream.getAudioTracks().forEach(t=>{t.enabled=!m;});micRender();}
function voiceStop(notify){
  if(notify&&V.joined)send({t:"v:leave"});
  Array.from(V.peers.keys()).forEach(closePeer);
  if(V.stream){V.stream.getTracks().forEach(t=>t.stop());V.stream=null;}
  clearInterval(V.tick);V.joined=false;V.joining=false;V.muted=true;V.me="";
  micRender();speakRender();
}
function closePeer(id){
  const p=V.peers.get(id);if(!p)return;
  try{p.pc.close();}catch(e){}
  if(p.audio){try{p.audio.srcObject=null;}catch(e){}p.audio.remove();}
  V.peers.delete(id);speakRender();
}
function watchLevel(p,stream){
  try{
    audio();if(!AC)return;
    const an=AC.createAnalyser();an.fftSize=512;AC.createMediaStreamSource(stream).connect(an);
    p.an=an;p.buf=new Uint8Array(an.fftSize);
  }catch(e){}
}
function speakTick(){
  let ch=false;
  V.peers.forEach(p=>{
    if(!p.an)return;p.an.getByteTimeDomainData(p.buf);
    let m=0;for(let i=0;i<p.buf.length;i++){const v=Math.abs(p.buf[i]-128);if(v>m)m=v;}
    const on=m>14;if(on!==p.talk){p.talk=on;ch=true;}
  });
  if(ch)speakRender();
}
function speakRender(){
  const el=document.getElementById("voice-speak");if(!el)return;
  const n=[];V.peers.forEach(p=>{if(p.talk)n.push(p.name);});
  el.textContent=n.length?"🔊 "+n.join(", ")+" đang nói":"";el.classList.toggle("hidden",!n.length);
}
function newPeer(id,name){
  const pc=new RTCPeerConnection({iceServers:V.ice});
  const p={pc,name,audio:null,queue:[],ready:false,an:null,talk:false};
  V.peers.set(id,p);
  V.stream.getTracks().forEach(t=>pc.addTrack(t,V.stream));
  pc.onicecandidate=e=>{if(e.candidate)send({t:"v:sig",to:id,data:{c:e.candidate}});};
  pc.ontrack=e=>{
    if(p.audio)return;
    const a=document.createElement("audio");a.autoplay=true;a.setAttribute("playsinline","");a.srcObject=e.streams[0];
    document.getElementById("voice-audio").appendChild(a);p.audio=a;
    try{const pr=a.play();if(pr&&pr.catch)pr.catch(()=>{});}catch(er){}
    watchLevel(p,e.streams[0]);
  };
  pc.onconnectionstatechange=()=>{if(pc.connectionState==="failed"){toast("Không nối được mic với "+name+" (mạng chặn kết nối trực tiếp).");closePeer(id);}};
  return p;
}
async function peerFlush(p){p.ready=true;while(p.queue.length){try{await p.pc.addIceCandidate(p.queue.shift());}catch(e){}}}
async function onVoiceSig(d){
  if(!V.joined)return;
  let p=V.peers.get(d.from);const x=d.data||{};
  try{
    if(x.sdp&&x.sdp.type==="offer"){
      if(p)closePeer(d.from);
      p=newPeer(d.from,d.name);await p.pc.setRemoteDescription(x.sdp);await peerFlush(p);
      const ans=await p.pc.createAnswer();await p.pc.setLocalDescription(ans);
      send({t:"v:sig",to:d.from,data:{sdp:p.pc.localDescription}});
    }else if(x.sdp&&x.sdp.type==="answer"&&p){await p.pc.setRemoteDescription(x.sdp);await peerFlush(p);}
    else if(x.c&&p){if(p.ready){try{await p.pc.addIceCandidate(x.c);}catch(e){}}else p.queue.push(x.c);}
  }catch(e){closePeer(d.from);}
}
async function voiceHandle(d){
  if(d.t==="v:peers"){
    V.me=d.me;
    for(const o of d.peers){
      if(!V.joined)return;
      try{const p=newPeer(o.id,o.name);const off=await p.pc.createOffer();await p.pc.setLocalDescription(off);send({t:"v:sig",to:o.id,data:{sdp:p.pc.localDescription}});}
      catch(e){closePeer(o.id);}
    }
  }else if(d.t==="v:sig")onVoiceSig(d);
  else if(d.t==="v:left")closePeer(d.id);
  else if(d.t==="v:joined"&&!V.joined)toast(d.name+" đã bật mic. Bấm nút 🎤 để cùng nói chuyện.");
}
micEl().onclick=()=>{audio();if(!V.joined)voiceJoin();else setMute(!V.muted);};
document.getElementById("voice-leave").onclick=()=>{voiceStop(true);tray.classList.add("hidden");};
micPlace();micRender();

fetch("/assets/avatars/catalog.json").then(r=>r.json()).then(j=>{
  if(j&&Array.isArray(j.avatars)){AVS=j.avatars;EXCH=j.exchange||50;DEFPRICE=j.defaultPrice||100;profileRefresh();if(!$("#av-modal").classList.contains("hidden"))avRender();}
}).catch(()=>{});
try{
  const u=JSON.parse(store("user")||"null");
  if(u&&u.name&&(u.guest||u.token)){
    setUser(u);
    if(u.token)api("/api/me").then(r=>setWallet(r.wallet)).catch(e=>{if(e.status===401){toast("Phiên đăng nhập hết hạn, hãy đăng nhập lại.");doLogout();}});
  }else show("auth");        // tài khoản cũ (chỉ lưu trên máy) không còn dùng được: cần đăng ký lại trên máy chủ
}catch(e){show("auth");}
})();
