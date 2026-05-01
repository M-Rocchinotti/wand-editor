// ─── CANVAS POINTER HELPER ───
function cvPt(e){const r=cv.getBoundingClientRect();return{px:(e.clientX-r.left)*cv.width/r.width,py:(e.clientY-r.top)*cv.height/r.height};}

// ─── WALL SLIDERS ───
[['wl','len'],['wh','h'],['wd','d']].forEach(([id,key])=>{
  const r=document.getElementById('r-'+id),n=document.getElementById('n-'+id);
  if(!r)return;
  r.oninput=()=>{n.value=r.value;W[key]=+r.value;draw();};
  r.onchange=()=>snapshot();
  n.onchange=()=>{r.value=n.value;W[key]=+n.value;draw();snapshot();};
});

// ─── CANVAS POINTER EVENTS ───
cv.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;
  const{px,py}=cvPt(e);
  if(LT.on&&hitLt(px,py)){e.preventDefault();cv.setPointerCapture(e.pointerId);dragLt=true;return;}
  if(placing){
    const def=ETYPES.find(d=>d.t===placing);if(!def)return;
    if(def.t==='light'){const{x,y}=screenToWall(px,py);LT.x=Math.round(x);LT.y=Math.round(y);LT.on=true;document.getElementById('lt-sec').style.display='block';stopPlacing();draw();snapshot();return;}
    if(isFloor(def.t)){
      const{wx,wz:wzR}=screenToFloor(px,py);
      let x=Math.round(Math.max(0,Math.min(W.len-def.w,wx-def.w/2)));
      const wzC=Math.max(10+def.d/2,Math.min(FLOOR_DEPTH-def.d/2,wzR));
      let rd=Math.round(Math.max(0,Math.min(FLOOR_DEPTH-def.d,wzC-def.d/2)));
      const sf=snapFloor(x,rd,{id:-1,w:def.w,h:def.h,d:def.d,t:def.t,_p:1});x=sf.x;rd=sf.rd;
      const o=makeObj(def.t,x,0,def.w,def.h,def.d,def.color,def.label);
      o.rd=rd;if(def.meshKey)o.meshKey=def.meshKey;
      resolveCollision(o);
      objs().push(o);sel=null;ghostPx=null;ghostPy=null;
      draw();refreshList();refreshEdit();updateSelActions();snapshot();return;
    }
    const baseWZ=pages[curP].baseWZ||0;
    const{x:rx,y:ry}=screenToWall(px,py,baseWZ);
    if(rx<-50||rx>W.len+50||ry<-50||ry>W.h+50){toast(t('clickWall'));return;}
    let px2=Math.round(Math.max(0,Math.min(W.len-def.w,rx-def.w/2)));
    let py2=Math.round(Math.max(0,Math.min(W.h-def.h,ry-def.h/2)));
    const sw=snapWall(px2,py2,{id:-1,w:def.w,h:def.h,d:def.d,t:def.t,wz:baseWZ,_p:1});px2=sw.x;py2=sw.y;
    const o=makeObj(def.t,px2,py2,def.w,def.h,def.d,def.color,def.label);
    o.wz=baseWZ;
    if(def.meshKey)o.meshKey=def.meshKey;
    resolveCollision(o);
    objs().push(o);sel=null;ghostPx=null;ghostPy=null;
    draw();refreshList();refreshEdit();updateSelActions();snapshot();return;
  }
  const list=[...objs()].filter(o=>o._p>.5&&!o.locked).reverse();
  for(const o of list){
    if(hitO(o,px,py)){
      e.preventDefault();cv.setPointerCapture(e.pointerId);
      if(e.shiftKey){toggleMultiSel(o.id);return;}
      if(multiSel.size>0&&multiSel.has(o.id)){
        dragObj=o;cv.style.cursor='grabbing';
        dragStartPos={x:o.x,y:o.y,rd:o.rd||0};
        if(isFloor(o.t)){const{wx,wz}=screenToFloor(px,py);dragOX=wx-o.x;dragOY=wz-(o.rd||0);}
        else{const{x,y}=screenToWall(px,py,o.wz||0);dragOX=x-o.x;dragOY=y-o.y;}
        draw();return;
      }
      clearMultiSel();sel=o.id;dragObj=o;cv.style.cursor='grabbing';
      dragStartPos={x:o.x,y:o.y,rd:o.rd||0};
      if(isFloor(o.t)){const{wx,wz}=screenToFloor(px,py);dragOX=wx-o.x;dragOY=wz-(o.rd||0);}
      else{const{x,y}=screenToWall(px,py,o.wz||0);dragOX=x-o.x;dragOY=y-o.y;}
      draw();refreshList();refreshEdit();return;
    }
  }
  clearMultiSel();sel=null;dragObj=null;
  e.preventDefault();cv.setPointerCapture(e.pointerId);
  startRubberBand(px,py);
  draw();refreshList();refreshEdit();updateSelActions();
});

cv.addEventListener('pointermove',e=>{
  const{px,py}=cvPt(e);
  if(dragLt){const{x,y}=screenToWall(px,py);LT.x=x;LT.y=y;draw();return;}
  if(placing){ghostPx=px;ghostPy=py;draw();return;}
  if(rbStart){updateRubberBand(px,py);return;}
  const snap=e.ctrlKey||e.metaKey;
  const sb=document.getElementById('snap-btn');if(sb)sb.classList.toggle('active',snap&&!!dragObj);
  if(dragObj){
    const delta={dx:0,dy:0,drd:0};
    if(isFloor(dragObj.t)){
      const{wx,wz}=screenToFloor(px,py);
      let newX=Math.round(Math.max(0,Math.min(W.len-dragObj.w,wx-dragOX)));
      const wzC=Math.max(0,Math.min(FLOOR_DEPTH,wz));
      let newRd=Math.max(0,Math.min(FLOOR_DEPTH-dragObj.d,Math.round(wzC-dragOY)));
      if(axisLock==='x')newRd=dragStartPos.rd;
      if(axisLock==='y')newX=dragStartPos.x;
      if(snap){const s=snapFloor(newX,newRd,dragObj);newX=s.x;newRd=s.rd;}
      delta.dx=newX-dragObj.x;delta.drd=newRd-(dragObj.rd||0);
      const prev={x:dragObj.x,rd:dragObj.rd};
      dragObj.x=newX;dragObj.rd=newRd;
      if(hasCollision(dragObj)){dragObj.x=prev.x;dragObj.rd=prev.rd;delta.dx=0;delta.drd=0;}
    } else {
      const{x,y}=screenToWall(px,py,dragObj.wz||0);
      let newX=Math.round(Math.max(0,Math.min(W.len-dragObj.w,x-dragOX)));
      let newY=Math.round(Math.max(0,Math.min(W.h-dragObj.h,y-dragOY)));
      if(axisLock==='x')newY=dragStartPos.y;
      if(axisLock==='y')newX=dragStartPos.x;
      if(snap){const s=snapWall(newX,newY,dragObj);newX=s.x;newY=s.y;}
      delta.dx=newX-dragObj.x;delta.dy=newY-dragObj.y;
      const prev={x:dragObj.x,y:dragObj.y};
      dragObj.x=newX;dragObj.y=newY;
      if(hasCollision(dragObj)){dragObj.x=prev.x;dragObj.y=prev.y;delta.dx=0;delta.dy=0;}
    }
    if(multiSel.size>1){
      objs().forEach(o=>{if(o.id===dragObj.id||!multiSel.has(o.id)||o.locked)return;
        if(isFloor(o.t)){o.x=Math.max(0,Math.min(W.len-o.w,o.x+delta.dx));o.rd=Math.max(0,Math.min(FLOOR_DEPTH-o.d,(o.rd||0)+delta.drd));}
        else{o.x=Math.max(0,Math.min(W.len-o.w,o.x+delta.dx));o.y=Math.max(0,Math.min(W.h-o.h,o.y+delta.dy));}
      });
    }
    draw();refreshList();return;
  }
  cv.style.cursor=(LT.on&&hitLt(px,py))?'move':objs().filter(o=>o._p>.5&&!o.locked).some(o=>hitO(o,px,py))?'grab':'default';
});
cv.addEventListener('pointerup',e=>{
  if(rbStart){const{px,py}=cvPt(e);endRubberBand(px,py);}
  if(dragObj){snapshot();}
  dragObj=null;dragLt=false;if(!placing)cv.style.cursor='';
});

// Nav: scroll=zoom, right=orbit, middle=pan
cv.addEventListener('wheel',e=>{e.preventDefault();const{px,py}=cvPt(e);camZoom(e.deltaY<0?1.12:1/1.12,px,py);},{passive:false});
cv.addEventListener('pointerdown',e=>{if(e.button===1||e.button===2){e.preventDefault();cv.setPointerCapture(e.pointerId);const{px,py}=cvPt(e);navDrag={type:e.button===1?'pan':'orbit',sx:px,sy:py,az0:CAM.az,el0:CAM.el,panX0:CAM.panX,panY0:CAM.panY};return;}},true);
cv.addEventListener('pointermove',e=>{if(!navDrag)return;const{px,py}=cvPt(e);const dx=px-navDrag.sx,dy=py-navDrag.sy;if(navDrag.type==='orbit'){CAM.az=(navDrag.az0-dx*.4)%360;CAM.el=Math.max(CAM_EL_MIN,Math.min(CAM_EL_MAX,navDrag.el0+dy*.3));}else{CAM.panX=navDrag.panX0+dx;CAM.panY=navDrag.panY0+dy;}draw();},true);
cv.addEventListener('pointerup',e=>{if(e.button===1||e.button===2)navDrag=null;},true);
cv.addEventListener('contextmenu',e=>{e.preventDefault();if(placing){stopPlacing();draw();}});

// Touch
function pinchD(e){const dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY;return Math.sqrt(dx*dx+dy*dy);}
cv.addEventListener('touchstart',e=>{if(e.touches.length===2){e.preventDefault();pinchDist0=pinchD(e);pinchSC0=SC;touch2Start={az0:CAM.az,el0:CAM.el,panX0:CAM.panX,panY0:CAM.panY,cx0:(e.touches[0].clientX+e.touches[1].clientX)/2,cy0:(e.touches[0].clientY+e.touches[1].clientY)/2,dist0:pinchD(e),zoom0:CAM.zoom};}},{passive:false});
cv.addEventListener('touchmove',e=>{if(e.touches.length===2&&touch2Start){e.preventDefault();const d=pinchD(e);CAM.zoom=Math.max(CAM_ZOOM_MIN,Math.min(CAM_ZOOM_MAX,touch2Start.zoom0*(d/touch2Start.dist0)));const cx=(e.touches[0].clientX+e.touches[1].clientX)/2,cy=(e.touches[0].clientY+e.touches[1].clientY)/2;CAM.az=(touch2Start.az0-(cx-touch2Start.cx0)*.5)%360;CAM.el=Math.max(CAM_EL_MIN,Math.min(CAM_EL_MAX,touch2Start.el0+(cy-touch2Start.cy0)*.35));draw();}},{passive:false});
cv.addEventListener('touchend',e=>{if(e.touches.length<2){pinchDist0=null;touch2Start=null;}},{passive:true});

// ─── FLOOR PLAN EVENTS ───
fpCV.addEventListener('wheel',e=>{e.preventDefault();fpScale=Math.max(.15,Math.min(8,fpScale*(e.deltaY<0?1.12:1/1.12)));drawFloorPlan();},{passive:false});

fpCV.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;
  if(placing){const{cx,cy}=fpCanvasCoords(e);fpPlaceObj(cx,cy);return;}
  const{cx,cy}=fpCanvasCoords(e);
  const hit=fpHitTest(cx,cy);
  if(hit){sel=hit.id;clearMultiSel();}else{sel=null;clearMultiSel();}
  draw();refreshList();refreshEdit();
  fpDrag={sx:e.clientX,sy:e.clientY,px0:fpPanX,py0:fpPanY};fpCV.setPointerCapture(e.pointerId);
});
fpCV.addEventListener('pointermove',e=>{
  if(placing){const{cx,cy}=fpCanvasCoords(e);fpGhostCx=cx;fpGhostCy=cy;ghostSnap=e.ctrlKey||e.metaKey;drawFloorPlan();return;}
  fpGhostCx=null;fpGhostCy=null;
  if(!fpDrag)return;fpPanX=fpDrag.px0+(e.clientX-fpDrag.sx);fpPanY=fpDrag.py0+(e.clientY-fpDrag.sy);drawFloorPlan();
});
fpCV.addEventListener('pointerup',()=>{fpDrag=null;});
fpCV.addEventListener('pointerleave',()=>{if(placing){fpGhostCx=null;fpGhostCy=null;drawFloorPlan();}});
fpCV.addEventListener('contextmenu',e=>{e.preventDefault();if(placing){stopPlacing();drawFloorPlan();}});
fpCV.addEventListener('dblclick',e=>{
  const{cx,cy}=fpCanvasCoords(e);
  const hit=fpHitTest(cx,cy);
  if(hit){const n=prompt('Rename:',hit.label);if(n!==null&&n.trim()){snapshot();hit.label=n.trim();drawFloorPlan();}}
});

// ─── KEYBOARD ───
document.getElementById('vp').addEventListener('wheel',e=>{if(wcd)return;wcd=true;if(e.deltaY>30)go(1);else if(e.deltaY<-30)go(-1);setTimeout(()=>wcd=false,650);},{passive:true});
document.addEventListener('keydown',e=>{
  if(document.activeElement.tagName==='INPUT'||document.activeElement.tagName==='TEXTAREA')return;
  if(e.key==='ArrowDown'||e.key==='PageDown')go(1);
  if(e.key==='ArrowUp'||e.key==='PageUp')go(-1);
  if(e.key==='Escape'){stopPlacing();clearMultiSel();sel=null;axisLock=null;draw();refreshList();refreshEdit();}
  if((e.key==='x'||e.key==='X')&&!e.ctrlKey&&!e.metaKey){
    axisLock=axisLock==='x'?null:'x';
    if(axisLock==='x'&&dragObj)dragStartPos={x:dragObj.x,y:dragObj.y,rd:dragObj.rd||0};
    draw();
  }
  if((e.key==='y'||e.key==='Y')&&!e.ctrlKey&&!e.metaKey){
    axisLock=axisLock==='y'?null:'y';
    if(axisLock==='y'&&dragObj)dragStartPos={x:dragObj.x,y:dragObj.y,rd:dragObj.rd||0};
    draw();
  }
  if((e.key==='Delete'||e.key==='Backspace')&&!e.ctrlKey&&!e.metaKey){e.preventDefault();
    if(multiSel.size>0){[...multiSel].forEach(id=>doDelete(id));multiSel.clear();}else doDelete();}
  if((e.ctrlKey||e.metaKey)&&e.key==='z'){e.preventDefault();undo();}
  if((e.ctrlKey||e.metaKey)&&(e.key==='y'||(e.key==='z'&&e.shiftKey))){e.preventDefault();redo();}
  if((e.ctrlKey||e.metaKey)&&e.key==='c'&&sel){e.preventDefault();copyObj(sel);}
  if((e.ctrlKey||e.metaKey)&&e.key==='v'){e.preventDefault();pasteObj();}
  if((e.ctrlKey||e.metaKey)&&e.key==='d'&&sel){e.preventDefault();copyObj(sel);pasteObj();}
  if((e.ctrlKey||e.metaKey)&&e.key==='a'){e.preventDefault();objs().forEach(o=>multiSel.add(o.id));draw();refreshList();}
});
window.addEventListener('resize',()=>draw());

// ─── DEL BUTTON WIRING ───
document.getElementById('del-sel-btn').onclick=()=>doDelete();
document.getElementById('del-sel-btn2').onclick=()=>doDelete();

// ─── THEME INIT ───
(function(){
  if(localStorage.getItem('theme')==='light'){
    document.body.classList.add('light');
    document.getElementById('theme-btn').textContent='☀';
  }
})();

// ─── INIT ───
buildLangBar();applyLang();buildMaterialGrid();buildPalette();
snapshot();
loadFromHash();
draw();
