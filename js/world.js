// ═══ TABULA RASA — world.js ═══
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
      // ── ROADS ──
      for(let ly=0;ly<CH;ly++)for(let lx=0;lx<CH;lx++){
        const gx=ox+lx,gy=oy+ly;
        if(gx%8<2||gy%8<2)t[ly][lx]=1;
        if(Math.abs(gx-CS/2)<2||Math.abs(gy-CS/2)<2)t[ly][lx]=1;
      }
      // ── SIDEWALKS ──
      for(let ly=0;ly<CH;ly++)for(let lx=0;lx<CH;lx++){
        if(t[ly][lx])continue;
        for(const[dy,dx]of[[-1,0],[1,0],[0,-1],[0,1]]){
          const nx=lx+dx,ny=ly+dy;
          if(nx>=0&&nx<CH&&ny>=0&&ny<CH&&t[ny][nx]===1){t[ly][lx]=2;break}
        }
      }
      const cen=CS/2;

      // ── TRAFFIC LIGHTS ──
      for(let iy=0;iy<CH;iy+=8)for(let ix=0;ix<CH;ix+=8)
        if(t[iy]?.[ix]===1)tLights.push({x:ox+ix+2.3,y:oy+iy+.3,ph:rand()*10});

      // ── BUILDINGS ──
      for(let ly=0;ly<CH;ly++)for(let lx=0;lx<CH;lx++){
        if(t[ly][lx]!==0)continue;
        const gx=ox+lx,gy=oy+ly,di=gDist(gx,gy);
        const[bw,bd]=[[3,3],[4,3],[3,4],[2,2],[2,3],[3,2]][H(gx,gy)%6];
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

        // Parks
        if(rand()<(dc>.6?.2:.08)&&bw>=3){
          for(let dy=0;dy<bd;dy++)for(let dx=0;dx<bw;dx++){
            t[ly+dy][lx+dx]=4;if(rand()<.2)trees.push({x:gx+dx,y:gy+dy});
          }
          poi.push({tp:"bench",x:gx+bw/2,y:gy+bd/2,id:`b${gx}_${gy}`});
          continue;
        }

        const h=40+rand()*(mH-40);
        const hsb=h>140&&rand()<.45;
        bl.push({
          x:gx,y:gy,w:bw,d:bd,h,di,
          pi:(rand()*2)|0,sd:(rand()*9999)|0,
          wst:di===0?0:di===1?2:1,
          sign:rand()<.18?DSG[di][(rand()*DSG[di].length)|0]:null,
          ac:rand()<.3&&h>80, tk:rand()<.12&&h>130,
          aw:rand()<.35, awc:DAW[(rand()*4)|0],
          hsb, sbh:hsb?h*.55+rand()*h*.2:0,
          sf:rand()<.5&&h>60,
          re:rand()<.4,
          rc:di===0?[70,75,90]:di===1?[85,70,55]:[80,70,60]
        });
        for(let dy=0;dy<bd;dy++)for(let dx=0;dx<bw;dx++)t[ly+dy][lx+dx]=3;

        // Doors
        const ds=[];
        if(ly+bd<CH)for(let dx=0;dx<bw;dx++)
          if(t[ly+bd]?.[lx+dx]<=2&&t[ly+bd][lx+dx]>=1){ds.push({x:gx+dx+.5,y:gy+bd+.3});break}
        if(ly>0)for(let dx=0;dx<bw;dx++)
          if(t[ly-1]?.[lx+dx]<=2){ds.push({x:gx+dx+.5,y:gy-.3});break}
        if(ds.length)poi.push({tp:"door",x:ds[0].x,y:ds[0].y,id:`d${gx}_${gy}`});
      }

      // ── PROPS ──
      for(let ly=0;ly<CH;ly+=2)for(let lx=0;lx<CH;lx+=2){
        const gx=ox+lx,gy=oy+ly;const r2=rng(H(gx,gy)+111);const roll=r2();
        if(t[ly][lx]===2){
          if(roll<.04)props.push({tp:"tc",x:gx+.5,y:gy+.5});
          else if(roll<.06)props.push({tp:"hy",x:gx+.3,y:gy+.5});
          else if(roll<.1)props.push({tp:"tr",x:gx+r2()*.5+.25,y:gy+r2()*.5+.25});
        }
        if(t[ly][lx]===1&&roll<.03)props.push({tp:"pu",x:gx+.5,y:gy+.5});
        // Dumpsters in alleys
        if(t[ly][lx]===0&&roll<.015){
          let ab=0;
          for(const[dy,dx]of[[-1,0],[1,0],[0,-1],[0,1]]){
            const ny=ly+dy,nx=lx+dx;
            if(ny>=0&&ny<CH&&nx>=0&&nx<CH&&t[ny][nx]===3)ab++;
          }
          if(ab>=2)props.push({tp:"dm",x:gx+.5,y:gy+.5});
        }
      }

      // ── LAMPS ──
      for(let ly=0;ly<CH;ly+=3)for(let lx=0;lx<CH;lx+=3)
        if(t[ly][lx]===2&&rand()<.07)lamps.push({x:ox+lx+.5,y:oy+ly+.5});

      // ── CORNERS ──
      for(let iy=0;iy<CH;iy+=8)for(let ix=0;ix<CH;ix+=8)
        if(rand()<.3)poi.push({tp:"corner",x:ox+ix+1,y:oy+iy+1,id:`c${ox+ix}_${oy+iy}`});

      // ── AMBIENT NPCs ──
      for(let i=0;i<2;i++){
        if(rand()>.5)continue;
        let ax=-1,ay=-1;
        for(let j=0;j<10;j++){
          const lx2=(rand()*CH)|0,ly2=(rand()*CH)|0;
          if(t[ly2]?.[lx2]<=2&&t[ly2][lx2]>=1){ax=ox+lx2;ay=oy+ly2;break}
        }
        if(ax>=0)ambN.push({
          x:ax+.5,y:ay+.5,
          bc:NB[(rand()*NB.length)|0], lc:NL[(rand()*NL.length)|0],
          dir:(rand()*4)|0, spd:.005+rand()*.005,
          ph:rand()*100,
          idle:rand()<.25?"lean":rand()<.4?"sit":"walk"
        });
      }

      // ── VEHICLE ──
      if(rand()<.6){
        let vx=-1,vy=-1;
        for(let j=0;j<10;j++){
          const lx2=(rand()*CH)|0,ly2=(rand()*CH)|0;
          if(t[ly2]?.[lx2]===1){vx=ox+lx2;vy=oy+ly2;break}
        }
        if(vx>=0)vehs.push({
          x:vx+.5,y:vy+.5,col:VC[(rand()*VC.length)|0],
          dir:(rand()*4)|0,spd:.01+rand()*.008,pk:rand()<.4
        });
      }

    } else {
      // ═══ WILDERNESS ═══
      const br=rng(H(cx>>1,cy>>1));
      const bio=br()<.3?"forest":br()<.55?"field":br()<.75?"hills":"river";
      for(let ly=0;ly<CH;ly++)for(let lx=0;lx<CH;lx++){
        const gx=ox+lx,gy=oy+ly;
        if((gx>=0&&gx<2)||(gy>=0&&gy<2)){t[ly][lx]=1;continue}
        if(bio==="river"){
          const rc=CH/2+Math.sin(ly*.4+cx)*3;
          if(Math.abs(lx-rc)<2.5){t[ly][lx]=8;continue}
          if(Math.abs(lx-rc)<3.5){t[ly][lx]=9;continue}
        }
        t[ly][lx]=4;
      }
      // Dirt path
      const ps=rng(sd+555);
      let ppx=ps()<.5?0:CH-1,ppy=(ps()*CH)|0;
      const tx2=ps()<.5?CH-1:0,ty2=(ps()*CH)|0;
      for(let step=0;step<30;step++){
        if(ppx>=0&&ppx<CH&&ppy>=0&&ppy<CH&&t[ppy][ppx]!==8)t[ppy][ppx]=7;
        const ddx=tx2-ppx,ddy=ty2-ppy;
        if(Math.abs(ddx)+Math.abs(ddy)<2)break;
        if(ps()<.6)ppx+=ddx>0?1:-1;else ppy+=ddy>0?1:-1;
        ppx=cl(ppx,0,CH-1);ppy=cl(ppy,0,CH-1);
      }
      const dn=bio==="forest"?.2:bio==="river"?.08:bio==="field"?.04:.07;
      for(let ly=0;ly<CH;ly++)for(let lx=0;lx<CH;lx++)
        if(t[ly][lx]===4&&rand()<dn)trees.push({x:ox+lx,y:oy+ly});
      if(rand()<.15)poi.push({tp:"clearing",x:ox+7+rand()*3,y:oy+7+rand()*3,id:`cl${cx}_${cy}`});
      if(rand()<.08)poi.push({tp:"ruin",x:ox+4+rand()*8,y:oy+4+rand()*8,id:`ru${cx}_${cy}`});
    }
    return{t,bl,lamps,poi,trees,props,ambN,vehs,tLights,cx,cy};
  }
}
