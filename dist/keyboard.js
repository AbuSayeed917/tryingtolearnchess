// Shared keyboard policy: do not steal keys from text fields, browser shortcuts or dialogs.
export function keyboardAction(event,{dialogOpen=false,pending=false,solved=false}={}){
 if(event.defaultPrevented||event.repeat||event.ctrlKey||event.metaKey||event.altKey||dialogOpen)return null;
 const el=event.target,tag=el?.tagName?.toLowerCase();
 if(['input','textarea','select'].includes(tag)||el?.isContentEditable)return null;
 if(event.key==='Escape')return 'cancel';
 if(event.key==='Enter'&&pending)return 'confirm';
 return ({b:'board',h:'hint',u:'undo',m:'map','?':'help',n:solved?'next':null})[event.key.toLowerCase()]||null;
}
export function nextBoardSquare(square,key){
 let x=square.charCodeAt(0)-97,y=Number(square[1]);
 if(key==='ArrowLeft')x--;else if(key==='ArrowRight')x++;else if(key==='ArrowUp')y++;else if(key==='ArrowDown')y--;else return square;
 return x<0||x>7||y<1||y>8?square:String.fromCharCode(97+x)+y;
}
export function parseMoveCommand(Chess,fen,command){
 const copy=new Chess(fen),text=command.trim();if(!text)throw new Error('Type a move such as e2e4 or Nf3.');
 const coordinates=text.toLowerCase().replace(/[\s→-]/g,'').match(/^([a-h][1-8])([a-h][1-8])([qrbn])?$/);
 try{const move=coordinates?copy.move({from:coordinates[1],to:coordinates[2],promotion:coordinates[3]||'q'}):copy.move(text.replace(/0/g,'O'));return move;}catch{throw new Error('That move is not legal here. Use a hint, or try a move such as e2e4 or Nf3.');}
}
