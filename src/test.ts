import * as handler  from "serve-handler";
import {createServer}  from "http";
import {createRemoteDesktopWebSocketServer, getRemoteDesktopWebStaticDir}  from "./index";


const server = createServer((request, response) => {
  return handler(request, response,{
      public:getRemoteDesktopWebStaticDir()
  });
});
const rdwss = createRemoteDesktopWebSocketServer()
server.on('upgrade', function upgrade(request, socket, head) {
  return rdwss(request, socket, head);
});

server.listen(3000, () => {
  console.log('Running at http://localhost:3000');
});

server.close()