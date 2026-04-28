// ─── FLOOR PLAN 2D VIEW ───

// ── shared drawing helpers ──────────────────────────────────────────────
function fpT(dark,light){return document.body.classList.contains('light')?light:dark;}
function fpDimLine(c,x1,y1,x2,y2,label,side=1,color='#4a9eff'){
  const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);
  if(len<2)return;
  const nx=-dy/len*side,ny=dx/len*side; // normal
  const off=18;
  const ex1=x1+nx*off,ey1=y1+ny*off;
  const ex2=x2+nx*off,ey2=y2+ny*off;
  c.save();
  c.strokeStyle=color;c.lineWidth=1;c.globalAlpha=.8;
  // tick at start
  c.beginPath();c.moveTo(x1+nx*(off-5),y1+ny*(off-5));c.lineTo(x1+nx*(off+5),y1+ny*(off+5));c.stroke();
  // tick at end
  c.beginPath();c.moveTo(x2+nx*(off-5),y2+ny*(off-5));c.lineTo(x2+nx*(off+5),y2+ny*(off+5));c.stroke();
  // dimension line
  c.setLineDash([3,3]);c.beginPath();c.moveTo(ex1,ey1);c.lineTo(ex2,ey2);c.stroke();c.setLineDash([]);
  // extension lines (faint)
  c.globalAlpha=.35;c.beginPath();c.moveTo(x1,y1);c.lineTo(ex1,ey1);c.stroke();
  c.beginPath();c.moveTo(x2,y2);c.lineTo(ex2,ey2);c.stroke();
  // label
  c.globalAlpha=1;c.fillStyle=color;c.font='bold 10px DM Mono,monospace';c.textAlign='center';c.textBaseline='middle';
  const mx=(ex1+ex2)/2,my=(ey1+ey2)/2;
  const angle=Math.atan2(ey2-ey1,ex2-ex1);
  c.translate(mx,my);c.rotate(angle);
  c.fillStyle=fpT('#0a0a0a','#ffffff');c.fillRect(-label.length*3.2-4,-7,label.length*6.4+8,14);
  c.fillStyle=color;c.fillText(label,0,0);
  c.restore();
}

function fpGrid(c,ox,oy,w,h,sc,gridStep=500){
  c.save();c.strokeStyle=fpT('#1a1a1a','#e0e0e0');c.lineWidth=.5;
  for(let v=0;v<=w;v+=gridStep){c.beginPath();c.moveTo(ox+v*sc,oy);c.lineTo(ox+v*sc,oy+h*sc);c.stroke();}
  for(let v=0;v<=h;v+=gridStep){c.beginPath();c.moveTo(ox,oy+v*sc);c.lineTo(ox+w*sc,oy+v*sc);c.stroke();}
  // Minor grid at 100mm
  c.strokeStyle=fpT('#151515','#ebebeb');c.lineWidth=.3;
  const minor=100;
  for(let v=0;v<=w;v+=minor){c.beginPath();c.moveTo(ox+v*sc,oy);c.lineTo(ox+v*sc,oy+h*sc);c.stroke();}
  for(let v=0;v<=h;v+=minor){c.beginPath();c.moveTo(ox,oy+v*sc);c.lineTo(ox+w*sc,oy+v*sc);c.stroke();}
  c.restore();
}

function fpScaleBar(c,cvW,cvH,sc){
  // Find a nice round number for scale bar
  const targets=[100,200,500,1000,2000];
  const target=targets.find(t=>t*sc>40&&t*sc<150)||targets[targets.length-1];
  const bw=target*sc,bh=6;
  const bx=cvW-bw-20,by=cvH-20;
  c.save();
  c.fillStyle=fpT('#333','#aaa');c.fillRect(bx,by,bw,bh);
  c.fillStyle=fpT('#888','#ccc');c.fillRect(bx,by,bw/2,bh);
  c.strokeStyle=fpT('#666','#999');c.lineWidth=1;c.strokeRect(bx,by,bw,bh);
  c.fillStyle=fpT('#888','#666');c.font='9px Inter,sans-serif';c.textAlign='center';c.textBaseline='bottom';
  c.fillText(target+'mm',bx+bw/2,by-2);
  c.fillText('0',bx,by-2);
  c.restore();
}

// ── FLOOR PLAN (top-down) ────────────────────────────────────────────────
function drawFloorPlanView(c,cvW,cvH,pageIdx,margin=90,showMat=true){
  const effectiveIdx=pageIdx!==undefined?pageIdx:curP;
  const pg=pages[effectiveIdx];
  const allObjs=pg?pg.objs:objs();
  const sc=Math.min((cvW-margin*2)/W.len,(cvH-margin*2)/FLOOR_DEPTH)*fpScale;
  const ox=cvW/2-W.len/2*sc+fpPanX;
  const oy=cvH/2-FLOOR_DEPTH/2*sc+fpPanY;

  fpGrid(c,ox,oy,W.len,FLOOR_DEPTH,sc);

  // Floor boundary
  c.save();
  c.fillStyle=fpT('rgba(200,200,200,.025)','rgba(0,0,0,.03)');c.fillRect(ox,oy,W.len*sc,FLOOR_DEPTH*sc);
  c.strokeStyle=fpT('#2a2a2a','#bbbbbb');c.lineWidth=1;c.strokeRect(ox,oy,W.len*sc,FLOOR_DEPTH*sc);
  c.restore();

  // Wall thickness band
  c.save();
  c.fillStyle=W.col.wall+'28';c.fillRect(ox,oy,W.len*sc,W.d*sc);
  c.strokeStyle=W.col.wall+'88';c.lineWidth=1.5;c.strokeRect(ox,oy,W.len*sc,W.d*sc);
  c.fillStyle=fpT('#444','#777');c.font='8px Inter,sans-serif';c.textAlign='center';c.textBaseline='middle';
  c.fillText(t('wall').toUpperCase(),ox+W.len*sc/2,oy+W.d*sc/2);
  c.restore();

  // Ghost: previous page floor objects
  if(effectiveIdx>0){
    const prevObjs=(pages[effectiveIdx-1].objs||[]).filter(o=>isFloor(o.t));
    prevObjs.forEach(o=>{
      const rx=ox+o.x*sc,rz=oy+(o.rd||0)*sc,rw=o.w*sc,rh=o.d*sc;
      c.save();c.globalAlpha=0.28;
      c.fillStyle=o.color;c.fillRect(rx,rz,rw,rh);
      c.strokeStyle='rgba(180,180,255,.8)';c.lineWidth=1;c.setLineDash([3,3]);c.strokeRect(rx,rz,rw,rh);
      c.setLineDash([]);c.restore();
    });
  }

  const floorObjs=allObjs.filter(o=>isFloor(o.t));

  // Draw objects
  floorObjs.forEach(o=>{
    const rx=ox+o.x*sc,rz=oy+(o.rd||0)*sc,rw=o.w*sc,rh=o.d*sc;
    c.save();c.fillStyle=fpT('rgba(0,0,0,.25)','rgba(0,0,0,.08)');c.fillRect(rx+2,rz+2,rw,rh);c.restore();
    c.save();
    c.fillStyle=o.color+'cc';c.fillRect(rx,rz,rw,rh);
    c.strokeStyle=fpT('rgba(255,255,255,.35)','rgba(0,0,0,.2)');c.lineWidth=1;c.strokeRect(rx,rz,rw,rh);
    if(rw>24&&rh>12){
      c.fillStyle='rgba(255,255,255,.9)';
      c.font=`${Math.min(9,Math.max(6,rw/12))}px Inter,sans-serif`;
      c.textAlign='center';c.textBaseline='middle';
      c.fillText(o.label,rx+rw/2,rz+rh/2);
    }
    c.restore();
  });

  // ── DETAILED MEASUREMENTS FOR EVERY OBJECT ──
  // Stagger dimension lines to avoid overlap:
  // Horizontal dims go below, each object gets its own lane (lane = index * offset)
  // Vertical dims go to the right in lanes

  const wallBottom=oy+W.d*sc; // y of wall face on canvas
  const floorBottom=oy+FLOOR_DEPTH*sc;

  // Sort by x for left-to-right staggering
  const sorted=[...floorObjs].sort((a,b)=>a.x-b.x);
  const _fpGrpKeys=[...new Set(sorted.map(o=>o.label+'|'+o.w+'|'+o.h+'|'+o.d))];
  const _fpGrpNum={};_fpGrpKeys.forEach((k,i)=>_fpGrpNum[k]=i+1);

  // Lane maps sorted biggest-first so largest value = lane 0 = closest to plan boundary
  const _fpWLane=new Map();[...floorObjs].sort((a,b)=>b.w-a.w).forEach((o,i)=>_fpWLane.set(o.id,i));
  const _fpLLane=new Map();[...floorObjs].filter(o=>o.x>0).sort((a,b)=>b.x-a.x).forEach((o,i)=>_fpLLane.set(o.id,i));
  const _fpRLane=new Map();[...floorObjs].filter(o=>W.len-o.x-o.w>0).sort((a,b)=>(W.len-b.x-b.w)-(W.len-a.x-a.w)).forEach((o,i)=>_fpRLane.set(o.id,i));

  sorted.forEach((o)=>{
    const rx=ox+o.x*sc,rz=oy+(o.rd||0)*sc,rw=o.w*sc,rh=o.d*sc;

    // Width dim — below object, biggest width = closest to boundary
    const wDimY=floorBottom+22+(_fpWLane.get(o.id)??0)*22;
    fpDimLine(c,rx,wDimY,rx+rw,wDimY,o.w+'mm',-1,'#c8703a');
    // thin leader from object bottom to dim line
    c.save();c.strokeStyle='#c8703a33';c.lineWidth=.5;c.setLineDash([2,3]);
    c.beginPath();c.moveTo(rx+rw/2,rz+rh);c.lineTo(rx+rw/2,wDimY);c.stroke();
    c.setLineDash([]);c.restore();

    // Distance from wall (rd)
    if((o.rd||0)>0){
      const rdDimX=rx+rw/2;
      fpDimLine(c,rdDimX,wallBottom,rdDimX,rz,(o.rd)+'mm',1,'#b89840');
    }

    // Distance from left wall edge — biggest left gap = closest to boundary
    if(o.x>0){
      const fromLeftY=oy-22-(_fpLLane.get(o.id)??0)*20;
      fpDimLine(c,ox,fromLeftY,rx,fromLeftY,o.x+'mm',-1,'#8060c0');
      c.save();c.strokeStyle='#8060c033';c.lineWidth=.5;c.setLineDash([2,3]);
      c.beginPath();c.moveTo(ox,fromLeftY);c.lineTo(ox,oy);c.stroke();
      c.beginPath();c.moveTo(rx,fromLeftY);c.lineTo(rx,oy);c.stroke();
      c.setLineDash([]);c.restore();
    }

    // Distance from right wall edge — biggest right gap = closest to boundary
    const fromRight=W.len-o.x-o.w;
    if(fromRight>0){
      const fromRightY=oy-22-((_fpRLane.get(o.id)??0)+1)*20;
      fpDimLine(c,rx+rw,fromRightY,ox+W.len*sc,fromRightY,fromRight+'mm',-1,'#60a080');
    }

    // Object label index bubble (for legend below)
    c.save();
    c.fillStyle='rgba(0,0,0,.7)';c.beginPath();c.arc(rx+8,rz+8,7,0,Math.PI*2);c.fill();
    c.fillStyle='#fff';c.font='bold 8px Inter,sans-serif';c.textAlign='center';c.textBaseline='middle';
    c.fillText(_fpGrpNum[o.label+'|'+o.w+'|'+o.h+'|'+o.d],rx+8,rz+8);
    c.restore();
  });

  // ── OVERALL DIMENSIONS ──
  fpDimLine(c,ox,oy,ox+W.len*sc,oy,W.len+'mm',-1,'#4a9eff');
  fpDimLine(c,ox+W.len*sc,oy,ox+W.len*sc,oy+FLOOR_DEPTH*sc,FLOOR_DEPTH+'mm',1,'#4a9eff');
  fpDimLine(c,ox-22,oy,ox-22,oy+W.d*sc,W.d+'mm wall',1,fpT('#666','#999'));

  // ── LEGEND ──
  if(floorObjs.length>0){
    const legX=ox,legY=floorBottom+22+(sorted.length)*22+18;
    c.save();
    c.fillStyle=fpT('#1a1a1a','#f0f0f0');c.fillRect(legX,legY,W.len*sc,14*(sorted.length)+10);
    c.fillStyle=fpT('#444','#777');c.font='8px Inter,sans-serif';c.textAlign='left';c.textBaseline='top';
    sorted.forEach((o,i)=>{
      const col1=legX+6,col2=legX+W.len*sc*0.25,col3=legX+W.len*sc*0.5,col4=legX+W.len*sc*0.75;
      const ly=legY+5+i*13;
      c.fillStyle=o.color;c.fillRect(col1,ly+1,8,8);
      c.fillStyle=fpT('#888','#555');
      c.fillText(_fpGrpNum[o.label+'|'+o.w+'|'+o.h+'|'+o.d]+'  '+o.label,col1+12,ly);
      c.fillText(t('width')+': '+o.w+'mm',col2,ly);
      c.fillText(t('distFromWall')+': '+(o.rd||0)+'mm',col3,ly);
      c.fillText(t('fromLeft')+': '+o.x+'mm',col4,ly);
    });
    c.restore();
  }
  if(showMat&&floorObjs.length>0){const _fm=getMaterials(floorObjs);drawMaterialList(c,ox,floorBottom+22+sorted.length*22+18+14*sorted.length+10+6,W.len*sc,_fm,false);}

  fpScaleBar(c,cvW,cvH,sc);

  // Title
  c.save();c.fillStyle=fpT('#444','#666');c.font='10px Inter,sans-serif';c.textAlign='left';
  const pgName=pg?pg.name:pages[curP].name;
  c.fillText(t('floorPlanView')+'  —  '+pgName+'  —  '+W.len+'×'+FLOOR_DEPTH+'mm',14,cvH-10);
  c.restore();
}

// ── WALL ELEVATION (front-on) ────────────────────────────────────────────
function drawWallElevationView(c,cvW,cvH,pageIdx,margin=90,showMat=true){
  const effectiveIdx=pageIdx!==undefined?pageIdx:curP;
  const pg=pages[effectiveIdx];
  const allObjs=pg?pg.objs:objs();
  const sc=Math.min((cvW-margin*2)/W.len,(cvH-margin*2)/W.h)*fpScale;
  const ox=cvW/2-W.len/2*sc+fpPanX;
  const oy=cvH/2-W.h/2*sc+fpPanY;

  fpGrid(c,ox,oy,W.len,W.h,sc,500);

  // Wall face background
  c.save();
  c.fillStyle=W.col.wall+'18';c.fillRect(ox,oy,W.len*sc,W.h*sc);
  c.strokeStyle=W.col.wall+'55';c.lineWidth=2;c.strokeRect(ox,oy,W.len*sc,W.h*sc);
  // Baseboard
  const baseH=80;
  c.strokeStyle=fpT('#2a2a2a','#cccccc');c.lineWidth=1;c.setLineDash([4,4]);
  c.beginPath();c.moveTo(ox,oy+W.h*sc-baseH*sc);c.lineTo(ox+W.len*sc,oy+W.h*sc-baseH*sc);c.stroke();
  c.setLineDash([]);
  c.restore();

  const wallObjs=allObjs.filter(o=>!isFloor(o.t));

  // Ghost: previous page wall objects
  if(effectiveIdx>0){
    const prevObjs=(pages[effectiveIdx-1].objs||[]).filter(o=>!isFloor(o.t));
    prevObjs.forEach(o=>{
      const rx=ox+o.x*sc,ry=oy+(W.h-o.y-o.h)*sc,rw=o.w*sc,rh=o.h*sc;
      c.save();c.globalAlpha=0.28;
      c.fillStyle=o.color;c.fillRect(rx,ry,rw,rh);
      c.strokeStyle='rgba(180,180,255,.8)';c.lineWidth=1;c.setLineDash([3,3]);c.strokeRect(rx,ry,rw,rh);
      c.setLineDash([]);c.restore();
    });
  }

  // Draw objects
  wallObjs.forEach(o=>{
    const rx=ox+o.x*sc;
    const ry=oy+(W.h-o.y-o.h)*sc;
    const rw=o.w*sc,rh=o.h*sc;
    const alpha=Math.max(0.45,1-(o.wz||0)/600);
    c.save();
    c.fillStyle=o.color+(Math.round(alpha*200).toString(16).padStart(2,'0'));
    c.fillRect(rx,ry,rw,rh);
    if(o.d>20){
      c.fillStyle='rgba(255,255,255,.07)';c.fillRect(rx,ry,rw,3);
      c.fillStyle='rgba(0,0,0,.18)';c.fillRect(rx+rw-3,ry,3,rh);
    }
    c.strokeStyle=fpT('rgba(255,255,255,.25)','rgba(0,0,0,.2)');c.lineWidth=1;c.strokeRect(rx,ry,rw,rh);
    if(rw>28&&rh>14){
      c.fillStyle='rgba(255,255,255,.9)';
      c.font=`${Math.min(9,Math.max(6,Math.min(rw/9,rh/4)))}px Inter,sans-serif`;
      c.textAlign='center';c.textBaseline='middle';
      c.fillText(o.label,rx+rw/2,ry+rh/2);
    }
    if(o.d>5&&rw>44){
      c.fillStyle='rgba(0,0,0,.65)';c.fillRect(rx+2,ry+2,38,12);
      c.fillStyle='#999';c.font='7px DM Mono,monospace';c.textAlign='left';c.textBaseline='top';
      c.fillText('D:'+o.d+'mm',rx+4,ry+3);
    }
    c.restore();
  });

  // ── DETAILED MEASUREMENTS FOR EVERY OBJECT ──
  const sorted=[...wallObjs].sort((a,b)=>a.x-b.x);
  const _weGrpKeys=[...new Set(sorted.map(o=>o.label+'|'+o.w+'|'+o.h+'|'+o.d))];
  const _weGrpNum={};_weGrpKeys.forEach((k,i)=>_weGrpNum[k]=i+1);
  const _annPal=['#4a9eff','#ff6b4a','#4aff9e','#ff4ab8','#ffe44a','#b84aff','#4afff0','#ff9e4a','#ff4a4a','#a0ff4a'];
  const _annCol=o=>_annPal[(_weGrpNum[o.label+'|'+o.w+'|'+o.h+'|'+o.d]-1)%_annPal.length];
  const wallRight=ox+W.len*sc;
  const wallBottomY=oy+W.h*sc;

  const drawnNearV=new Set();

  // Pre-compute sorted lane maps — biggest value = lane 0 = nearest to plan boundary
  const _hLObjs=sorted.filter(o=>{const fl=o.x,fr=W.len-o.x-o.w;return fl<=fr&&fl>0;});
  const _hRObjs=sorted.filter(o=>{const fl=o.x,fr=W.len-o.x-o.w;return fr<fl&&fr>0;});
  _hLObjs.sort((a,b)=>b.x-a.x);
  _hRObjs.sort((a,b)=>(W.len-b.x-b.w)-(W.len-a.x-a.w));
  const _hLL=new Map();_hLObjs.forEach((o,i)=>_hLL.set(o,i));
  const _hRL=new Map();_hRObjs.forEach((o,i)=>_hRL.set(o,i));
  const _vFVals=[...new Set(sorted.filter(o=>{const fl=o.y,fc=W.h-o.y-o.h;return fl<=fc&&fl>0;}).map(o=>o.y))].sort((a,b)=>b-a);
  const _vCVals=[...new Set(sorted.filter(o=>{const fl=o.y,fc=W.h-o.y-o.h;return fc<fl&&fc>0;}).map(o=>W.h-o.y-o.h))].sort((a,b)=>b-a);
  const _vFL=new Map();_vFVals.forEach((v,i)=>_vFL.set(v,i));
  const _vCL=new Map();_vCVals.forEach((v,i)=>_vCL.set(v,i));

  sorted.forEach((o)=>{
    const rx=ox+o.x*sc;
    const ry=oy+(W.h-o.y-o.h)*sc;
    const rw=o.w*sc,rh=o.h*sc;
    const col=_annCol(o);

    // Colored outline ties object rect to its annotation lines
    c.save();c.strokeStyle=col;c.lineWidth=1.5;c.strokeRect(rx,ry,rw,rh);c.restore();

    // Nearest horizontal — near left → ABOVE wall, near right → BELOW wall
    const fromLeft=o.x,fromRight=W.len-o.x-o.w;
    const useLeft=fromLeft<=fromRight;
    const nearHDist=useLeft?fromLeft:fromRight;
    if(nearHDist>0){
      const nearHX1=useLeft?ox:rx+rw;
      const nearHX2=useLeft?rx:wallRight;
      if(useLeft){
        const lane=_hLL.get(o)??0;
        const hY=oy-22-lane*22;
        fpDimLine(c,nearHX1,hY,nearHX2,hY,'← '+nearHDist+'mm',-1,col);
        c.save();c.strokeStyle=col+'22';c.lineWidth=.5;c.setLineDash([2,3]);
        c.beginPath();c.moveTo(nearHX1,oy);c.lineTo(nearHX1,hY);c.moveTo(nearHX2,oy);c.lineTo(nearHX2,hY);c.stroke();
        c.setLineDash([]);c.restore();
      } else {
        const lane=_hRL.get(o)??0;
        const hY=wallBottomY+22+lane*22;
        fpDimLine(c,nearHX1,hY,nearHX2,hY,'→ '+nearHDist+'mm',-1,col);
        c.save();c.strokeStyle=col+'22';c.lineWidth=.5;c.setLineDash([2,3]);
        c.beginPath();c.moveTo(nearHX1,wallBottomY);c.lineTo(nearHX1,hY);c.moveTo(nearHX2,wallBottomY);c.lineTo(nearHX2,hY);c.stroke();
        c.setLineDash([]);c.restore();
      }
    }

    // Nearest vertical — near floor → LEFT of wall boundary, near ceiling → RIGHT of wall
    const fromFloor=o.y,fromCeil=W.h-o.y-o.h;
    const useFloor=fromFloor<=fromCeil;
    const nearVDist=useFloor?fromFloor:fromCeil;
    if(nearVDist>0){
      const nearVKey=(useFloor?'f':'c')+nearVDist;
      if(!drawnNearV.has(nearVKey)){
        drawnNearV.add(nearVKey);
        if(useFloor){
          const fDimX=ox-22-_vFL.get(nearVDist)*22;
          fpDimLine(c,fDimX,ry+rh,fDimX,wallBottomY,nearVDist+'mm',1,col);
          c.save();c.strokeStyle=col+'22';c.lineWidth=.5;c.setLineDash([2,3]);
          c.beginPath();c.moveTo(ox,ry+rh);c.lineTo(fDimX,ry+rh);c.moveTo(ox,wallBottomY);c.lineTo(fDimX,wallBottomY);c.stroke();
          c.setLineDash([]);c.restore();
        } else {
          const cDimX=wallRight+40+_vCL.get(nearVDist)*22;
          fpDimLine(c,cDimX,oy,cDimX,ry,nearVDist+'mm',-1,col);
        }
      }
    }

    // Index bubble
    c.save();
    c.fillStyle='rgba(0,0,0,.75)';c.beginPath();c.arc(rx+8,ry+8,7,0,Math.PI*2);c.fill();
    c.fillStyle='#fff';c.font='bold 8px Inter,sans-serif';c.textAlign='center';c.textBaseline='middle';
    c.fillText(_weGrpNum[o.label+'|'+o.w+'|'+o.h+'|'+o.d],rx+8,ry+8);
    c.restore();
  });

  // ── OVERALL DIMENSION LINES ──
  fpDimLine(c,ox,oy,wallRight,oy,W.len+'mm',-1,'#4a9eff');
  fpDimLine(c,wallRight,oy,wallRight,wallBottomY,W.h+'mm',-1,'#4a9eff');
  fpDimLine(c,ox,wallBottomY,wallRight,wallBottomY,W.d+'mm depth',-1,fpT('#3a3a3a','#aaaaaa'));

  // ── VERTICAL RULER (left) ──
  const rulerX=ox-_vFVals.length*22-48;
  c.save();c.strokeStyle=fpT('#252525','#cccccc');c.lineWidth=1;
  c.beginPath();c.moveTo(rulerX+10,oy);c.lineTo(rulerX+10,wallBottomY);c.stroke();
  const rStep=W.h>3000?1000:500;
  for(let mm=0;mm<=W.h;mm+=rStep){
    const ry2=oy+(W.h-mm)*sc;
    c.beginPath();c.moveTo(rulerX+5,ry2);c.lineTo(rulerX+16,ry2);c.stroke();
    c.fillStyle=fpT('#555','#777');c.font='8px DM Mono,monospace';c.textAlign='right';c.textBaseline='middle';
    c.fillText(mm,rulerX+3,ry2);
  }
  c.strokeStyle=fpT('#1e1e1e','#dddddd');
  for(let mm=0;mm<=W.h;mm+=100){
    const ry2=oy+(W.h-mm)*sc;
    c.beginPath();c.moveTo(rulerX+8,ry2);c.lineTo(rulerX+12,ry2);c.stroke();
  }
  c.fillStyle=fpT('#333','#777');c.font='8px Inter,sans-serif';c.textAlign='center';c.textBaseline='middle';
  c.save();c.translate(rulerX-2,oy+W.h*sc/2);c.rotate(-Math.PI/2);c.fillText(t('height').toUpperCase()+' (mm)',0,0);c.restore();
  c.restore();

  // ── HORIZONTAL RULER (bottom) ──
  const rulerBaseY=wallBottomY+22+(_hRObjs.length||1)*22+48;
  c.save();c.strokeStyle=fpT('#252525','#cccccc');c.lineWidth=1;
  c.beginPath();c.moveTo(ox,rulerBaseY-10);c.lineTo(wallRight,rulerBaseY-10);c.stroke();
  const xStep=W.len>4000?1000:500;
  for(let mm=0;mm<=W.len;mm+=xStep){
    const rx2=ox+mm*sc;
    c.beginPath();c.moveTo(rx2,rulerBaseY-15);c.lineTo(rx2,rulerBaseY-5);c.stroke();
    c.fillStyle=fpT('#555','#777');c.font='8px DM Mono,monospace';c.textAlign='center';c.textBaseline='top';
    c.fillText(mm,rx2,rulerBaseY-4);
  }
  c.strokeStyle=fpT('#1e1e1e','#dddddd');
  for(let mm=0;mm<=W.len;mm+=100){
    const rx2=ox+mm*sc;
    c.beginPath();c.moveTo(rx2,rulerBaseY-12);c.lineTo(rx2,rulerBaseY-7);c.stroke();
  }
  c.fillStyle=fpT('#333','#777');c.font='8px Inter,sans-serif';c.textAlign='center';c.textBaseline='top';
  c.fillText(t('length').toUpperCase()+' (mm)',ox+W.len*sc/2,rulerBaseY+3);
  c.restore();

  if(showMat&&wallObjs.length>0){const _wm=getMaterials(wallObjs);drawMaterialList(c,ox,rulerBaseY+20,W.len*sc,_wm,false);}

  fpScaleBar(c,cvW,cvH,sc);

  // Title
  c.save();c.fillStyle=fpT('#444','#666');c.font='10px Inter,sans-serif';c.textAlign='left';
  const pgName=pg?pg.name:pages[curP].name;
  c.fillText(t('wallElevation')+'  —  '+pgName+'  —  '+wallObjs.length+' '+t('wallElem').toLowerCase()+'  —  '+W.len+'×'+W.h+'mm',14,cvH-10);
  c.restore();
}

// ── MATERIAL LIST HELPERS ──
function getMaterials(objList){
  const g={};
  objList.forEach(o=>{
    const k=`${o.label}|${o.w}|${o.h}|${o.d}`;
    if(!g[k]){const def=ETYPES.find(e=>e.t===o.t);g[k]={label:o.label,labelKey:def?.labelKey,defLabel:def?.label,w:o.w,h:o.h,d:o.d,color:o.color,count:0};}
    g[k].count++;
  });
  return Object.values(g).sort((a,b)=>a.label.localeCompare(b.label));
}
function matLabel(m){return m.labelKey&&m.label===m.defLabel?t(m.labelKey):m.label;}
function drawMaterialList(c,x,y,w,mats,combined){
  if(!mats.length)return 0;
  const rH=17,hH=22,pad=6;
  const boxH=hH+mats.length*rH+4;
  c.save();
  c.fillStyle=fpT('#0d0d0d','#f8f8f8');c.fillRect(x,y,w,boxH);
  c.strokeStyle=fpT('#1d1d1d','#e0e0e0');c.lineWidth=.5;c.strokeRect(x,y,w,boxH);
  const hdr=combined?t('materialsAll'):t('materials');
  c.fillStyle=fpT('#3a3a3a','#444');c.font='bold 10px Inter,sans-serif';c.textAlign='left';c.textBaseline='middle';
  c.fillText(hdr,x+pad,y+hH/2);
  c.textAlign='right';c.fillText(combined?t('totalH'):t('qty'),x+w-pad,y+hH/2);
  c.strokeStyle=fpT('#1d1d1d','#e0e0e0');c.beginPath();c.moveTo(x,y+hH);c.lineTo(x+w,y+hH);c.stroke();
  mats.forEach((m,i)=>{
    const ry=y+hH+i*rH+rH/2;
    if(i%2){c.fillStyle=fpT('#0b0b0b','#f0f0f0');c.fillRect(x,y+hH+i*rH,w,rH);}
    c.fillStyle=fpT('#444','#666');c.font='9px DM Mono,monospace';c.textAlign='left';
    c.fillText(i+1,x+pad,ry);
    c.fillStyle=m.color;c.fillRect(x+pad+16,ry-4,8,8);
    c.fillStyle=fpT('#777','#444');c.font='10px Inter,sans-serif';c.textAlign='left';
    c.fillText(matLabel(m),x+pad+28,ry);
    const totalW=m.w*m.count;
    const sqm=(totalW*m.h/1e6).toFixed(2)+'m²';
    c.fillStyle='#555';c.font='10px DM Mono,monospace';
    c.fillText(`${m.w}×${m.h}×${m.d}mm`,x+w*0.36,ry);
    c.fillStyle='#666';c.textAlign='center';
    c.fillText(`×${m.count} = ${totalW}mm`,x+w*0.65,ry);
    c.fillStyle='#4a8a6a';c.textAlign='right';
    c.fillText(sqm,x+w-pad,ry);
  });
  c.restore();
  return boxH;
}
function renderAllPagesMaterialList(c,cvW,cvH){
  const allObjs=pages.flatMap(p=>p.objs);
  const wallMats=getMaterials(allObjs.filter(o=>!isFloor(o.t)));
  const floorMats=getMaterials(allObjs.filter(o=>isFloor(o.t)));
  const pad=28,rH=20,hH=28,secGap=20;
  c.save();
  c.fillStyle=fpT('#555','#333');c.font='bold 14px Inter,sans-serif';c.textAlign='left';c.textBaseline='top';
  c.fillText(t('matListAllPages'),pad,pad);
  const totalPcs=wallMats.reduce((s,m)=>s+m.count,0)+floorMats.reduce((s,m)=>s+m.count,0);
  c.fillStyle=fpT('#333','#666');c.font='9px Inter,sans-serif';
  c.fillText(`${pages.length} page${pages.length!==1?'s':''}  ·  ${totalPcs} total pieces  ·  ${new Date().toLocaleDateString()}`,pad,pad+20);
  let y=pad+52;
  const cols=[pad+10,cvW*0.30,cvW*0.52,cvW*0.68,cvW-pad];
  const drawSection=(mats,title)=>{
    if(!mats.length)return;
    c.fillStyle=fpT('#333','#555');c.font='bold 9px Inter,sans-serif';c.textAlign='left';c.textBaseline='top';
    c.fillText(`${title} (${mats.reduce((s,m)=>s+m.count,0)} pieces)`,pad,y);y+=14;
    c.fillStyle=fpT('#1a1a1a','#e8e8e8');c.fillRect(pad,y,cvW-pad*2,hH);
    c.fillStyle=fpT('#3a3a3a','#444');c.font='bold 10px Inter,sans-serif';c.textBaseline='middle';
    [['#',0,'left'],['Label',1,'left'],['W × H × D mm',2,'left'],['×Qty = Total W',3,'left'],['m²',4,'right']].forEach(([h,ci,ta])=>{c.textAlign=ta;c.fillText(h,cols[ci],y+hH/2);});
    y+=hH;
    mats.forEach((m,i)=>{
      c.fillStyle=i%2?fpT('#0c0c0c','#f0f0f0'):fpT('#0a0a0a','#f8f8f8');c.fillRect(pad,y,cvW-pad*2,rH);
      c.textBaseline='middle';
      c.fillStyle=fpT('#444','#666');c.font='10px DM Mono,monospace';c.textAlign='left';c.fillText(i+1,cols[0],y+rH/2);
      c.fillStyle=m.color;c.fillRect(cols[1]-14,y+rH/2-4,8,8);
      c.fillStyle=fpT('#888','#444');c.font='10px Inter,sans-serif';c.fillText(matLabel(m),cols[1],y+rH/2);
      const _tw=m.w*m.count;
      c.fillStyle=fpT('#666','#555');c.font='10px DM Mono,monospace';c.fillText(m.w+' × '+m.h+' × '+m.d,cols[2],y+rH/2);
      c.fillStyle=fpT('#888','#555');c.fillText('×'+m.count+' = '+_tw+'mm',cols[3],y+rH/2);
      c.fillStyle='#4a8a6a';c.textAlign='right';c.fillText((_tw*m.h/1e6).toFixed(2)+'m²',cols[4],y+rH/2);
      y+=rH;
    });
    y+=secGap;
  };
  drawSection(wallMats,t('wallElem'));
  drawSection(floorMats,t('floorElem'));
  c.fillStyle=fpT('#222','#888');c.font='10px Inter,sans-serif';c.textAlign='center';c.textBaseline='bottom';
  c.fillText('WALLSTUDIO  ·  '+t('matListAllPages'),cvW/2,cvH-10);
  c.restore();
}

function drawFloorPlan(){
  const vp=document.getElementById('vp');
  fpCV.width=vp.clientWidth;fpCV.height=vp.clientHeight;
  const c=fpCtx;
  c.clearRect(0,0,fpCV.width,fpCV.height);
  c.fillStyle=fpT('#0a0a0a','#ffffff');c.fillRect(0,0,fpCV.width,fpCV.height);
  if(fpMode==='wall') drawWallElevationView(c,fpCV.width,fpCV.height);
  else drawFloorPlanView(c,fpCV.width,fpCV.height);
  drawFpGhost(c);
  fpCV.style.cursor=placing?'crosshair':'';
}

function drawFpGhost(c){
  if(!placing||fpGhostCx===null)return;
  const def=ETYPES.find(d=>d.t===placing);if(!def||def.t==='light')return;
  const sc=fpSc();
  const ox=fpCV.width/2-W.len/2*sc+fpPanX;
  if(fpMode==='floor'&&isFloor(def.t)){
    const oy=fpCV.height/2-FLOOR_DEPTH/2*sc+fpPanY;
    let fx=Math.max(0,Math.min(W.len-def.w,(fpGhostCx-ox)/sc-def.w/2));
    let frd=Math.max(0,Math.min(FLOOR_DEPTH-def.d,(fpGhostCy-oy)/sc-def.d/2));
    if(ghostSnap){const sf=snapFloor(fx,frd,{id:-1,w:def.w,h:def.h,d:def.d,t:def.t,_p:1});fx=sf.x;frd=sf.rd;}
    const rx=ox+fx*sc;
    const rz=oy+frd*sc;
    c.save();c.globalAlpha=0.55;c.fillStyle=def.color;c.fillRect(rx,rz,def.w*sc,def.d*sc);
    c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=1.5;c.setLineDash([4,3]);c.strokeRect(rx,rz,def.w*sc,def.d*sc);
    c.setLineDash([]);c.restore();
  }else if(fpMode==='wall'&&!isFloor(def.t)){
    const oy=fpCV.height/2-W.h/2*sc+fpPanY;
    let wx=Math.max(0,Math.min(W.len-def.w,(fpGhostCx-ox)/sc-def.w/2));
    let wy=Math.max(0,Math.min(W.h-def.h,W.h-(fpGhostCy-oy)/sc-def.h/2));
    if(ghostSnap){const sw=snapWall(wx,wy,{id:-1,w:def.w,h:def.h,d:def.d,t:def.t,wz:0,_p:1});wx=sw.x;wy=sw.y;}
    const rx=ox+wx*sc;
    const ry=oy+(W.h-wy-def.h)*sc;
    c.save();c.globalAlpha=0.55;c.fillStyle=def.color;c.fillRect(rx,ry,def.w*sc,def.h*sc);
    c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=1.5;c.setLineDash([4,3]);c.strokeRect(rx,ry,def.w*sc,def.h*sc);
    c.setLineDash([]);c.restore();
  }
}

function fpPlaceObj(cx,cy){
  const def=ETYPES.find(d=>d.t===placing);if(!def||def.t==='light')return;
  const sc=fpSc();
  const ox=fpCV.width/2-W.len/2*sc+fpPanX;
  if(fpMode==='floor'&&isFloor(def.t)){
    const oy=fpCV.height/2-FLOOR_DEPTH/2*sc+fpPanY;
    let x=Math.round(Math.max(0,Math.min(W.len-def.w,(cx-ox)/sc-def.w/2)));
    let rd=Math.round(Math.max(0,Math.min(FLOOR_DEPTH-def.d,(cy-oy)/sc-def.d/2)));
    if(ghostSnap){const sf=snapFloor(x,rd,{id:-1,w:def.w,h:def.h,d:def.d,t:def.t,_p:1});x=sf.x;rd=sf.rd;}
    const o=makeObj(def.t,x,0,def.w,def.h,def.d,def.color,def.label);
    o.rd=rd;if(def.meshKey)o.meshKey=def.meshKey;
    resolveCollision(o);objs().push(o);sel=null;
    draw();refreshList();refreshEdit();updateSelActions();snapshot();
  }else if(fpMode==='wall'&&!isFloor(def.t)){
    const oy=fpCV.height/2-W.h/2*sc+fpPanY;
    const baseWZ=pages[curP].baseWZ||0;
    let x=Math.round(Math.max(0,Math.min(W.len-def.w,(cx-ox)/sc-def.w/2)));
    let y=Math.round(Math.max(0,Math.min(W.h-def.h,W.h-(cy-oy)/sc-def.h/2)));
    if(ghostSnap){const sw=snapWall(x,y,{id:-1,w:def.w,h:def.h,d:def.d,t:def.t,wz:baseWZ,_p:1});x=sw.x;y=sw.y;}
    const o=makeObj(def.t,x,y,def.w,def.h,def.d,def.color,def.label);
    o.wz=baseWZ;if(def.meshKey)o.meshKey=def.meshKey;
    resolveCollision(o);objs().push(o);sel=null;
    draw();refreshList();refreshEdit();updateSelActions();snapshot();
  }
}

function fpHitTest(cx,cy){
  const sc=fpSc(),ox=fpCV.width/2-W.len/2*sc+fpPanX;
  const allO=pages[curP].objs;
  if(fpMode==='wall'){
    const oy=fpCV.height/2-W.h/2*sc+fpPanY;
    for(const o of [...allO].filter(o=>!isFloor(o.t)).reverse()){
      const rx=ox+o.x*sc,ry=oy+(W.h-o.y-o.h)*sc,rw=o.w*sc,rh=o.h*sc;
      if(cx>=rx&&cx<=rx+rw&&cy>=ry&&cy<=ry+rh)return o;
    }
  }else{
    const oy=fpCV.height/2-FLOOR_DEPTH/2*sc+fpPanY;
    for(const o of [...allO].filter(o=>isFloor(o.t)).reverse()){
      const rx=ox+o.x*sc,rz=oy+(o.rd||0)*sc,rw=o.w*sc,rh=o.d*sc;
      if(cx>=rx&&cx<=rx+rw&&cy>=rz&&cy<=rz+rh)return o;
    }
  }
  return null;
}

function setFpMode(mode){
  fpMode=mode;
  document.getElementById('fp-tab-floor').classList.toggle('on',mode==='floor');
  document.getElementById('fp-tab-wall').classList.toggle('on',mode==='wall');
  fpScale=1;fpPanX=0;fpPanY=0;
  drawFloorPlan();
}

function syncFpMode(){
  const hasFloor=objs().some(o=>isFloor(o.t));
  const tab=document.getElementById('fp-tab-floor');
  if(tab)tab.style.display=hasFloor?'':'none';
  if(!hasFloor&&fpMode==='floor'){fpMode='wall';if(tab)tab.classList.remove('on');const tw=document.getElementById('fp-tab-wall');if(tw)tw.classList.add('on');}
}

function toggleFloorPlan(){
  fpVisible=!fpVisible;
  fpCV.style.display=fpVisible?'block':'none';
  document.getElementById('fp-tabs').style.display=fpVisible?'flex':'none';
  const btn=document.getElementById('fp-btn');
  if(btn){btn.classList.toggle('active',fpVisible);btn.textContent=fpVisible?'⊟ 3D':'⊞ Plan';}
  if(fpVisible){fpScale=1;fpPanX=0;fpPanY=0;syncFpMode();drawFloorPlan();}
}

function fpCanvasCoords(e){const r=fpCV.getBoundingClientRect();return{cx:e.clientX-r.left,cy:e.clientY-r.top};}
function fpSc(){return Math.min((fpCV.width-180)/W.len,(fpCV.height-180)/(fpMode==='wall'?W.h:FLOOR_DEPTH))*fpScale;}
