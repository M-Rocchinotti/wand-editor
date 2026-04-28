// ─── UNDO / REDO ───
function snapshot(){
  const state=JSON.stringify({wall:{...W,col:{...W.col}},light:{...LT},curP,pages:pages.map(p=>({name:p.name,baseWZ:p.baseWZ||0,objs:p.objs.map(o=>({...o}))}))});
  if(undoStack.length&&undoStack[undoStack.length-1]===state)return;
  undoStack.push(state);if(undoStack.length>60)undoStack.shift();
  redoStack.length=0;updateUndoUI();
}
function updateUndoUI(){
  const ub=document.getElementById('undo-btn'),rb=document.getElementById('redo-btn');
  if(ub)ub.disabled=undoStack.length<2;
  if(rb)rb.disabled=!redoStack.length;
}
function applySnapshot(state){
  const d=JSON.parse(state);
  Object.assign(W,d.wall);
  syncS('wl',W.len);syncS('wh',W.h);syncS('wd',W.d);
  ['wall','side','floor'].forEach(k=>{const el=document.getElementById('fc-'+k);if(el)el.style.background=W.col[k];});
  Object.assign(LT,d.light);
  if(LT.on)document.getElementById('lt-sec').style.display='block';
  pages.length=0;let maxId=0;
  d.pages.forEach(p=>{
    const os=p.objs.map(o=>{maxId=Math.max(maxId,o.id);return{...o,_p:1};});
    pages.push({name:p.name,baseWZ:p.baseWZ||0,objs:os});
  });
  nextId=maxId+1;curP=Math.min(d.curP,pages.length-1);sel=null;multiSel.clear();
  buildTabs();buildDots();refreshList();refreshEdit();draw();updateUndoUI();
}
function undo(){if(undoStack.length<2)return;redoStack.push(undoStack.pop());applySnapshot(undoStack[undoStack.length-1]);}
function redo(){if(!redoStack.length)return;const s=redoStack.pop();undoStack.push(s);applySnapshot(s);}

// ─── SAVE / LOAD ───
async function saveP(){
  toast(t('saving'));
  const baseName=pages[curP]?.name||'wall';
  const usedMeshKeys=new Set();
  for(const p of pages)for(const o of p.objs)if(o.meshKey)usedMeshKeys.add(o.meshKey);
  const hasMeshes=usedMeshKeys.size>0;
  const meshKeyToFile={};
  [...usedMeshKeys].forEach((k,i)=>{meshKeyToFile[k]='mesh_'+i+'.obj';});
  const meshTexToFile={};
  [...usedMeshKeys].forEach((k,i)=>{if(MESH_TEX[k])meshTexToFile[k]='mesh_tex_'+i+'.png';});
  const data={v:6,wall:{...W,col:{...W.col}},light:{...LT},curP,meshKeyMap:meshKeyToFile,meshTexKeyMap:meshTexToFile,
    pages:pages.map(p=>({name:p.name,objs:p.objs.map(o=>({id:o.id,t:o.t,x:o.x,y:o.y,w:o.w,h:o.h,d:o.d,wz:o.wz||0,color:o.color,label:o.label,texUrl:o.texUrl||null,rd:o.rd||0,meshKey:o.meshKey||null,meshFile:o.meshKey?meshKeyToFile[o.meshKey]:null}))}))};
  if(!hasMeshes){
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download=baseName+'.wallstudio';a.click();toast(t('saved'),2200);return;
  }
  const zip=new JSZip();
  zip.file('scene.wallstudio',JSON.stringify(data,null,2));
  for(const[key,filename]of Object.entries(meshKeyToFile)){const mesh=MESHES[key];if(!mesh)continue;zip.file(filename,meshToOBJ(mesh));}
  for(const[key,filename]of Object.entries(meshTexToFile)){const img=MESH_TEX[key];if(!img)continue;const b64=imgToB64(img);zip.file(filename,b64,{base64:true});}
  const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=baseName+'.wallstudio.zip';a.click();toast(t('savedZip'),2500);
}

function loadFile(inp){
  const f=inp.files[0];if(!f)return;inp.value='';
  const ext=f.name.split('.').pop().toLowerCase();
  if(ext==='zip'){loadZip(f);return;}
  const r=new FileReader();r.onload=e=>applyScene(e.target.result);r.readAsText(f);
}
async function loadZip(f){
  toast(t('loadingZip'));
  try{
    const zip=await JSZip.loadAsync(f);
    const sf=zip.file('scene.wallstudio');if(!sf)throw new Error('No scene.wallstudio in ZIP');
    const txt=await sf.async('text');const data=JSON.parse(txt);
    if(data.meshKeyMap){for(const[key,fn]of Object.entries(data.meshKeyMap)){const mf=zip.file(fn);if(!mf)continue;const t2=await mf.async('text');const mesh=processMesh(parseOBJ(t2));if(mesh)MESHES[key]=mesh;}}
    if(data.meshTexKeyMap){for(const[key,fn]of Object.entries(data.meshTexKeyMap)){const tf=zip.file(fn);if(!tf)continue;const b64=await tf.async('base64');const img=new Image();img.src='data:image/png;base64,'+b64;await new Promise(r=>{img.onload=r;img.onerror=r;});MESH_TEX[key]=img;}}
    if(data.pages)for(const p of data.pages)for(const o of p.objs)if(o.meshKey&&!ETYPES.find(e=>e.t==='custom_'+o.meshKey)){const entry={t:'custom_'+o.meshKey,label:o.label,w:o.w,h:o.h,d:o.d,color:o.color,cat:'Floor furniture',meshKey:o.meshKey,imported:true};ETYPES.push(entry);IMPORTED.push(entry);}
    rebuildImportedPalette();
    applyScene(txt);toast(t('loaded'),2200);
  }catch(err){toast('Error: '+err.message,3500);console.error(err);}
}
function applyScene(txt){
  try{
    const data=JSON.parse(txt);if(!data.wall||!data.pages)throw new Error('Bad file');
    Object.assign(W,data.wall);syncS('wl',W.len);syncS('wh',W.h);syncS('wd',W.d);
    ['wall','side','floor'].forEach(k=>{const el=document.getElementById('fc-'+k);if(el)el.style.background=W.col[k];});
    if(data.light){Object.assign(LT,data.light);if(LT.on)document.getElementById('lt-sec').style.display='block';}
    pages.length=0;let maxId=0;
    data.pages.forEach(p=>{
      const os=p.objs.map(o=>{
        maxId=Math.max(maxId,o.id);
        const obj={...o,_p:1,rd:o.rd||0,wz:o.wz||0,meshKey:o.meshKey||null};
        if(o.texUrl&&o.texUrl.startsWith('data:')){const img=new Image();img.src=o.texUrl;img.onload=()=>{TC[o.id]=img;draw();};TC[o.id]=img;}
        return obj;
      });
      pages.push({name:p.name,baseWZ:p.baseWZ||0,objs:os});
    });
    nextId=maxId+1;curP=Math.min(data.curP??0,pages.length-1);sel=null;
    buildTabs();buildDots();
    document.getElementById('sn').textContent=t('pageOf',curP+1,pages.length);
    document.getElementById('st').textContent=pages[curP]?.name||'';
    refreshList();refreshEdit();draw();toast(t('loaded'),2200);
  }catch(err){toast('Error: '+err.message,3000);console.error(err);}
}

// ─── SHAREABLE LINK ───
function shareLink(){
  try{
    const data={v:7,wall:{...W,col:{...W.col}},light:{...LT},curP,
      pages:pages.map(p=>({name:p.name,baseWZ:p.baseWZ||0,objs:p.objs.map(o=>({id:o.id,t:o.t,x:o.x,y:o.y,w:o.w,h:o.h,d:o.d,wz:o.wz||0,color:o.color,label:o.label,rd:o.rd||0,locked:!!o.locked}))}))};
    const json=JSON.stringify(data);
    const b64=btoa(unescape(encodeURIComponent(json)));
    const url=location.href.split('#')[0]+'#'+b64;
    navigator.clipboard.writeText(url).then(()=>toast('Link copied!',2500)).catch(()=>{
      prompt('Copy this link:',url);
    });
  }catch(err){toast('Share error',2000);}
}
function loadFromHash(){
  try{
    const h=location.hash.slice(1);if(!h)return;
    const json=decodeURIComponent(escape(atob(h)));
    applyScene(json);toast('Scene loaded from link',2500);
    history.replaceState(null,'',location.pathname);
  }catch(e){/* no hash or bad hash */}
}
