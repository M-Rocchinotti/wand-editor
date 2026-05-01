// ─── MATERIAL GRID ───
function buildMaterialGrid(){
  const g=document.getElementById('mat-grid');if(!g)return;g.innerHTML='';
  MATERIALS.forEach(m=>{
    const s=document.createElement('div');s.className='mat-swatch';
    s.style.background=`linear-gradient(135deg,${m.color} 60%,${m.side})`;
    s.title=m.name;
    s.innerHTML=`<span>${m.name}</span>`;
    s.onclick=()=>{
      const o=objs().find(b=>b.id===sel);
      if(o){o.color=m.color;document.getElementById('ce').value=m.color;document.getElementById('fc-sel').style.background=m.color;draw();snapshot();}
      else{setWC('wall',m.color);setWC('side',m.side);}
      toast(m.name,1200);
    };
    g.appendChild(s);
  });
}

// ─── PALETTE SEARCH / FILTER ───
function filterPalette(q){
  q=q.toLowerCase().trim();
  document.querySelectorAll('#pal .el-chip').forEach(chip=>{
    const label=chip.querySelector('span:last-child')?.textContent.toLowerCase()||'';
    chip.style.display=(!q||label.includes(q))?'':'none';
  });
  document.querySelectorAll('#pal .el-cat').forEach(cat=>{
    let next=cat.nextElementSibling,anyVis=false;
    while(next&&!next.classList.contains('el-cat')){if(next.style.display!=='none')anyVis=true;next=next.nextElementSibling;}
    cat.style.display=anyVis?'':'none';
  });
}

// ─── TOAST ───
function toast(msg,ms=0){const el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');if(toastT)clearTimeout(toastT);if(ms>0)toastT=setTimeout(hideToast,ms);}
function hideToast(){document.getElementById('toast').classList.remove('show');}

// ─── MOBILE ───
function togglePanel(){const s=document.getElementById('side'),o=document.getElementById('overlay');const op=s.classList.toggle('open');o.classList.toggle('open',op);document.getElementById('menuBtn').textContent=op?'✕':'☰';}
function closePanel(){document.getElementById('side').classList.remove('open');document.getElementById('overlay').classList.remove('open');document.getElementById('menuBtn').textContent='☰';}
function updateSelActions(){const bar=document.getElementById('selActions');if(bar)bar.classList.toggle('show',!!sel);}

// ─── THEME ───
function toggleTheme(){
  const light=document.body.classList.toggle('light');
  document.getElementById('theme-btn').textContent=light?'☀':'☾';
  localStorage.setItem('theme',light?'light':'dark');
  draw();if(fpVisible)drawFloorPlan();
}

// ─── LIST + EDIT ───
function refreshList(){
  const sec=document.getElementById('ob-sec'),list=document.getElementById('ob-list');
  const os=objs();if(!os.length){sec.style.display='none';return;}
  sec.style.display='block';
  list.innerHTML=os.map((o,i)=>`<div class="ob${sel===o.id?' on':''}${o.locked?' locked':''}${multiSel.has(o.id)?' on':''}" onclick="selObj(${o.id})" ondblclick="toggleMultiSel(${o.id})"><div class="ob-dot" style="background:${o.color}"></div><span class="ob-nm">${o.label}${o.locked?' 🔒':''}</span><button class="ib" onclick="event.stopPropagation();layerUp(${o.id})"${i===os.length-1?' style="opacity:.2"':''}>▲</button><button class="ib" onclick="event.stopPropagation();layerDn(${o.id})"${i===0?' style="opacity:.2"':''}>▼</button><button class="ib" onclick="event.stopPropagation();copyObj(${o.id})">⎘</button><button class="ib del" onclick="event.stopPropagation();doDelete(${o.id})">×</button></div>`).join('');
}

function refreshEdit(){
  const sec=document.getElementById('ed-sec'),o=objs().find(b=>b.id===sel);
  if(!o){sec.style.display='none';return;}
  sec.style.display='block';
  document.getElementById('ebh').textContent=o.label;
  const flds=document.getElementById('ef');flds.innerHTML='';
  const _nr=document.createElement('div');_nr.className='cr';
  _nr.innerHTML=`<span class="rl">${t('nameLabel')}</span><input type="text" style="flex:1;background:var(--s2);border:1px solid var(--b2);border-radius:3px;color:var(--mt);padding:3px 6px;font-size:11px;font-family:Inter,sans-serif;min-width:0" value="${o.label.replace(/"/g,'&quot;')}" id="ef-label">`;
  flds.appendChild(_nr);
  const _li=document.getElementById('ef-label');
  _li.oninput=()=>{if(_li.value.trim()){o.label=_li.value.trim();document.getElementById('ebh').textContent=o.label;refreshList();if(fpVisible)drawFloorPlan();}};
  _li.onblur=()=>{if(_li.value.trim()!==o.label&&_li.value.trim())snapshot();};
  _li.onkeydown=e=>{if(e.key==='Enter'){_li.blur();}if(e.key==='Escape'){_li.value=o.label;}};
  const syncDist=()=>{
    const set=(sel2,val)=>{const r=flds.querySelector(`[data-fld="${sel2}"]`);if(!r)return;r.querySelector('.cmr').value=val;r.querySelector('.cmi').value=val;};
    set('x',Math.round(o.x));
    set('fromRight',Math.round(W.len-o.w-o.x));
    if(!isFloor(o.t)){
      set('y',Math.round(o.y));
      set('fromTop',Math.round(W.h-o.h-o.y));
    }
  };
  const addF=(lbl,key,mn,mx,st)=>{
    const row=document.createElement('div');row.className='cr';row.dataset.fld=key;
    row.innerHTML=`<span class="rl">${lbl}</span><input type="range" class="cmr" min="${mn}" max="${mx}" step="${st}" value="${Math.round(o[key]||0)}" id="efr-${key}"><input type="number" class="cmi" value="${Math.round(o[key]||0)}" id="efn-${key}"><span class="cmu">mm</span>`;
    flds.appendChild(row);
    const r2=document.getElementById('efr-'+key),n=document.getElementById('efn-'+key);
    r2.oninput=()=>{n.value=r2.value;o[key]=+r2.value;draw();refreshList();syncDist();};
    n.onchange=()=>{r2.value=n.value;o[key]=+n.value;draw();refreshList();syncDist();};
  };
  const addD=(lbl,fld,val,mn,mx,onSet)=>{
    const row=document.createElement('div');row.className='cr';row.dataset.fld=fld;
    row.innerHTML=`<span class="rl">${lbl}</span><input type="range" class="cmr" min="${mn}" max="${mx}" step="1" value="${val}"><input type="number" class="cmi" value="${val}"><span class="cmu">mm</span>`;
    flds.appendChild(row);
    const r2=row.querySelector('.cmr'),n=row.querySelector('.cmi');
    r2.oninput=()=>{n.value=r2.value;onSet(+r2.value);syncDist();};
    n.onchange=()=>{r2.value=n.value;onSet(+n.value);syncDist();};
  };
  addF(t('width'),'w',10,6000,10);addF(t('height'),'h',5,3000,5);
  if(isFloor(o.t)){
    addF(t('depth'),'d',10,FLOOR_DEPTH,5);
    addF(t('distFromWall'),'rd',0,Math.max(0,FLOOR_DEPTH-o.d),10);
    addF(t('fromLeft'),'x',0,Math.max(0,W.len-o.w),10);
    addD(t('fromRight'),'fromRight',Math.round(W.len-o.x-o.w),0,Math.max(0,W.len-o.w),v=>{o.x=Math.max(0,Math.min(W.len-o.w,W.len-o.w-v));draw();refreshList();});
  } else {
    addF(t('protrusion'),'d',1,FLOOR_DEPTH,5);
    addF(t('awayFromWall'),'wz',0,FLOOR_DEPTH,5);
    addF(t('fromLeft'),'x',0,Math.max(0,W.len-o.w),10);
    addD(t('fromRight'),'fromRight',Math.round(W.len-o.x-o.w),0,Math.max(0,W.len-o.w),v=>{o.x=Math.max(0,Math.min(W.len-o.w,W.len-o.w-v));draw();refreshList();});
    addF(t('fromFloor'),'y',0,Math.max(0,W.h-o.h),5);
    addD(t('fromTop'),'fromTop',Math.round(W.h-o.y-o.h),0,Math.max(0,W.h-o.h),v=>{o.y=Math.max(0,Math.min(W.h-o.h,W.h-o.h-v));draw();refreshList();});
  }
  document.getElementById('ce').value=o.color;
  document.getElementById('fc-sel').style.background=o.color;
  const tp=document.getElementById('tp');
  if(o.texUrl){tp.src=o.texUrl;tp.style.display='block';}else{tp.src='';tp.style.display='none';}
}

function selObj(id){sel=sel===id?null:id;refreshList();refreshEdit();draw();updateSelActions();}
function doDelete(id){
  const delId=id!==undefined?id:sel;
  if(!delId){toast(t('selectFirst'),1500);return;}
  const os=objs(),i=os.findIndex(o=>o.id===delId);
  if(i>=0)os.splice(i,1);
  if(sel===delId)sel=null;
  refreshList();refreshEdit();draw();updateSelActions();snapshot();
}
function setSelC(v){const o=objs().find(b=>b.id===sel);if(!o)return;o.color=v;document.getElementById('fc-sel').style.background=v;draw();}
function layerUp(id){const os=objs(),i=os.findIndex(o=>o.id===id);if(i<os.length-1)[os[i],os[i+1]]=[os[i+1],os[i]];refreshList();draw();}
function layerDn(id){const os=objs(),i=os.findIndex(o=>o.id===id);if(i>0)[os[i],os[i-1]]=[os[i-1],os[i]];refreshList();draw();}

// ─── PALETTE ───
function buildPalette(){
  const pal=document.getElementById('pal');
  pal.innerHTML='';
  let lastCat='';
  ETYPES.forEach(et=>{
    if(et.cat!==lastCat){lastCat=et.cat;const h=document.createElement('div');h.className='el-cat';h.textContent=tCat(et.cat);pal.appendChild(h);}
    const d=document.createElement('div');d.className='el-chip';d.dataset.t=et.t;
    const elLabel=et.labelKey?t(et.labelKey):et.label;
    d.innerHTML=`<span class="el-ico"><svg width="22" height="14" viewBox="0 0 22 14">${IC[et.t]||''}</svg></span><span style="flex:1">${elLabel}</span>`;
    d.addEventListener('click',()=>placing===et.t?stopPlacing():startPlacing(et.t));
    pal.appendChild(d);
  });
  if(placing) document.querySelectorAll('.el-chip').forEach(c=>c.classList.toggle('active',c.dataset.t===placing));
  const pr=document.getElementById('prow');
  if(pr&&!pr.children.length){
    PSETS.forEach(hex=>{const d=document.createElement('div');d.className='ps';d.style.background=hex;d.onclick=()=>{document.getElementById('ce').value=hex;setSelC(hex);};pr.appendChild(d);});
  }
}

// ─── WALL SLIDERS ───
function syncS(id,val){const r=document.getElementById('r-'+id),n=document.getElementById('n-'+id);if(r){r.value=val;n.value=val;}}
function setWC(k,v){W.col[k]=v;document.getElementById('fc-'+k).style.background=v;draw();}

// ─── PLACING ───
function startPlacing(tp){placing=tp;ghostPx=null;ghostPy=null;document.querySelectorAll('.el-chip').forEach(c=>c.classList.toggle('active',c.dataset.t===tp));cv.style.cursor='crosshair';toast(tp==='light'?t('clickWall')+' · Esc':isFloor(tp)?t('clickWall')+' · Esc':t('clickWall')+' · Esc');}
function stopPlacing(){placing=null;ghostPx=null;ghostPy=null;document.querySelectorAll('.el-chip').forEach(c=>c.classList.remove('active'));cv.style.cursor='';hideToast();}

// ─── TEXTURE ───
function loadTex(inp){const f=inp.files[0];if(!f||!sel)return;const r=new FileReader();r.onload=e=>{const i=new Image();i.onload=()=>{TC[sel]=i;const o=objs().find(b=>b.id===sel);if(o)o.texUrl=e.target.result;draw();refreshEdit();};i.src=e.target.result;};r.readAsDataURL(f);inp.value='';}
function clearTex(){if(!sel)return;delete TC[sel];const o=objs().find(b=>b.id===sel);if(o)o.texUrl=null;draw();refreshEdit();}

// ─── PAGES ───
function addPage(){
  const prev=pages[pages.length-1];
  const baseWZ=prev.objs.filter(o=>!isFloor(o.t)).reduce((m,o)=>Math.max(m,(o.wz||0)+o.d),0);
  pages.push({name:`Page ${pages.length+1}`,objs:[],baseWZ});
  goTo(pages.length-1);
}
function renamePage(i){const n=prompt(t('rename'),pages[i].name);if(n&&n.trim()){pages[i].name=n.trim();buildTabs();buildDots();}}
function goTo(n){if(n===curP)return;stopPlacing();sel=null;curP=n;buildTabs();buildDots();document.getElementById('sn').textContent=t('pageOf',curP+1,pages.length);document.getElementById('st').textContent=pages[curP].name;draw();refreshList();refreshEdit();}
function go(dir){const n=Math.max(0,Math.min(pages.length-1,curP+dir));if(n!==curP)goTo(n);}

function buildTabs(){
  const bar=document.getElementById('tb');bar.innerHTML='';
  pages.forEach((p,i)=>{const t2=document.createElement('div');t2.className='tab'+(i===curP?' on':'');t2.textContent=`${i+1}. ${p.name}`;t2.onclick=()=>goTo(i);t2.ondblclick=()=>renamePage(i);bar.appendChild(t2);});
  const add=document.createElement('button');add.className='tab-add';add.innerHTML=t('addPage');add.onclick=addPage;bar.appendChild(add);
  const r=document.createElement('div');r.className='tab-r';
  r.innerHTML=`<button class="io load" onclick="document.getElementById('fi').click()">${t('open')}</button><button class="io save" onclick="saveP()">${t('save')}</button><button class="narr"${curP===0?' disabled':''} onclick="go(-1)">◂</button><button class="narr"${curP===pages.length-1?' disabled':''} onclick="go(1)">▸</button>`;
  bar.appendChild(r);
}
function buildDots(){
  const nav=document.getElementById('dnav');nav.innerHTML='';
  pages.forEach((p,i)=>{const d=document.createElement('div');d.className='dot'+(i===curP?' on':'');d.onclick=()=>goTo(i);const tip=document.createElement('div');tip.className='dtip';tip.textContent=`${i+1}. ${p.name}`;d.appendChild(tip);nav.appendChild(d);});
}
