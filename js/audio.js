// ═══ TABULA RASA — audio.js ═══

export class Aud{
  constructor(){this.ok=false;this.sT=0}
  init(){
    if(this.ok)return;
    try{
      this.ac=new(window.AudioContext||window.webkitAudioContext)();
      this.m=this.ac.createGain();this.m.gain.value=.15;this.m.connect(this.ac.destination);
      const o=this.ac.createOscillator(),g=this.ac.createGain(),f=this.ac.createBiquadFilter();
      o.type="sine";o.frequency.value=72;f.type="lowpass";f.frequency.value=125;g.gain.value=.016;
      o.connect(f);f.connect(g);g.connect(this.m);o.start();this.ok=true;
    }catch(e){}
  }
  step(mv,dt){
    if(!this.ok||!mv)return;this.sT+=dt;
    if(this.sT>.26){this.sT=0;
      const o=this.ac.createOscillator(),g=this.ac.createGain();
      o.type="triangle";o.frequency.value=115+Math.random()*50;
      g.gain.value=.01;g.gain.exponentialRampToValueAtTime(.001,this.ac.currentTime+.05);
      o.connect(g);g.connect(this.m);o.start();o.stop(this.ac.currentTime+.06);
    }
  }
  ping(){
    if(!this.ok)return;
    const o=this.ac.createOscillator(),g=this.ac.createGain();
    o.type="sine";o.frequency.value=420;
    o.frequency.exponentialRampToValueAtTime(210,this.ac.currentTime+.14);
    g.gain.value=.013;g.gain.exponentialRampToValueAtTime(.001,this.ac.currentTime+.16);
    o.connect(g);g.connect(this.m);o.start();o.stop(this.ac.currentTime+.18);
  }
}
