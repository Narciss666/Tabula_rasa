// ═══ TABULA RASA — audio.js V19 ═══
// Added: ambient city sounds, wind, district-aware ambience

export class Aud{
  constructor(){this.ok=false;this.sT=0;this.ambT=0;this.lastAmb=""}
  init(){
    if(this.ok)return;
    try{
      this.ac=new(window.AudioContext||window.webkitAudioContext)();
      this.m=this.ac.createGain();this.m.gain.value=.15;this.m.connect(this.ac.destination);
      // Base drone
      const o=this.ac.createOscillator(),g=this.ac.createGain(),f=this.ac.createBiquadFilter();
      o.type="sine";o.frequency.value=72;f.type="lowpass";f.frequency.value=125;g.gain.value=.016;
      o.connect(f);f.connect(g);g.connect(this.m);o.start();
      this.drone={o,g};
      // Low rumble for city depth
      const o2=this.ac.createOscillator(),g2=this.ac.createGain();
      o2.type="sawtooth";o2.frequency.value=38;g2.gain.value=.004;
      const f2=this.ac.createBiquadFilter();f2.type="lowpass";f2.frequency.value=60;
      o2.connect(f2);f2.connect(g2);g2.connect(this.m);o2.start();
      this.ok=true;
    }catch(e){}
  }

  // Footsteps
  step(mv,dt){
    if(!this.ok||!mv)return;this.sT+=dt;
    if(this.sT>.26){this.sT=0;
      const o=this.ac.createOscillator(),g=this.ac.createGain();
      o.type="triangle";o.frequency.value=115+Math.random()*50;
      g.gain.value=.01;g.gain.exponentialRampToValueAtTime(.001,this.ac.currentTime+.05);
      o.connect(g);g.connect(this.m);o.start();o.stop(this.ac.currentTime+.06);
    }
  }

  // Interaction ping
  ping(){
    if(!this.ok)return;
    const o=this.ac.createOscillator(),g=this.ac.createGain();
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
    const interval=6+Math.random()*14;
    if(this.ambT<interval)return;
    this.ambT=0;

    const t=this.ac.currentTime;
    const type=inCity?(Math.random()*6)|0:((Math.random()*3)|0)+10;

    if(type===0){// Distant car honk
      const o=this.ac.createOscillator(),g=this.ac.createGain();
      o.type="square";o.frequency.value=320+Math.random()*120;
      g.gain.value=.003;g.gain.linearRampToValueAtTime(0,t+.25);
      o.connect(g);g.connect(this.m);o.start();o.stop(t+.28);
    }
    else if(type===1){// Distant siren (two-tone)
      const o=this.ac.createOscillator(),g=this.ac.createGain();
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
      const o=this.ac.createOscillator(),g=this.ac.createGain();
      o.type="sawtooth";o.frequency.value=140+Math.random()*60;
      g.gain.value=.006;g.gain.exponentialRampToValueAtTime(.0001,t+.06);
      o.connect(g);g.connect(this.m);o.start();o.stop(t+.08);
    }
    else if(type===3){// Dog bark (short burst)
      const o=this.ac.createOscillator(),g=this.ac.createGain();
      o.type="square";
      o.frequency.setValueAtTime(280,t);o.frequency.linearRampToValueAtTime(350,t+.04);
      g.gain.value=.003;g.gain.exponentialRampToValueAtTime(.0001,t+.05);
      o.connect(g);g.connect(this.m);o.start();o.stop(t+.06);
      // Second bark
      const o2=this.ac.createOscillator(),g2=this.ac.createGain();
      o2.type="square";o2.frequency.value=300;
      g2.gain.value=.002;g2.gain.exponentialRampToValueAtTime(.0001,t+.18);
      o2.connect(g2);g2.connect(this.m);o2.start(t+.12);o2.stop(t+.2);
    }
    else if(type===4){// Metal clang (industrial)
      const o=this.ac.createOscillator(),g=this.ac.createGain();
      o.type="triangle";o.frequency.value=800+Math.random()*400;
      g.gain.value=.004;g.gain.exponentialRampToValueAtTime(.0001,t+.1);
      o.connect(g);g.connect(this.m);o.start();o.stop(t+.12);
    }
    else if(type===5){// Muffled bass (music from a building)
      const o=this.ac.createOscillator(),g=this.ac.createGain(),f=this.ac.createBiquadFilter();
      o.type="sawtooth";o.frequency.value=55+Math.random()*20;
      f.type="lowpass";f.frequency.value=100;
      g.gain.value=.004;g.gain.linearRampToValueAtTime(0,t+1.5);
      o.connect(f);f.connect(g);g.connect(this.m);o.start();o.stop(t+1.6);
    }
    else if(type>=10){// Wilderness: wind gust
      const bufLen=this.ac.sampleRate;
      const buf=this.ac.createBuffer(1,bufLen,this.ac.sampleRate);
      const d=buf.getChannelData(0);
      let v=0;for(let i=0;i<bufLen;i++){v+=(Math.random()*2-1-v)*.01;d[i]=v}
      const s=this.ac.createBufferSource();s.buffer=buf;
      const g=this.ac.createGain(),f=this.ac.createBiquadFilter();
      f.type="bandpass";f.frequency.value=300+Math.random()*200;f.Q.value=.3;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.004,t+.5);
      g.gain.linearRampToValueAtTime(0,t+2);
      s.connect(f);f.connect(g);g.connect(this.m);s.start();s.stop(t+2.1);
    }
  }

  // Mood shift — subtly changes drone frequency
  setMood(mood,inCity){
    if(!this.ok)return;
    const t=this.ac.currentTime;
    const freq=mood==="darker"?55:mood==="warmer"?85:72;
    this.drone.o.frequency.linearRampToValueAtTime(freq,t+3);
    this.drone.g.gain.linearRampToValueAtTime(inCity?.018:.008,t+2);
  }
}
