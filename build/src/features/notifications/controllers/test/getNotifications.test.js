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
const auth_mock_1 = require("../../../../mocks/auth.mock");
const notification_mock_1 = require("../../../../mocks/notification.mock");
const getNotifications_1 = require("../../controllers/getNotifications");
const notification_service_1 = require("../../../../shared/services/db/notification.service");
jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/db/notification.service');
describe('Get Notifications', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });
    it('should send empty array if user does not have notifications', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, notification_mock_1.notificationMockRequest)({}, auth_mock_1.authUserPayload);
        const res = (0, notification_mock_1.notificationMockResponse)();
        jest.spyOn(notification_service_1.notificationService, 'getNotifications').mockResolvedValue([]);
        yield getNotifications_1.getNotifications.notifications(req, res);
        expect(notification_service_1.notificationService.getNotifications).toHaveBeenCalledWith(req.currentUser.userId);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'User notifications',
            notifications: [],
        });
    }));
    it('should send correct json response', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, notification_mock_1.notificationMockRequest)({}, auth_mock_1.authUserPayload);
        const res = (0, notification_mock_1.notificationMockResponse)();
        jest.spyOn(notification_service_1.notificationService, 'getNotifications').mockResolvedValue([notification_mock_1.notificationData]);
        yield getNotifications_1.getNotifications.notifications(req, res);
        expect(notification_service_1.notificationService.getNotifications).toHaveBeenCalledWith(req.currentUser.userId);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'User notifications',
            notifications: [notification_mock_1.notificationData],
        });
    }));
});
//# sourceMappingURL=getNotifications.test.js.map