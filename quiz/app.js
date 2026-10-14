(function(){
"use strict";
var L=["ก","ข","ค","ง"],D=null,S={view:"home"},app=document.getElementById("app");
var KEY="quiz-state-v1";
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function load(){try{var s=JSON.parse(localStorage.getItem(KEY));if(s&&s.view)S=s}catch(e){}
  S.resume=(S.view==="q"||(S.view==="sum"&&!S.sent))?S.view:null;S.view="home";}
function sessLabel(){return S.session==="all"?"ทั้งวิชา":"ครั้งที่ "+S.session}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function course(id){return D.courses.filter(function(c){return c.id===id})[0]}
function h(html){app.innerHTML=html;window.scrollTo(0,0)}
function go(v){S.view=v;save();render()}
function items(){ // list of {s,n,q,c}
  var c=course(S.course),out=[];
  c.sessions.forEach(function(s){if(S.session==="all"||s.no===S.session){s.questions.forEach(function(q){out.push({s:s.no,n:q.n,q:q.q,c:q.c})})}});
  return out;
}
function render(){
  if(S.view==="home"){
    h('<h1>แบบทดสอบปรนัย</h1><p class="lead">เลือกวิชา แล้วเลือกครั้งที่เรียน ข้อสอบแบบกากบาท 4 ตัวเลือก (ก ข ค ง) ทำเสร็จแล้วส่งคำตอบให้อาจารย์ตรวจ</p>'+
    (S.resume&&course(S.course)?'<div class="note resume"><b>มีชุดที่ทำค้างไว้</b><br><button class="btn gold" id="rs">ทำชุดที่ค้างไว้ต่อ ('+esc(course(S.course).name)+' '+sessLabel()+')</button> <button class="btn ghost" id="rd">ทิ้งชุดนี้</button></div>':'')+
    D.courses.map(function(c){var n=0,m=0;c.sessions.forEach(function(s){n+=s.questions.length;if(s.questions.length)m++});return '<button class="card" data-c="'+c.id+'"><b>'+esc(c.name)+'</b><small>'+m+' ครั้ง · '+n+' ข้อ</small></button>'}).join("")+
    '<div class="note">ระบบไม่เฉลยและไม่ให้คะแนนอัตโนมัติ อาจารย์เป็นผู้ตรวจคำตอบ</div>');
    app.querySelectorAll("[data-c]").forEach(function(b){b.onclick=function(){S.resume=null;S.course=b.dataset.c;go("sessions")}});
    var rs=document.getElementById("rs");if(rs)rs.onclick=function(){var v=S.resume;S.resume=null;go(v)};
    var rd=document.getElementById("rd");if(rd)rd.onclick=function(){if(!confirm("ต้องการทิ้งคำตอบชุดที่ทำค้างไว้หรือไม่"))return;S.resume=null;S.ans={};S.i=0;go("home")};
  } else if(S.view==="sessions"){
    var c=course(S.course),tot=0;c.sessions.forEach(function(s){tot+=s.questions.length});
    h('<button class="back" id="bk">‹ เลือกวิชาอื่น</button><h1>'+esc(c.name)+'</h1><p class="lead">เลือกครั้งที่ต้องการทำแบบทดสอบ</p><div class="grid">'+
    c.sessions.map(function(s){var ok=s.questions.length>0;return '<button class="card" data-s="'+s.no+'"'+(ok?'':' disabled')+'><b>ครั้งที่ '+s.no+'</b><small>'+(ok?esc(s.title)+' · '+s.questions.length+' ข้อ':'ยังไม่มีแบบทดสอบ')+'</small></button>'}).join("")+
    '</div><button class="card" data-s="all"><b>ทั้งวิชา</b><small>รวมทุกครั้ง · '+tot+' ข้อ</small></button>');
    document.getElementById("bk").onclick=function(){go("home")};
    app.querySelectorAll("[data-s]").forEach(function(b){b.onclick=function(){if(b.disabled)return;S.session=b.dataset.s==="all"?"all":+b.dataset.s;S.ans={};S.i=0;go("name")}});
  } else if(S.view==="name"){
    var c=course(S.course);
    h('<button class="back" id="bk">‹ กลับ</button><h1>'+esc(c.name)+'</h1><p class="lead">'+(S.session==="all"?"ทั้งวิชา":"ครั้งที่ "+S.session)+' · '+items().length+' ข้อ</p>'+
    '<label class="f" for="nm">ชื่อ-นามสกุล *</label><input type="text" id="nm" value="'+esc(S.name||"")+'" autocomplete="name">'+
    '<label class="f" for="sid">รหัสนักศึกษา *</label><input type="text" id="sid" value="'+esc(S.sid||"")+'" inputmode="numeric">'+
    '<div class="row"><span></span><button class="btn gold" id="st">เริ่มทำแบบทดสอบ</button></div>');
    document.getElementById("bk").onclick=function(){go("sessions")};
    document.getElementById("st").onclick=function(){S.name=document.getElementById("nm").value.trim();S.sid=document.getElementById("sid").value.trim();if(!S.name||!S.sid){alert("กรุณากรอกชื่อและรหัสนักศึกษา");return}S.sent=false;S.i=0;go("q")};
  } else if(S.view==="q"){
    var it=items(),i=S.i,q=it[i],k=q.s+"-"+q.n,a=S.ans[k];
    h('<div class="meta">'+esc(course(S.course).name)+' · ครั้งที่ '+q.s+' ข้อ '+q.n+'</div><div class="prog"><i style="width:'+Math.round((i+1)/it.length*100)+'%"></i></div>'+
    '<div class="meta">ข้อที่ '+(i+1)+' จาก '+it.length+'</div><div class="q"><p class="stem">'+esc(q.q)+'</p>'+
    q.c.map(function(t,j){return '<label class="opt'+(a===L[j]?' sel':'')+'"><input type="radio" name="o" value="'+L[j]+'"'+(a===L[j]?' checked':'')+'><span class="l">'+L[j]+'</span><span>'+esc(t)+'</span></label>'}).join("")+
    '</div><div class="row"><button class="btn ghost" id="pv"'+(i===0?' disabled':'')+'>‹ ก่อนหน้า</button>'+(i<it.length-1?'<button class="btn" id="nx">ถัดไป ›</button>':'<button class="btn gold" id="fn">ส่งคำตอบ</button>')+'</div>');
    app.querySelectorAll("input[name=o]").forEach(function(r){r.onchange=function(){S.ans[k]=r.value;save();app.querySelectorAll(".opt").forEach(function(o){o.classList.toggle("sel",o.querySelector("input").checked)})}});
    document.getElementById("pv").onclick=function(){S.i--;go("q")};
    var nx=document.getElementById("nx");if(nx)nx.onclick=function(){S.i++;go("q")};
    var fn=document.getElementById("fn");if(fn)fn.onclick=function(){var miss=it.filter(function(x){return !S.ans[x.s+"-"+x.n]}).length;if(miss&&!confirm("ยังไม่ได้ตอบ "+miss+" ข้อ ต้องการส่งเลยหรือไม่"))return;S.done=new Date().toLocaleString("th-TH");go("sum")};
  } else if(S.view==="sum"){
    var it=items(),c=course(S.course),lines=[];
    lines.push("แบบทดสอบ: "+c.name+" ("+(S.session==="all"?"ทั้งวิชา":"ครั้งที่ "+S.session)+")");
    lines.push("ชื่อ: "+(S.name||"-")+(S.sid?"  รหัส: "+S.sid:""));
    lines.push("วันที่ส่ง: "+S.done);
    var answered=0;
    it.forEach(function(x){var a=S.ans[x.s+"-"+x.n]||"-";if(a!=="-")answered++;lines.push("ครั้งที่ "+x.s+" ข้อ "+x.n+": "+a)});
    lines.splice(3,0,"ตอบแล้ว "+answered+"/"+it.length+" ข้อ");
    var txt=lines.join("\n");
    h('<h1>สรุปคำตอบ</h1><p class="lead">'+esc(c.name)+' · '+(S.session==="all"?"ทั้งวิชา":"ครั้งที่ "+S.session)+'<br>ชื่อ: '+esc(S.name||"-")+(S.sid?" · รหัส "+esc(S.sid):"")+' · ตอบแล้ว '+answered+'/'+it.length+' ข้อ</p>'+
    '<div class="note">'+(window.SUBMIT_URL?'ตรวจคำตอบให้เรียบร้อย แล้วกด "ส่งคำตอบให้อาจารย์" คำตอบจะส่งถึงอาจารย์โดยอัตโนมัติ':'ตรวจคำตอบให้เรียบร้อย แล้วกด "คัดลอกคำตอบ" เพื่อส่งให้อาจารย์')+'</div>'+
    (window.SUBMIT_URL?'<div class="row" style="margin:0 0 10px"><button class="btn" id="sb"'+(S.sent?' disabled':'')+'>'+(S.sent?'ส่งคำตอบแล้ว ✓':'ส่งคำตอบให้อาจารย์')+'</button><span class="meta" id="sm">'+(S.sent&&S.sentAt?'ส่งเมื่อ '+esc(S.sentAt):'')+'</span></div>':'')+
    '<div class="row" style="margin:0 0 14px">'+(window.SUBMIT_URL?'':'<button class="btn gold" id="cp">คัดลอกคำตอบ</button>')+'<button class="btn ghost" id="ed">แก้คำตอบ</button></div>'+
    '<table><thead><tr><th>ครั้งที่</th><th>ข้อ</th><th>คำตอบ</th></tr></thead><tbody>'+
    it.map(function(x){return '<tr><td>'+x.s+'</td><td>'+x.n+'</td><td class="ans">'+(S.ans[x.s+"-"+x.n]||"-")+'</td></tr>'}).join("")+'</tbody></table>'+
    '<textarea id="tx" readonly style="position:absolute;left:-9999px">'+esc(txt)+'</textarea>'+
    '<div class="row"><button class="btn ghost" id="nw">ทำชุดอื่น</button></div>');
    var cpb=document.getElementById("cp");if(cpb)cpb.onclick=function(){var b=this;function ok(){b.textContent="คัดลอกแล้ว ✓"}
      if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(txt).then(ok,fb)}else fb();
      function fb(){var t=document.getElementById("tx");t.select();try{document.execCommand("copy");ok()}catch(e){prompt("คัดลอกข้อความนี้",txt)}}};
    var sb=document.getElementById("sb");if(sb)sb.onclick=function(){
      var comp=it.map(function(x){return (S.session==="all"?x.s+"-":"")+x.n+":"+(S.ans[x.s+"-"+x.n]||"-")}).join(",");
      var body={name:S.name,studentId:S.sid,course:c.name,courseId:c.id,session:S.session==="all"?"ทั้งวิชา":String(S.session),answers:comp,submittedAt:new Date().toISOString()};
      sb.disabled=true;sb.textContent="กำลังส่ง…";
      fetch(window.SUBMIT_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(body)})
      .then(function(){var d=new Date();S.sent=true;S.sentAt=d.toLocaleString("th-TH",{dateStyle:"medium",timeStyle:"short"});save();sb.textContent="ส่งคำตอบแล้ว ✓";document.getElementById("sm").textContent="ส่งเมื่อ "+S.sentAt})
      .catch(function(){sb.disabled=false;sb.textContent="ส่งคำตอบให้อาจารย์";document.getElementById("sm").textContent="ส่งไม่สำเร็จ กรุณาตรวจอินเทอร์เน็ต แล้วกดส่งอีกครั้ง"})};
    document.getElementById("ed").onclick=function(){S.i=0;go("q")};
    document.getElementById("nw").onclick=function(){S.ans={};go("home")};
  }
}
load();
fetch("data/questions.json",{cache:"no-cache"}).then(function(r){return r.json()}).then(function(d){D=d;if(S.course&&!course(S.course))S.view="home";render()}).catch(function(){app.innerHTML='<p>โหลดแบบทดสอบไม่สำเร็จ กรุณาลองใหม่</p>'});
var tg=document.getElementById("tohome");if(tg)tg.onclick=function(e){e.preventDefault();if(!D)return;if(S.view==="q"||(S.view==="sum"&&!S.sent))S.resume=S.view;go("home")};
if("serviceWorker" in navigator){navigator.serviceWorker.register("sw.js").catch(function(){})}
})();
