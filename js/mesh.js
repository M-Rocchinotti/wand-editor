// ─── 3D MESH IMPORT ───

function parseOBJ(text){
  const verts=[],uvs=[],tris=[];
  for(const raw of text.split('\n')){
    const line=raw.trim();
    if(line.startsWith('v ')){const[,x,y,z]=line.split(/\s+/);verts.push([+x,+y,+z]);}
    else if(line.startsWith('vt ')){const[,u,v]=line.split(/\s+/);uvs.push([+u,+v]);}
    else if(line.startsWith('f ')){
      const parts=line.slice(2).trim().split(/\s+/).map(p=>{const s=p.split('/');return{vi:+s[0]-1,ti:s[1]&&s[1]!==''?+s[1]-1:-1};});
      for(let i=1;i<parts.length-1;i++){const[a,b,c]=[parts[0],parts[i],parts[i+1]];tris.push([verts[a.vi],verts[b.vi],verts[c.vi],a.ti>=0?uvs[a.ti]:null,b.ti>=0?uvs[b.ti]:null,c.ti>=0?uvs[c.ti]:null]);}
    }
  }
  return tris;
}
function parseSTL(buf){
  const tris=[],dv=new DataView(buf),cnt=dv.getUint32(80,true);
  if(50*cnt+84===buf.byteLength){for(let i=0;i<cnt;i++){const o=84+i*50;tris.push([[dv.getFloat32(o+12,true),dv.getFloat32(o+16,true),dv.getFloat32(o+20,true)],[dv.getFloat32(o+24,true),dv.getFloat32(o+28,true),dv.getFloat32(o+32,true)],[dv.getFloat32(o+36,true),dv.getFloat32(o+40,true),dv.getFloat32(o+44,true)],null,null,null]);}}
  else{const t=new TextDecoder().decode(buf),re=/vertex\s+([\d.e+\-]+)\s+([\d.e+\-]+)\s+([\d.e+\-]+)/gi;let m,cur=[];while((m=re.exec(t))!==null){cur.push([+m[1],+m[2],+m[3]]);if(cur.length===3){tris.push([cur[0],cur[1],cur[2],null,null,null]);cur=[];}}}
  return tris;
}
function parseGLB(buf){
  const dv=new DataView(buf);
  if(dv.getUint32(0,true)!==0x46546C67)return[];
  const jLen=dv.getUint32(12,true),gltf=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,20,jLen)));
  const bin=buf.slice(20+jLen+8);const tris=[];
  if(!gltf.meshes)return tris;
  for(const mesh of gltf.meshes)for(const prim of(mesh.primitives||[])){
    const pa=gltf.accessors?.[prim.attributes?.POSITION];if(!pa)continue;
    const bv=gltf.bufferViews[pa.bufferView];const off=(bv.byteOffset||0)+(pa.byteOffset||0);
    const verts=[];const dv2=new DataView(bin,off);
    for(let i=0;i<pa.count;i++)verts.push([dv2.getFloat32(i*12,true),dv2.getFloat32(i*12+4,true),dv2.getFloat32(i*12+8,true)]);
    if(prim.indices!=null){const ia=gltf.accessors[prim.indices];const ib=gltf.bufferViews[ia.bufferView];const io=(ib.byteOffset||0)+(ia.byteOffset||0);const idv=new DataView(bin,io);const get=ia.componentType===5123?i=>idv.getUint16(i*2,true):i=>idv.getUint32(i*4,true);for(let i=0;i<ia.count;i+=3)tris.push([verts[get(i)],verts[get(i+1)],verts[get(i+2)],null,null,null]);}
    else for(let i=0;i<verts.length;i+=3)tris.push([verts[i],verts[i+1],verts[i+2],null,null,null]);
  }
  return tris;
}
function parsePLY(buf){
  const text=new TextDecoder().decode(new Uint8Array(buf,0,Math.min(2048,buf.byteLength)));
  const lines=text.split('\n');let vC=0,fC=0,hEnd=0;
  for(let i=0;i<lines.length;i++){const l=lines[i].trim();if(l.startsWith('element vertex'))vC=+l.split(' ')[2];if(l.startsWith('element face'))fC=+l.split(' ')[2];if(l==='end_header'){hEnd=i+1;break;}}
  const tris=[],allLines=new TextDecoder().decode(buf).split('\n');let li=hEnd;
  const verts=[];for(let i=0;i<vC;i++,li++){const p=allLines[li].trim().split(/\s+/);verts.push([+p[0],+p[1],+p[2]]);}
  for(let i=0;i<fC;i++,li++){const p=allLines[li].trim().split(/\s+/);const n=+p[0];for(let j=1;j<n-1;j++)tris.push([verts[+p[1]],verts[+p[1+j]],verts[+p[1+j+1]],null,null,null]);}
  return tris;
}
function processMesh(rawTris){
  if(!rawTris.length)return null;
  let mnX=Infinity,mnY=Infinity,mnZ=Infinity,mxX=-Infinity,mxY=-Infinity,mxZ=-Infinity;
  for(const[v0,v1,v2]of rawTris)for(const[x,y,z]of[v0,v1,v2]){mnX=Math.min(mnX,x);mnY=Math.min(mnY,y);mnZ=Math.min(mnZ,z);mxX=Math.max(mxX,x);mxY=Math.max(mxY,y);mxZ=Math.max(mxZ,z);}
  const srcW=mxX-mnX,srcH=mxY-mnY,srcD=mxZ-mnZ,maxDim=Math.max(srcW,srcH,srcD)||1,inv=1/maxDim;
  const tris=rawTris.map(([v0,v1,v2,uv0,uv1,uv2])=>{
    const x0=(v0[0]-mnX)*inv,y0=(v0[1]-mnY)*inv,z0=(v0[2]-mnZ)*inv;
    const x1=(v1[0]-mnX)*inv,y1=(v1[1]-mnY)*inv,z1=(v1[2]-mnZ)*inv;
    const x2=(v2[0]-mnX)*inv,y2=(v2[1]-mnY)*inv,z2=(v2[2]-mnZ)*inv;
    const ax=x1-x0,ay=y1-y0,az=z1-z0,bx=x2-x0,by=y2-y0,bz=z2-z0;
    const nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx,nl=Math.sqrt(nx*nx+ny*ny+nz*nz)||1;
    return{v:[[x0,y0,z0],[x1,y1,z1],[x2,y2,z2]],n:[nx/nl,ny/nl,nz/nl],uv:[uv0||null,uv1||null,uv2||null]};
  });
  return{tris,srcW,srcH,srcD};
}

function normLight(n){return 0.3+0.7*Math.max(0,n[0]*LDIR[0]+n[1]*LDIR[1]+n[2]*LDIR[2]);}

function meshCacheKey(o){return`${o.meshKey}|${o.x}|${o.y||0}|${o.rd||0}|${o.wz||0}|${o.w}|${o.h}|${o.d}|${CAM.az.toFixed(1)}|${CAM.el.toFixed(1)}|${CAM.zoom.toFixed(3)}|${CAM.panX.toFixed(1)}|${CAM.panY.toFixed(1)}|${SC.toFixed(4)}|${o.color}`;}

function drawTexTriCtx(c2,img,x0,y0,x1,y1,x2,y2,u0,v0,u1,v1,u2,v2,lf){
  const iw=img.width,ih=img.height;
  const du1=u1-u0,du2=u2-u0,dv1=v1-v0,dv2=v2-v0,det=du1*dv2-du2*dv1;if(Math.abs(det)<1e-10)return;
  const idx=1/det,dx1=x1-x0,dx2=x2-x0,dy1=y1-y0,dy2=y2-y0;
  const a=(dx1*dv2-dx2*dv1)*idx,b=(dx2*du1-dx1*du2)*idx,cc=x0-a*u0-b*v0;
  const d=(dy1*dv2-dy2*dv1)*idx,e=(dy2*du1-dy1*du2)*idx,f=y0-d*u0-e*v0;
  const[[ix0,iy0],[ix1,iy1],[ix2,iy2]]=[[x0,y0],[x1,y1],[x2,y2]].map(([px,py],_,arr)=>{
    const mx=(arr[0][0]+arr[1][0]+arr[2][0])/3,my=(arr[0][1]+arr[1][1]+arr[2][1])/3;
    const ddx=px-mx,ddy=py-my,dn=Math.hypot(ddx,ddy)||1;
    return[px+ddx/dn*.6,py+ddy/dn*.6];
  });
  c2.save();c2.beginPath();c2.moveTo(ix0,iy0);c2.lineTo(ix1,iy1);c2.lineTo(ix2,iy2);c2.closePath();c2.clip();
  c2.transform(a/iw,d/iw,b/ih,e/ih,cc,f);c2.globalAlpha=1;c2.drawImage(img,0,0,iw,ih);c2.restore();
  const sh=Math.max(0,1-lf);
  if(sh>0.02){c2.save();c2.beginPath();c2.moveTo(ix0,iy0);c2.lineTo(ix1,iy1);c2.lineTo(ix2,iy2);c2.closePath();c2.clip();c2.globalAlpha=sh*.65;c2.fillStyle='#000';c2.fill();c2.restore();}
}

function buildMeshCanvas(o){
  const mesh=MESHES[o.meshKey];if(!mesh||!mesh.tris.length)return null;
  const floor=isFloor(o.t);
  const ox=o.x,oy=floor?0:o.y,oz=floor?(o.rd||0):(o.wz||0);
  const mesh0=MESHES[o.meshKey];
  const _maxDim=Math.max(mesh0.srcW,mesh0.srcH,mesh0.srcD)||1;
  const scX=o.w*(_maxDim/(mesh0.srcW||1));
  const scY=o.h*(_maxDim/(mesh0.srcH||1));
  const scZ=o.d*(_maxDim/(mesh0.srcD||1));
  const azR=CAM.az*Math.PI/180,elR=CAM.el*Math.PI/180;
  const cosA=Math.cos(azR),sinA=Math.sin(azR),cosE=Math.cos(elR),sinE=Math.sin(elR);
  const SCZ=CAM.zoom*SC,SX0=OX+CAM.panX,SY0=OY+CAM.panY;
  const sCX=sceneCX(),sCY=sceneCY(),sCZ=sceneCZ();
  function projXY(wx,wy,wz){
    const cx=wx-sCX,cy=wy-sCY,cz=wz-sCZ;
    const rz=-cx*sinA+cz*cosA;
    return[SX0+(cx*cosA+cz*sinA)*SCZ, SY0-(cy*cosE-rz*sinE)*SCZ];
  }
  const tex=MESH_TEX[o.meshKey]||null;
  const[r,g,b]=h2r(o.color);
  const tris=mesh.tris,N=tris.length;
  const STRIDE=9;const buf=new Float32Array(N*STRIDE);
  let count=0,minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9;
  for(let i=0;i<N;i++){
    const tri=tris[i],v=tri.v;
    const[sx0,sy0]=projXY(ox+v[0][0]*scX,oy+v[0][1]*scY,oz+v[0][2]*scZ);
    const[sx1,sy1]=projXY(ox+v[1][0]*scX,oy+v[1][1]*scY,oz+v[1][2]*scZ);
    const[sx2,sy2]=projXY(ox+v[2][0]*scX,oy+v[2][1]*scY,oz+v[2][2]*scZ);
    const cx2=(v[0][0]+v[1][0]+v[2][0])/3*scX+ox-sCX;
    const cy2=(v[0][1]+v[1][1]+v[2][1])/3*scY+oy-sCY;
    const cz2=(v[0][2]+v[1][2]+v[2][2])/3*scZ+oz-sCZ;
    const rz=-cx2*sinA+cz2*cosA;
    const base=count*STRIDE;
    buf[base]=sx0;buf[base+1]=sy0;buf[base+2]=sx1;buf[base+3]=sy1;
    buf[base+4]=sx2;buf[base+5]=sy2;buf[base+6]=cy2*sinE+rz*cosE;
    buf[base+7]=normLight(tri.n);buf[base+8]=i;
    count++;
    if(sx0<minX)minX=sx0;if(sx0>maxX)maxX=sx0;if(sy0<minY)minY=sy0;if(sy0>maxY)maxY=sy0;
    if(sx1<minX)minX=sx1;if(sx1>maxX)maxX=sx1;if(sy1<minY)minY=sy1;if(sy1>maxY)maxY=sy1;
    if(sx2<minX)minX=sx2;if(sx2>maxX)maxX=sx2;if(sy2<minY)minY=sy2;if(sy2>maxY)maxY=sy2;
  }
  if(!count)return null;
  const indices=new Int32Array(count);for(let i=0;i<count;i++)indices[i]=i;
  indices.sort((a,b)=>buf[a*STRIDE+6]-buf[b*STRIDE+6]);
  const pad=4;
  minX=Math.floor(minX-pad);minY=Math.floor(minY-pad);maxX=Math.ceil(maxX+pad);maxY=Math.ceil(maxY+pad);
  const W2=Math.max(1,maxX-minX),H2=Math.max(1,maxY-minY);
  const oc=document.createElement('canvas');oc.width=W2;oc.height=H2;
  const oc2=oc.getContext('2d');
  if(tex){
    for(let ii=0;ii<count;ii++){
      const idx=indices[ii],base=idx*STRIDE,ti=buf[base+8],lf=buf[base+7];
      const tri=tris[ti],uv=tri.uv||[null,null,null];
      const ax=buf[base]-minX,ay=buf[base+1]-minY;
      const bx=buf[base+2]-minX,by=buf[base+3]-minY;
      const cx3=buf[base+4]-minX,cy3=buf[base+5]-minY;
      if(uv[0]&&uv[1]&&uv[2])drawTexTriCtx(oc2,tex,ax,ay,bx,by,cx3,cy3,uv[0][0],1-uv[0][1],uv[1][0],1-uv[1][1],uv[2][0],1-uv[2][1],lf);
      else{oc2.fillStyle=`rgb(${Math.round(r*lf)},${Math.round(g*lf)},${Math.round(b*lf)})`;oc2.beginPath();oc2.moveTo(ax,ay);oc2.lineTo(bx,by);oc2.lineTo(cx3,cy3);oc2.closePath();oc2.fill();}
    }
  } else {
    let lastFill='';
    for(let ii=0;ii<count;ii++){
      const idx=indices[ii],base=idx*STRIDE,lf=buf[base+7];
      const fill=`rgb(${Math.round(r*lf)},${Math.round(g*lf)},${Math.round(b*lf)})`;
      const ax=buf[base]-minX,ay=buf[base+1]-minY,bx=buf[base+2]-minX,by=buf[base+3]-minY,cx3=buf[base+4]-minX,cy3=buf[base+5]-minY;
      if(fill!==lastFill){oc2.fillStyle=fill;lastFill=fill;}
      oc2.beginPath();oc2.moveTo(ax,ay);oc2.lineTo(bx,by);oc2.lineTo(cx3,cy3);oc2.closePath();oc2.fill();
    }
  }
  return{canvas:oc,ox:minX,oy:minY};
}

function drawMeshObj(o){
  if(!MESHES[o.meshKey])return;
  const key=meshCacheKey(o);
  let cached=MESH_RENDER_CACHE[o.id];
  if(!cached||cached.key!==key){
    if(!cached){
      MESH_RENDER_CACHE[o.id]={key:'__pending__',canvas:null};
      requestAnimationFrame(()=>{const built=buildMeshCanvas(o);if(built)MESH_RENDER_CACHE[o.id]={key,...built};draw();});
      return;
    }
    const built=buildMeshCanvas(o);if(!built)return;
    cached={key,...built};MESH_RENDER_CACHE[o.id]=cached;
  }
  if(!cached.canvas)return;
  ctx.save();ctx.globalAlpha*=Math.min(1,o._p||1);ctx.drawImage(cached.canvas,cached.ox,cached.oy);
  if(sel===o.id){
    const fl=isFloor(o.t),ox2=o.x,oy2=fl?0:o.y,oz2=fl?(o.rd||0):(o.wz||0);
    const scX=o.w,scY=o.h,scZ=o.d;
    const corners=[[ox2,oy2,oz2],[ox2+scX,oy2,oz2],[ox2+scX,oy2+scY,oz2],[ox2,oy2+scY,oz2],[ox2,oy2,oz2+scZ],[ox2+scX,oy2,oz2+scZ],[ox2+scX,oy2+scY,oz2+scZ],[ox2,oy2+scY,oz2+scZ]];
    const sc2=corners.map(([wx,wy,wz])=>iso(wx,wy,wz));
    ctx.strokeStyle='#c8703a';ctx.lineWidth=1.5;ctx.setLineDash([4,3]);
    [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(...sc2[a]);ctx.lineTo(...sc2[b]);ctx.stroke();});
    ctx.setLineDash([]);selH((sc2[0][0]+sc2[6][0])/2,(sc2[0][1]+sc2[6][1])/2);
  }
  ctx.restore();
}

function load3D(inp){
  const f=inp.files[0];if(!f)return;inp.value='';
  const ext=f.name.split('.').pop().toLowerCase();
  const name=f.name.replace(/\.[^.]+$/,'');
  toast('Parsing '+f.name+'…');
  const reader=new FileReader();
  reader.onload=e=>{
    let rawTris=[];
    try{
      if(ext==='obj')rawTris=parseOBJ(e.target.result);
      else if(ext==='stl')rawTris=parseSTL(e.target.result);
      else if(ext==='glb'||ext==='gltf')rawTris=parseGLB(e.target.result);
      else if(ext==='ply')rawTris=parsePLY(e.target.result);
      else{toast(t('unsupported')+' '+ext,3000);return;}
    }catch(err){toast(t('parseError')+' '+err.message,4000);return;}
    if(!rawTris.length){toast(t('noGeometry'),3000);return;}
    const mesh=processMesh(rawTris);if(!mesh){toast(t('emptyMesh'),3000);return;}
    const key='mesh_'+Date.now();MESHES[key]=mesh;
    const maxSrc=Math.max(mesh.srcW,mesh.srcH,mesh.srcD)||1,scale=1000/maxSrc;
    showImportDialog(name,key,Math.round(mesh.srcW*scale)||500,Math.round(mesh.srcH*scale)||500,Math.round(mesh.srcD*scale)||500);
    toast(t('loaded')+' — '+rawTris.length+' '+t('tris'),2500);
  };
  if(ext==='obj'||ext==='gltf')reader.readAsText(f);else reader.readAsArrayBuffer(f);
}

function showImportDialog(name,key,defW,defH,defD){
  document.getElementById('import-dialog')?.remove();_impTexImg=null;
  const dlg=document.createElement('div');dlg.id='import-dialog';dlg._floor=true;
  dlg.style.cssText='position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.75);backdrop-filter:blur(4px)';
  dlg.innerHTML=`<div style="background:var(--s2);border:1px solid var(--b2);border-radius:2px;padding:20px;width:min(340px,92vw);font-family:'Inter',sans-serif"><div style="font-size:11px;color:var(--tx);letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px">${t('importModel')}</div><div style="font-size:9px;color:var(--mu);margin-bottom:3px">${t('label')}</div><input id="imp-label" value="${name}" style="width:100%;box-sizing:border-box;background:var(--s3);border:1px solid var(--b2);color:var(--tx);font-family:'Inter',sans-serif;font-size:11px;padding:6px 8px;border-radius:2px;outline:none;margin-bottom:10px"><div style="font-size:9px;color:var(--mu);margin-bottom:6px">${t('placeOn')}</div><div style="display:flex;gap:6px;margin-bottom:12px"><button id="imp-floor-btn" style="flex:1;padding:8px;background:var(--tx);border:none;border-radius:2px;color:#000;font-family:'Inter',sans-serif;font-size:10px;cursor:pointer">${t('floorBtn')}</button><button id="imp-wall-btn" style="flex:1;padding:8px;background:var(--s3);border:1px solid var(--b2);border-radius:2px;color:var(--mu);font-family:'Inter',sans-serif;font-size:10px;cursor:pointer">${t('wallBtn')}</button></div><div style="font-size:9px;color:var(--mu);margin-bottom:4px">${t('dimensions')}</div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:12px"><div><div style="font-size:8px;color:var(--fa);margin-bottom:2px">W</div><input id="imp-w" type="number" value="${defW}" style="width:100%;background:var(--s3);border:1px solid var(--b2);color:var(--tx);font-family:'DM Mono',monospace;font-size:10px;padding:5px;border-radius:2px;outline:none"></div><div><div style="font-size:8px;color:var(--fa);margin-bottom:2px">H</div><input id="imp-h" type="number" value="${defH}" style="width:100%;background:var(--s3);border:1px solid var(--b2);color:var(--tx);font-family:'DM Mono',monospace;font-size:10px;padding:5px;border-radius:2px;outline:none"></div><div><div style="font-size:8px;color:var(--fa);margin-bottom:2px">D</div><input id="imp-d" type="number" value="${defD}" style="width:100%;background:var(--s3);border:1px solid var(--b2);color:var(--tx);font-family:'DM Mono',monospace;font-size:10px;padding:5px;border-radius:2px;outline:none"></div></div><div style="font-size:9px;color:var(--mu);margin-bottom:4px">${t('texOptional')}</div><div style="margin-bottom:10px;display:flex;align-items:center;gap:8px"><button id="imp-tex-btn" style="flex:1;padding:6px 8px;background:var(--s3);border:1px solid var(--b2);border-radius:2px;color:var(--mu);font-family:'Inter',sans-serif;font-size:10px;cursor:pointer">${t('loadPng')}</button><span id="imp-tex-name" style="font-size:9px;color:var(--fa)">${t('none')}</span><input type="file" id="imp-tex-inp" accept="image/*" style="display:none" onchange="impTexLoaded(this)"></div><div id="imp-color-row"><div style="font-size:9px;color:var(--mu);margin-bottom:4px">${t('colorFallback')}</div><div style="display:flex;align-items:center;gap:8px;margin-bottom:14px"><div class="csw" style="width:32px;height:32px"><div class="csf" id="imp-cf" style="background:#8a7050"></div><input type="color" value="#8a7050" id="imp-color" oninput="document.getElementById('imp-cf').style.background=this.value"></div><div style="display:flex;gap:4px;flex-wrap:wrap">${['#8a7050','#6a4e28','#c8b890','#4a3828','#d0c8b8','#7a6040'].map(c=>`<div style="width:18px;height:18px;border-radius:2px;background:${c};cursor:pointer" onclick="document.getElementById('imp-color').value='${c}';document.getElementById('imp-cf').style.background='${c}'"></div>`).join('')}</div></div></div><div style="display:flex;gap:8px"><button onclick="document.getElementById('import-dialog').remove()" style="flex:1;padding:9px;background:var(--s3);border:1px solid var(--b2);border-radius:2px;color:var(--mu);font-family:'Inter',sans-serif;font-size:10px;cursor:pointer">${t('cancel')}</button><button onclick="confirmImport('${key}')" style="flex:1;padding:9px;background:var(--tx);border:none;border-radius:2px;color:#000;font-family:'Inter',sans-serif;font-size:10px;cursor:pointer;font-weight:500">${t('addToScene')}</button></div></div>`;
  document.body.appendChild(dlg);
  document.getElementById('imp-floor-btn').onclick=()=>{dlg._floor=true;document.getElementById('imp-floor-btn').style.background='var(--tx)';document.getElementById('imp-floor-btn').style.color='#000';document.getElementById('imp-wall-btn').style.background='var(--s3)';document.getElementById('imp-wall-btn').style.color='var(--mu)';};
  document.getElementById('imp-wall-btn').onclick=()=>{dlg._floor=false;document.getElementById('imp-wall-btn').style.background='var(--tx)';document.getElementById('imp-wall-btn').style.color='#000';document.getElementById('imp-floor-btn').style.background='var(--s3)';document.getElementById('imp-floor-btn').style.color='var(--mu)';};
  document.getElementById('imp-tex-btn').onclick=()=>document.getElementById('imp-tex-inp').click();
}
function impTexLoaded(inp){
  const f=inp.files[0];if(!f)return;
  const r=new FileReader();r.onload=e=>{const img=new Image();img.src=e.target.result;img.onload=()=>{_impTexImg=img;document.getElementById('imp-tex-name').textContent=f.name.slice(0,20);document.getElementById('imp-tex-btn').style.color='var(--ac)';document.getElementById('imp-color-row').style.display='none';};};
  r.readAsDataURL(f);inp.value='';
}
function confirmImport(key){
  const dlg=document.getElementById('import-dialog');
  const label=document.getElementById('imp-label').value||'Model';
  const w=+document.getElementById('imp-w').value||500,h=+document.getElementById('imp-h').value||500,d=+document.getElementById('imp-d').value||500;
  const color=document.getElementById('imp-color').value||'#8a7050';
  const floor=dlg._floor!==false;
  if(_impTexImg){MESH_TEX[key]=_impTexImg;_impTexImg=null;}
  dlg.remove();
  const tp='custom_'+key;
  const entry={t:tp,label,w,h,d,color,cat:floor?'Floor furniture':'Wall furniture',meshKey:key,imported:true};
  ETYPES.push(entry);IMPORTED.push(entry);rebuildImportedPalette();
  const o=makeObj(tp,Math.round(Math.max(0,W.len/2-w/2)),floor?0:Math.round(Math.max(0,W.h/2-h/2)),w,h,d,color,label);
  o.meshKey=key;if(floor)o.rd=Math.round(Math.max(0,Math.min(FLOOR_DEPTH-d,FLOOR_DEPTH/2-d/2)));
  objs().push(o);sel=o.id;
  draw();refreshList();refreshEdit();updateSelActions();toast(t('placed'),2000);
}
function rebuildImportedPalette(){
  const pal=document.getElementById('imported-pal');
  if(!IMPORTED.length){pal.innerHTML='';return;}
  pal.innerHTML='<div class="el-cat">'+t('importedModels')+'</div>'+IMPORTED.map(e=>`<div class="el-chip${placing===e.t?' active':''}" data-t="${e.t}" onclick="placing==='${e.t}'?stopPlacing():startPlacing('${e.t}')"><span class="el-ico"><svg width="22" height="14" viewBox="0 0 22 14"><rect x="3" y="2" width="10" height="10" rx="1" fill="currentColor" opacity=".3" stroke="currentColor" stroke-width="1"/><line x1="3" y1="2" x2="9" y2="1" stroke="currentColor" stroke-width="1"/><line x1="13" y1="2" x2="19" y2="1" stroke="currentColor" stroke-width="1"/><rect x="9" y="1" width="10" height="10" rx="1" fill="currentColor" opacity=".15" stroke="currentColor" stroke-width=".8"/></svg></span><span style="flex:1">${e.label}</span></div>`).join('');
}

function meshToOBJ(mesh){
  const lines=['# WallStudio'];
  for(const tri of mesh.tris){
    const[v0,v1,v2]=tri.v;
    [[v0,tri.uv?.[0]],[v1,tri.uv?.[1]],[v2,tri.uv?.[2]]].forEach(([v,uv])=>{
      lines.push(`v ${(v[0]*mesh.srcW).toFixed(5)} ${(v[1]*mesh.srcH).toFixed(5)} ${(v[2]*mesh.srcD).toFixed(5)}`);
      if(uv)lines.push(`vt ${uv[0].toFixed(5)} ${uv[1].toFixed(5)}`);
    });
  }
  let vi=1;
  for(const tri of mesh.tris){
    const hasUV=tri.uv?.[0]&&tri.uv?.[1]&&tri.uv?.[2];
    lines.push(hasUV?`f ${vi}/${vi} ${vi+1}/${vi+1} ${vi+2}/${vi+2}`:`f ${vi} ${vi+1} ${vi+2}`);vi+=3;
  }
  return lines.join('\n');
}
function imgToB64(img){const c=document.createElement('canvas');c.width=img.naturalWidth||img.width;c.height=img.naturalHeight||img.height;c.getContext('2d').drawImage(img,0,0);return c.toDataURL('image/png').split(',')[1];}
