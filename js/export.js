// ─── PRINT / ELEVATION MODE ───
function togglePrintMode(){
  printMode=!printMode;
  document.body.classList.toggle('print-mode',printMode);
  if(printMode){
    camSetView(0,1);
    toast('Print mode — ⎙ elevation view',2500);
  } else {
    camSetView(45,30);
  }
}

// ─── PDF EXPORT ───
async function exportPDF(){
  toast('Generating PDF…');
  await new Promise(r=>setTimeout(r,80));
  try{
    const{jsPDF}=window.jspdf;
    const PW=1754,PH=1240;

    const oc=document.createElement('canvas');
    oc.width=PW;oc.height=PH;
    const oc2=oc.getContext('2d');

    const savedFpScale=fpScale,savedFpX=fpPanX,savedFpY=fpPanY;
    fpScale=1;fpPanX=0;fpPanY=0;

    const doc=new jsPDF({orientation:'landscape',unit:'px',format:[PW,PH]});
    let firstPage=true;

    function renderPlanPage(pageIdx,mode,halfH){
      oc2.fillStyle='#0a0a0a';
      if(!halfH) oc2.fillRect(0,0,PW,PH);

      const drawY=halfH==='top'?0:halfH==='bottom'?PH/2:0;
      const drawH=halfH?PH/2:PH;

      const pg2=pages[pageIdx];
      const nObjs=pg2?(mode==='wall'?pg2.objs.filter(o=>!isFloor(o.t)).length:pg2.objs.filter(o=>isFloor(o.t)).length):0;
      const wDim=mode==='wall'?W.h:FLOOR_DEPTH;
      const topAnnotH=nObjs*20+30;
      const bottomAnnotH=nObjs*35+90+(nObjs>0?22+nObjs*17:0);
      const wallH_avail=Math.max(300,drawH-topAnnotH-bottomAnnotH);
      const sc_target=Math.min(wallH_avail/wDim,(PW-Math.max(80,nObjs*22+60)*2)/W.len);
      const pdfMargin=Math.max(40,Math.round(Math.min((PW-W.len*sc_target)/2,(drawH-wDim*sc_target)/2)));
      const naturalOy=drawH/2-wDim/2*sc_target;
      fpPanY=topAnnotH-naturalOy;

      oc2.save();
      if(halfH==='bottom') oc2.translate(0,PH/2);
      if(mode==='wall') drawWallElevationView(oc2,PW,drawH,pageIdx,pdfMargin);
      else drawFloorPlanView(oc2,PW,drawH,pageIdx,pdfMargin);
      oc2.restore();
      fpPanY=0;

      if(!halfH){
        oc2.save();
        oc2.fillStyle='#111';
        oc2.fillRect(0,PH-28,PW,28);
        oc2.strokeStyle='#222';oc2.lineWidth=1;
        oc2.beginPath();oc2.moveTo(0,PH-28);oc2.lineTo(PW,PH-28);oc2.stroke();
        oc2.fillStyle='#555';oc2.font='bold 10px Inter,sans-serif';
        oc2.textAlign='left';oc2.textBaseline='middle';
        const pgName=pages[pageIdx].name;
        oc2.fillText(`WALLSTUDIO  ·  ${pgName}  ·  ${W.len}mm × ${W.h}mm`,16,PH-14);
        oc2.textAlign='center';
        oc2.fillText(mode==='wall'?t('wallElevation'):t('floorPlanView'),PW/2,PH-14);
        oc2.textAlign='right';
        oc2.fillText(`Page ${pageIdx+1} of ${pages.length}  ·  ${new Date().toLocaleDateString()}`,PW-16,PH-14);
        oc2.restore();
      }
    }

    oc2.clearRect(0,0,PW,PH);
    oc2.fillStyle='#0a0a0a';oc2.fillRect(0,0,PW,PH);
    renderAllPagesMaterialList(oc2,PW,PH);
    doc.addImage(oc.toDataURL('image/png'),0,0,PW,PH);
    firstPage=false;

    for(let i=0;i<pages.length;i++){
      if(!firstPage) doc.addPage([PW,PH],'landscape');
      firstPage=false;
      oc2.clearRect(0,0,PW,PH);
      oc2.fillStyle='#0a0a0a';oc2.fillRect(0,0,PW,PH);
      renderPlanPage(i,'wall',null);
      doc.addImage(oc.toDataURL('image/png'),0,0,PW,PH);

      if(pages[i].objs.some(o=>isFloor(o.t))){
        doc.addPage([PW,PH],'landscape');
        oc2.clearRect(0,0,PW,PH);
        oc2.fillStyle='#0a0a0a';oc2.fillRect(0,0,PW,PH);
        renderPlanPage(i,'floor',null);
        doc.addImage(oc.toDataURL('image/png'),0,0,PW,PH);
      }
    }

    doc.addPage([PW,PH],'landscape');
    oc2.clearRect(0,0,PW,PH);
    oc2.fillStyle='#0a0a0a';oc2.fillRect(0,0,PW,PH);
    const cols=Math.min(pages.length,3);
    const rows=Math.ceil(pages.length/cols);
    const thumbW=PW/cols,thumbH=(PH-40)/rows;
    for(let i=0;i<pages.length;i++){
      const col=i%cols,row=Math.floor(i/cols);
      oc2.save();
      oc2.translate(col*thumbW,row*thumbH);
      oc2.beginPath();oc2.rect(0,0,thumbW-4,thumbH-4);oc2.clip();
      fpScale=0.5;fpPanX=0;fpPanY=0;
      drawWallElevationView(oc2,thumbW-4,thumbH-4,i,20,false);
      fpScale=1;
      oc2.strokeStyle='#222';oc2.lineWidth=1;oc2.strokeRect(0,0,thumbW-4,thumbH-4);
      oc2.fillStyle='#444';oc2.font='9px Inter,sans-serif';oc2.textAlign='left';oc2.textBaseline='bottom';
      oc2.fillText(pages[i].name,4,thumbH-6);
      oc2.restore();
    }
    oc2.fillStyle='#333';oc2.font='11px Inter,sans-serif';oc2.textAlign='center';oc2.textBaseline='bottom';
    oc2.fillText(t('allPagesOverview')+'  —  '+pages.length+'p',PW/2,PH-6);
    doc.addImage(oc.toDataURL('image/png'),0,0,PW,PH);

    fpScale=savedFpScale;fpPanX=savedFpX;fpPanY=savedFpY;
    if(fpVisible)drawFloorPlan();

    doc.save('wallstudio-plans.pdf');
    toast('PDF saved — '+(pages.length*2+1)+' pages',3000);
  }catch(err){toast('PDF error: '+err.message,4000);console.error(err);}
}
