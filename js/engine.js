// ═══ TABULA RASA V30 — Craft + Ressources + 22 Biomes + 35 Audio ═══
"use strict";

// ── CONFIG ──

var TW=30, TH=15, CH=16, CC=3, CS=CH*CC;
var SPD=.048, SPRNT=.082, CLERP=.07, IR=2.2;
var TSC=60/132;// Tile scale: Kenney 132px → our 60px diamond

// ── SPRITE ATLAS (Kenney isometric-city CC0) ──
var ATLAS={1:[794,737,132,101],2:[794,636,132,101],3:[794,535,132,101],5:[794,306,132,101],8:[133,1208,133,101],9:[793,1929,132,101],14:[793,1370,132,101],15:[793,1269,132,101],16:[793,1168,132,101],20:[662,766,132,101],21:[662,665,132,101],25:[0,569,133,101],27:[662,0,132,101],28:[661,1932,132,101],29:[661,1831,132,101],30:[661,1730,132,101],32:[0,902,133,101],35:[530,1155,132,101],37:[530,931,132,101],38:[530,830,132,101],42:[530,426,132,101],43:[530,325,132,101],45:[530,101,132,101],46:[530,0,132,101],48:[0,1742,133,101],49:[529,1722,132,101],50:[529,1621,132,101],51:[529,1520,132,101],54:[398,1217,132,101],59:[398,656,132,101],60:[398,555,132,101],61:[398,454,132,101],62:[133,1309,133,101],63:[133,1107,133,101],64:[794,838,132,101],70:[0,0,133,101],71:[0,468,133,101],73:[662,101,132,101],74:[662,202,132,101],77:[133,705,133,101],84:[266,0,132,101],85:[133,101,133,101],86:[133,0,133,101],91:[266,737,132,101],95:[265,1612,132,101],96:[133,1612,132,101],100:[133,905,133,101],101:[133,806,133,99],102:[266,101,132,101],103:[266,202,132,101],110:[266,535,132,101],115:[266,636,132,101],116:[530,527,132,101]};
var ROAD_T=[95,96,100,102,103];
var CROSS_T=[51];
var SIDE_T=[1,2,3,5,9,14,15,16,20,21,27,28,29,30,35,37,38,42,43,45,46,84,85,86];
var SIDE_LAMP_T=[48,49,50];
var SIDE_TREE_T=[62,64];
var SIDE_GRASS_T=[63];
var GRASS_T=[70,71,77,91];
// ── LANDSCAPE ATLAS (Kenney isometric-landscape CC0) ──
var LATLAS={0:[265,1057,132,83],1:[265,1452,132,99],2:[265,1369,132,83],3:[265,1682,132,83],4:[529,1191,132,99],5:[265,1551,132,131],7:[265,1864,132,83],8:[266,921,132,131],9:[0,281,133,99],13:[793,1303,132,99],14:[133,380,133,83],16:[793,1121,132,83],21:[662,594,132,99],37:[661,1055,132,83],41:[133,0,133,99],42:[133,198,133,83],43:[530,461,132,99],44:[530,378,132,83],45:[530,295,132,83],51:[529,1751,132,83],52:[529,1668,132,83],53:[529,1585,132,83],56:[0,677,133,83],57:[0,760,133,99],58:[529,1108,132,83],59:[529,1009,132,99],60:[398,926,132,83],61:[398,843,132,83],62:[398,744,132,99],66:[398,364,132,83],67:[398,265,132,99],68:[398,166,132,99],69:[398,83,132,83],70:[398,0,132,83],73:[397,1745,132,83],74:[397,1646,132,99],75:[397,1547,132,99],76:[793,1402,132,83],83:[266,723,132,99]};
// Wilderness tile arrays
var WGRASS_T=[0,2,3,7,14,16,37,44,45,51,52,53,66,69,70,73,76];// flat grass
var WTREE_T=[1,4,8,60,61,62];// grass with trees
var WWATER_T=[41,42,43,56,57,58,59];// water tiles
var WDIRT_T=[9,13,21,67,68,83];// dirt/path
var landImg=null,landOK=false;
var sheetImg=null,spritesOK=false;
var voxImg=null,voxOK=false;
var roadImg=null,roadOK=false;
var detImg=null,detOK=false;
// Voxel blocks atlas (Kenney isometric-blocks CC0) — for building face textures
var VATLAS={1:[336,774,111,128],7:[672,774,111,128],8:[672,645,111,128],14:[560,774,111,128],27:[448,0,111,128],34:[336,0,111,128],48:[112,0,111,128],49:[0,774,111,128],52:[0,387,111,128],55:[0,0,111,128]};
// Voxel tile mapping: district → [block indices]
var VBLD_D=[[14,8,27],[7,14,8],[48,34,27]];// downtown=stone, industrial=brick, residential=wood
// Roads atlas (Kenney isometric-roads CC0) — named tiles
var RATLAS={road:[400,495,100,65],roadES:[500,495,100,65],roadEW:[600,495,100,65],roadNE:[500,575,100,65],roadNS:[600,575,100,65],roadNW:[700,575,100,65],roadSW:[800,575,100,65],cross:[900,95,100,65],bridgeEW:[300,98,100,62],bridgeNS:[400,98,100,62],dirt:[400,182,100,58],grass:[400,255,100,65]};
// City details atlas
var DATLAS={lamp0:[125,64,22,37],tree0:[0,0,71,64],tree1:[0,64,71,63],bush0:[71,45,32,32],bush1:[71,77,32,32]};

function loadSprites(cb){
  var loaded=0,need=7;
  function check(){loaded++;if(loaded>=need)cb()}
  sheetImg=new Image();sheetImg.onload=function(){spritesOK=true;check()};sheetImg.onerror=check;sheetImg.src='assets/cityTiles_sheet.png';
  landImg=new Image();landImg.onload=function(){landOK=true;check()};landImg.onerror=check;landImg.src='assets/landscapeTiles_sheet.png';
  voxImg=new Image();voxImg.onload=function(){voxOK=true;check()};voxImg.onerror=check;voxImg.src='assets/voxelTiles_sheet.png';
  roadImg=new Image();roadImg.onload=function(){roadOK=true;check()};roadImg.onerror=check;roadImg.src='assets/roadsTiles_sheet.png';
  detImg=new Image();detImg.onload=function(){detOK=true;check()};detImg.onerror=check;detImg.src='assets/cityDetails_sheet.png';
  var furnImg=new Image();furnImg.onload=function(){check()};furnImg.onerror=check;furnImg.src='assets/furniture_sheet.png';
  var dungImg=new Image();dungImg.onload=function(){check()};dungImg.onerror=check;dungImg.src='assets/dungeon_sheet.png';
}
function drawSpr(c,idx,sx,sy){if(!spritesOK||!ATLAS[idx])return false;var a=ATLAS[idx];var dw=Math.round(a[2]*TSC),dh=Math.round(a[3]*TSC);c.drawImage(sheetImg,a[0],a[1],a[2],a[3],sx-dw/2,sy-TH,dw,dh);return true}
function drawLSpr(c,idx,sx,sy){if(!landOK||!LATLAS[idx])return false;var a=LATLAS[idx];var dw=Math.round(a[2]*TSC),dh=Math.round(a[3]*TSC);c.drawImage(landImg,a[0],a[1],a[2],a[3],sx-dw/2,sy-TH,dw,dh);return true}
// Draw a voxel block texture on a building face — clips to the face polygon
function drawVoxFace(c,vIdx,x1,y1,x2,y2,x3,y3,x4,y4){
  if(!voxOK||!VATLAS[vIdx])return;
  var a=VATLAS[vIdx];
  // Scale voxel block to fit the face bounding box
  var minX=Math.min(x1,x2,x3,x4),maxX=Math.max(x1,x2,x3,x4);
  var minY=Math.min(y1,y2,y3,y4),maxY=Math.max(y1,y2,y3,y4);
  c.save();c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.lineTo(x3,y3);c.lineTo(x4,y4);c.closePath();c.clip();
  c.globalAlpha=.12;// subtle texture overlay
  c.drawImage(voxImg,a[0],a[1],a[2],a[3],minX,minY,maxX-minX,maxY-minY);
  c.restore();c.globalAlpha=1;
}
function pickT(arr,gx,gy){return arr[H(gx,gy)%arr.length]}

var DR=[[22,22,38],[28,24,20],[26,26,34]];
var DS=[[50,50,65],[52,46,40],[54,52,48]];
var DC=[[66,66,78],[66,58,50],[68,66,62]];

var DPAL=[
  [{r:[42,48,68],l:[28,32,48],t:[58,62,80]},{r:[50,50,66],l:[34,34,48],t:[62,62,78]}],
  [{r:[70,50,40],l:[50,36,28],t:[82,62,52]},{r:[65,55,45],l:[48,40,32],t:[78,68,58]}],
  [{r:[76,60,50],l:[56,44,36],t:[90,74,64]},{r:[60,56,52],l:[44,40,36],t:[74,68,64]}]
];

var DST=[[30,35,50],[38,30,25],[40,34,30]];
var DSG=[
  ["BANK","TOWER","PLAZA","LUXE"],
  ["DEPOT","CARGO","STEEL","AUTO"],
  ["CAFÉ","TABAC","FLEURS","VINS"]
];
var DAW=[[140,75,45],[75,135,55],[170,115,55],[55,115,175]];
var WLC=[[255,218,100],[255,186,70],[100,178,255],[255,152,68],[255,226,140]];

var NB=["#6a4a30","#384838","#4a3050","#404060","#604038","#285050","#505028","#604a30"];
var NL=["#282838","#302828","#283028","#333","#2a2a38"];

var VC=["#383850","#582828","#283828","#484838","#282848","#505050","#4a3828","#284848"];
var VTYPES=[0,0,0,0,0,1,1,2];// weighted: mostly sedans

var NEON=[[255,60,60],[60,255,120],[60,150,255],[255,200,60],[255,100,200]];

var SAVE_KEY="tr17";

// ── UTILS ──

function rng(s){return function(){s=(s*16807+13)%2147483647;return s/2147483647}}
function H(x,y){var h=(x*374761393+y*668265263+1013904223);h=(h^(h>>13))*1274126177;return(h^(h>>16))>>>0}
function iso(x,y,cx,cy,sw,sh){return{sx:(x-y)*TW+sw/2-cx,sy:(x+y)*TH+sh/2-cy}}
function lp(a,b,t){return a+(b-a)*t}
function cl(v,a,b){return v<a?a:v>b?b:v}
function gDist(gx,gy){var cx=gx/CS,cy=gy/CS;if(cx<.4&&cy<.5)return 0;if(cx>.55)return 1;return 2}

// ── WORLD ──

class World{
  constructor(){this.ch=new Map();this.mods={}}// mods = persistent modifications
  k(a,b){return a+","+b}
  isC(a,b){return a>=0&&a<CC&&b>=0&&b<CC}
  tile(wx,wy){
    // Check modifications first
    var mk=wx+","+wy;
    if(this.mods[mk]!==undefined)return this.mods[mk];
    var c=this.gc(Math.floor(wx/CH),Math.floor(wy/CH));
    var lx=((wx%CH)+CH)%CH,ly=((wy%CH)+CH)%CH;
    return c.t[ly]?c.t[ly][lx]:0;
  }
  setTile(wx,wy,val){this.mods[wx+","+wy]=val}
  // Remove a tree at world coords
  removeTree(wx,wy){
    var ch=this.gc(Math.floor(wx/CH),Math.floor(wy/CH));
    ch.trees=ch.trees.filter(function(tr){return Math.floor(tr.x)!==wx||Math.floor(tr.y)!==wy});
  }
  // Remove a prop at world coords
  removeProp(wx,wy,tp){
    var ch=this.gc(Math.floor(wx/CH),Math.floor(wy/CH));
    for(var i=ch.props.length-1;i>=0;i--){
      var p=ch.props[i];
      if(Math.abs(p.x-wx)<1&&Math.abs(p.y-wy)<1&&(!tp||p.tp===tp)){ch.props.splice(i,1);return true}
    }
    return false;
  }
  // Add a prop to the world
  addProp(wx,wy,tp,extra){
    var ch=this.gc(Math.floor(wx/CH),Math.floor(wy/CH));
    var pr={tp:tp,x:wx,y:wy};
    if(extra)for(var ek in extra)pr[ek]=extra[ek];
    ch.props.push(pr);
    return pr;
  }
  // Add a POI
  addPoi(wx,wy,tp,id,desc){
    var ch=this.gc(Math.floor(wx/CH),Math.floor(wy/CH));
    ch.poi.push({tp:tp,x:wx,y:wy,id:id,desc:desc});
  }
  gc(cx,cy){var k=this.k(cx,cy);if(this.ch.has(k))return this.ch.get(k);var c=this._g(cx,cy);this.ch.set(k,c);return c}
  vis(px,py){
    var a=Math.floor(px/CH),b=Math.floor(py/CH),o=[];
    for(var dy=-2;dy<=2;dy++)for(var dx=-2;dx<=2;dx++)o.push(this.gc(a+dx,b+dy));
    return o;
  }
  _g(cx,cy){
    var t=(function(){var a=[];for(var i=0;i<CH;i++){a[i]=[];for(var j=0;j<CH;j++)a[i][j]=0}return a})(),sd=H(cx,cy),rand=rng(sd),ox=cx*CH,oy=cy*CH;
    var bl=[],lamps=[],poi=[],trees=[],props=[],ambN=[],vehs=[],tLights=[];

    if(this.isC(cx,cy)){
      // ═══ CITY ═══
      for(var ly=0;ly<CH;ly++)for(var lx=0;lx<CH;lx++){
        var gx=ox+lx,gy=oy+ly;
        if(gx%8<2||gy%8<2)t[ly][lx]=1;
        if(Math.abs(gx-CS/2)<2||Math.abs(gy-CS/2)<2)t[ly][lx]=1;
      }
      for(var ly=0;ly<CH;ly++)for(var lx=0;lx<CH;lx++){
        if(t[ly][lx])continue;
        var _dirs4=[[-1,0],[1,0],[0,-1],[0,1]];for(var _di=0;_di<4;_di++){var dy=_dirs4[_di][0],dx=_dirs4[_di][1];
          var nx=lx+dx,ny=ly+dy;
          if(nx>=0&&nx<CH&&ny>=0&&ny<CH&&t[ny][nx]===1){t[ly][lx]=2;break}
        }
      }
      var cen=CS/2;
      for(var iy=0;iy<CH;iy+=8)for(var ix=0;ix<CH;ix+=8)
        if((t[iy]&&t[iy][ix])===1)tLights.push({x:ox+ix+2.3,y:oy+iy+.3,ph:rand()*10});

      // Buildings
      for(var ly=0;ly<CH;ly++)for(var lx=0;lx<CH;lx++){
        if(t[ly][lx]!==0)continue;
        var gx=ox+lx,gy=oy+ly,di=gDist(gx,gy);
        var fpIdx=H(gx,gy)%10;
        var _bwbd=[[3,3],[4,3],[3,4],[2,2],[2,3],[3,2],[4,4],[5,3],[3,5],[4,2]][fpIdx];var bw=_bwbd[0],bd=_bwbd[1];
        if(lx+bw>CH||ly+bd>CH)continue;
        var ok=1;
        for(var dy=0;dy<bd&&ok;dy++)for(var dx=0;dx<bw&&ok;dx++){
          if(t[ly+dy][lx+dx]!==0)ok=0;
          if(dx===0&&lx>0&&t[ly+dy][lx-1]===3)ok=0;
          if(dy===0&&ly>0&&(t[ly-1]&&t[ly-1][lx+dx])===3)ok=0;
        }
        if(!ok)continue;
        var dc=Math.sqrt((gx+bw/2-cen)**2+(gy+bd/2-cen)**2)/cen;
        var hM=di===0?1.4:di===1?0.85:.7;
        var mH=(dc<.2?440:dc<.4?300:dc<.6?200:dc<.8?130:85)*hM;
        if(rand()<(dc>.6?0.22:.1)&&bw>=3&&bd>=3){
          for(var dy=0;dy<bd;dy++)for(var dx=0;dx<bw;dx++){
            t[ly+dy][lx+dx]=4;if(rand()<.18)trees.push({x:gx+dx,y:gy+dy});
          }
          poi.push({tp:"bench",x:gx+bw/2,y:gy+bd/2,id:"b"+(gx)+"_"+(gy)});
          continue;
        }
        var h=40+rand()*(mH-40);var hsb=h>140&&rand()<.45;
        bl.push({
          x:gx,y:gy,w:bw,d:bd,h,di,pi:(rand()*2)|0,sd:(rand()*9999)|0,
          wst:di===0?0:di===1?2:1,
          sign:rand()<.2?DSG[di][(rand()*DSG[di].length)|0]:null,
          ac:rand()<.3&&h>80,tk:rand()<.12&&h>130,
          aw:rand()<.35,awc:DAW[(rand()*4)|0],
          hsb,sbh:hsb?h*.55+rand()*h*.2:0,
          sf:rand()<.55&&h>55,re:rand()<.45,
          rc:di===0?[70,75,90]:di===1?[85,70,55]:[80,70,60],
          fe:di===2&&rand()<.25&&h>80
        });
        for(var dy=0;dy<bd;dy++)for(var dx=0;dx<bw;dx++)t[ly+dy][lx+dx]=3;
        var ds=[];
        if(ly+bd<CH)for(var dx=0;dx<bw;dx++)
          if((t[ly+bd]&&t[ly+bd][lx+dx])<=2&&t[ly+bd][lx+dx]>=1){ds.push({x:gx+dx+.5,y:gy+bd+.3});break}
        if(ly>0)for(var dx=0;dx<bw;dx++)
          if((t[ly-1]&&t[ly-1][lx+dx])<=2){ds.push({x:gx+dx+.5,y:gy-.3});break}
        if(ds.length)poi.push({tp:"door",x:ds[0].x,y:ds[0].y,id:"d"+(gx)+"_"+(gy)});
      }

      // Props
      for(var ly=0;ly<CH;ly+=2)for(var lx=0;lx<CH;lx+=2){
        var gx=ox+lx,gy=oy+ly;var r2=rng(H(gx,gy)+111);var roll=r2();
        if(t[ly][lx]===2){
          if(roll<.03)props.push({tp:"tc",x:gx+.5,y:gy+.5});
          else if(roll<.05)props.push({tp:"hy",x:gx+.3,y:gy+.5});
          else if(roll<.08)props.push({tp:"tr",x:gx+r2()*.5+.25,y:gy+r2()*.5+.25});
          else if(roll<.09)props.push({tp:"nb",x:gx+.5,y:gy+.5});
          else if(roll<.095)props.push({tp:"bn",x:gx+.5,y:gy+.5});
        }
        if(t[ly][lx]===1){
          if(roll<.025)props.push({tp:"pu",x:gx+.5,y:gy+.5});
          else if(roll<.035)props.push({tp:"mk",x:gx+.5,y:gy+.5});
        }
        if(t[ly][lx]===0&&roll<.015){
          var ab=0;var _dirs4=[[-1,0],[1,0],[0,-1],[0,1]];for(var _di=0;_di<4;_di++){var dy=_dirs4[_di][0],dx=_dirs4[_di][1];
            var ny=ly+dy,nx=lx+dx;if(ny>=0&&ny<CH&&nx>=0&&nx<CH&&t[ny][nx]===3)ab++;}
          if(ab>=2)props.push({tp:"dm",x:gx+.5,y:gy+.5});
        }
      }

      // Lamps
      for(var ly=0;ly<CH;ly+=2)for(var lx=0;lx<CH;lx+=3)
        if(t[ly][lx]===2&&rand()<.06)lamps.push({x:ox+lx+.5,y:oy+ly+.5});
      // Corners
      for(var iy=0;iy<CH;iy+=8)for(var ix=0;ix<CH;ix+=8)
        if(rand()<.3)poi.push({tp:"corner",x:ox+ix+1,y:oy+iy+1,id:"c"+(ox+ix)+"_"+(oy+iy)});

      // Ambient NPCs
      var npcCount=2+(rand()<.4?1:0);
      for(var i=0;i<npcCount;i++){
        if(rand()>.6)continue;
        var ax=-1,ay=-1;
        for(var j=0;j<10;j++){var lx2=(rand()*CH)|0,ly2=(rand()*CH)|0;
          if((t[ly2]&&t[ly2][lx2])<=2&&t[ly2][lx2]>=1){ax=ox+lx2;ay=oy+ly2;break}}
        if(ax>=0)ambN.push({
          x:ax+.5,y:ay+.5,bc:NB[(rand()*NB.length)|0],lc:NL[(rand()*NL.length)|0],
          dir:(rand()*4)|0,spd:.004+rand()*.006,ph:rand()*100,
          idle:rand()<.2?"lean":rand()<.35?"sit":"walk"
        });
      }

      // Vehicles
      var vehCount=rand()<.3?2:1;
      for(var v=0;v<vehCount;v++){
        if(rand()>.55)continue;
        var vx=-1,vy=-1;
        for(var j=0;j<10;j++){var lx2=(rand()*CH)|0,ly2=(rand()*CH)|0;
          if((t[ly2]&&t[ly2][lx2])===1){vx=ox+lx2;vy=oy+ly2;break}}
        if(vx>=0)vehs.push({
          x:vx+.5,y:vy+.5,col:VC[(rand()*VC.length)|0],
          dir:(rand()*4)|0,spd:.008+rand()*.01,pk:rand()<.35
        });
      }

    } else {
      // ═══ WILDERNESS — 20 biomes ═══
      var dist=Math.sqrt(cx*cx+cy*cy);
      var br=rng(H(cx>>1,cy>>1));
      // Direction from city affects biome (north=cold, south=warm, east=coast, west=mountains)
      var angle=Math.atan2(cy,cx);// radians
      var north=angle<-0.5,south=angle>0.5,east=cx>Math.abs(cy),west=cx<-Math.abs(cy);
      var bio;
      if(dist<4){
        bio=br()<.25?"forest":br()<.45?"field":br()<.65?"hills":br()<.8?"river":"meadow";
      }else if(dist<7){
        if(north)bio=br()<.25?"forest":br()<.45?"hills":br()<.6?"moor":br()<.75?"river":"tundra";
        else if(south)bio=br()<.2?"farmland":br()<.4?"field":br()<.55?"river":br()<.7?"meadow":"jungle";
        else if(east)bio=br()<.25?"coast":br()<.45?"marsh":br()<.6?"field":br()<.8?"river":"swamp";
        else bio=br()<.25?"hills":br()<.45?"forest":br()<.6?"mountain":br()<.75?"canyon":"moor";
      }else{
        if(north)bio=br()<.2?"tundra":br()<.4?"snow":br()<.55?"mountain":br()<.7?"forest":"glacier";
        else if(south)bio=br()<.2?"desert":br()<.4?"jungle":br()<.55?"savanna":br()<.7?"volcanic":"steppe";
        else if(east)bio=br()<.25?"coast":br()<.4?"marsh":br()<.55?"lake":br()<.7?"swamp":"field";
        else bio=br()<.2?"mountain":br()<.4?"canyon":br()<.55?"forest":br()<.7?"ruins":"hills";
      }

      // ── BASE TERRAIN ──
      for(var ly=0;ly<CH;ly++)for(var lx=0;lx<CH;lx++){
        var gx=ox+lx,gy=oy+ly;
        if((gx>=0&&gx<2)||(gy>=0&&gy<2)){t[ly][lx]=1;continue}
        if(bio==="river"||bio==="swamp"||bio==="marsh"){
          var rc=CH/2+Math.sin(ly*.4+cx)*3+(bio!=="river"?Math.sin(ly*.8)*2:0);
          var width=bio==="marsh"?4:bio==="swamp"?3.5:2.5;
          if(Math.abs(lx-rc)<width){t[ly][lx]=8;continue}
          if(Math.abs(lx-rc)<width+1){t[ly][lx]=9;continue}
        }
        if(bio==="coast"){
          if(lx>CH-4){t[ly][lx]=8;continue}
          if(lx>CH-5){t[ly][lx]=9;continue}
        }
        if(bio==="lake"){
          var lkd=Math.sqrt((lx-CH/2)*(lx-CH/2)+(ly-CH/2)*(ly-CH/2));
          if(lkd<5){t[ly][lx]=8;continue}
          if(lkd<6){t[ly][lx]=9;continue}
          t[ly][lx]=4;continue;
        }
        if(bio==="glacier"){
          var gld=Math.sqrt((lx-CH/2)*(lx-CH/2)+(ly-CH*.3)*(ly-CH*.3));
          if(gld<6){t[ly][lx]=8;continue}// ice = water tile (tinted)
          t[ly][lx]=4;continue;
        }
        if(bio==="volcanic"){
          var lava=(Math.sin(lx*.6+cy)*Math.cos(ly*.5+cx))>.6;
          if(lava){t[ly][lx]=8;continue}// lava = water (tinted red)
          t[ly][lx]=7;continue;// dark rock = dirt
        }
        if(bio==="canyon"){
          var cwall=Math.abs(lx-CH/2-Math.sin(ly*.3+cx)*2);
          if(cwall<2){t[ly][lx]=7;continue}// canyon floor
          if(cwall<3){t[ly][lx]=9;continue}// cliff edge
          t[ly][lx]=4;continue;
        }
        if(bio==="desert"||bio==="steppe"){t[ly][lx]=7;continue}
        if(bio==="snow"||bio==="tundra"){t[ly][lx]=4;continue}
        t[ly][lx]=4;
      }

      // ── BRIDGE ──
      if((bio==="river"||bio==="swamp"||bio==="marsh")&&rand()<.4){
        var bridgeY=(CH/2+(rand()*6-3))|0;
        for(var lx=0;lx<CH;lx++)
          if(t[bridgeY]&&(t[bridgeY][lx]===8||t[bridgeY][lx]===9)){
            t[bridgeY][lx]=10;
            if(bridgeY+1<CH&&(t[bridgeY+1][lx]===8||t[bridgeY+1][lx]===9))t[bridgeY+1][lx]=10;
          }
      }

      // ── DIRT PATHS ──
      var ps=rng(sd+555);
      var ppx=ps()<.5?0:CH-1,ppy=(ps()*CH)|0;
      var tx2=ps()<.5?CH-1:0,ty2=(ps()*CH)|0;
      for(var step=0;step<35;step++){
        if(ppx>=0&&ppx<CH&&ppy>=0&&ppy<CH&&t[ppy][ppx]!==8&&t[ppy][ppx]!==10)t[ppy][ppx]=7;
        var ddx=tx2-ppx,ddy=ty2-ppy;
        if(Math.abs(ddx)+Math.abs(ddy)<2)break;
        if(ps()<.6)ppx+=ddx>0?1:-1;else ppy+=ddy>0?1:-1;
        ppx=cl(ppx,0,CH-1);ppy=cl(ppy,0,CH-1);
      }
      // Second path in farmland/field
      if((bio==="farmland"||bio==="field")&&rand()<.5){
        var px2=0,py2=(rand()*CH)|0;
        for(var s=0;s<CH;s++){if(t[py2]&&t[py2][px2]===4)t[py2][px2]=7;px2++;if(rand()<.3)py2=cl(py2+(rand()<.5?1:-1),0,CH-1)}
      }

      // ── TREES ──
      var dn=bio==="forest"?0.24:bio==="jungle"?0.32:bio==="swamp"?0.14:bio==="hills"?0.08:bio==="field"?0.02:bio==="farmland"?0.03:bio==="mountain"?0.04:bio==="moor"?0.02:bio==="snow"?0.05:bio==="marsh"?0.06:bio==="coast"?0.01:bio==="desert"?0:bio==="tundra"?0.01:bio==="canyon"?0:bio==="steppe"?0.01:bio==="savanna"?0.04:bio==="volcanic"?0:bio==="glacier"?0:bio==="lake"?0.05:bio==="meadow"?0.02:bio==="ruins"?0.08:0.06;
      for(var ly=0;ly<CH;ly++)for(var lx=0;lx<CH;lx++)
        if(t[ly][lx]===4&&rand()<dn)trees.push({x:ox+lx,y:oy+ly});

      // ═══ RURAL STRUCTURES ═══
      var structRoll=rand();

      // ── ISOLATED CABIN ──
      if(structRoll<.08&&bio!=="desert"&&bio!=="coast"){
        var sx2=4+(rand()*6)|0,sy2=4+(rand()*6)|0;
        if(sx2+2<CH&&sy2+2<CH){
          for(var dy=0;dy<2;dy++)for(var dx=0;dx<2;dx++)t[sy2+dy][sx2+dx]=3;
          bl.push({x:ox+sx2,y:oy+sy2,w:2,d:2,h:35+rand()*15,di:2,pi:0,sd:(rand()*9999)|0,sign:null,ac:rand()<.3,tk:0,aw:0,awc:[0,0,0],hsb:0,sbh:0,sf:0,re:rand()<.5,rc:[75,65,55],fe:0});
          poi.push({tp:"door",x:ox+sx2+1,y:oy+sy2+2.3,id:"cab"+cx+"_"+cy,desc:"cabane isolée"});
          if(rand()<.5)props.push({tp:"woodpile",x:ox+sx2+2.5,y:oy+sy2+1});
        }
      }
      // ── FARM ──
      else if(structRoll<.15&&(bio==="farmland"||bio==="field")){
        var fx=3+(rand()*4)|0,fy=3+(rand()*4)|0;
        // Farmhouse
        if(fx+3<CH&&fy+2<CH){
          for(var dy=0;dy<2;dy++)for(var dx=0;dx<3;dx++)t[fy+dy][fx+dx]=3;
          bl.push({x:ox+fx,y:oy+fy,w:3,d:2,h:40+rand()*20,di:2,pi:0,sd:(rand()*9999)|0,sign:null,ac:rand()<.4,tk:0,aw:0,awc:[0,0,0],hsb:0,sbh:0,sf:0,re:1,rc:[85,70,55],fe:0});
          poi.push({tp:"door",x:ox+fx+1.5,y:oy+fy+2.3,id:"farm"+cx+"_"+cy,desc:"ferme"});
        }
        // Barn nearby
        if(fx+6<CH&&fy+4<CH){
          for(var dy=0;dy<2;dy++)for(var dx=0;dx<2;dx++)t[fy+dy][fx+4+dx]=3;
          bl.push({x:ox+fx+4,y:oy+fy,w:2,d:2,h:45,di:1,pi:1,sd:(rand()*9999)|0,sign:null,ac:0,tk:0,aw:0,awc:[0,0,0],hsb:0,sbh:0,sf:0,re:0,rc:[90,60,40],fe:0});
          poi.push({tp:"door",x:ox+fx+5,y:oy+fy+2.3,id:"barn"+cx+"_"+cy,desc:"grange"});
        }
        // Fenced area (crops)
        for(var dy=0;dy<4;dy++)for(var dx=0;dx<5;dx++){
          var lx3=fx+dx,ly3=fy+3+dy;
          if(lx3<CH&&ly3<CH&&t[ly3][lx3]===4)props.push({tp:"crop",x:ox+lx3+.5,y:oy+ly3+.5});}
        // Animals
        if(rand()<.6){var cx3=ox+fx+rand()*3,cy3=oy+fy+5+rand()*3;props.push({tp:"cow",x:cx3,y:cy3,vx:0,vy:0,ai:"idle",aiT:0,homeX:cx3,homeY:cy3,fleeT:0,tameP:0.5,spd:0.005,fleeDist:1,shyDist:3,canMeat:1,canFly:0,canTame:0.6,hostile:0,isAnimal:1});poi.push({tp:"animal",x:cx3,y:cy3,id:"cow"+cx+"_"+cy,desc:"vache",aIdx:props.length-1})}
        if(rand()<.4){var cx4=ox+fx+1+rand()*2,cy4=oy+fy+4+rand()*2;props.push({tp:"chicken",x:cx4,y:cy4,vx:0,vy:0,ai:"idle",aiT:0,homeX:cx4,homeY:cy4,fleeT:0,tameP:0.3,spd:0.01,fleeDist:2,shyDist:3,canMeat:1,canFly:0,canTame:0.5,hostile:0,isAnimal:1});poi.push({tp:"animal",x:cx4,y:cy4,id:"chk"+cx+"_"+cy,desc:"poule",aIdx:props.length-1})}
      }
      // ── MILL ──
      else if(structRoll<.18&&(bio==="farmland"||bio==="field"||bio==="hills")){
        var mx2=5+(rand()*6)|0,my2=5+(rand()*6)|0;
        if(mx2+2<CH&&my2+2<CH){
          for(var dy=0;dy<2;dy++)for(var dx=0;dx<2;dx++)t[my2+dy][mx2+dx]=3;
          bl.push({x:ox+mx2,y:oy+my2,w:2,d:2,h:70+rand()*30,di:2,pi:1,sd:(rand()*9999)|0,sign:null,ac:1,tk:1,aw:0,awc:[0,0,0],hsb:0,sbh:0,sf:0,re:1,rc:[80,70,60],fe:0});
          poi.push({tp:"door",x:ox+mx2+1,y:oy+my2+2.3,id:"mill"+cx+"_"+cy,desc:"moulin"});
        }
      }
      // ── CHAPEL / CHURCH ──
      else if(structRoll<.21){
        var chx=5+(rand()*6)|0,chy=5+(rand()*5)|0;
        if(chx+2<CH&&chy+3<CH){
          for(var dy=0;dy<3;dy++)for(var dx=0;dx<2;dx++)t[chy+dy][chx+dx]=3;
          bl.push({x:ox+chx,y:oy+chy,w:2,d:3,h:60+rand()*40,di:0,pi:0,sd:(rand()*9999)|0,sign:null,ac:0,tk:0,aw:0,awc:[0,0,0],hsb:1,sbh:40,sf:0,re:1,rc:[72,72,80],fe:0});
          poi.push({tp:"door",x:ox+chx+1,y:oy+chy+3.3,id:"chap"+cx+"_"+cy,desc:"chapelle"});
          // Graveyard
          for(var i=0;i<3+rand()*4;i++)props.push({tp:"grave",x:ox+chx-2+rand()*6,y:oy+chy+4+rand()*3});
        }
      }
      // ── WELL ──
      else if(structRoll<.24){
        var wx2=6+(rand()*4)|0,wy2=6+(rand()*4)|0;
        props.push({tp:"well",x:ox+wx2,y:oy+wy2});
        poi.push({tp:"well",x:ox+wx2,y:oy+wy2,id:"well"+cx+"_"+cy,desc:"puits en pierre"});
      }
      // ── WATCHTOWER / LIGHTHOUSE ──
      else if(structRoll<.26&&(bio==="coast"||bio==="hills"||bio==="mountain")){
        var twx=7+(rand()*3)|0,twy=7+(rand()*3)|0;
        if(twx<CH&&twy<CH){t[twy][twx]=3;
          bl.push({x:ox+twx,y:oy+twy,w:1,d:1,h:80+rand()*40,di:0,pi:0,sd:(rand()*9999)|0,sign:bio==="coast"?"PHARE":null,ac:1,tk:0,aw:0,awc:[0,0,0],hsb:0,sbh:0,sf:0,re:1,rc:[70,70,78],fe:0});
          poi.push({tp:"door",x:ox+twx+.5,y:oy+twy+1.3,id:"twr"+cx+"_"+cy,desc:bio==="coast"?"phare":"tour de guet"});
        }
      }

      // ═══ BIOME PROPS ═══
      for(var ly=0;ly<CH;ly+=2)for(var lx=0;lx<CH;lx+=2){
        if(t[ly]&&(t[ly][lx]!==4&&t[ly][lx]!==7))continue;
        var gx=ox+lx,gy=oy+ly;var r2=rng(H(gx,gy)+222);var roll=r2();
        if(bio==="hills"&&roll<.08)props.push({tp:"rock",x:gx+r2(),y:gy+r2()});
        else if(bio==="hills"&&roll<.1)props.push({tp:"stick",x:gx+r2(),y:gy+r2()});
        else if(bio==="mountain"&&roll<.12)props.push({tp:"rock",x:gx+r2(),y:gy+r2()});
        else if((bio==="field"||bio==="meadow")&&roll<.1)props.push({tp:"flower",x:gx+r2(),y:gy+r2()});
        else if(bio==="meadow"&&roll<.15)props.push({tp:"flower",x:gx+r2(),y:gy+r2()});
        else if(bio==="meadow"&&roll<.17)props.push({tp:"berry",x:gx+r2(),y:gy+r2()});
        else if(bio==="meadow"&&roll<.19)props.push({tp:"stick",x:gx+r2(),y:gy+r2()});
        else if(bio==="forest"&&roll<.04)props.push({tp:"mush",x:gx+r2()*.5+.25,y:gy+r2()*.5+.25});
        else if(bio==="forest"&&roll<.06)props.push({tp:"berry",x:gx+r2(),y:gy+r2()});
        else if(bio==="forest"&&roll<.09)props.push({tp:"stick",x:gx+r2(),y:gy+r2()});
        else if(bio==="forest"&&roll<.1)props.push({tp:"leaf",x:gx+r2(),y:gy+r2()});
        else if(bio==="jungle"&&roll<.06)props.push({tp:"vine",x:gx+r2(),y:gy+r2()});
        else if(bio==="jungle"&&roll<.08)props.push({tp:"berry",x:gx+r2(),y:gy+r2()});
        else if(bio==="jungle"&&roll<.11)props.push({tp:"stick",x:gx+r2(),y:gy+r2()});
        else if(bio==="jungle"&&roll<.11)props.push({tp:"stick",x:gx+r2(),y:gy+r2()});
        else if(bio==="jungle"&&roll<.09)props.push({tp:"fern",x:gx+r2(),y:gy+r2()});
        else if((bio==="swamp"||bio==="marsh")&&roll<.06)props.push({tp:"reed",x:gx+r2(),y:gy+r2()});
        else if((bio==="swamp"||bio==="marsh"||bio==="lake")&&roll<.08)props.push({tp:"clay",x:gx+r2(),y:gy+r2()});
        else if((bio==="desert"||bio==="steppe")&&roll<.03)props.push({tp:"cactus",x:gx+r2(),y:gy+r2()});
        else if(bio==="desert"&&roll<.05)props.push({tp:"skull",x:gx+r2()*.5+.25,y:gy+r2()*.5+.25});
        else if((bio==="snow"||bio==="tundra"||bio==="glacier")&&roll<.04)props.push({tp:"snowpile",x:gx+r2(),y:gy+r2()});
        else if(bio==="tundra"&&roll<.06)props.push({tp:"rock",x:gx+r2(),y:gy+r2()});
        else if(bio==="coast"&&roll<.06&&t[ly][lx]===4)props.push({tp:"shell",x:gx+r2(),y:gy+r2()});
        else if(bio==="farmland"&&roll<.03)props.push({tp:"scarecrow",x:gx+.5,y:gy+.5});
        else if(bio==="farmland"&&roll<.06)props.push({tp:"stick",x:gx+r2(),y:gy+r2()});
        else if(bio==="farmland"&&roll<.08)props.push({tp:"crop",x:gx+.5,y:gy+.5});
        else if(bio==="savanna"&&roll<.04)props.push({tp:"stick",x:gx+r2(),y:gy+r2()});
        else if(bio==="farmland"&&roll<.06)props.push({tp:"stick",x:gx+r2(),y:gy+r2()});
        else if(bio==="moor"&&roll<.05)props.push({tp:"rock",x:gx+r2(),y:gy+r2()});
        else if(bio==="canyon"&&roll<.1)props.push({tp:"rock",x:gx+r2(),y:gy+r2()});
        else if(bio==="savanna"&&roll<.02)props.push({tp:"termite",x:gx+r2(),y:gy+r2()});
        else if(bio==="volcanic"&&roll<.04)props.push({tp:"obsidian",x:gx+r2(),y:gy+r2()});
        else if(bio==="ruins"&&roll<.08)props.push({tp:"wall",x:gx+.5,y:gy+.5});
        else if(bio==="ruins"&&roll<.12)props.push({tp:"pillar",x:gx+.5,y:gy+.5});
        else if(bio==="lake"&&roll<.05&&t[ly][lx]===4)props.push({tp:"reed",x:gx+r2(),y:gy+r2()});
        else if(bio==="lake"&&roll<.07)props.push({tp:"clay",x:gx+r2(),y:gy+r2()});
        else if(bio==="river"&&roll<.04&&t[ly][lx]===9)props.push({tp:"clay",x:gx+r2(),y:gy+r2()});
        else if(bio==="river"&&roll<.06)props.push({tp:"stick",x:gx+r2(),y:gy+r2()});
      }

      // ═══ NATURAL RESOURCES → interactable POI ═══
      var collectables={"flower":"fleurs sauvages","mush":"champignons","shell":"coquillages","reed":"roseaux","berry":"baies","rock":"pierre","vine":"liane","fern":"fougère","obsidian":"obsidienne","stick":"bâton","leaf":"feuille","clay":"argile","crop":"blé"};
      for(var pi2=0;pi2<props.length;pi2++){
        var pr2=props[pi2];
        if(collectables[pr2.tp]&&rand()<.4){// Not all props are POI — some are just decoration
          poi.push({tp:"resource",x:pr2.x,y:pr2.y,id:"r"+cx+"_"+cy+"_"+pi2,desc:collectables[pr2.tp],rtp:pr2.tp});
        }
      }

      // ═══ ANIMALS (dynamic AI) ═══
      var ANIMAL_DEFS={
        bird:{spd:0.015,flee:3,shy:6,meat:0,fly:1,tame:0},
        deer:{spd:0.02,flee:5,shy:8,meat:1,fly:0,tame:0},
        rabbit:{spd:0.025,flee:4,shy:5,meat:1,fly:0,tame:0.3},
        seagull:{spd:0.012,flee:2,shy:4,meat:0,fly:1,tame:0},
        frog:{spd:0.008,flee:2,shy:3,meat:0,fly:0,tame:0},
        parrot:{spd:0.01,flee:3,shy:5,meat:0,fly:1,tame:0.2},
        snake:{spd:0.012,flee:2,shy:4,meat:0,fly:0,tame:0,hostile:1},
        gazelle:{spd:0.03,flee:6,shy:9,meat:1,fly:0,tame:0},
        wolf:{spd:0.02,flee:3,shy:5,meat:1,fly:0,tame:0.1,hostile:1},
        horse:{spd:0.025,flee:4,shy:6,meat:0,fly:0,tame:0.4},
        eagle:{spd:0.015,flee:4,shy:7,meat:0,fly:1,tame:0},
        cow:{spd:0.005,flee:1,shy:3,meat:1,fly:0,tame:0.6},
        chicken:{spd:0.01,flee:2,shy:3,meat:1,fly:0,tame:0.5}
      };
      function pushAnimal(tp2,ax,ay){
        var def=ANIMAL_DEFS[tp2]||{spd:0.01,flee:3,shy:5,meat:0,fly:0,tame:0};
        props.push({tp:tp2,x:ax,y:ay,
          vx:0,vy:0,ai:"idle",aiT:0,homeX:ax,homeY:ay,
          fleeT:0,tameP:0,spd:def.spd,fleeDist:def.flee,shyDist:def.shy,
          canMeat:def.meat,canFly:def.fly,canTame:def.tame,hostile:def.hostile||0,
          isAnimal:1});
        // Add as interactable POI
        var aid="a"+cx+"_"+cy+"_"+props.length;
        poi.push({tp:"animal",x:ax,y:ay,id:aid,desc:tp2,aIdx:props.length-1});
      }
      if(bio!=="desert"&&bio!=="volcanic"&&bio!=="glacier"){
        if(rand()<.15)pushAnimal("bird",ox+rand()*CH,oy+rand()*CH);
        if(rand()<.1&&(bio==="forest"||bio==="meadow"))pushAnimal("deer",ox+3+rand()*10,oy+3+rand()*10);
        if(rand()<.08&&bio!=="snow"&&bio!=="tundra")pushAnimal("rabbit",ox+rand()*CH,oy+rand()*CH);
        if((bio==="coast"||bio==="lake")&&rand()<.2)pushAnimal("seagull",ox+CH-3+rand()*2,oy+rand()*CH);
        if((bio==="swamp"||bio==="marsh"||bio==="lake")&&rand()<.15)pushAnimal("frog",ox+rand()*CH,oy+rand()*CH);
        if(bio==="jungle"&&rand()<.12)pushAnimal("parrot",ox+rand()*CH,oy+rand()*CH);
        if(bio==="jungle"&&rand()<.08)pushAnimal("snake",ox+rand()*CH,oy+rand()*CH);
        if(bio==="savanna"&&rand()<.1)pushAnimal("gazelle",ox+rand()*CH,oy+rand()*CH);
        if(bio==="tundra"&&rand()<.06)pushAnimal("wolf",ox+rand()*CH,oy+rand()*CH);
        if(bio==="steppe"&&rand()<.08)pushAnimal("horse",ox+rand()*CH,oy+rand()*CH);
      }
      if((bio==="mountain"||bio==="canyon")&&rand()<.08)pushAnimal("eagle",ox+rand()*CH,oy+rand()*CH);

      // ═══ RUINS ═══
      if(rand()<.1){
        var rx=(3+rand()*8)|0,ry=(3+rand()*8)|0;
        for(var dy=0;dy<3;dy++)for(var dx=0;dx<3;dx++){
          var lx2=rx+dx,ly2=ry+dy;
          if(lx2<CH&&ly2<CH&&(dy===0||dy===2||dx===0||dx===2)&&rand()<.7)
            if(t[ly2][lx2]===4||t[ly2][lx2]===7)props.push({tp:"wall",x:ox+lx2+.5,y:oy+ly2+.5});
        }
        poi.push({tp:"ruin",x:ox+rx+1.5,y:oy+ry+1.5,id:"ru"+cx+"_"+cy,desc:"ruines"});
      }

      // ═══ CAMPFIRE ═══
      if(rand()<.08){
        var cfx=4+rand()*8,cfy=4+rand()*8;
        props.push({tp:"campfire",x:ox+cfx,y:oy+cfy});
        poi.push({tp:"clearing",x:ox+cfx,y:oy+cfy,id:"cf"+cx+"_"+cy,desc:"restes de feu de camp"});
      }

      // ═══ CLEARINGS ═══
      if(rand()<.12&&!poi.some(function(p){return p.tp==="clearing"}))
        poi.push({tp:"clearing",x:ox+7+rand()*3,y:oy+7+rand()*3,id:"cl"+cx+"_"+cy,desc:"clairière"});

      // Store biome in chunk for Director context
      this._bio=this._bio||{};this._bio[cx+","+cy]=bio;
    }
    return{t:t,bl:bl,lamps:lamps,poi:poi,trees:trees,props:props,ambN:ambN,vehs:vehs,tLights:tLights,cx:cx,cy:cy,bio:bio};
  }
}

// ── DIRECTOR ──

var AK="", ND=false;
function setKey(k){AK=k}
function setNoDir(v){ND=v}
function isNoDir(){return ND}

var DSYS='Tu es le Directeur de Tabula Rasa. Le monde se cree PAR les actions du joueur.\n\n=== PRINCIPE ===\nRien n\'existe tant que le joueur ne le fait pas exister.\nTu OBSERVES, tu INFERES, tu FAIS EMERGER.\n\n=== CHOIX ===\nQuand le joueur interagit avec un objet, un lieu, un PNJ, tu PROPOSES DES CHOIX.\n\"choices\": tableau de 2 a 4 options courtes (max 6 mots chacune).\nChaque option revele une intention differente. Exemples:\n- Pierre trouvee -> [\"Garder comme outil\",\"Lancer au loin\",\"Examiner de pres\",\"Poser et partir\"]\n- Animal apercu -> [\"S\'approcher doucement\",\"Rester immobile\",\"Chercher un baton\"]\n- Porte fermee -> [\"Forcer\",\"Frapper poliment\",\"Ecouter a travers\",\"Partir\"]\n- Feu de camp eteint -> [\"Rallumer\",\"Fouiller les cendres\",\"S\'asseoir a cote\"]\n- PNJ rencontre -> [\"Parler\",\"Observer en silence\",\"S\'eloigner\"]\nLes choix doivent etre CONCRETS, pas abstraits. Pas \"explorer\" mais \"suivre le sentier\".\nChaque choix a des consequences narratives differentes.\nCHOISIR C\'EST RENONCER. Le joueur ne saura jamais ce que les autres options auraient donne.\n\n=== JAUGES (gauges_create) ===\nCreer SEULEMENT quand le comportement l\'implique:\nfaim/soif/endurance/sante/fatigue/chaleur.\ngauges_update modifie (-100 a +100).\n\n=== COMPETENCES (skills_unlock) ===\nLe joueur apprend en faisant: escalade/nage/artisanat/pistage/feu/peche/chasse/dressage.\n\n=== ANIMAUX ===\nLes animaux sont vivants. Ils fuient si le joueur approche vite.\nSi le joueur s\'approche lentement et reste immobile, certains animaux s\'apprivoisent.\n\"tame_animal\":true quand le joueur nourrit ou apprivoise un animal.\n\"hunt_animal\":true quand le joueur chasse.\n\n=== MORTALITÉ ===\nLa mort N\'EXISTE PAS par défaut. Le joueur est immortel.\nSi le joueur se met en danger (noyade, froid, faim, combat), le jeu lui DEMANDE s\'il veut devenir mortel.\nS\'il accepte: le jeu devient un survival. S\'il refuse: il reste invulnérable.\nTu dois adapter ta narration: si le joueur est mortel, le monde est plus tendu. Sinon, plus contemplatif (s\'il a une arme + animal avec viande).\n\n=== CONSEQUENCES ===\nLes choix accumules dessinent un profil.\nSi le joueur choisit toujours la confrontation -> le monde devient plus hostile.\nSi le joueur choisit toujours l\'observation -> il decouvre des details caches.\nSi le joueur choisit toujours la fuite -> il manque des opportunites.\nLe profil guide tes futures narrations et propositions.\n\nSTYLE: 1-2 phrases FR sensorielles. Concret.\nVILLE: Downtown/Industrial/Residential.\nNATURE (20 biomes): foret/champ/collines/riviere/marecage/lande/montagne/desert/cote/neige/marais/fermes/jungle/toundra/canyon/lac/glacier/volcanique/prairie/steppe/savane/ruines. Direction compte: nord=froid, sud=chaud, est=cote, ouest=montagnes.\nINV:{inv}|ARCS:{arcs}|JAUGES:{gauges}|COMP:{skills}|CHOIX_PRECEDENTS:{prev_choices}\nJSON:{"narrative":"ou null","interior":"ou null","choices":[],"bubble":null,"npcs_spawn":[],"npcs_remove":[],"objects_spawn":[],"world_mood":null,"weather":null,"profile_delta":{"exploration":0,"confrontation":0,"social":0,"construction":0,"meaning":0},"gauges_create":[],"gauges_update":{},"skills_unlock":[],"intent_observed":"","tame_animal":false,"hunt_animal":false,"arc":null,"seeds":[],"internal":""}';

function getDistrict(px,py){
  var cx=px/CS,cy=py/CS;
  if(px<0||py<0||px>=CS||py>=CS)return "nature sauvage";
  if(cx<.4&&cy<.5)return "downtown";
  if(cx>.55)return "quartier industriel";
  return "quartier résidentiel";
}

function getTimeOfDay(dayT){
  var h=(dayT*24)|0;
  if(h<5)return "nuit profonde";
  if(h<7)return "aube";
  if(h<12)return "matinée";
  if(h<14)return "midi";
  if(h<18)return "après-midi";
  if(h<21)return "crépuscule";
  return "nuit";
}

async function callDir(action,G,nh){
  if(ND)return null;
  var inv=G.inv.length?G.inv.map(function(o){return o.desc}).join(","):"rien";
  var arcs=G.arcs.filter(function(v,i,s){return s.indexOf(v)===i}).join(",")||"aucun";
  // Build gauges string
  var gStr="";for(var gk in G.gauges)gStr+=gk+":"+G.gauges[gk].val+"/"+G.gauges[gk].max+" ";
  var skStr=G.skills.join(",")||"aucune";
  var intStr=G.intents.slice(-5).join(",")||"-";
  var pcStr=G.choiceLog.slice(-8).join(",");
  var sys=DSYS.replace("{inv}",inv).replace("{arcs}",arcs).replace("{gauges}",gStr||"aucune").replace("{skills}",skStr).replace("{prev_choices}",pcStr||"aucun");
  var district=getDistrict(G.px,G.py);
  var tod=getTimeOfDay(G.dayT);
  var mood=G.mood||"neutral";
  var weather=G.wth||"clear";

  var ctx="#"+(G.ni+1)+"|"+district+"|"+tod+"|"+weather+"|mood:"+mood+"|"+(G.dw|0)+"pas\n"+(G.intr?"INT":"EXT")+"\nACTION:"+action+"\n"+(nh?"HIST:"+nh+"\n":"")+"\nLog:"+G.nLog.slice(-6).join("|")+"\nPNJ:"+G.npcs.map(function(n){return n.desc}).join("|")+"\nIntents:"+intStr+"\nJauges:"+gStr+"\nComp:"+skStr+"\nArcs:"+arcs;

  try{
    var r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",
      headers:{"Content-Type":"application/json","x-api-key":AK,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:500,system:sys,messages:[{role:"user",content:ctx}]})});
    if(!r.ok)return null;
    var d=await r.json(),t=(d.content||[]).map(function(c){return c.text}||"").join("")||"";
    return JSON.parse(t.replace(/"""json|"""/g,"").trim());
  }catch(e){return null}
}

function save(G){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify({
    px:G.px,py:G.py,prof:G.prof,nLog:G.nLog,rules:G.rules,seeds:G.seeds,
    npcs:G.npcs,objs:G.objs,ni:G.ni,dw:G.dw,tv:Array.from(G.tv),pt:G.pt,
    mood:G.mood,wth:G.wth,dayT:G.dayT,
    inv:G.inv,nc:G.nc,arcs:G.arcs,lpi:G.lpi,
    gauges:G.gauges,skills:G.skills,intents:G.intents,choiceLog:G.choiceLog,
    worldMods:world.mods,mortal:G.mortal,mortalAsked:G.mortalAsked,
    volMaster:G.volMaster,volSfx:G.volSfx
  }))}catch(e){}
}

function load(){
  try{
    var s=localStorage.getItem(SAVE_KEY);
    if(s){var d=JSON.parse(s);d.tv=new Set(d.tv||[]);d.gauges=d.gauges||{};d.skills=d.skills||[];d.intents=d.intents||[];d.choiceLog=d.choiceLog||[];return d}
  }catch(e){}
  return null;
}

// ── RENDERER ──

function drawGnd(c,sx,sy,tile,dL,gx,gy,time){
  var si=-1,useLand=false;
  // ── CITY tiles → city spritesheet ──
  if(tile===1){si=(gx%8<2&&gy%8<2)?pickT(CROSS_T,gx,gy):pickT(ROAD_T,gx,gy)}
  else if(tile===2){var roll=H(gx*5,gy*11)%20;si=roll===0?pickT(SIDE_LAMP_T,gx,gy):roll===1?pickT(SIDE_TREE_T,gx,gy):roll===2?pickT(SIDE_GRASS_T,gx,gy):pickT(SIDE_T,gx,gy)}
  // ── WILDERNESS tiles → landscape spritesheet ──
  else if(tile===4){// Grass — check if in city (park) or wilderness
    var inC=gx>=0&&gx<CS&&gy>=0&&gy<CS;
    if(inC){si=pickT(GRASS_T,gx,gy)}// city park → city sheet
    else{si=pickT(WGRASS_T,gx,gy);useLand=true}// wilderness → landscape sheet
  }
  else if(tile===7){si=pickT(WDIRT_T,gx,gy);useLand=true}// dirt path
  else if(tile===8){si=pickT(WWATER_T,gx,gy);useLand=true}// water
  else if(tile===9){si=pickT([0,2,3,7],gx,gy);useLand=true}// riverbank = grass edge

  // Draw sprite
  var drawn=false;
  if(si>=0){
    if(useLand)drawn=drawLSpr(c,si,sx,sy);
    else drawn=drawSpr(c,si,sx,sy);
  }
  if(drawn){
    // Night darkening overlay
    if(dL<.7){
      var atlas=useLand?LATLAS:ATLAS;var a=atlas[si];
      if(a){c.globalAlpha=(.7-dL)*1.1;c.fillStyle="rgba(4,6,18,1)";var dw=Math.round(a[2]*TSC),dh=Math.round(a[3]*TSC);c.fillRect(sx-dw/2,sy-TH,dw,dh);c.globalAlpha=1}
    }
    return;
  }
  // ── Fallback: canvas diamond ──
  var m=.6+dL*.4;
  var co=tile===1?[18,18,35]:tile===2?[55,55,72]:tile===3?[16,16,28]:tile===4?[20,38,18]:tile===7?[42,36,26]:tile===8?[14,24,50]:tile===9?[26,32,22]:tile===10?[50,44,36]:[16,16,26];
  c.fillStyle="rgb("+(co[0]*m|0)+","+(co[1]*m|0)+","+(co[2]*m|0)+")";
  c.beginPath();c.moveTo(sx,sy-TH);c.lineTo(sx+TW,sy);c.lineTo(sx,sy+TH);c.lineTo(sx-TW,sy);c.closePath();c.fill();
  if(tile===8){c.fillStyle="rgba(35,55,95,"+(0.05+Math.sin(time*2+gx*.7+gy*.5)*.03)+")";c.beginPath();c.moveTo(sx,sy-TH);c.lineTo(sx+TW,sy);c.lineTo(sx,sy+TH);c.lineTo(sx-TW,sy);c.closePath();c.fill()}
}

function drawBldg(c,b,cx,cy,sw,sh,dL,time){
  var dp=DPAL[b.di||0];var st=dp[b.pi%dp.length];
  var rt=iso(b.x+b.w,b.y,cx,cy,sw,sh),lt=iso(b.x,b.y+b.d,cx,cy,sw,sh);
  var fr=iso(b.x+b.w,b.y+b.d,cx,cy,sw,sh),bk=iso(b.x,b.y,cx,cy,sw,sh);
  if(fr.sx+220<0||bk.sx-220>sw||fr.sy-b.h-110>sh||bk.sy-b.h+110<0)return;
  var h=b.h,m=.6+dL*.4,n=1-dL;var sfC=DST[b.di||0];

  // Shadow
  c.globalAlpha=.06;c.fillStyle="#000";c.beginPath();c.moveTo(fr.sx,fr.sy);c.lineTo(fr.sx+h*.08,fr.sy+h*.04);c.lineTo(lt.sx+h*.08,lt.sy+h*.04);c.lineTo(lt.sx,lt.sy);c.closePath();c.fill();c.globalAlpha=1;
  // Right face
  c.fillStyle="rgb("+(st.r[0]*m|0)+","+(st.r[1]*m|0)+","+(st.r[2]*m|0)+")";c.beginPath();c.moveTo(rt.sx,rt.sy);c.lineTo(fr.sx,fr.sy);c.lineTo(fr.sx,fr.sy-h);c.lineTo(rt.sx,rt.sy-h);c.closePath();c.fill();
  // Voxel texture on right face
  var vti=VBLD_D[b.di||0][b.sd%VBLD_D[b.di||0].length];
  drawVoxFace(c,vti,rt.sx,rt.sy,fr.sx,fr.sy,fr.sx,fr.sy-h,rt.sx,rt.sy-h);
  // Left face
  c.fillStyle="rgb("+(st.l[0]*m|0)+","+(st.l[1]*m|0)+","+(st.l[2]*m|0)+")";c.beginPath();c.moveTo(lt.sx,lt.sy);c.lineTo(fr.sx,fr.sy);c.lineTo(fr.sx,fr.sy-h);c.lineTo(lt.sx,lt.sy-h);c.closePath();c.fill();
  // Voxel texture on left face
  drawVoxFace(c,vti,lt.sx,lt.sy,fr.sx,fr.sy,fr.sx,fr.sy-h,lt.sx,lt.sy-h);
  // Top
  c.fillStyle="rgb("+(st.t[0]*m|0)+","+(st.t[1]*m|0)+","+(st.t[2]*m|0)+")";c.beginPath();c.moveTo(bk.sx,bk.sy-h);c.lineTo(rt.sx,rt.sy-h);c.lineTo(fr.sx,fr.sy-h);c.lineTo(lt.sx,lt.sy-h);c.closePath();c.fill();
  // Industrial brick hint
  if(b.di===1&&h>60){c.strokeStyle="rgba(0,0,0,"+(.04*m)+")";c.lineWidth=.3;
    var rows=(h/8)|0;for(var r=2;r<rows;r++){c.beginPath();c.moveTo(rt.sx,rt.sy-h+h*r/rows);c.lineTo(fr.sx,fr.sy-h+h*r/rows);c.stroke()}}
  // Roof parapet
  if(b.re){var rc=b.rc;
    c.fillStyle="rgb("+(rc[0]*m|0)+","+(rc[1]*m|0)+","+(rc[2]*m|0)+")";
    c.beginPath();c.moveTo(rt.sx,rt.sy-h);c.lineTo(fr.sx,fr.sy-h);c.lineTo(fr.sx,fr.sy-h-3);c.lineTo(rt.sx,rt.sy-h-3);c.closePath();c.fill();
    c.fillStyle="rgb("+((rc[0]-8)*m|0)+","+((rc[1]-8)*m|0)+","+((rc[2]-8)*m|0)+")";
    c.beginPath();c.moveTo(lt.sx,lt.sy-h);c.lineTo(fr.sx,fr.sy-h);c.lineTo(fr.sx,fr.sy-h-3);c.lineTo(lt.sx,lt.sy-h-3);c.closePath();c.fill();}
  // Setback
  if(b.hsb){var sh2=b.sbh;var ins=.2;
    var srt=iso(b.x+b.w*(1-ins),b.y+b.d*ins,cx,cy,sw,sh),slt=iso(b.x+b.w*ins,b.y+b.d*(1-ins),cx,cy,sw,sh);
    var sfr=iso(b.x+b.w*(1-ins),b.y+b.d*(1-ins),cx,cy,sw,sh);
    c.fillStyle="rgb("+((st.r[0]+8)*m|0)+","+((st.r[1]+8)*m|0)+","+((st.r[2]+8)*m|0)+")";
    c.beginPath();c.moveTo(srt.sx,srt.sy-sh2);c.lineTo(sfr.sx,sfr.sy-sh2);c.lineTo(sfr.sx,sfr.sy-h);c.lineTo(srt.sx,srt.sy-h);c.closePath();c.fill();
    c.fillStyle="rgb("+((st.l[0]+5)*m|0)+","+((st.l[1]+5)*m|0)+","+((st.l[2]+5)*m|0)+")";
    c.beginPath();c.moveTo(slt.sx,slt.sy-sh2);c.lineTo(sfr.sx,sfr.sy-sh2);c.lineTo(sfr.sx,sfr.sy-h);c.lineTo(slt.sx,slt.sy-h);c.closePath();c.fill();
    c.fillStyle="rgb("+(st.t[0]*m*.88|0)+","+(st.t[1]*m*.88|0)+","+(st.t[2]*m*.88|0)+")";
    c.beginPath();c.moveTo(bk.sx,bk.sy-sh2);c.lineTo(rt.sx,rt.sy-sh2);c.lineTo(fr.sx,fr.sy-sh2);c.lineTo(lt.sx,lt.sy-sh2);c.closePath();c.fill();}
  // Front edge
  c.strokeStyle="rgba(0,0,0,"+(.18*m)+")";c.lineWidth=.5;c.beginPath();c.moveTo(fr.sx,fr.sy);c.lineTo(fr.sx,fr.sy-h);c.stroke();
  // Fire escape
  if(b.fe){c.strokeStyle="rgba(50,48,42,"+(.35*m)+")";c.lineWidth=.6;
    var feX=lt.sx+(fr.sx-lt.sx)*.7;var floors=Math.max(2,(h/30)|0);
    for(var f=1;f<floors;f++){var fy=fr.sy-h*f/floors;
      c.beginPath();c.moveTo(feX-4,fy);c.lineTo(feX+4,fy);c.stroke();
      c.beginPath();c.moveTo(feX-4,fy);c.lineTo(feX-4,fy-5);c.stroke();
      c.beginPath();c.moveTo(feX+4,fy);c.lineTo(feX+4,fy-5);c.stroke();
      if(f<floors-1){c.beginPath();c.moveTo(feX,fy);c.lineTo(feX+2,fy+h/floors*.6);c.stroke()}}}
  // Storefront
  if(b.sf){var sfH=Math.min(16,h*.11);
    c.fillStyle="rgb("+(sfC[0]*m|0)+","+(sfC[1]*m|0)+","+(sfC[2]*m|0)+")";
    c.beginPath();c.moveTo(rt.sx,rt.sy);c.lineTo(fr.sx,fr.sy);c.lineTo(fr.sx,fr.sy-sfH);c.lineTo(rt.sx,rt.sy-sfH);c.closePath();c.fill();
    c.beginPath();c.moveTo(lt.sx,lt.sy);c.lineTo(fr.sx,fr.sy);c.lineTo(fr.sx,fr.sy-sfH);c.lineTo(lt.sx,lt.sy-sfH);c.closePath();c.fill();
    if(n>.2){var swx=rt.sx+(fr.sx-rt.sx)*.5;
      c.fillStyle="rgba(255,200,100,"+(n*.08)+")";c.fillRect(swx-8,fr.sy-sfH+2,16,sfH-4);
      c.globalAlpha=n*.12;c.fillStyle="#ffc860";c.beginPath();c.arc(swx,fr.sy-sfH*.5,12,0,Math.PI*2);c.fill();c.globalAlpha=1}}
  // Awning
  if(b.aw){var awY=fr.sy-(b.sf?18:14);var ac=b.awc;
    c.fillStyle="rgba("+(ac[0]*m|0)+","+(ac[1]*m|0)+","+(ac[2]*m|0)+","+(.45*m)+")";
    var awL=rt.sx+(fr.sx-rt.sx)*.2,awR=rt.sx+(fr.sx-rt.sx)*.8;
    c.beginPath();c.moveTo(awL,awY);c.lineTo(awR,awY);c.lineTo(awR+3,awY+5);c.lineTo(awL+3,awY+5);c.closePath();c.fill();
    c.fillStyle="rgba(0,0,0,"+(.04*m)+")";c.fillRect(awL,awY+5,awR-awL+3,3);}
  // Door + frame
  var doorX=rt.sx+(fr.sx-rt.sx)*.5;
  c.fillStyle="rgba("+((sfC[0]-12)*m|0)+","+((sfC[1]-12)*m|0)+","+((sfC[2]-12)*m|0)+","+(.6*m)+")";
  c.fillRect(doorX-3,fr.sy-9,6,9);
  c.strokeStyle="rgba(80,75,65,"+(.12*m)+")";c.lineWidth=.3;c.strokeRect(doorX-3,fr.sy-9,6,9);
  // Ledges
  var nL=(h/65)|0;for(var i=1;i<=nL;i++){var ly=h*i/(nL+1);
    c.fillStyle="rgba(80,80,80,"+(.05*m)+")";c.beginPath();c.moveTo(rt.sx,rt.sy-ly);c.lineTo(fr.sx,fr.sy-ly);c.lineTo(fr.sx,fr.sy-ly+1.5);c.lineTo(rt.sx,rt.sy-ly+1.5);c.closePath();c.fill();}
  // Windows
  var nR=Math.max(2,(h/20)|0),startR=b.sf?1:0;
  for(var face=0;face<2;face++){var wf=rng(b.sd+(face?777:0)),sp=face?lt:rt,nc=(face?b.d:b.w)*2;
    for(var r=startR;r<nR;r++)for(var cc=0;cc<nc;cc++){if(wf()<.3)continue;var tx=(cc+.5)/nc,sy2=(r+.4)/nR;
      var wx=sp.sx+(fr.sx-sp.sx)*tx,wy=sp.sy+(fr.sy-sp.sy)*tx-h+h*sy2;
      if(b.hsb&&wy<fr.sy-b.sbh-5)continue;var lit=wf()<(dL>.5?0.05:.42);
      if(lit){var wc=WLC[(wf()*WLC.length)|0];
        c.globalAlpha=n*.06;c.fillStyle="rgb("+(wc[0])+","+(wc[1])+","+(wc[2])+")";c.beginPath();c.arc(wx,wy+1,6,0,Math.PI*2);c.fill();
        c.globalAlpha=n>.4?0.72:.26;c.fillStyle="rgb("+(wc[0])+","+(wc[1])+","+(wc[2])+")";c.fillRect(wx-2,wy-3,4,6);
      }else{c.globalAlpha=.35;c.fillStyle="rgba(6,6,14,.5)";c.fillRect(wx-2,wy-3,4,6)}}}
  c.globalAlpha=1;

  // Rooftop details
  var tcx=(bk.sx+fr.sx)/2,tcy=(bk.sy+fr.sy)/2-h;
  if(b.ac){c.fillStyle="rgba(85,85,95,"+(.28*m)+")";c.fillRect(tcx-4,tcy-2,5,3)}
  if(b.tk){c.fillStyle="rgba(60,55,45,"+(.28*m)+")";c.beginPath();c.ellipse(tcx+5,tcy-2,3,2,0,0,Math.PI*2);c.fill();c.fillRect(tcx+3.5,tcy,3,2)}

  // ── CHIMNEY SMOKE (some tall buildings, night only) ──
  if(b.ac&&h>100&&n>.4){
    var smokeX=tcx-3,smokeY=tcy-4;
    for(var i=0;i<3;i++){
      var t2=time*.6+i*1.8+b.sd;
      var rise=Math.abs(Math.sin(t2))*12;
      var drift=Math.sin(t2*1.3)*3;
      c.globalAlpha=n*Math.max(0,.04-.002*rise);
      c.fillStyle="#888";
      c.beginPath();c.arc(smokeX+drift,smokeY-rise,2+i*.5,0,Math.PI*2);c.fill();
    }
    c.globalAlpha=1;
  }

  // ── NEON SIGN (flickers at night) ──
  if(b.sign&&n>.3){
    var sgX=rt.sx+(fr.sx-rt.sx)*.5,sgY=fr.sy-(b.sf?18:14);
    // Sign background
    c.globalAlpha=n*.5;c.font="bold 5px monospace";c.textAlign="center";
    var tw=c.measureText(b.sign).width+4;
    c.fillStyle="rgba(25,20,15,.85)";c.fillRect(sgX-tw/2,sgY-3,tw,7);

    // Neon flicker effect — some signs blink
    var neonIdx=b.sd%NEON.length;
    var nc=NEON[neonIdx];
    var flicker=b.sd%3===0;// 1 in 3 signs flicker
    var signOn=true;
    if(flicker){
      // Irregular flicker pattern
      var ft=time*3+b.sd;
      signOn=Math.sin(ft)>-0.3&&Math.sin(ft*7.3)>-0.8;
    }

    if(signOn){
      // Colored neon text
      c.globalAlpha=n*.65;
      c.fillStyle="rgb("+(nc[0])+","+(nc[1])+","+(nc[2])+")";
      c.fillText(b.sign,sgX,sgY+2);
      // Neon glow halo
      c.globalAlpha=n*.08;
      c.fillStyle="rgb("+(nc[0])+","+(nc[1])+","+(nc[2])+")";
      c.beginPath();c.arc(sgX,sgY,12,0,Math.PI*2);c.fill();
    }else{
      // Off — dim text
      c.globalAlpha=n*.15;c.fillStyle="#555";c.fillText(b.sign,sgX,sgY+2);
    }
    c.globalAlpha=1;
  }
}

function drawTL(c,tl,cx,cy,sw,sh,dL,time){
  var p=iso(tl.x,tl.y,cx,cy,sw,sh);if(p.sx<-40||p.sx>sw+40)return;
  var n=1-dL;c.strokeStyle="rgba(55,55,55,"+(.5+n*.3)+")";c.lineWidth=1.4;c.beginPath();c.moveTo(p.sx,p.sy);c.lineTo(p.sx,p.sy-24);c.stroke();
  c.fillStyle="rgba(28,28,32,.7)";c.fillRect(p.sx-2.5,p.sy-30,5,9);
  var cycle=((time+tl.ph)*.3)%3|0;var colors=[[210,45,45],[210,170,45],[45,190,70]];
  for(var i=0;i<3;i++){var act=i===cycle;var cc=colors[i];
    c.fillStyle=act?"rgba("+(cc[0])+","+(cc[1])+","+(cc[2])+","+(.75*(.7+n*.3))+")":"rgba(35,35,35,.35)";
    c.beginPath();c.arc(p.sx,p.sy-28+i*3,1.2,0,Math.PI*2);c.fill();
    if(act&&n>.3){c.globalAlpha=n*.05;c.fillStyle="rgb("+(cc[0])+","+(cc[1])+","+(cc[2])+")";c.beginPath();c.arc(p.sx,p.sy-28+i*3,7,0,Math.PI*2);c.fill();c.globalAlpha=1}}
}

function drawVeh(c,v,cx,cy,sw,sh,dL){
  var p=iso(v.x,v.y,cx,cy,sw,sh);if(p.sx<-40||p.sx>sw+40)return;
  var n=1-dL;
  var vtype=VTYPES[H(Math.round(v.x*100),Math.round(v.y*100))%VTYPES.length];

  // Shadow — bigger for vans/trucks
  var shadowW=vtype===2?12:vtype===1?10:9;
  c.fillStyle="rgba(0,0,0,.1)";c.beginPath();c.ellipse(p.sx,p.sy+2,shadowW,4,0,0,Math.PI*2);c.fill();

  var col=v.col;
  var dr=col.replace(/#(..)(..)(..)/,function(m2,r,g,b){return "rgb("+(parseInt(r,16)*.55|0)+","+(parseInt(g,16)*.55|0)+","+(parseInt(b,16)*.55|0)+")"});
  if(vtype===0){
    // ── SEDAN (original shape) ──
    c.fillStyle=col;c.beginPath();c.moveTo(p.sx,p.sy-5-TH*.3);c.lineTo(p.sx+8,p.sy-5);c.lineTo(p.sx,p.sy-5+TH*.3);c.lineTo(p.sx-8,p.sy-5);c.closePath();c.fill();
    c.fillStyle=dr;c.beginPath();c.moveTo(p.sx+8,p.sy-5);c.lineTo(p.sx,p.sy-5+TH*.3);c.lineTo(p.sx,p.sy+TH*.3);c.lineTo(p.sx+8,p.sy);c.closePath();c.fill();
    c.fillStyle=col;c.globalAlpha=.75;c.beginPath();c.moveTo(p.sx-8,p.sy-5);c.lineTo(p.sx,p.sy-5+TH*.3);c.lineTo(p.sx,p.sy+TH*.3);c.lineTo(p.sx-8,p.sy);c.closePath();c.fill();c.globalAlpha=1;
    // Windshield
    c.fillStyle="rgba(70,90,120,"+(.3+n*.15)+")";c.beginPath();c.moveTo(p.sx-2,p.sy-6);c.lineTo(p.sx+3,p.sy-4.5);c.lineTo(p.sx+2,p.sy-3);c.lineTo(p.sx-3,p.sy-4.5);c.closePath();c.fill();
  }else if(vtype===1){
    // ── VAN — taller, boxier ──
    var vh=8;
    c.fillStyle=col;c.beginPath();c.moveTo(p.sx,p.sy-vh-TH*.25);c.lineTo(p.sx+7,p.sy-vh);c.lineTo(p.sx,p.sy-vh+TH*.25);c.lineTo(p.sx-7,p.sy-vh);c.closePath();c.fill();
    // Right side — taller
    c.fillStyle=dr;c.beginPath();c.moveTo(p.sx+7,p.sy-vh);c.lineTo(p.sx,p.sy-vh+TH*.25);c.lineTo(p.sx,p.sy+TH*.25);c.lineTo(p.sx+7,p.sy);c.closePath();c.fill();
    // Left side
    c.fillStyle=col;c.globalAlpha=.7;c.beginPath();c.moveTo(p.sx-7,p.sy-vh);c.lineTo(p.sx,p.sy-vh+TH*.25);c.lineTo(p.sx,p.sy+TH*.25);c.lineTo(p.sx-7,p.sy);c.closePath();c.fill();c.globalAlpha=1;
    // Back door lines
    c.strokeStyle="rgba(0,0,0,"+(.1)+")";c.lineWidth=.4;c.beginPath();c.moveTo(p.sx-7,p.sy-vh*.5);c.lineTo(p.sx-7,p.sy);c.stroke();
  }else{
    // ── TRUCK — wider, flat top ──
    var th=6;
    // Cab
    c.fillStyle=col;c.beginPath();c.moveTo(p.sx+4,p.sy-th-TH*.2);c.lineTo(p.sx+10,p.sy-th);c.lineTo(p.sx+4,p.sy-th+TH*.2);c.lineTo(p.sx-2,p.sy-th);c.closePath();c.fill();
    c.fillStyle=dr;c.beginPath();c.moveTo(p.sx+10,p.sy-th);c.lineTo(p.sx+4,p.sy-th+TH*.2);c.lineTo(p.sx+4,p.sy+TH*.2);c.lineTo(p.sx+10,p.sy);c.closePath();c.fill();
    // Flatbed/cargo
    c.fillStyle="rgba(60,58,52,"+(.8)+")";c.beginPath();c.moveTo(p.sx-8,p.sy-4-TH*.15);c.lineTo(p.sx+3,p.sy-4);c.lineTo(p.sx-8+11,p.sy-4+TH*.15);c.lineTo(p.sx-8,p.sy-4);c.closePath();c.fill();
    c.fillStyle="rgba(48,46,40,"+(.8)+")";c.beginPath();c.moveTo(p.sx-8,p.sy-4);c.lineTo(p.sx-8+11,p.sy-4+TH*.15);c.lineTo(p.sx-8+11,p.sy+TH*.15);c.lineTo(p.sx-8,p.sy);c.closePath();c.fill();
  }

  // Headlights + tail (all types)
  if(n>.3&&!v.pk){var dirs=[[1,0],[0,1],[-1,0],[0,-1]];var hx=dirs[v.dir%4][0],hy=dirs[v.dir%4][1];
    // Headlight beam cone
    var hlx=p.sx+hx*10,hly=p.sy+hy*5-3;
    var beamLen=25;var beamW=12;
    c.globalAlpha=n*.04;c.fillStyle="#ffd866";
    c.beginPath();c.moveTo(hlx,hly);
    c.lineTo(hlx+hx*beamLen-hy*beamW,hly+hy*beamLen*.5+hx*beamW*.3);
    c.lineTo(hlx+hx*beamLen+hy*beamW,hly+hy*beamLen*.5-hx*beamW*.3);
    c.closePath();c.fill();
    // Headlight dots
    c.globalAlpha=n*.1;c.fillStyle="#ffd866";c.beginPath();c.arc(hlx,hly,6,0,Math.PI*2);c.fill();
    c.globalAlpha=n*.35;c.fillStyle="#ffe888";c.beginPath();c.arc(hlx,hly,1.2,0,Math.PI*2);c.fill();
    // Taillights
    c.globalAlpha=n*.3;c.fillStyle="#f33";
    c.beginPath();c.arc(p.sx-hx*9-1,p.sy-hy*4-3,.8,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(p.sx-hx*9+1,p.sy-hy*4-3,.8,0,Math.PI*2);c.fill();
    c.globalAlpha=1}
}

function drawLamp(c,l,cx,cy,sw,sh,dL){
  var p=iso(l.x,l.y,cx,cy,sw,sh);if(p.sx<-50||p.sx>sw+50)return;
  var n=1-dL;c.strokeStyle="rgba(65,65,65,"+(.5+n*.3)+")";c.lineWidth=1.4;c.beginPath();c.moveTo(p.sx,p.sy);c.lineTo(p.sx,p.sy-30);c.stroke();
  c.lineWidth=.7;c.beginPath();c.moveTo(p.sx,p.sy-28);c.lineTo(p.sx+4,p.sy-31);c.stroke();
  c.fillStyle="rgba(255,200,120,"+(.25+n*.5)+")";c.beginPath();c.arc(p.sx+4,p.sy-32,1.5,0,Math.PI*2);c.fill();
  if(n>.3){c.globalAlpha=n*.1;c.fillStyle="#ffb040";c.beginPath();c.arc(p.sx+2,p.sy+2,32,0,Math.PI*2);c.fill();
    c.globalAlpha=n*.05;c.beginPath();c.arc(p.sx+2,p.sy+2,16,0,Math.PI*2);c.fill();c.globalAlpha=1}
}

function drawFig(c,sx,sy,time,mv,bc,lc,sc,glow,idle){
  if(!lc)lc="#282838";if(!sc)sc=1;
  if(idle==="lean"&&!mv){c.fillStyle="rgba(0,0,0,.1)";c.beginPath();c.ellipse(sx,sy+1,4,2,0,0,Math.PI*2);c.fill();
    c.fillStyle=bc;c.fillRect(sx-4,sy-21,8,13);c.fillStyle="#c8beb4";c.beginPath();c.arc(sx+1,sy-25,3.5,0,Math.PI*2);c.fill();
    c.strokeStyle=lc;c.lineWidth=1.6;c.beginPath();c.moveTo(sx-1,sy-8);c.lineTo(sx-2,sy-1);c.moveTo(sx+3,sy-8);c.lineTo(sx+4,sy-1);c.stroke();return}
  if(idle==="sit"&&!mv){c.fillStyle="rgba(0,0,0,.08)";c.beginPath();c.ellipse(sx,sy+1,4,2,0,0,Math.PI*2);c.fill();
    c.fillStyle=bc;c.fillRect(sx-5,sy-15,10,7);c.fillStyle="#c8beb4";c.beginPath();c.arc(sx,sy-19,3.5,0,Math.PI*2);c.fill();
    c.strokeStyle=lc;c.lineWidth=1.6;c.beginPath();c.moveTo(sx-3,sy-8);c.lineTo(sx-5,sy-2);c.moveTo(sx+3,sy-8);c.lineTo(sx+5,sy-2);c.stroke();return}
  var bob=mv?Math.abs(Math.sin(time*8))*2.5*sc:0;var leg=mv?Math.sin(time*10)*3*sc:0;var arm=mv?Math.sin(time*10+1)*2*sc:0;
  c.fillStyle="rgba(0,0,0,.14)";c.beginPath();c.ellipse(sx,sy+1,6,3,0,0,Math.PI*2);c.fill();
  c.strokeStyle=lc;c.lineWidth=2;c.beginPath();c.moveTo(sx-2,sy-9-bob);c.lineTo(sx-3-leg,sy-1);c.moveTo(sx+2,sy-9-bob);c.lineTo(sx+3+leg,sy-1);c.stroke();
  c.fillStyle=bc;c.fillRect(sx-5,sy-23-bob,10,14);
  c.strokeStyle=bc;c.lineWidth=1.8;c.beginPath();c.moveTo(sx-5,sy-21-bob);c.lineTo(sx-7-arm,sy-13-bob);c.moveTo(sx+5,sy-21-bob);c.lineTo(sx+7+arm,sy-13-bob);c.stroke();
  c.fillStyle="#c8beb4";c.beginPath();c.arc(sx,sy-27-bob,4,0,Math.PI*2);c.fill();
  c.fillStyle="#222028";c.beginPath();c.arc(sx,sy-28.5-bob,4,Math.PI,Math.PI*2);c.fill();
  if(glow){c.globalAlpha=.04;c.fillStyle="#a8b8cc";c.beginPath();c.arc(sx,sy-14,24,0,Math.PI*2);c.fill();c.globalAlpha=1}
}

function drawTree(c,tx,ty,cx,cy,sw,sh,dL){
  var p=iso(tx+.5,ty+.5,cx,cy,sw,sh);if(p.sx<-20||p.sx>sw+20||p.sy<-45||p.sy>sh+20)return;
  var m=.65+dL*.35;
  var variant=H(tx*5,ty*9)%3;// 3 tree shapes
  c.fillStyle="rgb("+(46*m|0)+","+(32*m|0)+","+(18*m|0)+")";
  if(variant===0){// Round canopy
    c.fillRect(p.sx-1.5,p.sy-15,3,15);
    c.fillStyle="rgb("+(24*m|0)+","+(46*m|0)+","+(18*m|0)+")";c.beginPath();c.arc(p.sx,p.sy-20,8,0,Math.PI*2);c.fill();
    c.fillStyle="rgb("+(30*m|0)+","+(56*m|0)+","+(24*m|0)+")";c.beginPath();c.arc(p.sx-3,p.sy-17,5.5,0,Math.PI*2);c.fill();
  }else if(variant===1){// Tall conifer
    c.fillRect(p.sx-.8,p.sy-18,.6+1,18);
    c.fillStyle="rgb("+(20*m|0)+","+(42*m|0)+","+(16*m|0)+")";
    c.beginPath();c.moveTo(p.sx,p.sy-26);c.lineTo(p.sx+5,p.sy-14);c.lineTo(p.sx-5,p.sy-14);c.closePath();c.fill();
    c.beginPath();c.moveTo(p.sx,p.sy-22);c.lineTo(p.sx+6,p.sy-10);c.lineTo(p.sx-6,p.sy-10);c.closePath();c.fill();
  }else{// Bushy small
    c.fillRect(p.sx-1,p.sy-12,2,12);
    c.fillStyle="rgb("+(28*m|0)+","+(52*m|0)+","+(22*m|0)+")";c.beginPath();c.arc(p.sx,p.sy-15,6,0,Math.PI*2);c.fill();
    c.fillStyle="rgb("+(22*m|0)+","+(44*m|0)+","+(18*m|0)+")";c.beginPath();c.arc(p.sx+3,p.sy-13,5,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(p.sx-3,p.sy-14,4.5,0,Math.PI*2);c.fill();
  }
}

function drawPOI(c,poi,cx,cy,sw,sh,time,near){
  if(poi.tp==="npc")return;var p=iso(poi.x,poi.y,cx,cy,sw,sh);
  if(p.sx<-30||p.sx>sw+30)return;var pulse=near?0.5+Math.sin(time*4)*.2:.08;var r=near?5:2;
  var co={door:[255,180,80],bench:[110,200,110],corner:[130,130,210],object:[255,210,90],clearing:[90,210,150],ruin:[190,170,130],well:[100,160,200],resource:[120,180,90],animal:[200,160,100],fire:[255,140,40]}[poi.tp]||[170,170,170];
  if(near){c.globalAlpha=pulse*.15;c.strokeStyle="rgb("+(co[0])+","+(co[1])+","+(co[2])+")";c.lineWidth=1.5;
    c.beginPath();c.arc(p.sx,p.sy-2,10+Math.sin(time*3)*4,0,Math.PI*2);c.stroke();
    c.globalAlpha=pulse*.2;c.fillStyle="rgb("+(co[0])+","+(co[1])+","+(co[2])+")";c.beginPath();c.arc(p.sx,p.sy-2,12,0,Math.PI*2);c.fill();c.globalAlpha=1}
  c.fillStyle="rgba("+(co[0])+","+(co[1])+","+(co[2])+","+(pulse)+")";c.beginPath();c.arc(p.sx,p.sy-2,r,0,Math.PI*2);c.fill();
}

function drawProp(c,pr,cx,cy,sw,sh,dL){
  var p=iso(pr.x,pr.y,cx,cy,sw,sh);if(p.sx<-25||p.sx>sw+25)return;
  var m=.6+dL*.4;
  if(pr.tp==="tc"){c.fillStyle="rgb("+(48*m|0)+","+(48*m|0)+","+(52*m|0)+")";c.fillRect(p.sx-3,p.sy-9,6,9);
    c.fillStyle="rgb("+(55*m|0)+","+(55*m|0)+","+(60*m|0)+")";c.fillRect(p.sx-3.5,p.sy-10,7,2);}
  else if(pr.tp==="hy"){c.fillStyle="rgb("+(145*m|0)+","+(36*m|0)+","+(30*m|0)+")";c.fillRect(p.sx-2,p.sy-8,4,8);c.fillRect(p.sx-3,p.sy-6,6,2);}
  else if(pr.tp==="tr"){c.fillStyle="rgba(52,48,38,"+(.4*m)+")";c.fillRect(p.sx-2,p.sy-2,3,2)}
  else if(pr.tp==="pu"){c.fillStyle="rgba(32,42,68,"+(.1+(1-dL)*.05)+")";c.beginPath();c.ellipse(p.sx,p.sy,6,3,0,0,Math.PI*2);c.fill()}
  else if(pr.tp==="dm"){c.fillStyle="rgb("+(38*m|0)+","+(52*m|0)+","+(32*m|0)+")";c.fillRect(p.sx-5,p.sy-8,10,8);
    c.fillStyle="rgb("+(32*m|0)+","+(45*m|0)+","+(28*m|0)+")";c.fillRect(p.sx-6,p.sy-9,12,2);}
  else if(pr.tp==="nb"){c.fillStyle="rgb("+(35*m|0)+","+(55*m|0)+","+(100*m|0)+")";c.fillRect(p.sx-2.5,p.sy-7,5,7);
    c.fillStyle="rgba(200,200,200,"+(.15*m)+")";c.fillRect(p.sx-1.5,p.sy-6,3,3);}
  else if(pr.tp==="bn"){c.fillStyle="rgb("+(55*m|0)+","+(45*m|0)+","+(30*m|0)+")";c.fillRect(p.sx-5,p.sy-3,10,2);
    c.strokeStyle="rgb("+(40*m|0)+","+(40*m|0)+","+(42*m|0)+")";c.lineWidth=.6;c.beginPath();c.moveTo(p.sx-4,p.sy-1);c.lineTo(p.sx-4,p.sy+1);c.moveTo(p.sx+4,p.sy-1);c.lineTo(p.sx+4,p.sy+1);c.stroke();}
  else if(pr.tp==="mk"){c.fillStyle="rgba(25,25,30,"+(.3*m)+")";c.beginPath();c.ellipse(p.sx,p.sy,3.5,1.8,0,0,Math.PI*2);c.fill();
    c.strokeStyle="rgba(50,50,55,"+(.2*m)+")";c.lineWidth=.4;c.beginPath();c.ellipse(p.sx,p.sy,3.5,1.8,0,0,Math.PI*2);c.stroke();}
  // ── WILDERNESS PROPS ──
  else if(pr.tp==="rock"){// Boulder
    c.fillStyle="rgb("+(65*m|0)+","+(62*m|0)+","+(58*m|0)+")";c.beginPath();c.ellipse(p.sx,p.sy-2,4,2.5,.2,0,Math.PI*2);c.fill();
    c.fillStyle="rgb("+(72*m|0)+","+(68*m|0)+","+(64*m|0)+")";c.beginPath();c.ellipse(p.sx-1,p.sy-3,3,2,.1,0,Math.PI*2);c.fill();}
  else if(pr.tp==="flower"){// Small flower cluster
    var fc=H(Math.round(pr.x*10),Math.round(pr.y*10))%3;
    var cols=[[200,80,80],[220,200,60],[180,100,200]];var fc2=cols[fc];
    c.fillStyle="rgb("+(fc2[0]*m|0)+","+(fc2[1]*m|0)+","+(fc2[2]*m|0)+")";
    c.beginPath();c.arc(p.sx,p.sy-1,1.5,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(p.sx+2,p.sy,1.2,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(p.sx-1,p.sy+1,1,0,Math.PI*2);c.fill();
    c.fillStyle="rgb("+(30*m|0)+","+(55*m|0)+","+(22*m|0)+")";c.fillRect(p.sx-.3,p.sy,0.6,3);}
  else if(pr.tp==="mush"){c.fillStyle="rgb("+(60*m|0)+","+(50*m|0)+","+(35*m|0)+")";c.fillRect(p.sx-.4,p.sy-3,.8,3);
    c.fillStyle="rgb("+(140*m|0)+","+(50*m|0)+","+(40*m|0)+")";c.beginPath();c.ellipse(p.sx,p.sy-3.5,2.5,1.5,0,0,Math.PI*2);c.fill();}
  else if(pr.tp==="berry"){// Berry bush
    c.fillStyle="rgb("+(30*m|0)+","+(65*m|0)+","+(22*m|0)+")";c.beginPath();c.ellipse(p.sx,p.sy-3,5,3.5,0,0,Math.PI*2);c.fill();// bush
    c.fillStyle="rgb("+(35*m|0)+","+(75*m|0)+","+(28*m|0)+")";c.beginPath();c.ellipse(p.sx-1,p.sy-5,3,2,0,0,Math.PI*2);c.fill();// top
    c.fillStyle="rgb("+(160*m|0)+","+(30*m|0)+","+(45*m|0)+")";// berries
    c.beginPath();c.arc(p.sx-2,p.sy-4,1.2,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(p.sx+1,p.sy-3,1,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(p.sx+2,p.sy-5,1.1,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(p.sx-1,p.sy-2,0.9,0,Math.PI*2);c.fill();}
  else if(pr.tp==="reed"){c.strokeStyle="rgb("+(45*m|0)+","+(55*m|0)+","+(30*m|0)+")";c.lineWidth=.6;
    c.beginPath();c.moveTo(p.sx,p.sy);c.quadraticCurveTo(p.sx+1,p.sy-6,p.sx-1,p.sy-10);c.stroke();
    c.beginPath();c.moveTo(p.sx+2,p.sy);c.quadraticCurveTo(p.sx+3,p.sy-5,p.sx+1,p.sy-8);c.stroke();}
  else if(pr.tp==="stick"){// Fallen stick/branch
    c.strokeStyle="rgb("+(65*m|0)+","+(48*m|0)+","+(28*m|0)+")";c.lineWidth=1.2;
    c.beginPath();c.moveTo(p.sx-5,p.sy+1);c.lineTo(p.sx+4,p.sy-2);c.stroke();
    c.lineWidth=.6;c.beginPath();c.moveTo(p.sx+2,p.sy-1);c.lineTo(p.sx+5,p.sy-4);c.stroke();}
  else if(pr.tp==="leaf"){// Fallen leaves
    c.fillStyle="rgb("+(50*m|0)+","+(70*m|0)+","+(25*m|0)+")";
    c.beginPath();c.ellipse(p.sx-1,p.sy-1,2.5,1.2,.4,0,Math.PI*2);c.fill();
    c.fillStyle="rgb("+(70*m|0)+","+(80*m|0)+","+(20*m|0)+")";
    c.beginPath();c.ellipse(p.sx+2,p.sy,.5,2,-.3,0,Math.PI*2);c.fill();}
  else if(pr.tp==="clay"){// Clay deposit
    c.fillStyle="rgb("+(95*m|0)+","+(65*m|0)+","+(40*m|0)+")";
    c.beginPath();c.ellipse(p.sx,p.sy-1,4,2.5,.1,0,Math.PI*2);c.fill();
    c.fillStyle="rgb("+(85*m|0)+","+(58*m|0)+","+(35*m|0)+")";
    c.beginPath();c.ellipse(p.sx-1,p.sy-2,2.5,1.5,0,0,Math.PI*2);c.fill();}
  else if(pr.tp==="wall"){// Ruin wall segment
    c.fillStyle="rgb("+(58*m|0)+","+(55*m|0)+","+(48*m|0)+")";c.fillRect(p.sx-3,p.sy-6,6,6);
    c.fillStyle="rgb("+(52*m|0)+","+(50*m|0)+","+(44*m|0)+")";c.fillRect(p.sx-2,p.sy-8,4,3);// top stones
    c.strokeStyle="rgba(40,38,32,"+(.15*m)+")";c.lineWidth=.3;
    c.beginPath();c.moveTo(p.sx-3,p.sy-3);c.lineTo(p.sx+3,p.sy-3);c.stroke();}// mortar line
  else if(pr.tp==="campfire"){c.fillStyle="rgba(30,28,25,"+(0.4*m)+")";c.beginPath();c.ellipse(p.sx,p.sy,4,2.5,0,0,Math.PI*2);c.fill();
    c.fillStyle="rgb("+(40*m|0)+","+(32*m|0)+","+(22*m|0)+")";c.fillRect(p.sx-3,p.sy-1,2.5,1.5);c.fillRect(p.sx+.5,p.sy-.5,2,1);
    c.fillStyle="rgb("+(55*m|0)+","+(52*m|0)+","+(48*m|0)+")";for(var i=0;i<5;i++){var a2=i/5*Math.PI*2;c.beginPath();c.arc(p.sx+Math.cos(a2)*4,p.sy+Math.sin(a2)*2,1,0,Math.PI*2);c.fill()}}
  // ── ACTIVE FIRE ──
  else if(pr.tp==="fireActive"){
    // Stone ring
    c.fillStyle="rgb("+(55*m|0)+","+(52*m|0)+","+(48*m|0)+")";
    for(var i=0;i<6;i++){var a3=i/6*Math.PI*2;c.beginPath();c.arc(p.sx+Math.cos(a3)*5,p.sy+Math.sin(a3)*2.5,1.2,0,Math.PI*2);c.fill()}
    // Logs
    c.fillStyle="rgb("+(50*m|0)+","+(35*m|0)+","+(20*m|0)+")";
    c.fillRect(p.sx-4,p.sy-1,3,1.5);c.fillRect(p.sx+1,p.sy-.5,3,1);c.fillRect(p.sx-1,p.sy-2,2,1.5);
    // Flames (animated)
    var ff=time*6;
    c.fillStyle="rgba(255,180,40,"+(0.6+Math.sin(ff)*0.15)+")";
    c.beginPath();c.moveTo(p.sx-3,p.sy-1);c.quadraticCurveTo(p.sx-1,p.sy-12-Math.sin(ff+1)*3,p.sx+1,p.sy-1);c.fill();
    c.fillStyle="rgba(255,100,20,"+(0.5+Math.sin(ff+2)*0.1)+")";
    c.beginPath();c.moveTo(p.sx-1,p.sy-1);c.quadraticCurveTo(p.sx+1,p.sy-9-Math.sin(ff+3)*2,p.sx+3,p.sy-1);c.fill();
    c.fillStyle="rgba(255,220,80,"+(0.3+Math.sin(ff*1.5)*0.1)+")";
    c.beginPath();c.moveTo(p.sx,p.sy-2);c.quadraticCurveTo(p.sx,p.sy-7-Math.sin(ff+5)*2,p.sx+2,p.sy-1);c.fill();
    // Light glow radius
    c.fillStyle="rgba(255,160,50,0.03)";c.beginPath();c.arc(p.sx,p.sy-4,25,0,Math.PI*2);c.fill();
    c.fillStyle="rgba(255,200,80,0.015)";c.beginPath();c.arc(p.sx,p.sy-4,45,0,Math.PI*2);c.fill();
    // Sparks
    for(var sp=0;sp<3;sp++){
      var spt=(time*2+sp*1.3)%2;if(spt<1){
        c.fillStyle="rgba(255,200,60,"+(0.5*(1-spt))+")";
        c.beginPath();c.arc(p.sx-2+sp*2+Math.sin(spt*5)*3,p.sy-6-spt*12,.5,0,Math.PI*2);c.fill()}}}
  // ═══ NEW PROPS ═══
  else if(pr.tp==="cactus"){c.fillStyle="rgb("+(35*m|0)+","+(70*m|0)+","+(30*m|0)+")";c.fillRect(p.sx-1.5,p.sy-12,3,12);c.fillRect(p.sx-5,p.sy-9,4,2);c.fillRect(p.sx+2,p.sy-7,4,2);c.fillRect(p.sx-5,p.sy-9,2,5);c.fillRect(p.sx+4,p.sy-7,2,4)}
  else if(pr.tp==="skull"){c.fillStyle="rgb("+(180*m|0)+","+(175*m|0)+","+(160*m|0)+")";c.beginPath();c.ellipse(p.sx,p.sy-2,3,2.5,0,0,Math.PI*2);c.fill();c.fillStyle="rgba(20,20,20,"+(0.4*m)+")";c.beginPath();c.arc(p.sx-1,p.sy-2,.7,0,Math.PI*2);c.fill();c.beginPath();c.arc(p.sx+1,p.sy-2,.7,0,Math.PI*2);c.fill()}
  else if(pr.tp==="snowpile"){c.fillStyle="rgb("+(200*m|0)+","+(205*m|0)+","+(215*m|0)+")";c.beginPath();c.ellipse(p.sx,p.sy,5,2.5,.1,0,Math.PI*2);c.fill();c.fillStyle="rgb("+(210*m|0)+","+(215*m|0)+","+(225*m|0)+")";c.beginPath();c.ellipse(p.sx-1,p.sy-1,3,1.5,0,0,Math.PI*2);c.fill()}
  else if(pr.tp==="shell"){c.fillStyle="rgb("+(190*m|0)+","+(170*m|0)+","+(140*m|0)+")";c.beginPath();c.ellipse(p.sx,p.sy,2,1.2,.5,0,Math.PI*2);c.fill()}
  else if(pr.tp==="scarecrow"){c.fillStyle="rgb("+(50*m|0)+","+(40*m|0)+","+(28*m|0)+")";c.fillRect(p.sx-.5,p.sy-18,1,18);c.fillRect(p.sx-5,p.sy-15,10,1);c.fillStyle="rgb("+(70*m|0)+","+(55*m|0)+","+(35*m|0)+")";c.fillRect(p.sx-3,p.sy-18,6,6);c.fillStyle="rgb("+(180*m|0)+","+(160*m|0)+","+(100*m|0)+")";c.beginPath();c.arc(p.sx,p.sy-20,3,0,Math.PI*2);c.fill()}
  else if(pr.tp==="woodpile"){c.fillStyle="rgb("+(55*m|0)+","+(40*m|0)+","+(25*m|0)+")";for(var i=0;i<3;i++)c.fillRect(p.sx-4,p.sy-2-i*2,8,1.5);c.fillStyle="rgb("+(65*m|0)+","+(48*m|0)+","+(30*m|0)+")";c.fillRect(p.sx-5,p.sy-1,10,2)}
  else if(pr.tp==="crop"){c.fillStyle="rgb("+(50*m|0)+","+(75*m|0)+","+(25*m|0)+")";for(var i=0;i<3;i++){c.beginPath();c.moveTo(p.sx-2+i*2,p.sy);c.lineTo(p.sx-2+i*2,p.sy-5-Math.random()*3);c.lineWidth=.6;c.strokeStyle=c.fillStyle;c.stroke()}c.fillStyle="rgb("+(180*m|0)+","+(170*m|0)+","+(50*m|0)+")";c.beginPath();c.arc(p.sx,p.sy-7,1.5,0,Math.PI*2);c.fill()}
  else if(pr.tp==="grave"){c.fillStyle="rgb("+(65*m|0)+","+(62*m|0)+","+(58*m|0)+")";c.fillRect(p.sx-2,p.sy-6,4,6);c.fillRect(p.sx-3,p.sy-7,6,2)}
  else if(pr.tp==="well"){c.fillStyle="rgb("+(60*m|0)+","+(58*m|0)+","+(52*m|0)+")";c.beginPath();c.ellipse(p.sx,p.sy,5,3,0,0,Math.PI*2);c.fill();c.fillStyle="rgb("+(50*m|0)+","+(48*m|0)+","+(42*m|0)+")";c.beginPath();c.ellipse(p.sx,p.sy,3.5,2,0,0,Math.PI*2);c.fill();c.fillStyle="rgb("+(20*m|0)+","+(30*m|0)+","+(45*m|0)+")";c.beginPath();c.ellipse(p.sx,p.sy,2.5,1.5,0,0,Math.PI*2);c.fill();c.strokeStyle="rgb("+(55*m|0)+","+(50*m|0)+","+(40*m|0)+")";c.lineWidth=.8;c.beginPath();c.moveTo(p.sx,p.sy-2);c.lineTo(p.sx,p.sy-10);c.stroke();c.beginPath();c.moveTo(p.sx-3,p.sy-10);c.lineTo(p.sx+3,p.sy-10);c.stroke()}
  // ═══ ANIMALS (animated) ═══
  else if(pr.tp==="cow"){c.fillStyle="rgb("+(200*m|0)+","+(195*m|0)+","+(185*m|0)+")";c.beginPath();c.ellipse(p.sx,p.sy-4,6,3,.1,0,Math.PI*2);c.fill();c.fillStyle="rgb("+(60*m|0)+","+(45*m|0)+","+(30*m|0)+")";c.beginPath();c.ellipse(p.sx+3,p.sy-4,2,1.5,.2,0,Math.PI*2);c.fill();c.fillStyle="rgb("+(180*m|0)+","+(170*m|0)+","+(160*m|0)+")";c.beginPath();c.arc(p.sx+6,p.sy-5,2.5,0,Math.PI*2);c.fill();c.strokeStyle="rgb("+(80*m|0)+","+(70*m|0)+","+(60*m|0)+")";c.lineWidth=1;c.beginPath();c.moveTo(p.sx-3,p.sy-1);c.lineTo(p.sx-3,p.sy+2);c.moveTo(p.sx+1,p.sy-1);c.lineTo(p.sx+1,p.sy+2);c.stroke()}
  else if(pr.tp==="chicken"){c.fillStyle="rgb("+(200*m|0)+","+(190*m|0)+","+(170*m|0)+")";c.beginPath();c.ellipse(p.sx,p.sy-2,2.5,2,0,0,Math.PI*2);c.fill();c.fillStyle="rgb("+(180*m|0)+","+(170*m|0)+","+(150*m|0)+")";c.beginPath();c.arc(p.sx+2,p.sy-3,1.5,0,Math.PI*2);c.fill();c.fillStyle="rgb("+(200*m|0)+","+(60*m|0)+","+(40*m|0)+")";c.beginPath();c.arc(p.sx+3,p.sy-3,.6,0,Math.PI*2);c.fill()}
  else if(pr.tp==="deer"){c.fillStyle="rgb("+(130*m|0)+","+(95*m|0)+","+(60*m|0)+")";c.beginPath();c.ellipse(p.sx,p.sy-6,5,3,.05,0,Math.PI*2);c.fill();c.fillStyle="rgb("+(120*m|0)+","+(85*m|0)+","+(50*m|0)+")";c.beginPath();c.arc(p.sx+5,p.sy-7,2.5,0,Math.PI*2);c.fill();c.strokeStyle="rgb("+(100*m|0)+","+(75*m|0)+","+(45*m|0)+")";c.lineWidth=1;c.beginPath();c.moveTo(p.sx-2,p.sy-3);c.lineTo(p.sx-2,p.sy+1);c.moveTo(p.sx+2,p.sy-3);c.lineTo(p.sx+2,p.sy+1);c.stroke();c.strokeStyle="rgb("+(90*m|0)+","+(65*m|0)+","+(35*m|0)+")";c.lineWidth=.5;c.beginPath();c.moveTo(p.sx+6,p.sy-9);c.lineTo(p.sx+8,p.sy-14);c.lineTo(p.sx+10,p.sy-12);c.moveTo(p.sx+6,p.sy-9);c.lineTo(p.sx+4,p.sy-14);c.lineTo(p.sx+2,p.sy-12);c.stroke()}
  else if(pr.tp==="bird"||pr.tp==="seagull"){var bc2=pr.tp==="seagull"?"rgb("+(200*m|0)+","+(200*m|0)+","+(210*m|0)+")":"rgb("+(50*m|0)+","+(45*m|0)+","+(40*m|0)+")";c.fillStyle=bc2;c.beginPath();c.ellipse(p.sx,p.sy-2,2,1.2,0,0,Math.PI*2);c.fill();c.beginPath();c.arc(p.sx+1.5,p.sy-3,1,0,Math.PI*2);c.fill()}
  else if(pr.tp==="rabbit"){c.fillStyle="rgb("+(160*m|0)+","+(145*m|0)+","+(130*m|0)+")";c.beginPath();c.ellipse(p.sx,p.sy-1.5,2,1.5,0,0,Math.PI*2);c.fill();c.beginPath();c.arc(p.sx+1,p.sy-3,1.2,0,Math.PI*2);c.fill();c.fillRect(p.sx,.5,1,3);c.fillRect(p.sx+1.5,p.sy-4,.6,2)}
  else if(pr.tp==="frog"){c.fillStyle="rgb("+(40*m|0)+","+(120*m|0)+","+(40*m|0)+")";c.beginPath();c.ellipse(p.sx,p.sy-1,2,1.5,0,0,Math.PI*2);c.fill();c.fillStyle="rgb("+(60*m|0)+","+(140*m|0)+","+(60*m|0)+")";c.beginPath();c.arc(p.sx-1,p.sy-2.5,.8,0,Math.PI*2);c.fill();c.beginPath();c.arc(p.sx+1,p.sy-2.5,.8,0,Math.PI*2);c.fill()}
  else if(pr.tp==="eagle"){c.fillStyle="rgb("+(55*m|0)+","+(40*m|0)+","+(28*m|0)+")";c.beginPath();c.ellipse(p.sx,p.sy-8,3,1.5,0,0,Math.PI*2);c.fill();c.strokeStyle=c.fillStyle;c.lineWidth=.8;c.beginPath();c.moveTo(p.sx-3,p.sy-8);c.quadraticCurveTo(p.sx-7,p.sy-12,p.sx-8,p.sy-9);c.stroke();c.beginPath();c.moveTo(p.sx+3,p.sy-8);c.quadraticCurveTo(p.sx+7,p.sy-12,p.sx+8,p.sy-9);c.stroke()}
  // ═══ NEW BIOME PROPS ═══
  else if(pr.tp==="vine"){c.strokeStyle="rgb("+(30*m|0)+","+(80*m|0)+","+(25*m|0)+")";c.lineWidth=1;c.beginPath();c.moveTo(p.sx,p.sy);c.quadraticCurveTo(p.sx+3,p.sy-6,p.sx-1,p.sy-12);c.stroke();c.fillStyle="rgb("+(40*m|0)+","+(90*m|0)+","+(30*m|0)+")";for(var vi=0;vi<3;vi++){c.beginPath();c.ellipse(p.sx+Math.sin(vi*2)*2,p.sy-3-vi*3,2,1.2,vi*.3,0,Math.PI*2);c.fill()}}
  else if(pr.tp==="fern"){c.fillStyle="rgb("+(30*m|0)+","+(75*m|0)+","+(20*m|0)+")";for(var fi2=0;fi2<5;fi2++){var fa=fi2/5*Math.PI-Math.PI/2;c.beginPath();c.ellipse(p.sx+Math.cos(fa)*5,p.sy-3+Math.sin(fa)*2,4,1.5,fa,0,Math.PI*2);c.fill()}}
  else if(pr.tp==="termite"){c.fillStyle="rgb("+(85*m|0)+","+(65*m|0)+","+(40*m|0)+")";c.beginPath();c.moveTo(p.sx-3,p.sy);c.lineTo(p.sx-2,p.sy-10);c.lineTo(p.sx+2,p.sy-12);c.lineTo(p.sx+3,p.sy);c.closePath();c.fill();c.fillStyle="rgb("+(75*m|0)+","+(58*m|0)+","+(35*m|0)+")";c.beginPath();c.arc(p.sx,p.sy-6,2,0,Math.PI*2);c.fill()}
  else if(pr.tp==="obsidian"){c.fillStyle="rgb("+(20*m|0)+","+(20*m|0)+","+(25*m|0)+")";c.beginPath();c.moveTo(p.sx,p.sy-8);c.lineTo(p.sx+4,p.sy-2);c.lineTo(p.sx+2,p.sy);c.lineTo(p.sx-3,p.sy);c.lineTo(p.sx-4,p.sy-3);c.closePath();c.fill();c.fillStyle="rgba(100,80,140,"+(0.15*m)+")";c.beginPath();c.moveTo(p.sx-1,p.sy-6);c.lineTo(p.sx+2,p.sy-3);c.lineTo(p.sx,p.sy-2);c.closePath();c.fill()}
  else if(pr.tp==="pillar"){c.fillStyle="rgb("+(70*m|0)+","+(68*m|0)+","+(62*m|0)+")";c.fillRect(p.sx-2,p.sy-16,4,16);c.fillStyle="rgb("+(80*m|0)+","+(78*m|0)+","+(72*m|0)+")";c.fillRect(p.sx-3,p.sy-17,6,2);c.fillRect(p.sx-3,p.sy-1,6,2)}
  // ═══ NEW ANIMALS ═══
  else if(pr.tp==="parrot"){c.fillStyle="rgb("+(40*m|0)+","+(180*m|0)+","+(50*m|0)+")";c.beginPath();c.ellipse(p.sx,p.sy-3,2.5,2,0,0,Math.PI*2);c.fill();c.fillStyle="rgb("+(200*m|0)+","+(50*m|0)+","+(40*m|0)+")";c.beginPath();c.arc(p.sx+1.5,p.sy-5,1.5,0,Math.PI*2);c.fill();c.fillStyle="rgb("+(220*m|0)+","+(200*m|0)+","+(40*m|0)+")";c.fillRect(p.sx+2.5,p.sy-5,1.5,.8)}
  else if(pr.tp==="snake"){c.strokeStyle="rgb("+(60*m|0)+","+(90*m|0)+","+(40*m|0)+")";c.lineWidth=1.5;c.beginPath();c.moveTo(p.sx-4,p.sy);c.quadraticCurveTo(p.sx-1,p.sy-2,p.sx+2,p.sy);c.quadraticCurveTo(p.sx+4,p.sy+1,p.sx+6,p.sy-1);c.stroke();c.fillStyle="rgb("+(70*m|0)+","+(100*m|0)+","+(50*m|0)+")";c.beginPath();c.arc(p.sx-4,p.sy,.8,0,Math.PI*2);c.fill()}
  else if(pr.tp==="gazelle"){c.fillStyle="rgb("+(180*m|0)+","+(150*m|0)+","+(100*m|0)+")";c.beginPath();c.ellipse(p.sx,p.sy-5,4.5,2.5,.05,0,Math.PI*2);c.fill();c.fillStyle="rgb("+(170*m|0)+","+(140*m|0)+","+(90*m|0)+")";c.beginPath();c.arc(p.sx+4,p.sy-6,2,0,Math.PI*2);c.fill();c.strokeStyle="rgb("+(140*m|0)+","+(110*m|0)+","+(70*m|0)+")";c.lineWidth=.8;c.beginPath();c.moveTo(p.sx-1,p.sy-2);c.lineTo(p.sx-1,p.sy+2);c.moveTo(p.sx+2,p.sy-2);c.lineTo(p.sx+2,p.sy+2);c.stroke();c.strokeStyle="rgb("+(120*m|0)+","+(90*m|0)+","+(55*m|0)+")";c.lineWidth=.5;c.beginPath();c.moveTo(p.sx+5,p.sy-8);c.lineTo(p.sx+6,p.sy-13);c.moveTo(p.sx+5,p.sy-8);c.lineTo(p.sx+4,p.sy-13);c.stroke()}
  else if(pr.tp==="wolf"){c.fillStyle="rgb("+(80*m|0)+","+(75*m|0)+","+(70*m|0)+")";c.beginPath();c.ellipse(p.sx,p.sy-4,5,2.5,.05,0,Math.PI*2);c.fill();c.fillStyle="rgb("+(75*m|0)+","+(70*m|0)+","+(65*m|0)+")";c.beginPath();c.arc(p.sx+4,p.sy-5,2.5,0,Math.PI*2);c.fill();c.strokeStyle="rgb("+(60*m|0)+","+(56*m|0)+","+(52*m|0)+")";c.lineWidth=1;c.beginPath();c.moveTo(p.sx-2,p.sy-1);c.lineTo(p.sx-2,p.sy+2);c.moveTo(p.sx+1,p.sy-1);c.lineTo(p.sx+1,p.sy+2);c.stroke();c.fillStyle="rgb("+(70*m|0)+","+(65*m|0)+","+(60*m|0)+")";c.beginPath();c.moveTo(p.sx+5,p.sy-7);c.lineTo(p.sx+6.5,p.sy-9);c.lineTo(p.sx+4,p.sy-6.5);c.fill();c.beginPath();c.moveTo(p.sx+3.5,p.sy-7);c.lineTo(p.sx+2.5,p.sy-9);c.lineTo(p.sx+3,p.sy-6.5);c.fill()}
  else if(pr.tp==="horse"){c.fillStyle="rgb("+(110*m|0)+","+(80*m|0)+","+(50*m|0)+")";c.beginPath();c.ellipse(p.sx,p.sy-6,6,3,.05,0,Math.PI*2);c.fill();c.fillStyle="rgb("+(100*m|0)+","+(72*m|0)+","+(45*m|0)+")";c.beginPath();c.ellipse(p.sx+5,p.sy-8,2.5,2,-.2,0,Math.PI*2);c.fill();c.strokeStyle="rgb("+(85*m|0)+","+(60*m|0)+","+(38*m|0)+")";c.lineWidth=1.2;c.beginPath();c.moveTo(p.sx-3,p.sy-3);c.lineTo(p.sx-3,p.sy+2);c.moveTo(p.sx+2,p.sy-3);c.lineTo(p.sx+2,p.sy+2);c.stroke();c.strokeStyle="rgb("+(50*m|0)+","+(35*m|0)+","+(22*m|0)+")";c.lineWidth=.6;c.beginPath();c.moveTo(p.sx-5,p.sy-5);c.quadraticCurveTo(p.sx-7,p.sy-3,p.sx-6,p.sy);c.stroke()}
  // ═══ CONSTRUCTION BLOCKS ═══
  else if(pr.tp==="blockWood"){
    // Isometric wooden block
    c.fillStyle="rgb("+(85*m|0)+","+(60*m|0)+","+(35*m|0)+")";// top
    c.beginPath();c.moveTo(p.sx,p.sy-12);c.lineTo(p.sx+TW*.6,p.sy-6);c.lineTo(p.sx,p.sy);c.lineTo(p.sx-TW*.6,p.sy-6);c.closePath();c.fill();
    c.fillStyle="rgb("+(70*m|0)+","+(48*m|0)+","+(28*m|0)+")";// right face
    c.beginPath();c.moveTo(p.sx,p.sy);c.lineTo(p.sx+TW*.6,p.sy-6);c.lineTo(p.sx+TW*.6,p.sy+2);c.lineTo(p.sx,p.sy+8);c.closePath();c.fill();
    c.fillStyle="rgb("+(60*m|0)+","+(40*m|0)+","+(22*m|0)+")";// left face
    c.beginPath();c.moveTo(p.sx,p.sy);c.lineTo(p.sx-TW*.6,p.sy-6);c.lineTo(p.sx-TW*.6,p.sy+2);c.lineTo(p.sx,p.sy+8);c.closePath();c.fill();
    // Wood grain lines
    c.strokeStyle="rgba("+(50*m|0)+","+(35*m|0)+","+(18*m|0)+",0.3)";c.lineWidth=0.4;
    c.beginPath();c.moveTo(p.sx-3,p.sy+1);c.lineTo(p.sx-3,p.sy-4);c.stroke();
    c.beginPath();c.moveTo(p.sx+2,p.sy-1);c.lineTo(p.sx+2,p.sy-7);c.stroke()}
  else if(pr.tp==="blockStone"){
    // Isometric stone block
    c.fillStyle="rgb("+(75*m|0)+","+(72*m|0)+","+(68*m|0)+")";// top
    c.beginPath();c.moveTo(p.sx,p.sy-12);c.lineTo(p.sx+TW*.6,p.sy-6);c.lineTo(p.sx,p.sy);c.lineTo(p.sx-TW*.6,p.sy-6);c.closePath();c.fill();
    c.fillStyle="rgb("+(60*m|0)+","+(58*m|0)+","+(55*m|0)+")";// right face
    c.beginPath();c.moveTo(p.sx,p.sy);c.lineTo(p.sx+TW*.6,p.sy-6);c.lineTo(p.sx+TW*.6,p.sy+2);c.lineTo(p.sx,p.sy+8);c.closePath();c.fill();
    c.fillStyle="rgb("+(50*m|0)+","+(48*m|0)+","+(45*m|0)+")";// left face
    c.beginPath();c.moveTo(p.sx,p.sy);c.lineTo(p.sx-TW*.6,p.sy-6);c.lineTo(p.sx-TW*.6,p.sy+2);c.lineTo(p.sx,p.sy+8);c.closePath();c.fill();
    // Stone texture
    c.fillStyle="rgba("+(80*m|0)+","+(75*m|0)+","+(70*m|0)+",0.3)";
    c.beginPath();c.arc(p.sx-2,p.sy-3,1,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(p.sx+3,p.sy-5,0.8,0,Math.PI*2);c.fill()}
}

function drawMM(c,G,w,sw,sh){
  var sz=42,mx=5,my=5,rg=20,sc=sz/rg;
  c.globalAlpha=.3;c.fillStyle="rgba(8,8,16,.82)";c.fillRect(mx,my,sz,sz);
  for(var dy=-rg/2;dy<rg/2;dy+=2)for(var dx=-rg/2;dx<rg/2;dx+=2){
    var t=w.tile((G.px+dx)|0,(G.py+dy)|0);
    c.fillStyle=t===1?"rgba(50,50,78,.6)":t===3?"rgba(52,48,58,.7)":t===4?"rgba(32,58,28,.5)":t===8?"rgba(28,42,88,.6)":t===10?"rgba(60,52,38,.6)":"rgba(38,38,52,.3)";
    c.fillRect(mx+(dx+rg/2)*sc,my+(dy+rg/2)*sc,sc*2,sc*2);}
  c.fillStyle="#fff";c.beginPath();c.arc(mx+sz/2,my+sz/2,1.5,0,Math.PI*2);c.fill();c.globalAlpha=1;
}

function drawInt(c,sw,sh,desc,time,fade){
  // Legacy text-only interior — only used as fallback
  var a=Math.min(1,fade);c.fillStyle="rgba(6,6,12,"+(a*.95)+")";c.fillRect(0,0,sw,sh);
  if(desc){c.globalAlpha=a*.88;c.fillStyle="#c8c0b4";c.font="14px 'Courier New',monospace";c.textAlign="center";
    var words=desc.split(" ");var line="",ly=sh*.3;
    for(var wi=0;wi<words.length;wi++){var t2=line+words[wi]+" ";if(c.measureText(t2).width>sw*.7){c.fillText(line,sw/2,ly);ly+=19;line=words[wi]+" "}else line=t2}
    c.fillText(line,sw/2,ly);c.globalAlpha=1}
}

// ═══ INTERIOR INSTANCE SYSTEM ═══
// Generates walkable rooms when player enters buildings — like Zelda ALTTP
var ROOM_W=10,ROOM_H=8;
var FLOOR_C={cabin:[45,38,28],farm:[50,42,32],chapel:[55,52,48],barn:[42,36,24],mill:[48,44,35],shop:[52,48,44],default:[40,38,34],apt:[48,44,40],bar:[35,28,22],office:[50,50,55],restaurant:[45,38,32],hotel:[55,48,42],gym:[42,42,46],library:[52,48,42],garage:[38,38,40],laundry:[50,52,55],clinic:[55,58,60],bank:[52,52,56],warehouse:[36,34,30],bakery:[55,48,38],station:[44,44,48]};
var WALL_C={cabin:[65,52,38],farm:[70,58,42],chapel:[72,70,68],barn:[58,46,30],mill:[62,56,44],shop:[68,62,55],default:[60,55,45],apt:[62,58,55],bar:[50,38,30],office:[65,65,72],restaurant:[60,50,40],hotel:[72,62,52],gym:[55,55,60],library:[68,60,48],garage:[50,50,52],laundry:[62,65,68],clinic:[70,74,76],bank:[66,66,72],warehouse:[48,46,42],bakery:[72,60,45],station:[58,58,62]};
// Urban room type selection based on district + seed
var URBAN_TYPES={0:["office","bank","hotel","restaurant","gym"],1:["warehouse","garage","bar","laundry","station"],2:["apt","bakery","clinic","library","shop"]};
function pickUrbanType(di,seed){var arr=URBAN_TYPES[di]||URBAN_TYPES[2];return arr[H(seed,seed*7)%arr.length]}

function genRoom(buildType,seed){
  var r=rng(seed);var grid=[];
  for(var y=0;y<ROOM_H;y++){grid[y]=[];for(var x=0;x<ROOM_W;x++){if(x===0||x===ROOM_W-1||y===0||y===ROOM_H-1)grid[y][x]=1;else grid[y][x]=0;}}
  grid[ROOM_H-1][ROOM_W/2|0]=2;grid[ROOM_H-1][(ROOM_W/2|0)+1]=2;
  var F=[];
  if(buildType==="cabin"){
    F.push({x:4,y:3,tp:"table"},{x:2,y:2,tp:"chest"},{x:7,y:1,tp:"fireplace"},{x:3,y:3,tp:"chair"});
    if(r()<.5)F.push({x:6,y:5,tp:"barrel"});
  }else if(buildType==="farm"){
    F.push({x:4,y:2,tp:"table"},{x:3,y:2,tp:"chair"},{x:5,y:2,tp:"chair"},{x:7,y:1,tp:"shelf"},{x:2,y:5,tp:"barrel"},{x:7,y:5,tp:"crate"});
    if(r()<.6)F.push({x:1,y:1,tp:"fireplace"});
  }else if(buildType==="chapel"){
    F.push({x:4,y:1,tp:"altar"},{x:5,y:1,tp:"candle"});
    for(var row=3;row<6;row++){F.push({x:3,y:row,tp:"bench_r"},{x:6,y:row,tp:"bench_r"})}
  }else if(buildType==="barn"){
    F.push({x:2,y:2,tp:"hay"},{x:3,y:2,tp:"hay"},{x:6,y:2,tp:"barrel"},{x:7,y:2,tp:"barrel"},{x:2,y:5,tp:"crate"},{x:7,y:4,tp:"tool"});
  }else if(buildType==="mill"){
    F.push({x:4,y:2,tp:"gear"},{x:5,y:2,tp:"gear"},{x:2,y:4,tp:"sack"},{x:3,y:4,tp:"sack"},{x:7,y:5,tp:"barrel"});
  }else if(buildType==="apt"){
    F.push({x:3,y:2,tp:"bed"},{x:2,y:4,tp:"sofa"},{x:4,y:4,tp:"tv"},{x:7,y:2,tp:"wardrobe"},{x:6,y:5,tp:"plant"},{x:2,y:1,tp:"lamp"});
    if(r()<.5)F.push({x:5,y:2,tp:"desk"},{x:5,y:3,tp:"chair"});
  }else if(buildType==="bar"){
    for(var bx=2;bx<7;bx++)F.push({x:bx,y:2,tp:"counter"});
    F.push({x:2,y:3,tp:"stool"},{x:4,y:3,tp:"stool"},{x:6,y:3,tp:"stool"});
    F.push({x:2,y:5,tp:"table_sm"},{x:3,y:5,tp:"stool"},{x:7,y:5,tp:"table_sm"},{x:7,y:4,tp:"stool"});
    F.push({x:7,y:1,tp:"shelf"});if(r()<.4)F.push({x:1,y:5,tp:"jukebox"});
  }else if(buildType==="office"){
    F.push({x:2,y:2,tp:"desk"},{x:2,y:3,tp:"chair"},{x:5,y:2,tp:"desk"},{x:5,y:3,tp:"chair"});
    F.push({x:7,y:1,tp:"filing"},{x:8,y:1,tp:"filing"},{x:7,y:3,tp:"plant"},{x:4,y:5,tp:"water_cooler"});
    if(r()<.5)F.push({x:2,y:5,tp:"printer"});
  }else if(buildType==="restaurant"){
    F.push({x:2,y:2,tp:"table_set"},{x:5,y:2,tp:"table_set"},{x:2,y:5,tp:"table_set"},{x:5,y:5,tp:"table_set"});
    F.push({x:3,y:2,tp:"chair"},{x:6,y:2,tp:"chair"},{x:3,y:5,tp:"chair"},{x:6,y:5,tp:"chair"});
    F.push({x:7,y:1,tp:"counter"},{x:8,y:1,tp:"counter"},{x:1,y:1,tp:"plant"},{x:7,y:4,tp:"candle"});
  }else if(buildType==="hotel"){
    F.push({x:4,y:1,tp:"counter"},{x:5,y:1,tp:"counter"},{x:2,y:3,tp:"sofa"},{x:3,y:3,tp:"sofa"});
    F.push({x:7,y:3,tp:"plant"},{x:2,y:5,tp:"luggage"},{x:6,y:5,tp:"lamp"},{x:1,y:1,tp:"painting"});
  }else if(buildType==="gym"){
    F.push({x:2,y:2,tp:"treadmill"},{x:4,y:2,tp:"treadmill"},{x:7,y:2,tp:"weights"},{x:7,y:4,tp:"weights"});
    F.push({x:2,y:5,tp:"bench_gym"},{x:4,y:5,tp:"mat"},{x:1,y:1,tp:"water_cooler"});
  }else if(buildType==="library"){
    for(var ly2=1;ly2<6;ly2++)F.push({x:1,y:ly2,tp:"shelf"});
    for(var ly3=1;ly3<6;ly3++)F.push({x:8,y:ly3,tp:"shelf"});
    F.push({x:4,y:3,tp:"table"},{x:3,y:3,tp:"chair"},{x:5,y:3,tp:"chair"},{x:4,y:5,tp:"chair"},{x:6,y:5,tp:"lamp"});
  }else if(buildType==="garage"){
    F.push({x:2,y:2,tp:"workbench"},{x:7,y:2,tp:"tool_wall"},{x:2,y:5,tp:"barrel"},{x:3,y:5,tp:"barrel"},{x:7,y:5,tp:"crate"},{x:7,y:4,tp:"crate"},{x:5,y:3,tp:"car_lift"});
  }else if(buildType==="laundry"){
    for(var lx2=2;lx2<6;lx2++)F.push({x:lx2,y:1,tp:"washer"});
    F.push({x:7,y:1,tp:"washer"},{x:2,y:4,tp:"bench_r"},{x:4,y:4,tp:"bench_r"},{x:7,y:4,tp:"basket"});
  }else if(buildType==="clinic"){
    F.push({x:4,y:1,tp:"counter"},{x:5,y:1,tp:"counter"},{x:7,y:2,tp:"cabinet"},{x:7,y:3,tp:"cabinet"});
    F.push({x:2,y:3,tp:"chair"},{x:3,y:3,tp:"chair"},{x:2,y:5,tp:"chair"},{x:5,y:4,tp:"plant"});
  }else if(buildType==="bank"){
    F.push({x:3,y:2,tp:"counter"},{x:4,y:2,tp:"counter"},{x:5,y:2,tp:"counter"});
    F.push({x:2,y:4,tp:"chair"},{x:4,y:4,tp:"chair"},{x:6,y:4,tp:"chair"},{x:7,y:1,tp:"safe"},{x:1,y:1,tp:"plant"});
  }else if(buildType==="warehouse"){
    for(var wy2=1;wy2<6;wy2++)F.push({x:1,y:wy2,tp:"crate"});
    for(var wy3=1;wy3<4;wy3++)F.push({x:8,y:wy3,tp:"crate"});
    F.push({x:4,y:3,tp:"pallet"},{x:5,y:3,tp:"pallet"},{x:4,y:4,tp:"barrel"});
  }else if(buildType==="bakery"){
    F.push({x:4,y:1,tp:"oven"},{x:5,y:1,tp:"oven"},{x:2,y:2,tp:"counter"},{x:3,y:2,tp:"counter"});
    F.push({x:7,y:3,tp:"shelf"},{x:7,y:4,tp:"shelf"},{x:2,y:5,tp:"sack"},{x:3,y:5,tp:"sack"});
  }else if(buildType==="station"){
    F.push({x:2,y:1,tp:"desk"},{x:3,y:2,tp:"chair"},{x:6,y:1,tp:"desk"},{x:7,y:2,tp:"chair"});
    F.push({x:4,y:1,tp:"filing"},{x:5,y:1,tp:"filing"},{x:2,y:5,tp:"locker"},{x:3,y:5,tp:"locker"},{x:4,y:5,tp:"locker"},{x:7,y:5,tp:"water_cooler"});
  }else{
    F.push({x:2,y:2,tp:"shelf"},{x:3,y:2,tp:"shelf"},{x:6,y:2,tp:"shelf"},{x:7,y:2,tp:"shelf"},{x:4,y:4,tp:"table"},{x:5,y:4,tp:"chair"});
    if(r()<.4)F.push({x:2,y:5,tp:"plant"});
  }
  for(var fi=0;fi<F.length;fi++){var f=F[fi];if(f.x>0&&f.x<ROOM_W-1&&f.y>0&&f.y<ROOM_H-1)grid[f.y][f.x]=3;}
  return{grid:grid,furniture:F,type:buildType};
}

function drawRoom(c,room,rpx,rpy,sw,sh,time){
  // Draw interior room in isometric view — centered on screen
  var RTW=36,RTH=18;// Room tile dimensions (slightly bigger than overworld)
  var rcx=(rpx-rpy)*RTW,rcy=(rpx+rpy)*RTH;
  var fc=FLOOR_C[room.type]||FLOOR_C.default;
  var wc=WALL_C[room.type]||WALL_C.default;

  // Background — dark
  c.fillStyle="rgb(8,8,14)";c.fillRect(0,0,sw,sh);

  // Draw tiles
  for(var ry=0;ry<ROOM_H;ry++)for(var rx=0;rx<ROOM_W;rx++){
    var sx=(rx-ry)*RTW+sw/2-rcx;
    var sy=(rx+ry)*RTH+sh/2-rcy;
    if(sx<-RTW*2||sx>sw+RTW*2||sy<-RTH*2||sy>sh+RTH*2)continue;
    var tile=room.grid[ry][rx];

    if(tile===1){// Wall
      // Floor underneath
      c.fillStyle="rgb("+(fc[0]*.6|0)+","+(fc[1]*.6|0)+","+(fc[2]*.6|0)+")";
      c.beginPath();c.moveTo(sx,sy-RTH);c.lineTo(sx+RTW,sy);c.lineTo(sx,sy+RTH);c.lineTo(sx-RTW,sy);c.closePath();c.fill();
      // Wall block on top
      var wallH=28;
      c.fillStyle="rgb("+(wc[0]|0)+","+(wc[1]|0)+","+(wc[2]|0)+")";
      c.beginPath();c.moveTo(sx+RTW,sy);c.lineTo(sx,sy+RTH);c.lineTo(sx,sy+RTH-wallH);c.lineTo(sx+RTW,sy-wallH);c.closePath();c.fill();
      c.fillStyle="rgb("+(wc[0]*.7|0)+","+(wc[1]*.7|0)+","+(wc[2]*.7|0)+")";
      c.beginPath();c.moveTo(sx-RTW,sy);c.lineTo(sx,sy+RTH);c.lineTo(sx,sy+RTH-wallH);c.lineTo(sx-RTW,sy-wallH);c.closePath();c.fill();
      c.fillStyle="rgb("+(wc[0]*.9|0)+","+(wc[1]*.9|0)+","+(wc[2]*.9|0)+")";
      c.beginPath();c.moveTo(sx,sy-RTH-wallH);c.lineTo(sx+RTW,sy-wallH);c.lineTo(sx,sy+RTH-wallH);c.lineTo(sx-RTW,sy-wallH);c.closePath();c.fill();
    }else if(tile===2){// Door/exit
      c.fillStyle="rgb("+(fc[0]|0)+","+(fc[1]|0)+","+(fc[2]|0)+")";
      c.beginPath();c.moveTo(sx,sy-RTH);c.lineTo(sx+RTW,sy);c.lineTo(sx,sy+RTH);c.lineTo(sx-RTW,sy);c.closePath();c.fill();
      // Door highlight
      var pulse=0.4+Math.sin(time*3)*.15;
      c.fillStyle="rgba(255,200,80,"+pulse*0.15+")";
      c.beginPath();c.moveTo(sx,sy-RTH);c.lineTo(sx+RTW,sy);c.lineTo(sx,sy+RTH);c.lineTo(sx-RTW,sy);c.closePath();c.fill();
      c.globalAlpha=0.5;c.fillStyle="#ffd866";c.font="8px monospace";c.textAlign="center";c.fillText("sortie",sx,sy+RTH+10);c.globalAlpha=1;
    }else{// Floor (0 or 3=furniture on floor)
      // Tile pattern
      var shade=((rx+ry)%2===0)?1:0.92;
      c.fillStyle="rgb("+(fc[0]*shade|0)+","+(fc[1]*shade|0)+","+(fc[2]*shade|0)+")";
      c.beginPath();c.moveTo(sx,sy-RTH);c.lineTo(sx+RTW,sy);c.lineTo(sx,sy+RTH);c.lineTo(sx-RTW,sy);c.closePath();c.fill();
    }
  }

  // Draw furniture (depth-sorted)
  var sortedF=room.furniture.slice().sort(function(a,b){return(a.x+a.y)-(b.x+b.y)});
  for(var fi=0;fi<sortedF.length;fi++){
    var f=sortedF[fi];
    var fx=(f.x-f.y)*RTW+sw/2-rcx;
    var fy=(f.x+f.y)*RTH+sh/2-rcy;
    drawFurniture(c,f.tp,fx,fy,time);
  }
}

function drawFurniture(c,tp,sx,sy,time){
  // Draw furniture items in isometric interior
  if(tp==="table"){
    c.fillStyle="rgb(75,55,35)";c.fillRect(sx-12,sy-8,24,3);// top
    c.fillStyle="rgb(60,44,28)";
    c.fillRect(sx-10,sy-5,2,8);c.fillRect(sx+8,sy-5,2,8);// legs
  }else if(tp==="chair"){
    c.fillStyle="rgb(65,48,30)";c.fillRect(sx-5,sy-4,10,2);
    c.fillRect(sx-4,sy-2,2,5);c.fillRect(sx+2,sy-2,2,5);
    c.fillRect(sx-5,sy-10,2,8);// back
  }else if(tp==="chest"){
    c.fillStyle="rgb(90,65,35)";c.fillRect(sx-8,sy-6,16,8);
    c.fillStyle="rgb(110,80,40)";c.fillRect(sx-8,sy-8,16,3);// lid
    c.fillStyle="rgb(180,160,60)";c.fillRect(sx-1,sy-5,2,2);// latch
  }else if(tp==="fireplace"){
    c.fillStyle="rgb(55,50,45)";c.fillRect(sx-10,sy-16,20,16);// stone
    c.fillStyle="rgb(25,20,18)";c.fillRect(sx-7,sy-10,14,10);// opening
    // Fire glow
    c.fillStyle="rgba(255,120,30,"+(0.15+Math.sin(time*5)*0.05)+")";
    c.beginPath();c.arc(sx,sy-5,8,0,Math.PI*2);c.fill();
    c.fillStyle="rgba(255,80,20,"+(0.3+Math.sin(time*7)*0.1)+")";
    c.beginPath();c.arc(sx-2,sy-4,3,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(sx+2,sy-5,2.5,0,Math.PI*2);c.fill();
  }else if(tp==="barrel"){
    c.fillStyle="rgb(75,55,30)";c.beginPath();c.ellipse(sx,sy-3,7,5,0,0,Math.PI*2);c.fill();
    c.fillStyle="rgb(65,48,26)";c.beginPath();c.ellipse(sx,sy-8,7,4,0,0,Math.PI*2);c.fill();
    c.strokeStyle="rgb(90,70,35)";c.lineWidth=.8;c.beginPath();c.ellipse(sx,sy-5,7,4.5,0,0,Math.PI*2);c.stroke();
  }else if(tp==="crate"){
    c.fillStyle="rgb(80,60,35)";c.fillRect(sx-7,sy-7,14,10);
    c.fillStyle="rgb(70,52,30)";c.fillRect(sx-7,sy-9,14,3);
    c.strokeStyle="rgb(60,45,25)";c.lineWidth=.5;c.beginPath();c.moveTo(sx,sy-9);c.lineTo(sx,sy+3);c.stroke();
  }else if(tp==="shelf"){
    c.fillStyle="rgb(65,50,32)";c.fillRect(sx-8,sy-18,16,18);
    c.fillStyle="rgb(55,42,26)";
    c.fillRect(sx-7,sy-14,14,2);c.fillRect(sx-7,sy-8,14,2);// shelves
    // Items on shelves
    c.fillStyle="rgb(120,90,60)";c.fillRect(sx-5,sy-17,3,3);
    c.fillStyle="rgb(80,100,70)";c.fillRect(sx+1,sy-17,4,3);
    c.fillStyle="rgb(110,80,50)";c.fillRect(sx-4,sy-11,5,3);
  }else if(tp==="hay"){
    c.fillStyle="rgb(170,150,60)";c.beginPath();c.ellipse(sx,sy-3,9,5,0.1,0,Math.PI*2);c.fill();
    c.fillStyle="rgb(155,135,50)";c.beginPath();c.ellipse(sx-2,sy-5,6,3,0,0,Math.PI*2);c.fill();
  }else if(tp==="sack"){
    c.fillStyle="rgb(140,120,80)";c.beginPath();c.ellipse(sx,sy-4,6,5,0,0,Math.PI*2);c.fill();
    c.fillStyle="rgb(130,110,70)";c.beginPath();c.arc(sx,sy-8,4,0,Math.PI*2);c.fill();
  }else if(tp==="tool"){
    c.strokeStyle="rgb(70,60,45)";c.lineWidth=1.5;
    c.beginPath();c.moveTo(sx,sy);c.lineTo(sx,sy-20);c.stroke();// handle
    c.fillStyle="rgb(100,100,110)";c.fillRect(sx-4,sy-22,8,4);// head
  }else if(tp==="gear"){
    c.fillStyle="rgb(90,85,75)";c.beginPath();c.arc(sx,sy-8,8,0,Math.PI*2);c.fill();
    c.fillStyle="rgb(70,65,58)";c.beginPath();c.arc(sx,sy-8,4,0,Math.PI*2);c.fill();
    // Gear teeth
    c.strokeStyle="rgb(80,75,65)";c.lineWidth=2;
    for(var gi=0;gi<6;gi++){var ga=gi/6*Math.PI*2+time*0.3;
      c.beginPath();c.moveTo(sx+Math.cos(ga)*7,sy-8+Math.sin(ga)*7);c.lineTo(sx+Math.cos(ga)*10,sy-8+Math.sin(ga)*10);c.stroke()}
  }else if(tp==="altar"){
    c.fillStyle="rgb(80,78,75)";c.fillRect(sx-10,sy-6,20,8);
    c.fillStyle="rgb(90,88,82)";c.fillRect(sx-12,sy-8,24,3);
    c.fillStyle="rgb(200,180,100)";c.fillRect(sx-1,sy-9,2,3);// cross
    c.fillRect(sx-3,sy-8,6,1);
  }else if(tp==="candle"){
    c.fillStyle="rgb(200,190,170)";c.fillRect(sx-1,sy-8,2,6);
    c.fillStyle="rgba(255,200,80,"+(0.5+Math.sin(time*8)*0.2)+")";
    c.beginPath();c.arc(sx,sy-10,2,0,Math.PI*2);c.fill();
    c.fillStyle="rgba(255,180,60,"+(0.1+Math.sin(time*6)*0.05)+")";
    c.beginPath();c.arc(sx,sy-8,6,0,Math.PI*2);c.fill();
  }else if(tp==="bench_r"){
    c.fillStyle="rgb(65,50,30)";c.fillRect(sx-10,sy-3,20,3);c.fillRect(sx-8,sy,2,3);c.fillRect(sx+6,sy,2,3);
  // ═══ URBAN FURNITURE ═══
  }else if(tp==="bed"){
    c.fillStyle="rgb(45,40,55)";c.fillRect(sx-10,sy-5,20,10);// frame
    c.fillStyle="rgb(80,75,100)";c.fillRect(sx-9,sy-4,18,8);// mattress
    c.fillStyle="rgb(110,105,130)";c.fillRect(sx-9,sy-4,18,3);// pillow area
    c.fillStyle="rgb(140,135,155)";c.fillRect(sx-7,sy-3,5,2);c.fillRect(sx+2,sy-3,5,2);// pillows
  }else if(tp==="sofa"){
    c.fillStyle="rgb(75,55,45)";c.fillRect(sx-12,sy-4,24,7);// seat
    c.fillStyle="rgb(85,62,50)";c.fillRect(sx-12,sy-8,24,5);// back
    c.fillStyle="rgb(65,48,38)";c.fillRect(sx-13,sy-6,3,8);c.fillRect(sx+10,sy-6,3,8);// arms
  }else if(tp==="tv"){
    c.fillStyle="rgb(30,30,35)";c.fillRect(sx-8,sy-12,16,10);// screen
    c.fillStyle="rgb(50,60,80)";c.fillRect(sx-7,sy-11,14,8);// display
    c.fillStyle="rgb(40,38,36)";c.fillRect(sx-2,sy-2,4,2);// stand
  }else if(tp==="wardrobe"){
    c.fillStyle="rgb(65,50,35)";c.fillRect(sx-8,sy-18,16,18);// body
    c.fillStyle="rgb(55,42,28)";c.beginPath();c.moveTo(sx,sy-18);c.lineTo(sx,sy);c.lineWidth=.5;c.strokeStyle="rgb(50,38,25)";c.stroke();// divider
    c.fillStyle="rgb(180,160,60)";c.fillRect(sx-2,sy-10,1,2);c.fillRect(sx+1,sy-10,1,2);// handles
  }else if(tp==="desk"){
    c.fillStyle="rgb(60,52,40)";c.fillRect(sx-10,sy-6,20,3);// surface
    c.fillStyle="rgb(50,44,34)";c.fillRect(sx-9,sy-3,8,6);// drawer block
    c.fillRect(sx+7,sy-3,2,6);// leg
    c.fillStyle="rgb(120,140,160)";c.fillRect(sx-4,sy-8,3,2);// monitor
  }else if(tp==="counter"){
    c.fillStyle="rgb(60,50,38)";c.fillRect(sx-8,sy-6,16,8);// body
    c.fillStyle="rgb(72,60,45)";c.fillRect(sx-9,sy-8,18,3);// top
  }else if(tp==="stool"){
    c.fillStyle="rgb(55,45,32)";c.beginPath();c.ellipse(sx,sy-4,5,3,0,0,Math.PI*2);c.fill();// seat
    c.strokeStyle="rgb(48,38,26)";c.lineWidth=1.5;c.beginPath();c.moveTo(sx,sy-1);c.lineTo(sx,sy+3);c.stroke();// leg
  }else if(tp==="table_sm"){
    c.fillStyle="rgb(65,50,35)";c.beginPath();c.ellipse(sx,sy-4,8,5,0,0,Math.PI*2);c.fill();
    c.strokeStyle="rgb(55,42,28)";c.lineWidth=1.5;c.beginPath();c.moveTo(sx,sy-1);c.lineTo(sx,sy+3);c.stroke();
  }else if(tp==="table_set"){// table with cloth
    c.fillStyle="rgb(180,170,155)";c.beginPath();c.ellipse(sx,sy-5,9,5.5,0,0,Math.PI*2);c.fill();// cloth
    c.fillStyle="rgb(60,48,34)";c.beginPath();c.ellipse(sx,sy-4,7,4,0,0,Math.PI*2);c.fill();// table
    c.fillStyle="rgb(200,195,185)";c.beginPath();c.ellipse(sx-2,sy-6,2,1.5,0,0,Math.PI*2);c.fill();// plate
  }else if(tp==="jukebox"){
    c.fillStyle="rgb(90,40,40)";c.fillRect(sx-6,sy-14,12,14);// body
    c.fillStyle="rgb(200,180,80)";c.fillRect(sx-5,sy-12,10,4);// display
    c.fillStyle="rgb(120,50,50)";c.beginPath();c.arc(sx,sy-3,4,Math.PI,0);c.fill();// speaker
  }else if(tp==="filing"){
    c.fillStyle="rgb(80,80,85)";c.fillRect(sx-6,sy-14,12,14);
    c.fillStyle="rgb(70,70,75)";c.fillRect(sx-5,sy-12,10,3);c.fillRect(sx-5,sy-8,10,3);c.fillRect(sx-5,sy-4,10,3);// drawers
    c.fillStyle="rgb(120,120,125)";c.fillRect(sx-1,sy-11,2,1);c.fillRect(sx-1,sy-7,2,1);c.fillRect(sx-1,sy-3,2,1);// handles
  }else if(tp==="water_cooler"){
    c.fillStyle="rgb(180,200,220)";c.fillRect(sx-3,sy-14,6,8);// bottle
    c.fillStyle="rgb(90,90,95)";c.fillRect(sx-4,sy-6,8,8);// base
    c.fillStyle="rgb(200,210,225)";c.beginPath();c.arc(sx,sy-14,3,0,Math.PI*2);c.fill();// top
  }else if(tp==="printer"){
    c.fillStyle="rgb(75,75,80)";c.fillRect(sx-7,sy-5,14,7);
    c.fillStyle="rgb(85,85,90)";c.fillRect(sx-8,sy-7,16,3);// top
    c.fillStyle="rgb(200,200,195)";c.fillRect(sx-3,sy-8,6,2);// paper
  }else if(tp==="luggage"){
    c.fillStyle="rgb(70,50,35)";c.fillRect(sx-6,sy-4,12,6);
    c.fillStyle="rgb(80,58,40)";c.fillRect(sx-7,sy-6,14,3);
    c.fillStyle="rgb(60,42,28)";c.fillRect(sx+3,sy-3,5,4);// second bag
  }else if(tp==="painting"){
    c.fillStyle="rgb(65,55,40)";c.fillRect(sx-8,sy-14,16,10);// frame
    c.fillStyle="rgb(40,65,90)";c.fillRect(sx-7,sy-13,14,8);// canvas - sky
    c.fillStyle="rgb(50,80,40)";c.fillRect(sx-7,sy-8,14,3);// landscape
  }else if(tp==="treadmill"){
    c.fillStyle="rgb(50,50,55)";c.fillRect(sx-8,sy-3,16,5);// belt
    c.strokeStyle="rgb(60,60,65)";c.lineWidth=1.5;
    c.beginPath();c.moveTo(sx-6,sy-3);c.lineTo(sx-6,sy-14);c.lineTo(sx+6,sy-12);c.stroke();// arms
    c.fillStyle="rgb(70,70,75)";c.fillRect(sx-7,sy-16,4,3);// display
  }else if(tp==="weights"){
    c.fillStyle="rgb(55,55,60)";c.fillRect(sx-10,sy-2,20,3);// bar
    c.fillStyle="rgb(45,45,50)";c.fillRect(sx-11,sy-4,4,7);c.fillRect(sx+7,sy-4,4,7);// plates
  }else if(tp==="bench_gym"){
    c.fillStyle="rgb(50,50,55)";c.fillRect(sx-8,sy-3,16,4);// pad
    c.fillStyle="rgb(40,40,45)";c.fillRect(sx-6,sy,2,3);c.fillRect(sx+4,sy,2,3);// legs
  }else if(tp==="mat"){
    c.fillStyle="rgb(70,80,120)";c.beginPath();c.ellipse(sx,sy-1,8,4,.1,0,Math.PI*2);c.fill();
  }else if(tp==="workbench"){
    c.fillStyle="rgb(70,55,35)";c.fillRect(sx-10,sy-6,20,3);// top
    c.fillStyle="rgb(60,48,30)";c.fillRect(sx-9,sy-3,2,6);c.fillRect(sx+7,sy-3,2,6);// legs
    c.fillStyle="rgb(100,100,105)";c.fillRect(sx-6,sy-8,3,2);c.fillRect(sx+1,sy-8,4,2);// tools on top
  }else if(tp==="tool_wall"){
    c.fillStyle="rgb(55,50,42)";c.fillRect(sx-6,sy-16,12,16);// board
    c.strokeStyle="rgb(100,95,85)";c.lineWidth=.8;
    c.beginPath();c.moveTo(sx-3,sy-13);c.lineTo(sx-3,sy-4);c.stroke();// wrench
    c.beginPath();c.moveTo(sx+2,sy-14);c.lineTo(sx+2,sy-6);c.stroke();// screwdriver
    c.fillStyle="rgb(110,105,95)";c.fillRect(sx-4,sy-5,3,2);// hammer head
  }else if(tp==="car_lift"){
    c.fillStyle="rgb(80,80,85)";c.fillRect(sx-2,sy-12,4,14);// pillar
    c.fillStyle="rgb(70,70,75)";c.fillRect(sx-10,sy-4,20,3);// arms
  }else if(tp==="washer"){
    c.fillStyle="rgb(190,195,200)";c.fillRect(sx-6,sy-10,12,10);// body
    c.fillStyle="rgb(170,175,180)";c.beginPath();c.arc(sx,sy-5,3.5,0,Math.PI*2);c.fill();// door
    c.fillStyle="rgb(150,155,160)";c.beginPath();c.arc(sx,sy-5,2,0,Math.PI*2);c.fill();// glass
  }else if(tp==="basket"){
    c.fillStyle="rgb(130,110,70)";c.beginPath();c.moveTo(sx-6,sy-6);c.lineTo(sx-5,sy+1);c.lineTo(sx+5,sy+1);c.lineTo(sx+6,sy-6);c.closePath();c.fill();
    c.fillStyle="rgb(200,195,190)";c.fillRect(sx-3,sy-7,6,2);// clothes
  }else if(tp==="cabinet"){
    c.fillStyle="rgb(190,195,200)";c.fillRect(sx-6,sy-12,12,12);
    c.fillStyle="rgb(210,215,220)";c.fillRect(sx-5,sy-10,10,4);c.fillRect(sx-5,sy-5,10,4);// shelves
    c.fillStyle="rgb(100,160,120)";c.fillRect(sx-3,sy-9,3,2);// medicine
    c.fillStyle="rgb(160,100,100)";c.fillRect(sx+1,sy-9,3,2);
  }else if(tp==="safe"){
    c.fillStyle="rgb(60,62,65)";c.fillRect(sx-7,sy-10,14,12);
    c.fillStyle="rgb(50,52,55)";c.fillRect(sx-6,sy-9,12,10);
    c.fillStyle="rgb(180,160,60)";c.beginPath();c.arc(sx,sy-4,2.5,0,Math.PI*2);c.fill();// dial
    c.fillStyle="rgb(160,140,50)";c.fillRect(sx+3,sy-5,2,1);// handle
  }else if(tp==="pallet"){
    c.fillStyle="rgb(120,95,55)";c.fillRect(sx-8,sy-1,16,3);
    c.fillRect(sx-7,sy-2,4,1);c.fillRect(sx+3,sy-2,4,1);// boards
  }else if(tp==="oven"){
    c.fillStyle="rgb(70,65,60)";c.fillRect(sx-7,sy-10,14,12);
    c.fillStyle="rgb(50,45,42)";c.fillRect(sx-6,sy-6,12,6);// door
    c.fillStyle="rgba(255,120,40,"+(0.1+Math.sin(time*4)*0.05)+")";c.fillRect(sx-5,sy-5,10,4);// glow
  }else if(tp==="locker"){
    c.fillStyle="rgb(75,80,90)";c.fillRect(sx-4,sy-14,8,14);
    c.fillStyle="rgb(65,70,80)";c.beginPath();c.moveTo(sx,sy-14);c.lineTo(sx,sy);c.lineWidth=.5;c.strokeStyle="rgb(55,60,70)";c.stroke();
    c.fillStyle="rgb(100,100,110)";c.fillRect(sx-2,sy-8,1,1);c.fillRect(sx+1,sy-8,1,1);// handles
  }else if(tp==="plant"){
    c.fillStyle="rgb(70,55,38)";c.fillRect(sx-4,sy-3,8,5);// pot
    c.fillStyle="rgb(40,85,35)";c.beginPath();c.arc(sx,sy-6,5,0,Math.PI*2);c.fill();// leaves
    c.fillStyle="rgb(35,75,30)";c.beginPath();c.arc(sx-2,sy-8,3,0,Math.PI*2);c.fill();
  }else if(tp==="lamp"){
    c.fillStyle="rgb(90,85,75)";c.fillRect(sx-.5,sy-14,1,12);// pole
    c.fillStyle="rgb(200,185,140)";c.beginPath();c.moveTo(sx-4,sy-14);c.lineTo(sx+4,sy-14);c.lineTo(sx+2,sy-18);c.lineTo(sx-2,sy-18);c.closePath();c.fill();// shade
    c.fillStyle="rgba(255,240,180,"+(0.15+Math.sin(time*3)*0.05)+")";c.beginPath();c.arc(sx,sy-14,6,0,Math.PI*2);c.fill();// glow
  }
}

function genStars(){var r=rng(777),s=[];for(var i=0;i<55;i++)s.push({x:r(),y:r()*.5,b:.3+r()*.7,sz:.5+r(),sp:.5+r()*2});return s}

function drawFootprints(c,prints,camX,camY,sw,sh,dL){
  for(var fp of prints){
    var a=Math.max(0,.1-fp.age*.006)*(1-dL*.5);
    if(a<=0)continue;
    var p=iso(fp.x,fp.y,camX,camY,sw,sh);
    if(p.sx<-5||p.sx>sw+5)continue;
    c.globalAlpha=a;c.fillStyle="rgba(18,18,26,1)";
    c.beginPath();c.ellipse(p.sx,p.sy,1.8,1,.3*fp.side,0,Math.PI*2);c.fill();
  }
  c.globalAlpha=1;
}

function drawNpcAware(c,sx,sy,playerClose){
  if(!playerClose)return;
  // Subtle "!" above head
  c.globalAlpha=.2;c.fillStyle="#ffd866";c.font="bold 7px monospace";c.textAlign="center";
  c.fillText("·",sx,sy-34);c.globalAlpha=1;
}

// ── AUDIO ──

class Aud{
  constructor(){this.ok=false;this.sT=0;this.ambT=0;this.lastAmb=""}
  init(){
    if(this.ok)return;
    try{
      this.ac=new(window.AudioContext||window.webkitAudioContext)();
      this.m=this.ac.createGain();this.m.gain.value=.15;this.m.connect(this.ac.destination);
      // Base drone
      var o=this.ac.createOscillator(),g=this.ac.createGain(),f=this.ac.createBiquadFilter();
      o.type="sine";o.frequency.value=72;f.type="lowpass";f.frequency.value=125;g.gain.value=.016;
      o.connect(f);f.connect(g);g.connect(this.m);o.start();
      this.drone={o:o,g:g};
      // Low rumble for city depth
      var o2=this.ac.createOscillator(),g2=this.ac.createGain();
      o2.type="sawtooth";o2.frequency.value=38;g2.gain.value=.004;
      var f2=this.ac.createBiquadFilter();f2.type="lowpass";f2.frequency.value=60;
      o2.connect(f2);f2.connect(g2);g2.connect(this.m);o2.start();
      this.ok=true;
    }catch(e){}
  }

  // Footsteps
  step(mv,dt){
    if(!this.ok||!mv)return;this.sT+=dt;
    if(this.sT>.26){this.sT=0;
      var o=this.ac.createOscillator(),g=this.ac.createGain();
      o.type="triangle";o.frequency.value=115+Math.random()*50;
      g.gain.value=.01;g.gain.exponentialRampToValueAtTime(.001,this.ac.currentTime+.05);
      o.connect(g);g.connect(this.m);o.start();o.stop(this.ac.currentTime+.06);
    }
  }

  // Interaction ping
  ping(){
    if(!this.ok)return;
    var o=this.ac.createOscillator(),g=this.ac.createGain();
    o.type="sine";o.frequency.value=420;
    o.frequency.exponentialRampToValueAtTime(210,this.ac.currentTime+.14);
    g.gain.value=.013;g.gain.exponentialRampToValueAtTime(.001,this.ac.currentTime+.16);
    o.connect(g);g.connect(this.m);o.start();o.stop(this.ac.currentTime+.18);
  }

  // Ambient city sounds — called every frame
  ambient(dt,inCity){
    if(!this.ok)return;
    this.ambT+=dt;
    // Random ambient every 6-20 seconds
    var interval=6+Math.random()*14;
    if(this.ambT<interval)return;
    this.ambT=0;

    var t=this.ac.currentTime;
    var type=inCity?(Math.random()*6)|0:((Math.random()*3)|0)+10;

    if(type===0){// Distant car honk
      var o=this.ac.createOscillator(),g=this.ac.createGain();
      o.type="square";o.frequency.value=320+Math.random()*120;
      g.gain.value=.003;g.gain.linearRampToValueAtTime(0,t+.25);
      o.connect(g);g.connect(this.m);o.start();o.stop(t+.28);
    }
    else if(type===1){// Distant siren (two-tone)
      var o=this.ac.createOscillator(),g=this.ac.createGain();
      o.type="sine";
      o.frequency.setValueAtTime(620,t);
      o.frequency.linearRampToValueAtTime(780,t+.5);
      o.frequency.linearRampToValueAtTime(620,t+1);
      o.frequency.linearRampToValueAtTime(780,t+1.5);
      g.gain.value=.002;g.gain.linearRampToValueAtTime(.003,t+.3);
      g.gain.linearRampToValueAtTime(0,t+2);
      o.connect(g);g.connect(this.m);o.start();o.stop(t+2.1);
    }
    else if(type===2){// Door slam
      var o=this.ac.createOscillator(),g=this.ac.createGain();
      o.type="sawtooth";o.frequency.value=140+Math.random()*60;
      g.gain.value=.006;g.gain.exponentialRampToValueAtTime(.0001,t+.06);
      o.connect(g);g.connect(this.m);o.start();o.stop(t+.08);
    }
    else if(type===3){// Dog bark (short burst)
      var o=this.ac.createOscillator(),g=this.ac.createGain();
      o.type="square";
      o.frequency.setValueAtTime(280,t);o.frequency.linearRampToValueAtTime(350,t+.04);
      g.gain.value=.003;g.gain.exponentialRampToValueAtTime(.0001,t+.05);
      o.connect(g);g.connect(this.m);o.start();o.stop(t+.06);
      // Second bark
      var o2=this.ac.createOscillator(),g2=this.ac.createGain();
      o2.type="square";o2.frequency.value=300;
      g2.gain.value=.002;g2.gain.exponentialRampToValueAtTime(.0001,t+.18);
      o2.connect(g2);g2.connect(this.m);o2.start(t+.12);o2.stop(t+.2);
    }
    else if(type===4){// Metal clang (industrial)
      var o=this.ac.createOscillator(),g=this.ac.createGain();
      o.type="triangle";o.frequency.value=800+Math.random()*400;
      g.gain.value=.004;g.gain.exponentialRampToValueAtTime(.0001,t+.1);
      o.connect(g);g.connect(this.m);o.start();o.stop(t+.12);
    }
    else if(type===5){// Muffled bass (music from a building)
      var o=this.ac.createOscillator(),g=this.ac.createGain(),f=this.ac.createBiquadFilter();
      o.type="sawtooth";o.frequency.value=55+Math.random()*20;
      f.type="lowpass";f.frequency.value=100;
      g.gain.value=.004;g.gain.linearRampToValueAtTime(0,t+1.5);
      o.connect(f);f.connect(g);g.connect(this.m);o.start();o.stop(t+1.6);
    }
    else if(type>=10){// Wilderness: wind gust
      var bufLen=this.ac.sampleRate;
      var buf=this.ac.createBuffer(1,bufLen,this.ac.sampleRate);
      var d=buf.getChannelData(0);
      var v=0;for(var i=0;i<bufLen;i++){v+=(Math.random()*2-1-v)*.01;d[i]=v}
      var s=this.ac.createBufferSource();s.buffer=buf;
      var g=this.ac.createGain(),f=this.ac.createBiquadFilter();
      f.type="bandpass";f.frequency.value=300+Math.random()*200;f.Q.value=.3;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.004,t+.5);
      g.gain.linearRampToValueAtTime(0,t+2);
      s.connect(f);f.connect(g);g.connect(this.m);s.start();s.stop(t+2.1);
    }
  }

  // Mood shift
  setMood(mood,inCity){
    if(!this.ok)return;
    var t=this.ac.currentTime;
    var freq=mood==="darker"?55:mood==="warmer"?85:72;
    this.drone.o.frequency.linearRampToValueAtTime(freq,t+3);
    this.drone.g.gain.linearRampToValueAtTime(inCity?0.018:0.008,t+2);
  }
  // Ambient WAV loops — load and crossfade based on location/weather
  loadLoops(){
    if(this.loopsLoaded)return;this.loopsLoaded=true;
    this.loops={};this.curLoop=null;this.loopGain=null;
    var self=this;
    var files={city:'assets/amb_city.wav',nature:'assets/amb_nature.wav',rain:'assets/amb_rain.wav',ocean:'assets/amb_ocean.wav',wind:'assets/amb_wind.wav',fire:'assets/amb_fire.wav',cave:'assets/amb_cave.wav',swamp:'assets/amb_swamp.wav',desert:'assets/amb_desert.wav',snow:'assets/amb_snow.wav',indoor:'assets/amb_indoor.wav',storm:'assets/amb_storm.wav',night:'assets/amb_night.wav',jungle:'assets/amb_jungle.wav',farm:'assets/amb_farm.wav',canyon:'assets/amb_canyon.wav',mus_dark:'assets/mus_dark.wav',mus_warm:'assets/mus_warm.wav',mus_tension:'assets/mus_tension.wav',mus_explore:'assets/mus_explore.wav',mus_mystery:'assets/mus_mystery.wav',mus_danger:'assets/mus_danger.wav',mus_peace:'assets/mus_peace.wav',mus_craft:'assets/mus_craft.wav',mus_hunt:'assets/mus_hunt.wav',mus_tame:'assets/mus_tame.wav',mus_journey:'assets/mus_journey.wav',mus_night:'assets/mus_night.wav',mus_solitude:'assets/mus_solitude.wav',mus_wonder:'assets/mus_wonder.wav',mus_survival:'assets/mus_survival.wav',mus_interior:'assets/mus_interior.wav',mus_build:'assets/mus_build.wav',mus_trade:'assets/mus_trade.wav',mus_ride:'assets/mus_ride.wav',mus_menu:'assets/mus_menu.wav',lake:'assets/amb_lake.wav',tundra:'assets/amb_tundra.wav',ruins:'assets/amb_ruins.wav',savanna:'assets/amb_savanna.wav',glacier:'assets/amb_glacier.wav',volcanic:'assets/amb_volcanic.wav',steppe:'assets/amb_steppe.wav',meadow:'assets/amb_meadow.wav',mountain:'assets/amb_mountain.wav',forest_deep:'assets/amb_forest_deep.wav',city_night:'assets/amb_city_night.wav',underwater:'assets/amb_underwater.wav',dawn:'assets/amb_dawn.wav',market:'assets/amb_market.wav',indoor2:'assets/amb_indoor2.wav',heights:'assets/amb_heights.wav',dusk:'assets/amb_dusk.wav',market2:'assets/amb_market2.wav',coast2:'assets/amb_coast2.wav',swamp2:'assets/amb_swamp2.wav'};
    for(var key in files){
      (function(k,url){
        var xhr=new XMLHttpRequest();xhr.open('GET',url,true);xhr.responseType='arraybuffer';
        xhr.onload=function(){if(xhr.status===200)self.ac.decodeAudioData(xhr.response,function(buf){self.loops[k]=buf})};
        xhr.send();
      })(key,files[key]);
    }
    // SFX one-shots
    this.sfx={};var sfxFiles={pickup:'assets/sfx_pickup.wav',door:'assets/sfx_door.wav',choice:'assets/sfx_choice.wav'};
    for(var sk in sfxFiles){(function(k,url){var xhr2=new XMLHttpRequest();xhr2.open('GET',url,true);xhr2.responseType='arraybuffer';xhr2.onload=function(){if(xhr2.status===200)self.ac.decodeAudioData(xhr2.response,function(buf){self.sfx[k]=buf})};xhr2.send()})(sk,sfxFiles[sk])}
  }
  playLoop(key){
    if(!this.ok||!this.loops||!this.loops[key])return;
    if(this.curLoop===key)return;
    // Stop current
    if(this.loopSrc){try{this.loopSrc.stop()}catch(e){}}
    this.curLoop=key;
    this.loopSrc=this.ac.createBufferSource();
    this.loopSrc.buffer=this.loops[key];
    this.loopSrc.loop=true;
    if(!this.loopGain){this.loopGain=this.ac.createGain();this.loopGain.gain.value=0.06;this.loopGain.connect(this.m)}
    this.loopSrc.connect(this.loopGain);
    this.loopSrc.start();
  }
  updateLoop(inCity,weather,bio){
    if(!this.ok||!this.loopsLoaded)return;
    var target;
    if(weather==="storm")target="storm";
    else if(weather==="rain"||weather==="drizzle")target="rain";
    else if(weather==="snow")target="snow";
    else if(!inCity&&bio==="coast")target="coast2";
    else if(!inCity&&bio==="lake")target="lake";
    else if(!inCity&&(bio==="swamp"||bio==="marsh"))target="swamp2";
    else if(!inCity&&bio==="jungle")target="jungle";
    else if(!inCity&&(bio==="desert"||bio==="steppe"))target="desert";
    else if(!inCity&&bio==="savanna")target="savanna";
    else if(!inCity&&bio==="snow")target="snow";
    else if(!inCity&&bio==="glacier")target="glacier";
    else if(!inCity&&bio==="tundra")target="tundra";
    else if(!inCity&&bio==="mountain")target="mountain";
    else if(!inCity&&(bio==="hills"||bio==="moor"))target="wind";
    else if(!inCity&&bio==="canyon")target="canyon";
    else if(!inCity&&bio==="farmland")target="farm";
    else if(!inCity&&bio==="meadow")target="meadow";
    else if(!inCity&&bio==="volcanic")target="volcanic";
    else if(!inCity&&bio==="ruins")target="ruins";
    else if(inCity)target="city";
    else if(!inCity&&bio==="forest")target="forest_deep";
    else target="nature";
    // Night override for nature
    if(!inCity&&(target==="nature"||target==="forest_deep")){
      var h=(this._dayT||0)*24;if(h<5||h>21)target="night";
    }
    if(inCity&&target==="city"){
      var h2=(this._dayT||0)*24;if(h2<5||h2>21)target="city_night";
    }
    this.playLoop(target);
  }
  // Music layer — mood-dependent drone
  playMusic(key){
    if(!this.ok||!this.loops||!this.loops[key])return;
    if(this.curMusic===key)return;
    if(this.musSrc){try{this.musSrc.stop()}catch(e){}}
    this.curMusic=key;
    this.musSrc=this.ac.createBufferSource();
    this.musSrc.buffer=this.loops[key];
    this.musSrc.loop=true;
    if(!this.musGain){this.musGain=this.ac.createGain();this.musGain.gain.value=0.03;this.musGain.connect(this.m)}
    this.musSrc.connect(this.musGain);
    this.musSrc.start();
  }
  updateMusic(mood,intr,bio){
    if(!this.ok||!this.loopsLoaded)return;
    var mk;
    if(mood==="darker")mk="mus_danger";
    else if(bio==="ruins"||bio==="canyon"||bio==="glacier")mk="mus_mystery";
    else if(bio==="volcanic")mk="mus_danger";
    else if(intr)mk="mus_interior";
    else if(mood==="warmer")mk="mus_warm";
    else if(bio==="tundra"||bio==="snow")mk="mus_dark";
    else if(this._dayT&&(this._dayT*24<5||this._dayT*24>21))mk="mus_solitude";
    else if(bio==="meadow"||bio==="lake"||bio==="farmland"||bio==="coast")mk="mus_peace";
    else if(G&&G.mounted)mk="mus_ride";
    else mk="mus_explore";
    this.playMusic(mk);
  }
  // SFX one-shot playback
  playSfx(key){
    if(!this.ok||!this.sfx||!this.sfx[key])return;
    var src=this.ac.createBufferSource();
    src.buffer=this.sfx[key];
    var g=this.ac.createGain();g.gain.value=0.12*(typeof G!=="undefined"?G.volSfx:0.5)*2;
    src.connect(g);g.connect(this.m);src.start();
  }
}

// ── UI ──

class Joy{
  constructor(){this.on=false;this.cx=0;this.cy=0;this.dx=0;this.dy=0;this.id=null;this.R=48;this.mg=0}
  start(x,y,id){this.on=true;this.cx=x;this.cy=y;this.id=id;this.dx=0;this.dy=0;this.mg=0}
  move(x,y){
    var d=x-this.cx,e=y-this.cy;var l=Math.sqrt(d*d+e*e);
    this.mg=Math.min(l/this.R,1);
    if(l>this.R){d=d/l*this.R;e=e/l*this.R}
    this.dx=d/this.R;this.dy=e/this.R;
  }
  end(){this.on=false;this.dx=0;this.dy=0;this.id=null;this.mg=0}
  draw(c){
    if(!this.on)return;
    c.globalAlpha=.07;c.fillStyle="#999";c.beginPath();c.arc(this.cx,this.cy,this.R,0,Math.PI*2);c.fill();
    c.globalAlpha=.2;c.fillStyle=this.mg>.85?"#ffd866":"#bbb";
    c.beginPath();c.arc(this.cx+this.dx*this.R,this.cy+this.dy*this.R,14,0,Math.PI*2);c.fill();
    c.globalAlpha=1;
  }
}

// ── MAIN ──

function startGame(apiKey, noDir){
  if(apiKey)setKey(apiKey);
  if(noDir)setNoDir(true);
  // Show loading, then load sprites, then start
  var cv=document.getElementById("C"),c2=cv.getContext("2d");
  cv.width=cv.clientWidth;cv.height=cv.clientHeight;
  c2.fillStyle="#060610";c2.fillRect(0,0,cv.width,cv.height);
  c2.fillStyle="#555";c2.font="10px monospace";c2.textAlign="center";
  c2.fillText("Chargement...",cv.width/2,cv.height/2);
  loadSprites(function(){init()});
}

function init(){
  var cv=document.getElementById("C"),ctx=cv.getContext("2d");
  var joy=new Joy(),world=new World(),audio=new Aud(),stars=genStars();
  var saving=0,shT=0;
  var footprints=[];var fpAcc=0,fpSide=1;

  var G={px:CS/2+.5,py:CS/2+1.5,camX:0,camY:0,time:0,fadeIn:0,keys:{},
    prof:{exploration:0,confrontation:0,social:0,construction:0,meaning:0},
    nLog:[],rules:[],seeds:[],npcs:[],objs:[],ni:0,dw:0,pt:0,tv:new Set(),
    nearPoi:null,busy:false,narr:null,bubs:[],
    lastIT:-10,lastMT:0,idleT:false,explT:0,fm:false,ft:false,
    mood:"neutral",wth:"clear",dayT:.08,intr:null,intF:0,intD:null,
    inv:[],nc:{},arcs:[],lpi:null,btnT:null,
    gauges:{},skills:[],intents:[],
    choices:null,choiceLog:[],
    invOpen:false,invSel:0,
    menuOpen:false,menuPage:"main",// pause menu
    volMaster:0.5,volSfx:0.5,// volume settings
    mortal:false,mortalAsked:{},
    mounted:null,mountSpd:0,// mounted on animal or vehicle
    jumpT:0,climbT:0,// jump/climb animation timers// tracks which causes have been asked// inventory panel state// choices=current options, choiceLog=history of picks
    room:null,rpx:5,rpy:5,// room player position
    facing:0,lastDist:"",distShowT:0};

  var sv=load();
  if(sv){for(var sk in sv)G[sk]=sv[sk];
    G.tv=sv.tv||new Set();G.fadeIn=0;G.keys={};G.busy=false;G.narr=null;G.bubs=[];G.nearPoi=null;
    G.fm=true;G.ft=true;G.intF=0;G.intr=null;G.intD=null;G.inv=sv.inv||[];G.nc=sv.nc||{};G.arcs=sv.arcs||[];
    G.gauges=sv.gauges||{};G.skills=sv.skills||[];G.intents=sv.intents||[];G.choiceLog=sv.choiceLog||[];
    if(sv.worldMods)world.mods=sv.worldMods;
    G.mortal=sv.mortal||false;G.mortalAsked=sv.mortalAsked||{};
    G.volMaster=sv.volMaster!==undefined?sv.volMaster:0.5;G.volSfx=sv.volSfx!==undefined?sv.volSfx:0.5;
    G.camX=(sv.px-sv.py)*TW;G.camY=(sv.px+sv.py)*TH}

  // ── RESIZE ──
  function resize(){var d=Math.min(window.devicePixelRatio||1,1.5);cv.width=cv.clientWidth*d;cv.height=cv.clientHeight*d;ctx.setTransform(d,0,0,d,0,0)}
  resize();window.addEventListener("resize",resize);

  // ── INPUT ──
  window.addEventListener("keydown",function(e){G.keys[e.key.toLowerCase()]=true;
    // Inventory toggle
    if(e.key==="i"||e.key==="I"){G.invOpen=!G.invOpen;G.invSel=0;e.preventDefault();return}
    if(e.key==="b"||e.key==="B"){if(!G.intr&&!G.invOpen){tryBuild()}e.preventDefault();return}
    if(e.key==="m"||e.key==="M"){if(!G.intr&&!G.invOpen){tryMount()}e.preventDefault();return}
    // Inventory navigation when open
    if(G.invOpen&&G.inv.length>0){
      if(e.key==="ArrowUp"||e.key==="w"){G.invSel=Math.max(0,G.invSel-1);e.preventDefault();return}
      if(e.key==="ArrowDown"||e.key==="s"){G.invSel=Math.min(G.inv.length-1,G.invSel+1);e.preventDefault();return}
      if(e.key==="1"){invAction(craftSel>=0?"cancel":"use");e.preventDefault();return}
      if(e.key==="2"){invAction(craftSel>=0?"":"combine");e.preventDefault();return}
      if(e.key==="3"){invAction(craftSel>=0?"":"examine");e.preventDefault();return}
      if(e.key==="4"){invAction(craftSel>=0?"craft":"drop");e.preventDefault();return}
      if(e.key==="Escape"){G.invOpen=false;e.preventDefault();return}
      return;
    }
    // Choice selection via number keys
    if(G.choices&&e.key>="1"&&e.key<="4"){var ci3=parseInt(e.key)-1;if(ci3<G.choices.length){pickChoice(ci3);e.preventDefault();return}}
    if(" eE".indexOf(e.key)>=0||e.key==="Enter"){act();e.preventDefault()}
    if(e.key==="Escape"){
      if(G.menuOpen){G.menuOpen=false;e.preventDefault();return}
      if(G.invOpen){G.invOpen=false;e.preventDefault();return}
      if(G.intr){G.intr=null;G.room=null;e.preventDefault();return}
      G.menuOpen=true;G.menuPage="main";e.preventDefault()
    }});
  window.addEventListener("keyup",function(e){G.keys[e.key.toLowerCase()]=false});
  function bH(x,y){return(x-(cv.clientWidth-50))*(x-(cv.clientWidth-50))+(y-(cv.clientHeight-55))*(y-(cv.clientHeight-55))<35*35}
  cv.addEventListener("touchstart",function(e){e.preventDefault();audio.init();for(var i=0;i<e.changedTouches.length;i++){var t=e.changedTouches[i];
    // Inventory icon tap (top-left area)
    if(!G.invOpen&&t.clientX>45&&t.clientX<80&&t.clientY<30&&G.inv.length>0){G.invOpen=true;G.invSel=0;continue}
    if(!G.invOpen&&!G.intr&&t.clientX>78&&t.clientX<105&&t.clientY<30){tryBuild();continue}
    // Pause menu hamburger tap (top-right)
    if(!G.invOpen&&!G.intr&&t.clientX>cv.clientWidth-40&&t.clientY<30){G.menuOpen=!G.menuOpen;G.menuPage="main";continue}
    // Menu panel interactions
    if(G.menuOpen&&G._menuRects){
      var menuHit=false;
      for(var mi2=0;mi2<G._menuRects.length;mi2++){
        var mr=G._menuRects[mi2];
        if(t.clientX>=mr.x&&t.clientX<=mr.x+mr.w&&t.clientY>=mr.y&&t.clientY<=mr.y+mr.h){
          if(mr.act==="resume"){G.menuOpen=false}
          else if(mr.act==="reset"){if(confirm("Effacer la sauvegarde?")){localStorage.removeItem("tr_save");location.reload()}}
          else if(mr.act==="vol_master"){G.volMaster=Math.max(0,Math.min(1,(t.clientX-mr.x)/mr.w));if(audio.m)audio.m.gain.value=G.volMaster}
          else if(mr.act==="vol_sfx"){G.volSfx=Math.max(0,Math.min(1,(t.clientX-mr.x)/mr.w))}
          else{G.menuPage=mr.act}
          menuHit=true;break;
        }
      }
      if(!menuHit)G.menuOpen=false;// tap outside = close
      continue;
    }
    // Inventory panel interactions when open
    if(G.invOpen&&G._invRects){
      var invHit=false;
      // Check item taps
      for(var iri=0;iri<G._invRects.length;iri++){
        var ir=G._invRects[iri];
        if(t.clientX>=ir.x&&t.clientX<=ir.x+ir.w&&t.clientY>=ir.y&&t.clientY<=ir.y+ir.h){G.invSel=ir.idx;invHit=true;break}
      }
      // Check action button taps
      if(!invHit&&G._invActRects){
        for(var iai=0;iai<G._invActRects.length;iai++){
          var ia=G._invActRects[iai];
          if(t.clientX>=ia.x&&t.clientX<=ia.x+ia.w&&t.clientY>=ia.y&&t.clientY<=ia.y+ia.h){invAction(ia.act);invHit=true;break}
        }
      }
      if(invHit)continue;
      // Tap outside panel = close
      G.invOpen=false;continue;
    }
    // Check choice button taps
    if(G.choices&&G._choiceRects){
      var hit=false;
      for(var ci2=0;ci2<G._choiceRects.length;ci2++){
        var cr=G._choiceRects[ci2];
        if(t.clientX>=cr.x&&t.clientX<=cr.x+cr.w&&t.clientY>=cr.y&&t.clientY<=cr.y+cr.h){
          pickChoice(cr.idx);hit=true;break;
        }
      }
      if(hit)continue;
    }
    if(bH(t.clientX,t.clientY)){act();G.btnT=t.identifier}
    else if(G.narr&&t.clientY>cv.clientHeight-160){if(!G.narr.done){G.narr.ci=G.narr.text.length;G.narr.done=true;G.narr.fs=G.time}else G.narr=null}
    else joy.start(t.clientX,t.clientY,t.identifier)}},{passive:false});
  cv.addEventListener("touchmove",function(e){e.preventDefault();for(var i=0;i<e.changedTouches.length;i++){var t=e.changedTouches[i];if(t.identifier===joy.id)joy.move(t.clientX,t.clientY)}},{passive:false});
  cv.addEventListener("touchend",function(e){for(var i=0;i<e.changedTouches.length;i++){var t=e.changedTouches[i];if(t.identifier===joy.id)joy.end();if(t.identifier===G.btnT)G.btnT=null}});
  cv.addEventListener("touchcancel",function(e){for(var i=0;i<e.changedTouches.length;i++){if(e.changedTouches[i].identifier===joy.id)joy.end()}});

  // ═══ CRAFT RECIPES ═══
  // Each recipe: [ingredient1_keyword, ingredient2_keyword, result_desc, result_glyph, result_tags]
  var RECIPES=[
    ["pierre","pierre","silex tranchant","🔪","tool,sharp"],
    ["pierre","bâton","outil en pierre","⛏","tool,heavy"],
    ["bâton","roseau","canne à pêche","🎣","tool,fishing"],
    ["bâton","liane","arc rudimentaire","🏹","weapon,ranged"],
    ["bâton","bâton","torche éteinte","🪵","tool,fire"],
    ["silex","bois","feu de camp","🔥","fire,light"],
    ["silex","torche","torche allumée","🔦","tool,light"],
    ["pierre","liane","fronde","🪢","weapon,ranged"],
    ["roseau","roseau","panier tressé","🧺","container"],
    ["fleur","fleur","guirlande","💐","decoration"],
    ["champignon","bâton","brochette crue","🍢","food,raw"],
    ["baie","feuille","cataplasme","🩹","medicine"],
    ["coquillage","liane","collier","📿","decoration,trade"],
    ["obsidienne","bâton","lance d'obsidienne","🗡","weapon,sharp"],
    ["pierre","pierre tranchante","hachette de pierre","🪓","tool,sharp,heavy"],
    ["roseau","argile","pot en terre","🏺","container"],
    ["bois","bois","planche","🪵","material,build"],
    ["planche","planche","abri simple","🏗","structure"],
  ];

  function findRecipe(a,b){
    var ad=a.desc.toLowerCase(),bd=b.desc.toLowerCase();
    for(var ri=0;ri<RECIPES.length;ri++){
      var r=RECIPES[ri];
      if((ad.indexOf(r[0])>=0&&bd.indexOf(r[1])>=0)||(ad.indexOf(r[1])>=0&&bd.indexOf(r[0])>=0))return r;
    }
    return null;
  }

  // ═══ INVENTORY ACTIONS ═══
  var craftSel=-1;// index of first item selected for combining
  async function invAction(act2){
    if(!G.invOpen||G.inv.length===0||G.invSel>=G.inv.length)return;
    var item=G.inv[G.invSel];
    if(act2==="drop"){
      // Place object at player's feet
      var oid="o"+Date.now().toString(36);
      G.objs.push({desc:item.desc,glyph:item.glyph||"?",x:G.px+0.5,y:G.py+0.5,id:oid,pickable:true});
      world.gc(Math.floor(G.px/CH),Math.floor(G.py/CH)).poi.push({tp:"object",x:G.px+0.5,y:G.py+0.5,id:oid,desc:item.desc});
      G.inv.splice(G.invSel,1);
      if(G.invSel>=G.inv.length)G.invSel=Math.max(0,G.inv.length-1);
      showN("Posé: "+item.desc);audio.playSfx("sfx_drop");save(G);
    }else if(act2==="throw"){
      G.inv.splice(G.invSel,1);
      if(G.invSel>=G.inv.length)G.invSel=Math.max(0,G.inv.length-1);
      showN("Jeté.");save(G);
    }else if(act2==="combine"){
      // Enter craft mode — select first item
      craftSel=G.invSel;
    }else if(act2==="cancel"){
      craftSel=-1;
    }else if(act2==="craft"){
      // Combine craftSel + invSel
      if(craftSel<0||craftSel>=G.inv.length||craftSel===G.invSel)return;
      var itemA=G.inv[craftSel],itemB=G.inv[G.invSel];
      var recipe=findRecipe(itemA,itemB);
      if(recipe){
        // Craft success!
        var newId="c"+Date.now().toString(36);
        var newItem={desc:recipe[2],glyph:recipe[3],id:newId,tags:recipe[4]};
        // Remove both ingredients (higher index first to avoid shifting)
        var hi=Math.max(craftSel,G.invSel),lo=Math.min(craftSel,G.invSel);
        G.inv.splice(hi,1);G.inv.splice(lo,1);
        G.inv.push(newItem);
        G.invSel=G.inv.length-1;
        craftSel=-1;
        // Unlock artisanat skill
        if(G.skills.indexOf("artisanat")<0){G.skills.push("artisanat");showN("Compétence débloquée: artisanat. "+newItem.desc+" créé.")}
        else showN("Fabriqué: "+newItem.desc);
        audio.playSfx("sfx_craft");save(G);
      }else{
        // No recipe — ask Director
        craftSel=-1;G.invOpen=false;G.busy=true;G.ni++;
        var r=await callDir("Le joueur essaie de COMBINER: \""+itemA.desc+"\" + \""+itemB.desc+"\". Est-ce possible? Si oui, quel résultat? Si non, pourquoi? Propose des choix.",G,null);
        G.busy=false;
        if(r){
          apply(r,null);
          // If Director spawned an object, it's the craft result
        }else showN("Ces objets ne se combinent pas.");
        save(G);
      }
    }else if(act2==="use"){
      // Check if edible/drinkable by tags or Director
      var tags=item.tags||"";
      var desc2=item.desc.toLowerCase();
      var isFood=tags.indexOf("food")>=0||desc2.indexOf("viande")>=0||desc2.indexOf("baie")>=0||desc2.indexOf("pomme")>=0||desc2.indexOf("pain")>=0||desc2.indexOf("poisson")>=0||desc2.indexOf("fruit")>=0||desc2.indexOf("champignon")>=0||desc2.indexOf("nourriture")>=0;
      var isDrink=tags.indexOf("drink")>=0||desc2.indexOf("eau")>=0||desc2.indexOf("bouteille")>=0||desc2.indexOf("gourde")>=0;
      if(isFood){
        G.inv.splice(G.invSel,1);
        if(G.invSel>=G.inv.length)G.invSel=Math.max(0,G.inv.length-1);
        // Create hunger gauge if not exists, then fill it
        if(!G.gauges.faim)G.gauges.faim={val:60,max:100,icon:"hunger",born:G.time};
        G.gauges.faim.val=Math.min(G.gauges.faim.max,G.gauges.faim.val+30);
        showN("Mangé: "+item.desc+". L'estomac se calme.");audio.playSfx("sfx_eat");save(G);
      }else if(isDrink){
        // Don't consume container, just use it
        if(!G.gauges.soif)G.gauges.soif={val:60,max:100,icon:"thirst",born:G.time};
        G.gauges.soif.val=Math.min(G.gauges.soif.max,G.gauges.soif.val+35);
        showN("Bu. La gorge s'apaise.");audio.playSfx("sfx_drink");save(G);
      }else{
        // Send to Director for context-dependent use
        G.invOpen=false;G.busy=true;G.ni++;
        var r=await callDir("Le joueur UTILISE: "+item.desc+" (inventaire). Contexte: que peut-il en faire ici?",G,null);
        G.busy=false;
        if(r)apply(r,null);else showN("Rien ne se passe.");
        save(G);
      }
    }else if(act2==="examine"){
      G.invOpen=false;G.busy=true;G.ni++;
      var r=await callDir("Le joueur EXAMINE attentivement: "+item.desc+". Décris l'objet en détail sensoriel et propose des choix.",G,null);
      G.busy=false;
      if(r)apply(r,null);else showN(item.desc+".");
      save(G);
    }
    if(G.inv.length===0)G.invOpen=false;
  }

  // ═══ CHOICE SYSTEM ═══
  async function pickChoice(idx){
    if(!G.choices||idx>=G.choices.length||G.busy)return;
    var chosen=G.choices[idx];
    G.choiceLog.push(chosen);
    if(G.choiceLog.length>30)G.choiceLog.shift();
    G.choices=null;G._choiceRects=null;
    audio.playSfx("choice");

    // ── TRADE CHOICE ──
    if(G._tradeNPC){
      var tnpc=G._tradeNPC;
      G._tradeNPC=null;
      if(chosen.indexOf("Acheter:")===0){
        var itemName=chosen.substring(9).trim();
        // Check if player has something to trade (coins, collier, or any trade-tagged item)
        var payIdx=-1;
        for(var pi3=0;pi3<G.inv.length;pi3++){
          var ptags=G.inv[pi3].tags||"";var pdesc=G.inv[pi3].desc.toLowerCase();
          if(ptags.indexOf("trade")>=0||pdesc.indexOf("pièce")>=0||pdesc.indexOf("collier")>=0||pdesc.indexOf("clé")>=0){payIdx=pi3;break}
        }
        if(payIdx>=0){
          G.inv.splice(payIdx,1);
          var tid="t"+Date.now().toString(36);
          var isFood=itemName.indexOf("pain")>=0||itemName.indexOf("soupe")>=0||itemName.indexOf("croissant")>=0||itemName.indexOf("tarte")>=0||itemName.indexOf("bière")>=0||itemName.indexOf("vin")>=0;
          var isDrink=itemName.indexOf("eau")>=0||itemName.indexOf("bière")>=0||itemName.indexOf("vin")>=0||itemName.indexOf("whisky")>=0;
          var isMed=itemName.indexOf("bandage")>=0||itemName.indexOf("cataplasme")>=0||itemName.indexOf("herbe")>=0;
          var tags2=isFood?"food":isDrink?"food,drink":isMed?"medicine":"";
          var glyph2=isFood?"🍞":isDrink?"🍶":isMed?"🩹":itemName.indexOf("corde")>=0?"🪢":itemName.indexOf("couteau")>=0?"🔪":itemName.indexOf("bougie")>=0?"🕯":itemName.indexOf("carte")>=0?"🗺":"📦";
          G.inv.push({desc:itemName,glyph:glyph2,id:tid,tags:tags2});
          audio.playSfx("sfx_trade");showN("Échange conclu. "+itemName+".");
        }else{
          showN("Rien à offrir en échange. Il faut quelque chose de valeur.");
        }
        save(G);return;
      }
      // "Partir" — just close
      save(G);return;
    }

    // ── MORTALITY CHOICE ──
    if(G._mortalCause){
      var cause=G._mortalCause;
      G._mortalCause=null;
      if(idx===0){
        // Player chose mortality
        G.mortal=true;
        showN("La fragilité entre dans le monde. Désormais, le corps peut céder.");
        // Immediately die from the original cause
        setTimeout(function(){doDeath(cause)},2000);
      }else{
        // Player refused mortality
        showN("Le corps résiste. Il ne mourra pas. Pas encore. Pas comme ça.");
        // Reset dangerous gauges to safe level
        for(var gk3 in G.gauges)if(G.gauges[gk3].val<=0)G.gauges[gk3].val=10;
      }
      save(G);
      return;
    }

    // ── DIRECTOR CHOICE ──
    G.busy=true;G.ni++;
    var action="CHOIX DU JOUEUR: \""+chosen+"\"";
    var r=await callDir(action,G,null);
    G.busy=false;
    if(r)apply(r,null);
    else showN(chosen+".");
    save(G);
  }

  // ═══ JUMP / CLIMB / MOUNT ═══
  function tryJump(){
    if(G.jumpT>0||G.mounted||G.intr)return false;
    // Jump over 1 tile obstacle in facing direction
    var dirs=[[1,-1],[-1,1],[-1,-1],[1,1]];
    var fd3=dirs[G.facing||0];
    var jx=Math.floor(G.px)+fd3[0],jy=Math.floor(G.py)+fd3[1];
    var jt=world.tile(jx,jy);
    // Can jump over building tiles and built blocks
    if(jt===3){
      var landX=jx+fd3[0],landY=jy+fd3[1];
      var lt=world.tile(landX,landY);
      if(lt!==3&&lt!==8){// land on walkable tile
        G.jumpT=0.4;
        G.px=landX+0.5;G.py=landY+0.5;
        audio.playSfx("sfx_jump");
        if(G.skills.indexOf("saut")<0)G.skills.push("saut");
        return true;
      }
    }
    return false;
  }

  function tryClimb(){
    if(G.mounted||G.intr)return false;
    // Check if near cliff/mountain edge (tile 9 = shore/cliff)
    var px=Math.floor(G.px),py=Math.floor(G.py);
    for(var cdy=-1;cdy<=1;cdy++)for(var cdx=-1;cdx<=1;cdx++){
      var ct=world.tile(px+cdx,py+cdy);
      if(ct===9){// cliff edge → can climb
        var above=world.tile(px+cdx*2,py+cdy*2);
        if(above===4||above===7){// land on ground
          G.climbT=0.6;
          G.px=px+cdx*2+0.5;G.py=py+cdy*2+0.5;
          audio.playSfx("sfx_climb");
          if(G.skills.indexOf("escalade")<0){G.skills.push("escalade");showN("Les mains trouvent prise. Escalade débloquée.")}
          else showN("Escalade.");
          return true;
        }
      }
    }
    return false;
  }

  function tryMount(){
    if(G.mounted){
      // Dismount
      G.mounted=null;G.mountSpd=0;
      showN("Pied à terre.");
      return true;
    }
    // Check nearby tamed horse
    for(var ch of world.vis(G.px,G.py))for(var pr of ch.props){
      if(pr.isAnimal&&pr.tp==="horse"&&pr.tameP>=0.9){
        var md=Math.sqrt((pr.x-G.px)*(pr.x-G.px)+(pr.y-G.py)*(pr.y-G.py));
        if(md<2){
          G.mounted={type:"horse",prop:pr};G.mountSpd=SPD*2.2;
          audio.playSfx("sfx_mount");showN("En selle.");
          if(G.skills.indexOf("équitation")<0)G.skills.push("équitation");
          return true;
        }
      }
    }
    // Check nearby vehicle in city
    for(var ch2 of world.vis(G.px,G.py)){
      if(!ch2.vehs)continue;
      for(var vi=0;vi<ch2.vehs.length;vi++){
        var veh=ch2.vehs[vi];
        var vd=Math.sqrt((veh.x-G.px)*(veh.x-G.px)+(veh.y-G.py)*(veh.y-G.py));
        if(vd<2){
          G.mounted={type:"vehicle",veh:veh};G.mountSpd=SPD*3;
          audio.playSfx("sfx_vehicle");showN("Moteur. Le véhicule démarre.");
          return true;
        }
      }
    }
    return false;
  }

  // ═══ CONSTRUCTION SYSTEM ═══
  G.buildMode=false;
  function tryBuild(){
    // Check if player has building materials
    var matIdx=-1;var matType="";
    for(var bi2=0;bi2<G.inv.length;bi2++){
      var tags=G.inv[bi2].tags||"";var desc=G.inv[bi2].desc.toLowerCase();
      if(tags.indexOf("build")>=0||desc.indexOf("planche")>=0){matIdx=bi2;matType="wood";break}
      if(desc.indexOf("pierre")>=0||desc.indexOf("rock")>=0){matIdx=bi2;matType="stone";break}
      if(desc.indexOf("bois")>=0){matIdx=bi2;matType="wood";break}
    }
    if(matIdx<0){showN("Rien à placer. Il faut du bois ou de la pierre.");return false}
    // Place block at the tile the player is facing
    var dirs=[[1,-1],[-1,1],[-1,-1],[1,1]];
    var fd2=dirs[G.facing||0];
    var bx=Math.floor(G.px)+fd2[0],by=Math.floor(G.py)+fd2[1];
    // Can only build on empty ground
    var bt2=world.tile(bx,by);
    if(bt2!==4&&bt2!==7){showN("Impossible de construire ici.");return false}
    // Place the block
    world.setTile(bx,by,3);// building tile (blocks movement)
    // Add visual prop
    world.addProp(bx+0.5,by+0.5,matType==="wood"?"blockWood":"blockStone",{built:true});
    // Consume material
    G.inv.splice(matIdx,1);
    if(G.invSel>=G.inv.length)G.invSel=Math.max(0,G.inv.length-1);
    if(G.skills.indexOf("construction")<0){G.skills.push("construction");showN("Compétence débloquée: construction. Bloc placé.")}
    else showN("Bloc placé.");
    audio.playSfx("sfx_build");save(G);
    return true;
  }

  // ═══ INTERIOR NPC SYSTEM ═══
  // Some room types have NPCs (merchants, baristas, etc.)
  var ROOM_NPCS={
    bar:[{desc:"barman, tablier taché",idle:"lean",trade:["bière","vin","whisky"]},
         {desc:"ivrogne au comptoir",idle:"sit"}],
    shop:[{desc:"marchand, lunettes rondes",idle:"stand",trade:["pain","bouteille d'eau","corde","bougie","couteau"]}],
    restaurant:[{desc:"serveur en noir",idle:"walk",trade:["soupe chaude","pain frais","eau"]}],
    hotel:[{desc:"réceptionniste, sourire poli",idle:"stand",trade:["clé de chambre","carte locale"]}],
    bakery:[{desc:"boulanger, mains farinées",idle:"stand",trade:["pain frais","croissant","tarte"]}],
    clinic:[{desc:"médecin, blouse blanche",idle:"stand",trade:["bandage","cataplasme","herbes médicinales"]}],
    library:[{desc:"bibliothécaire, silence",idle:"sit"}],
    station:[{desc:"officier, uniforme",idle:"stand"}]
  };

  function spawnRoomNPCs(roomType){
    var defs=ROOM_NPCS[roomType];
    if(!defs)return;
    // Pick one NPC (not all)
    var def=defs[Math.floor(Math.random()*defs.length)];
    var nid="rn"+Date.now().toString(36);
    var npc={desc:def.desc,idle:def.idle,trade:def.trade||null,
      x:ROOM_W/2+1,y:2,id:nid,color:"#6a6a8e",wt:0,wx:0,wy:0,isRoomNPC:true};
    G.npcs.push(npc);
    G.roomNPC=nid;
  }

  // ═══ PHYSICAL ACTIONS ═══
  // Check what tool the player has equipped (best tool wins)
  function bestTool(){
    var sharp=null,heavy=null,fire=null,fish=null,light=null;
    for(var i=0;i<G.inv.length;i++){
      var tags=G.inv[i].tags||"";var desc=G.inv[i].desc.toLowerCase();
      if(tags.indexOf("sharp")>=0||desc.indexOf("silex")>=0||desc.indexOf("hache")>=0||desc.indexOf("lance")>=0)sharp=G.inv[i];
      if(tags.indexOf("heavy")>=0||desc.indexOf("outil")>=0||desc.indexOf("hache")>=0)heavy=G.inv[i];
      if(tags.indexOf("fire")>=0||desc.indexOf("torche allum")>=0||desc.indexOf("silex")>=0)fire=G.inv[i];
      if(tags.indexOf("fishing")>=0||desc.indexOf("canne")>=0)fish=G.inv[i];
      if(tags.indexOf("light")>=0||desc.indexOf("torche allum")>=0)light=G.inv[i];
    }
    return{sharp:sharp,heavy:heavy,fire:fire,fish:fish,light:light};
  }

  // Find nearest tree/rock/prop within action range
  function nearTarget(){
    var px=Math.floor(G.px),py=Math.floor(G.py);
    var best=null,bd=2.5;
    // Check trees
    for(var ch of world.vis(G.px,G.py)){
      for(var tr of ch.trees){
        var d=Math.sqrt((tr.x-G.px)*(tr.x-G.px)+(tr.y-G.py)*(tr.y-G.py));
        if(d<bd){bd=d;best={type:"tree",x:Math.floor(tr.x),y:Math.floor(tr.y),data:tr}}
      }
      // Check rock/campfire props
      for(var pr of ch.props){
        if(pr.tp!=="rock"&&pr.tp!=="campfire"&&pr.tp!=="obsidian")continue;
        var d2=Math.sqrt((pr.x-G.px)*(pr.x-G.px)+(pr.y-G.py)*(pr.y-G.py));
        if(d2<bd){bd=d2;best={type:pr.tp,x:Math.floor(pr.x),y:Math.floor(pr.y),data:pr}}
      }
    }
    // Check if near water for fishing
    for(var dy2=-1;dy2<=1;dy2++)for(var dx2=-1;dx2<=1;dx2++){
      if(world.tile(px+dx2,py+dy2)===8){
        var wd=Math.sqrt(dx2*dx2+dy2*dy2);
        if(wd<bd){bd=wd;best={type:"water",x:px+dx2,y:py+dy2}}
      }
    }
    return best;
  }

  function tryPhysicalAction(){
    var tools=bestTool();
    var target=nearTarget();
    if(!target)return false;

    if(target.type==="tree"&&tools.sharp){
      // CUT TREE
      world.removeTree(target.x,target.y);
      // Spawn wood + stick
      var wid="w"+Date.now().toString(36);
      G.inv.push({desc:"bois",glyph:"🪵",id:wid,tags:"material"});
      if(Math.random()<.5){var sid="s"+Date.now().toString(36);G.inv.push({desc:"bâton",glyph:"🪵",id:sid,tags:""})}
      if(G.skills.indexOf("bûcheronnage")<0)G.skills.push("bûcheronnage");
      audio.playSfx("sfx_chop");showN("L'arbre tombe. Bois récupéré.");
      save(G);return true;
    }

    if(target.type==="rock"&&tools.heavy){
      // BREAK ROCK
      world.removeProp(target.x,target.y,"rock");
      var rid="r"+Date.now().toString(36);
      G.inv.push({desc:"pierre",glyph:"🪨",id:rid,tags:""});
      if(Math.random()<.3){var fid="f"+Date.now().toString(36);G.inv.push({desc:"silex brut",glyph:"🔪",id:fid,tags:"sharp"})}
      audio.playSfx("sfx_break");showN("La roche se fend. Pierres récupérées.");
      save(G);return true;
    }

    if(target.type==="obsidian"&&tools.heavy){
      world.removeProp(target.x,target.y,"obsidian");
      var oid2="ob"+Date.now().toString(36);
      G.inv.push({desc:"obsidienne",glyph:"⬛",id:oid2,tags:"sharp"});
      audio.playSfx("sfx_break");showN("L'obsidienne se brise net. Tranchant.");
      save(G);return true;
    }

    if(target.type==="water"&&tools.fish){
      // FISHING
      if(G.skills.indexOf("pêche")<0)G.skills.push("pêche");
      if(Math.random()<.6){
        var fid2="fish"+Date.now().toString(36);
        G.inv.push({desc:"poisson cru",glyph:"🐟",id:fid2,tags:"food,raw"});
        audio.playSfx("sfx_fish");showN("Un poisson! Il frétille au bout de la ligne.");
      }else{
        showN("La ligne tremble... mais rien ne mord.");
      }
      save(G);return true;
    }

    // LIGHT FIRE — if player has fire tool + wood in inventory, near a campfire or empty ground
    if(tools.fire){
      var hasWood=G.inv.some(function(it){return it.desc.toLowerCase().indexOf("bois")>=0||it.desc.toLowerCase().indexOf("bâton")>=0});
      if(hasWood&&(target.type==="campfire"||(world.tile(Math.floor(G.px),Math.floor(G.py))===4||world.tile(Math.floor(G.px),Math.floor(G.py))===7))){
        // Consume wood
        for(var wi2=0;wi2<G.inv.length;wi2++){
          if(G.inv[wi2].desc.toLowerCase().indexOf("bois")>=0||G.inv[wi2].desc.toLowerCase().indexOf("bâton")>=0){G.inv.splice(wi2,1);break}
        }
        // Place active fire
        var fx2=Math.floor(G.px)+.5,fy2=Math.floor(G.py)+.5;
        world.addProp(fx2,fy2,"fireActive",{lit:true,fuel:120,startT:G.time});
        world.addPoi(fx2,fy2,"fire","fire"+Date.now().toString(36),"feu de camp actif");
        if(G.skills.indexOf("feu")<0)G.skills.push("feu");
        // Create warmth gauge if in cold biome
        var curBio2="";var cc2=world.gc(Math.floor(G.px/CH),Math.floor(G.py/CH));if(cc2)curBio2=cc2.bio||"";
        if(curBio2==="snow"||curBio2==="tundra"||curBio2==="glacier"){
          if(!G.gauges.chaleur)G.gauges.chaleur={val:70,max:100,icon:"warmth",born:G.time};
          G.gauges.chaleur.val=Math.min(100,G.gauges.chaleur.val+30);
        }
        audio.playSfx("sfx_firelight");showN("Les flammes prennent. Chaleur.");
        save(G);return true;
      }
    }

    // DIG — if heavy tool + on dirt
    if(tools.heavy&&world.tile(Math.floor(G.px),Math.floor(G.py))===7){
      world.setTile(Math.floor(G.px),Math.floor(G.py),4);// dirt → grass (dug)
      var did="d"+Date.now().toString(36);
      if(Math.random()<.15){G.inv.push({desc:"argile",glyph:"🧱",id:did,tags:""});showN("Creusé. De l'argile sous la surface.")}
      else if(Math.random()<.1){G.inv.push({desc:"ver de terre",glyph:"🪱",id:did,tags:"bait"});showN("Creusé. Un ver de terre.")}
      else showN("Creusé. Rien de spécial.");
      audio.playSfx("sfx_dig");save(G);return true;
    }

    return false;
  }

  // ── INTERACTION ──
  async function act(){
    audio.init();if(G.busy||G.time-G.lastIT<1.5)return;G.lastIT=G.time;shT=G.time;
    if(G.intr){
      // ═══ ROOM NPC INTERACTION ═══
      if(G.nearRoomNPC){
        var rnpc=G.nearRoomNPC;
        audio.playSfx("sfx_greet");
        if(rnpc.trade&&rnpc.trade.length>0){
          // Merchant — show trade choices
          var tradeChoices=[];
          for(var ti2=0;ti2<Math.min(rnpc.trade.length,3);ti2++)tradeChoices.push("Acheter: "+rnpc.trade[ti2]);
          tradeChoices.push("Partir");
          G.choices=tradeChoices;G.choiceT=G.time;
          G._tradeNPC=rnpc;
          showN(rnpc.desc+". Un regard vers l'étalage.");
          G.busy=false;return;
        }else{
          // Non-merchant NPC — Director narration
          G.busy=true;G.ni++;
          var r=await callDir("Le joueur parle à: "+rnpc.desc+" dans un "+G.room.type+". Propose des choix de dialogue.",G,null);
          G.busy=false;
          if(r)apply(r,null);else showN(rnpc.desc+" regarde le joueur en silence.");
          save(G);return;
        }
      }
      // ═══ INTERIOR FURNITURE INTERACTION ═══
      if(G.nearFurn){
        var ft=G.nearFurn.tp;
        G.busy=true;G.ni++;
        // Direct actions for specific furniture
        if(ft==="chest"){
          // Random loot
          var loots=[{d:"vieille clé rouillée",g:"🗝",t:""},{d:"pièces d'argent",g:"🪙",t:"trade"},{d:"couteau rouillé",g:"🔪",t:"sharp"},{d:"bout de pain",g:"🍞",t:"food"},{d:"carte ancienne",g:"🗺",t:""},{d:"corde",g:"🪢",t:""}];
          var loot=loots[Math.floor(Math.random()*loots.length)];
          G.inv.push({desc:loot.d,glyph:loot.g,id:"l"+Date.now().toString(36),tags:loot.t});
          audio.playSfx("sfx_collect");showN("Le coffre s'ouvre. "+loot.d+".");G.busy=false;save(G);return;
        }else if(ft==="bed"){
          // Sleep — advance time, restore fatigue
          G.dayT=(G.dayT+0.3)%1;// advance 7h
          if(!G.gauges.fatigue)G.gauges.fatigue={val:50,max:100,icon:"fatigue",born:G.time};
          G.gauges.fatigue.val=Math.min(100,G.gauges.fatigue.val+60);
          if(G.gauges.sante)G.gauges.sante.val=Math.min(G.gauges.sante.max,G.gauges.sante.val+20);
          showN("Le sommeil vient vite. Le temps passe.");G.busy=false;save(G);return;
        }else if(ft==="oven"||ft==="fireplace"){
          // Cook if raw food in inventory
          var rawI=-1;
          for(var ci5=0;ci5<G.inv.length;ci5++){if((G.inv[ci5].tags||"").indexOf("raw")>=0){rawI=ci5;break}}
          if(rawI>=0){
            var raw2=G.inv[rawI];var cooked2=raw2.desc.replace("cru","cuit").replace("crues","cuites");
            G.inv.splice(rawI,1);
            G.inv.push({desc:cooked2,glyph:"🍖",id:"ck"+Date.now().toString(36),tags:"food"});
            if(G.skills.indexOf("cuisine")<0)G.skills.push("cuisine");
            audio.playSfx("sfx_craft");showN("Cuisson terminée. "+cooked2+".");G.busy=false;save(G);return;
          }
          showN("Le "+(ft==="oven"?"four":"feu")+" est chaud. Rien à cuire.");G.busy=false;return;
        }else if(ft==="water_cooler"||ft==="well"){
          if(!G.gauges.soif)G.gauges.soif={val:60,max:100,icon:"thirst",born:G.time};
          G.gauges.soif.val=Math.min(100,G.gauges.soif.val+40);
          audio.playSfx("sfx_drink");showN("L'eau est fraîche.");G.busy=false;save(G);return;
        }else if(ft==="chair"||ft==="sofa"||ft==="bench_r"||ft==="bench_gym"||ft==="stool"){
          if(!G.gauges.fatigue)G.gauges.fatigue={val:70,max:100,icon:"fatigue",born:G.time};
          G.gauges.fatigue.val=Math.min(100,G.gauges.fatigue.val+10);
          showN("Un moment de repos.");G.busy=false;save(G);return;
        }else if(ft==="shelf"||ft==="cabinet"||ft==="filing"||ft==="wardrobe"){
          // Search — chance to find item
          if(Math.random()<.35){
            var finds=[{d:"livre usé",g:"📖",t:""},{d:"bouteille vide",g:"🍶",t:"container"},{d:"briquet",g:"🔥",t:"fire"},{d:"ficelle",g:"🧶",t:""},{d:"bougie",g:"🕯",t:"light"},{d:"bandage",g:"🩹",t:"medicine"}];
            var find2=finds[Math.floor(Math.random()*finds.length)];
            G.inv.push({desc:find2.d,glyph:find2.g,id:"f"+Date.now().toString(36),tags:find2.t});
            audio.playSfx("sfx_collect");showN("Trouvé: "+find2.d+".");G.busy=false;save(G);return;
          }
          showN("Rien d'intéressant.");G.busy=false;return;
        }else{
          // Generic — ask Director
          var r=await callDir("Le joueur interagit avec: "+ft+" dans un intérieur ("+G.room.type+").",G,null);
          G.busy=false;if(r)apply(r,null);else showN("...");save(G);return;
        }
      }
      G.intr=null;G.intD=null;G.room=null;return
    }
    G.busy=true;G.ni++;audio.ping();
    var p=G.nearPoi;var a,nh=null;var same=p?(p.id===G.lpi):false;G.lpi=p&&p.id||null;
    if(p){
      if(p.tp==="npc"){var npc=G.npcs.find(function(n){return n.id===p.id});
        a=same?"Le joueur interagit encore avec "+((npc&&npc.desc)||"cette personne")+".":"Le joueur s'approche de "+((npc&&npc.desc)||"quelqu'un")+". "+((npc&&npc.idle)||"");
        if((G.nc[p.id]&&G.nc[p.id].length))nh=G.nc[p.id].slice(-6).join("\n");
      }else if(p.tp==="object"){
        var obj=G.objs.find(function(o){return o.id===p.id});
        if(obj&&obj.pickable){G.inv.push({desc:obj.desc,glyph:obj.glyph||"?",id:obj.id});G.objs=G.objs.filter(function(o){return o.id!==p.id});
          world.vis(G.px,G.py).forEach(function(ch){ch.poi=ch.poi.filter(function(pp){return pp.id!==p.id})});audio.playSfx("pickup");showN("Ramassé: "+obj.desc);G.busy=false;save(G);return}
        a="Le joueur examine: "+(p.desc||"un objet");
      }else if(p.tp==="fire"){
        // Active fire — cook food if player has raw food
        var rawIdx=-1;
        for(var ri2=0;ri2<G.inv.length;ri2++){
          if((G.inv[ri2].tags||"").indexOf("raw")>=0){rawIdx=ri2;break}
        }
        if(rawIdx>=0){
          var rawItem=G.inv[rawIdx];
          var cookedDesc=rawItem.desc.replace("cru","cuit").replace("crues","cuites");
          G.inv.splice(rawIdx,1);
          var cid="ck"+Date.now().toString(36);
          G.inv.push({desc:cookedDesc,glyph:"🍖",id:cid,tags:"food"});
          if(G.skills.indexOf("cuisine")<0)G.skills.push("cuisine");
          audio.playSfx("sfx_craft");showN("Les flammes grésillent. "+cookedDesc+".");
          G.busy=false;save(G);return;
        }
        a="Le joueur s'approche du feu. Les flammes crépitent.";
      }else if(p.tp==="animal"){
        // Find the animal prop
        var anCh=world.gc(Math.floor(p.x/CH),Math.floor(p.y/CH));
        var anProp=anCh?anCh.props[p.aIdx]:null;
        if(anProp){
          var tamed=anProp.tameP>=0.9;
          var hasWeapon=G.inv.some(function(it){return(it.tags||"").indexOf("weapon")>=0});
          var hasFood=G.inv.some(function(it){return(it.tags||"").indexOf("food")>=0});
          if(tamed){
            // Tamed animal — Director narrates bond
            a="L'animal ("+p.desc+") est apprivoisé. Il fait confiance au joueur.";
            if(p.desc==="horse")a+=" Le joueur pourrait le monter.";
          }else if(anProp.ai==="flee"){
            // Animal fleeing — can't interact
            showN("L'animal s'enfuit.");audio.playSfx("sfx_flee");G.busy=false;return;
          }else{
            // Wild animal — Director proposes choices based on context
            a="Le joueur s'approche d'un "+p.desc+" sauvage.";
            if(hasWeapon)a+=" Il a une arme.";
            if(hasFood)a+=" Il a de la nourriture.";
            if(anProp.canTame>0)a+=" L'animal semble pouvoir être apprivoisé (progression: "+(anProp.tameP*100|0)+"%).";
            if(anProp.canMeat)a+=" L'animal pourrait fournir de la viande.";
          }
        }else a="Un animal.";
      }else if(p.tp==="resource"){
        // Natural resource — collectible
        var resGlyph={flower:"🌸",mush:"🍄",berry:"🫐",shell:"🐚",reed:"🌿",rock:"🪨",vine:"🌱",fern:"🌿",obsidian:"⬛",stick:"🪵",leaf:"🍃",clay:"🧱",crop:"🌾"}[p.rtp]||"·";
        var resTags={berry:"food",mush:"food",crop:"food",flower:"",shell:"",reed:"",rock:"",vine:"",fern:"",obsidian:"",stick:"",leaf:"",clay:""}[p.rtp]||"";
        G.inv.push({desc:p.desc,glyph:resGlyph,id:p.id,tags:resTags});
        // Remove the POI
        world.vis(G.px,G.py).forEach(function(ch){ch.poi=ch.poi.filter(function(pp){return pp.id!==p.id})});
        audio.playSfx("pickup");audio.playSfx("sfx_collect");showN("Cueilli: "+p.desc);G.busy=false;save(G);return;
      }else a={door:"Le joueur essaie d'ouvrir une porte.",bench:"Le joueur s'assoit.",corner:"Le joueur observe.",
        clearing:"Espace dégagé.",ruin:"Pierres anciennes.",well:"Un puits en pierre. L'eau est sombre."}[p.tp]||"Interaction.";
    }else{
      // No POI nearby — try physical action, then jump/climb
      if(tryPhysicalAction()){G.busy=false;return}
      if(tryJump()){G.busy=false;return}
      if(tryClimb()){G.busy=false;return}
      a="Le joueur regarde autour de lui.";
    }
    var r=await callDir(a,G,nh);
    if(r){apply(r,p);
      if((p&&p.tp)==="npc"){if(!G.nc[p.id])G.nc[p.id]=[];if(r.narrative)G.nc[p.id].push("[j]"+(r.narrative));
        if(r.bubble){for(var bid2 in r.bubble){if(!G.nc[bid2])G.nc[bid2]=[];G.nc[bid2].push("[p]"+r.bubble[bid2])}}}}    else if(!isNoDir())showN("...");
    G.busy=false;
  }

  async function autoT(tp){
    if(G.busy||isNoDir())return;G.busy=true;G.ni++;
    var r=await callDir({first_move:"La silhouette fait ses premiers pas.",idle:"Immobile.",explore:"Marche. "+(G.dw|0)+" pas."}[tp]||"Immobile.",G,null);
    if(r)apply(r);G.busy=false;
  }

  function apply(r,poi){
    if(r.narrative){showN(r.narrative);G.nLog.push(r.narrative)}
    if(r.interior&&poi&&poi.tp==="door"){G.intr=poi.id;G.intD=r.interior;G.intF=0;audio.playSfx("door")}
    if(r.bubble&&typeof r.bubble==="object"){for(var bid in r.bubble)G.bubs.push({nid:bid,text:String(r.bubble[bid]),st:G.time})}
    if(r.npcs_spawn)r.npcs_spawn.forEach(function(n){
      var nid="n"+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
      var nx=Math.round(G.px+(n.dx!=null?n.dx:(Math.random()-.5)*5)),ny=Math.round(G.py+(n.dy!=null?n.dy:(Math.random()-.5)*5));
      for(var i=0;i<8;i++){if([1,2,4,7].indexOf(world.tile(nx,ny))>=0)break;nx=Math.round(G.px+(Math.random()-.5)*6);ny=Math.round(G.py+(Math.random()-.5)*6)}
      G.npcs.push({desc:n.desc,idle:n.idle,x:nx+.5,y:ny+.5,id:nid,color:NB[H(nx,ny)%NB.length],wt:0,wx:0,wy:0});
      world.gc(Math.floor(nx/CH),Math.floor(ny/CH)).poi.push({tp:"npc",x:nx+.5,y:ny+.5,id:nid,desc:n.desc,idle:n.idle})});
    if(r.npcs_remove)G.npcs=G.npcs.filter(function(n){return r.npcs_remove.indexOf(n.id)<0});
    if(r.objects_spawn)r.objects_spawn.forEach(function(o){
      var oid="o"+Date.now().toString(36);var ox=Math.round(G.px+(o.dx||0)),oy=Math.round(G.py+(o.dy||0));
      G.objs.push({desc:o.desc,glyph:o.glyph,x:ox+.5,y:oy+.5,id:oid,pickable:!!o.pickable});
      world.gc(Math.floor(ox/CH),Math.floor(oy/CH)).poi.push({tp:"object",x:ox+.5,y:oy+.5,id:oid,desc:o.desc})});
    if(r.profile_delta){for(var pk in G.prof)if(r.profile_delta[pk])G.prof[pk]=cl(G.prof[pk]+r.profile_delta[pk],-1,1)}
    if(r.seeds)r.seeds.forEach(function(s){if(s)G.seeds.push(s)});
    if(r.world_mood&&r.world_mood!=="null")G.mood=r.world_mood;
    if(r.weather&&r.weather!=="null")G.wth=r.weather;
    if(r.arc&&r.arc!=="null"&&G.arcs.indexOf(r.arc)<0)G.arcs.push(r.arc);
    // ═══ EMERGENT SYSTEMS ═══
    // Gauges — Director creates new gauges when player behavior implies them
    if(r.gauges_create)r.gauges_create.forEach(function(g){
      if(g&&g.name&&!G.gauges[g.name]){
        G.gauges[g.name]={val:g.val||80,max:g.max||100,icon:g.icon||g.name,born:G.time};
        showN((g.name==="faim"?"Une sensation oubliée. La faim.":g.name==="soif"?"La gorge sèche.":g.name==="endurance"?"Le souffle se fait court.":g.name==="chaleur"?"Le froid mord la peau.":"Quelque chose change."));}});
    // Gauge updates
    if(r.gauges_update){for(var gk in r.gauges_update)if(G.gauges[gk])G.gauges[gk].val=cl(G.gauges[gk].val+r.gauges_update[gk],0,G.gauges[gk].max)}
    // Skills — Director unlocks skills when player learns by doing
    if(r.skills_unlock)r.skills_unlock.forEach(function(s){
      if(s&&G.skills.indexOf(s)<0){G.skills.push(s);showN("Quelque chose s'est débloqué : "+s+".")}});
    // Intent tracking — Director observes what the player seems to want
    if(r.intent_observed&&r.intent_observed!==""){G.intents.push(r.intent_observed);if(G.intents.length>20)G.intents.shift()}
    // Animal interactions from Director
    if(r.tame_animal&&G.nearPoi&&G.nearPoi.tp==="animal"){
      var tCh=world.gc(Math.floor(G.nearPoi.x/CH),Math.floor(G.nearPoi.y/CH));
      if(tCh&&tCh.props[G.nearPoi.aIdx]){
        tCh.props[G.nearPoi.aIdx].tameP=Math.min(1,(tCh.props[G.nearPoi.aIdx].tameP||0)+0.3);
        if(tCh.props[G.nearPoi.aIdx].tameP>=0.9){audio.playSfx("sfx_tame");if(G.skills.indexOf("dressage")<0)G.skills.push("dressage")}
      }
    }
    if(r.hunt_animal&&G.nearPoi&&G.nearPoi.tp==="animal"){
      // Remove animal, spawn meat
      var hCh=world.gc(Math.floor(G.nearPoi.x/CH),Math.floor(G.nearPoi.y/CH));
      if(hCh){
        var hAn=hCh.props[G.nearPoi.aIdx];
        if(hAn&&hAn.canMeat){
          hAn.x=-999;hAn.y=-999;hAn.ai="dead";// move off screen
          var mid="m"+Date.now().toString(36);
          G.inv.push({desc:"viande crue de "+G.nearPoi.desc,glyph:"🥩",id:mid,tags:"food,raw"});
          if(G.skills.indexOf("chasse")<0)G.skills.push("chasse");
        }
      }
    }
    // Choices — Director proposes options to the player
    if(r.choices&&r.choices.length>=2){G.choices=r.choices.slice(0,4);G.choiceT=G.time}
    else G.choices=null;
    if(poi)poi.used=true;saving=G.time;save(G);
  }

  function showN(t){G.narr={text:t,ci:0,st:G.time,done:false,fs:0}}

  // ═══ DEATH + DAMAGE ═══
  // Mortality is EMERGENT. The player cannot die until they've chosen mortality.
  // When a lethal situation occurs for the first time, the Director asks.
  function doDeath(cause){
    if(!G.mortal){
      if(!G.mortalAsked[cause]){
        G.mortalAsked[cause]=true;
        var msgs={
          noyade:"L'eau monte. Le souffle manque. Le corps lutte.",
          froid:"Le froid engourdit tout. Les pensées ralentissent.",
          faim:"Le ventre crie. La vue se trouble.",
          soif:"La gorge brûle. Les lèvres craquent.",
          hostile:"La douleur irradie. Le sang coule."
        };
        showN(msgs[cause]||"Le corps faiblit.");
        G.choices=["Accepter la mortalité","Résister à tout prix"];
        G.choiceT=G.time;
        G._mortalCause=cause;
      }else{
        // Already asked, player refused — just narrate the danger
        showN("Le corps proteste, mais tient. Pour l'instant.");
        // Reset gauge to minimum viable
        for(var gk in G.gauges)if(G.gauges[gk].val<=0)G.gauges[gk].val=5;
      }
      return;
    }
    // ── ACTUAL DEATH (mortal mode) ──
    var deathMsgs={noyade:"L'eau noire engloutit tout.",froid:"Le froid a eu raison du corps.",faim:"La faim, finalement.",soif:"Plus une goutte.",hostile:"La douleur, puis le noir."};
    audio.playSfx("sfx_death");showN(deathMsgs[cause]||"Le noir.");
    // Respawn at city center, lose some inventory
    G.px=CS/2;G.py=CS/2;G.camX=(G.px-G.py)*TW;G.camY=(G.px+G.py)*TH;
    var lost=0;
    while(G.inv.length>0&&lost<G.inv.length/2){
      var ri3=Math.floor(Math.random()*G.inv.length);
      G.inv.splice(ri3,1);lost++;
    }
    for(var gk2 in G.gauges)G.gauges[gk2].val=G.gauges[gk2].max*0.5;
    G.intr=null;G.room=null;G.invOpen=false;G.swimT=0;
    save(G);
  }

  // Environmental damage tick (called in game loop)
  function envDamage(dt2,bio,dL){
    // Cold damage in snow/tundra/glacier at night
    if((bio==="snow"||bio==="tundra"||bio==="glacier")&&dL<0.3){
      if(!G.gauges.chaleur)G.gauges.chaleur={val:60,max:100,icon:"warmth",born:G.time};
      G.gauges.chaleur.val-=dt2*0.003;
      // Near fire? Warm up
      var nearFire=false;
      for(var ch of world.vis(G.px,G.py))for(var pr of ch.props)
        if(pr.tp==="fireActive"&&Math.sqrt((pr.x-G.px)*(pr.x-G.px)+(pr.y-G.py)*(pr.y-G.py))<4)nearFire=true;
      if(nearFire)G.gauges.chaleur.val=Math.min(100,G.gauges.chaleur.val+dt2*0.01);
      if(G.gauges.chaleur.val<=0)doDeath("froid");
    }
    // Volcanic heat damage
    if(bio==="volcanic"){
      if(!G.gauges.sante)G.gauges.sante={val:80,max:100,icon:"health",born:G.time};
      G.gauges.sante.val-=dt2*0.001;
      if(G.gauges.sante.val<=0)doDeath("hostile");
    }
    // Starvation / dehydration (only if gauges exist)
    if(G.gauges.faim&&G.gauges.faim.val<=0)doDeath("faim");
    if(G.gauges.soif&&G.gauges.soif.val<=0)doDeath("soif");
    // Wolf attack if near hostile animal
    for(var ch2 of world.vis(G.px,G.py))for(var pr2 of ch2.props){
      if(pr2.isAnimal&&pr2.hostile&&pr2.ai!=="dead"&&pr2.ai!=="flee"){
        var ad2=Math.sqrt((pr2.x-G.px)*(pr2.x-G.px)+(pr2.y-G.py)*(pr2.y-G.py));
        if(ad2<1.5){
          if(!G.gauges.sante)G.gauges.sante={val:80,max:100,icon:"health",born:G.time};
          G.gauges.sante.val-=dt2*0.015;
          if(Math.random()<0.01)showN("Morsure!");
          if(G.gauges.sante.val<=0)doDeath("hostile");
        }
      }
    }
  }

  // ═══ GAME LOOP ═══
  var lastT=performance.now(),savT=0;

  function loop(now){
    var dt=Math.min((now-lastT)/16.67,3);lastT=now;
    G.time+=dt*.016;G.pt+=dt*.016;G.fadeIn=Math.min(1,G.fadeIn+.006*dt);
    G.dayT=(G.dayT+dt*.00007)%1;
    var dL=Math.max(0,Math.sin(G.dayT*Math.PI*2-Math.PI/2)*.5+.5);
    var sw=cv.clientWidth,sh=cv.clientHeight;
    // Sunrise/sunset color shift — warm tones during transitions
    var sunAngle=G.dayT*Math.PI*2-Math.PI/2;
    var sunsetAmt=Math.max(0,Math.sin(sunAngle*2))*Math.max(0,1-Math.abs(dL-.5)*4);// peaks at dawn/dusk
    var sR=lp(5,46,dL)+sunsetAmt*25;
    var sG=lp(5,60,dL)+sunsetAmt*8;
    var sB=lp(14,86,dL)-sunsetAmt*15;
    var shAmt=Math.max(0,1-(G.time-shT)*4)*3;
    var shX=Math.sin(G.time*40)*shAmt,shY=Math.cos(G.time*35)*shAmt;

    if(!G.intr){
      // ── MOVEMENT ──
      var dx=0,dy=0;
      if(!G.invOpen&&!G.menuOpen){
      if(G.keys["w"]||G.keys["arrowup"]){dx--;dy--}if(G.keys["s"]||G.keys["arrowdown"]){dx++;dy++}
      if(G.keys["a"]||G.keys["arrowleft"]){dx--;dy++}if(G.keys["d"]||G.keys["arrowright"]){dx++;dy--}
      if(joy.on&&(Math.abs(joy.dx)>.15||Math.abs(joy.dy)>.15)){dx+=(joy.dx+joy.dy)*.7;dy+=(-joy.dx+joy.dy)*.7}
      }
      var mv=dx!==0||dy!==0;
      var spd=G.mounted?G.mountSpd:(G.keys["shift"]||joy.mg>.85?SPRNT:SPD);
      // Jump/climb animation decay
      if(G.jumpT>0)G.jumpT=Math.max(0,G.jumpT-dt*0.016);
      if(G.climbT>0)G.climbT=Math.max(0,G.climbT-dt*0.016);
      // Move mounted animal with player
      if(G.mounted&&G.mounted.type==="horse"&&G.mounted.prop){
        G.mounted.prop.x=G.px;G.mounted.prop.y=G.py;
      }
      if(mv){
        if(!G.fm){G.fm=true;audio.init()}
        var ln=Math.sqrt(dx*dx+dy*dy);
        // Swimming — water is traversable but slow
        var curTile=world.tile(Math.floor(G.px),Math.floor(G.py));
        var inWater=curTile===8;
        var swimMult=inWater?0.35:1;// 35% speed in water
        var mx=dx/ln*spd*dt*swimMult,my=dy/ln*spd*dt*swimMult;
        var nextTile=world.tile(Math.floor(G.px+mx),Math.floor(G.py+my));
        // Buildings (3) always block. Water (8) is traversable.
        if(nextTile!==3){G.px+=mx;G.py+=my}else{
          if(world.tile(Math.floor(G.px+mx),Math.floor(G.py))!==3)G.px+=mx;
          if(world.tile(Math.floor(G.px),Math.floor(G.py+my))!==3)G.py+=my;
        }
        // Swimming effects
        if(inWater){
          G.swimT=(G.swimT||0)+dt*0.016;
          // Unlock swim skill after 10 seconds total
          if(G.swimT>10&&G.skills.indexOf("nage")<0){G.skills.push("nage");showN("Le corps s'adapte à l'eau. Nage débloquée.")}
          // Drowning risk if no swim skill and in water > 5s continuous
          if(G.skills.indexOf("nage")<0&&G.swimT>5){
            if(!G.gauges.sante)G.gauges.sante={val:80,max:100,icon:"health",born:G.time};
            G.gauges.sante.val-=dt*0.008;// slow damage
            if(G.gauges.sante.val<=0){doDeath("noyade")}
          }
          // Create endurance gauge if swimming
          if(!G.gauges.endurance)G.gauges.endurance={val:70,max:100,icon:"stamina",born:G.time};
          G.gauges.endurance.val=Math.max(0,G.gauges.endurance.val-dt*0.004);
        }else{G.swimT=0}
        G.dw+=spd*dt;G.tv.add((G.px|0)+","+(G.py|0));G.lastMT=G.time;G.idleT=false;audio.step(true,dt*.016);
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
      var inCity=G.px>=0&&G.px<CS&&G.py>=0&&G.py<CS;
      audio.ambient(dt*.016,inCity);
      // Ambient WAV loop based on location
      if(audio.ok&&!audio.loopsLoaded)audio.loadLoops();
      // Get current biome for ambient selection
      var curBio="";
      if(!inCity){var cc=world.gc(Math.floor(G.px/CH),Math.floor(G.py/CH));curBio=cc.bio||""}
      audio.updateLoop(inCity,G.wth,curBio);
      if(G.intr)audio.playLoop("indoor");
      audio._dayT=G.dayT;
      if(audio.m)audio.m.gain.value=0.15*G.volMaster*2;
      audio.updateMusic(G.mood,G.intr,curBio);

      // Gauge natural decay
      if(G.gauges.faim)G.gauges.faim.val=Math.max(0,G.gauges.faim.val-dt*0.0008);
      if(G.gauges.soif)G.gauges.soif.val=Math.max(0,G.gauges.soif.val-dt*0.001);
      if(G.gauges.fatigue&&!G.intr)G.gauges.fatigue.val=Math.max(0,G.gauges.fatigue.val-dt*0.0003);
      if(G.gauges.endurance&&mv)G.gauges.endurance.val=Math.max(0,G.gauges.endurance.val-dt*0.0005);
      if(G.gauges.endurance&&!mv)G.gauges.endurance.val=Math.min(G.gauges.endurance.max,G.gauges.endurance.val+dt*0.001);
      // Environmental damage
      if(!G.intr)envDamage(dt*0.016,curBio,dL);

      // District change detection — show name briefly
      var curDist;
      if(inCity){curDist=gDist(G.px|0,G.py|0)===0?"DOWNTOWN":gDist(G.px|0,G.py|0)===1?"INDUSTRIAL":"RESIDENTIAL"}
      else{var biName={forest:"FORÊT",field:"CHAMPS",hills:"COLLINES",river:"RIVIÈRE",swamp:"MARÉCAGE",moor:"LANDE",mountain:"MONTAGNE",desert:"DÉSERT",coast:"CÔTE",snow:"NEIGE",marsh:"MARAIS",farmland:"TERRES AGRICOLES",jungle:"JUNGLE",tundra:"TOUNDRA",canyon:"CANYON",lake:"LAC",glacier:"GLACIER",volcanic:"VOLCANIQUE",meadow:"PRAIRIE",steppe:"STEPPE",savanna:"SAVANE",ruins:"RUINES ANCIENNES"};
        curDist=biName[curBio]||"NATURE SAUVAGE"}
      if(curDist!==G.lastDist){G.lastDist=curDist;G.distShowT=G.time}

      // Auto-triggers
      if(G.fm&&!G.ft&&G.dw>1.5){G.ft=true;autoT("first_move")}
      if(!mv&&G.time-G.lastMT>35&&!G.idleT&&G.ni>0){G.idleT=true;autoT("idle")}
      if(mv&&G.dw-G.explT>45&&G.ni>=1){G.explT=G.dw;if(Math.random()<.1)autoT("explore")}

      // ── NPC WANDER ──
      for(var n of G.npcs){
        n.wt=(n.wt||0)+dt*.016;
        if(n.wt>3+Math.random()*5){n.wt=0;n.wx=(Math.random()-.5)*.008;n.wy=(Math.random()-.5)*.008}
        var nt=world.tile(Math.floor(n.x+(n.wx||0)),Math.floor(n.y+(n.wy||0)));
        if(nt!==3&&nt!==8){n.x+=(n.wx||0)*dt;n.y+=(n.wy||0)*dt}
        for(var ch of world.vis(G.px,G.py))for(var p of ch.poi)if(p.id===n.id){p.x=n.x;p.y=n.y}
      }

      // ── ANIMAL AI ──
      for(var ch of world.vis(G.px,G.py)){
        for(var pri=0;pri<ch.props.length;pri++){
          var an=ch.props[pri];
          if(!an.isAnimal)continue;
          var adx=G.px-an.x,ady=G.py-an.y;
          var adist=Math.sqrt(adx*adx+ady*ady);
          an.aiT=(an.aiT||0)+dt*0.016;

          if(an.ai==="flee"){
            // Running away from player
            an.fleeT-=dt*0.016;
            if(an.fleeT<=0){an.ai="idle";an.vx=0;an.vy=0}
            else{
              var fln=Math.sqrt(an.vx*an.vx+an.vy*an.vy)||1;
              an.x+=an.vx/fln*an.spd*dt*2;an.y+=an.vy/fln*an.spd*dt*2;
            }
          }else if(an.ai==="idle"){
            // Check player proximity
            if(adist<an.shyDist&&mv){
              // Player approaching while moving — flee!
              an.ai="flee";an.fleeT=1.5+Math.random();
              an.vx=-adx;an.vy=-ady;
              if(!an.canFly){var ft=world.tile(Math.floor(an.x+an.vx),Math.floor(an.y+an.vy));if(ft===8||ft===3)an.ai="idle"}
            }else if(adist<an.shyDist*0.5&&!mv){
              // Player nearby and still — animal curious or taming
              if(an.canTame>0){
                an.tameP=Math.min(1,(an.tameP||0)+dt*0.002*an.canTame);
              }
            }else{
              // Wander randomly
              if(an.aiT>3+Math.random()*8){
                an.aiT=0;
                var hx=an.homeX-an.x,hy=an.homeY-an.y;
                var homeDist=Math.sqrt(hx*hx+hy*hy);
                if(homeDist>6){an.vx=hx*0.3;an.vy=hy*0.3}// return home
                else{an.vx=(Math.random()-.5);an.vy=(Math.random()-.5)}
              }
              var wln=Math.sqrt(an.vx*an.vx+an.vy*an.vy)||1;
              if(wln>0.1){
                var nx2=an.x+an.vx/wln*an.spd*dt*0.3;
                var ny2=an.y+an.vy/wln*an.spd*dt*0.3;
                var wt2=world.tile(Math.floor(nx2),Math.floor(ny2));
                if(wt2!==8&&wt2!==3&&wt2!==1){an.x=nx2;an.y=ny2}
                else{an.vx=-an.vx;an.vy=-an.vy}
              }
            }
          }
          // Update corresponding POI position
          for(var poi2 of ch.poi)if(poi2.tp==="animal"&&poi2.aIdx===pri){poi2.x=an.x;poi2.y=an.y}
        }
      }

      // ── CAMERA ── (faster breathing when sprinting)
      var sprinting=G.keys["shift"]||joy.mg>.85;
      var breathSpd=sprinting?1.2:.3;
      var bX=Math.sin(G.time*breathSpd)*(.6+sprinting*.4)+shX;
      var bY=Math.cos(G.time*(breathSpd*.8))*(.4+sprinting*.3)+shY;
      G.camX+=((G.px-G.py)*TW+bX-G.camX)*CLERP*dt;
      G.camY+=((G.px+G.py)*TH+bY-G.camY)*CLERP*dt;

      // ── NEAREST POI ──
      G.nearPoi=null;var nd=IR;
      for(var ch of world.vis(G.px,G.py))for(var p of ch.poi){
        var d=Math.sqrt((p.x-G.px)*(p.x-G.px)+(p.y-G.py)*(p.y-G.py));if(d<nd){nd=d;G.nearPoi=p}
      }

      // ═══ RENDER ═══
      ctx.fillStyle="rgb("+(sR|0)+","+(sG|0)+","+(sB|0)+")";ctx.fillRect(0,0,sw,sh);
      // Sunrise/sunset horizon glow
      if(sunsetAmt>.1){
        ctx.globalAlpha=sunsetAmt*.12;
        ctx.fillStyle="rgb("+(180+sunsetAmt*40|0)+","+(80+sunsetAmt*30|0)+","+(40|0)+")";
        ctx.fillRect(0,sh*.35,sw,sh*.3);
        ctx.globalAlpha=1;
      }

      // Stars
      if(dL<.4){var sa=(.4-dL)*2.5;
        for(var s of stars){ctx.globalAlpha=sa*s.b*(.5+Math.sin(G.time*s.sp)*.5)*.35;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(s.x*sw,s.y*sh,s.sz,0,Math.PI*2);ctx.fill()}
        ctx.globalAlpha=sa*.4;ctx.fillStyle="#e8e4d8";ctx.beginPath();ctx.arc(sw*.78,sh*.08,8,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="rgb("+(sR|0)+","+(sG|0)+","+(sB|0)+")";ctx.beginPath();ctx.arc(sw*.78+3,sh*.08-1,6.5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}

      // Tiles
      var vis=world.vis(G.px,G.py);var allT=[];
      for(var ch of vis){var ox=ch.cx*CH,oy=ch.cy*CH;
        for(var ly=0;ly<CH;ly++)for(var lx=0;lx<CH;lx++){
          var gx=ox+lx,gy=oy+ly,p=iso(gx+.5,gy+.5,G.camX,G.camY,sw,sh);
          if(p.sx<-TW*2||p.sx>sw+TW*2||p.sy<-TH*2||p.sy>sh+TH*2)continue;
          allT.push({gx,gy,sx:p.sx,sy:p.sy,t:ch.t[ly]?ch.t[ly][lx]:0});
        }}
      allT.sort(function(a,b){return(a.gx+a.gy)-(b.gx+b.gy)});
      for(var t of allT)drawGnd(ctx,t.sx,t.sy,t.t,dL,t.gx,t.gy,G.time);

      // Footprints (age + draw + cleanup)
      for(var fp of footprints)fp.age+=dt*.016;
      drawFootprints(ctx,footprints,G.camX,G.camY,sw,sh,dL);
      while(footprints.length>0&&footprints[0].age>16)footprints.shift();

      for(var ch of vis)for(var p of ch.poi)drawPOI(ctx,p,G.camX,G.camY,sw,sh,G.time,p===G.nearPoi);

      // Depth-sorted entities
      var ents=[];
      for(var ch of vis){
        for(var b of ch.bl)ents.push({t:0,d:b.x+b.w+b.y+b.d,data:b});
        for(var tr of ch.trees)ents.push({t:1,d:tr.x+tr.y+1.5,data:tr});
        for(var pr of ch.props)ents.push({t:5,d:pr.x+pr.y+.5,data:pr});
        for(var an of ch.ambN)ents.push({t:6,d:an.x+an.y+.5,data:an});
        for(var v of ch.vehs)ents.push({t:7,d:v.x+v.y+.5,data:v});
        for(var tl of ch.tLights)ents.push({t:8,d:tl.x+tl.y+.5,data:tl});
      }
      ents.push({t:2,d:G.px+G.py+.5});
      for(var n of G.npcs)ents.push({t:3,d:n.x+n.y+.5,data:n});
      for(var o of G.objs)ents.push({t:4,d:o.x+o.y+.5,data:o});
      ents.sort(function(a,b){return a.d-b.d});

      for(var e of ents){
        if(e.t===0)drawBldg(ctx,e.data,G.camX,G.camY,sw,sh,dL,G.time);
        else if(e.t===1)drawTree(ctx,e.data.x,e.data.y,G.camX,G.camY,sw,sh,dL);
        else if(e.t===2){var p=iso(G.px,G.py,G.camX,G.camY,sw,sh);
          // Jump offset
          var jumpOff=0;
          if(G.jumpT>0){jumpOff=Math.sin(G.jumpT/0.4*Math.PI)*18}
          var psy2=p.sy-jumpOff;
          // Mounted visual
          if(G.mounted&&G.mounted.type==="horse"){
            // Draw horse underneath
            var hm=dL;
            ctx.fillStyle="rgb("+(110*hm|0)+","+(80*hm|0)+","+(50*hm|0)+")";
            ctx.beginPath();ctx.ellipse(p.sx,psy2+2,8,4,.05,0,Math.PI*2);ctx.fill();
            ctx.fillStyle="rgb("+(100*hm|0)+","+(72*hm|0)+","+(45*hm|0)+")";
            ctx.beginPath();ctx.ellipse(p.sx+6,psy2,3,2.5,-.2,0,Math.PI*2);ctx.fill();
            // Legs animate
            var lga=G.time*8;
            ctx.strokeStyle="rgb("+(85*hm|0)+","+(60*hm|0)+","+(38*hm|0)+")";ctx.lineWidth=1;
            ctx.beginPath();ctx.moveTo(p.sx-4,psy2+4);ctx.lineTo(p.sx-4+Math.sin(lga)*2,psy2+9);ctx.stroke();
            ctx.beginPath();ctx.moveTo(p.sx+3,psy2+4);ctx.lineTo(p.sx+3+Math.sin(lga+2)*2,psy2+9);ctx.stroke();
            // Player sits higher
            drawFig(ctx,p.sx,psy2-10,G.time,mv,"#343640","#222230",0.9,true);
          }else if(G.mounted&&G.mounted.type==="vehicle"){
            // Draw simple vehicle shape
            ctx.fillStyle="rgba(60,65,80,"+(0.6*dL)+")";
            ctx.fillRect(p.sx-10,psy2-4,20,10);
            ctx.fillStyle="rgba(80,85,100,"+(0.5*dL)+")";
            ctx.fillRect(p.sx-7,psy2-10,14,7);
            drawFig(ctx,p.sx,psy2-8,G.time,false,"#343640","#222230",0.85,true);
          }else{
            // Swimming
            var playerInW=world.tile(Math.floor(G.px),Math.floor(G.py))===8;
            if(playerInW){
              ctx.save();ctx.beginPath();ctx.rect(0,0,sw,psy2-8);ctx.clip();
              drawFig(ctx,p.sx,psy2,G.time,mv,"#343640","#222230",1,true);
              ctx.restore();
              ctx.globalAlpha=0.35;ctx.fillStyle="rgba(30,60,120,0.5)";
              ctx.beginPath();ctx.ellipse(p.sx,psy2-2,12,5,0,0,Math.PI*2);ctx.fill();
              ctx.strokeStyle="rgba(80,120,180,0.2)";ctx.lineWidth=0.5;
              ctx.beginPath();ctx.ellipse(p.sx,psy2-2,14+Math.sin(G.time*3)*2,6,0,0,Math.PI*2);ctx.stroke();
              ctx.globalAlpha=1;
            }else{
              drawFig(ctx,p.sx,psy2,G.time,mv,"#343640","#222230",1,true);
            }
          }
          // Jump shadow
          if(G.jumpT>0){ctx.globalAlpha=0.1;ctx.fillStyle="#000";ctx.beginPath();ctx.ellipse(p.sx,p.sy,6,3,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
          if(mv){var fd=[[3,-1],[-1,2],[-3,1],[1,-2]][G.facing];
            ctx.globalAlpha=.12;ctx.fillStyle="#aab";ctx.beginPath();ctx.arc(p.sx+fd[0]*3,psy2+fd[1]*2-15,1.5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}}
        else if(e.t===3){var p=iso(e.data.x,e.data.y,G.camX,G.camY,sw,sh);
          if(p.sx>-40&&p.sx<sw+40)drawFig(ctx,p.sx,p.sy,G.time,Math.abs(e.data.wx||0)>.004,e.data.color||"#5a5a7e","#282838",.3)}
        else if(e.t===4){var p=iso(e.data.x,e.data.y,G.camX,G.camY,sw,sh);
          if(p.sx>-20&&p.sx<sw+20){if((G.objs.find(function(o){return o.id===e.data.id})||{}).pickable)ctx.globalAlpha=.4+Math.sin(G.time*3)*.15;
            ctx.font="13px serif";ctx.textAlign="center";ctx.fillText(e.data.glyph||"?",p.sx,p.sy-4);ctx.globalAlpha=1}}
        else if(e.t===5)drawProp(ctx,e.data,G.camX,G.camY,sw,sh,dL);
        else if(e.t===6){
          var an=e.data;
          if(an.idle==="walk"){var dirs=[[.01,0],[0,.01],[-.01,0],[0,-.01]];var ddx=dirs[an.dir%4][0],ddy=dirs[an.dir%4][1];
            var nx=an.x+ddx*an.spd*dt,ny=an.y+ddy*an.spd*dt;
            // NPCs slow/stop when player is very close
            var distToP=Math.sqrt((an.x-G.px)**2+(an.y-G.py)**2);
            if(distToP>3){
              if([1,2].includes(world.tile(Math.floor(nx),Math.floor(ny)))){an.x=nx;an.y=ny}else an.dir=(an.dir+1+(Math.random()*2|0))%4
            }
          }
          var p=iso(an.x,an.y,G.camX,G.camY,sw,sh);
          var closeToPlayer=Math.sqrt((an.x-G.px)**2+(an.y-G.py)**2)<3.5;
          if(p.sx>-25&&p.sx<sw+25){
            drawFig(ctx,p.sx,p.sy,G.time+an.ph,an.idle==="walk"&&!closeToPlayer,an.bc,an.lc,.22,false,closeToPlayer&&an.idle!=="walk"?an.idle:an.idle);
            drawNpcAware(ctx,p.sx,p.sy,closeToPlayer);
          }
        }
        else if(e.t===7){
          var v=e.data;
          if(!v.pk){var dirs=[[.01,0],[0,.01],[-.01,0],[0,-.01]];var vdx=dirs[v.dir%4][0],vdy=dirs[v.dir%4][1];
            var nvx=v.x+vdx*v.spd*dt,nvy=v.y+vdy*v.spd*dt;
            if(world.tile(Math.floor(nvx),Math.floor(nvy))===1){v.x=nvx;v.y=nvy}else v.dir=(v.dir+1+(Math.random()*2|0))%4}
          drawVeh(ctx,v,G.camX,G.camY,sw,sh,dL);
        }
        else if(e.t===8)drawTL(ctx,e.data,G.camX,G.camY,sw,sh,dL,G.time);
      }

      for(var ch of vis)for(var l of ch.lamps)drawLamp(ctx,l,G.camX,G.camY,sw,sh,dL);

      // Edge vignette + night atmosphere
      var vigA=.16-dL*.06;
      ctx.globalAlpha=vigA;ctx.fillStyle="rgb("+(sR|0)+","+(sG|0)+","+(sB|0)+")";
      ctx.fillRect(0,0,sw,sh*.12);ctx.fillRect(0,sh*.88,sw,sh*.12);
      ctx.fillRect(0,0,sw*.07,sh);ctx.fillRect(sw*.93,0,sw*.07,sh);
      // Night fog — low-lying haze effect
      if(dL<.3){
        ctx.globalAlpha=((.3-dL)/.3)*.06;ctx.fillStyle="rgb("+(sR+10|0)+","+(sG+10|0)+","+(sB+15|0)+")";
        ctx.fillRect(0,sh*.6,sw,sh*.4);
      }
      ctx.globalAlpha=1;

      // Bubbles
      G.bubs=G.bubs.filter(function(b){return G}.time-b.st<6);
      for(var b of G.bubs){var npc=(G.npcs.find(function(n){return n.id===b.nid}));if(!npc)continue;
        var p=iso(npc.x,npc.y,G.camX,G.camY,sw,sh);
        var a=G.time-b.st>4?Math.max(0,1-(G.time-b.st-4)/2):Math.min(1,(G.time-b.st)*2);
        ctx.globalAlpha=a*.85;ctx.font="11px 'Courier New',monospace";var tw=ctx.measureText(b.text).width+12;
        ctx.fillStyle="rgba(10,10,18,.88)";ctx.fillRect(p.sx-tw/2,p.sy-52,tw,22);
        ctx.fillStyle="#d0ccc4";ctx.textAlign="center";ctx.fillText(b.text,p.sx,p.sy-37);ctx.globalAlpha=1}

      // Weather effects
      if(G.wth==="rain"||G.wth==="drizzle"){
        var int=G.wth==="rain"?0.7:.3;
        ctx.strokeStyle="rgba(140,165,185,"+(.05*int)+")";ctx.lineWidth=.5;
        for(var i=0;i<22;i++){
          var rx=Math.random()*sw,ry=Math.random()*sh;
          ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(rx-1.5,ry+6*int);ctx.stroke();
        }
        // Ground splash circles
        if(G.wth==="rain"){
          ctx.strokeStyle="rgba(120,140,165,"+(.03)+")";ctx.lineWidth=.3;
          for(var i=0;i<5;i++){
            var rx=Math.random()*sw,ry=sh*.4+Math.random()*sh*.5;
            ctx.beginPath();ctx.ellipse(rx,ry,2+Math.random()*2,1+Math.random(),0,0,Math.PI*2);ctx.stroke();
          }
        }
      }
      if(G.wth==="fog"){
        ctx.globalAlpha=.08;ctx.fillStyle="rgb("+(sR+15|0)+","+(sG+15|0)+","+(sB+20|0)+")";ctx.fillRect(0,0,sw,sh);ctx.globalAlpha=1;
      }
      // Snow — slow falling flakes
      if(G.wth==="snow"){
        ctx.fillStyle="rgba(220,225,235,.5)";
        for(var si=0;si<30;si++){
          var sx2=(Math.sin(G.time*0.3+si*47)+1)*sw/2+(Math.sin(G.time*0.7+si*23))*sw*0.3;
          var sy2=((G.time*15+si*sh/30)%sh);
          ctx.globalAlpha=.2+Math.sin(si*3)*.1;
          ctx.beginPath();ctx.arc(sx2%sw,sy2,1+Math.sin(si)*.5,0,Math.PI*2);ctx.fill();
        }
        // White ground overlay
        ctx.globalAlpha=.04;ctx.fillStyle="#dde";ctx.fillRect(0,sh*.5,sw,sh*.5);
        ctx.globalAlpha=1;
      }
      // Heat — shimmer distortion
      if(G.wth==="heat"){
        ctx.globalAlpha=.03;ctx.fillStyle="rgba(255,200,100,1)";
        for(var hi=0;hi<3;hi++){
          var hy=sh*.4+hi*sh*.15+Math.sin(G.time*2+hi)*10;
          ctx.fillRect(0,hy,sw,3);
        }
        ctx.globalAlpha=1;
      }

    }else{
      // ═══ INTERIOR INSTANCE ═══
      G.intF=Math.min(1,G.intF+dt*.03);
      // Generate room on first entry
      if(!G.room){
        var bType="default";
        // Detect building type from POI desc
        if(G.intD){
          var dd=G.intD.toLowerCase();
          if(dd.indexOf("cabin")>=0||dd.indexOf("cabane")>=0)bType="cabin";
          else if(dd.indexOf("farm")>=0||dd.indexOf("ferme")>=0)bType="farm";
          else if(dd.indexOf("chap")>=0||dd.indexOf("église")>=0)bType="chapel";
          else if(dd.indexOf("barn")>=0||dd.indexOf("grange")>=0)bType="barn";
          else if(dd.indexOf("mill")>=0||dd.indexOf("moulin")>=0)bType="mill";
        }
        // Also check POI id prefix
        var pid=G.intr||"";
        if(pid.indexOf("cab")===0)bType="cabin";
        else if(pid.indexOf("farm")===0)bType="farm";
        else if(pid.indexOf("barn")===0)bType="barn";
        else if(pid.indexOf("mill")===0)bType="mill";
        else if(pid.indexOf("chap")===0)bType="chapel";
        // If still default and in city → pick urban type based on district
        if(bType==="default"&&G.px>=0&&G.px<CS&&G.py>=0&&G.py<CS){
          var di2=gDist((G.px|0),(G.py|0));
          bType=pickUrbanType(di2,H(Math.round(G.px*37),Math.round(G.py*53)));
        }
        G.room=genRoom(bType,H(Math.round(G.px*100),Math.round(G.py*100)));
        G.rpx=ROOM_W/2;G.rpy=ROOM_H-2;
        // Spawn room NPCs
        G.roomNPC=null;
        // Remove previous room NPCs
        G.npcs=G.npcs.filter(function(n){return !n.isRoomNPC});
        spawnRoomNPCs(bType);
      }
      // Movement inside room
      var rdx=0,rdy=0;
      if(G.keys.w||G.keys.arrowup){rdx--;rdy--}if(G.keys.s||G.keys.arrowdown){rdx++;rdy++}
      if(G.keys.a||G.keys.arrowleft){rdx--;rdy++}if(G.keys.d||G.keys.arrowright){rdx++;rdy--}
      if(joy.on&&(Math.abs(joy.dx)>.15||Math.abs(joy.dy)>.15)){rdx+=(joy.dx+joy.dy)*.7;rdy+=(-joy.dx+joy.dy)*.7}
      if(rdx!==0||rdy!==0){
        var rln=Math.sqrt(rdx*rdx+rdy*rdy);
        var rmx=rdx/rln*0.04*dt,rmy=rdy/rln*0.04*dt;
        var nrx=G.rpx+rmx,nry=G.rpy+rmy;
        var gx2=Math.floor(nrx),gy2=Math.floor(nry);
        if(gx2>=0&&gx2<ROOM_W&&gy2>=0&&gy2<ROOM_H){
          var cell=G.room.grid[gy2][gx2];
          if(cell===0||cell===2){G.rpx=nrx;G.rpy=nry}
          // Exit door
          if(cell===2&&gy2>=ROOM_H-1){G.intr=null;G.intD=null;G.room=null;G.intF=0;G.npcs=G.npcs.filter(function(n){return !n.isRoomNPC});G.roomNPC=null}
        }
      }
      // Render room
      if(G.room){
        // Detect nearest furniture
        G.nearFurn=null;var nfd=1.8;
        for(var fi3=0;fi3<G.room.furniture.length;fi3++){
          var f3=G.room.furniture[fi3];
          var fd2=Math.sqrt((f3.x-G.rpx)*(f3.x-G.rpx)+(f3.y-G.rpy)*(f3.y-G.rpy));
          if(fd2<nfd){nfd=fd2;G.nearFurn=f3}
        }
        drawRoom(ctx,G.room,G.rpx,G.rpy,sw,sh,G.time);
      }
      // Draw player inside room
      if(G.room){
        var RTW2=36,RTH2=18;
        var psx=sw/2,psy=sh/2;
        // Draw room NPCs
        G.nearRoomNPC=null;var nrnD=2.5;
        for(var ni2=0;ni2<G.npcs.length;ni2++){
          var rn=G.npcs[ni2];
          if(!rn.isRoomNPC)continue;
          // Isometric position relative to camera
          var rnsx=sw/2+(rn.x-G.rpx)*RTW2-(rn.y-G.rpy)*RTW2;
          var rnsy=sh/2+(rn.x-G.rpx)*RTH2+(rn.y-G.rpy)*RTH2;
          drawFig(ctx,rnsx,rnsy-2,G.time,false,rn.color||"#6a6a8e","#2a2a48",0.28,false);
          // Proximity check
          var rnd=Math.sqrt((rn.x-G.rpx)*(rn.x-G.rpx)+(rn.y-G.rpy)*(rn.y-G.rpy));
          if(rnd<nrnD){nrnD=rnd;G.nearRoomNPC=rn}
        }
        drawFig(ctx,psx,psy,G.time,rdx!==0||rdy!==0,"#343640","#1a1a28",1,true);
        // Show furniture or NPC label
        if(G.nearRoomNPC){
          ctx.globalAlpha=0.4;ctx.fillStyle="#aae";ctx.font="8px monospace";ctx.textAlign="center";
          ctx.fillText(G.nearRoomNPC.desc,sw/2,sh*0.72);
          if(G.nearRoomNPC.trade){ctx.fillStyle="#ffd866";ctx.fillText("[commerce]",sw/2,sh*0.72+11)}
          ctx.globalAlpha=1;
        }else if(G.nearFurn){
          var furnNames={table:"table",chair:"chaise",chest:"coffre",fireplace:"cheminée",barrel:"tonneau",crate:"caisse",shelf:"étagère",hay:"foin",sack:"sac",tool:"outils",gear:"engrenage",altar:"autel",candle:"bougie",bench_r:"banc",bed:"lit",sofa:"canapé",tv:"télévision",wardrobe:"armoire",desk:"bureau",counter:"comptoir",stool:"tabouret",table_sm:"table",table_set:"table dressée",jukebox:"jukebox",filing:"classeur",water_cooler:"fontaine",printer:"imprimante",luggage:"bagages",painting:"tableau",treadmill:"tapis de course",weights:"haltères",bench_gym:"banc",mat:"tapis",workbench:"établi",tool_wall:"outils muraux",car_lift:"pont",washer:"machine à laver",basket:"panier",cabinet:"armoire",safe:"coffre-fort",pallet:"palette",oven:"four",locker:"casier",plant:"plante",lamp:"lampe"};
          ctx.globalAlpha=0.3;ctx.fillStyle="#ffd866";ctx.font="8px monospace";ctx.textAlign="center";
          ctx.fillText(furnNames[G.nearFurn.tp]||G.nearFurn.tp,sw/2,sh*0.72);ctx.globalAlpha=1;
        }
      }
      // Fade in
      if(G.intF<1){ctx.fillStyle="rgba(0,0,0,"+(1-G.intF)+")";ctx.fillRect(0,0,sw,sh)}
      // Show Director description
      if(G.intD&&G.intF>0.5){
        ctx.globalAlpha=Math.min(1,(G.intF-0.5)*2)*0.6;ctx.fillStyle="#c8c0b4";ctx.font="11px 'Courier New',monospace";ctx.textAlign="center";
        var dwords=G.intD.split(" ");var dline="",dly=sh*0.85;
        for(var dwi=0;dwi<dwords.length;dwi++){var dt2=dline+dwords[dwi]+" ";if(ctx.measureText(dt2).width>sw*0.8){ctx.fillText(dline,sw/2,dly);dly+=14;dline=dwords[dwi]+" "}else dline=dt2}
        ctx.fillText(dline,sw/2,dly);ctx.globalAlpha=1;
      }
      joy.draw(ctx);
    }

    // ═══ UI OVERLAY ═══
    // Inventory icon (tap to open)
    if(!G.intr){
      ctx.globalAlpha=G.inv.length>0?0.5:0.15;ctx.fillStyle="#c8c0b4";ctx.font="14px serif";ctx.textAlign="left";
      ctx.fillText("⊟",55,16);// inventory icon
      if(G.inv.length>0){ctx.font="8px monospace";ctx.fillText(G.inv.length+"",67,16)}
      // Build icon
      var hasMat=G.inv.some(function(it){var d=it.desc.toLowerCase();return d.indexOf("bois")>=0||d.indexOf("pierre")>=0||d.indexOf("planche")>=0});
      if(hasMat){ctx.globalAlpha=0.35;ctx.font="12px serif";ctx.fillText("⊞",85,16)}
      ctx.globalAlpha=1;
    }

    // ═══ INVENTORY PANEL ═══
    if(G.invOpen&&G.inv.length>0){
      var ipW=Math.min(sw*0.7,220),ipH=Math.min(sh*0.6,G.inv.length*36+80);
      var ipX=(sw-ipW)/2,ipY=(sh-ipH)/2;
      // Background
      ctx.globalAlpha=0.88;ctx.fillStyle="rgb(12,12,18)";ctx.fillRect(ipX,ipY,ipW,ipH);
      ctx.strokeStyle="rgba(200,190,160,0.25)";ctx.lineWidth=1;ctx.strokeRect(ipX,ipY,ipW,ipH);
      // Title
      ctx.globalAlpha=0.6;ctx.fillStyle="#ffd866";ctx.font="10px monospace";ctx.textAlign="center";
      ctx.fillText(craftSel>=0?"COMBINER → choisir 2ème":"INVENTAIRE",sw/2,ipY+16);
      // Items
      G._invRects=[];
      var iy=ipY+28;
      for(var ii=0;ii<G.inv.length;ii++){
        var sel=ii===G.invSel;
        ctx.globalAlpha=sel?0.9:0.5;
        var isCraftSel=ii===craftSel;
        if(sel){ctx.fillStyle="rgba(255,216,102,0.08)";ctx.fillRect(ipX+4,iy-2,ipW-8,28)}
        if(isCraftSel){ctx.fillStyle="rgba(102,255,102,0.1)";ctx.fillRect(ipX+4,iy-2,ipW-8,28)}
        ctx.fillStyle=sel?"#ffd866":"#c8c0b4";ctx.font="13px serif";ctx.textAlign="left";
        ctx.fillText(G.inv[ii].glyph||"·",ipX+12,iy+14);
        ctx.font="11px 'Courier New',monospace";
        var itxt=G.inv[ii].desc;if(ctx.measureText(itxt).width>ipW-50)itxt=itxt.substring(0,16)+"…";
        ctx.fillText(itxt,ipX+30,iy+14);
        G._invRects.push({x:ipX+4,y:iy-2,w:ipW-8,h:28,idx:ii});
        iy+=30;
      }
      // Action buttons for selected item
      var actY=iy+8;
      var acts=craftSel>=0?["Annuler","","","Combiner"]:["Utiliser","Combiner","Examiner","Poser"];
      var actKeys=craftSel>=0?["cancel","","","craft"]:["use","combine","examine","drop"];
      var actW=(ipW-20)/4;
      G._invActRects=[];
      for(var ai=0;ai<4;ai++){
        var ax=ipX+8+ai*actW;
        ctx.globalAlpha=0.6;ctx.fillStyle="rgba(200,190,160,0.1)";ctx.fillRect(ax,actY,actW-4,26);
        ctx.strokeStyle="rgba(200,190,160,0.2)";ctx.lineWidth=0.5;ctx.strokeRect(ax,actY,actW-4,26);
        ctx.globalAlpha=0.7;ctx.fillStyle="#c8c0b4";ctx.font="8px monospace";ctx.textAlign="center";
        ctx.fillText((ai+1)+"",ax+actW/2-2,actY+10);
        ctx.font="7px monospace";ctx.fillText(acts[ai],ax+actW/2-2,actY+20);
        G._invActRects.push({x:ax,y:actY,w:actW-4,h:26,act:actKeys[ai]});
      }
      // Close hint
      ctx.globalAlpha=0.2;ctx.font="7px monospace";ctx.textAlign="center";
      ctx.fillText("I / Escape = fermer",sw/2,actY+40);
      ctx.globalAlpha=1;
    }
    if(!G.intr)drawMM(ctx,G,world,sw,sh);

    // ═══ EMERGENT GAUGES — only shown if Director created them ═══
    var gKeys=[];for(var gk in G.gauges)gKeys.push(gk);
    if(gKeys.length>0&&!G.intr){
      // Tick gauges down slowly over time
      for(var gi=0;gi<gKeys.length;gi++){
        var gauge=G.gauges[gKeys[gi]];
        var rate=gKeys[gi]==="faim"?0.003:gKeys[gi]==="soif"?0.005:gKeys[gi]==="endurance"?(mv?0.01:.001):gKeys[gi]==="fatigue"?0.002:gKeys[gi]==="chaleur"?(dL<0.3?0.006:.001):.002;
        gauge.val=Math.max(0,gauge.val-rate*dt);
      }
      // Render gauges — small bars on left side, below minimap
      var gy=55;
      var gIcons={faim:"◉",soif:"◈",endurance:"◆",sante:"♥",fatigue:"◇",chaleur:"☀"};
      for(var gi=0;gi<gKeys.length;gi++){
        var gn=gKeys[gi],gv=G.gauges[gn];
        var ratio=gv.val/gv.max;
        // Color: green→yellow→red based on ratio
        var gr2=ratio>.5?200:ratio*400,rr=ratio<.5?200:(1-ratio)*400;
        ctx.globalAlpha=.4;ctx.fillStyle="rgba(8,8,16,.7)";ctx.fillRect(5,gy,52,10);
        ctx.fillStyle="rgb("+(rr|0)+","+(gr2|0)+",40)";ctx.fillRect(6,gy+1,ratio*50,8);
        ctx.globalAlpha=.5;ctx.fillStyle="#c8c0b4";ctx.font="7px monospace";ctx.textAlign="left";
        ctx.fillText((gIcons[gn]||"·")+" "+gn,7,gy+8);
        ctx.globalAlpha=1;
        gy+=13;
        // Critical warning — gauge near zero
        if(ratio<.15){ctx.globalAlpha=.1+Math.sin(G.time*5)*.05;ctx.fillStyle="#f44";ctx.fillRect(0,0,sw,2);ctx.fillRect(0,sh-2,sw,2);ctx.globalAlpha=1}
      }
    }

    // ═══ SKILLS — small icons top-right ═══
    if(G.skills.length>0&&!G.intr){
      ctx.globalAlpha=.3;ctx.fillStyle="#c8c0b4";ctx.font="8px monospace";ctx.textAlign="right";
      for(var si2=0;si2<Math.min(G.skills.length,6);si2++)
        ctx.fillText(G.skills[si2],sw-8,16+si2*10);
      ctx.globalAlpha=1;
    }
    // Mortality indicator
    if(G.mortal&&!G.intr){
      ctx.globalAlpha=0.15+Math.sin(G.time*0.5)*0.05;ctx.fillStyle="#c44";ctx.font="10px serif";ctx.textAlign="right";
      ctx.fillText("mortel",sw-8,sh-8);ctx.globalAlpha=1;
    }

    // ═══ PAUSE BUTTON — top-right hamburger ═══
    if(!G.intr&&!G.invOpen){
      ctx.globalAlpha=0.25;ctx.fillStyle="#c8c0b4";
      for(var hb=0;hb<3;hb++){ctx.fillRect(sw-28,8+hb*5,14,2)}
      ctx.globalAlpha=1;
    }

    // ═══ PAUSE MENU OVERLAY ═══
    if(G.menuOpen){
      // Dim background
      ctx.fillStyle="rgba(0,0,0,0.75)";ctx.fillRect(0,0,sw,sh);
      G._menuRects=[];
      var mW=Math.min(sw*0.8,260),mH=sh*0.85;
      var mX=(sw-mW)/2,mY=(sh-mH)/2;
      // Panel
      ctx.fillStyle="rgb(12,12,20)";ctx.fillRect(mX,mY,mW,mH);
      ctx.strokeStyle="rgba(200,190,160,0.15)";ctx.lineWidth=1;ctx.strokeRect(mX,mY,mW,mH);
      ctx.fillStyle="#ffd866";ctx.font="12px monospace";ctx.textAlign="center";

      if(G.menuPage==="main"){
        ctx.fillText("TABULA RASA",sw/2,mY+24);
        ctx.globalAlpha=0.3;ctx.font="7px monospace";
        ctx.fillText("V35 — "+G.skills.length+" compétences — "+G.inv.length+" objets",sw/2,mY+38);
        ctx.globalAlpha=0.5;ctx.font="7px monospace";
        ctx.fillText("temps: "+(G.dayT*24|0)+"h — dist: "+(G.dw|0)+"m — inter: "+G.ni,sw/2,mY+50);
        ctx.globalAlpha=1;
        // Menu buttons
        var btns=[["Reprendre","resume"],["Journal","journal"],["Carte","map"],["Compétences","skills"],["Réglages","settings"],["Réinitialiser","reset"],["Crédits","credits"]];
        var btnY=mY+70;
        for(var bi3=0;bi3<btns.length;bi3++){
          ctx.globalAlpha=0.6;ctx.fillStyle="rgba(200,190,160,0.06)";ctx.fillRect(mX+12,btnY,mW-24,34);
          ctx.strokeStyle="rgba(200,190,160,0.12)";ctx.lineWidth=0.5;ctx.strokeRect(mX+12,btnY,mW-24,34);
          ctx.globalAlpha=0.75;ctx.fillStyle=bi3===5?"#c66":"#c8c0b4";ctx.font="11px monospace";ctx.textAlign="center";
          ctx.fillText(btns[bi3][0],sw/2,btnY+22);
          G._menuRects.push({x:mX+12,y:btnY,w:mW-24,h:34,act:btns[bi3][1]});
          btnY+=42;
        }
      }else if(G.menuPage==="journal"){
        ctx.fillText("JOURNAL",sw/2,mY+24);
        ctx.globalAlpha=0.5;ctx.font="8px monospace";ctx.textAlign="left";
        var jy=mY+42;
        // Show last 15 choices
        var jlog=G.choiceLog.slice(-15);
        for(var ji=0;ji<jlog.length;ji++){
          ctx.fillStyle=ji%2===0?"#aaa8a0":"#88867e";
          var jtxt=jlog[ji];if(ctx.measureText(jtxt).width>mW-30)jtxt=jtxt.substring(0,28)+"…";
          ctx.fillText((ji+1)+". "+jtxt,mX+14,jy);jy+=13;
        }
        if(jlog.length===0){ctx.fillStyle="#666";ctx.fillText("Aucun choix encore.",mX+14,jy)}
        // Arcs
        if(G.arcs&&G.arcs.length>0){
          jy+=16;ctx.fillStyle="#ffd866";ctx.font="9px monospace";ctx.fillText("ARCS:",mX+14,jy);jy+=12;
          ctx.fillStyle="#aaa";ctx.font="8px monospace";
          for(var ai2=0;ai2<Math.min(G.arcs.length,5);ai2++){ctx.fillText("· "+G.arcs[ai2],mX+14,jy);jy+=12}
        }
        ctx.globalAlpha=1;
        // Back button
        ctx.globalAlpha=0.5;ctx.fillStyle="rgba(200,190,160,0.08)";ctx.fillRect(mX+12,mY+mH-44,mW-24,32);
        ctx.fillStyle="#c8c0b4";ctx.font="10px monospace";ctx.textAlign="center";ctx.fillText("← Retour",sw/2,mY+mH-24);
        G._menuRects.push({x:mX+12,y:mY+mH-44,w:mW-24,h:32,act:"main"});
        ctx.globalAlpha=1;
      }else if(G.menuPage==="map"){
        ctx.fillText("CARTE",sw/2,mY+24);
        // Draw explored tiles as minimap
        var mapSz=Math.min(mW-30,mH-80);
        var mapX=mX+(mW-mapSz)/2,mapY=mY+40;
        ctx.fillStyle="rgba(8,8,16,0.8)";ctx.fillRect(mapX,mapY,mapSz,mapSz);
        // Scale: show ±30 tiles around player
        var mapR=30,mapSc=mapSz/(mapR*2);
        // Draw visited tiles
        ctx.globalAlpha=0.4;
        G.tv.forEach(function(k2){
          var parts=k2.split(",");var tx=parseInt(parts[0]),ty=parseInt(parts[1]);
          var dx3=tx-G.px,dy3=ty-G.py;
          if(Math.abs(dx3)<mapR&&Math.abs(dy3)<mapR){
            var tile2=world.tile(tx,ty);
            ctx.fillStyle=tile2===8?"#2a4a7a":tile2===3?"#444":tile2===7?"#6a5a3a":"#3a5a2a";
            ctx.fillRect(mapX+mapSz/2+dx3*mapSc,mapY+mapSz/2+dy3*mapSc,Math.max(1,mapSc),Math.max(1,mapSc));
          }
        });
        // Player dot
        ctx.globalAlpha=1;ctx.fillStyle="#ffd866";
        ctx.beginPath();ctx.arc(mapX+mapSz/2,mapY+mapSz/2,3,0,Math.PI*2);ctx.fill();
        // Cardinal markers
        ctx.globalAlpha=0.2;ctx.fillStyle="#c8c0b4";ctx.font="7px monospace";ctx.textAlign="center";
        ctx.fillText("N",mapX+mapSz/2,mapY-2);ctx.fillText("S",mapX+mapSz/2,mapY+mapSz+8);
        ctx.textAlign="left";ctx.fillText("O",mapX-8,mapY+mapSz/2+3);
        ctx.textAlign="right";ctx.fillText("E",mapX+mapSz+8,mapY+mapSz/2+3);
        ctx.globalAlpha=1;
        // Back
        ctx.globalAlpha=0.5;ctx.fillStyle="rgba(200,190,160,0.08)";ctx.fillRect(mX+12,mY+mH-44,mW-24,32);
        ctx.fillStyle="#c8c0b4";ctx.font="10px monospace";ctx.textAlign="center";ctx.fillText("← Retour",sw/2,mY+mH-24);
        G._menuRects.push({x:mX+12,y:mY+mH-44,w:mW-24,h:32,act:"main"});
        ctx.globalAlpha=1;
      }else if(G.menuPage==="skills"){
        ctx.fillText("COMPÉTENCES",sw/2,mY+24);
        ctx.globalAlpha=0.6;ctx.font="9px monospace";ctx.textAlign="left";
        var sky=mY+42;
        if(G.skills.length===0){ctx.fillStyle="#666";ctx.fillText("Aucune compétence encore.",mX+14,sky)}
        for(var ski=0;ski<G.skills.length;ski++){
          ctx.fillStyle="#c8c0b4";ctx.fillText("· "+G.skills[ski],mX+14,sky);sky+=14;
        }
        // Gauges
        if(Object.keys(G.gauges).length>0){
          sky+=12;ctx.fillStyle="#ffd866";ctx.font="9px monospace";ctx.fillText("JAUGES:",mX+14,sky);sky+=14;
          for(var gk4 in G.gauges){
            var gv=G.gauges[gk4];
            ctx.fillStyle="#888";ctx.font="8px monospace";ctx.fillText(gk4,mX+14,sky);
            // Bar
            ctx.fillStyle="rgba(200,190,160,0.1)";ctx.fillRect(mX+80,sky-7,mW-104,8);
            var pct=Math.max(0,gv.val/gv.max);
            ctx.fillStyle=pct>0.5?"rgba(100,180,100,0.4)":pct>0.2?"rgba(200,180,60,0.4)":"rgba(200,60,60,0.5)";
            ctx.fillRect(mX+80,sky-7,(mW-104)*pct,8);
            ctx.fillStyle="#aaa";ctx.fillText((gv.val|0)+"/"+gv.max,mX+mW-40,sky);
            sky+=14;
          }
        }
        ctx.globalAlpha=1;
        // Back
        ctx.globalAlpha=0.5;ctx.fillStyle="rgba(200,190,160,0.08)";ctx.fillRect(mX+12,mY+mH-44,mW-24,32);
        ctx.fillStyle="#c8c0b4";ctx.font="10px monospace";ctx.textAlign="center";ctx.fillText("← Retour",sw/2,mY+mH-24);
        G._menuRects.push({x:mX+12,y:mY+mH-44,w:mW-24,h:32,act:"main"});
        ctx.globalAlpha=1;
      }else if(G.menuPage==="settings"){
        ctx.fillText("RÉGLAGES",sw/2,mY+24);
        ctx.globalAlpha=0.6;ctx.font="9px monospace";ctx.textAlign="left";
        var sty=mY+50;
        // Volume master
        ctx.fillStyle="#c8c0b4";ctx.fillText("Volume",mX+14,sty);
        ctx.fillStyle="rgba(200,190,160,0.1)";ctx.fillRect(mX+80,sty-8,mW-104,14);
        ctx.fillStyle="rgba(255,216,102,0.3)";ctx.fillRect(mX+80,sty-8,(mW-104)*G.volMaster,14);
        G._menuRects.push({x:mX+80,y:sty-8,w:mW-104,h:14,act:"vol_master"});
        sty+=30;
        // Volume SFX
        ctx.fillStyle="#c8c0b4";ctx.fillText("Effets",mX+14,sty);
        ctx.fillStyle="rgba(200,190,160,0.1)";ctx.fillRect(mX+80,sty-8,mW-104,14);
        ctx.fillStyle="rgba(255,216,102,0.3)";ctx.fillRect(mX+80,sty-8,(mW-104)*G.volSfx,14);
        G._menuRects.push({x:mX+80,y:sty-8,w:mW-104,h:14,act:"vol_sfx"});
        sty+=40;
        // Mortal status
        ctx.fillStyle="#888";ctx.fillText("Mortalité: "+(G.mortal?"oui":"non"),mX+14,sty);
        sty+=20;
        ctx.fillText("Biome: "+(curBio||"ville"),mX+14,sty);sty+=14;
        ctx.fillText("Position: "+(G.px|0)+", "+(G.py|0),mX+14,sty);
        ctx.globalAlpha=1;
        // Back
        ctx.globalAlpha=0.5;ctx.fillStyle="rgba(200,190,160,0.08)";ctx.fillRect(mX+12,mY+mH-44,mW-24,32);
        ctx.fillStyle="#c8c0b4";ctx.font="10px monospace";ctx.textAlign="center";ctx.fillText("← Retour",sw/2,mY+mH-24);
        G._menuRects.push({x:mX+12,y:mY+mH-44,w:mW-24,h:32,act:"main"});
        ctx.globalAlpha=1;

      }else if(G.menuPage==="credits"){
        ctx.fillText("CRÉDITS",sw/2,mY+24);
        ctx.globalAlpha=0.5;ctx.font="9px monospace";ctx.textAlign="center";
        var cy2=mY+50;
        var creds=[
          "TABULA RASA","","Concept & Direction","Phil","","Engine & Director","Claude (Anthropic)","",
          "Spritesheets (CC0)","Kenney.nl","  cityTiles, landscapeTiles","  voxelTiles, roadsTiles",
          "  cityDetails, furniture","  dungeon","","Audio","Génération procédurale","87 fichiers WAV 8-bit",
          "","Philosophie","Schopenhauer","'L\'homme peut faire","ce qu\'il veut, mais il","ne peut pas vouloir","ce qu\'il veut.'",
          "","github.com/Narciss666","Tabula_rasa"
        ];
        for(var ci6=0;ci6<creds.length&&cy2<mY+mH-50;ci6++){
          ctx.fillStyle=ci6===0?"#ffd866":creds[ci6]===""?"#000":ci6%2===0?"#aaa":"#888";
          ctx.font=ci6===0?"11px monospace":"8px monospace";
          ctx.fillText(creds[ci6],sw/2,cy2);cy2+=ci6===0?16:creds[ci6]===""?8:12;
        }
        ctx.globalAlpha=1;
        ctx.globalAlpha=0.5;ctx.fillStyle="rgba(200,190,160,0.08)";ctx.fillRect(mX+12,mY+mH-44,mW-24,32);
        ctx.fillStyle="#c8c0b4";ctx.font="10px monospace";ctx.textAlign="center";ctx.fillText("← Retour",sw/2,mY+mH-24);
        G._menuRects.push({x:mX+12,y:mY+mH-44,w:mW-24,h:32,act:"main"});
        ctx.globalAlpha=1;
      }
    }

    // District name — fades in/out when changing area
    if(G.distShowT>0){
      var distAge=G.time-G.distShowT;
      if(distAge<5){
        var da=distAge<1?distAge:distAge>4?5-distAge:1;
        ctx.globalAlpha=da*.25;ctx.fillStyle="#c8c0b4";ctx.font="10px 'Courier New',monospace";
        ctx.textAlign="center";ctx.letterSpacing="4px";
        ctx.fillText(G.lastDist,sw/2,sh*.18);
        ctx.globalAlpha=1;
      }
    }

    // Interact button
    var bx=sw-50,by=sh-55;
    if(!G.intr){var hasN=!!G.nearPoi;var pulse=hasN?0.55+Math.sin(G.time*3)*.18:.12;
      ctx.globalAlpha=pulse*.5;ctx.fillStyle=hasN?"#ffd866":"#555";ctx.beginPath();ctx.arc(bx,by,hasN?26:22,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=hasN?0.55:.2;ctx.strokeStyle=hasN?"#ffcc44":"#666";ctx.lineWidth=2;ctx.beginPath();ctx.arc(bx,by,hasN?26:22,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=hasN?0.85:.35;ctx.fillStyle=hasN?"#1a1a24":"#999";ctx.font="bold "+(hasN?18:16)+"px monospace";ctx.textAlign="center";
      ctx.fillText(hasN?"?":"·",bx,by+6);
      if(hasN){ctx.globalAlpha=.35;ctx.fillStyle="#ffd866";ctx.font="8px monospace";ctx.fillText("toucher",bx,by+38)}ctx.globalAlpha=1;
      // Show what's nearby
      if(hasN&&G.nearPoi){
        var desc=G.nearPoi.tp==="npc"?(G.npcs.find(function(n){return n.id===G.nearPoi.id})||{}).desc:
          G.nearPoi.tp==="door"?"porte":G.nearPoi.tp==="bench"?"banc":G.nearPoi.tp==="well"?"puits":G.nearPoi.tp==="ruin"?"ruines":G.nearPoi.tp==="clearing"?"clairière":G.nearPoi.tp==="resource"?G.nearPoi.desc:G.nearPoi.tp==="animal"?G.nearPoi.desc:G.nearPoi.tp==="fire"?"feu":
          G.nearPoi.tp==="object"?(G.objs.find(function(o){return o.id===G.nearPoi.id})||{}).desc:null;
        if(desc){ctx.globalAlpha=.25;ctx.fillStyle="#c8c0b4";ctx.font="8px 'Courier New',monospace";ctx.textAlign="center";
          var maxW=sw*.4;var txt=desc;if(ctx.measureText(txt).width>maxW)txt=txt.substring(0,20)+"…";
          ctx.fillText(txt,sw/2,sh-20);ctx.globalAlpha=1}
      }
    }else{ctx.globalAlpha=.4;ctx.fillStyle="#aaa";ctx.beginPath();ctx.arc(bx,by,22,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=.8;ctx.fillStyle="#1a1a24";ctx.font="bold 16px monospace";ctx.textAlign="center";ctx.fillText("↓",bx,by+6);ctx.globalAlpha=1}

    // Busy indicator
    if(G.busy){ctx.globalAlpha=.2;ctx.fillStyle="#888";ctx.font="13px monospace";ctx.textAlign="center";
      ctx.fillText("·".repeat(1+(G.time*2|0)%4),sw/2,G.intr?sh/2+55:sh-95);ctx.globalAlpha=1}

    // Narrative bar
    if(G.narr){var n=G.narr,el=G.time-n.st;
      if(!n.done){n.ci=Math.min(n.text.length,(el*18)|0);if(n.ci>=n.text.length){n.done=true;n.fs=G.time}}// slightly faster typewriter
      var a=1;if(n.done){var s=G.time-n.fs;if(s>8)a=Math.max(0,1-(s-8)/3);if(a<=0)G.narr=null}
      if(a>0&&G.narr){var barH=Math.min(58,sh*.1),barY=G.intr?sh*.68:sh-barH-90;
        // Black bar with subtle top edge
        ctx.globalAlpha=a*.75;ctx.fillStyle="#000";ctx.fillRect(0,barY-4,sw,barH+12);
        ctx.globalAlpha=a*.08;ctx.fillStyle="#ffd866";ctx.fillRect(0,barY-5,sw,1);// golden edge line
        ctx.globalAlpha=a*.9;ctx.fillStyle="#d0ccc4";ctx.font="13px 'Courier New',monospace";ctx.textAlign="left";
        var mxW=sw-34,disp=G.narr.text.substring(0,G.narr.ci),words=disp.split(" ");var line="",ly=barY+12;
        for(var w of words){var t2=line+w+" ";if(ctx.measureText(t2).width>mxW){ctx.fillText(line,16,ly);ly+=17;line=w+" "}else line=t2}
        ctx.fillText(line,16,ly);
        if(!G.narr.done&&Math.sin(G.time*6)>0){ctx.fillStyle="#ffd866";ctx.fillRect(16+ctx.measureText(line).width+2,ly-10,1.5,12)}
        if(G.narr.done){ctx.globalAlpha=a*.15;ctx.font="8px monospace";ctx.textAlign="right";ctx.fillText("tap",sw-16,barY+barH)}ctx.globalAlpha=1}}

    // ═══ CHOICE UI — Director proposes options ═══
    if(G.choices&&G.choices.length>=2&&(!G.narr||G.narr.done)){
      var nc=G.choices.length;
      var cbH=34,cbW=Math.min(sw*.42,160),cbGap=6;
      var totalH=nc*(cbH+cbGap);
      var cbY=sh-totalH-110;// above narrative bar area
      var cbX=sw/2;
      G._choiceRects=[];// store for touch detection
      for(var ci=0;ci<nc;ci++){
        var cy2=cbY+ci*(cbH+cbGap);
        var fadeIn=Math.min(1,(G.time-(G.choiceT||0)-ci*0.15)*2);
        if(fadeIn<=0)continue;
        // Button background
        ctx.globalAlpha=fadeIn*0.65;
        ctx.fillStyle="rgba(12,12,20,0.85)";
        var rx2=cbX-cbW/2,ry2=cy2;
        ctx.fillRect(rx2,ry2,cbW,cbH);
        // Border
        ctx.strokeStyle="rgba(200,190,160,0.3)";ctx.lineWidth=1;
        ctx.strokeRect(rx2,ry2,cbW,cbH);
        // Number
        ctx.globalAlpha=fadeIn*0.3;ctx.fillStyle="#ffd866";ctx.font="bold 11px monospace";ctx.textAlign="left";
        ctx.fillText((ci+1)+".",rx2+8,cy2+cbH/2+4);
        // Text
        ctx.globalAlpha=fadeIn*0.8;ctx.fillStyle="#d0ccc4";ctx.font="11px 'Courier New',monospace";ctx.textAlign="left";
        var ctxt=G.choices[ci];
        if(ctx.measureText(ctxt).width>cbW-30)ctxt=ctxt.substring(0,18)+"…";
        ctx.fillText(ctxt,rx2+24,cy2+cbH/2+4);
        ctx.globalAlpha=1;
        // Store rect for touch detection
        G._choiceRects.push({x:rx2,y:ry2,w:cbW,h:cbH,idx:ci});
      }
    }

    // Save indicator
    if(G.time-saving<1.5){ctx.globalAlpha=(1-(G.time-saving)/1.5)*.18;ctx.fillStyle="#888";ctx.font="7px monospace";ctx.textAlign="right";ctx.fillText("✓",sw-8,sh-4);ctx.globalAlpha=1}

    // Fade in
    if(G.fadeIn<1){ctx.fillStyle="rgba(0,0,0,"+(1-G.fadeIn)+")";ctx.fillRect(0,0,sw,sh)}
    if(!G.intr)joy.draw(ctx);

    // Auto-save
    savT+=dt*.016;if(savT>90){savT=0;saving=G.time;save(G)}
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
