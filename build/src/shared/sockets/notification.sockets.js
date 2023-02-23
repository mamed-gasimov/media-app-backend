"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketIONotificationObject = exports.SocketIONotificationHandler = void 0;
let socketIONotificationObject;
exports.socketIONotificationObject = socketIONotificationObject;
class SocketIONotificationHandler {
    listen(io) {
        exports.socketIONotificationObject = socketIONotificationObject = io;
    }
}
exports.SocketIONotificationHandler = SocketIONotificationHandler;
//# sourceMappingURL=notification.sockets.js.map