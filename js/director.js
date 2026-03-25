// ═══ TABULA RASA — director.js ═══
import { CS, SAVE_KEY } from './config.js';

let AK="", ND=false;
export function setKey(k){AK=k}
export function setNoDir(v){ND=v}
export function isNoDir(){return ND}

const DSYS=`Tu es le Directeur de Tabula Rasa. Une silhouette erre dans une ville la nuit. Ni nom, ni passé, ni but.
RÈGLES:
- "narrative": 1-2 phrases COURTES français. Sensoriel (voit/entend/sent).
- "interior": porte → pièce concrète 1-2 phrases.
- "bubble": PNJ parle, max 5 mots. {"npcId":"texte"}
- "npcs_spawn": max 1. dx/dy (-4 à 4). desc+idle.
- "objects_spawn": concrets+emoji. pickable:true si ramassable.
- profile_delta: -0.05 à 0.05. arc: fil narratif.
INV: {inv} | ARCS: {arcs}
JSON:{"narrative":"ou null","interior":"ou null","bubble":null,"npcs_spawn":[],"npcs_remove":[],"objects_spawn":[],"world_mood":null,"weather":null,"profile_delta":{"exploration":0,"confrontation":0,"social":0,"construction":0,"meaning":0},"rulebook_new":[],"seeds":[],"arc":null,"internal":""}`;

export async function callDir(action,G,nh){
  if(ND)return null;
  const inv=G.inv.length?G.inv.map(o=>o.desc).join(","):"rien";
  const arcs=[...new Set(G.arcs)].join(",")||"aucun";
  const sys=DSYS.replace("{inv}",inv).replace("{arcs}",arcs);
  const c=`#${G.ni+1}|${G.px>=0&&G.px<CS?"ville":"nature"}|${(G.pt/60)|0}min|${G.dw|0}pas
(${G.px.toFixed(1)},${G.py.toFixed(1)}) ${G.intr?"INT":"EXT"}
${action}
${nh?`HIST:\n${nh}\n`:""}Log:${G.nLog.slice(-8).join("|")||"début"}
PNJ:${G.npcs.map(n=>`[${n.id}]${n.desc}`).join("|")||"-"}
P:e=${G.prof.exploration.toFixed(2)} c=${G.prof.confrontation.toFixed(2)} s=${G.prof.social.toFixed(2)} b=${G.prof.construction.toFixed(2)} m=${G.prof.meaning.toFixed(2)}
N:${G.seeds.slice(-8).join("|")||"-"}`;
  try{
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",
      headers:{"Content-Type":"application/json","x-api-key":AK,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:450,system:sys,messages:[{role:"user",content:c}]})});
    if(!r.ok)return null;
    const d=await r.json(),t=d.content?.map(c=>c.text||"").join("")||"";
    return JSON.parse(t.replace(/```json|```/g,"").trim());
  }catch(e){return null}
}

export function save(G){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify({
    px:G.px,py:G.py,prof:G.prof,nLog:G.nLog,rules:G.rules,seeds:G.seeds,
    npcs:G.npcs,objs:G.objs,ni:G.ni,dw:G.dw,tv:[...G.tv],pt:G.pt,
    mood:G.mood,wth:G.wth,dayT:G.dayT,
    inv:G.inv,nc:G.nc,arcs:G.arcs,lpi:G.lpi
  }))}catch(e){}
}

export function load(){
  try{
    const s=localStorage.getItem(SAVE_KEY);
    if(s){const d=JSON.parse(s);d.tv=new Set(d.tv);return d}
  }catch(e){}
  return null;
}
