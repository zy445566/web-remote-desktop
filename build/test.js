"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handler = require("serve-handler");
const http_1 = require("http");
const index_1 = require("./index");
const server = (0, http_1.createServer)((request, response) => {
    return handler(request, response, {
        public: (0, index_1.getRemoteDesktopWebStaticDir)()
    });
});
const rdwss = (0, index_1.createRemoteDesktopWebSocketServer)();
server.on('upgrade', function upgrade(request, socket, head) {
    return rdwss(request, socket, head);
});
server.listen(3000, () => {
    console.log('Running at http://localhost:3000');
});
//# sourceMappingURL=test.js.map