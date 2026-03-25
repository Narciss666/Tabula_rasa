// ═══ TABULA RASA — config.js V20 ═══
// Added: vehicle types, neon sign colors

export const TW=30, TH=15, CH=16, CC=3, CS=CH*CC;
export const SPD=.048, SPRNT=.082, CLERP=.07, IR=2.2;

// District colors
export const DR=[[22,22,38],[28,24,20],[26,26,34]];
export const DS=[[50,50,65],[52,46,40],[54,52,48]];
export const DC=[[66,66,78],[66,58,50],[68,66,62]];

// Building face palettes
export const DPAL=[
  [{r:[42,48,68],l:[28,32,48],t:[58,62,80]},{r:[50,50,66],l:[34,34,48],t:[62,62,78]}],
  [{r:[70,50,40],l:[50,36,28],t:[82,62,52]},{r:[65,55,45],l:[48,40,32],t:[78,68,58]}],
  [{r:[76,60,50],l:[56,44,36],t:[90,74,64]},{r:[60,56,52],l:[44,40,36],t:[74,68,64]}]
];

export const DST=[[30,35,50],[38,30,25],[40,34,30]];
export const DSG=[
  ["BANK","TOWER","PLAZA","LUXE"],
  ["DEPOT","CARGO","STEEL","AUTO"],
  ["CAFÉ","TABAC","FLEURS","VINS"]
];
export const DAW=[[140,75,45],[75,135,55],[170,115,55],[55,115,175]];
export const WLC=[[255,218,100],[255,186,70],[100,178,255],[255,152,68],[255,226,140]];

// NPC colors
export const NB=["#6a4a30","#384838","#4a3050","#404060","#604038","#285050","#505028","#604a30"];
export const NL=["#282838","#302828","#283028","#333","#2a2a38"];

// Vehicle colors + types
export const VC=["#383850","#582828","#283828","#484838","#282848","#505050","#4a3828","#284848"];
// Vehicle body types: 0=sedan, 1=van, 2=truck
export const VTYPES=[0,0,0,0,0,1,1,2];// weighted: mostly sedans

// Neon sign colors (for blinking signs at night)
export const NEON=[[255,60,60],[60,255,120],[60,150,255],[255,200,60],[255,100,200]];

export const SAVE_KEY="tr17";
