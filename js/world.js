// ═══ TABULA RASA — world.js V21 ═══
// Changes: richer wilderness, bridges, campfires, flower patches, ruin structures
import { CH, CC, CS, DSG, DAW, NB, NL, VC } from './config.js';
import { rng, H, cl, gDist } from './utils.js';

export class World{
  constructor(){this.ch=new Map()}
  k(a,b){return a+","+b}
  isC(a,b){return a>=0&&a<CC&&b>=0&&b<CC}
  tile(wx,wy){
    const c=this.gc(Math.floor(wx/CH),Math.floor(wy/CH));
    const lx=((wx%CH)+CH)%CH,ly=((wy%CH)+CH)%CH;
    return c.t[ly]?c.t[ly][lx]:0;
  }
  gc(cx,cy){const k=this.k(cx,cy);if(this.ch.has(k))return this.ch.get(k);const c=this._g(cx,cy);this.ch.set(k,c);return c}
  vis(px,py){
    const a=Math.floor(px/CH),b=Math.floor(py/CH),o=[];
    for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)o.push(this.gc(a+dx,b+dy));
    return o;
  }
  _g(cx,cy){
    const t=Array.from({length:CH},()=>Array(CH).fill(0)),sd=H(cx,cy),rand=rng(sd),ox=cx*CH,oy=cy*CH;
    const bl=[],lamps=[],poi=[],trees=[],props=[],ambN=[],vehs=[],tLights=[];

    if(this.isC(cx,cy)){
      // ═══ CITY ═══
      for(let ly=0;ly<CH;ly++)for(let lx=0;lx<CH;lx++){
        const gx=ox+lx,gy=oy+ly;
        if(gx%8<2||gy%8<2)t[ly][lx]=1;
        if(Math.abs(gx-CS/2)<2||Math.abs(gy-CS/2)<2)t[ly][lx]=1;
      }
      for(let ly=0;ly<CH;ly++)for(let lx=0;lx<CH;lx++){
        if(t[ly][lx])continue;
        for(const[dy,dx]of[[-1,0],[1,0],[0,-1],[0,1]]){
          const nx=lx+dx,ny=ly+dy;
          if(nx>=0&&nx<CH&&ny>=0&&ny<CH&&t[ny][nx]===1){t[ly][lx]=2;break}
        }
      }
      const cen=CS/2;
      for(let iy=0;iy<CH;iy+=8)for(let ix=0;ix<CH;ix+=8)
        if(t[iy]?.[ix]===1)tLights.push({x:ox+ix+2.3,y:oy+iy+.3,ph:rand()*10});

      // Buildings
      for(let ly=0;ly<CH;ly++)for(let lx=0;lx<CH;lx++){
        if(t[ly][lx]!==0)continue;
        const gx=ox+lx,gy=oy+ly,di=gDist(gx,gy);
        const fpIdx=H(gx,gy)%10;
        const[bw,bd]=[[3,3],[4,3],[3,4],[2,2],[2,3],[3,2],[4,4],[5,3],[3,5],[4,2]][fpIdx];
        if(lx+bw>CH||ly+bd>CH)continue;
        let ok=1;
        for(let dy=0;dy<bd&&ok;dy++)for(let dx=0;dx<bw&&ok;dx++){
          if(t[ly+dy][lx+dx]!==0)ok=0;
          if(dx===0&&lx>0&&t[ly+dy][lx-1]===3)ok=0;
          if(dy===0&&ly>0&&t[ly-1]?.[lx+dx]===3)ok=0;
        }
        if(!ok)continue;
        const dc=Math.sqrt((gx+bw/2-cen)**2+(gy+bd/2-cen)**2)/cen;
        const hM=di===0?1.4:di===1?.85:.7;
        const mH=(dc<.2?440:dc<.4?300:dc<.6?200:dc<.8?130:85)*hM;
        if(rand()<(dc>.6?.22:.1)&&bw>=3&&bd>=3){
          for(let dy=0;dy<bd;dy++)for(let dx=0;dx<bw;dx++){
            t[ly+dy][lx+dx]=4;if(rand()<.18)trees.push({x:gx+dx,y:gy+dy});
          }
          poi.push({tp:"bench",x:gx+bw/2,y:gy+bd/2,id:`b${gx}_${gy}`});
          continue;
        }
        const h=40+rand()*(mH-40);const hsb=h>140&&rand()<.45;
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
        for(let dy=0;dy<bd;dy++)for(let dx=0;dx<bw;dx++)t[ly+dy][lx+dx]=3;
        const ds=[];
        if(ly+bd<CH)for(let dx=0;dx<bw;dx++)
          if(t[ly+bd]?.[lx+dx]<=2&&t[ly+bd][lx+dx]>=1){ds.push({x:gx+dx+.5,y:gy+bd+.3});break}
        if(ly>0)for(let dx=0;dx<bw;dx++)
          if(t[ly-1]?.[lx+dx]<=2){ds.push({x:gx+dx+.5,y:gy-.3});break}
        if(ds.length)poi.push({tp:"door",x:ds[0].x,y:ds[0].y,id:`d${gx}_${gy}`});
      }

      // Props
      for(let ly=0;ly<CH;ly+=2)for(let lx=0;lx<CH;lx+=2){
        const gx=ox+lx,gy=oy+ly;const r2=rng(H(gx,gy)+111);const roll=r2();
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
          let ab=0;for(const[dy,dx]of[[-1,0],[1,0],[0,-1],[0,1]]){
            const ny=ly+dy,nx=lx+dx;if(ny>=0&&ny<CH&&nx>=0&&nx<CH&&t[ny][nx]===3)ab++;}
          if(ab>=2)props.push({tp:"dm",x:gx+.5,y:gy+.5});
        }
      }

      // Lamps
      for(let ly=0;ly<CH;ly+=2)for(let lx=0;lx<CH;lx+=3)
        if(t[ly][lx]===2&&rand()<.06)lamps.push({x:ox+lx+.5,y:oy+ly+.5});
      // Corners
      for(let iy=0;iy<CH;iy+=8)for(let ix=0;ix<CH;ix+=8)
        if(rand()<.3)poi.push({tp:"corner",x:ox+ix+1,y:oy+iy+1,id:`c${ox+ix}_${oy+iy}`});

      // Ambient NPCs
      const npcCount=2+(rand()<.4?1:0);
      for(let i=0;i<npcCount;i++){
        if(rand()>.6)continue;
        let ax=-1,ay=-1;
        for(let j=0;j<10;j++){const lx2=(rand()*CH)|0,ly2=(rand()*CH)|0;
          if(t[ly2]?.[lx2]<=2&&t[ly2][lx2]>=1){ax=ox+lx2;ay=oy+ly2;break}}
        if(ax>=0)ambN.push({
          x:ax+.5,y:ay+.5,bc:NB[(rand()*NB.length)|0],lc:NL[(rand()*NL.length)|0],
          dir:(rand()*4)|0,spd:.004+rand()*.006,ph:rand()*100,
          idle:rand()<.2?"lean":rand()<.35?"sit":"walk"
        });
      }

      // Vehicles
      const vehCount=rand()<.3?2:1;
      for(let v=0;v<vehCount;v++){
        if(rand()>.55)continue;
        let vx=-1,vy=-1;
        for(let j=0;j<10;j++){const lx2=(rand()*CH)|0,ly2=(rand()*CH)|0;
          if(t[ly2]?.[lx2]===1){vx=ox+lx2;vy=oy+ly2;break}}
        if(vx>=0)vehs.push({
          x:vx+.5,y:vy+.5,col:VC[(rand()*VC.length)|0],
          dir:(rand()*4)|0,spd:.008+rand()*.01,pk:rand()<.35
        });
      }

    } else {
      // ═══ WILDERNESS — much richer ═══
      const br=rng(H(cx>>1,cy>>1));
      const bio=br()<.25?"forest":br()<.45?"field":br()<.6?"hills":br()<.8?"river":"swamp";

      // Base terrain
      for(let ly=0;ly<CH;ly++)for(let lx=0;lx<CH;lx++){
        const gx=ox+lx,gy=oy+ly;
        // City edge roads
        if((gx>=0&&gx<2)||(gy>=0&&gy<2)){t[ly][lx]=1;continue}
        // River
        if(bio==="river"||bio==="swamp"){
          const rc=CH/2+Math.sin(ly*.4+cx)*3+(bio==="swamp"?Math.sin(ly*.8)*2:0);
          const width=bio==="swamp"?3.5:2.5;
          if(Math.abs(lx-rc)<width){t[ly][lx]=8;continue}
          if(Math.abs(lx-rc)<width+1){t[ly][lx]=9;continue}// riverbank
        }
        t[ly][lx]=4;
      }

      // ── BRIDGE over river ──
      if((bio==="river"||bio==="swamp")&&rand()<.4){
        const bridgeY=(CH/2+(rand()*6-3))|0;
        for(let lx=0;lx<CH;lx++){
          if(t[bridgeY]?.[lx]===8||t[bridgeY]?.[lx]===9){
            t[bridgeY][lx]=10;// bridge tile
            if(bridgeY+1<CH&&(t[bridgeY+1][lx]===8||t[bridgeY+1][lx]===9))t[bridgeY+1][lx]=10;
          }
        }
      }

      // Dirt path
      const ps=rng(sd+555);
      let ppx=ps()<.5?0:CH-1,ppy=(ps()*CH)|0;
      const tx2=ps()<.5?CH-1:0,ty2=(ps()*CH)|0;
      for(let step=0;step<30;step++){
        if(ppx>=0&&ppx<CH&&ppy>=0&&ppy<CH&&t[ppy][ppx]!==8&&t[ppy][ppx]!==10)t[ppy][ppx]=7;
        const ddx=tx2-ppx,ddy=ty2-ppy;
        if(Math.abs(ddx)+Math.abs(ddy)<2)break;
        if(ps()<.6)ppx+=ddx>0?1:-1;else ppy+=ddy>0?1:-1;
        ppx=cl(ppx,0,CH-1);ppy=cl(ppy,0,CH-1);
      }

      // Trees (density per biome)
      const dn=bio==="forest"?.22:bio==="swamp"?.15:bio==="hills"?.08:bio==="field"?.03:.06;
      for(let ly=0;ly<CH;ly++)for(let lx=0;lx<CH;lx++)
        if(t[ly][lx]===4&&rand()<dn)trees.push({x:ox+lx,y:oy+ly});

      // ── WILDERNESS PROPS ──
      for(let ly=0;ly<CH;ly+=3)for(let lx=0;lx<CH;lx+=3){
        if(t[ly]?.[lx]!==4&&t[ly]?.[lx]!==7)continue;
        const gx=ox+lx,gy=oy+ly;const r2=rng(H(gx,gy)+222);const roll=r2();
        // Rocks
        if(bio==="hills"&&roll<.08)props.push({tp:"rock",x:gx+r2(),y:gy+r2()});
        // Flowers in fields
        if(bio==="field"&&roll<.1)props.push({tp:"flower",x:gx+r2(),y:gy+r2()});
        // Mushrooms in forest
        if(bio==="forest"&&roll<.04)props.push({tp:"mush",x:gx+r2()*.5+.25,y:gy+r2()*.5+.25});
        // Swamp reeds
        if(bio==="swamp"&&roll<.06&&t[ly][lx]===4)props.push({tp:"reed",x:gx+r2(),y:gy+r2()});
      }

      // ── RUINS (structured) ──
      if(rand()<.12){
        const rx=(3+rand()*8)|0,ry=(3+rand()*8)|0;
        const rw=2+(rand()*2)|0,rd=2+(rand()*2)|0;
        // Place stone walls (partial — some gaps)
        for(let dy=0;dy<rd;dy++)for(let dx=0;dx<rw;dx++){
          const lx2=rx+dx,ly2=ry+dy;
          if(lx2>=CH||ly2>=CH)continue;
          if((dy===0||dy===rd-1||dx===0||dx===rw-1)&&rand()<.7){
            if(t[ly2][lx2]===4)props.push({tp:"wall",x:ox+lx2+.5,y:oy+ly2+.5});
          }
        }
        poi.push({tp:"ruin",x:ox+rx+rw/2,y:oy+ry+rd/2,id:`ru${cx}_${cy}`});
      }

      // ── CAMPFIRE remains ──
      if(rand()<.1){
        const cfx=4+rand()*8,cfy=4+rand()*8;
        props.push({tp:"campfire",x:ox+cfx,y:oy+cfy});
        poi.push({tp:"clearing",x:ox+cfx,y:oy+cfy,id:`cf${cx}_${cy}`});
      }

      // Clearings
      if(rand()<.15&&!poi.some(p=>p.tp==="clearing"))
        poi.push({tp:"clearing",x:ox+7+rand()*3,y:oy+7+rand()*3,id:`cl${cx}_${cy}`});
    }
    return{t,bl,lamps,poi,trees,props,ambN,vehs,tLights,cx,cy};
  }
}
