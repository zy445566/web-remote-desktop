import {getScreenSize,getBlockScreen,getScreen,mouseToggle,keyToggle} from "./robot";
import { WebSocketServer } from 'ws';
import * as path from "path";




const doRemoteDesktopWebSocket = async (event) =>{
  switch (event.command) {
    case 'getScreenSize':
      return getScreenSize();
    case 'getScreen':
        return getScreen();
    case 'getBlockScreen':
      return getBlockScreen(event.params);
    case  'mouseToggle':
      return mouseToggle(event.params)
    case  'keyToggle':
        return keyToggle(event.params)
    default:
      throw new Error('Unknown command');
  }
}


export const createRemoteDesktopWebSocketServer = () => {
  const wss = new WebSocketServer({ noServer: true });
  wss.on('connection', function connection(ws) {
    ws.on('error', console.error);
    ws.on('message', async function message(data) {
      let result=null, error=null,id=null;
      try {
        const event = JSON.parse(data)
        id = event.id;
        result = await doRemoteDesktopWebSocket(event)
      } catch (e) {
        error = e;
      }
      if(id) {
        ws.send(JSON.stringify({result,error,id}));
      } else {
        console.error(data,error)
      }
    });
  });

  return function upgrade(request, socket, head) {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request);
    });
  }
}

export const getRemoteDesktopWebStaticDir = () => {
  return path.join(__dirname,"../dist")
}
