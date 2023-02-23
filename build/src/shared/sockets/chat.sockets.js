"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketIOChatHandler = exports.socketIOChatObject = void 0;
const user_sockets_1 = require("./user.sockets");
class SocketIOChatHandler {
    constructor(io) {
        this.io = io;
        exports.socketIOChatObject = io;
    }
    listen() {
        this.io.on('connection', (socket) => {
            socket.on('join room', (users) => {
                const { senderName, receiverName } = users;
                const senderSocketId = user_sockets_1.connectedUsersMap.get(senderName);
                const receiverSocketId = user_sockets_1.connectedUsersMap.get(receiverName);
                socket.join(senderSocketId);
                socket.join(receiverSocketId);
            });
        });
    }
}
exports.SocketIOChatHandler = SocketIOChatHandler;
//# sourceMappingURL=chat.sockets.js.map