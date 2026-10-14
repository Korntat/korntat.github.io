let D;const $=s=>document.querySelector(s),A=$('#app');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
fetch('data/content.json').then(r=>r.json()).then(j=>{D=j;route()});
addEventListener('hashchange',route);
$('#q').addEventListener('input',e=>{const v=e.target.value.trim();if(v)search(v);else route()});
function route(){if(!D)return;$('#q').value='';const p=location.hash.replace(/^#\/?/,'').split('/');scrollTo(0,0);
 if(!p[0])return home();const c=D.find(x=>x.id==p[0]);if(!c)return home();
 if(!p[1])return course(c);const s=c.sessions.find(x=>x.n==+p[1]);s?sess(c,s):course(c)}
function home(){A.innerHTML='<h1>สรุปหลักกฎหมายไว้ทบทวน</h1><p class="muted">เลือกวิชา แล้วเลือกครั้งที่เรียน ทุกครั้งมีหลักสำคัญ มาตรา ฎีกา และบัตรคำทบทวน ใช้งานแบบออฟไลน์ได้</p>'+
 D.map(c=>`<a class="card" href="#/${c.id}"><b>${esc(c.name)}</b><div class="muted">${c.sessions.length} ครั้ง · ฎีกา ${c.sessions.reduce((a,s)=>a+s.deka.length,0)} เรื่อง · บัตรคำ ${c.sessions.reduce((a,s)=>a+s.cards.length,0)} ใบ</div></a>`).join('')}
function course(c){A.innerHTML=`<p class="crumb"><a href="#/">หน้าแรก</a></p><h1>${esc(c.name)}</h1>`+
 c.sessions.map(s=>`<a class="card" href="#/${c.id}/${s.n}"><span class="n">${s.n}</span><b>${esc(s.title)}</b></a>`).join('')}
function sess(c,s){const i=c.sessions.indexOf(s),pv=c.sessions[i-1],nx=c.sessions[i+1];
 const dk=s.deka.length?(s.deka.length>8?`<details><summary>ดูทั้งหมด ${s.deka.length} เรื่อง</summary>`:'<div>')+s.deka.map(d=>`<div class="dk"><b>ฎีกาที่ ${esc(d[0])}</b>${d[1]?' — '+esc(d[1]):''}</div>`).join('')+(s.deka.length>8?'</details>':'</div>'):'<p class="muted">ไม่มีฎีกาที่สรุปไว้สำหรับครั้งนี้</p>';
 A.innerHTML=`<p class="crumb"><a href="#/">หน้าแรก</a> › <a href="#/${c.id}">${esc(c.name)}</a></p><h1>ครั้งที่ ${s.n}: ${esc(s.title)}</h1>
 ${c.id=='court'?'<p class="note">ข้อความตัวบทในวิชานี้เป็นการสรุปความ ยังไม่ได้ตรวจทานกับตัวบทของสำนักงานคณะกรรมการกฤษฎีกา</p>':''}
 <h2>หลักสำคัญ</h2><ul>${s.principles.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
 <h2>มาตราสำคัญ</h2><div>${s.sections.map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div>
 <h2>ฎีกาสำคัญ</h2>${dk}
 <h2>บัตรคำทบทวน</h2><p class="muted">แตะการ์ดเพื่อดูคำตอบ</p>${s.cards.map(q=>`<div class="fc" onclick="this.classList.toggle('open')"><div>${esc(q[0])}</div><div class="hint">แตะเพื่อดูคำตอบ</div><div class="ans">${esc(q[1])}</div></div>`).join('')}
 <div class="nav2">${pv?`<a href="#/${c.id}/${pv.n}">‹ ครั้งที่ ${pv.n}</a>`:'<span></span>'}${nx?`<a href="#/${c.id}/${nx.n}">ครั้งที่ ${nx.n} ›</a>`:''}</div>`}
function search(v){const lv=v.toLowerCase(),R=[];const hl=t=>esc(t).split(esc(v)).join(`<mark>${esc(v)}</mark>`);
 for(const c of D)for(const s of c.sessions){const h=[];const chk=(k,t)=>{if(String(t).toLowerCase().includes(lv))h.push(`<div class="muted">${k}: ${hl(String(t).slice(0,220))}</div>`)};
  chk('ชื่อเรื่อง',s.title);s.principles.forEach(x=>chk('หลัก',x));s.sections.forEach(x=>chk('มาตรา',x));s.deka.forEach(d=>chk('ฎีกา',d[0]+' '+d[1]));s.cards.forEach(q=>chk('บัตรคำ',q[0]+' — '+q[1]));
  if(h.length)R.push(`<a class="card" href="#/${c.id}/${s.n}"><b>${esc(c.name)} ครั้งที่ ${s.n}: ${esc(s.title)}</b>${h.slice(0,4).join('')}${h.length>4?`<div class="muted">และอีก ${h.length-4} รายการ</div>`:''}</a>`)}
 A.innerHTML=`<h1>ผลการค้นหา “${esc(v)}”</h1><p class="muted">พบ ${R.length} ครั้งที่เรียน</p>`+R.join('')}
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js');
