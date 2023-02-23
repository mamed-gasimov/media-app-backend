"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketIOUserHandler = exports.connectedUsersMap = exports.socketIOUserObject = void 0;
exports.connectedUsersMap = new Map();
let users = [];
class SocketIOUserHandler {
    constructor(io) {
        this.io = io;
        exports.socketIOUserObject = io;
    }
    listen() {
        this.io.on('connection', (socket) => {
            socket.on('setup', (data) => {
                this.addClientToMap(data.userId, socket.id);
                this.addUser(data.userId);
                this.io.emit('user online', users);
            });
            socket.on('block user', (data) => {
                this.io.emit('blocked user id', data);
            });
            socket.on('unblock user', (data) => {
                this.io.emit('unblocked user id', data);
            });
            socket.on('disconnect', () => {
                this.removeClientFromMap(socket.id);
            });
        });
    }
    addClientToMap(username, socketId) {
        if (!exports.connectedUsersMap.has(username)) {
            exports.connectedUsersMap.set(username, socketId);
        }
    }
    removeClientFromMap(socketId) {
        if (Array.from(exports.connectedUsersMap.values()).includes(socketId)) {
            const disconnectedUser = [...exports.connectedUsersMap].find((user) => {
                return user[1] === socketId;
            });
            exports.connectedUsersMap.delete(disconnectedUser[0]);
            this.removeUser(disconnectedUser[0]);
            this.io.emit('user online', users);
        }
    }
    addUser(username) {
        users.push(username);
        users = [...new Set(users)];
    }
    removeUser(username) {
        users = users.filter((name) => name != username);
    }
}
exports.SocketIOUserHandler = SocketIOUserHandler;
//# sourceMappingURL=user.sockets.js.map