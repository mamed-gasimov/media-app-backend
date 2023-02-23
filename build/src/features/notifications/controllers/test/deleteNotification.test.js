"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const socket_io_1 = require("socket.io");
const auth_mock_1 = require("../../../../mocks/auth.mock");
const notificationServer = __importStar(require("../../../../shared/sockets/notification.sockets"));
const notification_mock_1 = require("../../../../mocks/notification.mock");
const notification_queue_1 = require("../../../../shared/services/queues/notification.queue");
const deleteNotification_1 = require("../../controllers/deleteNotification");
jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
Object.defineProperties(notificationServer, {
    socketIONotificationObject: {
        value: new socket_io_1.Server(),
        writable: true,
    },
});
describe('Delete notification', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });
    it('should throw an error if notificationId is not available', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, notification_mock_1.notificationMockRequest)({}, auth_mock_1.authUserPayload, { notificationId: '' });
        const res = (0, notification_mock_1.notificationMockResponse)();
        deleteNotification_1.deleteNotification.notification(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid request.');
        });
    }));
    it('should throw an error if notificationId is not valid mongodb ObjectId', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, notification_mock_1.notificationMockRequest)({}, auth_mock_1.authUserPayload, { notificationId: '12345' });
        const res = (0, notification_mock_1.notificationMockResponse)();
        deleteNotification_1.deleteNotification.notification(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid request.');
        });
    }));
    it('should send correct json response', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, notification_mock_1.notificationMockRequest)({}, auth_mock_1.authUserPayload, { notificationId: '60263f14648fed5446e322d9' });
        const res = (0, notification_mock_1.notificationMockResponse)();
        jest.spyOn(notificationServer.socketIONotificationObject, 'emit');
        jest.spyOn(notification_queue_1.notificationQueue, 'addNotificationJob');
        yield deleteNotification_1.deleteNotification.notification(req, res);
        expect(notificationServer.socketIONotificationObject.emit).toHaveBeenCalledWith('delete notification', req.params.notificationId);
        expect(notification_queue_1.notificationQueue.addNotificationJob).toHaveBeenCalledWith('deleteNotification', {
            key: req.params.notificationId,
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Notification was deleted successfully',
        });
    }));
});
//# sourceMappingURL=deleteNotification.test.js.map