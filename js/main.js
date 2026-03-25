// ═══ TABULA RASA — main.js V23 ═══
// Changes: footprints, NPC proximity awareness, headlight beams
import { TW, TH, CH, CS, SPD, SPRNT, CLERP, IR, NB } from './config.js';
import { iso, lp, cl, H, rng, gDist } from './utils.js';
import { World } from './world.js';
import { callDir, save, load, setKey, setNoDir, isNoDir } from './director.js';
import { drawGnd, drawBldg, drawTL, drawVeh, drawLamp, drawFig, drawTree, drawPOI, drawProp, drawMM, drawInt, genStars, drawFootprints, drawNpcAware } from './renderer.js';
import { Aud } from './audio.js';
import { Joy } from './ui.js';

// ── ENTRY POINT — called from index.html after setup ──
export function startGame(apiKey, noDir){
  if(apiKey)setKey(apiKey);
  if(noDir)setNoDir(true);
  init();
}

// ── GAME ──
function init(){
  const cv=document.getElementById("C"),ctx=cv.getContext("2d");
  const joy=new Joy(),world=new World(),audio=new Aud(),stars=genStars();
  let saving=0,shT=0;
  const footprints=[];let fpAcc=0,fpSide=1;

  const G={px:CS/2+.5,py:CS/2+1.5,camX:0,camY:0,time:0,fadeIn:0,keys:{},
    prof:{exploration:0,confrontation:0,social:0,construction:0,meaning:0},
    nLog:[],rules:[],seeds:[],npcs:[],objs:[],ni:0,dw:0,pt:0,tv:new Set(),
    nearPoi:null,busy:false,narr:null,bubs:[],
    lastIT:-10,lastMT:0,idleT:false,explT:0,fm:false,ft:false,
    mood:"neutral",wth:"clear",dayT:.08,intr:null,intF:0,intD:null,
    inv:[],nc:{},arcs:[],lpi:null,btnT:null,
    facing:0,lastDist:"",distShowT:0};

  const sv=load();
  if(sv){Object.assign(G,{...sv,tv:sv.tv||new Set(),fadeIn:0,keys:{},busy:false,narr:null,bubs:[],nearPoi:null,
    fm:true,ft:true,intF:0,intr:null,intD:null,inv:sv.inv||[],nc:sv.nc||{},arcs:sv.arcs||[],
    camX:(sv.px-sv.py)*TW,camY:(sv.px+sv.py)*TH})}

  // ── RESIZE ──
  function resize(){const d=Math.min(window.devicePixelRatio||1,1.5);cv.width=cv.clientWidth*d;cv.height=cv.clientHeight*d;ctx.setTransform(d,0,0,d,0,0)}
  resize();window.addEventListener("resize",resize);

  // ── INPUT ──
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

  // ── INTERACTION ──
  async function act(){
    audio.init();if(G.busy||G.time-G.lastIT<1.5)return;G.lastIT=G.time;shT=G.time;
    if(G.intr){G.intr=null;G.intD=null;return}
    G.busy=true;G.ni++;audio.ping();
    const p=G.nearPoi;let a,nh=null;const same=p?.id===G.lpi;G.lpi=p?.id||null;
    if(p){
      if(p.tp==="npc"){const npc=G.npcs.find(n=>n.id===p.id);
        a=same?`Le joueur interagit encore avec ${npc?.desc||"cette personne"}.`:`Le joueur s'approche de ${npc?.desc||"quelqu'un"}. ${npc?.idle||""}`;
        if(G.nc[p.id]?.length)nh=G.nc[p.id].slice(-6).join("\n");
      }else if(p.tp==="object"){
        const obj=G.objs.find(o=>o.id===p.id);
        if(obj?.pickable){G.inv.push({desc:obj.desc,glyph:obj.glyph||"?",id:obj.id});G.objs=G.objs.filter(o=>o.id!==p.id);
          for(const ch of world.vis(G.px,G.py))ch.poi=ch.poi.filter(pp=>pp.id!==p.id);showN(`Ramassé: ${obj.desc}`);G.busy=false;save(G);return}
        a=`Le joueur examine: ${p.desc||"un objet"}`;
      }else a={door:"Le joueur essaie d'ouvrir une porte.",bench:"Le joueur s'assoit.",corner:"Le joueur observe.",
        clearing:"Espace dégagé.",ruin:"Pierres anciennes."}[p.tp]||"Interaction.";
    }else a="Le joueur regarde autour de lui.";
    const r=await callDir(a,G,nh);
    if(r){apply(r,p);
      if(p?.tp==="npc"){if(!G.nc[p.id])G.nc[p.id]=[];if(r.narrative)G.nc[p.id].push(`[j]${r.narrative}`);
        if(r.bubble)for(const[id,txt]of Object.entries(r.bubble)){if(!G.nc[id])G.nc[id]=[];G.nc[id].push(`[p]${txt}`)}}}
    else if(!isNoDir())showN("...");
    G.busy=false;
  }

  async function autoT(tp){
    if(G.busy||isNoDir())return;G.busy=true;G.ni++;
    const r=await callDir({first_move:"La silhouette fait ses premiers pas.",idle:"Immobile.",explore:`Marche. ${G.dw|0} pas.`}[tp]||"Immobile.",G,null);
    if(r)apply(r);G.busy=false;
  }

  function apply(r,poi){
    if(r.narrative){showN(r.narrative);G.nLog.push(r.narrative)}
    if(r.interior&&poi?.tp==="door"){G.intr=poi.id;G.intD=r.interior;G.intF=0}
    if(r.bubble&&typeof r.bubble==="object")for(const[id,txt]of Object.entries(r.bubble))G.bubs.push({nid:id,text:String(txt),st:G.time});
    if(r.npcs_spawn)for(const n of r.npcs_spawn){
      const id=`n${Date.now().toString(36)}${Math.random().toString(36).slice(2,5)}`;
      let nx=Math.round(G.px+(n.dx!=null?n.dx:(Math.random()-.5)*5)),ny=Math.round(G.py+(n.dy!=null?n.dy:(Math.random()-.5)*5));
      for(let i=0;i<8;i++){if([1,2,4,7].includes(world.tile(nx,ny)))break;nx=Math.round(G.px+(Math.random()-.5)*6);ny=Math.round(G.py+(Math.random()-.5)*6)}
      G.npcs.push({...n,x:nx+.5,y:ny+.5,id,color:NB[H(nx,ny)%NB.length],wt:0,wx:0,wy:0});
      world.gc(Math.floor(nx/CH),Math.floor(ny/CH)).poi.push({tp:"npc",x:nx+.5,y:ny+.5,id,desc:n.desc,idle:n.idle});
    }
    if(r.npcs_remove)G.npcs=G.npcs.filter(n=>!r.npcs_remove.includes(n.id));
    if(r.objects_spawn)for(const o of r.objects_spawn){
      const id=`o${Date.now().toString(36)}`;let ox=Math.round(G.px+(o.dx||0)),oy=Math.round(G.py+(o.dy||0));
      G.objs.push({...o,x:ox+.5,y:oy+.5,id,pickable:!!o.pickable});
      world.gc(Math.floor(ox/CH),Math.floor(oy/CH)).poi.push({tp:"object",x:ox+.5,y:oy+.5,id,desc:o.desc});
    }
    if(r.profile_delta)for(const k of Object.keys(G.prof))if(r.profile_delta[k])G.prof[k]=cl(G.prof[k]+(r.profile_delta[k]||0),-1,1);
    if(r.rulebook_new)for(const ru of r.rulebook_new)if(ru&&!G.rules.includes(ru))G.rules.push(ru);
    if(r.seeds)for(const s of r.seeds)if(s)G.seeds.push(s);
    if(r.world_mood&&r.world_mood!=="null"){G.mood=r.world_mood;audio.setMood(G.mood,G.px>=0&&G.px<CS)}
    if(r.weather&&r.weather!=="null")G.wth=r.weather;
    if(r.arc&&r.arc!=="null"&&!G.arcs.includes(r.arc))G.arcs.push(r.arc);
    if(poi)poi.used=true;saving=G.time;save(G);
  }

  function showN(t){G.narr={text:t,ci:0,st:G.time,done:false,fs:0}}

  // ═══ GAME LOOP ═══
  let lastT=performance.now(),savT=0;

  function loop(now){
    const dt=Math.min((now-lastT)/16.67,3);lastT=now;
    G.time+=dt*.016;G.pt+=dt*.016;G.fadeIn=Math.min(1,G.fadeIn+.006*dt);
    G.dayT=(G.dayT+dt*.00007)%1;
    const dL=Math.max(0,Math.sin(G.dayT*Math.PI*2-Math.PI/2)*.5+.5);
    const sw=cv.clientWidth,sh=cv.clientHeight;
    // Sunrise/sunset color shift — warm tones during transitions
    const sunAngle=G.dayT*Math.PI*2-Math.PI/2;
    const sunsetAmt=Math.max(0,Math.sin(sunAngle*2))*Math.max(0,1-Math.abs(dL-.5)*4);// peaks at dawn/dusk
    const sR=lp(5,46,dL)+sunsetAmt*25;
    const sG=lp(5,60,dL)+sunsetAmt*8;
    const sB=lp(14,86,dL)-sunsetAmt*15;
    const shAmt=Math.max(0,1-(G.time-shT)*4)*3;
    const shX=Math.sin(G.time*40)*shAmt,shY=Math.cos(G.time*35)*shAmt;

    if(!G.intr){
      // ── MOVEMENT ──
      let dx=0,dy=0;
      if(G.keys["w"]||G.keys["arrowup"]){dx--;dy--}if(G.keys["s"]||G.keys["arrowdown"]){dx++;dy++}
      if(G.keys["a"]||G.keys["arrowleft"]){dx--;dy++}if(G.keys["d"]||G.keys["arrowright"]){dx++;dy--}
      if(joy.on&&(Math.abs(joy.dx)>.15||Math.abs(joy.dy)>.15)){dx+=(joy.dx+joy.dy)*.7;dy+=(-joy.dx+joy.dy)*.7}
      const mv=dx!==0||dy!==0;
      const spd=G.keys["shift"]||joy.mg>.85?SPRNT:SPD;
      if(mv){
        if(!G.fm){G.fm=true;audio.init()}
        const ln=Math.sqrt(dx*dx+dy*dy),mx=dx/ln*spd*dt,my=dy/ln*spd*dt;
        const tile=world.tile(Math.floor(G.px+mx),Math.floor(G.py+my));
        if(tile!==3&&tile!==8){G.px+=mx;G.py+=my}else{
          if(world.tile(Math.floor(G.px+mx),Math.floor(G.py))!==3&&world.tile(Math.floor(G.px+mx),Math.floor(G.py))!==8)G.px+=mx;
          if(world.tile(Math.floor(G.px),Math.floor(G.py+my))!==3&&world.tile(Math.floor(G.px),Math.floor(G.py+my))!==8)G.py+=my;
        }
        G.dw+=spd*dt;G.tv.add(`${G.px|0},${G.py|0}`);G.lastMT=G.time;G.idleT=false;audio.step(true,dt*.016);
        // Footprints
        fpAcc+=dt*.016;
        if(fpAcc>.3){fpAcc=0;fpSide*=-1;
          footprints.push({x:G.px+fpSide*.08,y:G.py+fpSide*.04,age:0,side:fpSide});
          if(footprints.length>35)footprints.shift()}
        // Track facing direction
        if(Math.abs(dx)+Math.abs(dy)>.1){
          if(dx>0&&dy>0)G.facing=0;else if(dx>0&&dy<0)G.facing=3;
          else if(dx<0&&dy>0)G.facing=1;else if(dx<0&&dy<0)G.facing=2;
          else if(dx>0)G.facing=0;else if(dx<0)G.facing=2;
          else if(dy>0)G.facing=0;else G.facing=2;
        }
      }
      // Ambient audio
      const inCity=G.px>=0&&G.px<CS&&G.py>=0&&G.py<CS;
      audio.ambient(dt*.016,inCity);

      // District change detection — show name briefly
      const curDist=inCity?(gDist(G.px|0,G.py|0)===0?"DOWNTOWN":gDist(G.px|0,G.py|0)===1?"INDUSTRIAL":"RESIDENTIAL"):(G.px<-10||G.py<-10||G.px>CS+10||G.py>CS+10?"WILDERNESS":"CITY EDGE");
      if(curDist!==G.lastDist){G.lastDist=curDist;G.distShowT=G.time}

      // Auto-triggers
      if(G.fm&&!G.ft&&G.dw>1.5){G.ft=true;autoT("first_move")}
      if(!mv&&G.time-G.lastMT>35&&!G.idleT&&G.ni>0){G.idleT=true;autoT("idle")}
      if(mv&&G.dw-G.explT>45&&G.ni>=1){G.explT=G.dw;if(Math.random()<.1)autoT("explore")}

      // ── NPC WANDER ──
      for(const n of G.npcs){
        n.wt=(n.wt||0)+dt*.016;
        if(n.wt>3+Math.random()*5){n.wt=0;n.wx=(Math.random()-.5)*.008;n.wy=(Math.random()-.5)*.008}
        const nt=world.tile(Math.floor(n.x+(n.wx||0)),Math.floor(n.y+(n.wy||0)));
        if(nt!==3&&nt!==8){n.x+=(n.wx||0)*dt;n.y+=(n.wy||0)*dt}
        for(const ch of world.vis(G.px,G.py))for(const p of ch.poi)if(p.id===n.id){p.x=n.x;p.y=n.y}
      }

      // ── CAMERA ── (faster breathing when sprinting)
      const sprinting=G.keys["shift"]||joy.mg>.85;
      const breathSpd=sprinting?1.2:.3;
      const bX=Math.sin(G.time*breathSpd)*(.6+sprinting*.4)+shX;
      const bY=Math.cos(G.time*(breathSpd*.8))*(.4+sprinting*.3)+shY;
      G.camX+=((G.px-G.py)*TW+bX-G.camX)*CLERP*dt;
      G.camY+=((G.px+G.py)*TH+bY-G.camY)*CLERP*dt;

      // ── NEAREST POI ──
      G.nearPoi=null;let nd=IR;
      for(const ch of world.vis(G.px,G.py))for(const p of ch.poi){
        const d=Math.sqrt((p.x-G.px)**2+(p.y-G.py)**2);if(d<nd){nd=d;G.nearPoi=p}
      }

      // ═══ RENDER ═══
      ctx.fillStyle=`rgb(${sR|0},${sG|0},${sB|0})`;ctx.fillRect(0,0,sw,sh);
      // Sunrise/sunset horizon glow
      if(sunsetAmt>.1){
        ctx.globalAlpha=sunsetAmt*.12;
        ctx.fillStyle=`rgb(${180+sunsetAmt*40|0},${80+sunsetAmt*30|0},${40|0})`;
        ctx.fillRect(0,sh*.35,sw,sh*.3);
        ctx.globalAlpha=1;
      }

      // Stars
      if(dL<.4){const sa=(.4-dL)*2.5;
        for(const s of stars){ctx.globalAlpha=sa*s.b*(.5+Math.sin(G.time*s.sp)*.5)*.35;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(s.x*sw,s.y*sh,s.sz,0,Math.PI*2);ctx.fill()}
        ctx.globalAlpha=sa*.4;ctx.fillStyle="#e8e4d8";ctx.beginPath();ctx.arc(sw*.78,sh*.08,8,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=`rgb(${sR|0},${sG|0},${sB|0})`;ctx.beginPath();ctx.arc(sw*.78+3,sh*.08-1,6.5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}

      // Tiles
      const vis=world.vis(G.px,G.py);const allT=[];
      for(const ch of vis){const ox=ch.cx*CH,oy=ch.cy*CH;
        for(let ly=0;ly<CH;ly++)for(let lx=0;lx<CH;lx++){
          const gx=ox+lx,gy=oy+ly,p=iso(gx+.5,gy+.5,G.camX,G.camY,sw,sh);
          if(p.sx<-TW*2||p.sx>sw+TW*2||p.sy<-TH*2||p.sy>sh+TH*2)continue;
          allT.push({gx,gy,sx:p.sx,sy:p.sy,t:ch.t[ly]?ch.t[ly][lx]:0});
        }}
      allT.sort((a,b)=>(a.gx+a.gy)-(b.gx+b.gy));
      for(const t of allT)drawGnd(ctx,t.sx,t.sy,t.t,dL,t.gx,t.gy,G.time);

      // Footprints (age + draw + cleanup)
      for(const fp of footprints)fp.age+=dt*.016;
      drawFootprints(ctx,footprints,G.camX,G.camY,sw,sh,dL);
      while(footprints.length>0&&footprints[0].age>16)footprints.shift();

      for(const ch of vis)for(const p of ch.poi)drawPOI(ctx,p,G.camX,G.camY,sw,sh,G.time,p===G.nearPoi);

      // Depth-sorted entities
      const ents=[];
      for(const ch of vis){
        for(const b of ch.bl)ents.push({t:0,d:b.x+b.w+b.y+b.d,data:b});
        for(const tr of ch.trees)ents.push({t:1,d:tr.x+tr.y+1.5,data:tr});
        for(const pr of ch.props)ents.push({t:5,d:pr.x+pr.y+.5,data:pr});
        for(const an of ch.ambN)ents.push({t:6,d:an.x+an.y+.5,data:an});
        for(const v of ch.vehs)ents.push({t:7,d:v.x+v.y+.5,data:v});
        for(const tl of ch.tLights)ents.push({t:8,d:tl.x+tl.y+.5,data:tl});
      }
      ents.push({t:2,d:G.px+G.py+.5});
      for(const n of G.npcs)ents.push({t:3,d:n.x+n.y+.5,data:n});
      for(const o of G.objs)ents.push({t:4,d:o.x+o.y+.5,data:o});
      ents.sort((a,b)=>a.d-b.d);

      for(const e of ents){
        if(e.t===0)drawBldg(ctx,e.data,G.camX,G.camY,sw,sh,dL,G.time);
        else if(e.t===1)drawTree(ctx,e.data.x,e.data.y,G.camX,G.camY,sw,sh,dL);
        else if(e.t===2){const p=iso(G.px,G.py,G.camX,G.camY,sw,sh);drawFig(ctx,p.sx,p.sy,G.time,mv,"#343640","#222230",1,true);
          // Facing indicator — subtle dot ahead
          if(mv){const fd=[[3,-1],[-1,2],[-3,1],[1,-2]][G.facing];
            ctx.globalAlpha=.12;ctx.fillStyle="#aab";ctx.beginPath();ctx.arc(p.sx+fd[0]*3,p.sy+fd[1]*2-15,1.5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}}
        else if(e.t===3){const p=iso(e.data.x,e.data.y,G.camX,G.camY,sw,sh);
          if(p.sx>-40&&p.sx<sw+40)drawFig(ctx,p.sx,p.sy,G.time,Math.abs(e.data.wx||0)>.004,e.data.color||"#5a5a7e","#282838",.3)}
        else if(e.t===4){const p=iso(e.data.x,e.data.y,G.camX,G.camY,sw,sh);
          if(p.sx>-20&&p.sx<sw+20){if(G.objs.find(o=>o.id===e.data.id)?.pickable)ctx.globalAlpha=.4+Math.sin(G.time*3)*.15;
            ctx.font="13px serif";ctx.textAlign="center";ctx.fillText(e.data.glyph||"?",p.sx,p.sy-4);ctx.globalAlpha=1}}
        else if(e.t===5)drawProp(ctx,e.data,G.camX,G.camY,sw,sh,dL);
        else if(e.t===6){
          const an=e.data;
          if(an.idle==="walk"){const dirs=[[.01,0],[0,.01],[-.01,0],[0,-.01]];const[ddx,ddy]=dirs[an.dir%4];
            const nx=an.x+ddx*an.spd*dt,ny=an.y+ddy*an.spd*dt;
            // NPCs slow/stop when player is very close
            const distToP=Math.sqrt((an.x-G.px)**2+(an.y-G.py)**2);
            if(distToP>3){
              if([1,2].includes(world.tile(Math.floor(nx),Math.floor(ny)))){an.x=nx;an.y=ny}else an.dir=(an.dir+1+(Math.random()*2|0))%4
            }
          }
          const p=iso(an.x,an.y,G.camX,G.camY,sw,sh);
          const closeToPlayer=Math.sqrt((an.x-G.px)**2+(an.y-G.py)**2)<3.5;
          if(p.sx>-25&&p.sx<sw+25){
            drawFig(ctx,p.sx,p.sy,G.time+an.ph,an.idle==="walk"&&!closeToPlayer,an.bc,an.lc,.22,false,closeToPlayer&&an.idle!=="walk"?an.idle:an.idle);
            drawNpcAware(ctx,p.sx,p.sy,closeToPlayer);
          }
        }
        else if(e.t===7){
          const v=e.data;
          if(!v.pk){const dirs=[[.01,0],[0,.01],[-.01,0],[0,-.01]];const[vdx,vdy]=dirs[v.dir%4];
            const nvx=v.x+vdx*v.spd*dt,nvy=v.y+vdy*v.spd*dt;
            if(world.tile(Math.floor(nvx),Math.floor(nvy))===1){v.x=nvx;v.y=nvy}else v.dir=(v.dir+1+(Math.random()*2|0))%4}
          drawVeh(ctx,v,G.camX,G.camY,sw,sh,dL);
        }
        else if(e.t===8)drawTL(ctx,e.data,G.camX,G.camY,sw,sh,dL,G.time);
      }

      for(const ch of vis)for(const l of ch.lamps)drawLamp(ctx,l,G.camX,G.camY,sw,sh,dL);

      // Edge vignette + night atmosphere
      const vigA=.16-dL*.06;
      ctx.globalAlpha=vigA;ctx.fillStyle=`rgb(${sR|0},${sG|0},${sB|0})`;
      ctx.fillRect(0,0,sw,sh*.12);ctx.fillRect(0,sh*.88,sw,sh*.12);
      ctx.fillRect(0,0,sw*.07,sh);ctx.fillRect(sw*.93,0,sw*.07,sh);
      // Night fog — low-lying haze effect
      if(dL<.3){
        ctx.globalAlpha=((.3-dL)/.3)*.06;ctx.fillStyle=`rgb(${sR+10|0},${sG+10|0},${sB+15|0})`;
        ctx.fillRect(0,sh*.6,sw,sh*.4);
      }
      ctx.globalAlpha=1;

      // Bubbles
      G.bubs=G.bubs.filter(b=>G.time-b.st<6);
      for(const b of G.bubs){const npc=G.npcs.find(n=>n.id===b.nid);if(!npc)continue;
        const p=iso(npc.x,npc.y,G.camX,G.camY,sw,sh);
        const a=G.time-b.st>4?Math.max(0,1-(G.time-b.st-4)/2):Math.min(1,(G.time-b.st)*2);
        ctx.globalAlpha=a*.85;ctx.font="11px 'Courier New',monospace";const tw=ctx.measureText(b.text).width+12;
        ctx.fillStyle="rgba(10,10,18,.88)";ctx.fillRect(p.sx-tw/2,p.sy-52,tw,22);
        ctx.fillStyle="#d0ccc4";ctx.textAlign="center";ctx.fillText(b.text,p.sx,p.sy-37);ctx.globalAlpha=1}

      // Weather effects
      if(G.wth==="rain"||G.wth==="drizzle"){
        const int=G.wth==="rain"?.7:.3;
        ctx.strokeStyle=`rgba(140,165,185,${.05*int})`;ctx.lineWidth=.5;
        for(let i=0;i<22;i++){
          const rx=Math.random()*sw,ry=Math.random()*sh;
          ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(rx-1.5,ry+6*int);ctx.stroke();
        }
        // Ground splash circles
        if(G.wth==="rain"){
          ctx.strokeStyle=`rgba(120,140,165,${.03})`;ctx.lineWidth=.3;
          for(let i=0;i<5;i++){
            const rx=Math.random()*sw,ry=sh*.4+Math.random()*sh*.5;
            ctx.beginPath();ctx.ellipse(rx,ry,2+Math.random()*2,1+Math.random(),0,0,Math.PI*2);ctx.stroke();
          }
        }
      }
      if(G.wth==="fog"){
        ctx.globalAlpha=.08;ctx.fillStyle=`rgb(${sR+15|0},${sG+15|0},${sB+20|0})`;ctx.fillRect(0,0,sw,sh);ctx.globalAlpha=1;
      }

    }else{
      G.intF=Math.min(1,G.intF+dt*.03);drawInt(ctx,sw,sh,G.intD,G.time,G.intF);
    }

    // ═══ UI OVERLAY ═══
    if(G.inv.length&&!G.intr){ctx.globalAlpha=.45;ctx.font="12px serif";ctx.textAlign="left";
      for(let i=0;i<Math.min(G.inv.length,6);i++)ctx.fillText(G.inv[i].glyph||"·",55+i*16,18);ctx.globalAlpha=1}
    if(!G.intr)drawMM(ctx,G,world,sw,sh);

    // District name — fades in/out when changing area
    if(G.distShowT>0){
      const distAge=G.time-G.distShowT;
      if(distAge<5){
        const da=distAge<1?distAge:distAge>4?5-distAge:1;
        ctx.globalAlpha=da*.25;ctx.fillStyle="#c8c0b4";ctx.font="10px 'Courier New',monospace";
        ctx.textAlign="center";ctx.letterSpacing="4px";
        ctx.fillText(G.lastDist,sw/2,sh*.18);
        ctx.globalAlpha=1;
      }
    }

    // Interact button
    const bx=sw-50,by=sh-55;
    if(!G.intr){const hasN=!!G.nearPoi;const pulse=hasN?.55+Math.sin(G.time*3)*.18:.12;
      ctx.globalAlpha=pulse*.5;ctx.fillStyle=hasN?"#ffd866":"#555";ctx.beginPath();ctx.arc(bx,by,hasN?26:22,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=hasN?.55:.2;ctx.strokeStyle=hasN?"#ffcc44":"#666";ctx.lineWidth=2;ctx.beginPath();ctx.arc(bx,by,hasN?26:22,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=hasN?.85:.35;ctx.fillStyle=hasN?"#1a1a24":"#999";ctx.font=`bold ${hasN?18:16}px monospace`;ctx.textAlign="center";
      ctx.fillText(hasN?"?":"·",bx,by+6);
      if(hasN){ctx.globalAlpha=.35;ctx.fillStyle="#ffd866";ctx.font="8px monospace";ctx.fillText("toucher",bx,by+38)}ctx.globalAlpha=1;
      // Show what's nearby
      if(hasN&&G.nearPoi){
        const desc=G.nearPoi.tp==="npc"?G.npcs.find(n=>n.id===G.nearPoi.id)?.desc:
          G.nearPoi.tp==="door"?"porte":G.nearPoi.tp==="bench"?"banc":
          G.nearPoi.tp==="object"?G.objs.find(o=>o.id===G.nearPoi.id)?.desc:null;
        if(desc){ctx.globalAlpha=.25;ctx.fillStyle="#c8c0b4";ctx.font="8px 'Courier New',monospace";ctx.textAlign="center";
          const maxW=sw*.4;let txt=desc;if(ctx.measureText(txt).width>maxW)txt=txt.substring(0,20)+"…";
          ctx.fillText(txt,sw/2,sh-20);ctx.globalAlpha=1}
      }
    }else{ctx.globalAlpha=.4;ctx.fillStyle="#aaa";ctx.beginPath();ctx.arc(bx,by,22,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=.8;ctx.fillStyle="#1a1a24";ctx.font="bold 16px monospace";ctx.textAlign="center";ctx.fillText("↓",bx,by+6);ctx.globalAlpha=1}

    // Busy indicator
    if(G.busy){ctx.globalAlpha=.2;ctx.fillStyle="#888";ctx.font="13px monospace";ctx.textAlign="center";
      ctx.fillText("·".repeat(1+(G.time*2|0)%4),sw/2,G.intr?sh/2+55:sh-95);ctx.globalAlpha=1}

    // Narrative bar
    if(G.narr){const n=G.narr,el=G.time-n.st;
      if(!n.done){n.ci=Math.min(n.text.length,(el*18)|0);if(n.ci>=n.text.length){n.done=true;n.fs=G.time}}// slightly faster typewriter
      let a=1;if(n.done){const s=G.time-n.fs;if(s>8)a=Math.max(0,1-(s-8)/3);if(a<=0)G.narr=null}
      if(a>0&&G.narr){const barH=Math.min(58,sh*.1),barY=G.intr?sh*.68:sh-barH-90;
        // Black bar with subtle top edge
        ctx.globalAlpha=a*.75;ctx.fillStyle="#000";ctx.fillRect(0,barY-4,sw,barH+12);
        ctx.globalAlpha=a*.08;ctx.fillStyle="#ffd866";ctx.fillRect(0,barY-5,sw,1);// golden edge line
        ctx.globalAlpha=a*.9;ctx.fillStyle="#d0ccc4";ctx.font="13px 'Courier New',monospace";ctx.textAlign="left";
        const mxW=sw-34,disp=G.narr.text.substring(0,G.narr.ci),words=disp.split(" ");let line="",ly=barY+12;
        for(const w of words){const t2=line+w+" ";if(ctx.measureText(t2).width>mxW){ctx.fillText(line,16,ly);ly+=17;line=w+" "}else line=t2}
        ctx.fillText(line,16,ly);
        if(!G.narr.done&&Math.sin(G.time*6)>0){ctx.fillStyle="#ffd866";ctx.fillRect(16+ctx.measureText(line).width+2,ly-10,1.5,12)}
        if(G.narr.done){ctx.globalAlpha=a*.15;ctx.font="8px monospace";ctx.textAlign="right";ctx.fillText("tap",sw-16,barY+barH)}ctx.globalAlpha=1}}

    // Save indicator
    if(G.time-saving<1.5){ctx.globalAlpha=(1-(G.time-saving)/1.5)*.18;ctx.fillStyle="#888";ctx.font="7px monospace";ctx.textAlign="right";ctx.fillText("✓",sw-8,sh-4);ctx.globalAlpha=1}

    // Fade in
    if(G.fadeIn<1){ctx.fillStyle=`rgba(0,0,0,${1-G.fadeIn})`;ctx.fillRect(0,0,sw,sh)}
    if(!G.intr)joy.draw(ctx);

    // Auto-save
    savT+=dt*.016;if(savT>90){savT=0;saving=G.time;save(G)}
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
