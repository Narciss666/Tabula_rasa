"use strict";
const TW=30,TH=15,CH=16,SPD=.048,SPRNT=.082,CLERP=.07,IR=2.2,CC=3,CS=CH*CC;
let AK="",ND=false;
function go(s){if(!s){const k=document.getElementById("K").value.trim();if(!k){alert("Clé requise.");return}AK=k;localStorage.setItem("trk",k)}else ND=true;
  document.getElementById("S").style.display="none";init()}
window.addEventListener("DOMContentLoaded",()=>{const k=localStorage.getItem("trk");if(k)document.getElementById("K").value=k});

function rng(s){return()=>{s=(s*16807+13)%2147483647;return s/2147483647}}
function HH(x,y){let h=(x*374761393+y*668265263+1013904223);h=(h^(h>>13))*1274126177;return(h^(h>>16))>>>0}
function iso(x,y,cx,cy,sw,sh){return{sx:(x-y)*TW+sw/2-cx,sy:(x+y)*TH+sh/2-cy}}
function lp(a,b,t){return a+(b-a)*t}
function cl(v,a,b){return v<a?a:v>b?b:v}
function gDist(gx,gy){const cx=gx/CS,cy=gy/CS;if(cx<.4&&cy<.5)return 0;if(cx>.55)return 1;return 2}

// Palettes
const DR=[[22,22,38],[28,24,20],[26,26,34]],DS=[[50,50,65],[52,46,40],[54,52,48]],DC=[[66,66,78],[66,58,50],[68,66,62]];
const DPAL=[
  [{r:[42,48,68],l:[28,32,48],t:[58,62,80]},{r:[50,50,66],l:[34,34,48],t:[62,62,78]}],
  [{r:[70,50,40],l:[50,36,28],t:[82,62,52]},{r:[65,55,45],l:[48,40,32],t:[78,68,58]}],
  [{r:[76,60,50],l:[56,44,36],t:[90,74,64]},{r:[60,56,52],l:[44,40,36],t:[74,68,64]}]];
const DST=[[30,35,50],[38,30,25],[40,34,30]];
const DSG=[["BANK","TOWER","PLAZA","LUXE"],["DEPOT","CARGO","STEEL","AUTO"],["CAFÉ","TABAC","FLEURS","VINS"]];
const DAW=[[140,75,45],[75,135,55],[170,115,55],[55,115,175]];
const WLC=[[255,218,100],[255,186,70],[100,178,255],[255,152,68],[255,226,140]];
const NB=["#6a4a30","#384838","#4a3050","#404060","#604038","#285050","#505028","#604a30"];
const NL=["#282838","#302828","#283028","#333","#2a2a38"];
const VC=["#383850","#582828","#283828","#484838","#282848","#505050","#4a3828"];

// ═══ DIRECTOR ═══
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

async function callD(action,G,nh){if(ND)return null;
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
  try{const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",
    headers:{"Content-Type":"application/json","x-api-key":AK,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:450,system:sys,messages:[{role:"user",content:c}]})});
    if(!r.ok)return null;const d=await r.json(),t=d.content?.map(c=>c.text||"").join("")||"";
    return JSON.parse(t.replace(/```json|```/g,"").trim())}catch(e){return null}}

function sav(G){try{localStorage.setItem("tr16",JSON.stringify({px:G.px,py:G.py,prof:G.prof,nLog:G.nLog,rules:G.rules,seeds:G.seeds,
  npcs:G.npcs,objs:G.objs,ni:G.ni,dw:G.dw,tv:[...G.tv],pt:G.pt,mood:G.mood,wth:G.wth,dayT:G.dayT,
  inv:G.inv,nc:G.nc,arcs:G.arcs,lpi:G.lpi}))}catch(e){}}
function ldG(){try{const s=localStorage.getItem("tr16");if(s){const d=JSON.parse(s);d.tv=new Set(d.tv);return d}}catch(e){}return null}

// ═══ WORLD ═══
class World{
  constructor(){this.ch=new Map()}
  k(a,b){return a+","+b}
  isC(a,b){return a>=0&&a<CC&&b>=0&&b<CC}
  tile(wx,wy){const c=this.gc(Math.floor(wx/CH),Math.floor(wy/CH));const lx=((wx%CH)+CH)%CH,ly=((wy%CH)+CH)%CH;return c.t[ly]?c.t[ly][lx]:0}
  gc(cx,cy){const k=this.k(cx,cy);if(this.ch.has(k))return this.ch.get(k);const c=this._g(cx,cy);this.ch.set(k,c);return c}
  vis(px,py){const a=Math.floor(px/CH),b=Math.floor(py/CH),o=[];for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)o.push(this.gc(a+dx,b+dy));return o}
  _g(cx,cy){
    const t=Array.from({length:CH},()=>Array(CH).fill(0)),sd=HH(cx,cy),rand=rng(sd),ox=cx*CH,oy=cy*CH;
    const bl=[],lamps=[],poi=[],trees=[],props=[],ambN=[],vehs=[],tLights=[];
    if(this.isC(cx,cy)){
      for(let ly=0;ly<CH;ly++)for(let lx=0;lx<CH;lx++){const gx=ox+lx,gy=oy+ly;
        if(gx%8<2||gy%8<2)t[ly][lx]=1;if(Math.abs(gx-CS/2)<2||Math.abs(gy-CS/2)<2)t[ly][lx]=1;}
      for(let ly=0;ly<CH;ly++)for(let lx=0;lx<CH;lx++){if(t[ly][lx])continue;
        for(const[dy,dx]of[[-1,0],[1,0],[0,-1],[0,1]]){const nx=lx+dx,ny=ly+dy;
          if(nx>=0&&nx<CH&&ny>=0&&ny<CH&&t[ny][nx]===1){t[ly][lx]=2;break}}}
      const cen=CS/2;
      for(let iy=0;iy<CH;iy+=8)for(let ix=0;ix<CH;ix+=8)
        if(t[iy]?.[ix]===1)tLights.push({x:ox+ix+2.3,y:oy+iy+.3,ph:rand()*10});
      for(let ly=0;ly<CH;ly++)for(let lx=0;lx<CH;lx++){
        if(t[ly][lx]!==0)continue;const gx=ox+lx,gy=oy+ly;const di=gDist(gx,gy);
        const[bw,bd]=[[3,3],[4,3],[3,4],[2,2],[2,3],[3,2]][HH(gx,gy)%6];
        if(lx+bw>CH||ly+bd>CH)continue;
        let ok=1;for(let dy=0;dy<bd&&ok;dy++)for(let dx=0;dx<bw&&ok;dx++){
          if(t[ly+dy][lx+dx]!==0)ok=0;if(dx===0&&lx>0&&t[ly+dy][lx-1]===3)ok=0;
          if(dy===0&&ly>0&&t[ly-1]?.[lx+dx]===3)ok=0;}
        if(!ok)continue;
        const dc=Math.sqrt((gx+bw/2-cen)**2+(gy+bd/2-cen)**2)/cen;
        const hM=di===0?1.4:di===1?.85:.7;
        const mH=(dc<.2?440:dc<.4?300:dc<.6?200:dc<.8?130:85)*hM;
        if(rand()<(dc>.6?.2:.08)&&bw>=3){
          for(let dy=0;dy<bd;dy++)for(let dx=0;dx<bw;dx++){t[ly+dy][lx+dx]=4;if(rand()<.2)trees.push({x:gx+dx,y:gy+dy})}
          poi.push({tp:"bench",x:gx+bw/2,y:gy+bd/2,id:`b${gx}_${gy}`});continue;}
        const h=40+rand()*(mH-40);const hsb=h>140&&rand()<.45;
        bl.push({x:gx,y:gy,w:bw,d:bd,h,di,pi:(rand()*2)|0,sd:(rand()*9999)|0,
          wst:di===0?0:di===1?2:1,sign:rand()<.18?DSG[di][(rand()*DSG[di].length)|0]:null,
          ac:rand()<.3&&h>80,tk:rand()<.12&&h>130,
          aw:rand()<.35,awc:DAW[(rand()*4)|0],hsb,sbh:hsb?h*.55+rand()*h*.2:0,sf:rand()<.5&&h>60,
          re:rand()<.4,rc:di===0?[70,75,90]:di===1?[85,70,55]:[80,70,60]});
        for(let dy=0;dy<bd;dy++)for(let dx=0;dx<bw;dx++)t[ly+dy][lx+dx]=3;
        const ds=[];
        if(ly+bd<CH)for(let dx=0;dx<bw;dx++)if(t[ly+bd]?.[lx+dx]<=2&&t[ly+bd][lx+dx]>=1){ds.push({x:gx+dx+.5,y:gy+bd+.3});break}
        if(ly>0)for(let dx=0;dx<bw;dx++)if(t[ly-1]?.[lx+dx]<=2){ds.push({x:gx+dx+.5,y:gy-.3});break}
        if(ds.length)poi.push({tp:"door",x:ds[0].x,y:ds[0].y,id:`d${gx}_${gy}`});}
      for(let ly=0;ly<CH;ly+=2)for(let lx=0;lx<CH;lx+=2){const gx=ox+lx,gy=oy+ly;const r2=rng(HH(gx,gy)+111);const roll=r2();
        if(t[ly][lx]===2){if(roll<.04)props.push({tp:"tc",x:gx+.5,y:gy+.5});else if(roll<.06)props.push({tp:"hy",x:gx+.3,y:gy+.5});
          else if(roll<.1)props.push({tp:"tr",x:gx+r2()*.5+.25,y:gy+r2()*.5+.25});}
        if(t[ly][lx]===1&&roll<.03)props.push({tp:"pu",x:gx+.5,y:gy+.5});
        if(t[ly][lx]===0&&roll<.015){let ab=0;for(const[dy,dx]of[[-1,0],[1,0],[0,-1],[0,1]]){const ny=ly+dy,nx=lx+dx;
          if(ny>=0&&ny<CH&&nx>=0&&nx<CH&&t[ny][nx]===3)ab++;}if(ab>=2)props.push({tp:"dm",x:gx+.5,y:gy+.5})}}
      for(let ly=0;ly<CH;ly+=3)for(let lx=0;lx<CH;lx+=3)
        if(t[ly][lx]===2&&rand()<.07)lamps.push({x:ox+lx+.5,y:oy+ly+.5});
      for(let iy=0;iy<CH;iy+=8)for(let ix=0;ix<CH;ix+=8)
        if(rand()<.3)poi.push({tp:"corner",x:ox+ix+1,y:oy+iy+1,id:`c${ox+ix}_${oy+iy}`});
      for(let i=0;i<2;i++){if(rand()>.5)continue;let ax=-1,ay=-1;
        for(let j=0;j<10;j++){const lx2=(rand()*CH)|0,ly2=(rand()*CH)|0;if(t[ly2]?.[lx2]<=2&&t[ly2][lx2]>=1){ax=ox+lx2;ay=oy+ly2;break}}
        if(ax>=0)ambN.push({x:ax+.5,y:ay+.5,bc:NB[(rand()*NB.length)|0],lc:NL[(rand()*NL.length)|0],
          dir:(rand()*4)|0,spd:.005+rand()*.005,ph:rand()*100,idle:rand()<.25?"lean":rand()<.4?"sit":"walk"})}
      if(rand()<.6){let vx=-1,vy=-1;for(let j=0;j<10;j++){const lx2=(rand()*CH)|0,ly2=(rand()*CH)|0;
        if(t[ly2]?.[lx2]===1){vx=ox+lx2;vy=oy+ly2;break}}
        if(vx>=0)vehs.push({x:vx+.5,y:vy+.5,col:VC[(rand()*VC.length)|0],dir:(rand()*4)|0,spd:.01+rand()*.008,pk:rand()<.4})}
    }else{
      const br=rng(HH(cx>>1,cy>>1));const bio=br()<.3?"forest":br()<.55?"field":br()<.75?"hills":"river";
      for(let ly=0;ly<CH;ly++)for(let lx=0;lx<CH;lx++){const gx=ox+lx,gy=oy+ly;
        if((gx>=0&&gx<2)||(gy>=0&&gy<2)){t[ly][lx]=1;continue}
        if(bio==="river"){const rc=CH/2+Math.sin(ly*.4+cx)*3;if(Math.abs(lx-rc)<2.5){t[ly][lx]=8;continue}if(Math.abs(lx-rc)<3.5){t[ly][lx]=9;continue}}
        t[ly][lx]=4;}
      const ps=rng(sd+555);let ppx=ps()<.5?0:CH-1,ppy=(ps()*CH)|0;const tx2=ps()<.5?CH-1:0,ty2=(ps()*CH)|0;
      for(let step=0;step<30;step++){if(ppx>=0&&ppx<CH&&ppy>=0&&ppy<CH&&t[ppy][ppx]!==8)t[ppy][ppx]=7;
        const ddx=tx2-ppx,ddy=ty2-ppy;if(Math.abs(ddx)+Math.abs(ddy)<2)break;
        if(ps()<.6)ppx+=ddx>0?1:-1;else ppy+=ddy>0?1:-1;ppx=cl(ppx,0,CH-1);ppy=cl(ppy,0,CH-1);}
      const dn=bio==="forest"?.2:bio==="river"?.08:bio==="field"?.04:.07;
      for(let ly=0;ly<CH;ly++)for(let lx=0;lx<CH;lx++)if(t[ly][lx]===4&&rand()<dn)trees.push({x:ox+lx,y:oy+ly});
      if(rand()<.15)poi.push({tp:"clearing",x:ox+7+rand()*3,y:oy+7+rand()*3,id:`cl${cx}_${cy}`});
      if(rand()<.08)poi.push({tp:"ruin",x:ox+4+rand()*8,y:oy+4+rand()*8,id:`ru${cx}_${cy}`});}
    return{t,bl,lamps,poi,trees,props,ambN,vehs,tLights,cx,cy}}
}

// ═══ RENDERERS ═══
function drawGnd(c,sx,sy,tile,dL,gx,gy,time){
  const di=gDist(gx,gy);const m=.65+dL*.35;
  let co=tile===1?DR[di]:tile===2?DS[di]:tile===3?[20,20,32]:tile===4?[22,36,20]:tile===7?[40,34,26]:tile===8?[16,26,48]:tile===9?[28,33,23]:[18,18,28];
  c.fillStyle=`rgb(${co[0]*m|0},${co[1]*m|0},${co[2]*m|0})`;
  c.beginPath();c.moveTo(sx,sy-TH);c.lineTo(sx+TW,sy);c.lineTo(sx,sy+TH);c.lineTo(sx-TW,sy);c.closePath();c.fill();
  const noise=HH(gx*3,gy*7)%5-2;
  if(tile<=2){c.fillStyle=`rgba(${noise>0?255:0},${noise>0?255:0},${noise>0?255:0},.02)`;
    c.beginPath();c.moveTo(sx,sy-TH);c.lineTo(sx+TW,sy);c.lineTo(sx,sy+TH);c.lineTo(sx-TW,sy);c.closePath();c.fill();}
  if(tile===8){c.fillStyle=`rgba(40,60,100,${.06+Math.sin(time*2+gx*.7+gy*.5)*.03})`;
    c.beginPath();c.moveTo(sx,sy-TH);c.lineTo(sx+TW,sy);c.lineTo(sx,sy+TH);c.lineTo(sx-TW,sy);c.closePath();c.fill();}
  if(tile===2){const cb=DC[di];c.strokeStyle=`rgba(${cb[0]*m|0},${cb[1]*m|0},${cb[2]*m|0},${.35*m})`;c.lineWidth=1;
    c.beginPath();c.moveTo(sx-TW+2,sy);c.lineTo(sx,sy+TH-1);c.stroke();c.beginPath();c.moveTo(sx,sy-TH+1);c.lineTo(sx+TW-2,sy);c.stroke();}
  if(tile===1){if(gx%8===0&&gy%3===0){c.fillStyle=`rgba(150,140,50,${.14*m})`;c.fillRect(sx-.8,sy-.4,1.6,.8)}
    if(gy%8===0&&gx%3===0){c.fillStyle=`rgba(150,140,50,${.14*m})`;c.fillRect(sx-.4,sy-.3,.8,.6)}
    if(gx%8<2&&gy%8<2&&(gx+gy)%2===0){c.fillStyle=`rgba(200,200,180,${.1*m})`;for(let s=0;s<3;s++)c.fillRect(sx-TW*.35+s*TW*.35,sy-1.5+s,TW*.25,1.2)}}}

function drawBldg(c,b,cx,cy,sw,sh,dL,time){
  const dp=DPAL[b.di||0];const st=dp[b.pi%dp.length];
  const rt=iso(b.x+b.w,b.y,cx,cy,sw,sh),lt=iso(b.x,b.y+b.d,cx,cy,sw,sh);
  const fr=iso(b.x+b.w,b.y+b.d,cx,cy,sw,sh),bk=iso(b.x,b.y,cx,cy,sw,sh);
  if(fr.sx+220<0||bk.sx-220>sw||fr.sy-b.h-110>sh||bk.sy-b.h+110<0)return;
  const h=b.h,m=.6+dL*.4,n=1-dL;const sfC=DST[b.di||0];
  c.globalAlpha=.06;c.fillStyle="#000";c.beginPath();c.moveTo(fr.sx,fr.sy);c.lineTo(fr.sx+h*.08,fr.sy+h*.04);c.lineTo(lt.sx+h*.08,lt.sy+h*.04);c.lineTo(lt.sx,lt.sy);c.closePath();c.fill();c.globalAlpha=1;
  c.fillStyle=`rgb(${st.r[0]*m|0},${st.r[1]*m|0},${st.r[2]*m|0})`;c.beginPath();c.moveTo(rt.sx,rt.sy);c.lineTo(fr.sx,fr.sy);c.lineTo(fr.sx,fr.sy-h);c.lineTo(rt.sx,rt.sy-h);c.closePath();c.fill();
  c.fillStyle=`rgb(${st.l[0]*m|0},${st.l[1]*m|0},${st.l[2]*m|0})`;c.beginPath();c.moveTo(lt.sx,lt.sy);c.lineTo(fr.sx,fr.sy);c.lineTo(fr.sx,fr.sy-h);c.lineTo(lt.sx,lt.sy-h);c.closePath();c.fill();
  c.fillStyle=`rgb(${st.t[0]*m|0},${st.t[1]*m|0},${st.t[2]*m|0})`;c.beginPath();c.moveTo(bk.sx,bk.sy-h);c.lineTo(rt.sx,rt.sy-h);c.lineTo(fr.sx,fr.sy-h);c.lineTo(lt.sx,lt.sy-h);c.closePath();c.fill();
  if(b.re){const rc=b.rc;c.fillStyle=`rgb(${rc[0]*m|0},${rc[1]*m|0},${rc[2]*m|0})`;
    c.beginPath();c.moveTo(rt.sx,rt.sy-h);c.lineTo(fr.sx,fr.sy-h);c.lineTo(fr.sx,fr.sy-h-3);c.lineTo(rt.sx,rt.sy-h-3);c.closePath();c.fill();
    c.fillStyle=`rgb(${(rc[0]-8)*m|0},${(rc[1]-8)*m|0},${(rc[2]-8)*m|0})`;
    c.beginPath();c.moveTo(lt.sx,lt.sy-h);c.lineTo(fr.sx,fr.sy-h);c.lineTo(fr.sx,fr.sy-h-3);c.lineTo(lt.sx,lt.sy-h-3);c.closePath();c.fill();}
  if(b.hsb){const sh2=b.sbh;const ins=.2;
    const srt=iso(b.x+b.w*(1-ins),b.y+b.d*ins,cx,cy,sw,sh),slt=iso(b.x+b.w*ins,b.y+b.d*(1-ins),cx,cy,sw,sh);
    const sfr=iso(b.x+b.w*(1-ins),b.y+b.d*(1-ins),cx,cy,sw,sh);
    c.fillStyle=`rgb(${(st.r[0]+8)*m|0},${(st.r[1]+8)*m|0},${(st.r[2]+8)*m|0})`;
    c.beginPath();c.moveTo(srt.sx,srt.sy-sh2);c.lineTo(sfr.sx,sfr.sy-sh2);c.lineTo(sfr.sx,sfr.sy-h);c.lineTo(srt.sx,srt.sy-h);c.closePath();c.fill();
    c.fillStyle=`rgb(${(st.l[0]+5)*m|0},${(st.l[1]+5)*m|0},${(st.l[2]+5)*m|0})`;
    c.beginPath();c.moveTo(slt.sx,slt.sy-sh2);c.lineTo(sfr.sx,sfr.sy-sh2);c.lineTo(sfr.sx,sfr.sy-h);c.lineTo(slt.sx,slt.sy-h);c.closePath();c.fill();
    c.fillStyle=`rgb(${st.t[0]*m*.88|0},${st.t[1]*m*.88|0},${st.t[2]*m*.88|0})`;
    c.beginPath();c.moveTo(bk.sx,bk.sy-sh2);c.lineTo(rt.sx,rt.sy-sh2);c.lineTo(fr.sx,fr.sy-sh2);c.lineTo(lt.sx,lt.sy-sh2);c.closePath();c.fill();}
  c.strokeStyle=`rgba(0,0,0,${.18*m})`;c.lineWidth=.5;c.beginPath();c.moveTo(fr.sx,fr.sy);c.lineTo(fr.sx,fr.sy-h);c.stroke();
  if(b.sf){const sfH=Math.min(16,h*.11);
    c.fillStyle=`rgb(${sfC[0]*m|0},${sfC[1]*m|0},${sfC[2]*m|0})`;
    c.beginPath();c.moveTo(rt.sx,rt.sy);c.lineTo(fr.sx,fr.sy);c.lineTo(fr.sx,fr.sy-sfH);c.lineTo(rt.sx,rt.sy-sfH);c.closePath();c.fill();
    c.beginPath();c.moveTo(lt.sx,lt.sy);c.lineTo(fr.sx,fr.sy);c.lineTo(fr.sx,fr.sy-sfH);c.lineTo(lt.sx,lt.sy-sfH);c.closePath();c.fill();
    if(n>.2){const swx=rt.sx+(fr.sx-rt.sx)*.5;c.globalAlpha=n*.15;c.fillStyle="#ffc860";c.beginPath();c.arc(swx,fr.sy-sfH*.5,10,0,Math.PI*2);c.fill();c.globalAlpha=1}}
  if(b.aw){const awY=fr.sy-(b.sf?18:14);const ac=b.awc;
    c.fillStyle=`rgba(${ac[0]*m|0},${ac[1]*m|0},${ac[2]*m|0},${.45*m})`;
    const awL=rt.sx+(fr.sx-rt.sx)*.2,awR=rt.sx+(fr.sx-rt.sx)*.8;
    c.beginPath();c.moveTo(awL,awY);c.lineTo(awR,awY);c.lineTo(awR+3,awY+5);c.lineTo(awL+3,awY+5);c.closePath();c.fill();}
  const doorX=rt.sx+(fr.sx-rt.sx)*.5;c.fillStyle=`rgba(${(sfC[0]-12)*m|0},${(sfC[1]-12)*m|0},${(sfC[2]-12)*m|0},${.6*m})`;c.fillRect(doorX-3,fr.sy-9,6,9);
  const nL2=(h/65)|0;for(let i=1;i<=nL2;i++){const ly=h*i/(nL2+1);
    c.fillStyle=`rgba(80,80,80,${.05*m})`;c.beginPath();c.moveTo(rt.sx,rt.sy-ly);c.lineTo(fr.sx,fr.sy-ly);c.lineTo(fr.sx,fr.sy-ly+1.5);c.lineTo(rt.sx,rt.sy-ly+1.5);c.closePath();c.fill();}
  const nR=Math.max(2,(h/20)|0),startR=b.sf?1:0;
  for(let face=0;face<2;face++){const wf=rng(b.sd+(face?777:0)),sp=face?lt:rt,nc=(face?b.d:b.w)*2;
    for(let r=startR;r<nR;r++)for(let cc2=0;cc2<nc;cc2++){if(wf()<.3)continue;const tx=(cc2+.5)/nc,sy2=(r+.4)/nR;
      const wx=sp.sx+(fr.sx-sp.sx)*tx,wy=sp.sy+(fr.sy-sp.sy)*tx-h+h*sy2;
      if(b.hsb&&wy<fr.sy-b.sbh-5)continue;const lit=wf()<(dL>.5?.05:.4);
      if(lit){const wc=WLC[(wf()*WLC.length)|0];c.globalAlpha=n*.06;c.fillStyle=`rgb(${wc[0]},${wc[1]},${wc[2]})`;c.beginPath();c.arc(wx,wy+1,6,0,Math.PI*2);c.fill();
        c.globalAlpha=n>.4?.72:.26;c.fillStyle=`rgb(${wc[0]},${wc[1]},${wc[2]})`;c.fillRect(wx-2,wy-3,4,6);
      }else{c.globalAlpha=.35;c.fillStyle="rgba(6,6,14,.5)";c.fillRect(wx-2,wy-3,4,6)}}}
  c.globalAlpha=1;
  const tcx2=(bk.sx+fr.sx)/2,tcy2=(bk.sy+fr.sy)/2-h;
  if(b.ac){c.fillStyle=`rgba(85,85,95,${.28*m})`;c.fillRect(tcx2-4,tcy2-2,5,3)}
  if(b.tk){c.fillStyle=`rgba(60,55,45,${.28*m})`;c.beginPath();c.ellipse(tcx2+5,tcy2-2,3,2,0,0,Math.PI*2);c.fill()}
  if(b.sign&&n>.3){const sgX=rt.sx+(fr.sx-rt.sx)*.5,sgY=fr.sy-(b.sf?18:14);
    c.globalAlpha=n*.5;c.font="bold 5px monospace";c.textAlign="center";const tw2=c.measureText(b.sign).width+4;
    c.fillStyle="rgba(25,20,15,.85)";c.fillRect(sgX-tw2/2,sgY-3,tw2,7);c.fillStyle="#ddd";c.fillText(b.sign,sgX,sgY+2);
    c.globalAlpha=n*.05;c.fillStyle="#ffa";c.beginPath();c.arc(sgX,sgY,9,0,Math.PI*2);c.fill();c.globalAlpha=1}}

function drawTL(c,tl,cx,cy,sw,sh,dL,time){const p=iso(tl.x,tl.y,cx,cy,sw,sh);if(p.sx<-40||p.sx>sw+40)return;
  const n=1-dL;c.strokeStyle=`rgba(55,55,55,${.5+n*.3})`;c.lineWidth=1.4;c.beginPath();c.moveTo(p.sx,p.sy);c.lineTo(p.sx,p.sy-24);c.stroke();
  c.fillStyle="rgba(28,28,32,.7)";c.fillRect(p.sx-2.5,p.sy-30,5,9);
  const cycle=((time+tl.ph)*.3)%3|0;const colors=[[210,45,45],[210,170,45],[45,190,70]];
  for(let i=0;i<3;i++){const act=i===cycle;const cc=colors[i];
    c.fillStyle=act?`rgba(${cc[0]},${cc[1]},${cc[2]},${.75*(.7+n*.3)})`:"rgba(35,35,35,.35)";
    c.beginPath();c.arc(p.sx,p.sy-28+i*3,1.2,0,Math.PI*2);c.fill();
    if(act&&n>.3){c.globalAlpha=n*.05;c.fillStyle=`rgb(${cc[0]},${cc[1]},${cc[2]})`;c.beginPath();c.arc(p.sx,p.sy-28+i*3,7,0,Math.PI*2);c.fill();c.globalAlpha=1}}}

function drawVeh(c,v,cx,cy,sw,sh,dL){const p=iso(v.x,v.y,cx,cy,sw,sh);if(p.sx<-40||p.sx>sw+40)return;
  const n=1-dL;c.fillStyle="rgba(0,0,0,.1)";c.beginPath();c.ellipse(p.sx,p.sy+2,9,4,0,0,Math.PI*2);c.fill();
  c.fillStyle=v.col;c.beginPath();c.moveTo(p.sx,p.sy-5-TH*.3);c.lineTo(p.sx+8,p.sy-5);c.lineTo(p.sx,p.sy-5+TH*.3);c.lineTo(p.sx-8,p.sy-5);c.closePath();c.fill();
  const dr=v.col.replace(/#(..)(..)(..)/,(m2,r,g,b)=>`rgb(${parseInt(r,16)*.55|0},${parseInt(g,16)*.55|0},${parseInt(b,16)*.55|0})`);
  c.fillStyle=dr;c.beginPath();c.moveTo(p.sx+8,p.sy-5);c.lineTo(p.sx,p.sy-5+TH*.3);c.lineTo(p.sx,p.sy+TH*.3);c.lineTo(p.sx+8,p.sy);c.closePath();c.fill();
  c.fillStyle=v.col;c.globalAlpha=.75;c.beginPath();c.moveTo(p.sx-8,p.sy-5);c.lineTo(p.sx,p.sy-5+TH*.3);c.lineTo(p.sx,p.sy+TH*.3);c.lineTo(p.sx-8,p.sy);c.closePath();c.fill();c.globalAlpha=1;
  c.fillStyle=`rgba(70,90,120,${.3+n*.15})`;c.beginPath();c.moveTo(p.sx-2,p.sy-6);c.lineTo(p.sx+3,p.sy-4.5);c.lineTo(p.sx+2,p.sy-3);c.lineTo(p.sx-3,p.sy-4.5);c.closePath();c.fill();
  if(n>.3&&!v.pk){const dirs=[[1,0],[0,1],[-1,0],[0,-1]];const[hx,hy]=dirs[v.dir%4];
    c.globalAlpha=n*.1;c.fillStyle="#ffd866";c.beginPath();c.arc(p.sx+hx*10,p.sy+hy*5-3,6,0,Math.PI*2);c.fill();
    c.globalAlpha=n*.3;c.fillStyle="#ffe888";c.beginPath();c.arc(p.sx+hx*10,p.sy+hy*5-3,1,0,Math.PI*2);c.fill();
    c.globalAlpha=n*.25;c.fillStyle="#f33";c.beginPath();c.arc(p.sx-hx*9,p.sy-hy*4-3,.8,0,Math.PI*2);c.fill();c.globalAlpha=1}}

function drawLamp(c,l,cx,cy,sw,sh,dL){const p=iso(l.x,l.y,cx,cy,sw,sh);if(p.sx<-50||p.sx>sw+50)return;
  const n=1-dL;c.strokeStyle=`rgba(65,65,65,${.5+n*.3})`;c.lineWidth=1.4;c.beginPath();c.moveTo(p.sx,p.sy);c.lineTo(p.sx,p.sy-30);c.stroke();
  c.lineWidth=.7;c.beginPath();c.moveTo(p.sx,p.sy-28);c.lineTo(p.sx+4,p.sy-31);c.stroke();
  c.fillStyle=`rgba(255,200,120,${.25+n*.5})`;c.beginPath();c.arc(p.sx+4,p.sy-32,1.5,0,Math.PI*2);c.fill();
  if(n>.3){c.globalAlpha=n*.1;c.fillStyle="#ffb040";c.beginPath();c.arc(p.sx+2,p.sy+2,32,0,Math.PI*2);c.fill();
    c.globalAlpha=n*.05;c.beginPath();c.arc(p.sx+2,p.sy+2,16,0,Math.PI*2);c.fill();c.globalAlpha=1}}

function drawFig(c,sx,sy,time,mv,bc,lc,sc,glow,idle){
  if(!lc)lc="#282838";if(!sc)sc=1;
  if(idle==="lean"&&!mv){c.fillStyle="rgba(0,0,0,.1)";c.beginPath();c.ellipse(sx,sy+1,4,2,0,0,Math.PI*2);c.fill();
    c.fillStyle=bc;c.fillRect(sx-4,sy-21,8,13);c.fillStyle="#c8beb4";c.beginPath();c.arc(sx+1,sy-25,3.5,0,Math.PI*2);c.fill();
    c.strokeStyle=lc;c.lineWidth=1.6;c.beginPath();c.moveTo(sx-1,sy-8);c.lineTo(sx-2,sy-1);c.moveTo(sx+3,sy-8);c.lineTo(sx+4,sy-1);c.stroke();return}
  if(idle==="sit"&&!mv){c.fillStyle="rgba(0,0,0,.08)";c.beginPath();c.ellipse(sx,sy+1,4,2,0,0,Math.PI*2);c.fill();
    c.fillStyle=bc;c.fillRect(sx-5,sy-15,10,7);c.fillStyle="#c8beb4";c.beginPath();c.arc(sx,sy-19,3.5,0,Math.PI*2);c.fill();
    c.strokeStyle=lc;c.lineWidth=1.6;c.beginPath();c.moveTo(sx-3,sy-8);c.lineTo(sx-5,sy-2);c.moveTo(sx+3,sy-8);c.lineTo(sx+5,sy-2);c.stroke();return}
  const bob=mv?Math.abs(Math.sin(time*8))*2.5*sc:0;const leg=mv?Math.sin(time*10)*3*sc:0;const arm=mv?Math.sin(time*10+1)*2*sc:0;
  c.fillStyle="rgba(0,0,0,.14)";c.beginPath();c.ellipse(sx,sy+1,6,3,0,0,Math.PI*2);c.fill();
  c.strokeStyle=lc;c.lineWidth=2;c.beginPath();c.moveTo(sx-2,sy-9-bob);c.lineTo(sx-3-leg,sy-1);c.moveTo(sx+2,sy-9-bob);c.lineTo(sx+3+leg,sy-1);c.stroke();
  c.fillStyle=bc;c.fillRect(sx-5,sy-23-bob,10,14);
  c.strokeStyle=bc;c.lineWidth=1.8;c.beginPath();c.moveTo(sx-5,sy-21-bob);c.lineTo(sx-7-arm,sy-13-bob);c.moveTo(sx+5,sy-21-bob);c.lineTo(sx+7+arm,sy-13-bob);c.stroke();
  c.fillStyle="#c8beb4";c.beginPath();c.arc(sx,sy-27-bob,4,0,Math.PI*2);c.fill();
  c.fillStyle="#222028";c.beginPath();c.arc(sx,sy-28.5-bob,4,Math.PI,Math.PI*2);c.fill();
  if(glow){c.globalAlpha=.04;c.fillStyle="#a8b8cc";c.beginPath();c.arc(sx,sy-14,24,0,Math.PI*2);c.fill();c.globalAlpha=1}}

function drawTree(c,tx,ty,cx,cy,sw,sh,dL){const p=iso(tx+.5,ty+.5,cx,cy,sw,sh);if(p.sx<-20||p.sx>sw+20||p.sy<-45||p.sy>sh+20)return;
  const m=.65+dL*.35;c.fillStyle=`rgb(${46*m|0},${32*m|0},${18*m|0})`;c.fillRect(p.sx-1.5,p.sy-15,3,15);
  c.fillStyle=`rgb(${24*m|0},${46*m|0},${18*m|0})`;c.beginPath();c.arc(p.sx,p.sy-20,8,0,Math.PI*2);c.fill();
  c.fillStyle=`rgb(${30*m|0},${56*m|0},${24*m|0})`;c.beginPath();c.arc(p.sx-3,p.sy-17,5.5,0,Math.PI*2);c.fill();}

function drawPOI(c,poi,cx,cy,sw,sh,time,near){if(poi.tp==="npc")return;const p=iso(poi.x,poi.y,cx,cy,sw,sh);
  if(p.sx<-30||p.sx>sw+30)return;const pulse=near?.5+Math.sin(time*4)*.2:.08;const r=near?5:2;
  const co={door:[255,180,80],bench:[110,200,110],corner:[130,130,210],object:[255,210,90],clearing:[90,210,150],ruin:[190,170,130]}[poi.tp]||[170,170,170];
  if(near){c.globalAlpha=pulse*.15;c.strokeStyle=`rgb(${co[0]},${co[1]},${co[2]})`;c.lineWidth=1.5;
    c.beginPath();c.arc(p.sx,p.sy-2,10+Math.sin(time*3)*4,0,Math.PI*2);c.stroke();
    c.globalAlpha=pulse*.2;c.fillStyle=`rgb(${co[0]},${co[1]},${co[2]})`;c.beginPath();c.arc(p.sx,p.sy-2,12,0,Math.PI*2);c.fill();c.globalAlpha=1}
  c.fillStyle=`rgba(${co[0]},${co[1]},${co[2]},${pulse})`;c.beginPath();c.arc(p.sx,p.sy-2,r,0,Math.PI*2);c.fill();}

function drawMM(c,G,w,sw,sh){const sz=42,mx=5,my=5,rg=20,sc=sz/rg;
  c.globalAlpha=.3;c.fillStyle="rgba(8,8,16,.82)";c.fillRect(mx,my,sz,sz);
  for(let dy=-rg/2;dy<rg/2;dy+=2)for(let dx=-rg/2;dx<rg/2;dx+=2){
    const t=w.tile((G.px+dx)|0,(G.py+dy)|0);
    c.fillStyle=t===1?"rgba(50,50,78,.6)":t===3?"rgba(52,48,58,.7)":t===4?"rgba(32,58,28,.5)":t===8?"rgba(28,42,88,.6)":"rgba(38,38,52,.3)";
    c.fillRect(mx+(dx+rg/2)*sc,my+(dy+rg/2)*sc,sc*2,sc*2);}
  c.fillStyle="#fff";c.beginPath();c.arc(mx+sz/2,my+sz/2,1.5,0,Math.PI*2);c.fill();c.globalAlpha=1}

function drawInt(c,sw,sh,desc,time,fade){const a=Math.min(1,fade);c.fillStyle=`rgba(6,6,12,${a*.95})`;c.fillRect(0,0,sw,sh);
  const rx=sw*.07,ry=sh*.12,rw=sw*.86,rh=sh*.55;c.fillStyle=`rgba(20,18,26,${a})`;c.fillRect(rx,ry,rw,rh*.55);
  c.fillStyle=`rgba(40,36,30,${a})`;c.fillRect(rx,ry+rh*.55,rw,rh*.45);
  if(desc){c.globalAlpha=a*.88;c.fillStyle="#c8c0b4";c.font="14px 'Courier New',monospace";c.textAlign="center";
    const words=desc.split(" ");let line="",ly=ry+30;
    for(const w of words){const t2=line+w+" ";if(c.measureText(t2).width>rw-30){c.fillText(line,sw/2,ly);ly+=19;line=w+" "}else line=t2}
    c.fillText(line,sw/2,ly);c.globalAlpha=1}}

function genStars(){const r=rng(777),s=[];for(let i=0;i<55;i++)s.push({x:r(),y:r()*.5,b:.3+r()*.7,sz:.5+r(),sp:.5+r()*2});return s}

class Aud{constructor(){this.ok=false;this.sT=0}
  init(){if(this.ok)return;try{this.ac=new(window.AudioContext||window.webkitAudioContext)();this.m=this.ac.createGain();this.m.gain.value=.15;this.m.connect(this.ac.destination);
    const o=this.ac.createOscillator(),g=this.ac.createGain(),f=this.ac.createBiquadFilter();o.type="sine";o.frequency.value=72;f.type="lowpass";f.frequency.value=125;g.gain.value=.016;
    o.connect(f);f.connect(g);g.connect(this.m);o.start();this.ok=true}catch(e){}}
  step(mv,dt){if(!this.ok||!mv)return;this.sT+=dt;if(this.sT>.26){this.sT=0;const o=this.ac.createOscillator(),g=this.ac.createGain();o.type="triangle";o.frequency.value=115+Math.random()*50;
    g.gain.value=.01;g.gain.exponentialRampToValueAtTime(.001,this.ac.currentTime+.05);o.connect(g);g.connect(this.m);o.start();o.stop(this.ac.currentTime+.06)}}
  ping(){if(!this.ok)return;const o=this.ac.createOscillator(),g=this.ac.createGain();o.type="sine";o.frequency.value=420;o.frequency.exponentialRampToValueAtTime(210,this.ac.currentTime+.14);
    g.gain.value=.013;g.gain.exponentialRampToValueAtTime(.001,this.ac.currentTime+.16);o.connect(g);g.connect(this.m);o.start();o.stop(this.ac.currentTime+.18)}}

class Joy{constructor(){this.on=false;this.cx=0;this.cy=0;this.dx=0;this.dy=0;this.id=null;this.R=48;this.mg=0}
  start(x,y,id){this.on=true;this.cx=x;this.cy=y;this.id=id;this.dx=0;this.dy=0;this.mg=0}
  move(x,y){let d=x-this.cx,e=y-this.cy;const l=Math.sqrt(d*d+e*e);this.mg=Math.min(l/this.R,1);
    if(l>this.R){d=d/l*this.R;e=e/l*this.R}this.dx=d/this.R;this.dy=e/this.R}
  end(){this.on=false;this.dx=0;this.dy=0;this.id=null;this.mg=0}
  draw(c){if(!this.on)return;c.globalAlpha=.07;c.fillStyle="#999";c.beginPath();c.arc(this.cx,this.cy,this.R,0,Math.PI*2);c.fill();
    c.globalAlpha=.2;c.fillStyle=this.mg>.85?"#ffd866":"#bbb";c.beginPath();
    c.arc(this.cx+this.dx*this.R,this.cy+this.dy*this.R,14,0,Math.PI*2);c.fill();c.globalAlpha=1}}

// ═══ GAME ═══
function init(){
  const cv=document.getElementById("C"),ctx=cv.getContext("2d");
  const joy=new Joy(),world=new World(),audio=new Aud(),stars=genStars();
  let saving=0,shT=0;

  const G={px:CS/2+.5,py:CS/2+1.5,camX:0,camY:0,time:0,fadeIn:0,keys:{},
    prof:{exploration:0,confrontation:0,social:0,construction:0,meaning:0},
    nLog:[],rules:[],seeds:[],npcs:[],objs:[],ni:0,dw:0,pt:0,tv:new Set(),
    nearPoi:null,busy:false,narr:null,bubs:[],
    lastIT:-10,lastMT:0,idleT:false,explT:0,fm:false,ft:false,
    mood:"neutral",wth:"clear",dayT:.08,intr:null,intF:0,intD:null,
    inv:[],nc:{},arcs:[],lpi:null,btnT:null};

  const sv=ldG();if(sv){Object.assign(G,{...sv,tv:sv.tv||new Set(),fadeIn:0,keys:{},busy:false,narr:null,bubs:[],nearPoi:null,
    fm:true,ft:true,intF:0,intr:null,intD:null,inv:sv.inv||[],nc:sv.nc||{},arcs:sv.arcs||[],
    camX:(sv.px-sv.py)*TW,camY:(sv.px+sv.py)*TH})}

  function resize(){const d=Math.min(window.devicePixelRatio||1,1.5);cv.width=cv.clientWidth*d;cv.height=cv.clientHeight*d;ctx.setTransform(d,0,0,d,0,0)}
  resize();window.addEventListener("resize",resize);
  window.addEventListener("keydown",e=>{G.keys[e.key.toLowerCase()]=true;if(" eE".includes(e.key)||e.key==="Enter"){act();e.preventDefault()}if(e.key==="Escape"&&G.intr)G.intr=null});
  window.addEventListener("keyup",e=>{G.keys[e.key.toLowerCase()]=false});
  function bH(x,y){return(x-(cv.clientWidth-50))**2+(y-(cv.clientHeight-55))**2<35*35}
  cv.addEventListener("touchstart",e=>{e.preventDefault();audio.init();for(const t of e.changedTouches){
    if(bH(t.clientX,t.clientY)){act();G.btnT=t.identifier}
    else if(G.narr&&t.clientY>cv.clientHeight-160){if(!G.narr.done){G.narr.ci=G.narr.text.length;G.narr.done=true;G.narr.fs=G.time}else G.narr=null}
    else joy.start(t.clientX,t.clientY,t.identifier)}},{passive:false});
  cv.addEventListener("touchmove",e=>{e.preventDefault();for(const t of e.changedTouches)if(t.identifier===joy.id)joy.move(t.clientX,t.clientY)},{passive:false});
  cv.addEventListener("touchend",e=>{for(const t of e.changedTouches){if(t.identifier===joy.id)joy.end();if(t.identifier===G.btnT)G.btnT=null}});
  cv.addEventListener("touchcancel",e=>{for(const t of e.changedTouches)if(t.identifier===joy.id)joy.end()});

  async function act(){
    audio.init();if(G.busy||G.time-G.lastIT<1.5)return;G.lastIT=G.time;shT=G.time;
    if(G.intr){G.intr=null;G.intD=null;return}
    G.busy=true;G.ni++;audio.ping();
    const p=G.nearPoi;let a,nh=null;const same=p?.id===G.lpi;G.lpi=p?.id||null;
    if(p){if(p.tp==="npc"){const npc=G.npcs.find(n=>n.id===p.id);
      a=same?`Le joueur interagit encore avec ${npc?.desc||"cette personne"}.`:`Le joueur s'approche de ${npc?.desc||"quelqu'un"}. ${npc?.idle||""}`;
      if(G.nc[p.id]?.length)nh=G.nc[p.id].slice(-6).join("\n");
    }else if(p.tp==="object"){const obj=G.objs.find(o=>o.id===p.id);
      if(obj?.pickable){G.inv.push({desc:obj.desc,glyph:obj.glyph||"?",id:obj.id});G.objs=G.objs.filter(o=>o.id!==p.id);
        for(const ch of world.vis(G.px,G.py))ch.poi=ch.poi.filter(pp=>pp.id!==p.id);showN(`Ramassé: ${obj.desc}`);G.busy=false;sav(G);return}
      a=`Le joueur examine: ${p.desc||"un objet"}`}
    else a={door:"Le joueur essaie d'ouvrir une porte.",bench:"Le joueur s'assoit.",corner:"Le joueur observe.",
      clearing:"Espace dégagé.",ruin:"Pierres anciennes."}[p.tp]||"Interaction."}
    else a="Le joueur regarde autour de lui.";
    const r=await callD(a,G,nh);if(r){apply(r,p);
      if(p?.tp==="npc"){if(!G.nc[p.id])G.nc[p.id]=[];if(r.narrative)G.nc[p.id].push(`[j]${r.narrative}`);
        if(r.bubble)for(const[id,txt]of Object.entries(r.bubble)){if(!G.nc[id])G.nc[id]=[];G.nc[id].push(`[p]${txt}`)}}}
    else if(!ND)showN("...");G.busy=false}

  async function autoT(tp){if(G.busy||ND)return;G.busy=true;G.ni++;
    const r=await callD({first_move:"La silhouette fait ses premiers pas.",idle:"Immobile.",explore:`Marche. ${G.dw|0} pas.`}[tp]||"Immobile.",G,null);
    if(r)apply(r);G.busy=false}

  function apply(r,poi){
    if(r.narrative){showN(r.narrative);G.nLog.push(r.narrative)}
    if(r.interior&&poi?.tp==="door"){G.intr=poi.id;G.intD=r.interior;G.intF=0}
    if(r.bubble&&typeof r.bubble==="object")for(const[id,txt]of Object.entries(r.bubble))G.bubs.push({nid:id,text:String(txt),st:G.time});
    if(r.npcs_spawn)for(const n of r.npcs_spawn){const id=`n${Date.now().toString(36)}${Math.random().toString(36).slice(2,5)}`;
      let nx=Math.round(G.px+(n.dx!=null?n.dx:(Math.random()-.5)*5)),ny=Math.round(G.py+(n.dy!=null?n.dy:(Math.random()-.5)*5));
      for(let i=0;i<8;i++){if([1,2,4,7].includes(world.tile(nx,ny)))break;nx=Math.round(G.px+(Math.random()-.5)*6);ny=Math.round(G.py+(Math.random()-.5)*6)}
      G.npcs.push({...n,x:nx+.5,y:ny+.5,id,color:NB[HH(nx,ny)%NB.length],wt:0,wx:0,wy:0});
      world.gc(Math.floor(nx/CH),Math.floor(ny/CH)).poi.push({tp:"npc",x:nx+.5,y:ny+.5,id,desc:n.desc,idle:n.idle})}
    if(r.npcs_remove)G.npcs=G.npcs.filter(n=>!r.npcs_remove.includes(n.id));
    if(r.objects_spawn)for(const o of r.objects_spawn){const id=`o${Date.now().toString(36)}`;let ox=Math.round(G.px+(o.dx||0)),oy=Math.round(G.py+(o.dy||0));
      G.objs.push({...o,x:ox+.5,y:oy+.5,id,pickable:!!o.pickable});
      world.gc(Math.floor(ox/CH),Math.floor(oy/CH)).poi.push({tp:"object",x:ox+.5,y:oy+.5,id,desc:o.desc})}
    if(r.profile_delta)for(const k of Object.keys(G.prof))if(r.profile_delta[k])G.prof[k]=cl(G.prof[k]+(r.profile_delta[k]||0),-1,1);
    if(r.rulebook_new)for(const ru of r.rulebook_new)if(ru&&!G.rules.includes(ru))G.rules.push(ru);
    if(r.seeds)for(const s of r.seeds)if(s)G.seeds.push(s);
    if(r.world_mood&&r.world_mood!=="null")G.mood=r.world_mood;
    if(r.weather&&r.weather!=="null")G.wth=r.weather;
    if(r.arc&&r.arc!=="null"&&!G.arcs.includes(r.arc))G.arcs.push(r.arc);
    if(poi)poi.used=true;saving=G.time;sav(G)}

  function showN(t){G.narr={text:t,ci:0,st:G.time,done:false,fs:0}}

  let lastT=performance.now(),savT=0;

  function loop(now){
    const dt=Math.min((now-lastT)/16.67,3);lastT=now;
    G.time+=dt*.016;G.pt+=dt*.016;G.fadeIn=Math.min(1,G.fadeIn+.006*dt);
    G.dayT=(G.dayT+dt*.00007)%1;
    const dL=Math.max(0,Math.sin(G.dayT*Math.PI*2-Math.PI/2)*.5+.5);
    const sw=cv.clientWidth,sh=cv.clientHeight;
    const sR=lp(5,46,dL),sG=lp(5,60,dL),sB=lp(14,86,dL);
    const shAmt=Math.max(0,1-(G.time-shT)*4)*3;
    const shX=Math.sin(G.time*40)*shAmt,shY=Math.cos(G.time*35)*shAmt;

    if(!G.intr){
      let dx=0,dy=0;
      if(G.keys["w"]||G.keys["arrowup"]){dx--;dy--}if(G.keys["s"]||G.keys["arrowdown"]){dx++;dy++}
      if(G.keys["a"]||G.keys["arrowleft"]){dx--;dy++}if(G.keys["d"]||G.keys["arrowright"]){dx++;dy--}
      if(joy.on&&(Math.abs(joy.dx)>.15||Math.abs(joy.dy)>.15)){dx+=(joy.dx+joy.dy)*.7;dy+=(-joy.dx+joy.dy)*.7}
      const mv=dx!==0||dy!==0;const spd=G.keys["shift"]||joy.mg>.85?SPRNT:SPD;
      if(mv){if(!G.fm){G.fm=true;audio.init()}
        const ln=Math.sqrt(dx*dx+dy*dy),mx=dx/ln*spd*dt,my=dy/ln*spd*dt;
        const tile=world.tile(Math.floor(G.px+mx),Math.floor(G.py+my));
        if(tile!==3&&tile!==8){G.px+=mx;G.py+=my}else{
          if(world.tile(Math.floor(G.px+mx),Math.floor(G.py))!==3&&world.tile(Math.floor(G.px+mx),Math.floor(G.py))!==8)G.px+=mx;
          if(world.tile(Math.floor(G.px),Math.floor(G.py+my))!==3&&world.tile(Math.floor(G.px),Math.floor(G.py+my))!==8)G.py+=my}
        G.dw+=spd*dt;G.tv.add(`${G.px|0},${G.py|0}`);G.lastMT=G.time;G.idleT=false;audio.step(true,dt*.016)}
      if(G.fm&&!G.ft&&G.dw>1.5){G.ft=true;autoT("first_move")}
      if(!mv&&G.time-G.lastMT>35&&!G.idleT&&G.ni>0){G.idleT=true;autoT("idle")}
      if(mv&&G.dw-G.explT>45&&G.ni>=1){G.explT=G.dw;if(Math.random()<.1)autoT("explore")}

      for(const n of G.npcs){n.wt=(n.wt||0)+dt*.016;if(n.wt>3+Math.random()*5){n.wt=0;n.wx=(Math.random()-.5)*.008;n.wy=(Math.random()-.5)*.008}
        const nt=world.tile(Math.floor(n.x+(n.wx||0)),Math.floor(n.y+(n.wy||0)));if(nt!==3&&nt!==8){n.x+=(n.wx||0)*dt;n.y+=(n.wy||0)*dt}
        for(const ch of world.vis(G.px,G.py))for(const p of ch.poi)if(p.id===n.id){p.x=n.x;p.y=n.y}}

      const bX=Math.sin(G.time*.3)*.6+shX,bY=Math.cos(G.time*.25)*.4+shY;
      G.camX+=((G.px-G.py)*TW+bX-G.camX)*CLERP*dt;G.camY+=((G.px+G.py)*TH+bY-G.camY)*CLERP*dt;
      G.nearPoi=null;let nd=IR;for(const ch of world.vis(G.px,G.py))for(const p of ch.poi){const d=Math.sqrt((p.x-G.px)**2+(p.y-G.py)**2);if(d<nd){nd=d;G.nearPoi=p}}

      // ── RENDER ──
      ctx.fillStyle=`rgb(${sR|0},${sG|0},${sB|0})`;ctx.fillRect(0,0,sw,sh);
      if(dL<.4){const sa=(.4-dL)*2.5;
        for(const s of stars){ctx.globalAlpha=sa*s.b*(.5+Math.sin(G.time*s.sp)*.5)*.35;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(s.x*sw,s.y*sh,s.sz,0,Math.PI*2);ctx.fill()}
        ctx.globalAlpha=sa*.4;ctx.fillStyle="#e8e4d8";ctx.beginPath();ctx.arc(sw*.78,sh*.08,8,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=`rgb(${sR|0},${sG|0},${sB|0})`;ctx.beginPath();ctx.arc(sw*.78+3,sh*.08-1,6.5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}

      const vis=world.vis(G.px,G.py);const allT=[];
      for(const ch of vis){const ox=ch.cx*CH,oy=ch.cy*CH;
        for(let ly=0;ly<CH;ly++)for(let lx=0;lx<CH;lx++){const gx=ox+lx,gy=oy+ly,p=iso(gx+.5,gy+.5,G.camX,G.camY,sw,sh);
          if(p.sx<-TW*2||p.sx>sw+TW*2||p.sy<-TH*2||p.sy>sh+TH*2)continue;
          allT.push({gx,gy,sx:p.sx,sy:p.sy,t:ch.t[ly]?ch.t[ly][lx]:0})}}
      allT.sort((a,b)=>(a.gx+a.gy)-(b.gx+b.gy));for(const t of allT)drawGnd(ctx,t.sx,t.sy,t.t,dL,t.gx,t.gy,G.time);
      for(const ch of vis)for(const p of ch.poi)drawPOI(ctx,p,G.camX,G.camY,sw,sh,G.time,p===G.nearPoi);

      const ents=[];
      for(const ch of vis){for(const b of ch.bl)ents.push({t:0,d:b.x+b.w+b.y+b.d,data:b});
        for(const tr of ch.trees)ents.push({t:1,d:tr.x+tr.y+1.5,data:tr});
        for(const pr of ch.props)ents.push({t:5,d:pr.x+pr.y+.5,data:pr});
        for(const an of ch.ambN)ents.push({t:6,d:an.x+an.y+.5,data:an});
        for(const v of ch.vehs)ents.push({t:7,d:v.x+v.y+.5,data:v});
        for(const tl of ch.tLights)ents.push({t:8,d:tl.x+tl.y+.5,data:tl})}
      ents.push({t:2,d:G.px+G.py+.5});
      for(const n of G.npcs)ents.push({t:3,d:n.x+n.y+.5,data:n});
      for(const o of G.objs)ents.push({t:4,d:o.x+o.y+.5,data:o});
      ents.sort((a,b)=>a.d-b.d);

      for(const e of ents){
        if(e.t===0)drawBldg(ctx,e.data,G.camX,G.camY,sw,sh,dL,G.time);
        else if(e.t===1)drawTree(ctx,e.data.x,e.data.y,G.camX,G.camY,sw,sh,dL);
        else if(e.t===2){const p=iso(G.px,G.py,G.camX,G.camY,sw,sh);drawFig(ctx,p.sx,p.sy,G.time,mv,"#343640","#222230",1,true)}
        else if(e.t===3){const p=iso(e.data.x,e.data.y,G.camX,G.camY,sw,sh);
          if(p.sx>-40&&p.sx<sw+40)drawFig(ctx,p.sx,p.sy,G.time,Math.abs(e.data.wx||0)>.004,e.data.color||"#5a5a7e","#282838",.3)}
        else if(e.t===4){const p=iso(e.data.x,e.data.y,G.camX,G.camY,sw,sh);
          if(p.sx>-20&&p.sx<sw+20){if(G.objs.find(o=>o.id===e.data.id)?.pickable)ctx.globalAlpha=.4+Math.sin(G.time*3)*.15;
            ctx.font="13px serif";ctx.textAlign="center";ctx.fillText(e.data.glyph||"?",p.sx,p.sy-4);ctx.globalAlpha=1}}
        else if(e.t===5){const pr=e.data,p=iso(pr.x,pr.y,G.camX,G.camY,sw,sh);
          if(p.sx<-25||p.sx>sw+25)continue;const m2=.6+dL*.4;
          if(pr.tp==="tc"){ctx.fillStyle=`rgb(${48*m2|0},${48*m2|0},${52*m2|0})`;ctx.fillRect(p.sx-3,p.sy-9,6,9)}
          else if(pr.tp==="hy"){ctx.fillStyle=`rgb(${145*m2|0},${36*m2|0},${30*m2|0})`;ctx.fillRect(p.sx-2,p.sy-8,4,8)}
          else if(pr.tp==="tr"){ctx.fillStyle=`rgba(52,48,38,${.4*m2})`;ctx.fillRect(p.sx-2,p.sy-2,3,2)}
          else if(pr.tp==="pu"){ctx.fillStyle=`rgba(32,42,68,${.1+(1-dL)*.05})`;ctx.beginPath();ctx.ellipse(p.sx,p.sy,6,3,0,0,Math.PI*2);ctx.fill()}
          else if(pr.tp==="dm"){ctx.fillStyle=`rgb(${38*m2|0},${52*m2|0},${32*m2|0})`;ctx.fillRect(p.sx-5,p.sy-8,10,8);
            ctx.fillStyle=`rgb(${32*m2|0},${45*m2|0},${28*m2|0})`;ctx.fillRect(p.sx-6,p.sy-9,12,2)}}
        else if(e.t===6){const an=e.data;
          if(an.idle==="walk"){const dirs=[[.01,0],[0,.01],[-.01,0],[0,-.01]];const[ddx,ddy]=dirs[an.dir%4];
            const nx=an.x+ddx*an.spd*dt,ny=an.y+ddy*an.spd*dt;
            if([1,2].includes(world.tile(Math.floor(nx),Math.floor(ny)))){an.x=nx;an.y=ny}else an.dir=(an.dir+1+(Math.random()*2|0))%4}
          const p=iso(an.x,an.y,G.camX,G.camY,sw,sh);
          if(p.sx>-25&&p.sx<sw+25)drawFig(ctx,p.sx,p.sy,G.time+an.ph,an.idle==="walk",an.bc,an.lc,.22,false,an.idle)}
        else if(e.t===7){const v=e.data;if(!v.pk){const dirs=[[.01,0],[0,.01],[-.01,0],[0,-.01]];const[vdx,vdy]=dirs[v.dir%4];
          const nvx=v.x+vdx*v.spd*dt,nvy=v.y+vdy*v.spd*dt;
          if(world.tile(Math.floor(nvx),Math.floor(nvy))===1){v.x=nvx;v.y=nvy}else v.dir=(v.dir+1+(Math.random()*2|0))%4}
          drawVeh(ctx,v,G.camX,G.camY,sw,sh,dL)}
        else if(e.t===8)drawTL(ctx,e.data,G.camX,G.camY,sw,sh,dL,G.time)}

      for(const ch of vis)for(const l of ch.lamps)drawLamp(ctx,l,G.camX,G.camY,sw,sh,dL);

      ctx.globalAlpha=.15-dL*.05;ctx.fillStyle=`rgb(${sR|0},${sG|0},${sB|0})`;
      ctx.fillRect(0,0,sw,sh*.1);ctx.fillRect(0,sh*.9,sw,sh*.1);ctx.fillRect(0,0,sw*.06,sh);ctx.fillRect(sw*.94,0,sw*.06,sh);ctx.globalAlpha=1;

      G.bubs=G.bubs.filter(b=>G.time-b.st<6);
      for(const b of G.bubs){const npc=G.npcs.find(n=>n.id===b.nid);if(!npc)continue;
        const p=iso(npc.x,npc.y,G.camX,G.camY,sw,sh);const a=G.time-b.st>4?Math.max(0,1-(G.time-b.st-4)/2):Math.min(1,(G.time-b.st)*2);
        ctx.globalAlpha=a*.85;ctx.font="11px 'Courier New',monospace";const tw=ctx.measureText(b.text).width+12;
        ctx.fillStyle="rgba(10,10,18,.88)";ctx.fillRect(p.sx-tw/2,p.sy-52,tw,22);
        ctx.fillStyle="#d0ccc4";ctx.textAlign="center";ctx.fillText(b.text,p.sx,p.sy-37);ctx.globalAlpha=1}

      if(G.wth==="rain"||G.wth==="drizzle"){const int=G.wth==="rain"?.6:.25;
        ctx.strokeStyle=`rgba(140,160,180,${.04*int})`;ctx.lineWidth=.5;
        for(let i=0;i<18;i++){const rx=Math.random()*sw,ry=Math.random()*sh;ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(rx-1,ry+5*int);ctx.stroke()}}
    }else{G.intF=Math.min(1,G.intF+dt*.03);drawInt(ctx,sw,sh,G.intD,G.time,G.intF)}

    // UI
    if(G.inv.length&&!G.intr){ctx.globalAlpha=.45;ctx.font="12px serif";ctx.textAlign="left";
      for(let i=0;i<Math.min(G.inv.length,6);i++)ctx.fillText(G.inv[i].glyph||"·",55+i*16,18);ctx.globalAlpha=1}
    if(!G.intr)drawMM(ctx,G,world,sw,sh);

    const bx=sw-50,by=sh-55;
    if(!G.intr){const hasN=!!G.nearPoi;const pulse=hasN?.55+Math.sin(G.time*3)*.18:.12;
      ctx.globalAlpha=pulse*.5;ctx.fillStyle=hasN?"#ffd866":"#555";ctx.beginPath();ctx.arc(bx,by,hasN?26:22,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=hasN?.55:.2;ctx.strokeStyle=hasN?"#ffcc44":"#666";ctx.lineWidth=2;ctx.beginPath();ctx.arc(bx,by,hasN?26:22,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=hasN?.85:.35;ctx.fillStyle=hasN?"#1a1a24":"#999";ctx.font=`bold ${hasN?18:16}px monospace`;ctx.textAlign="center";
      ctx.fillText(hasN?"?":"·",bx,by+6);if(hasN){ctx.globalAlpha=.35;ctx.fillStyle="#ffd866";ctx.font="8px monospace";ctx.fillText("toucher",bx,by+38)}ctx.globalAlpha=1;
    }else{ctx.globalAlpha=.4;ctx.fillStyle="#aaa";ctx.beginPath();ctx.arc(bx,by,22,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=.8;ctx.fillStyle="#1a1a24";ctx.font="bold 16px monospace";ctx.textAlign="center";ctx.fillText("↓",bx,by+6);ctx.globalAlpha=1}

    if(G.busy){ctx.globalAlpha=.2;ctx.fillStyle="#888";ctx.font="13px monospace";ctx.textAlign="center";
      ctx.fillText("·".repeat(1+(G.time*2|0)%4),sw/2,G.intr?sh/2+55:sh-95);ctx.globalAlpha=1}

    if(G.narr){const n=G.narr,el=G.time-n.st;
      if(!n.done){n.ci=Math.min(n.text.length,(el*16)|0);if(n.ci>=n.text.length){n.done=true;n.fs=G.time}}
      let a=1;if(n.done){const s=G.time-n.fs;if(s>8)a=Math.max(0,1-(s-8)/3);if(a<=0)G.narr=null}
      if(a>0&&G.narr){const barH=Math.min(58,sh*.1),barY=G.intr?sh*.68:sh-barH-90;
        ctx.globalAlpha=a*.72;ctx.fillStyle="#000";ctx.fillRect(0,barY-4,sw,barH+12);
        ctx.globalAlpha=a*.9;ctx.fillStyle="#d0ccc4";ctx.font="13px 'Courier New',monospace";ctx.textAlign="left";
        const mxW=sw-34,disp=G.narr.text.substring(0,G.narr.ci),words=disp.split(" ");let line="",ly=barY+12;
        for(const w of words){const t2=line+w+" ";if(ctx.measureText(t2).width>mxW){ctx.fillText(line,16,ly);ly+=17;line=w+" "}else line=t2}
        ctx.fillText(line,16,ly);
        if(!G.narr.done&&Math.sin(G.time*6)>0){ctx.fillStyle="#ffd866";ctx.fillRect(16+ctx.measureText(line).width+2,ly-10,1.5,12)}
        if(G.narr.done){ctx.globalAlpha=a*.18;ctx.font="8px monospace";ctx.textAlign="right";ctx.fillText("tap",sw-16,barY+barH)}ctx.globalAlpha=1}}

    if(G.time-saving<1.5){ctx.globalAlpha=(1-(G.time-saving)/1.5)*.18;ctx.fillStyle="#888";ctx.font="7px monospace";ctx.textAlign="right";ctx.fillText("✓",sw-8,sh-4);ctx.globalAlpha=1}
    if(G.fadeIn<1){ctx.fillStyle=`rgba(0,0,0,${1-G.fadeIn})`;ctx.fillRect(0,0,sw,sh)}
    if(!G.intr)joy.draw(ctx);
    savT+=dt*.016;if(savT>90){savT=0;saving=G.time;sav(G)}
    requestAnimationFrame(loop)}
  requestAnimationFrame(loop)}
