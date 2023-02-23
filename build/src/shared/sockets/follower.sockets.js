"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketIOFollowerHandler = exports.socketIOFollowerObject = void 0;
class SocketIOFollowerHandler {
    constructor(io) {
        this.io = io;
        exports.socketIOFollowerObject = io;
    }
    listen() {
        this.io.on('connection', (socket) => {
            socket.on('unfollow user', (data) => {
                this.io.emit('remove follower', data);
            });
        });
    }
}
exports.SocketIOFollowerHandler = SocketIOFollowerHandler;
//# sourceMappingURL=follower.sockets.js.map