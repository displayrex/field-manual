const REPO = "https://github.com/displayrex/field-manual";
const AREAS = [
  ["IAM","Identity & Access"],["MDM","Endpoints & Devices"],["GWS","Google Workspace"],
  ["ZTNA","Zero Trust & Network"],["SIEM","Logging & Detection"],["AUTO","Scripting & Code"],["DATA","Databases & Data"],["OPS","Service Desk & Docs"],["GRC","Compliance & Runbooks"]
];
const AREA_NAME = Object.fromEntries(AREAS);
const $ = s => document.querySelector(s);
const state = { topics: [], cur: null, area: null, q: "", mode: "read", db: null, canWrite: true };

function store(k, v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }catch(e){ return null; } }
function toast(t){ const el=$("#toast"); el.textContent=t; el.classList.add("on"); clearTimeout(toast._t); toast._t=setTimeout(()=>el.classList.remove("on"),1800); }
function esc(s){ return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function slug(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60) || "page"; }

function renderMd(src){
  const raw = window.marked ? marked.parse(src||"", {gfm:true}) : "<pre>"+esc(src)+"</pre>";
  return window.DOMPurify ? DOMPurify.sanitize(raw, {FORBID_TAGS:["style","form","input","iframe"], FORBID_ATTR:["style"]}) : esc(src);
}
function enhance(root){
  root.querySelectorAll("table").forEach(t=>{ if(t.parentElement.classList.contains("tablewrap")) return; const w=document.createElement("div"); w.className="tablewrap"; t.replaceWith(w); w.appendChild(t); });
  root.querySelectorAll("pre").forEach(pre=>{
    const b=document.createElement("button"); b.className="copy"; b.type="button"; b.textContent="Copy";
    b.onclick=()=>{ const txt=pre.querySelector("code")?.innerText ?? pre.innerText;
      navigator.clipboard?.writeText(txt).then(()=>toast("Copied"),()=>{ const r=document.createRange(); r.selectNodeContents(pre.querySelector("code")||pre); const s=getSelection(); s.removeAllRanges(); s.addRange(r); toast("Selected — press Ctrl/⌘ C"); }); };
    pre.appendChild(b);
  });
  root.querySelectorAll("a[href]").forEach(l=>{ if(/^https?:/i.test(l.getAttribute("href"))){ l.target="_blank"; l.rel="noopener noreferrer"; } });
  const heads=[...root.querySelectorAll("h2")];
  heads.forEach((h,i)=>h.id="s-"+i+"-"+slug(h.textContent));
  return heads;
}

function sorted(){
  const order = Object.fromEntries(AREAS.map((a,i)=>[a[0],i]));
  return [...state.topics].sort((a,b)=>(order[a.category]??99)-(order[b.category]??99) || (a.order??99)-(b.order??99) || a.title.localeCompare(b.title));
}
function matches(t){
  if(state.area && t.category!==state.area) return false;
  if(!state.q) return true;
  const hay=(t.title+" "+t.summary+" "+(t.tags||[]).join(" ")+" "+t.body).toLowerCase();
  return state.q.toLowerCase().split(/\s+/).filter(Boolean).every(w=>hay.includes(w));
}

function renderChips(){
  const c=$("#chips"); c.innerHTML="";
  [["",'All'],...AREAS.map(a=>[a[0],a[0]])].forEach(([code,label])=>{
    const b=document.createElement("button"); b.className="chip"; b.type="button"; b.textContent=label;
    b.title = code ? AREA_NAME[code] : "All areas";
    b.setAttribute("aria-pressed", String((state.area||"")===code));
    b.onclick=()=>{ state.area=code||null; renderChips(); renderToc(); };
    c.appendChild(b);
  });
}
function renderToc(){
  const toc=$("#toc"); toc.innerHTML="";
  const list=sorted().filter(matches);
  $("#count").textContent = state.topics.length+" pages";
  if(!list.length){ toc.innerHTML='<p class="note" style="padding:6px">'+(state.topics.length?'No page matches “'+esc(state.q)+'”.':'No pages yet.')+'</p>'; return; }
  let g=null, n=0;
  list.forEach(t=>{
    if(!g || g.dataset.cat!==t.category){
      g=document.createElement("div"); g.className="grp"; g.dataset.cat=t.category; n=0;
      g.innerHTML='<h3><b>'+esc(t.category)+'</b>'+esc(AREA_NAME[t.category]||"Other")+'</h3>';
      toc.appendChild(g);
    }
    n++;
    const b=document.createElement("button"); b.className="item"; b.type="button";
    b.setAttribute("aria-current", String(state.cur===t.id));
    b.innerHTML='<i>'+String(n).padStart(2,"0")+'</i><span>'+esc(t.title)+'</span>';
    b.onclick=()=>show(t.id);
    g.appendChild(b);
  });
}

function numberOf(t){ return String(sorted().filter(x=>x.category===t.category).findIndex(x=>x.id===t.id)+1).padStart(2,"0"); }
function fmtDate(iso){ try{ if(/^\d{4}-\d{2}-\d{2}$/.test(iso)) iso+="T12:00:00"; return new Date(iso).toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"}); }catch(e){ return ""; } }

function show(id){
  state.cur=id; state.mode="read"; store("fm.cur", id);
  try{ history.replaceState(null,"","#"+id); }catch(e){}
  $("#rail").classList.remove("open"); $("#menuBtn").setAttribute("aria-expanded","false");
  renderToc(); renderMain(); $("#main").scrollTop=0;
}

function renderEmpty(kind){
  const m=$("#main");
  if(kind==="nodb"){
    m.innerHTML='<div class="page solo"><div class="empty"><h2>Manual store unavailable</h2><p>Your pages live in this artifact’s private store. Open the page on claude.ai while signed in to read and edit them.</p></div></div>';
  } else {
    m.innerHTML='<div class="page solo"><div class="empty"><h2>No pages yet</h2><p>Each page is a quick reference for one tool or workflow. Start with the tool you reach for most.</p><p>Add Markdown files under content/ and rebuild the manifest.</p></div></div>';
  }
}

function renderMain(){
  const t=state.topics.find(x=>x.id===state.cur);
  if(state.mode==="edit") return;
  if(!t){ if(state.topics.length){ show(sorted()[0].id); } else renderEmpty("none"); return; }
  const m=$("#main");
  m.innerHTML='<div class="page"><article>'+
    '<div class="eyebrow"><span>'+esc(t.category)+' · '+numberOf(t)+'</span><span>'+esc(AREA_NAME[t.category]||"")+'</span>'+(t.tags||[]).slice(0,5).map(x=>'<span class="tag">'+esc(x)+'</span>').join("")+'</div>'+
    '<div class="title-row"><h1>'+esc(t.title)+'</h1>'+'<a class="btn" href="'+REPO+'/edit/main/'+esc(t.path)+'" target="_blank" rel="noopener">Edit on GitHub</a>'+'</div>'+
    (t.summary?'<p class="lede">'+esc(t.summary)+'</p>':'')+
    '<div class="meta">Updated '+esc(fmtDate(t.updated))+'</div>'+
    '<div class="md" id="md">'+renderMd(t.body)+'</div></article>'+
    '<aside class="map" id="map"></aside></div>';
  const heads=enhance($("#md"));
  if(state.q){ highlight($("#md"), state.q); }
  const map=$("#map");
  if(heads.length>1){ map.innerHTML='<h4>On this page</h4>'+heads.map(h=>'<a href="#'+h.id+'" data-h="'+h.id+'">'+esc(h.textContent)+'</a>').join("");
    map.querySelectorAll("a").forEach(a=>a.onclick=e=>{e.preventDefault(); document.getElementById(a.dataset.h)?.scrollIntoView({behavior:"smooth"});}); }
  const eb=$("#editBtn"); if(eb) eb.onclick=()=>edit(t.id);
}

function highlight(root, q){
  const words=q.toLowerCase().split(/\s+/).filter(w=>w.length>1); if(!words.length) return;
  const re=new RegExp("("+words.map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")+")","gi");
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement.closest("button")?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
  const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
  let first=null;
  nodes.forEach(n=>{ if(!re.test(n.nodeValue)) return; re.lastIndex=0;
    const span=document.createElement("span"); span.innerHTML=esc(n.nodeValue).replace(re,"<mark>$1</mark>"); n.replaceWith(span); first=first||span; });
  first?.scrollIntoView({block:"center"});
}

function edit(id){
  const t = id ? state.topics.find(x=>x.id===id) : {title:"",category:state.area||"IAM",summary:"",tags:[],body:"## Where things live\n\n## Common tasks\n\n```bash\n\n```\n\n## Gotchas\n"};
  state.mode="edit";
  const m=$("#main");
  m.innerHTML='<div class="page solo"><form class="editor" id="ed" novalidate>'+
    '<div class="eyebrow"><span>'+(id?'Editing':'New page')+'</span></div>'+
    '<label for="f-title">Title<input id="f-title" required value="'+esc(t.title)+'" placeholder="Jamf Pro: smart groups"></label>'+
    '<div class="row2"><label for="f-cat">Area<select id="f-cat">'+AREAS.map(a=>'<option value="'+a[0]+'"'+(a[0]===t.category?' selected':'')+'>'+a[0]+' — '+esc(a[1])+'</option>').join("")+'</select></label>'+
    '<label for="f-sum">Summary<input id="f-sum" value="'+esc(t.summary)+'" placeholder="One line: what this page helps you do"></label></div>'+
    '<label for="f-tags">Tags (comma separated)<input id="f-tags" value="'+esc((t.tags||[]).join(", "))+'" placeholder="jamf, macos, api"></label>'+
    '<div class="edbar"><div class="tabs" role="tablist"><button type="button" class="btn" role="tab" aria-selected="true" data-tab="write">Write</button><button type="button" class="btn" role="tab" aria-selected="false" data-tab="preview">Preview</button></div><span class="sp"></span><span class="note">Markdown · tables, code blocks and headings supported</span></div>'+
    '<textarea id="f-body" spellcheck="false" aria-label="Page content in Markdown">'+esc(t.body)+'</textarea>'+
    '<div class="preview md" id="pv" hidden></div>'+
    '<div id="edErr" class="err" hidden></div>'+
    '<div class="edbar"><button class="btn primary" type="submit" id="saveBtn">Save page</button><button class="btn" type="button" id="cancelBtn">Cancel</button><span class="sp"></span>'+(id?'<button class="btn danger" type="button" id="delBtn">Delete</button>':'')+'</div>'+
    '<div id="delConfirm" class="confirm" hidden><span>Delete “'+esc(t.title)+'” for good?</span><button class="btn danger" type="button" id="delYes">Delete page</button><button class="btn" type="button" id="delNo">Keep it</button></div>'+
    '</form></div>';
  m.scrollTop=0;
  const body=$("#f-body"), pv=$("#pv");
  m.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{
    const p=b.dataset.tab==="preview";
    m.querySelectorAll("[data-tab]").forEach(x=>x.setAttribute("aria-selected",String(x===b)));
    body.hidden=p; pv.hidden=!p; if(p){ pv.innerHTML=renderMd(body.value); enhance(pv); }
  });
  $("#cancelBtn").onclick=()=>{ state.mode="read"; renderMain(); };
  if(id){
    $("#delBtn").onclick=()=>{ $("#delConfirm").hidden=false; };
    $("#delNo").onclick=()=>{ $("#delConfirm").hidden=true; };
    $("#delYes").onclick=async()=>{
      try{ await state.db.collection("topics").doc(id).delete(); state.mode="read"; state.cur=null; toast("Page deleted"); }
      catch(e){ showErr(e); }
    };
  }
  $("#ed").onsubmit=async e=>{
    e.preventDefault();
    const title=$("#f-title").value.trim();
    if(!title){ return showErr({message:"Give the page a title before saving."}); }
    const doc={ title, category:$("#f-cat").value, summary:$("#f-sum").value.trim(),
      tags:$("#f-tags").value.split(",").map(s=>s.trim()).filter(Boolean), body:body.value,
      order: t.order ?? 50, updated:new Date().toISOString() };
    let newId=id;
    if(!newId){ newId=slug(title); let k=2; while(state.topics.some(x=>x.id===newId)) newId=slug(title)+"-"+(k++); }
    $("#saveBtn").disabled=true;
    try{
      await state.db.collection("topics").doc(newId).set(doc);
      state.mode="read"; state.cur=newId; store("fm.cur",newId); toast("Saved"); renderToc(); renderMain();
    }catch(err){ $("#saveBtn").disabled=false; showErr(err); }
  };
  $("#f-title").focus();
}
function showErr(e){
  const el=$("#edErr"); if(!el) return;
  const map={invalid_argument:"You don’t have permission to change pages here, or the page is too large.",quota_exceeded:"The store is full. Delete a page you no longer need, then save again.",unavailable:"The store didn’t answer. Try saving again in a moment."};
  el.textContent = map[e?.code] || e?.message || "Something went wrong saving this page.";
  el.hidden=false;
}

// search & keys
let qt; $("#q").addEventListener("input",e=>{ clearTimeout(qt); qt=setTimeout(()=>{ state.q=e.target.value.trim(); renderToc(); if(state.mode==="read") renderMain(); },120); });
$("#q").addEventListener("keydown",e=>{ if(e.key==="Enter"){ const first=sorted().find(matches); if(first) show(first.id); } if(e.key==="Escape"){ e.target.value=""; state.q=""; renderToc(); renderMain(); } });
document.addEventListener("keydown",e=>{ if(e.key==="/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){ e.preventDefault(); $("#rail").classList.add("open"); $("#q").focus(); } });
$("#menuBtn").onclick=()=>{ const o=$("#rail").classList.toggle("open"); $("#menuBtn").setAttribute("aria-expanded",String(o)); };
renderChips();

// data: manifest.json is built from content/**/*.md by scripts/build_manifest.py
fetch("manifest.json",{cache:"no-cache"}).then(r=>{ if(!r.ok) throw new Error(r.status); return r.json(); }).then(list=>{
  state.topics=list.filter(t=>t.title);
  const want=decodeURIComponent((location.hash||"").slice(1))||store("fm.cur");
  if(want && state.topics.some(t=>t.id===want)) state.cur=want;
  renderToc(); renderMain();
}).catch(()=>{
  $("#main").innerHTML='<div class="page solo"><div class="empty"><h2>Can’t load the manual</h2><p>manifest.json didn’t load. Serve this folder over HTTP (for example <code>python3 -m http.server</code>) instead of opening the file directly, and run <code>python3 scripts/build_manifest.py</code> if the file is missing.</p></div></div>';
});
