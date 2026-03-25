// ═══ TABULA RASA — renderer.js ═══
import { TW, TH, DR, DS, DC, DPAL, DST, WLC, DAW } from './config.js';
import { iso, H, rng, gDist } from './utils.js';

// ── GROUND ──
export function drawGnd(c,sx,sy,tile,dL,gx,gy,time){
  const di=gDist(gx,gy);const m=.65+dL*.35;
  let co=tile===1?DR[di]:tile===2?DS[di]:tile===3?[20,20,32]:tile===4?[22,36,20]:tile===7?[40,34,26]:tile===8?[16,26,48]:tile===9?[28,33,23]:[18,18,28];
  c.fillStyle=`rgb(${co[0]*m|0},${co[1]*m|0},${co[2]*m|0})`;
  c.beginPath();c.moveTo(sx,sy-TH);c.lineTo(sx+TW,sy);c.lineTo(sx,sy+TH);c.lineTo(sx-TW,sy);c.closePath();c.fill();
  // Ground noise
  const noise=H(gx*3,gy*7)%5-2;
  if(tile<=2){c.fillStyle=`rgba(${noise>0?255:0},${noise>0?255:0},${noise>0?255:0},.02)`;
    c.beginPath();c.moveTo(sx,sy-TH);c.lineTo(sx+TW,sy);c.lineTo(sx,sy+TH);c.lineTo(sx-TW,sy);c.closePath();c.fill();}
  // Water shimmer
  if(tile===8){c.fillStyle=`rgba(40,60,100,${.06+Math.sin(time*2+gx*.7+gy*.5)*.03})`;
    c.beginPath();c.moveTo(sx,sy-TH);c.lineTo(sx+TW,sy);c.lineTo(sx,sy+TH);c.lineTo(sx-TW,sy);c.closePath();c.fill();}
  // Curb
  if(tile===2){const cb=DC[di];c.strokeStyle=`rgba(${cb[0]*m|0},${cb[1]*m|0},${cb[2]*m|0},${.35*m})`;c.lineWidth=1;
    c.beginPath();c.moveTo(sx-TW+2,sy);c.lineTo(sx,sy+TH-1);c.stroke();
    c.beginPath();c.moveTo(sx,sy-TH+1);c.lineTo(sx+TW-2,sy);c.stroke();}
  // Lane markings
  if(tile===1){
    if(gx%8===0&&gy%3===0){c.fillStyle=`rgba(150,140,50,${.14*m})`;c.fillRect(sx-.8,sy-.4,1.6,.8)}
    if(gy%8===0&&gx%3===0){c.fillStyle=`rgba(150,140,50,${.14*m})`;c.fillRect(sx-.4,sy-.3,.8,.6)}
    if(gx%8<2&&gy%8<2&&(gx+gy)%2===0){c.fillStyle=`rgba(200,200,180,${.1*m})`;
      for(let s=0;s<3;s++)c.fillRect(sx-TW*.35+s*TW*.35,sy-1.5+s,TW*.25,1.2)}
  }
}

// ── BUILDING ──
export function drawBldg(c,b,cx,cy,sw,sh,dL,time){
  const dp=DPAL[b.di||0];const st=dp[b.pi%dp.length];
  const rt=iso(b.x+b.w,b.y,cx,cy,sw,sh),lt=iso(b.x,b.y+b.d,cx,cy,sw,sh);
  const fr=iso(b.x+b.w,b.y+b.d,cx,cy,sw,sh),bk=iso(b.x,b.y,cx,cy,sw,sh);
  if(fr.sx+220<0||bk.sx-220>sw||fr.sy-b.h-110>sh||bk.sy-b.h+110<0)return;
  const h=b.h,m=.6+dL*.4,n=1-dL;const sfC=DST[b.di||0];

  // Shadow
  c.globalAlpha=.06;c.fillStyle="#000";c.beginPath();c.moveTo(fr.sx,fr.sy);c.lineTo(fr.sx+h*.08,fr.sy+h*.04);c.lineTo(lt.sx+h*.08,lt.sy+h*.04);c.lineTo(lt.sx,lt.sy);c.closePath();c.fill();c.globalAlpha=1;
  // Right face
  c.fillStyle=`rgb(${st.r[0]*m|0},${st.r[1]*m|0},${st.r[2]*m|0})`;c.beginPath();c.moveTo(rt.sx,rt.sy);c.lineTo(fr.sx,fr.sy);c.lineTo(fr.sx,fr.sy-h);c.lineTo(rt.sx,rt.sy-h);c.closePath();c.fill();
  // Left face
  c.fillStyle=`rgb(${st.l[0]*m|0},${st.l[1]*m|0},${st.l[2]*m|0})`;c.beginPath();c.moveTo(lt.sx,lt.sy);c.lineTo(fr.sx,fr.sy);c.lineTo(fr.sx,fr.sy-h);c.lineTo(lt.sx,lt.sy-h);c.closePath();c.fill();
  // Top
  c.fillStyle=`rgb(${st.t[0]*m|0},${st.t[1]*m|0},${st.t[2]*m|0})`;c.beginPath();c.moveTo(bk.sx,bk.sy-h);c.lineTo(rt.sx,rt.sy-h);c.lineTo(fr.sx,fr.sy-h);c.lineTo(lt.sx,lt.sy-h);c.closePath();c.fill();
  // Roof parapet
  if(b.re){const rc=b.rc;
    c.fillStyle=`rgb(${rc[0]*m|0},${rc[1]*m|0},${rc[2]*m|0})`;
    c.beginPath();c.moveTo(rt.sx,rt.sy-h);c.lineTo(fr.sx,fr.sy-h);c.lineTo(fr.sx,fr.sy-h-3);c.lineTo(rt.sx,rt.sy-h-3);c.closePath();c.fill();
    c.fillStyle=`rgb(${(rc[0]-8)*m|0},${(rc[1]-8)*m|0},${(rc[2]-8)*m|0})`;
    c.beginPath();c.moveTo(lt.sx,lt.sy-h);c.lineTo(fr.sx,fr.sy-h);c.lineTo(fr.sx,fr.sy-h-3);c.lineTo(lt.sx,lt.sy-h-3);c.closePath();c.fill();}
  // Setback
  if(b.hsb){const sh2=b.sbh;const ins=.2;
    const srt=iso(b.x+b.w*(1-ins),b.y+b.d*ins,cx,cy,sw,sh),slt=iso(b.x+b.w*ins,b.y+b.d*(1-ins),cx,cy,sw,sh);
    const sfr=iso(b.x+b.w*(1-ins),b.y+b.d*(1-ins),cx,cy,sw,sh);
    c.fillStyle=`rgb(${(st.r[0]+8)*m|0},${(st.r[1]+8)*m|0},${(st.r[2]+8)*m|0})`;
    c.beginPath();c.moveTo(srt.sx,srt.sy-sh2);c.lineTo(sfr.sx,sfr.sy-sh2);c.lineTo(sfr.sx,sfr.sy-h);c.lineTo(srt.sx,srt.sy-h);c.closePath();c.fill();
    c.fillStyle=`rgb(${(st.l[0]+5)*m|0},${(st.l[1]+5)*m|0},${(st.l[2]+5)*m|0})`;
    c.beginPath();c.moveTo(slt.sx,slt.sy-sh2);c.lineTo(sfr.sx,sfr.sy-sh2);c.lineTo(sfr.sx,sfr.sy-h);c.lineTo(slt.sx,slt.sy-h);c.closePath();c.fill();
    c.fillStyle=`rgb(${st.t[0]*m*.88|0},${st.t[1]*m*.88|0},${st.t[2]*m*.88|0})`;
    c.beginPath();c.moveTo(bk.sx,bk.sy-sh2);c.lineTo(rt.sx,rt.sy-sh2);c.lineTo(fr.sx,fr.sy-sh2);c.lineTo(lt.sx,lt.sy-sh2);c.closePath();c.fill();}
  // Front edge
  c.strokeStyle=`rgba(0,0,0,${.18*m})`;c.lineWidth=.5;c.beginPath();c.moveTo(fr.sx,fr.sy);c.lineTo(fr.sx,fr.sy-h);c.stroke();
  // Storefront
  if(b.sf){const sfH=Math.min(16,h*.11);
    c.fillStyle=`rgb(${sfC[0]*m|0},${sfC[1]*m|0},${sfC[2]*m|0})`;
    c.beginPath();c.moveTo(rt.sx,rt.sy);c.lineTo(fr.sx,fr.sy);c.lineTo(fr.sx,fr.sy-sfH);c.lineTo(rt.sx,rt.sy-sfH);c.closePath();c.fill();
    c.beginPath();c.moveTo(lt.sx,lt.sy);c.lineTo(fr.sx,fr.sy);c.lineTo(fr.sx,fr.sy-sfH);c.lineTo(lt.sx,lt.sy-sfH);c.closePath();c.fill();
    if(n>.2){const swx=rt.sx+(fr.sx-rt.sx)*.5;c.globalAlpha=n*.15;c.fillStyle="#ffc860";c.beginPath();c.arc(swx,fr.sy-sfH*.5,10,0,Math.PI*2);c.fill();c.globalAlpha=1}}
  // Awning
  if(b.aw){const awY=fr.sy-(b.sf?18:14);const ac=b.awc;
    c.fillStyle=`rgba(${ac[0]*m|0},${ac[1]*m|0},${ac[2]*m|0},${.45*m})`;
    const awL=rt.sx+(fr.sx-rt.sx)*.2,awR=rt.sx+(fr.sx-rt.sx)*.8;
    c.beginPath();c.moveTo(awL,awY);c.lineTo(awR,awY);c.lineTo(awR+3,awY+5);c.lineTo(awL+3,awY+5);c.closePath();c.fill();}
  // Door
  const doorX=rt.sx+(fr.sx-rt.sx)*.5;
  c.fillStyle=`rgba(${(sfC[0]-12)*m|0},${(sfC[1]-12)*m|0},${(sfC[2]-12)*m|0},${.6*m})`;
  c.fillRect(doorX-3,fr.sy-9,6,9);
  // Ledges
  const nL=(h/65)|0;for(let i=1;i<=nL;i++){const ly=h*i/(nL+1);
    c.fillStyle=`rgba(80,80,80,${.05*m})`;c.beginPath();c.moveTo(rt.sx,rt.sy-ly);c.lineTo(fr.sx,fr.sy-ly);c.lineTo(fr.sx,fr.sy-ly+1.5);c.lineTo(rt.sx,rt.sy-ly+1.5);c.closePath();c.fill();}
  // Windows
  const nR=Math.max(2,(h/20)|0),startR=b.sf?1:0;
  for(let face=0;face<2;face++){const wf=rng(b.sd+(face?777:0)),sp=face?lt:rt,nc=(face?b.d:b.w)*2;
    for(let r=startR;r<nR;r++)for(let cc=0;cc<nc;cc++){if(wf()<.3)continue;const tx=(cc+.5)/nc,sy2=(r+.4)/nR;
      const wx=sp.sx+(fr.sx-sp.sx)*tx,wy=sp.sy+(fr.sy-sp.sy)*tx-h+h*sy2;
      if(b.hsb&&wy<fr.sy-b.sbh-5)continue;const lit=wf()<(dL>.5?.05:.4);
      if(lit){const wc=WLC[(wf()*WLC.length)|0];c.globalAlpha=n*.06;c.fillStyle=`rgb(${wc[0]},${wc[1]},${wc[2]})`;c.beginPath();c.arc(wx,wy+1,6,0,Math.PI*2);c.fill();
        c.globalAlpha=n>.4?.72:.26;c.fillStyle=`rgb(${wc[0]},${wc[1]},${wc[2]})`;c.fillRect(wx-2,wy-3,4,6);
      }else{c.globalAlpha=.35;c.fillStyle="rgba(6,6,14,.5)";c.fillRect(wx-2,wy-3,4,6)}}}
  c.globalAlpha=1;
  // Rooftop AC/tank
  const tcx=(bk.sx+fr.sx)/2,tcy=(bk.sy+fr.sy)/2-h;
  if(b.ac){c.fillStyle=`rgba(85,85,95,${.28*m})`;c.fillRect(tcx-4,tcy-2,5,3)}
  if(b.tk){c.fillStyle=`rgba(60,55,45,${.28*m})`;c.beginPath();c.ellipse(tcx+5,tcy-2,3,2,0,0,Math.PI*2);c.fill()}
  // Sign
  if(b.sign&&n>.3){const sgX=rt.sx+(fr.sx-rt.sx)*.5,sgY=fr.sy-(b.sf?18:14);
    c.globalAlpha=n*.5;c.font="bold 5px monospace";c.textAlign="center";const tw=c.measureText(b.sign).width+4;
    c.fillStyle="rgba(25,20,15,.85)";c.fillRect(sgX-tw/2,sgY-3,tw,7);c.fillStyle="#ddd";c.fillText(b.sign,sgX,sgY+2);
    c.globalAlpha=n*.05;c.fillStyle="#ffa";c.beginPath();c.arc(sgX,sgY,9,0,Math.PI*2);c.fill();c.globalAlpha=1}
}

// ── TRAFFIC LIGHT ──
export function drawTL(c,tl,cx,cy,sw,sh,dL,time){
  const p=iso(tl.x,tl.y,cx,cy,sw,sh);if(p.sx<-40||p.sx>sw+40)return;
  const n=1-dL;c.strokeStyle=`rgba(55,55,55,${.5+n*.3})`;c.lineWidth=1.4;c.beginPath();c.moveTo(p.sx,p.sy);c.lineTo(p.sx,p.sy-24);c.stroke();
  c.fillStyle="rgba(28,28,32,.7)";c.fillRect(p.sx-2.5,p.sy-30,5,9);
  const cycle=((time+tl.ph)*.3)%3|0;const colors=[[210,45,45],[210,170,45],[45,190,70]];
  for(let i=0;i<3;i++){const act=i===cycle;const cc=colors[i];
    c.fillStyle=act?`rgba(${cc[0]},${cc[1]},${cc[2]},${.75*(.7+n*.3)})`:"rgba(35,35,35,.35)";
    c.beginPath();c.arc(p.sx,p.sy-28+i*3,1.2,0,Math.PI*2);c.fill();
    if(act&&n>.3){c.globalAlpha=n*.05;c.fillStyle=`rgb(${cc[0]},${cc[1]},${cc[2]})`;c.beginPath();c.arc(p.sx,p.sy-28+i*3,7,0,Math.PI*2);c.fill();c.globalAlpha=1}}
}

// ── VEHICLE ──
export function drawVeh(c,v,cx,cy,sw,sh,dL){
  const p=iso(v.x,v.y,cx,cy,sw,sh);if(p.sx<-40||p.sx>sw+40)return;
  const n=1-dL;c.fillStyle="rgba(0,0,0,.1)";c.beginPath();c.ellipse(p.sx,p.sy+2,9,4,0,0,Math.PI*2);c.fill();
  c.fillStyle=v.col;c.beginPath();c.moveTo(p.sx,p.sy-5-TH*.3);c.lineTo(p.sx+8,p.sy-5);c.lineTo(p.sx,p.sy-5+TH*.3);c.lineTo(p.sx-8,p.sy-5);c.closePath();c.fill();
  const dr=v.col.replace(/#(..)(..)(..)/,(m2,r,g,b)=>`rgb(${parseInt(r,16)*.55|0},${parseInt(g,16)*.55|0},${parseInt(b,16)*.55|0})`);
  c.fillStyle=dr;c.beginPath();c.moveTo(p.sx+8,p.sy-5);c.lineTo(p.sx,p.sy-5+TH*.3);c.lineTo(p.sx,p.sy+TH*.3);c.lineTo(p.sx+8,p.sy);c.closePath();c.fill();
  c.fillStyle=v.col;c.globalAlpha=.75;c.beginPath();c.moveTo(p.sx-8,p.sy-5);c.lineTo(p.sx,p.sy-5+TH*.3);c.lineTo(p.sx,p.sy+TH*.3);c.lineTo(p.sx-8,p.sy);c.closePath();c.fill();c.globalAlpha=1;
  c.fillStyle=`rgba(70,90,120,${.3+n*.15})`;c.beginPath();c.moveTo(p.sx-2,p.sy-6);c.lineTo(p.sx+3,p.sy-4.5);c.lineTo(p.sx+2,p.sy-3);c.lineTo(p.sx-3,p.sy-4.5);c.closePath();c.fill();
  if(n>.3&&!v.pk){const dirs=[[1,0],[0,1],[-1,0],[0,-1]];const[hx,hy]=dirs[v.dir%4];
    c.globalAlpha=n*.1;c.fillStyle="#ffd866";c.beginPath();c.arc(p.sx+hx*10,p.sy+hy*5-3,6,0,Math.PI*2);c.fill();
    c.globalAlpha=n*.3;c.fillStyle="#ffe888";c.beginPath();c.arc(p.sx+hx*10,p.sy+hy*5-3,1,0,Math.PI*2);c.fill();
    c.globalAlpha=n*.25;c.fillStyle="#f33";c.beginPath();c.arc(p.sx-hx*9,p.sy-hy*4-3,.8,0,Math.PI*2);c.fill();c.globalAlpha=1}
}

// ── LAMP ──
export function drawLamp(c,l,cx,cy,sw,sh,dL){
  const p=iso(l.x,l.y,cx,cy,sw,sh);if(p.sx<-50||p.sx>sw+50)return;
  const n=1-dL;c.strokeStyle=`rgba(65,65,65,${.5+n*.3})`;c.lineWidth=1.4;c.beginPath();c.moveTo(p.sx,p.sy);c.lineTo(p.sx,p.sy-30);c.stroke();
  c.lineWidth=.7;c.beginPath();c.moveTo(p.sx,p.sy-28);c.lineTo(p.sx+4,p.sy-31);c.stroke();
  c.fillStyle=`rgba(255,200,120,${.25+n*.5})`;c.beginPath();c.arc(p.sx+4,p.sy-32,1.5,0,Math.PI*2);c.fill();
  if(n>.3){c.globalAlpha=n*.1;c.fillStyle="#ffb040";c.beginPath();c.arc(p.sx+2,p.sy+2,32,0,Math.PI*2);c.fill();
    c.globalAlpha=n*.05;c.beginPath();c.arc(p.sx+2,p.sy+2,16,0,Math.PI*2);c.fill();c.globalAlpha=1}
}

// ── FIGURE (player/NPC) ──
export function drawFig(c,sx,sy,time,mv,bc,lc,sc,glow,idle){
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
  if(glow){c.globalAlpha=.04;c.fillStyle="#a8b8cc";c.beginPath();c.arc(sx,sy-14,24,0,Math.PI*2);c.fill();c.globalAlpha=1}
}

// ── TREE ──
export function drawTree(c,tx,ty,cx,cy,sw,sh,dL){
  const p=iso(tx+.5,ty+.5,cx,cy,sw,sh);if(p.sx<-20||p.sx>sw+20||p.sy<-45||p.sy>sh+20)return;
  const m=.65+dL*.35;c.fillStyle=`rgb(${46*m|0},${32*m|0},${18*m|0})`;c.fillRect(p.sx-1.5,p.sy-15,3,15);
  c.fillStyle=`rgb(${24*m|0},${46*m|0},${18*m|0})`;c.beginPath();c.arc(p.sx,p.sy-20,8,0,Math.PI*2);c.fill();
  c.fillStyle=`rgb(${30*m|0},${56*m|0},${24*m|0})`;c.beginPath();c.arc(p.sx-3,p.sy-17,5.5,0,Math.PI*2);c.fill();
}

// ── POI ──
export function drawPOI(c,poi,cx,cy,sw,sh,time,near){
  if(poi.tp==="npc")return;const p=iso(poi.x,poi.y,cx,cy,sw,sh);
  if(p.sx<-30||p.sx>sw+30)return;const pulse=near?.5+Math.sin(time*4)*.2:.08;const r=near?5:2;
  const co={door:[255,180,80],bench:[110,200,110],corner:[130,130,210],object:[255,210,90],clearing:[90,210,150],ruin:[190,170,130]}[poi.tp]||[170,170,170];
  if(near){c.globalAlpha=pulse*.15;c.strokeStyle=`rgb(${co[0]},${co[1]},${co[2]})`;c.lineWidth=1.5;
    c.beginPath();c.arc(p.sx,p.sy-2,10+Math.sin(time*3)*4,0,Math.PI*2);c.stroke();
    c.globalAlpha=pulse*.2;c.fillStyle=`rgb(${co[0]},${co[1]},${co[2]})`;c.beginPath();c.arc(p.sx,p.sy-2,12,0,Math.PI*2);c.fill();c.globalAlpha=1}
  c.fillStyle=`rgba(${co[0]},${co[1]},${co[2]},${pulse})`;c.beginPath();c.arc(p.sx,p.sy-2,r,0,Math.PI*2);c.fill();
}

// ── PROP ──
export function drawProp(c,pr,cx,cy,sw,sh,dL){
  const p=iso(pr.x,pr.y,cx,cy,sw,sh);if(p.sx<-25||p.sx>sw+25)return;
  const m=.6+dL*.4;
  if(pr.tp==="tc"){c.fillStyle=`rgb(${48*m|0},${48*m|0},${52*m|0})`;c.fillRect(p.sx-3,p.sy-9,6,9)}
  else if(pr.tp==="hy"){c.fillStyle=`rgb(${145*m|0},${36*m|0},${30*m|0})`;c.fillRect(p.sx-2,p.sy-8,4,8)}
  else if(pr.tp==="tr"){c.fillStyle=`rgba(52,48,38,${.4*m})`;c.fillRect(p.sx-2,p.sy-2,3,2)}
  else if(pr.tp==="pu"){c.fillStyle=`rgba(32,42,68,${.1+(1-dL)*.05})`;c.beginPath();c.ellipse(p.sx,p.sy,6,3,0,0,Math.PI*2);c.fill()}
  else if(pr.tp==="dm"){c.fillStyle=`rgb(${38*m|0},${52*m|0},${32*m|0})`;c.fillRect(p.sx-5,p.sy-8,10,8);
    c.fillStyle=`rgb(${32*m|0},${45*m|0},${28*m|0})`;c.fillRect(p.sx-6,p.sy-9,12,2)}
}

// ── MINIMAP ──
export function drawMM(c,G,w,sw,sh){
  const sz=42,mx=5,my=5,rg=20,sc=sz/rg;
  c.globalAlpha=.3;c.fillStyle="rgba(8,8,16,.82)";c.fillRect(mx,my,sz,sz);
  for(let dy=-rg/2;dy<rg/2;dy+=2)for(let dx=-rg/2;dx<rg/2;dx+=2){
    const t=w.tile((G.px+dx)|0,(G.py+dy)|0);
    c.fillStyle=t===1?"rgba(50,50,78,.6)":t===3?"rgba(52,48,58,.7)":t===4?"rgba(32,58,28,.5)":t===8?"rgba(28,42,88,.6)":"rgba(38,38,52,.3)";
    c.fillRect(mx+(dx+rg/2)*sc,my+(dy+rg/2)*sc,sc*2,sc*2);}
  c.fillStyle="#fff";c.beginPath();c.arc(mx+sz/2,my+sz/2,1.5,0,Math.PI*2);c.fill();c.globalAlpha=1;
}

// ── INTERIOR ──
export function drawInt(c,sw,sh,desc,time,fade){
  const a=Math.min(1,fade);c.fillStyle=`rgba(6,6,12,${a*.95})`;c.fillRect(0,0,sw,sh);
  const rx=sw*.07,ry=sh*.12,rw=sw*.86,rh=sh*.55;
  c.fillStyle=`rgba(20,18,26,${a})`;c.fillRect(rx,ry,rw,rh*.55);
  c.fillStyle=`rgba(40,36,30,${a})`;c.fillRect(rx,ry+rh*.55,rw,rh*.45);
  if(desc){c.globalAlpha=a*.88;c.fillStyle="#c8c0b4";c.font="14px 'Courier New',monospace";c.textAlign="center";
    const words=desc.split(" ");let line="",ly=ry+30;
    for(const w of words){const t2=line+w+" ";if(c.measureText(t2).width>rw-30){c.fillText(line,sw/2,ly);ly+=19;line=w+" "}else line=t2}
    c.fillText(line,sw/2,ly);c.globalAlpha=1}
}

// ── STARS ──
export function genStars(){const r=rng(777),s=[];for(let i=0;i<55;i++)s.push({x:r(),y:r()*.5,b:.3+r()*.7,sz:.5+r(),sp:.5+r()*2});return s}
