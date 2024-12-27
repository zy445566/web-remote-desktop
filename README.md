# web-remote-desktop
A remote desktop running on the web power by Node.js

# install
```
npm i web-remote-desktop
```

# use
```ts
import * as handler  from "serve-handler";
import {createServer}  from "http";
import {createRemoteDesktopWebSocketServer, getRemoteDesktopWebStaticDir}  from "web-remote-desktop";

// create your server
const server = createServer((request, response) => {
  return handler(request, response,{
      public:getRemoteDesktopWebStaticDir() //there is Remote Desktop Web front web path
  });
});

// init Remote Desktop Web Socket Server
const rdwss = createRemoteDesktopWebSocketServer()

// use Remote Desktop Web Socket when websocket open
server.on('upgrade', function upgrade(request, socket, head) {
  return rdwss(request, socket, head);
});

// custom your http port
server.listen(3000, () => {
  console.log('Running at http://localhost:3000');
});
```