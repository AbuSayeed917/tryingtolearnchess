import {Chess} from './chess.js';
import {applyUci,uciMove} from './engine.js';
// Extend a teaching line with fresh searches; this is not a depth-40 search.
export async function extendContinuation(fen,seed,analyze,{turns=40,cancelled=()=>false,onProgress=()=>{}}={}){
 const game=new Chess(fen),moves=[];let pending=seed.map(m=>m.uci||uciMove(m));
 while(moves.length<turns&&!game.isGameOver()){
  if(cancelled())return null;
  if(!pending.length){const result=await analyze(game.fen(),{time:900,multipv:1,depth:18});if(cancelled())return null;pending=result.lines[0]?.pv?.slice()||[];if(!pending.length)throw new Error('The engine could not extend this line. Try another branch.');}
  const raw=pending.shift(),m=applyUci(game,raw);moves.push({from:m.from,to:m.to,piece:m.piece,captured:m.captured,san:m.san,after:game.fen(),uci:raw});onProgress(moves.length);
 }
 return {moves,terminal:game.isGameOver()};
}
