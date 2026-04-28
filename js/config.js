// ─── MATERIAL PRESETS ───
const MATERIALS=[
  {name:'Oak',color:'#c8a96e',side:'#a07040'},
  {name:'Walnut',color:'#6b4423',side:'#4a2e12'},
  {name:'White',color:'#f0ede8',side:'#d8d4cc'},
  {name:'Concrete',color:'#9a9890',side:'#7a7870'},
  {name:'Marble',color:'#e8e2d8',side:'#c0b8a8'},
  {name:'Brick',color:'#a05030',side:'#7a3820'},
  {name:'Steel',color:'#788088',side:'#505860'},
  {name:'Black',color:'#181818',side:'#0a0a0a'},
  {name:'Pine',color:'#d4a870',side:'#b08040'},
  {name:'Ebony',color:'#2a1a10',side:'#180e06'},
  {name:'Cream',color:'#f5efe0',side:'#e0d8c0'},
  {name:'Slate',color:'#606870',side:'#404850'},
];

// ─── PALETTE ICONS ───
const IC={
  tv:'<rect x="1" y="2" width="20" height="11" rx="1.5" fill="currentColor"/><rect x="3" y="4" width="16" height="7" rx="1" fill="#050810"/>',
  door:'<rect x="1" y="1" width="8" height="12" rx="1" fill="currentColor" opacity=".9"/><rect x="10" y="1" width="8" height="12" rx="1" fill="currentColor" opacity=".65"/>',
  tiles:'<rect x="1" y="1" width="20" height="12" rx="1" fill="currentColor" opacity=".18"/><line x1="7" y1="1" x2="7" y2="13" stroke="currentColor" stroke-width="1.1"/><line x1="14" y1="1" x2="14" y2="13" stroke="currentColor" stroke-width="1.1"/><line x1="1" y1="5" x2="21" y2="5" stroke="currentColor" stroke-width="1.1"/><line x1="1" y1="9" x2="21" y2="9" stroke="currentColor" stroke-width="1.1"/>',
  'h-beam':'<rect x="1" y="5.5" width="20" height="3" rx="1" fill="currentColor"/>',
  'v-beam':'<rect x="8.5" y="1" width="3" height="12" rx="1" fill="currentColor"/>',
  shelf:'<rect x="1" y="7" width="20" height="2" rx="1" fill="currentColor"/>',
  plank:'<rect x="1" y="4.5" width="20" height="5" rx="1" fill="currentColor" opacity=".85"/>',
  frame:'<rect x="1" y="1" width="20" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="2"/>',
  strip:'<rect x="1" y="6.5" width="20" height="1.5" rx=".7" fill="currentColor"/>',
  'fl-hbeam':'<rect x="1" y="4" width="20" height="4" rx="1" fill="currentColor"/>',
  'fl-vbeam':'<rect x="9" y="1" width="4" height="12" rx="1" fill="currentColor"/>',
  'fl-plank':'<rect x="1" y="5" width="20" height="4" rx="1" fill="currentColor" opacity=".9"/>',
  'fl-block':'<rect x="3" y="3" width="14" height="9" rx="1.5" fill="currentColor" opacity=".85"/>',
  'fl-step':'<rect x="1" y="8" width="20" height="4" rx="1" fill="currentColor"/><rect x="5" y="5" width="15" height="3.5" rx="1" fill="currentColor" opacity=".7"/>',
  stand:'<rect x="1" y="6" width="20" height="6" rx="1" fill="currentColor"/>',
  sofa:'<rect x="1" y="4" width="20" height="8" rx="2" fill="currentColor" opacity=".8"/><rect x="1" y="4" width="3.5" height="8" rx="1.5" fill="currentColor"/><rect x="17.5" y="4" width="3.5" height="8" rx="1.5" fill="currentColor"/>',
  armchair:'<rect x="3" y="4" width="14" height="8" rx="2" fill="currentColor" opacity=".8"/><rect x="1" y="4" width="3.5" height="8" rx="1.5" fill="currentColor"/><rect x="17.5" y="4" width="3.5" height="8" rx="1.5" fill="currentColor"/>',
  coffee:'<rect x="2" y="4" width="16" height="6" rx="1.2" fill="currentColor" opacity=".8"/>',
  dining:'<rect x="1" y="4" width="20" height="5" rx="1" fill="currentColor" opacity=".8"/>',
  cabinet:'<rect x="1" y="3.5" width="20" height="8" rx="1.2" fill="currentColor"/>',
  sideboard:'<rect x="1" y="4" width="20" height="7" rx="1.2" fill="currentColor"/>',
  carpet:'<rect x="1" y="3" width="20" height="8" rx="1.2" fill="currentColor" opacity=".38"/>',
  plant:'<ellipse cx="11" cy="8" rx="5" ry="5" fill="currentColor" opacity=".8"/>',
  lamp:'<line x1="11" y1="1" x2="11" y2="12" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>',
  light:'<circle cx="11" cy="7" r="3.5" fill="currentColor" opacity=".9"/>',
};

// ─── COLOUR PRESET SWATCHES ───
const PSETS=['#7a5828','#a07840','#c8a060','#4a3018','#b08050','#241808','#e0b870','#5a3a18','#d4c090'];

// ─── LANGUAGE METADATA ───
const LANG_META={
  en:{label:'EN',name:'English'},
  de:{label:'DE',name:'Deutsch'},
  es:{label:'ES',name:'Español'},
  it:{label:'IT',name:'Italiano'},
  ru:{label:'RU',name:'Русский'},
  zh:{label:'中文',name:'中文'},
  fr:{label:'FR',name:'Français'},
};

// ─── LIGHT DIRECTION ───
const LDIR=[0.6,0.8,0.2];
