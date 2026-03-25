// ═══ TABULA RASA — ui.js ═══

export class Joy{
  constructor(){this.on=false;this.cx=0;this.cy=0;this.dx=0;this.dy=0;this.id=null;this.R=48;this.mg=0}
  start(x,y,id){this.on=true;this.cx=x;this.cy=y;this.id=id;this.dx=0;this.dy=0;this.mg=0}
  move(x,y){
    let d=x-this.cx,e=y-this.cy;const l=Math.sqrt(d*d+e*e);
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
