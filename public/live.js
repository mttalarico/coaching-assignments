import {makeInvite} from './invite.js';
import {validate} from './model.js';
import {mergeBoards} from './merge.js';
const clone=x=>structuredClone(x);
export class LiveSession {
  constructor({read,receive,status,notice,pending,recovery}) {Object.assign(this,{read,receive,status,notice,pending,recovery});this.mode='off';this.connections=new Map();this.base=null;this.waiting=false;this.ready=false;this.revision=0;}
  get blocked(){return this.mode!=='off'&&(!this.ready||this.waiting);}
  describe(){if(this.mode==='host')this.status(`Live · ${this.connections.size+1} connected · Keep this tab open`);else if(this.mode==='guest'&&this.ready)this.status('Live · Connected to shared board');}
  start(role,host){
    if(!window.Peer){this.notice('Live connection library could not load. Refresh and try again.');return;}
    this.stop(false);this.revision=0;this.draft=null;this.mode=role;this.ready=false;this.host=role==='host'?(host||'coaching-'+crypto.randomUUID()):host;this.failed=false;this.status('Connecting live session…');this.pending(true);
    let opened=false;
    const peer=this.peer=new window.Peer(role==='host'?this.host:undefined,{debug:0});
    this.timer=setTimeout(()=>this.fail('Could not connect. The host must keep their tab open. Click Retry connection. If it still fails, try another network or ask for a fresh invite.'),20000);
    peer.on('open',id=>{if(this.peer!==peer)return;if(opened){this.failed=false;this.describe();return;}opened=true;if(role==='host'){clearTimeout(this.timer);this.host=id;this.base=clone(this.read());this.failed=false;this.ready=true;this.pending(false);this.describe();}else this.attach(peer.connect(host,{reliable:true,serialization:'json'}),false);});
    peer.on('connection',conn=>{if(this.mode!=='host'){conn.close();return;}this.attach(conn,true);});
    peer.on('error',error=>{if(this.peer!==peer)return;const messages={
      'peer-unavailable':'Host is not online at this invite. Ask the host to open their live session, then click Retry connection.',
      'unavailable-id':'This session is still reconnecting or open in another tab. Wait a moment, then click Retry connection.',
      'browser-incompatible':'This browser cannot connect live. Open the invite in Safari, Chrome, or Edge.',
      'network':'Cannot reach the live connection service. Check your connection, then click Retry connection.',
      'server-error':'Live connection service unavailable. Please retry shortly.',
      'socket-error':'Live connection service disconnected. Please retry shortly.'
    };this.fail(messages[error.type]||'Live connection interrupted. Click Retry connection; some networks block direct connections.');});
    peer.on('disconnected',()=>{if(this.peer!==peer)return;this.status('Session discovery disconnected · New partners cannot join');try{peer.reconnect();}catch{this.fail('Disconnected. Restart the live session.');}});
  }
  attach(conn,hosting){
    const sessionPeer=this.peer;
    let lastSeen=Date.now();
    const heartbeat=setInterval(()=>{if(this.peer!==sessionPeer){clearInterval(heartbeat);return;}if(!conn.open)return;if(Date.now()-lastSeen>12000){clearInterval(heartbeat);conn.close();return;}this.send(conn,{type:'ping'});},3000);
    conn.on('open',()=>{if(this.peer!==sessionPeer){conn.close();return;}lastSeen=Date.now();if(hosting){this.connections.set(conn.peer,conn);this.describe();this.send(conn,{type:'snapshot',board:this.base,revision:this.revision});}});
    conn.on('data',msg=>{
      if(this.peer!==sessionPeer)return;
      lastSeen=Date.now();if(msg?.type==='ping'){this.send(conn,{type:'pong'});return;}if(msg?.type==='pong')return;
      try {
        if(!msg||JSON.stringify(msg).length>5_000_000)throw Error('Invalid message');
        if(hosting&&msg.type==='proposal'){
          try {const next=mergeBoards(msg.base,msg.board,this.base);this.base=clone(next);this.revision++;this.receive(clone(next));this.broadcast(msg.id);}
          catch(e){this.send(conn,{type:'conflict',board:this.base,revision:this.revision,ack:msg.id});}
        } else if(!hosting&&(msg.type==='snapshot'||msg.type==='conflict')) {
          validate(msg.board);if(!Number.isInteger(msg.revision)||msg.revision<this.revision)return;
          this.revision=msg.revision;this.base=clone(msg.board);if(this.waiting&&msg.ack!==this.pendingId)return;clearTimeout(this.timer);this.failed=false;this.ready=true;
          if(msg.type==='conflict'){if(this.draft)this.recovery(this.draft);this.notice('Someone changed the same item. The latest board is shown; use Export unsent draft to keep your idea, then retry.');}
          this.waiting=false;this.draft=null;this.pending(false);this.describe();this.receive(clone(msg.board));
        }
      }catch{this.notice('An invalid live update was ignored.');}
    });
    const lost=()=>{clearInterval(heartbeat);if(this.peer!==sessionPeer)return;if(hosting){this.connections.delete(conn.peer);this.describe();}else if(this.mode==='guest')this.fail('Host disconnected · Changes paused. Keep the host tab open, then click Retry connection.');};
    conn.on('close',lost);conn.on('error',lost);if(!hosting)this.connection=conn;
  }
  send(conn,message){if(conn.open)conn.send(message);}
  broadcast(ack){for(const conn of this.connections.values())this.send(conn,{type:'snapshot',board:this.base,revision:this.revision,ack});}
  publish(next){
    if(this.mode==='off')return;
    if(!this.ready)throw Error('The live session is not connected.');
    validate(next);
    if(this.mode==='host'){this.base=clone(next);this.revision++;this.broadcast();return;}
    this.draft=clone(next);this.pendingId=crypto.randomUUID();this.waiting=true;this.pending(true);this.status('Sending changes…');
    this.send(this.connection,{type:'proposal',id:this.pendingId,base:this.base,board:next});
    this.timer=setTimeout(()=>this.fail('Update not confirmed · Your draft is available to export. Rejoin before making more changes.'),15000);
  }
  fail(message){this.failed=true;clearTimeout(this.timer);if(this.draft){this.recovery(this.draft);if(this.base)this.receive(clone(this.base));}this.ready=false;this.waiting=false;this.pending(true);this.status(message);}
  stop(notify=true){clearTimeout(this.timer);this.mode='off';this.failed=false;this.ready=false;this.waiting=false;const peer=this.peer;this.peer=null;peer?.destroy();this.connections.clear();this.pending(false);if(notify)this.status('Local board · Start a live session to work together');}
  link(){return makeInvite(this.host,location.href);}
}
