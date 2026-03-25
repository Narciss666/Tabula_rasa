// ═══ TABULA RASA — director.js V21 ═══
// Changes: district awareness, time-of-day, richer atmosphere context
import { CS, SAVE_KEY } from './config.js';

let AK="", ND=false;
export function setKey(k){AK=k}
export function setNoDir(v){ND=v}
export function isNoDir(){return ND}

const DSYS=`Tu es le Directeur de Tabula Rasa. Une silhouette solitaire erre dans une ville la nuit. Ni nom, ni passé, ni but. Tu crées le monde par tes réponses.

TON STYLE: phrases courtes, sensorielles. Pas de métaphysique. Ce que le joueur VOIT, ENTEND, SENT. Béton mouillé, néon qui grésille, odeur de friture, bruit de pas. Concret.

DISTRICTS:
- Downtown (nord-ouest): tours de verre, banques, néons froids, cols blancs absents la nuit
- Industrial (est): briques, rouille, vapeur, camions garés, chiens errants
- Residential (sud): brownstones, lumières aux fenêtres, chats, odeur de cuisine

RÈGLES:
- "narrative": 1-2 phrases COURTES français. Sensoriel.
- "interior": porte → pièce concrète 1-2 phrases. Cohérent avec le district.
- "bubble": PNJ parle, max 5 mots. {"npcId":"texte"}
- "npcs_spawn": max 1. dx/dy (-4 à 4). desc inclut vêtements/posture. idle=lean/sit/walk.
- "objects_spawn": concrets+emoji. pickable:true si ramassable.
- profile_delta: -0.05 à 0.05.
- "arc": fil narratif émergent. Nomme-le. Réutilise les arcs existants.
- "weather": clear/drizzle/rain/fog. Change rarement.
- "world_mood": neutral/darker/warmer. Change rarement.

COHÉRENCE: Si le joueur revient vers un PNJ, fais évoluer la relation. Un inconnu peut devenir un allié. Ou une menace. Utilise les arcs et seeds pour tisser des fils.

INVENTAIRE: {inv}
ARCS EN COURS: {arcs}

JSON UNIQUEMENT:
{"narrative":"ou null","interior":"ou null","bubble":null,"npcs_spawn":[],"npcs_remove":[],"objects_spawn":[],"world_mood":null,"weather":null,"profile_delta":{"exploration":0,"confrontation":0,"social":0,"construction":0,"meaning":0},"rulebook_new":[],"seeds":[],"arc":null,"internal":""}`;

function getDistrict(px,py){
  const cx=px/CS,cy=py/CS;
  if(px<0||py<0||px>=CS||py>=CS)return "nature sauvage";
  if(cx<.4&&cy<.5)return "downtown";
  if(cx>.55)return "quartier industriel";
  return "quartier résidentiel";
}

function getTimeOfDay(dayT){
  const h=(dayT*24)|0;
  if(h<5)return "nuit profonde";
  if(h<7)return "aube";
  if(h<12)return "matinée";
  if(h<14)return "midi";
  if(h<18)return "après-midi";
  if(h<21)return "crépuscule";
  return "nuit";
}

export async function callDir(action,G,nh){
  if(ND)return null;
  const inv=G.inv.length?G.inv.map(o=>o.desc).join(", "):"rien";
  const arcs=[...new Set(G.arcs)].join(", ")||"aucun";
  const sys=DSYS.replace("{inv}",inv).replace("{arcs}",arcs);
  const district=getDistrict(G.px,G.py);
  const tod=getTimeOfDay(G.dayT);
  const npcCount=G.npcs.length;
  const mood=G.mood||"neutral";
  const weather=G.wth||"clear";

  const ctx=`#${G.ni+1} | ${district} | ${tod} | ${weather} | mood:${mood} | ${G.dw|0} pas
Pos:(${G.px.toFixed(1)},${G.py.toFixed(1)}) ${G.intr?"INTÉRIEUR":"DEHORS"}
ACTION: ${action}
${nh?`HISTORIQUE PNJ:\n${nh}\n`:""}Narration récente: ${G.nLog.slice(-6).join(" | ")||"début"}
PNJ présents (${npcCount}): ${G.npcs.map(n=>`[${n.id}]${n.desc}`).join(" | ")||"aucun"}
Profil: exploration=${G.prof.exploration.toFixed(2)} confrontation=${G.prof.confrontation.toFixed(2)} social=${G.prof.social.toFixed(2)} construction=${G.prof.construction.toFixed(2)} meaning=${G.prof.meaning.toFixed(2)}
Seeds: ${G.seeds.slice(-10).join(" | ")||"—"}
Arcs: ${arcs}`;

  try{
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",
      headers:{"Content-Type":"application/json","x-api-key":AK,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:500,system:sys,messages:[{role:"user",content:ctx}]})});
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
