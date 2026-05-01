// ─── WALL CONFIG ───
const W={len:5000,h:2600,d:200,col:{wall:'#cec8b4',side:'#b0a890',floor:'#7a6040'}};
const LT={x:2500,y:3000,on:false,i:0.6};
const pages=[{name:'Wall',objs:[]}];
let curP=0;
function objs(){return pages[curP].objs;}
const TC={};  // id → texture Image

// ─── ELEMENT TYPES ───
const FLOOR_CATS=['Floor furniture','Floor structural'];
const ETYPES=[
  {t:'tv',labelKey:'el_tv',label:'Television',w:1300,h:750,d:80,color:'#0a0a12',cat:'Wall furniture'},
  {t:'door',labelKey:'el_door',label:'Sliding Door',w:700,h:1000,d:40,color:'#a07848',cat:'Wall furniture'},
  {t:'tiles',labelKey:'el_tiles',label:'Wall Tiles',w:1200,h:800,d:15,color:'#d0c8b8',cat:'Wall furniture'},
  {t:'h-beam',labelKey:'el_hbeam_wall',label:'H-beam (wall)',w:1200,h:80,d:100,color:'#7a5828',cat:'Wall structural'},
  {t:'v-beam',labelKey:'el_vbeam_wall',label:'V-beam (wall)',w:80,h:1800,d:100,color:'#7a5828',cat:'Wall structural'},
  {t:'shelf',labelKey:'el_shelf',label:'Shelf',w:1000,h:40,d:220,color:'#6a4e28',cat:'Wall structural'},
  {t:'plank',labelKey:'el_plank_wall',label:'Plank (wall)',w:1200,h:180,d:80,color:'#9a7040',cat:'Wall structural'},
  {t:'frame',labelKey:'el_frame',label:'Frame',w:800,h:1000,d:40,color:'#5a4020',cat:'Wall structural'},
  {t:'strip',labelKey:'el_strip',label:'Strip',w:1400,h:20,d:60,color:'#8a6838',cat:'Wall structural'},
  {t:'fl-hbeam',labelKey:'el_hbeam_floor',label:'H-beam (floor)',w:1200,h:200,d:200,color:'#7a5828',cat:'Floor structural'},
  {t:'fl-vbeam',labelKey:'el_vbeam_floor',label:'V-beam (floor)',w:200,h:2200,d:200,color:'#7a5828',cat:'Floor structural'},
  {t:'fl-plank',labelKey:'el_plank_floor',label:'Plank (floor)',w:1800,h:80,d:300,color:'#9a7040',cat:'Floor structural'},
  {t:'fl-block',labelKey:'el_block',label:'Block',w:600,h:400,d:600,color:'#8a7050',cat:'Floor structural'},
  {t:'fl-step',labelKey:'el_step',label:'Step',w:1000,h:180,d:350,color:'#b0a080',cat:'Floor structural'},
  {t:'stand',labelKey:'el_stand',label:'TV Stand',w:1300,h:500,d:400,color:'#8a6838',cat:'Floor furniture'},
  {t:'sofa',labelKey:'el_sofa',label:'Sofa',w:2200,h:850,d:900,color:'#8a7a6a',cat:'Floor furniture'},
  {t:'armchair',labelKey:'el_armchair',label:'Armchair',w:900,h:800,d:850,color:'#7a6a5a',cat:'Floor furniture'},
  {t:'coffee',labelKey:'el_coffee',label:'Coffee table',w:1200,h:450,d:600,color:'#6a5030',cat:'Floor furniture'},
  {t:'dining',labelKey:'el_dining',label:'Dining table',w:1600,h:750,d:900,color:'#7a5830',cat:'Floor furniture'},
  {t:'cabinet',labelKey:'el_cabinet',label:'TV Cabinet',w:1800,h:500,d:500,color:'#8a7048',cat:'Floor furniture'},
  {t:'sideboard',labelKey:'el_sideboard',label:'Sideboard',w:1600,h:800,d:450,color:'#7a6038',cat:'Floor furniture'},
  {t:'carpet',labelKey:'el_carpet',label:'Carpet',w:2000,h:30,d:1400,color:'#8a8070',cat:'Floor furniture'},
  {t:'plant',labelKey:'el_plant',label:'Plant',w:300,h:1200,d:300,color:'#4a6828',cat:'Floor furniture'},
  {t:'lamp',labelKey:'el_lamp',label:'Floor lamp',w:200,h:1600,d:200,color:'#b0a080',cat:'Floor furniture'},
  {t:'light',labelKey:'el_light',label:'Light source',w:0,h:0,d:0,color:'#ffe080',cat:'Lighting'},
];
const IMPORTED=[];

function isFloor(t){const d=ETYPES.find(e=>e.t===t);return d&&FLOOR_CATS.includes(d.cat);}

// ─── OBJECT FACTORY ───
let nextId=1;
function makeObj(t,x,y,w,h,d,color,label){
  return{id:nextId++,t,x,y,w,h,d,color,label,_p:1,texUrl:null,rd:0,wz:0,meshKey:null};
}

// ─── CAMERA ───
let CAM={az:45,el:30,zoom:1,panX:0,panY:0};
const CAM_EL_MIN=5,CAM_EL_MAX=85,CAM_ZOOM_MIN=0.15,CAM_ZOOM_MAX=5;

// ─── CANVAS ───
const cv=document.getElementById('cv');
const ctx=cv.getContext('2d');
let SC=1,OX=0,OY=0;

// ─── UNDO / REDO ───
const undoStack=[],redoStack=[];

// ─── MULTI-SELECT ───
const multiSel=new Set();
let rbStart=null,rbActive=false;

// ─── POINTER STATE ───
let sel=null,dragObj=null,dragLt=false,dragOX=0,dragOY=0;
let axisLock=null,dragStartPos={x:0,y:0,rd:0};
let navDrag=null,pinchDist0=null,pinchSC0=1,touch2Start=null;
let clipboard=null;

// ─── DIM QUEUE ───
let DQ=[];

// ─── PLACING / GHOST ───
let placing=null,ghostPx=null,ghostPy=null,ghostSnap=false;

// ─── PAGE SCROLL WHEEL COOLDOWN ───
let wcd=false;

// ─── 3D MESH CACHES ───
const MESHES={},MESH_TEX={},MESH_RENDER_CACHE={};
let _impTexImg=null;

// ─── FLOOR PLAN STATE ───
let fpVisible=false,fpMode='floor';
const fpCV=document.getElementById('fp-cv');
const fpCtx=fpCV.getContext('2d');
let fpScale=1,fpPanX=0,fpPanY=0,fpDrag=null;
let fpGhostCx=null,fpGhostCy=null;

// ─── PRINT MODE ───
let printMode=false;

// ─── TOAST TIMER ───
let toastT=null;
