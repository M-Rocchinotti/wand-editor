// ─── CONSTANTS ───
const COS30=Math.cos(30*Math.PI/180), SIN30=0.5;
const FLOOR_DEPTH=2000;

// ─── SCENE CENTRE ───
function sceneCX(){return W.len/2;}
function sceneCY(){return W.h/3;}
function sceneCZ(){return FLOOR_DEPTH/4;}

// ─── PROJECTION ───
function iso(wx,wy,wz){
  const cx=wx-sceneCX(),cy=wy-sceneCY(),cz=wz-sceneCZ();
  const azR=CAM.az*Math.PI/180,elR=CAM.el*Math.PI/180;
  const cosA=Math.cos(azR),sinA=Math.sin(azR),cosE=Math.cos(elR),sinE=Math.sin(elR);
  const rz=-cx*sinA+cz*cosA;
  const fx=cx*cosA+cz*sinA,fy=cy*cosE-rz*sinE;
  return[OX+CAM.panX+fx*SC*CAM.zoom, OY+CAM.panY-fy*SC*CAM.zoom];
}
function wp(x,y){return iso(x,y,0);}

// ─── LAYOUT ───
function layout(){
  const vp=document.getElementById('vp');
  const VW=vp.clientWidth-16,VH=vp.clientHeight-20;
  const maxZ=Math.max(W.d,FLOOR_DEPTH);
  const totalW=(W.len+maxZ)*COS30,totalH=W.h+(W.len+maxZ)*SIN30;
  SC=Math.min((VW-100)/totalW,(VH-44)/totalH,2.4);
  cv.width=Math.ceil(VW);cv.height=Math.ceil(VH);
  OX=VW/2;OY=44+W.h*SC+W.len*SIN30*SC+(VH-44-totalH*SC)/2;
}

// ─── FACE VISIBILITY ───
function faceVisible(nx,ny,nz){
  const azR=CAM.az*Math.PI/180,elR=CAM.el*Math.PI/180;
  const rz=-nx*Math.sin(azR)+nz*Math.cos(azR);
  return ny*Math.sin(elR)+rz*Math.cos(elR)>0;
}

// ─── CAMERA CONTROLS ───
function camOrbit(dAz,dEl){CAM.az=(CAM.az+dAz)%360;CAM.el=Math.max(CAM_EL_MIN,Math.min(CAM_EL_MAX,CAM.el+dEl));draw();}
function camZoom(f,cx,cy){const p=CAM.zoom;CAM.zoom=Math.max(CAM_ZOOM_MIN,Math.min(CAM_ZOOM_MAX,CAM.zoom*f));if(cx!==undefined){CAM.panX=(CAM.panX-cx+OX)*(CAM.zoom/p)+cx-OX;CAM.panY=(CAM.panY-cy+OY)*(CAM.zoom/p)+cy-OY;}draw();}
function camReset(){CAM={az:45,el:30,zoom:1,panX:0,panY:0};draw();}
function camSetView(az,el){CAM.az=az;CAM.el=el;CAM.zoom=1;CAM.panX=0;CAM.panY=0;draw();}

// ─── INVERSE PROJECTION ───
function unproject(px,py){
  const fx=(px-OX-CAM.panX)/(SC*CAM.zoom);
  const fy=-(py-OY-CAM.panY)/(SC*CAM.zoom);
  const azR=CAM.az*Math.PI/180,elR=CAM.el*Math.PI/180;
  return{fx,fy,cosE:Math.cos(elR),sinE:Math.sin(elR),cosA:Math.cos(azR),sinA:Math.sin(azR)};
}
function screenToWall(px,py,targetWZ=0){
  const{fx,fy,cosE,sinE,cosA,sinA}=unproject(px,py);
  const cz=targetWZ-sceneCZ();
  const cx=Math.abs(cosA)>0.01?(fx-cz*sinA)/cosA:(fx-cz*sinA)/(Math.sign(cosA||1)*0.01);
  const cxC=Math.max(-W.len,Math.min(W.len*2,cx));
  const cy=(fy-cxC*sinA*sinE-cz*cosA*sinE)/cosE;
  return{x:cxC+sceneCX(),y:cy+sceneCY()};
}
function screenToFloor(px,py){
  const{fx,fy,cosE,sinE,cosA,sinA}=unproject(px,py);
  const sCY=sceneCY(),sCZ=sceneCZ();
  const rz=sinE>0.01?((-sCY)*cosE-fy)/sinE:0;
  return{wx:fx*cosA-rz*sinA+sceneCX(),wz:fx*sinA+rz*cosA+sCZ};
}

// ─── COLOR UTILS ───
function h2r(h){return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
function r2h(r,g,b){return'#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');}
function lt(h,a){const[r,g,b]=h2r(h);return r2h(r+a,g+a,b+a);}
function dk(h,a){return lt(h,-a);}
function shade(h,f){const[r,g,b]=h2r(h);return r2h(r*f,g*f,b*f);}
function lfAt(cx,cy){
  if(!LT.on)return 1;
  const[lx,ly]=wp(LT.x,LT.y);
  const d=Math.sqrt((cx-lx)**2+(cy-ly)**2);
  return 0.55+0.45*(1-Math.min(1,d/(Math.max(cv.width,cv.height)*0.9)))*LT.i;
}
