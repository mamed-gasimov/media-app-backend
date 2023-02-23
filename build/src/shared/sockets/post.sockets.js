"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketIOPostHandler = exports.socketIOPostObject = void 0;
class SocketIOPostHandler {
    constructor(io) {
        this.io = io;
        exports.socketIOPostObject = io;
    }
    listen() {
        this.io.on('connection', (socket) => {
            socket.on('reaction', (reactionData) => {
                this.io.emit('update reaction', reactionData);
            });
            socket.on('comment', (commentData) => {
                this.io.emit('update comment', commentData);
            });
        });
    }
}
exports.SocketIOPostHandler = SocketIOPostHandler;
//# sourceMappingURL=post.sockets.js.map