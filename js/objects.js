// ─── SNAP ───
const SNAP_PX=18;

function snapWall(nx,ny,obj){
  const thr=SNAP_PX/SC;let bx=nx,by=ny,mdx=thr,mdy=thr;
  for(const o of objs()){
    if(o.id===obj.id||o._p<0.5||isFloor(o.t))continue;
    for(const cx of[o.x-obj.w,o.x+o.w,o.x,o.x+o.w-obj.w]){const d=Math.abs(nx-cx);if(d<mdx){mdx=d;bx=cx;}}
    for(const cy of[o.y-obj.h,o.y+o.h,o.y,o.y+o.h-obj.h]){const d=Math.abs(ny-cy);if(d<mdy){mdy=d;by=cy;}}
  }
  return{x:Math.round(Math.max(0,Math.min(W.len-obj.w,bx))),y:Math.round(Math.max(0,Math.min(W.h-obj.h,by)))};
}
function snapFloor(nx,nrd,obj){
  const thr=SNAP_PX/SC;let bx=nx,br=nrd,mdx=thr,mdr=thr;
  for(const o of objs()){
    if(o.id===obj.id||o._p<0.5||!isFloor(o.t))continue;
    for(const cx of[o.x-obj.w,o.x+o.w,o.x,o.x+o.w-obj.w]){const d=Math.abs(nx-cx);if(d<mdx){mdx=d;bx=cx;}}
    for(const cr of[(o.rd||0)-obj.d,(o.rd||0)+o.d,(o.rd||0),(o.rd||0)+o.d-obj.d]){const d=Math.abs(nrd-cr);if(d<mdr){mdr=d;br=cr;}}
  }
  return{x:Math.round(Math.max(0,Math.min(W.len-obj.w,bx))),rd:Math.round(Math.max(0,Math.min(FLOOR_DEPTH-obj.d,br)))};
}

// ─── COLLISION ───
function objAABB(o){
  if(isFloor(o.t))return{x1:o.x,x2:o.x+o.w,y1:0,y2:o.h,z1:o.rd||0,z2:(o.rd||0)+o.d};
  const wz=o.wz||0;return{x1:o.x,x2:o.x+o.w,y1:o.y,y2:o.y+o.h,z1:wz,z2:wz+o.d};
}
function aabbOverlap(a,b){const G=2;return a.x1<b.x2-G&&a.x2>b.x1+G&&a.y1<b.y2-G&&a.y2>b.y1+G&&a.z1<b.z2-G&&a.z2>b.z1+G;}
function hasCollision(o){const a=objAABB(o);for(const other of objs()){if(other.id===o.id||other._p<0.5)continue;if(aabbOverlap(a,objAABB(other)))return true;}return false;}
function resolveCollision(o){
  if(!hasCollision(o))return;
  const orig={x:o.x,y:o.y,rd:o.rd||0,wz:o.wz||0};
  const floor=isFloor(o.t);
  if(floor){
    for(let s=5;s<=FLOOR_DEPTH;s+=5){o.rd=Math.min(FLOOR_DEPTH-o.d,orig.rd+s);if(!hasCollision(o))return;}
    o.rd=orig.rd;for(let s=5;s<=FLOOR_DEPTH;s+=5){o.rd=Math.max(0,orig.rd-s);if(!hasCollision(o))return;}
    o.rd=orig.rd;for(let s=5;s<=W.len;s+=5){o.x=Math.min(W.len-o.w,orig.x+s);if(!hasCollision(o))return;}
    o.x=orig.x;for(let s=5;s<=W.len;s+=5){o.x=Math.max(0,orig.x-s);if(!hasCollision(o))return;}
    o.x=orig.x;o.rd=orig.rd;
  } else {
    for(let s=5;s<=W.len;s+=5){o.x=Math.min(W.len-o.w,orig.x+s);if(!hasCollision(o))return;}
    o.x=orig.x;for(let s=5;s<=W.len;s+=5){o.x=Math.max(0,orig.x-s);if(!hasCollision(o))return;}
    o.x=orig.x;for(let s=5;s<=W.h;s+=5){o.y=Math.min(W.h-o.h,orig.y+s);if(!hasCollision(o))return;}
    o.y=orig.y;for(let s=5;s<=W.h;s+=5){o.y=Math.max(0,orig.y-s);if(!hasCollision(o))return;}
    o.x=orig.x;o.y=orig.y;
  }
}

// ─── HITBOX ───
function objExtents(o){return{w:o.w,h:o.h,d:o.d};}
function hitWall(o,px,py){
  const wz=o.wz||0;
  const{w,h,d}=objExtents(o);
  const pts=[iso(o.x,o.y,wz),iso(o.x+w,o.y,wz),iso(o.x+w,o.y+h,wz),iso(o.x,o.y+h,wz),
             iso(o.x,o.y,wz+d),iso(o.x+w,o.y,wz+d),iso(o.x+w,o.y+h,wz+d),iso(o.x,o.y+h,wz+d)];
  const minX=Math.min(...pts.map(p=>p[0]))-8,maxX=Math.max(...pts.map(p=>p[0]))+8;
  const minY=Math.min(...pts.map(p=>p[1]))-8,maxY=Math.max(...pts.map(p=>p[1]))+8;
  return px>=minX&&px<=maxX&&py>=minY&&py<=maxY;
}
function hitFloor(o,px,py){
  const rd=o.rd||0;
  const{w,h,d}=objExtents(o);
  const pts=[iso(o.x,0,rd+d),iso(o.x+w,0,rd+d),iso(o.x+w,h,rd+d),iso(o.x,h,rd+d),
             iso(o.x,h,rd),iso(o.x+w,h,rd)];
  const minX=Math.min(...pts.map(p=>p[0]))-8,maxX=Math.max(...pts.map(p=>p[0]))+8;
  const minY=Math.min(...pts.map(p=>p[1]))-8,maxY=Math.max(...pts.map(p=>p[1]))+8;
  return px>=minX&&px<=maxX&&py>=minY&&py<=maxY;
}
function hitO(o,px,py){return isFloor(o.t)?hitFloor(o,px,py):hitWall(o,px,py);}
function hitLt(px,py){const[lx,ly]=wp(LT.x,LT.y);return Math.sqrt((px-lx)**2+(py-ly)**2)<18;}

// ─── COPY / PASTE ───
function copyObj(id){const o=objs().find(b=>b.id===id);if(!o)return;clipboard={...o};toast(t('copied'),1500);}
function pasteObj(){
  if(!clipboard)return;
  const o=makeObj(clipboard.t,Math.min(clipboard.x+30,W.len-clipboard.w),clipboard.y,clipboard.w,clipboard.h,clipboard.d,clipboard.color,clipboard.label);
  o.rd=clipboard.rd||0;o.wz=clipboard.wz||0;o.meshKey=clipboard.meshKey||null;
  if(clipboard.texUrl){o.texUrl=clipboard.texUrl;const img=new Image();img.src=clipboard.texUrl;img.onload=()=>{TC[o.id]=img;draw();};TC[o.id]=img;}
  objs().push(o);sel=o.id;refreshList();refreshEdit();draw();snapshot();
}

// ─── MULTI-SELECT ───
function toggleMultiSel(id){
  if(multiSel.has(id))multiSel.delete(id);else multiSel.add(id);
  refreshList();draw();
}
function clearMultiSel(){multiSel.clear();}

// ─── RUBBER BAND ───
function startRubberBand(px,py){rbStart={px,py};rbActive=false;}
function updateRubberBand(px,py){
  const rb=document.getElementById('rband');
  const vp=document.getElementById('vp');
  const vr=vp.getBoundingClientRect(),cr=cv.getBoundingClientRect();
  const scx=cr.width/cv.width,scy=cr.height/cv.height;
  const x1=Math.min(rbStart.px,px)*scx+cr.left-vr.left;
  const y1=Math.min(rbStart.py,py)*scy+cr.top-vr.top;
  const x2=Math.max(rbStart.px,px)*scx+cr.left-vr.left;
  const y2=Math.max(rbStart.py,py)*scy+cr.top-vr.top;
  rb.style.cssText=`display:block;left:${x1}px;top:${y1}px;width:${x2-x1}px;height:${y2-y1}px;`;
  rbActive=true;
}
function endRubberBand(px,py){
  document.getElementById('rband').style.display='none';
  if(!rbActive){rbStart=null;return;}
  const x1=Math.min(rbStart.px,px),x2=Math.max(rbStart.px,px);
  const y1=Math.min(rbStart.py,py),y2=Math.max(rbStart.py,py);
  multiSel.clear();
  objs().forEach(o=>{
    if(o.locked)return;
    const pts=isFloor(o.t)?
      [iso(o.x,0,o.rd||0),iso(o.x+o.w,0,(o.rd||0)+o.d)]:
      [iso(o.x,o.y,o.wz||0),iso(o.x+o.w,o.y+o.h,(o.wz||0)+o.d)];
    const ox=(pts[0][0]+pts[1][0])/2,oy=(pts[0][1]+pts[1][1])/2;
    if(ox>=x1&&ox<=x2&&oy>=y1&&oy<=y2)multiSel.add(o.id);
  });
  rbStart=null;rbActive=false;
  if(multiSel.size===1){sel=[...multiSel][0];multiSel.clear();}
  refreshList();refreshEdit();draw();updateSelActions();
}

// ─── LOCK ───
function toggleLock(){
  const o=objs().find(b=>b.id===sel);if(!o)return;
  o.locked=!o.locked;
  const btn=document.getElementById('lock-btn');
  if(btn)btn.textContent=o.locked?'⊠ Unlock object':'⊠ Lock object';
  refreshList();draw();snapshot();
}

// ─── ALIGN & DISTRIBUTE ───
function alignSel(mode){
  const ids=multiSel.size>1?[...multiSel]:(sel?[sel]:[]);
  if(ids.length<2&&!mode.startsWith('center'))return;
  const os=ids.map(id=>objs().find(o=>o.id===id)).filter(Boolean).filter(o=>!o.locked);
  if(!os.length)return;
  snapshot();
  const wallOs=os.filter(o=>!isFloor(o.t)),flOs=os.filter(o=>isFloor(o.t));
  const work=wallOs.length?wallOs:flOs;
  if(!work.length)return;
  const isF=isFloor(work[0].t);
  if(mode==='left')     {const mn=Math.min(...work.map(o=>o.x));work.forEach(o=>o.x=mn);}
  else if(mode==='right'){const mx=Math.max(...work.map(o=>o.x+o.w));work.forEach(o=>o.x=mx-o.w);}
  else if(mode==='centerH'){const mn=Math.min(...work.map(o=>o.x)),mx=Math.max(...work.map(o=>o.x+o.w));const c=(mn+mx)/2;work.forEach(o=>o.x=Math.round(c-o.w/2));}
  else if(mode==='top'&&!isF)  {const mx=Math.max(...work.map(o=>o.y+o.h));work.forEach(o=>o.y=mx-o.h);}
  else if(mode==='bottom'&&!isF){const mn=Math.min(...work.map(o=>o.y));work.forEach(o=>o.y=mn);}
  else if(mode==='centerV'&&!isF){const mn=Math.min(...work.map(o=>o.y)),mx=Math.max(...work.map(o=>o.y+o.h));const c=(mn+mx)/2;work.forEach(o=>o.y=Math.round(c-o.h/2));}
  else if(mode==='distH'&&work.length>2){
    work.sort((a,b)=>a.x-b.x);
    const totalW=work.reduce((s,o)=>s+o.w,0);
    const gap=(work[work.length-1].x+work[work.length-1].w-work[0].x-totalW)/(work.length-1);
    let cx=work[0].x+work[0].w;
    for(let i=1;i<work.length-1;i++){work[i].x=Math.round(cx+gap);cx=work[i].x+work[i].w;}
  }
  else if(mode==='distV'&&work.length>2&&!isF){
    work.sort((a,b)=>a.y-b.y);
    const totalH=work.reduce((s,o)=>s+o.h,0);
    const gap=(work[work.length-1].y+work[work.length-1].h-work[0].y-totalH)/(work.length-1);
    let cy=work[0].y+work[0].h;
    for(let i=1;i<work.length-1;i++){work[i].y=Math.round(cy+gap);cy=work[i].y+work[i].h;}
  }
  draw();refreshList();snapshot();
}
