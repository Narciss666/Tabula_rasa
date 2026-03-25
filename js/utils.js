// ═══ TABULA RASA — utils.js ═══
import { TW, TH, CS } from './config.js';

export function rng(s){return()=>{s=(s*16807+13)%2147483647;return s/2147483647}}
export function H(x,y){let h=(x*374761393+y*668265263+1013904223);h=(h^(h>>13))*1274126177;return(h^(h>>16))>>>0}
export function iso(x,y,cx,cy,sw,sh){return{sx:(x-y)*TW+sw/2-cx,sy:(x+y)*TH+sh/2-cy}}
export function lp(a,b,t){return a+(b-a)*t}
export function cl(v,a,b){return v<a?a:v>b?b:v}
export function gDist(gx,gy){const cx=gx/CS,cy=gy/CS;if(cx<.4&&cy<.5)return 0;if(cx>.55)return 1;return 2}
