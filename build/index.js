"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRemoteDesktopWebStaticDir = exports.createRemoteDesktopWebSocketServer = void 0;
const robot = require("robotjs");
const ws_1 = require("ws");
const path = require("path");
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
function mouseToggle({ rateX, rateY, type, button }) {
    const nowScreenSize = robot.getScreenSize();
    robot.moveMouse(nowScreenSize.width * rateX, nowScreenSize.height * rateY);
    robot.mouseToggle(getMouseTypeByMouseEvent(type), getMouseButtonByMouseEvent(button));
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
    return key.toLowerCase();
}
function keyToggle({ key, type }) {
    robot.keyToggle(getKeyByKeyEvent(key), getKeyTypeByKeyEvent(type));
}
const doRemoteDesktopWebSocket = (event) => __awaiter(void 0, void 0, void 0, function* () {
    switch (event.command) {
        case 'getScreenSize':
            return robot.getScreenSize();
        case 'getScreen':
            return robot.screen.capture();
        case 'mouseToggle':
            return mouseToggle(event.params);
        case 'keyToggle':
            return keyToggle(event.params);
        default:
            return 'Unknown command';
    }
});
const createRemoteDesktopWebSocketServer = () => {
    const wss = new ws_1.WebSocketServer({ noServer: true });
    wss.on('connection', function connection(ws) {
        ws.on('error', console.error);
        ws.on('message', function message(data) {
            return __awaiter(this, void 0, void 0, function* () {
                let result = null, error = null, id = null;
                try {
                    const event = JSON.parse(data);
                    id = event.id;
                    result = yield doRemoteDesktopWebSocket(event);
                }
                catch (e) {
                    error = e;
                }
                if (id) {
                    ws.send(JSON.stringify({ result, error, id }));
                }
                else {
                    console.error(data, error);
                }
            });
        });
    });
    return function upgrade(request, socket, head) {
        wss.handleUpgrade(request, socket, head, function done(ws) {
            wss.emit('connection', ws, request);
        });
    };
};
exports.createRemoteDesktopWebSocketServer = createRemoteDesktopWebSocketServer;
const getRemoteDesktopWebStaticDir = () => {
    return path.join(__dirname, "../dist");
};
exports.getRemoteDesktopWebStaticDir = getRemoteDesktopWebStaticDir;
//# sourceMappingURL=index.js.map