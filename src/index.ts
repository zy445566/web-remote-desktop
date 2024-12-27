import * as robot from "robotjs";
import { WebSocketServer } from 'ws';
import * as path from "path";

function getMouseButtonByMouseEvent(n) {
  switch (n) {
    case 0:
      return "left";
    case 1:
      return "middle";
    case 2:
      return "right";
    default:
      return "left";
  }
}

function getMouseTypeByMouseEvent(type) {
  switch (type) {
    case "mouseup":
      return "up";
    case "mousedown":
      return "down";
    default:
      return "down";
  }
}

function mouseToggle({rateX,rateY,type,button}) {
  const nowScreenSize = robot.getScreenSize()
  robot.moveMouse(nowScreenSize.width*rateX, nowScreenSize.height*rateY);
  robot.mouseToggle(getMouseTypeByMouseEvent(type),getMouseButtonByMouseEvent(button));
}

function getKeyTypeByKeyEvent(type) {
  switch (type) {
    case "keyup":
      return "up";
    case "keydown":
      return "down";
    default:
      return "down";
  }
}

function getKeyByKeyEvent(key) {
  return key.toLowerCase()
}


function keyToggle({key,type}) {
  robot.keyToggle(getKeyByKeyEvent(key), getKeyTypeByKeyEvent(type));
}



const doRemoteDesktopWebSocket = async (event) =>{
  switch (event.command) {
    case 'getScreenSize':
      return robot.getScreenSize();
    case 'getScreen':
      return robot.screen.capture();
    case  'mouseToggle':
      return mouseToggle(event.params)
    case  'keyToggle':
        return keyToggle(event.params)
    default:
      return 'Unknown command';
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
