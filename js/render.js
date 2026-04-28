// ─── TEXTURE ON QUAD ───
function drawTexOnQuad(c,img,tlx,tly,trx,try_,brx,bry,blx,bly){
  const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height;
  if(!iw||!ih)return;
  drawTexTri2(c,img,iw,ih,tlx,tly,0,0,trx,try_,1,0,brx,bry,1,1);
  drawTexTri2(c,img,iw,ih,tlx,tly,0,0,brx,bry,1,1,blx,bly,0,1);
}
function drawTexTri2(c,img,iw,ih,x0,y0,u0,v0,x1,y1,u1,v1,x2,y2,u2,v2){
  const du1=u1-u0,du2=u2-u0,dv1=v1-v0,dv2=v2-v0;
  const det=du1*dv2-du2*dv1;if(Math.abs(det)<1e-10)return;
  const idx=1/det,dx1=x1-x0,dx2=x2-x0,dy1=y1-y0,dy2=y2-y0;
  const a=(dx1*dv2-dx2*dv1)*idx,b=(dx2*du1-dx1*du2)*idx,cc=x0-a*u0-b*v0;
  const d=(dy1*dv2-dy2*dv1)*idx,e=(dy2*du1-dy1*du2)*idx,f=y0-d*u0-e*v0;
  c.save();
  c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.lineTo(x2,y2);c.closePath();c.clip();
  c.transform(a/iw,d/iw,b/ih,e/ih,cc,f);c.globalAlpha=0.92;c.drawImage(img,0,0,iw,ih);
  c.restore();
}

// ─── WALL BOX ───
function wallBox(x,y,w,h,d,fc,tc,sc,p=1,ghost=false,img=null,wallZ=0){
  if((p||0)<0.01)return;
  ctx.save();ctx.globalAlpha*=ghost?0.75:1;
  const bl=iso(x,y,wallZ),br=iso(x+w,y,wallZ);
  const tr=iso(x+w,y+h,wallZ),tl=iso(x,y+h,wallZ);
  const rbl=iso(x,y,wallZ+d),rbr=iso(x+w,y,wallZ+d);
  const rtr=iso(x+w,y+h,wallZ+d),rtl=iso(x,y+h,wallZ+d);
  if(d>0){
    if(faceVisible(0,0,-1)){ctx.beginPath();ctx.moveTo(...bl);ctx.lineTo(...br);ctx.lineTo(...tr);ctx.lineTo(...tl);ctx.closePath();ctx.fillStyle=dk(fc,20);ctx.fill();}
    if(faceVisible(0,-1,0)){ctx.beginPath();ctx.moveTo(...bl);ctx.lineTo(...br);ctx.lineTo(...rbr);ctx.lineTo(...rbl);ctx.closePath();ctx.fillStyle=dk(fc,28);ctx.fill();}
    if(faceVisible(1,0,0)){ctx.beginPath();ctx.moveTo(...br);ctx.lineTo(...rbr);ctx.lineTo(...rtr);ctx.lineTo(...tr);ctx.closePath();ctx.fillStyle=sc;ctx.fill();}
    if(faceVisible(-1,0,0)){ctx.beginPath();ctx.moveTo(...bl);ctx.lineTo(...rbl);ctx.lineTo(...rtl);ctx.lineTo(...tl);ctx.closePath();ctx.fillStyle=dk(sc,12);ctx.fill();}
    if(faceVisible(0,1,0)){ctx.beginPath();ctx.moveTo(...tl);ctx.lineTo(...tr);ctx.lineTo(...rtr);ctx.lineTo(...rtl);ctx.closePath();ctx.fillStyle=tc;ctx.fill();}
  }
  if(faceVisible(0,0,1)){
    ctx.beginPath();ctx.moveTo(...rbl);ctx.lineTo(...rbr);ctx.lineTo(...rtr);ctx.lineTo(...rtl);ctx.closePath();
    if(!ghost){ctx.shadowBlur=3*SC;ctx.shadowColor='rgba(0,0,0,.2)';ctx.shadowOffsetX=-SC;ctx.shadowOffsetY=SC;}
    ctx.fillStyle=fc;ctx.fill();
    ctx.shadowBlur=ctx.shadowOffsetX=ctx.shadowOffsetY=0;
    if(img&&!ghost)drawTexOnQuad(ctx,img,rtl[0],rtl[1],rtr[0],rtr[1],rbr[0],rbr[1],rbl[0],rbl[1]);
    ctx.strokeStyle=dk(fc,13);ctx.lineWidth=.6;ctx.stroke();
  }
  ctx.restore();
}

// ─── FLOOR BOX ───
function floorBox(x,rd,w,h,d,fc,tc,sc,p=1,ghost=false,img=null){
  if((p||0)<0.01)return;
  ctx.save();ctx.globalAlpha*=ghost?0.75:1;
  const z1=rd,z2=rd+d;
  const bfl=iso(x,0,z2),bfr=iso(x+w,0,z2),bbl=iso(x,0,z1),bbr=iso(x+w,0,z1);
  const tfl=iso(x,h,z2),tfr=iso(x+w,h,z2),tbl=iso(x,h,z1),tbr=iso(x+w,h,z1);
  const f=lfAt((bfl[0]+bfr[0])/2,(tfl[1]+bfl[1])/2);
  const fca=shade(fc,f),tca=lt(fca,14),sca=dk(fca,20);
  if(faceVisible(0,0,-1)){ctx.beginPath();ctx.moveTo(...bbl);ctx.lineTo(...bbr);ctx.lineTo(...tbr);ctx.lineTo(...tbl);ctx.closePath();ctx.fillStyle=dk(fca,18);ctx.fill();}
  if(faceVisible(0,-1,0)){ctx.beginPath();ctx.moveTo(...bfl);ctx.lineTo(...bfr);ctx.lineTo(...bbr);ctx.lineTo(...bbl);ctx.closePath();ctx.fillStyle=dk(fca,28);ctx.fill();}
  if(faceVisible(1,0,0)){ctx.beginPath();ctx.moveTo(...bfr);ctx.lineTo(...bbr);ctx.lineTo(...tbr);ctx.lineTo(...tfr);ctx.closePath();ctx.fillStyle=sca;ctx.fill();}
  if(faceVisible(-1,0,0)){ctx.beginPath();ctx.moveTo(...bbl);ctx.lineTo(...bfl);ctx.lineTo(...tfl);ctx.lineTo(...tbl);ctx.closePath();ctx.fillStyle=dk(sca,10);ctx.fill();}
  if(faceVisible(0,1,0)){ctx.beginPath();ctx.moveTo(...tfl);ctx.lineTo(...tfr);ctx.lineTo(...tbr);ctx.lineTo(...tbl);ctx.closePath();ctx.fillStyle=tca;ctx.fill();}
  if(faceVisible(0,0,1)){
    ctx.beginPath();ctx.moveTo(...bfl);ctx.lineTo(...bfr);ctx.lineTo(...tfr);ctx.lineTo(...tfl);ctx.closePath();
    if(!ghost){ctx.shadowBlur=4*SC;ctx.shadowColor='rgba(0,0,0,.25)';ctx.shadowOffsetX=-SC;ctx.shadowOffsetY=SC;}
    ctx.fillStyle=fca;ctx.fill();
    ctx.shadowBlur=ctx.shadowOffsetX=ctx.shadowOffsetY=0;
    if(img&&!ghost)drawTexOnQuad(ctx,img,tfl[0],tfl[1],tfr[0],tfr[1],bfr[0],bfr[1],bfl[0],bfl[1]);
    ctx.strokeStyle=dk(fca,13);ctx.lineWidth=.6;ctx.stroke();
  }
  ctx.restore();
  return{fx:bfl[0],fy:tfl[1],fw:bfr[0]-bfl[0],fh:bfl[1]-tfl[1]};
}

// ─── DRAW ───
function draw(){
  layout();
  ctx.clearRect(0,0,cv.width,cv.height);
  DQ=[];
  drawFloor();
  drawWall();
  if(LT.on){
    const[lx,ly]=wp(LT.x,LT.y);
    const g=ctx.createRadialGradient(lx,ly,0,lx,ly,cv.width*.85);
    g.addColorStop(0,`rgba(255,245,190,${LT.i*.12})`);g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.save();ctx.fillStyle=g;ctx.fillRect(0,0,cv.width,cv.height);ctx.restore();
  }
  // Ghost: previous page objects drawn at low opacity
  if(curP>0){
    const prevObjs=pages[curP-1].objs.filter(o=>o._p>0.01).slice().sort((a,b)=>{
      const ma=isFloor(a.t)?(a.rd||0)+a.d:(a.wz||0)+a.d;
      const mb=isFloor(b.t)?(b.rd||0)+b.d:(b.wz||0)+b.d;
      return ma-mb;
    });
    ctx.save();ctx.globalAlpha=0.22;
    for(const o of prevObjs){
      if(o.meshKey)drawMeshObj(o);
      else if(isFloor(o.t))drawFloorObj(o);
      else drawWallObj(o);
    }
    ctx.restore();
  }
  const all=objs().filter(o=>o._p>0.01).slice().sort((a,b)=>{
    const ma=isFloor(a.t)?(a.rd||0)+a.d:(a.wz||0)+a.d;
    const mb=isFloor(b.t)?(b.rd||0)+b.d:(b.wz||0)+b.d;
    if(ma!==mb)return ma-mb;
    return iso(a.x+a.w/2,isFloor(a.t)?a.h/2:a.y+a.h/2,ma)[1]-iso(b.x+b.w/2,isFloor(b.t)?b.h/2:b.y+b.h/2,mb)[1];
  });
  for(const o of all){
    if(o.meshKey)drawMeshObj(o);
    else if(isFloor(o.t))drawFloorObj(o);
    else drawWallObj(o);
  }
  // Multi-select highlight
  if(multiSel.size>0){
    ctx.save();ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1.5;ctx.setLineDash([5,3]);
    objs().filter(o=>multiSel.has(o.id)).forEach(o=>{
      const fl=isFloor(o.t);
      const pts=fl?
        [iso(o.x,0,(o.rd||0)),iso(o.x+o.w,0,(o.rd||0)),iso(o.x+o.w,o.h,(o.rd||0)+o.d),iso(o.x,o.h,(o.rd||0)+o.d)]:
        [iso(o.x,o.y,(o.wz||0)+o.d),iso(o.x+o.w,o.y,(o.wz||0)+o.d),iso(o.x+o.w,o.y+o.h,(o.wz||0)+o.d),iso(o.x,o.y+o.h,(o.wz||0)+o.d)];
      ctx.beginPath();ctx.moveTo(...pts[0]);pts.slice(1).forEach(p=>ctx.lineTo(...p));ctx.closePath();ctx.stroke();
    });
    ctx.setLineDash([]);ctx.restore();
  }
  // Lock indicator
  objs().filter(o=>o.locked).forEach(o=>{
    const c=isFloor(o.t)?iso(o.x+o.w/2,o.h/2,(o.rd||0)+o.d/2):iso(o.x+o.w/2,o.y+o.h/2,(o.wz||0)+o.d/2);
    ctx.save();ctx.font='12px serif';ctx.globalAlpha=.55;ctx.fillText('🔒',c[0]-6,c[1]+4);ctx.restore();
  });
  drawLtIcon();
  drawGhost();
  drawRulers();
  if(sel)drawSelDims();
  flushDims();
  if(fpVisible){syncFpMode();drawFloorPlan();}
}

function drawFloor(){
  const P0=iso(0,0,0),P1=iso(W.len,0,0),P2=iso(W.len,0,FLOOR_DEPTH),P3=iso(0,0,FLOOR_DEPTH);
  if(!faceVisible(0,1,0))return;
  ctx.save();
  const g=ctx.createLinearGradient(P0[0],P0[1],P3[0],P3[1]);
  g.addColorStop(0,lt(W.col.floor,12));g.addColorStop(0.15,W.col.floor);g.addColorStop(1,dk(W.col.floor,50));
  ctx.beginPath();ctx.moveTo(...P0);ctx.lineTo(...P1);ctx.lineTo(...P2);ctx.lineTo(...P3);ctx.closePath();
  ctx.fillStyle=g;ctx.fill();
  ctx.lineWidth=.5;
  for(let i=1;i<12;i++){const t=i/12,z=FLOOR_DEPTH*t;const[lx,ly]=iso(0,0,z);const[rx,ry]=iso(W.len,0,z);ctx.strokeStyle=dk(W.col.floor,18);ctx.globalAlpha=.2*(1-t*.4);ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(rx,ry);ctx.stroke();}
  ctx.globalAlpha=.08;
  for(let i=0;i<=8;i++){const x=W.len*i/8;const[ax,ay]=iso(x,0,0);const[bx,by]=iso(x,0,FLOOR_DEPTH);ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();}
  ctx.globalAlpha=1;ctx.strokeStyle=dk(W.col.floor,30);ctx.lineWidth=1.4;
  ctx.beginPath();ctx.moveTo(...P0);ctx.lineTo(...P1);ctx.stroke();
  ctx.restore();
}

function drawWall(){
  const fc=W.col.wall,sc=dk(W.col.side,20),tc=lt(W.col.side,12);
  const A=iso(0,0,0),B=iso(W.len,0,0),C=iso(W.len,W.h,0),D=iso(0,W.h,0);
  const E=iso(0,0,-W.d),F=iso(W.len,0,-W.d),G=iso(W.len,W.h,-W.d),H=iso(0,W.h,-W.d);
  ctx.save();
  if(faceVisible(0,0,1)){ctx.beginPath();ctx.moveTo(...A);ctx.lineTo(...B);ctx.lineTo(...C);ctx.lineTo(...D);ctx.closePath();ctx.shadowBlur=4*SC;ctx.shadowColor='rgba(0,0,0,.15)';ctx.shadowOffsetX=-2*SC;ctx.shadowOffsetY=2*SC;ctx.fillStyle=fc;ctx.fill();ctx.shadowBlur=ctx.shadowOffsetX=ctx.shadowOffsetY=0;ctx.strokeStyle=dk(fc,10);ctx.lineWidth=.5;ctx.stroke();const BA2=iso(0,30,0),BB2=iso(W.len,30,0);ctx.beginPath();ctx.moveTo(...A);ctx.lineTo(...B);ctx.lineTo(...BB2);ctx.lineTo(...BA2);ctx.closePath();ctx.fillStyle=dk(fc,18);ctx.fill();}
  if(faceVisible(0,0,-1)){ctx.beginPath();ctx.moveTo(...E);ctx.lineTo(...F);ctx.lineTo(...G);ctx.lineTo(...H);ctx.closePath();ctx.fillStyle=dk(fc,25);ctx.fill();ctx.strokeStyle=dk(fc,10);ctx.lineWidth=.5;ctx.stroke();}
  if(faceVisible(1,0,0)){ctx.beginPath();ctx.moveTo(...B);ctx.lineTo(...F);ctx.lineTo(...G);ctx.lineTo(...C);ctx.closePath();ctx.fillStyle=sc;ctx.fill();}
  if(faceVisible(-1,0,0)){ctx.beginPath();ctx.moveTo(...E);ctx.lineTo(...A);ctx.lineTo(...D);ctx.lineTo(...H);ctx.closePath();ctx.fillStyle=dk(sc,8);ctx.fill();}
  if(faceVisible(0,1,0)){ctx.beginPath();ctx.moveTo(...D);ctx.lineTo(...C);ctx.lineTo(...G);ctx.lineTo(...H);ctx.closePath();ctx.fillStyle=tc;ctx.fill();}
  if(faceVisible(0,-1,0)){ctx.beginPath();ctx.moveTo(...A);ctx.lineTo(...B);ctx.lineTo(...F);ctx.lineTo(...E);ctx.closePath();ctx.fillStyle=dk(fc,35);ctx.fill();}
  ctx.restore();
}

function drawWallObj(o){
  const p=o._p,img=TC[o.id]||null;
  const[fx,fy]=wp(o.x,o.y);
  const f=lfAt(fx+o.w*COS30*SC/2,fy);
  const fc=shade(o.color,f);
  const wz=o.wz||0;
  if(o.t==='tv'){
    wallBox(o.x,o.y,o.w,o.h,o.d,fc,lt(fc,20),dk(fc,8),p,false,img,wz);
    if(p>.1&&!img){
      ctx.save();ctx.globalAlpha=1;
      const pad=1.5;
      const sg=ctx.createLinearGradient(...iso(o.x+pad,o.y+pad,wz+o.d),...iso(o.x+o.w-pad,o.y+o.h-pad,wz+o.d));
      sg.addColorStop(0,'#1c2448');sg.addColorStop(.5,'#0d1428');sg.addColorStop(1,'#050810');
      ctx.fillStyle=sg;ctx.beginPath();
      ctx.moveTo(...iso(o.x+pad,o.y+pad,wz+o.d));ctx.lineTo(...iso(o.x+o.w-pad,o.y+pad,wz+o.d));
      ctx.lineTo(...iso(o.x+o.w-pad,o.y+o.h-pad,wz+o.d));ctx.lineTo(...iso(o.x+pad,o.y+o.h-pad,wz+o.d));
      ctx.closePath();ctx.fill();ctx.restore();
    }
  } else if(o.t==='tiles'){
    wallBox(o.x,o.y,o.w,o.h,o.d,fc,lt(fc,8),dk(fc,14),p,false,img,wz);
    if(!img&&p>.5){
      ctx.save();ctx.globalAlpha=0.35;
      ctx.beginPath();ctx.moveTo(...iso(o.x,o.y,wz+o.d));ctx.lineTo(...iso(o.x+o.w,o.y,wz+o.d));ctx.lineTo(...iso(o.x+o.w,o.y+o.h,wz+o.d));ctx.lineTo(...iso(o.x,o.y+o.h,wz+o.d));ctx.closePath();ctx.clip();
      ctx.strokeStyle=dk(o.color,30);ctx.lineWidth=Math.max(1,SC);
      for(let i=1;i<6;i++){const tx=o.x+o.w*i/6;ctx.beginPath();ctx.moveTo(...iso(tx,o.y,wz+o.d));ctx.lineTo(...iso(tx,o.y+o.h,wz+o.d));ctx.stroke();}
      for(let i=1;i<4;i++){const ty=o.y+o.h*i/4;ctx.beginPath();ctx.moveTo(...iso(o.x,ty,wz+o.d));ctx.lineTo(...iso(o.x+o.w,ty,wz+o.d));ctx.stroke();}
      ctx.restore();
    }
  } else if(o.t==='shelf'){
    wallBox(o.x,o.y,o.w,o.h,o.d,fc,lt(fc,18),dk(fc,18),p,false,img,wz);
    if(p>.5)[o.x+2,o.x+o.w-4].forEach(bx2=>wallBox(bx2,o.y,1.5,o.h*3.5,o.d,dk(fc,12),lt(o.color,5),dk(o.color,24),p,false,null,wz));
  } else {
    wallBox(o.x,o.y,o.w,o.h,o.d,fc,lt(fc,18),dk(fc,18),p,false,img,wz);
  }
  if(sel===o.id){
    const pts=[iso(o.x,o.y,wz),iso(o.x+o.w,o.y,wz),iso(o.x+o.w,o.y+o.h,wz),iso(o.x,o.y+o.h,wz),iso(o.x,o.y,wz+o.d),iso(o.x+o.w,o.y,wz+o.d),iso(o.x+o.w,o.y+o.h,wz+o.d),iso(o.x,o.y+o.h,wz+o.d)];
    ctx.save();ctx.strokeStyle='#c8703a';ctx.lineWidth=1.7;ctx.setLineDash([5,3]);
    [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(...pts[a]);ctx.lineTo(...pts[b]);ctx.stroke();});
    ctx.setLineDash([]);selH((pts[0][0]+pts[6][0])/2,(pts[0][1]+pts[6][1])/2);ctx.restore();
  }
}

function drawFloorObj(o){
  const img=TC[o.id]||null;
  const f=lfAt(...iso(o.x,0,o.rd||0));
  const fc=shade(o.color,f),tc=lt(fc,16),sc=dk(fc,22);
  const res=floorBox(o.x,o.rd||0,o.w,o.h,o.d,fc,tc,sc,o._p,false,img);
  if(sel===o.id&&res){
    ctx.save();ctx.strokeStyle='#c8703a';ctx.lineWidth=1.7;ctx.setLineDash([5,3]);
    ctx.strokeRect(res.fx-5,res.fy-5,res.fw+10,res.fh+10);ctx.setLineDash([]);
    selH(res.fx+res.fw/2,res.fy+res.fh/2);ctx.restore();
  }
}

function selH(hx,hy){ctx.fillStyle='rgba(200,112,58,.9)';ctx.beginPath();ctx.arc(hx,hy,7,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(hx-3.5,hy);ctx.lineTo(hx+3.5,hy);ctx.stroke();ctx.beginPath();ctx.moveTo(hx,hy-3.5);ctx.lineTo(hx,hy+3.5);ctx.stroke();}

function drawLtIcon(){
  if(!LT.on)return;
  const[lx,ly]=wp(LT.x,LT.y);
  ctx.save();
  const g=ctx.createRadialGradient(lx,ly,0,lx,ly,28*SC);
  g.addColorStop(0,'rgba(255,240,120,.18)');g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(lx,ly,28*SC,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,230,80,.9)';ctx.strokeStyle='rgba(180,140,30,.7)';ctx.lineWidth=1.3;
  ctx.beginPath();ctx.arc(lx,ly,5,0,Math.PI*2);ctx.fill();ctx.stroke();
  for(let a=0;a<8;a++){const r=a*Math.PI/4;ctx.strokeStyle='rgba(255,230,80,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(lx+Math.cos(r)*8,ly+Math.sin(r)*8);ctx.lineTo(lx+Math.cos(r)*12,ly+Math.sin(r)*12);ctx.stroke();}
  ctx.restore();
}

// ─── GHOST ───
function drawGhost(){
  if(!placing||ghostPx===null)return;
  const def=ETYPES.find(d=>d.t===placing);if(!def||def.t==='light')return;
  if(isFloor(def.t)){
    const{wx,wz:wzR}=screenToFloor(ghostPx,ghostPy);
    const wz=Math.max(10+def.d/2,Math.min(FLOOR_DEPTH-def.d/2,wzR));
    let rd=Math.max(0,Math.min(FLOOR_DEPTH-def.d,wz-def.d/2));
    let x=Math.max(0,Math.min(W.len-def.w,wx-def.w/2));
    if(ghostSnap){const snap=snapFloor(x,rd,{id:-1,w:def.w,h:def.h,d:def.d,t:def.t,_p:1});x=snap.x;rd=snap.rd;}
    const testO={t:def.t,x,y:0,w:def.w,h:def.h,d:def.d,rd,id:-1,_p:1};
    const col=hasCollision(testO)?'#e04040':def.color;
    if(def.meshKey){ctx.globalAlpha=0.5;drawMeshObj({...testO,meshKey:def.meshKey,color:col,wz:0,label:def.label});ctx.globalAlpha=1;}
    else floorBox(x,rd,def.w,def.h,def.d,col,lt(col,18),dk(col,18),1,true);
    if(wzR>=0){
      const[w0x,w0y]=iso(x,0,(rd||0)+def.d+60),[w1x,w1y]=iso(x+def.w,0,(rd||0)+def.d+60);
      dimLineH(w0x,w0y,w1x,w1y,'rgba(200,112,58,.9)',def.w,null);
      const[hbx,hby]=iso(x,0,(rd||0)+def.d),[htx,hty]=iso(x,def.h,(rd||0)+def.d);
      dimLineV(hbx-16*SC,hby,hbx-16*SC,hty,'rgba(200,112,58,.9)',def.h,null);
    }
  } else {
    const baseWZ=pages[curP].baseWZ||0;
    const{x:rx,y:ry}=screenToWall(ghostPx,ghostPy,baseWZ);
    let wx=Math.max(0,Math.min(W.len-def.w,rx-def.w/2));
    let wy=Math.max(0,Math.min(W.h-def.h,ry-def.h/2));
    if(ghostSnap){const snap=snapWall(wx,wy,{id:-1,w:def.w,h:def.h,d:def.d,t:def.t,wz:baseWZ,_p:1});wx=snap.x;wy=snap.y;}
    const testW={t:def.t,x:wx,y:wy,w:def.w,h:def.h,d:def.d,wz:baseWZ,id:-1,_p:1};
    const col=hasCollision(testW)?'#e04040':def.color;
    if(def.meshKey){ctx.globalAlpha=0.5;drawMeshObj({...testW,meshKey:def.meshKey,color:col,rd:0,label:def.label});ctx.globalAlpha=1;}
    else wallBox(wx,wy,def.w,def.h,def.d,col,lt(col,18),dk(col,18),1,true,null,baseWZ);
    const[tlx,tly]=iso(wx,wy+def.h,0.5),[trx,try_]=iso(wx+def.w,wy+def.h,0.5);
    dimLineH(tlx,tly-12*SC,trx,try_-12*SC,'rgba(200,112,58,.9)',def.w,null);
    const[blx,bly]=iso(wx,wy,0.5),[btlx,btly]=iso(wx,wy+def.h,0.5);
    dimLineV(blx-16*SC,bly,btlx-16*SC,btly,'rgba(200,112,58,.9)',def.h,null);
  }
}

// ─── DIMS ───
function dimLine(x1,y1,x2,y2,col,val,onSet){
  const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);if(len<4)return;
  ctx.save();ctx.strokeStyle=col;ctx.lineWidth=.6;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.setLineDash([]);ctx.restore();
  if(val!==undefined)DQ.push({mx:(x1+x2)/2,my:(y1+y2)/2,val,col,onSet});
}
function dimLineH(x1,y1,x2,y2,col,val,onSet,label=''){
  const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);if(len<6)return;
  ctx.save();ctx.strokeStyle=col;ctx.lineWidth=1.2;ctx.setLineDash([5,3]);
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.setLineDash([]);
  const tx=-(dy/len)*5,ty=(dx/len)*5;
  [[x1,y1],[x2,y2]].forEach(([px,py])=>{ctx.beginPath();ctx.moveTo(px+tx,py+ty);ctx.lineTo(px-tx,py-ty);ctx.stroke();});
  if(val!==undefined){if(onSet===null)drawPill((x1+x2)/2,(y1+y2)/2-10,Math.round(val)+'mm',col,'rgba(12,11,10,.9)');else DQ.push({mx:(x1+x2)/2,my:(y1+y2)/2-8,val,col,onSet,label});}
  ctx.restore();
}
function dimLineV(x1,y1,x2,y2,col,val,onSet,label=''){
  const sx=(x1+x2)/2,minY=Math.min(y1,y2),maxY=Math.max(y1,y2),len=maxY-minY;if(len<6)return;
  ctx.save();ctx.strokeStyle=col;ctx.lineWidth=1.2;ctx.setLineDash([5,3]);
  ctx.beginPath();ctx.moveTo(sx,minY);ctx.lineTo(sx,maxY);ctx.stroke();ctx.setLineDash([]);
  [[sx,minY],[sx,maxY]].forEach(([px,py])=>{ctx.beginPath();ctx.moveTo(px-5,py);ctx.lineTo(px+5,py);ctx.stroke();});
  if(val!==undefined){if(onSet===null)drawPill(sx,(minY+maxY)/2,Math.round(val)+'mm',col,'rgba(12,11,10,.9)');else DQ.push({mx:sx,my:(minY+maxY)/2,val,col,onSet,label});}
  ctx.restore();
}
function drawPill(cx,cy,text,borderCol,bgCol,align='center'){
  ctx.save();
  const fs=Math.max(10,Math.min(13,SC*10));ctx.font=`600 ${fs}px DM Mono,monospace`;
  const tw=ctx.measureText(text).width,pw=tw+12,ph=fs+8;
  const bx=align==='right'?cx-pw:align==='left'?cx:cx-pw/2;
  ctx.shadowBlur=6;ctx.shadowColor='rgba(0,0,0,.5)';ctx.shadowOffsetY=2;
  ctx.fillStyle=bgCol;ctx.beginPath();ctx.roundRect(bx,cy-ph/2,pw,ph,ph/2);ctx.fill();
  ctx.shadowBlur=0;ctx.shadowOffsetY=0;ctx.strokeStyle=borderCol;ctx.lineWidth=1.2;ctx.stroke();
  ctx.fillStyle=borderCol;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,bx+pw/2,cy);
  ctx.restore();
}

function drawRulers(){
  const os=objs().filter(o=>o._p>.5);if(!os.length)return;
  ctx.save();
  const HCOL='#5ab8a0',VCOL='#e8a040',rOY=22*SC,rOX=22*SC,tH=7;
  const xBreaks=[...new Set([0,...os.map(o=>o.x),...os.map(o=>o.x+o.w),W.len])].sort((a,b)=>a-b);
  xBreaks.forEach((wx,i)=>{
    const[sx,sy]=iso(wx,0,0),ry=sy+rOY;
    ctx.strokeStyle=HCOL;ctx.lineWidth=1.2;ctx.globalAlpha=0.75;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx,ry+tH);ctx.stroke();ctx.globalAlpha=1;
    if(i<xBreaks.length-1){
      const nx=xBreaks[i+1],gap=Math.round(nx-wx);if(gap<=0)return;
      const[sx2,sy2]=iso(nx,0,0);
      ctx.strokeStyle=HCOL;ctx.lineWidth=1;ctx.setLineDash([5,3]);ctx.globalAlpha=0.45;
      ctx.beginPath();ctx.moveTo(sx,ry+tH);ctx.lineTo(sx2,sy2+rOY+tH);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;
      drawPill((sx+sx2)/2,(ry+sy2+rOY)/2+tH+2,gap+'mm',HCOL,'rgba(0,18,14,.9)');
    }
  });
  // Vertical ruler — same style as horizontal: tick + dashed connector + pill
  // Uses iso(0,wy,0) which follows the isometric wall-left-edge direction
  const wallOs=os.filter(o=>!isFloor(o.t));
  if(wallOs.length>0){
    const yBreaks=[...new Set([0,...wallOs.map(o=>o.y),...wallOs.map(o=>o.y+o.h),W.h])].sort((a,b)=>a-b);
    // offset direction: perpendicular-left from wall edge in screen space
    // wall left edge goes from iso(0,0,0) to iso(0,W.h,0) — compute unit perpendicular
    const[ex0,ey0]=iso(0,0,0),[ex1,ey1]=iso(0,W.h,0);
    const edgeLen=Math.sqrt((ex1-ex0)**2+(ey1-ey0)**2)||1;
    // perpendicular pointing left: rotate edge vector 90° CCW
    const perpX=-(ey1-ey0)/edgeLen, perpY=(ex1-ex0)/edgeLen;
    const offDist=rOX+tH; // how far to offset ticks from wall edge

    yBreaks.forEach((wy,i)=>{
      const[sx,sy]=iso(0,wy,0);
      // Tick: from wall edge outward along perp direction
      const tx0=sx, ty0=sy;
      const tx1=sx+perpX*offDist, ty1=sy+perpY*offDist;
      ctx.strokeStyle=VCOL;ctx.lineWidth=1.2;ctx.globalAlpha=0.75;
      ctx.beginPath();ctx.moveTo(tx0,ty0);ctx.lineTo(tx1,ty1);ctx.stroke();ctx.globalAlpha=1;

      if(i<yBreaks.length-1){
        const ny=yBreaks[i+1],gap=Math.round(ny-wy);if(gap<=0)return;
        const[sx2,sy2]=iso(0,ny,0);
        const tx2=sx2+perpX*offDist, ty2=sy2+perpY*offDist;
        // Dashed line connecting the two tick ends (follows isometric direction)
        ctx.strokeStyle=VCOL;ctx.lineWidth=1;ctx.setLineDash([5,3]);ctx.globalAlpha=0.45;
        ctx.beginPath();ctx.moveTo(tx1,ty1);ctx.lineTo(tx2,ty2);ctx.stroke();
        ctx.setLineDash([]);ctx.globalAlpha=1;
        // Pill label centered between the two tick ends
        drawPill((tx1+tx2)/2-6,(ty1+ty2)/2,gap+'mm',VCOL,'rgba(18,10,0,.9)','right');
      }
    });
  }
  ctx.restore();
}

function drawSelDims(){
  const o=objs().find(b=>b.id===sel);if(!o)return;
  if(isFloor(o.t)){
    const[w0x,w0y]=iso(o.x,0,(o.rd||0)+o.d+80),[w1x,w1y]=iso(o.x+o.w,0,(o.rd||0)+o.d+80);
    dimLineH(w0x,w0y,w1x,w1y,'#c8703a',o.w,v=>{o.w=Math.max(10,v);draw();refreshEdit();},t('width'));
    const[hbx,hby]=iso(o.x,0,(o.rd||0)+o.d),[htx,hty]=iso(o.x,o.h,(o.rd||0)+o.d);
    dimLineV(hbx-18*SC,hby,hbx-18*SC,hty,'#b89840',o.h,v=>{o.h=Math.max(5,v);draw();refreshEdit();},t('height'));
    const[dp0x,dp0y]=iso(o.x+o.w/2,0,o.rd||0),[dp1x,dp1y]=iso(o.x+o.w/2,0,(o.rd||0)+o.d);
    dimLineH(dp0x,dp0y+8*SC,dp1x,dp1y+8*SC,'#50a8a0',o.d,v=>{o.d=Math.max(10,v);draw();refreshEdit();},t('depth'));
    if((o.rd||0)>0){const[wb0x,wb0y]=iso(o.x+o.w/2,0,0),[wb1x,wb1y]=iso(o.x+o.w/2,0,o.rd||0);dimLineH(wb0x,wb0y+22*SC,wb1x,wb1y+22*SC,'#7060a0',o.rd||0,v=>{o.rd=Math.max(0,v);draw();refreshEdit();},t('distFromWall'));}
  } else {
    const wz=o.wz||0;
    const[tlx,tly]=iso(o.x,o.y+o.h,wz+o.d),[trx,try_]=iso(o.x+o.w,o.y+o.h,wz+o.d);
    dimLineH(tlx,tly-14*SC,trx,try_-14*SC,'#c8703a',o.w,v=>{o.w=Math.max(10,v);draw();refreshEdit();},t('width'));
    const[blx,bly]=iso(o.x,o.y,wz+o.d),[btlx,btly]=iso(o.x,o.y+o.h,wz+o.d);
    dimLineV(blx-18*SC,bly,btlx-18*SC,btly,'#b89840',o.h,v=>{o.h=Math.max(5,v);draw();refreshEdit();},t('height'));
    const midY=o.y+o.h/2;
    const[lEx,lEy]=iso(0,midY,wz),[lOx,lOy]=iso(o.x,midY,wz);
    if(o.x>5)dimLineH(lEx,lEy,lOx,lOy,'#60b070',Math.round(o.x),v=>{o.x=Math.max(0,Math.min(W.len-o.w,v));draw();refreshList();},t('fromLeft'));
    const[rEx,rEy]=iso(W.len,midY,wz),[rOx,rOy]=iso(o.x+o.w,midY,wz);
    if(W.len-o.x-o.w>5)dimLineH(rOx,rOy,rEx,rEy,'#50a8a0',Math.round(W.len-o.x-o.w),v=>{o.x=Math.max(0,Math.min(W.len-o.w,W.len-o.w-v));draw();refreshList();},t('fromRight'));
    const rX=o.x+o.w+20;
    const[fbX,fbY]=iso(rX,0,wz),[ftX,ftY]=iso(rX,o.y,wz);
    if(o.y>5)dimLineV(fbX,fbY,ftX,ftY,'#a06830',Math.round(o.y),v=>{o.y=Math.max(0,Math.min(W.h-o.h,v));draw();refreshList();},t('fromFloor'));
    const dTop=W.h-o.y-o.h;
    const[ttX,ttY]=iso(rX,o.y+o.h,wz),[twX,twY]=iso(rX,W.h,wz);
    if(dTop>5)dimLineV(ttX,ttY,twX,twY,'#8060c0',Math.round(dTop),v=>{o.y=Math.max(0,Math.min(W.h-o.h,W.h-o.h-v));draw();refreshList();},t('fromTop'));
  }
}

function flushDims(){
  document.querySelectorAll('.dw-panel').forEach(e=>e.remove());
  const items=DQ.filter(d=>d.onSet);if(!items.length)return;
  const vp=document.getElementById('vp');
  const cr=cv.getBoundingClientRect(),vr=vp.getBoundingClientRect();
  const sx=cr.width/cv.width,sy=cr.height/cv.height;
  // Anchor panel near selected object's screen centre
  const o=objs().find(b=>b.id===sel);
  let px=cr.left-vr.left+cv.width/2*sx, py=cr.top-vr.top+cv.height/2*sy;
  if(o){
    const [scx,scy]=isFloor(o.t)?iso(o.x+o.w/2,o.h/2,(o.rd||0)+o.d/2):iso(o.x+o.w/2,o.y+o.h/2,(o.wz||0)+o.d/2);
    px=cr.left-vr.left+scx*sx; py=cr.top-vr.top+scy*sy;
  }
  const panel=document.createElement('div');panel.className='dw-panel';
  const clampX=Math.min(vr.width-190,Math.max(10,px+20));
  const clampY=Math.min(vr.height-items.length*28-30,Math.max(10,py-items.length*14));
  panel.style.cssText=`left:${clampX}px;top:${clampY}px`;
  if(o){const title=document.createElement('div');title.className='dw-panel-title';title.textContent=o.label;panel.appendChild(title);}
  items.forEach(({val,col,onSet,label})=>{
    const row=document.createElement('div');row.className='dw';row.style.borderLeftColor=col;row.style.color=col;
    if(label){const lb=document.createElement('span');lb.className='dw-label';lb.textContent=label;row.appendChild(lb);}
    const wrap=document.createElement('div');wrap.className='dw-row';
    const inp=document.createElement('input');inp.type='number';inp.value=Math.round(val);
    const sp=document.createElement('span');sp.textContent='mm';
    inp.addEventListener('focus',()=>inp.select());
    inp.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'||e.key==='Tab'){e.preventDefault();onSet(+inp.value||0);inp.blur();}if(e.key==='Escape')inp.blur();});
    inp.addEventListener('change',()=>onSet(+inp.value||0));
    inp.addEventListener('pointerdown',e=>e.stopPropagation());
    wrap.appendChild(inp);wrap.appendChild(sp);row.appendChild(wrap);panel.appendChild(row);
  });
  panel.addEventListener('pointerdown',e=>e.stopPropagation());
  vp.appendChild(panel);
}
