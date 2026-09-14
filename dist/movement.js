import {Chess} from './chess.js';
export const pieceNames={p:'pawn',n:'knight',b:'bishop',r:'rook',q:'queen',k:'king'};
const xy=s=>[s.charCodeAt(0)-97,+s[1]-1], square=(x,y)=>String.fromCharCode(97+x)+(y+1);
export function mapMovement({fen,from,type='n',color='w',open=false}){
 const source=open?null:new Chess(fen),piece=open?{type,color}:source.get(from);if(!piece)throw new Error('Choose a piece on the board.');
 const actualTurn=source?.turn();let hypothetical=false,g=source;
 if(!open&&piece.color!==actualTurn){let fields=fen.split(' ');fields[1]=piece.color;fields[3]='-';g=new Chess(fields.join(' '));hypothetical=true;}
 const legal=open?[]:g.moves({square:from,verbose:true}).filter(m=>m.captured!=='k'),[fx,fy]=xy(from),dir=piece.color==='w'?1:-1;
 const cells=[];
 for(let y=7;y>=0;y--)for(let x=0;x<8;x++){
 const to=square(x,y),dx=x-fx,dy=y-fy,ax=Math.abs(dx),ay=Math.abs(dy),occupant=open?null:g.get(to);
 let cell={to,status:'pattern',reason:'',attacks:false,moves:legal.filter(m=>m.to===to),path:[]};
 if(to===from){cells.push({...cell,status:'origin',reason:`The ${pieceNames[piece.type]} starts here.`});continue;}
 if(open&&piece.type==='p'&&(fy===0||fy===7)){cell.reason='A pawn cannot remain on the first or eighth rank. Choose a starting square on ranks 2–7; reaching the far edge requires promotion.';cells.push(cell);continue;}
 if(cell.moves.length){cell.status=cell.moves.some(m=>m.captured)?'capture':'legal';cell.reason=cell.status==='capture'?`Legal capture of the ${pieceNames[cell.moves[0].captured]}.`:'A legal move in this position.';if(cell.moves[0].flags.includes('e'))cell.reason='En passant: capture the pawn that just advanced two squares beside you.';if(cell.moves[0].promotion)cell.reason='Promotion: choose a queen, rook, bishop, or knight. These are four different legal moves.';if(/[kq]/.test(cell.moves[0].flags))cell.reason='Legal castling: the king and rook move together.';}
 let shape=piece.type==='n'?ax*ay===2:piece.type==='b'?ax===ay:piece.type==='r'?dx===0||dy===0:piece.type==='q'?ax===ay||dx===0||dy===0:piece.type==='k'?Math.max(ax,ay)===1:dx===0&&(dy===dir||(dy===2*dir&&fy===(piece.color==='w'?1:6)))||ax===1&&dy===dir;
 const castle=piece.type==='k'&&from===(piece.color==='w'?'e1':'e8')&&dy===0&&ax===2;
 if(!shape&&!castle){cell.reason={n:'A knight moves two squares in one direction and one sideways.',b:'A bishop stays on a diagonal.',r:'A rook stays on its row or column.',q:'A queen moves along rows, columns, or diagonals.',k:'A king moves one square. Castling is the special two-square move.',p:'A pawn moves forward; it captures one square diagonally. A double step is only available from its starting rank.'}[piece.type];cells.push(cell);continue;}
 if(castle&&!cell.moves.length){cell.status='blocked';if(open)cell.reason='Castling needs a rook, castling rights, a clear path, and safe squares. Try Current position to explore it.';else{let side=dx>0?'k':'q',rights=g.getCastlingRights(piece.color),rook=g.get(square(dx>0?7:0,fy));cell.reason=!rights[side]?'Castling rights are unavailable: the king or this rook has moved, or this position does not allow it.':!rook||rook.type!=='r'||rook.color!==piece.color?'Castling requires your rook in its starting corner.':g.isCheck()?'You cannot castle while in check.':'Castling needs an empty path, and the king cannot cross or land on an attacked square.';}cells.push(cell);continue;}
 let blocker=null;
 if(['r','b','q'].includes(piece.type)||piece.type==='p'&&dx===0){let sx=Math.sign(dx),sy=Math.sign(dy);for(let i=1;i<Math.max(ax,ay);i++){let pass=square(fx+sx*i,fy+sy*i);cell.path.push(pass);if(!blocker&&!open&&g.get(pass))blocker=pass;}}
 cell.attacks=piece.type==='p'?ax===1&&dy===dir:!blocker&&!castle;
 if(cell.moves.length){cells.push(cell);continue;}
 if(occupant?.type==='k'&&occupant.color!==piece.color&&!blocker){cell.status='attack';cell.reason='This piece attacks the opposing king. Chess ends with checkmate; kings are never captured.';cells.push(cell);continue;}
 if(blocker){cell.status='blocked';cell.reason=`The ${pieceNames[g.get(blocker).type]} on ${blocker} blocks the path. This piece cannot jump over it.`;}
 else if(occupant?.color===piece.color){cell.status='blocked';cell.reason=`Your own ${pieceNames[occupant.type]} occupies ${to}. You cannot capture your own piece.${cell.attacks?' This square is defended by the selected piece.':''}`;}
 else if(piece.type==='p'&&dx===0&&occupant){cell.status='blocked';cell.reason='Pawns cannot capture straight ahead. The piece here blocks this move.';}
 else if(piece.type==='p'&&ax===1&&!occupant){cell.status='attack';cell.reason='This pawn attacks this diagonal square, but cannot move here without a capturable piece or an available en passant capture.';}
 else if(open){cell.status='legal';cell.reason=piece.type==='p'&&ay===2?'From its starting rank, a pawn can advance two squares if both squares are clear.':'This destination fits the piece’s movement pattern on an open board.';if(piece.type==='p'&&(y===0||y===7))cell.reason+=' Reaching this rank requires promotion.';}
 else{cell.status='unsafe';cell.reason=piece.type==='k'?'Moving here would put your king under attack. A king cannot move into check.':'This movement fits the piece, but is illegal because your king would remain in check or become exposed to check.';}
 cells.push(cell);
 }
 return {from,piece,cells,hypothetical,actualTurn,fen:open?null:g.fen(),legalMoves:legal};
}
