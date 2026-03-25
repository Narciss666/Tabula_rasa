// ═══ TABULA RASA V38 — Phaser 3 ═══
"use strict";
var world=new World();
var G={px:CS/2+1,py:CS/2+1,facing:0,time:0,dayT:.35,inv:[],objs:[],npcs:[],nc:{},arcs:[],skills:[],gauges:{},intents:[],choiceLog:[],choices:null,ni:0,dw:0,tv:{},mood:null,wth:"clear",mortal:false,mortalAsked:{},invOpen:false,invSel:0,menuOpen:false,nearPoi:null,busy:false,mounted:null,mountSpd:0,intr:null,room:null,lpi:null,lastIT:0,swimT:0};
function save(){try{localStorage.setItem("tr_save",JSON.stringify({px:G.px,py:G.py,dayT:G.dayT,inv:G.inv,objs:G.objs,nc:G.nc,arcs:G.arcs,skills:G.skills,gauges:G.gauges,intents:G.intents,choiceLog:G.choiceLog,ni:G.ni,dw:G.dw,mood:G.mood,wth:G.wth,mortal:G.mortal,mortalAsked:G.mortalAsked,worldMods:world.mods}))}catch(e){}}
function load(){try{return JSON.parse(localStorage.getItem("tr_save"))}catch(e){return null}}
var sv=load();if(sv){G.px=sv.px||G.px;G.py=sv.py||G.py;G.dayT=sv.dayT||G.dayT;G.inv=sv.inv||[];G.objs=sv.objs||[];G.nc=sv.nc||{};G.arcs=sv.arcs||[];G.skills=sv.skills||[];G.gauges=sv.gauges||{};G.intents=sv.intents||[];G.choiceLog=sv.choiceLog||[];G.ni=sv.ni||0;G.dw=sv.dw||0;G.mood=sv.mood;G.wth=sv.wth||"clear";G.mortal=sv.mortal||false;G.mortalAsked=sv.mortalAsked||{};if(sv.worldMods)world.mods=sv.worldMods}
var API_KEY="sk-ant-api03-dJFfnKk8gGOeOP2FXDMNpDcS0s5e0hKrsDUN7AfWz_T5tNM7BjZaUuWtjKh_WT5gplKfO_bQe9JNVFP1P-a_Iw-JIJ0UQAA";
var DSYS='Tu es le Directeur de Tabula Rasa. Rien n\'existe tant que le joueur ne le fait pas exister. STYLE: 1-2 phrases FR sensorielles. Propose 2-4 choix concrets (max 6 mots). JSON:{"narrative":"","choices":[],"gauges_create":[],"gauges_update":{},"skills_unlock":[],"intent_observed":"","weather":null}';
function getCurBio(){return world.gc(Math.floor(G.px/CH),Math.floor(G.py/CH)).bio||""}
function callDir(action,cb){var inv=G.inv.length?G.inv.map(function(o){return o.desc}).join(","):"rien";fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:300,system:DSYS,messages:[{role:"user",content:action+"\nBIOME:"+getCurBio()+"|INV:"+inv+"|COMP:"+G.skills.join(",")}]})}).then(function(r){return r.json()}).then(function(d){try{var t=d.content[0].text;cb(JSON.parse(t.substring(t.indexOf("{"))))}catch(e){cb(null)}}).catch(function(){cb(null)})}

var gfx,uiCont,joyActive=false,joyX=0,joyY=0,joyPtr=null,joyR=42,joyBase,btnBase,btnR=28;
var narrLabel,bioLabel,invLabels=[],choiceLabels=[],gaugeLabels=[],skillLabels=[],choiceRects=null;
var narrTimer=0,textPool=[],textIdx=0;

var game=new Phaser.Game({type:Phaser.AUTO,width:window.innerWidth,height:window.innerHeight,backgroundColor:"#060610",scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},input:{activePointers:3},render:{antialias:false,pixelArt:true},scene:{preload:function(){},create:createGame,update:updateGame}});
var sc;

function createGame(){
  sc=this;gfx=this.add.graphics();
  var sw=this.scale.width,sh=this.scale.height;
  joyBase={x:75,y:sh-100};btnBase={x:sw-60,y:sh-80};
  this.audioInited=false;

  // UI container (fixed to camera)
  uiCont=this.add.container(0,0).setScrollFactor(0).setDepth(1000);
  
  // Narrative
  narrLabel=this.add.text(20,sh-120,"",{fontSize:"12px",fontFamily:"'Courier New',monospace",color:"#d0ccc0",wordWrap:{width:sw-40},lineSpacing:3}).setAlpha(0);
  uiCont.add(narrLabel);

  // Biome label
  bioLabel=this.add.text(sw/2,sh*.15,"",{fontSize:"11px",fontFamily:"monospace",color:"#a09888",align:"center"}).setOrigin(.5,0).setAlpha(0);
  uiCont.add(bioLabel);

  // Keyboard
  this.cursors=this.input.keyboard.createCursorKeys();
  this.kW=this.input.keyboard.addKey("W");this.kA=this.input.keyboard.addKey("A");
  this.kS=this.input.keyboard.addKey("S");this.kD=this.input.keyboard.addKey("D");
  this.kE=this.input.keyboard.addKey("E");this.kI=this.input.keyboard.addKey("I");
  this.kESC=this.input.keyboard.addKey("ESC");this.kSPACE=this.input.keyboard.addKey("SPACE");
  this.kB=this.input.keyboard.addKey("B");
  this.k1=this.input.keyboard.addKey("ONE");this.k2=this.input.keyboard.addKey("TWO");
  this.k3=this.input.keyboard.addKey("THREE");this.k4=this.input.keyboard.addKey("FOUR");

  // Touch
  var self=this;
  this.input.on("pointerdown",function(ptr){
    if(!sc.audioInited){sc.audioInited=true;initAudio();loadAllAudio()}
    var sw2=self.scale.width,sh2=self.scale.height;
    // Menu close
    if(G.menuOpen){G.menuOpen=false;return}
    // Choice taps (including mortality)
    if(G.choices&&choiceRects){for(var i=0;i<choiceRects.length;i++){var cr=choiceRects[i];if(ptr.x>=cr.x&&ptr.x<=cr.x+cr.w&&ptr.y>=cr.y&&ptr.y<=cr.y+cr.h){
      if(G._mortalCause){var cause=G._mortalCause;G._mortalCause=null;if(i===0){G.mortal=true;showNarr("La fragilité entre dans le monde.");setTimeout(function(){doDeath(cause)},2000)}else{showNarr("Le corps résiste.");for(var gk in G.gauges)if(G.gauges[gk].val<=0)G.gauges[gk].val=10}G.choices=null;save();return}
      pickChoice(i);return}}}
    // Inventory panel
    if(G.invOpen&&G.inv.length>0){
      var iw2=Math.min(sw2*.75,240),ih2=Math.min(sh2*.6,G.inv.length*26+90),ix2=(sw2-iw2)/2,iy2=(sh2-ih2)/2;
      // Item taps
      for(var ii=0;ii<G.inv.length;ii++){var ity=iy2+24+ii*26;if(ptr.x>ix2&&ptr.x<ix2+iw2&&ptr.y>ity&&ptr.y<ity+24){G.invSel=ii;return}}
      // Action button row
      var abY=iy2+24+G.inv.length*26+8;var acts=craftSel>=0?["Annuler","","","Combiner"]:["Utiliser","Combiner","Poser",""];
      var actKeys=craftSel>=0?["cancel","","","craft"]:["use","combine","drop",""];
      var abW=(iw2-8)/4;
      for(var ai=0;ai<4;ai++){if(!actKeys[ai])continue;var ax=ix2+4+ai*abW;if(ptr.x>=ax&&ptr.x<=ax+abW&&ptr.y>=abY&&ptr.y<=abY+24){invAction(actKeys[ai]);return}}
      // Tap outside = close
      if(ptr.x<ix2||ptr.x>ix2+iw2||ptr.y<iy2||ptr.y>iy2+ih2){G.invOpen=false;craftSel=-1;return}
      return}
    // Menu hamburger
    if(ptr.x>sw2-50&&ptr.y<40){G.menuOpen=!G.menuOpen;return}
    // Inventory icon
    if(ptr.x<50&&ptr.y<40&&G.inv.length>0){G.invOpen=!G.invOpen;G.invSel=0;return}
    // Dismiss narrative
    if(narrTimer>0&&ptr.y>sh2-140){narrTimer=0;return}
    // Joystick
    if(ptr.x<sw2*.45&&ptr.y>sh2*.5){joyActive=true;joyPtr=ptr.id;joyBase={x:ptr.x,y:ptr.y};return}
    // Interact button
    var bdx=ptr.x-btnBase.x,bdy=ptr.y-btnBase.y;
    if(Math.sqrt(bdx*bdx+bdy*bdy)<btnR*2){doInteract();return}
  });
  this.input.on("pointermove",function(ptr){if(joyActive&&ptr.id===joyPtr){var dx=ptr.x-joyBase.x,dy=ptr.y-joyBase.y;var d=Math.sqrt(dx*dx+dy*dy);if(d>joyR){dx=dx/d*joyR;dy=dy/d*joyR}joyX=dx/joyR;joyY=dy/joyR}});
  this.input.on("pointerup",function(ptr){if(ptr.id===joyPtr){joyActive=false;joyX=0;joyY=0;joyPtr=null}});
  this.scale.on("resize",function(sz){btnBase={x:sz.width-60,y:sz.height-80};narrLabel.setWordWrapWidth(sz.width-40);narrLabel.setPosition(20,sz.height-120)});
  this.lastBio="";this.bioT=0;
}

function updateGame(time,delta){
  var dt=delta/16.67;G.time=time/1000;
  var sw=this.scale.width,sh=this.scale.height;
  G.dayT=(G.dayT+.00001*dt)%1;var hr=G.dayT*24;
  var dL=hr<5?.15:hr<7?.15+(hr-5)/2*.85:hr>20?1-(hr-20)/4*.85:hr>19?1-(hr-19)*.15:1;
  this.cameras.main.setBackgroundColor(Phaser.Display.Color.GetColor((6+dL*4)|0,(6+dL*10)|0,(16+dL*8)|0));
  var m=.5+dL*.5;

  // INPUT
  var mx=0,my=0;
  if(!G.invOpen&&!G.menuOpen){
    if(this.kW.isDown||this.cursors.up.isDown){mx--;my--}
    if(this.kS.isDown||this.cursors.down.isDown){mx++;my++}
    if(this.kA.isDown||this.cursors.left.isDown){mx--;my++}
    if(this.kD.isDown||this.cursors.right.isDown){mx++;my--}
    if(joyActive&&(Math.abs(joyX)>.12||Math.abs(joyY)>.12)){mx+=(joyX+joyY)*.7;my+=(-joyX+joyY)*.7}
  }
  if(Phaser.Input.Keyboard.JustDown(this.kI)){G.invOpen=!G.invOpen;G.invSel=0}
  if(Phaser.Input.Keyboard.JustDown(this.kE)||Phaser.Input.Keyboard.JustDown(this.kSPACE))doInteract();
  if(Phaser.Input.Keyboard.JustDown(this.kB))tryBuild();
  if(Phaser.Input.Keyboard.JustDown(this.kESC)){if(G.menuOpen)G.menuOpen=false;else if(G.invOpen)G.invOpen=false;else G.menuOpen=true}
  if(G.choices){if(Phaser.Input.Keyboard.JustDown(this.k1))pickChoice(0);if(Phaser.Input.Keyboard.JustDown(this.k2))pickChoice(1);if(Phaser.Input.Keyboard.JustDown(this.k3))pickChoice(2);if(Phaser.Input.Keyboard.JustDown(this.k4))pickChoice(3)}

  // MOVEMENT
  var moving=mx!==0||my!==0;
  if(moving){var spd=SPD,ln=Math.sqrt(mx*mx+my*my),dx2=mx/ln*spd*dt,dy2=my/ln*spd*dt;
    var cT=world.tile(Math.floor(G.px),Math.floor(G.py));if(cT===8){dx2*=.35;dy2*=.35}
    var nT=world.tile(Math.floor(G.px+dx2),Math.floor(G.py+dy2));
    if(nT!==3){G.px+=dx2;G.py+=dy2}else{if(world.tile(Math.floor(G.px+dx2),Math.floor(G.py))!==3)G.px+=dx2;if(world.tile(Math.floor(G.px),Math.floor(G.py+dy2))!==3)G.py+=dy2}
    G.dw+=spd*dt;G.tv[(G.px|0)+","+(G.py|0)]=1;
    if(mx>0&&my>0)G.facing=0;else if(mx>0&&my<0)G.facing=3;else if(mx<0&&my>0)G.facing=1;else if(mx<0)G.facing=2}

  // NEAREST POI
  G.nearPoi=null;var nd=IR,vis=world.vis(G.px,G.py);
  for(var ci=0;ci<vis.length;ci++)for(var pi=0;pi<vis[ci].poi.length;pi++){var p2=vis[ci].poi[pi];var d2=Math.sqrt((p2.x-G.px)*(p2.x-G.px)+(p2.y-G.py)*(p2.y-G.py));if(d2<nd){nd=d2;G.nearPoi=p2}}

  // BIOME
  var bio=getCurBio();if(bio&&bio!==this.lastBio){this.lastBio=bio;this.bioT=G.time;bioLabel.setText(BIOME_NAMES[bio]||"").setPosition(sw/2,sh*.15)}
  var ba=G.time-this.bioT;bioLabel.setAlpha(ba<1?ba*.3:ba>4?Math.max(0,(5-ba)*.3):.3);

  // ANIMAL AI
  for(var ci2=0;ci2<vis.length;ci2++){var ch2=vis[ci2];for(var ai2=0;ai2<ch2.props.length;ai2++){var an=ch2.props[ai2];if(!an.isAnimal||an.ai==="dead")continue;var adx=G.px-an.x,ady=G.py-an.y,adist=Math.sqrt(adx*adx+ady*ady);an.aiT=(an.aiT||0)+dt*.016;if(an.ai==="flee"){an.fleeT-=dt*.016;if(an.fleeT<=0){an.ai="idle";an.vx=0;an.vy=0}else{var fln=Math.sqrt(an.vx*an.vx+an.vy*an.vy)||1;an.x+=an.vx/fln*an.spd*dt*2;an.y+=an.vy/fln*an.spd*dt*2}}else{if(adist<an.shyDist&&moving){an.ai="flee";an.fleeT=1.5+Math.random();an.vx=-adx;an.vy=-ady}else if(an.aiT>3+Math.random()*8){an.aiT=0;an.vx=(Math.random()-.5);an.vy=(Math.random()-.5)}var wln=Math.sqrt(an.vx*an.vx+an.vy*an.vy)||1;if(wln>.1){var anx=an.x+an.vx/wln*an.spd*dt*.3,any=an.y+an.vy/wln*an.spd*dt*.3;var ant=world.tile(Math.floor(anx),Math.floor(any));if(ant!==8&&ant!==3)an.x=anx,an.y=any;else an.vx=-an.vx,an.vy=-an.vy}}for(var pk=0;pk<ch2.poi.length;pk++)if(ch2.poi[pk].tp==="animal"&&ch2.poi[pk].aIdx===ai2){ch2.poi[pk].x=an.x;ch2.poi[pk].y=an.y}}}

  // CAMERA
  var camT=iso(G.px,G.py);this.cameras.main.scrollX+=(camT.sx-sw/2-this.cameras.main.scrollX)*.08*dt;this.cameras.main.scrollY+=(camT.sy-sh/2-this.cameras.main.scrollY)*.08*dt;
  var camX=this.cameras.main.scrollX,camY=this.cameras.main.scrollY;

  // ═══ RENDER ═══
  gfx.clear();
  var vL=camX-80,vR=camX+sw+80,vT=camY-80,vB=camY+sh+120;
  for(var ci3=0;ci3<vis.length;ci3++){var ch3=vis[ci3];
    for(var ly=0;ly<CH;ly++)for(var lx=0;lx<CH;lx++){var gx=ch3.cx*CH+lx,gy=ch3.cy*CH+ly,tile=world.tile(gx,gy);if(!tile)continue;var tp=iso(gx,gy);if(tp.sx<vL||tp.sx>vR||tp.sy<vT||tp.sy>vB)continue;var col=TILE_COLORS[tile]||0x202020;if(BIOME_TINTS[ch3.bio]&&BIOME_TINTS[ch3.bio][tile])col=BIOME_TINTS[ch3.bio][tile];var r=((col>>16)&0xff)*m|0,g=((col>>8)&0xff)*m|0,b=(col&0xff)*m|0;gfx.fillStyle((r<<16)|(g<<8)|b,1);gfx.fillTriangle(tp.sx,tp.sy-TH,tp.sx+TW,tp.sy,tp.sx,tp.sy+TH);gfx.fillTriangle(tp.sx,tp.sy-TH,tp.sx-TW,tp.sy,tp.sx,tp.sy+TH);if(tile===8){gfx.fillStyle(0x3060a0,.04+Math.sin(G.time*2+gx*.7+gy*.5)*.02);gfx.fillTriangle(tp.sx,tp.sy-TH,tp.sx+TW,tp.sy,tp.sx,tp.sy+TH);gfx.fillTriangle(tp.sx,tp.sy-TH,tp.sx-TW,tp.sy,tp.sx,tp.sy+TH)}}
    // Buildings
    for(var bi=0;bi<ch3.bl.length;bi++){var bl=ch3.bl[bi],tl=iso(bl.x,bl.y),tr=iso(bl.x+bl.w,bl.y),bl2=iso(bl.x,bl.y+bl.d),fr=iso(bl.x+bl.w,bl.y+bl.d);if(fr.sx<vL-60||tl.sx>vR+60)continue;var h=bl.h*(TH/15);var sc2=bl.rural?[90,70,45]:DST[bl.di]||[70,70,80];var fr2=(sc2[0]*m|0),fg=(sc2[1]*m|0),fb=(sc2[2]*m|0);gfx.fillStyle((fr2<<16)|(fg<<8)|fb,1);gfx.fillTriangle(tl.sx,tl.sy-h,tr.sx,tr.sy-h,fr.sx,fr.sy-h);gfx.fillTriangle(tl.sx,tl.sy-h,bl2.sx,bl2.sy-h,fr.sx,fr.sy-h);var dr=(fr2*.7|0),dg=(fg*.7|0),db=(fb*.7|0);gfx.fillStyle((dr<<16)|(dg<<8)|db,1);gfx.beginPath();gfx.moveTo(fr.sx,fr.sy-h);gfx.lineTo(tr.sx,tr.sy-h);gfx.lineTo(tr.sx,tr.sy);gfx.lineTo(fr.sx,fr.sy);gfx.closePath();gfx.fillPath();gfx.fillStyle((dr*.8|0)<<16|(dg*.8|0)<<8|(db*.8|0),1);gfx.beginPath();gfx.moveTo(fr.sx,fr.sy-h);gfx.lineTo(bl2.sx,bl2.sy-h);gfx.lineTo(bl2.sx,bl2.sy);gfx.lineTo(fr.sx,fr.sy);gfx.closePath();gfx.fillPath();if(dL<.65){gfx.fillStyle(0xffc040,(.65-dL)*1.2);for(var wy=0;wy<bl.flr&&wy<5;wy++){var wyp=fr.sy-h+(wy+.3)*h/Math.max(1,bl.flr);if(H(bl.x+wy,bl.y)%3!==0){gfx.fillRect(fr.sx-4,wyp,2,2);gfx.fillRect(fr.sx-8,wyp,2,2)}}}}
    // Trees
    for(var ti=0;ti<ch3.trees.length;ti++){var t2=ch3.trees[ti],tp2=iso(t2.x+.5,t2.y+.5);if(tp2.sx<vL||tp2.sx>vR||tp2.sy<vT||tp2.sy>vB)continue;gfx.fillStyle(tc(60,42,25,m),1);gfx.fillRect(tp2.sx-1,tp2.sy-8,2,8);var cg=ch3.bio==="jungle"?70:ch3.bio==="snow"||ch3.bio==="tundra"?80:58;gfx.fillStyle(tc(ch3.bio==="jungle"?25:30,cg,22,m),1);gfx.fillCircle(tp2.sx,tp2.sy-12,5);gfx.fillCircle(tp2.sx-2,tp2.sy-10,4);gfx.fillCircle(tp2.sx+2,tp2.sy-10,4)}
    // Props
    for(var pi2=0;pi2<ch3.props.length;pi2++){var pr=ch3.props[pi2];if(pr.ai==="dead")continue;var pp=iso(pr.x,pr.y);if(pp.sx<vL||pp.sx>vR||pp.sy<vT||pp.sy>vB)continue;dProp(gfx,pr,pp,m,G.time)}}

  // PLAYER
  var pP=iso(G.px,G.py),inW=world.tile(Math.floor(G.px),Math.floor(G.py))===8,bob=moving?Math.abs(Math.sin(G.time*8))*2:0,leg=moving?Math.sin(G.time*10)*2:0,arm=moving?Math.sin(G.time*10+1)*1.5:0;
  if(inW){gfx.fillStyle(0x2040a0,.35);gfx.fillEllipse(pP.sx,pP.sy,16,6);gfx.fillStyle(0x343640,1);gfx.fillRect(pP.sx-3,pP.sy-14-bob,6,8);gfx.fillStyle(0xc8beb4,1);gfx.fillCircle(pP.sx,pP.sy-16-bob,3)
  }else{gfx.fillStyle(0,0.12);gfx.fillEllipse(pP.sx,pP.sy+1,8,3);gfx.lineStyle(1.5,0x222230,1);gfx.lineBetween(pP.sx-1,pP.sy-6-bob,pP.sx-2-leg,pP.sy);gfx.lineBetween(pP.sx+1,pP.sy-6-bob,pP.sx+2+leg,pP.sy);gfx.fillStyle(0x343640,1);gfx.fillRect(pP.sx-3,pP.sy-15-bob,6,9);gfx.lineStyle(1.2,0x343640,1);gfx.lineBetween(pP.sx-3,pP.sy-13-bob,pP.sx-5-arm,pP.sy-8-bob);gfx.lineBetween(pP.sx+3,pP.sy-13-bob,pP.sx+5+arm,pP.sy-8-bob);gfx.fillStyle(0xc8beb4,1);gfx.fillCircle(pP.sx,pP.sy-18-bob,3);gfx.fillStyle(0x222028,1);gfx.fillCircle(pP.sx,pP.sy-19-bob,3);gfx.fillStyle(0xa8b8cc,.03);gfx.fillCircle(pP.sx,pP.sy-10,20)}

  // ═══ UI (screen-fixed) ═══
  // Use Phaser text objects for all UI — they render reliably on mobile
  // Clean old pooled texts
  for(var i=textPool.length-1;i>=0;i--)textPool[i].setAlpha(0);textIdx=0;

  // Joystick
  gfx.lineStyle(0);// reset
  if(joyActive){pTxt("",joyBase.x,joyBase.y,1,1);/* drawn via gfx below */}
  // Draw joystick on a separate fixed graphics — we'll use the world gfx with screen coords
  // Actually we need screen-space drawing. Use a trick: offset by camera scroll
  var ox=camX,oy=camY;
  if(joyActive){gfx.fillStyle(0x333355,.2);gfx.fillCircle(joyBase.x+ox,joyBase.y+oy,joyR);gfx.lineStyle(1.5,0x555577,.3);gfx.strokeCircle(joyBase.x+ox,joyBase.y+oy,joyR);gfx.fillStyle(0x8888bb,.35);gfx.fillCircle(joyBase.x+joyX*joyR+ox,joyBase.y+joyY*joyR+oy,16)}
  else{gfx.fillStyle(0x444466,.06);gfx.fillCircle(75+ox,(sh-100)+oy,30);gfx.lineStyle(.5,0x555577,.1);gfx.strokeCircle(75+ox,(sh-100)+oy,30)}

  // Interact button
  var hasN=!!G.nearPoi,pulse=hasN?.5+Math.sin(G.time*3)*.15:.08;
  gfx.fillStyle(hasN?0xffd866:0x444444,pulse);gfx.fillCircle(btnBase.x+ox,btnBase.y+oy,hasN?btnR:btnR-4);
  gfx.lineStyle(1.5,hasN?0xffcc44:0x555555,hasN?.5:.12);gfx.strokeCircle(btnBase.x+ox,btnBase.y+oy,hasN?btnR:btnR-4);

  // Button label
  pTxt(hasN?"?":"·",btnBase.x-3,btnBase.y-5,hasN?14:12,hasN?.8:.3);

  // Near POI label
  if(G.nearPoi)pTxt(G.nearPoi.desc||G.nearPoi.tp,btnBase.x-30,btnBase.y+btnR+8,8,.35);

  // Inventory count
  if(G.inv.length>0){gfx.fillStyle(0xc8c0b4,.3);gfx.fillRect(10+ox,10+oy,28,20);pTxt(G.inv.length+"",18,18,10,.5)}

  // Menu hamburger
  gfx.fillStyle(0xc8c0b4,.2);gfx.fillRect(sw-32+ox,12+oy,16,2);gfx.fillRect(sw-32+ox,17+oy,16,2);gfx.fillRect(sw-32+ox,22+oy,16,2);

  // Gauges
  var gy2=38;for(var gk in G.gauges){var gv=G.gauges[gk],pct=Math.max(0,gv.val/gv.max);gfx.fillStyle(0x222233,.35);gfx.fillRect(10+ox,gy2+oy,60,6);gfx.fillStyle(pct>.5?0x508040:pct>.2?0xa09030:0xa03030,.5);gfx.fillRect(10+ox,gy2+oy,60*pct,6);pTxt(gk,12,gy2+5,6,.25);gy2+=10}

  // Skills
  for(var si=0;si<Math.min(G.skills.length,5);si++)pTxt(G.skills[si],sw-70,32+si*10,7,.2);

  // Mortal
  if(G.mortal)pTxt("mortel",sw-50,sh-12,8,.12+Math.sin(G.time*.5)*.04);

  // Narrative
  if(narrTimer>0){narrTimer-=dt*.016;var na=Math.min(1,narrTimer/.5);narrLabel.setAlpha(na*.7);gfx.fillStyle(0x060610,.5*na);gfx.fillRect(ox,sh-140+oy,sw,140)}else narrLabel.setAlpha(0);

  // Choices
  choiceRects=null;
  if(G.choices&&G.choices.length>=2){choiceRects=[];var cw2=Math.min(sw*.85,280),cy2=sh*.5;gfx.fillStyle(0x0c0c14,.85);gfx.fillRect((sw-cw2)/2+ox,cy2-10+oy,cw2,G.choices.length*36+20);for(var ci4=0;ci4<G.choices.length;ci4++){var cx2=(sw-cw2)/2+8,ccy=cy2+ci4*36;gfx.fillStyle(0xc8c0a0,.06);gfx.fillRect(cx2+ox,ccy+oy,cw2-16,30);gfx.lineStyle(.5,0xc8c0a0,.12);gfx.strokeRect(cx2+ox,ccy+oy,cw2-16,30);pTxt((ci4+1)+". "+G.choices[ci4],cx2+8,ccy+16,9,.6);choiceRects.push({x:cx2,y:ccy,w:cw2-16,h:30})}}

  // Inventory panel
  if(G.invOpen&&G.inv.length>0){var iw=Math.min(sw*.75,240),ih=Math.min(sh*.6,G.inv.length*26+90),ix=(sw-iw)/2,iy=(sh-ih)/2;gfx.fillStyle(0x0c0c14,.9);gfx.fillRect(ix+ox,iy+oy,iw,ih);gfx.lineStyle(.5,0xc8c0a0,.15);gfx.strokeRect(ix+ox,iy+oy,iw,ih);pTxt(craftSel>=0?"COMBINER":"INVENTAIRE",sw/2-30,iy+12,10,.5);for(var ii=0;ii<G.inv.length;ii++){if(ii===G.invSel){gfx.fillStyle(0xffd866,.08);gfx.fillRect(ix+4+ox,iy+24+ii*26+oy,iw-8,24)}if(ii===craftSel){gfx.fillStyle(0x66ff66,.06);gfx.fillRect(ix+4+ox,iy+24+ii*26+oy,iw-8,24)}pTxt((G.inv[ii].glyph||"·")+" "+G.inv[ii].desc,ix+10,iy+38+ii*26,9,ii===G.invSel?.7:.4)}
    // Action buttons
    var abY=iy+24+G.inv.length*26+8;var acts=craftSel>=0?["Annuler","","","Combiner"]:["Utiliser","Combiner","Poser",""];var abW=(iw-8)/4;
    for(var ai=0;ai<4;ai++){if(!acts[ai])continue;var ax=ix+4+ai*abW;gfx.fillStyle(0xc8c0a0,.06);gfx.fillRect(ax+ox,abY+oy,abW-2,22);gfx.lineStyle(.3,0xc8c0a0,.12);gfx.strokeRect(ax+ox,abY+oy,abW-2,22);pTxt(acts[ai],ax+abW/2-12,abY+13,7,.5)}}

  // Menu
  if(G.menuOpen){gfx.fillStyle(0,0.75);gfx.fillRect(ox,oy,sw,sh);pTxt("TABULA RASA",sw/2-35,sh/2-40,14,.6);pTxt(G.skills.length+" compétences | "+G.inv.length+" objets",sw/2-60,sh/2-20,8,.3);pTxt("Tap pour fermer",sw/2-30,sh/2+10,9,.2)}

  // Gauge decay
  if(G.gauges.faim)G.gauges.faim.val=Math.max(0,G.gauges.faim.val-dt*.0008);
  if(G.gauges.soif)G.gauges.soif.val=Math.max(0,G.gauges.soif.val-dt*.001);
  // Swimming
  var curTile3=world.tile(Math.floor(G.px),Math.floor(G.py));
  if(curTile3===8){G.swimT=(G.swimT||0)+dt*.016;if(G.swimT>10&&G.skills.indexOf("nage")<0){G.skills.push("nage");showNarr("Nage débloquée.")}if(G.skills.indexOf("nage")<0&&G.swimT>5)doDeath("noyade")}else G.swimT=0;
  // Environmental damage
  envDamage(dt*.016,bio,dL);
  // Audio
  updateAudio();
  // Weather
  drawWeather(gfx,sw,sh,camX,camY);
  if(Math.floor(G.time)%10===0)save();
}

// Text pool
function pTxt(txt,x,y,sz,alpha){
  if(textIdx>=textPool.length){var t=sc.add.text(0,0,"",{fontSize:sz+"px",fontFamily:"monospace",color:"#c8c0b4"}).setScrollFactor(0).setDepth(1001);textPool.push(t)}
  var t=textPool[textIdx++];t.setText(txt).setPosition(x,y).setFontSize(sz).setAlpha(alpha||.5);return t;
}

function tc(r,g,b,m){return((r*m|0)<<16)|((g*m|0)<<8)|(b*m|0)}

// PROPS
function dProp(g,pr,p,m,t){if(pr.tp==="rock"){g.fillStyle(tc(65,62,58,m),1);g.fillCircle(p.sx,p.sy-2,3);g.fillCircle(p.sx+2,p.sy-1,2)}else if(pr.tp==="flower"){g.fillStyle(0x306010,m);g.fillRect(p.sx,p.sy-4,1,4);g.fillStyle([0xdd4466,0xeeaa33,0x8844cc,0xee6688][(p.sx*7+p.sy*13)&3],m*.8);g.fillCircle(p.sx,p.sy-5,2)}else if(pr.tp==="mush"){g.fillStyle(tc(55,42,28,m),1);g.fillRect(p.sx,p.sy-3,1,3);g.fillStyle(tc(140,45,35,m),1);g.fillEllipse(p.sx,p.sy-4,5,3)}else if(pr.tp==="berry"){g.fillStyle(tc(30,65,20,m),1);g.fillEllipse(p.sx,p.sy-3,6,4);g.fillStyle(tc(160,30,40,m),1);g.fillCircle(p.sx-1,p.sy-3,1);g.fillCircle(p.sx+1,p.sy-4,1)}else if(pr.tp==="cactus"){g.fillStyle(tc(35,70,28,m),1);g.fillRect(p.sx-1,p.sy-10,2,10);g.fillRect(p.sx-4,p.sy-7,3,2);g.fillRect(p.sx+2,p.sy-5,3,2)}else if(pr.tp==="stick"){g.lineStyle(1,tc(65,45,25,m),1);g.lineBetween(p.sx-4,p.sy,p.sx+3,p.sy-2)}else if(pr.tp==="reed"){g.lineStyle(.6,tc(45,55,30,m),1);g.lineBetween(p.sx,p.sy,p.sx-1,p.sy-8);g.lineBetween(p.sx+2,p.sy,p.sx+1,p.sy-6)}else if(pr.tp==="shell"){g.fillStyle(tc(190,170,140,m),1);g.fillEllipse(p.sx,p.sy,3,2)}else if(pr.tp==="skull"){g.fillStyle(tc(180,175,160,m),1);g.fillEllipse(p.sx,p.sy-1,3,2.5)}else if(pr.tp==="snowpile"){g.fillStyle(tc(200,205,215,m),1);g.fillEllipse(p.sx,p.sy,5,2.5)}else if(pr.tp==="vine"){g.lineStyle(.8,tc(30,80,25,m),1);g.lineBetween(p.sx,p.sy,p.sx-1,p.sy-10)}else if(pr.tp==="clay"){g.fillStyle(tc(95,65,40,m),1);g.fillEllipse(p.sx,p.sy-1,4,2.5)}else if(pr.tp==="obsidian"){g.fillStyle(tc(20,20,25,m),1);g.beginPath();g.moveTo(p.sx,p.sy-7);g.lineTo(p.sx+3,p.sy);g.lineTo(p.sx-3,p.sy);g.closePath();g.fillPath()}else if(pr.tp==="termite"){g.fillStyle(tc(85,65,40,m),1);g.beginPath();g.moveTo(p.sx-2,p.sy);g.lineTo(p.sx,p.sy-8);g.lineTo(p.sx+2,p.sy);g.closePath();g.fillPath()}else if(pr.tp==="pillar"){g.fillStyle(tc(70,68,62,m),1);g.fillRect(p.sx-2,p.sy-14,4,14)}else if(pr.tp==="wall"){g.fillStyle(tc(60,58,52,m),1);g.fillRect(p.sx-3,p.sy-8,6,8)}else if(pr.tp==="campfire"){g.fillStyle(0x222218,.3*m);g.fillEllipse(p.sx,p.sy,6,3)}else if(pr.tp==="scarecrow"){g.fillStyle(tc(80,60,35,m),1);g.fillRect(p.sx,p.sy-12,1,12);g.fillRect(p.sx-4,p.sy-10,8,1)}else if(pr.isAnimal){var ac={bird:0x705030,deer:0x906838,rabbit:0x908068,frog:0x308028,parrot:0x28b032,snake:0x3c5a28,gazelle:0xb49664,wolf:0x504b46,horse:0x6e5032,eagle:0x372818,cow:0x8a7a6a,chicken:0xc8b488}[pr.tp]||0x666666;var ar=((ac>>16)&0xff)*m|0,ag=((ac>>8)&0xff)*m|0,ab=(ac&0xff)*m|0,acol=(ar<<16)|(ag<<8)|ab;if(pr.tp==="bird"||pr.tp==="parrot"||pr.tp==="eagle"){g.fillStyle(acol,1);g.fillEllipse(p.sx,p.sy-3,4,2)}else if(pr.tp==="frog"){g.fillStyle(acol,1);g.fillEllipse(p.sx,p.sy-1,3,2)}else if(pr.tp==="snake"){g.lineStyle(1.5,acol,1);g.lineBetween(p.sx-3,p.sy,p.sx+4,p.sy-1)}else{g.fillStyle(acol,1);g.fillEllipse(p.sx,p.sy-3,5,3);g.fillCircle(p.sx+3,p.sy-4,2);g.lineStyle(.8,tc(ar*.7,ag*.7,ab*.7,1),1);g.lineBetween(p.sx-2,p.sy-1,p.sx-2,p.sy+2);g.lineBetween(p.sx+1,p.sy-1,p.sx+1,p.sy+2)}}}

// INTERACTION
function doInteract(){if(G.busy||G.time-(G.lastIT||0)<1)return;G.lastIT=G.time;var p=G.nearPoi;
  if(!p){if(tryPhysical())return;return}
  if(p.tp==="resource"){G.inv.push({desc:p.desc,glyph:RES_GLYPH[p.rtp]||"·",id:p.id,tags:RES_TAGS[p.rtp]||""});var vs=world.vis(G.px,G.py);for(var i=0;i<vs.length;i++)vs[i].poi=vs[i].poi.filter(function(pp){return pp.id!==p.id});playSfx("sfx_collect");showNarr("Cueilli: "+p.desc);save();return}
  if(p.tp==="fire"){var rawI=-1;for(var i=0;i<G.inv.length;i++)if((G.inv[i].tags||"").indexOf("raw")>=0){rawI=i;break}if(rawI>=0){var raw=G.inv[rawI];var cooked=raw.desc.replace("cru","cuit");G.inv.splice(rawI,1);G.inv.push({desc:cooked,glyph:"🍖",id:"ck"+Date.now().toString(36),tags:"food"});if(G.skills.indexOf("cuisine")<0)G.skills.push("cuisine");playSfx("sfx_craft");showNarr(cooked+".");save();return}showNarr("Les flammes crépitent.");return}
  if(p.tp==="object"){var obj=null;for(var i=0;i<G.objs.length;i++)if(G.objs[i].id===p.id){obj=G.objs[i];break}if(obj&&obj.pickable){G.inv.push({desc:obj.desc,glyph:obj.glyph||"?",id:obj.id});G.objs=G.objs.filter(function(o){return o.id!==p.id});var vs=world.vis(G.px,G.py);for(var i=0;i<vs.length;i++)vs[i].poi=vs[i].poi.filter(function(pp){return pp.id!==p.id});showNarr("Ramassé: "+obj.desc);save();return}}
  G.busy=true;G.ni++;var desc=p.desc||p.tp;var action={door:"Le joueur ouvre une porte.",bench:"Le joueur s'assoit sur un banc.",well:"Le joueur regarde dans le puits.",clearing:"Le joueur examine les cendres.",ruin:"Le joueur touche les pierres.",animal:"Le joueur s'approche d'un "+desc+"."}[p.tp]||"Le joueur interagit avec: "+desc;
  callDir(action,function(r){G.busy=false;if(r){if(r.narrative)showNarr(r.narrative);if(r.choices&&r.choices.length>=2)G.choices=r.choices.slice(0,4);if(r.gauges_create)for(var i=0;i<r.gauges_create.length;i++){var gn=r.gauges_create[i];if(!G.gauges[gn])G.gauges[gn]={val:70,max:100,born:G.time}}if(r.gauges_update)for(var gk in r.gauges_update)if(G.gauges[gk])G.gauges[gk].val=Math.max(0,Math.min(100,G.gauges[gk].val+r.gauges_update[gk]));if(r.skills_unlock)for(var i=0;i<r.skills_unlock.length;i++)if(G.skills.indexOf(r.skills_unlock[i])<0)G.skills.push(r.skills_unlock[i]);if(r.intent_observed)G.intents.push(r.intent_observed);if(r.weather)G.wth=r.weather}else showNarr("...");save()})}

function pickChoice(idx){if(!G.choices||idx>=G.choices.length||G.busy)return;var chosen=G.choices[idx];G.choiceLog.push(chosen);if(G.choiceLog.length>30)G.choiceLog.shift();G.choices=null;G.busy=true;G.ni++;callDir("CHOIX DU JOUEUR: \""+chosen+"\"",function(r){G.busy=false;if(r){if(r.narrative)showNarr(r.narrative);if(r.choices&&r.choices.length>=2)G.choices=r.choices.slice(0,4);if(r.gauges_create)for(var i=0;i<r.gauges_create.length;i++){var gn=r.gauges_create[i];if(!G.gauges[gn])G.gauges[gn]={val:70,max:100,born:G.time}}if(r.gauges_update)for(var gk in r.gauges_update)if(G.gauges[gk])G.gauges[gk].val=Math.max(0,Math.min(100,G.gauges[gk].val+r.gauges_update[gk]));if(r.skills_unlock)for(var i=0;i<r.skills_unlock.length;i++)if(G.skills.indexOf(r.skills_unlock[i])<0)G.skills.push(r.skills_unlock[i])}else showNarr(chosen+".");save()})}
function showNarr(txt){narrTimer=5;narrLabel.setText(txt).setAlpha(.7)}

// ═══ AUDIO SYSTEM ═══
var audioCtx=null,audioMaster=null,audioLoops={},audioSfx={},currentLoop=null,currentLoopKey="";
function initAudio(){
  if(audioCtx)return;
  try{audioCtx=new(window.AudioContext||window.webkitAudioContext)();audioMaster=audioCtx.createGain();audioMaster.gain.value=0.15;audioMaster.connect(audioCtx.destination)}catch(e){}
}
function loadAudio(key,url,isLoop){
  if(!audioCtx)return;
  var xhr=new XMLHttpRequest();xhr.open("GET",url,true);xhr.responseType="arraybuffer";
  xhr.onload=function(){if(xhr.status===200)audioCtx.decodeAudioData(xhr.response,function(buf){if(isLoop)audioLoops[key]=buf;else audioSfx[key]=buf})};
  xhr.send();
}
function playLoop(key){
  if(!audioCtx||!audioLoops[key]||currentLoopKey===key)return;
  if(currentLoop){try{currentLoop.stop()}catch(e){}}
  currentLoop=audioCtx.createBufferSource();currentLoop.buffer=audioLoops[key];currentLoop.loop=true;
  var g=audioCtx.createGain();g.gain.value=0.08;currentLoop.connect(g);g.connect(audioMaster);
  currentLoop.start();currentLoopKey=key;
}
function playSfx(key){
  if(!audioCtx||!audioSfx[key])return;
  var s=audioCtx.createBufferSource();s.buffer=audioSfx[key];
  var g=audioCtx.createGain();g.gain.value=0.12;s.connect(g);g.connect(audioMaster);s.start();
}
function loadAllAudio(){
  var loops=["city","nature","rain","wind","desert","snow","storm","night","jungle","farm","canyon","lake","tundra","ruins","savanna","glacier","volcanic","meadow","forest_deep","city_night","underwater","dawn","indoor2","heights","dusk","coast2","swamp2"];
  var music=["mus_dark","mus_warm","mus_tension","mus_explore","mus_mystery","mus_danger","mus_peace","mus_hunt","mus_tame","mus_journey","mus_solitude","mus_wonder","mus_survival","mus_interior","mus_trade","mus_ride","mus_menu"];
  var sfx2=["pickup","door","choice","sfx_craft","sfx_eat","sfx_drink","sfx_collect","sfx_drop","sfx_flee","sfx_tame","sfx_chop","sfx_break","sfx_dig","sfx_firelight","sfx_fish","sfx_build","sfx_trade","sfx_greet","sfx_jump","sfx_climb","sfx_mount","sfx_vehicle","sfx_death","sfx_swim"];
  for(var i=0;i<loops.length;i++)loadAudio(loops[i],"assets/amb_"+loops[i]+".wav",true);
  for(var i=0;i<music.length;i++)loadAudio(music[i],"assets/"+music[i]+".wav",true);
  for(var i=0;i<sfx2.length;i++){var k=sfx2[i];loadAudio(k,"assets/"+(k.indexOf("sfx_")===0?k:("sfx_"+k))+".wav",false)}
}
function updateAudio(){
  if(!audioCtx)return;
  var bio=getCurBio(),hr=G.dayT*24,target="nature";
  if(G.wth==="storm")target="storm";else if(G.wth==="rain")target="rain";else if(G.wth==="snow")target="snow";
  else if(bio==="coast")target="coast2";else if(bio==="lake")target="lake";else if(bio==="swamp"||bio==="marsh")target="swamp2";
  else if(bio==="jungle")target="jungle";else if(bio==="desert")target="desert";else if(bio==="savanna")target="savanna";
  else if(bio==="snow"||bio==="glacier")target="snow";else if(bio==="tundra")target="tundra";
  else if(bio==="mountain")target="heights";else if(bio==="canyon")target="canyon";
  else if(bio==="farmland")target="farm";else if(bio==="meadow")target="meadow";
  else if(bio==="volcanic")target="volcanic";else if(bio==="ruins")target="ruins";
  else if(bio==="forest")target="forest_deep";else if(bio==="city")target=(hr<5||hr>21)?"city_night":"city";
  if(!bio||bio==="city")target=(hr<5||hr>21)?"city_night":"city";
  if(hr>=5&&hr<7&&bio!=="city")target="dawn";else if(hr>=18&&hr<21&&bio!=="city")target="dusk";
  if(hr<5||hr>21)if(bio!=="city")target="night";
  if(world.tile(Math.floor(G.px),Math.floor(G.py))===8)target="underwater";
  playLoop(target);
}

// ═══ INVENTORY ACTIONS ═══
var craftSel=-1;
function invAction(act){
  if(G.inv.length===0||G.invSel>=G.inv.length)return;
  var item=G.inv[G.invSel];
  if(act==="drop"){
    var oid="o"+Date.now().toString(36);
    G.objs.push({desc:item.desc,glyph:item.glyph||"?",x:G.px+.5,y:G.py+.5,id:oid,pickable:true});
    world.addPoi(G.px+.5,G.py+.5,"object",oid,item.desc);
    G.inv.splice(G.invSel,1);if(G.invSel>=G.inv.length)G.invSel=Math.max(0,G.inv.length-1);
    playSfx("sfx_drop");showNarr("Posé: "+item.desc);save();
  }else if(act==="use"){
    var d=item.desc.toLowerCase(),tags=item.tags||"";
    var isFood=tags.indexOf("food")>=0||d.indexOf("baie")>=0||d.indexOf("viande")>=0||d.indexOf("pain")>=0||d.indexOf("poisson")>=0||d.indexOf("champignon")>=0||d.indexOf("fruit")>=0;
    var isDrink=tags.indexOf("drink")>=0||d.indexOf("eau")>=0;
    if(isFood){G.inv.splice(G.invSel,1);if(G.invSel>=G.inv.length)G.invSel=Math.max(0,G.inv.length-1);if(!G.gauges.faim)G.gauges.faim={val:60,max:100};G.gauges.faim.val=Math.min(100,G.gauges.faim.val+30);playSfx("sfx_eat");showNarr("Mangé: "+item.desc);save()
    }else if(isDrink){if(!G.gauges.soif)G.gauges.soif={val:60,max:100};G.gauges.soif.val=Math.min(100,G.gauges.soif.val+35);playSfx("sfx_drink");showNarr("Bu.");save()
    }else{G.invOpen=false;G.busy=true;G.ni++;callDir("Le joueur UTILISE: "+item.desc,function(r){G.busy=false;if(r){if(r.narrative)showNarr(r.narrative);if(r.choices)G.choices=r.choices.slice(0,4)}else showNarr("Rien.");save()})}
  }else if(act==="combine"){craftSel=G.invSel;
  }else if(act==="craft"){
    if(craftSel<0||craftSel>=G.inv.length||craftSel===G.invSel)return;
    var a=G.inv[craftSel],b=G.inv[G.invSel],recipe=findRecipe(a,b);
    if(recipe){var hi=Math.max(craftSel,G.invSel),lo=Math.min(craftSel,G.invSel);G.inv.splice(hi,1);G.inv.splice(lo,1);G.inv.push({desc:recipe[2],glyph:recipe[3],id:"c"+Date.now().toString(36),tags:recipe[4]});G.invSel=G.inv.length-1;craftSel=-1;if(G.skills.indexOf("artisanat")<0)G.skills.push("artisanat");playSfx("sfx_craft");showNarr("Fabriqué: "+recipe[2]);save()
    }else{craftSel=-1;G.invOpen=false;G.busy=true;callDir("Le joueur combine: "+a.desc+" + "+b.desc,function(r){G.busy=false;if(r&&r.narrative)showNarr(r.narrative);else showNarr("Ça ne marche pas.");save()})}
  }else if(act==="cancel"){craftSel=-1}
  if(G.inv.length===0)G.invOpen=false;
}

// ═══ PHYSICAL ACTIONS ═══
function bestTool(){
  var sharp=null,heavy=null,fire=null,fish=null;
  for(var i=0;i<G.inv.length;i++){var tags=G.inv[i].tags||"",d=G.inv[i].desc.toLowerCase();
    if(tags.indexOf("sharp")>=0||d.indexOf("silex")>=0||d.indexOf("hache")>=0)sharp=G.inv[i];
    if(tags.indexOf("heavy")>=0||d.indexOf("outil")>=0)heavy=G.inv[i];
    if(tags.indexOf("fire")>=0||d.indexOf("silex")>=0)fire=G.inv[i];
    if(tags.indexOf("fishing")>=0)fish=G.inv[i]}
  return{sharp:sharp,heavy:heavy,fire:fire,fish:fish};
}
function tryPhysical(){
  var tools=bestTool(),px=Math.floor(G.px),py=Math.floor(G.py);
  // Nearby tree?
  var vis=world.vis(G.px,G.py);
  if(tools.sharp){for(var ci=0;ci<vis.length;ci++)for(var ti=0;ti<vis[ci].trees.length;ti++){var tr=vis[ci].trees[ti];if(Math.abs(tr.x-G.px)<2&&Math.abs(tr.y-G.py)<2){world.removeTree(Math.floor(tr.x),Math.floor(tr.y));G.inv.push({desc:"bois",glyph:"🪵",id:"w"+Date.now().toString(36),tags:"material"});if(Math.random()<.5)G.inv.push({desc:"bâton",glyph:"🪵",id:"s"+Date.now().toString(36)});if(G.skills.indexOf("bûcheronnage")<0)G.skills.push("bûcheronnage");playSfx("sfx_chop");showNarr("L'arbre tombe.");save();return true}}}
  // Nearby rock?
  if(tools.heavy){for(var ci=0;ci<vis.length;ci++)for(var pi=0;pi<vis[ci].props.length;pi++){var pr=vis[ci].props[pi];if(pr.tp==="rock"&&Math.abs(pr.x-G.px)<2&&Math.abs(pr.y-G.py)<2){world.removeProp(Math.floor(pr.x),Math.floor(pr.y),"rock");G.inv.push({desc:"pierre",glyph:"🪨",id:"r"+Date.now().toString(36)});playSfx("sfx_break");showNarr("La roche se fend.");save();return true}}}
  // Water + fishing rod?
  if(tools.fish){for(var dy=-1;dy<=1;dy++)for(var dx=-1;dx<=1;dx++)if(world.tile(px+dx,py+dy)===8){if(G.skills.indexOf("pêche")<0)G.skills.push("pêche");if(Math.random()<.6){G.inv.push({desc:"poisson cru",glyph:"🐟",id:"f"+Date.now().toString(36),tags:"food,raw"});playSfx("sfx_fish");showNarr("Un poisson!")}else showNarr("Rien ne mord.");save();return true}}
  // Fire?
  if(tools.fire){var hasWood=false;for(var i=0;i<G.inv.length;i++)if(G.inv[i].desc.indexOf("bois")>=0){hasWood=true;G.inv.splice(i,1);break}if(hasWood){var fx=Math.floor(G.px)+.5,fy=Math.floor(G.py)+.5;world.addProp(fx,fy,"fireActive",{lit:true});world.addPoi(fx,fy,"fire","fire"+Date.now().toString(36),"feu");if(G.skills.indexOf("feu")<0)G.skills.push("feu");playSfx("sfx_firelight");showNarr("Les flammes prennent.");save();return true}}
  // Dig?
  if(tools.heavy&&world.tile(px,py)===7){world.setTile(px,py,4);if(Math.random()<.15){G.inv.push({desc:"argile",glyph:"🧱",id:"d"+Date.now().toString(36)});showNarr("Argile.")}else showNarr("Creusé.");playSfx("sfx_dig");save();return true}
  return false;
}

// ═══ CONSTRUCTION ═══
function tryBuild(){
  var matIdx=-1,matType="";
  for(var i=0;i<G.inv.length;i++){var d=G.inv[i].desc.toLowerCase(),tags=G.inv[i].tags||"";
    if(d.indexOf("planche")>=0||tags.indexOf("build")>=0){matIdx=i;matType="wood";break}
    if(d.indexOf("pierre")>=0){matIdx=i;matType="stone";break}
    if(d.indexOf("bois")>=0){matIdx=i;matType="wood";break}}
  if(matIdx<0){showNarr("Rien à placer.");return}
  var dirs=[[1,-1],[-1,1],[-1,-1],[1,1]],fd=dirs[G.facing||0];
  var bx=Math.floor(G.px)+fd[0],by=Math.floor(G.py)+fd[1];
  if(world.tile(bx,by)!==4&&world.tile(bx,by)!==7){showNarr("Pas ici.");return}
  world.setTile(bx,by,3);world.addProp(bx+.5,by+.5,matType==="wood"?"blockWood":"blockStone");
  G.inv.splice(matIdx,1);if(G.skills.indexOf("construction")<0)G.skills.push("construction");
  playSfx("sfx_build");showNarr("Bloc placé.");save();
}

// ═══ MORTALITY ═══
function doDeath(cause){
  if(!G.mortal){
    if(!G.mortalAsked[cause]){
      G.mortalAsked[cause]=true;
      var msgs={noyade:"L'eau monte. Le souffle manque.",froid:"Le froid engourdit tout.",faim:"Le ventre crie.",soif:"La gorge brûle.",hostile:"La douleur irradie."};
      showNarr(msgs[cause]||"Le corps faiblit.");
      G.choices=["Accepter la mortalité","Résister"];G._mortalCause=cause;
    }else{for(var gk in G.gauges)if(G.gauges[gk].val<=0)G.gauges[gk].val=5}
    return;
  }
  playSfx("sfx_death");showNarr("Le noir.");
  G.px=CS/2+1;G.py=CS/2+1;
  var lost=0;while(G.inv.length>0&&lost<G.inv.length/2){G.inv.splice(Math.floor(Math.random()*G.inv.length),1);lost++}
  for(var gk in G.gauges)G.gauges[gk].val=G.gauges[gk].max*.5;
  G.invOpen=false;G.swimT=0;save();
}
function envDamage(dt,bio,dL){
  if((bio==="snow"||bio==="tundra"||bio==="glacier")&&dL<.3){if(!G.gauges.chaleur)G.gauges.chaleur={val:60,max:100};G.gauges.chaleur.val-=dt*.003;if(G.gauges.chaleur.val<=0)doDeath("froid")}
  if(bio==="volcanic"){if(!G.gauges.sante)G.gauges.sante={val:80,max:100};G.gauges.sante.val-=dt*.001;if(G.gauges.sante.val<=0)doDeath("hostile")}
  if(G.gauges.faim&&G.gauges.faim.val<=0)doDeath("faim");
  if(G.gauges.soif&&G.gauges.soif.val<=0)doDeath("soif");
}

// ═══ WEATHER PARTICLES ═══
function drawWeather(gfx2,sw2,sh2,ox2,oy2){
  if(G.wth==="rain"||G.wth==="drizzle"){var n=G.wth==="rain"?50:20;gfx2.lineStyle(.5,0x8ca5b9,.07);for(var i=0;i<n;i++){var rx=Math.random()*sw2+ox2,ry=Math.random()*sh2+oy2;gfx2.lineBetween(rx,ry,rx-2,ry+8)}}
  if(G.wth==="storm"){gfx2.lineStyle(.7,0x8299b4,.08);for(var i=0;i<70;i++){var rx=Math.random()*sw2+ox2,ry=Math.random()*sh2+oy2;gfx2.lineBetween(rx,ry,rx-3,ry+12)}var lt=(G.time*.3)%7;if(lt<.08){gfx2.fillStyle(0xe8e0ff,.12);gfx2.fillRect(ox2,oy2,sw2,sh2)}}
  if(G.wth==="snow"){gfx2.fillStyle(0xdde5ee,1);for(var i=0;i<40;i++){var sx2=(Math.sin(G.time*.3+i*47)+1)*sw2/2+ox2,sy2=((G.time*12+i*sh2/40)%sh2)+oy2;gfx2.fillCircle(sx2,sy2,.8+Math.sin(i)*.4)}}
  if(G.wth==="fog"){gfx2.fillStyle(0xb0b5c0,.04);gfx2.fillRect(ox2,oy2,sw2,sh2)}
  if(G.wth==="heat"){gfx2.fillStyle(0xffc880,.015);gfx2.fillRect(ox2,oy2,sw2,sh2)}
}
