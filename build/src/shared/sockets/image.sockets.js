"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketIOImageObject = exports.SocketIOImageHandler = void 0;
let socketIOImageObject;
exports.socketIOImageObject = socketIOImageObject;
class SocketIOImageHandler {
    listen(io) {
        exports.socketIOImageObject = socketIOImageObject = io;
    }
}
exports.SocketIOImageHandler = SocketIOImageHandler;
//# sourceMappingURL=image.sockets.js.map