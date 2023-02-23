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
/* eslint-disable @typescript-eslint/no-explicit-any */
const auth_mock_1 = require("../../../../mocks/auth.mock");
const updateUserInfo_1 = require("../../controllers/updateUserInfo");
const user_mock_1 = require("../../../../mocks/user.mock");
const email_queue_1 = require("../../../../shared/services/queues/email.queue");
const user_service_1 = require("../../../../shared/services/db/user.service");
const auth_service_1 = require("../../../../shared/services/db/auth.service");
jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/queues/email.queue');
jest.mock('@service/db/user.service');
describe('Update User Info', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });
    describe('Change Password', () => {
        it('should throw an error if currentPassword is empty', () => {
            const req = (0, auth_mock_1.authMockRequest)({}, {
                currentPassword: '',
                newPassword: 'manny1234',
                confirmPassword: 'manny1234',
            });
            const res = (0, auth_mock_1.authMockResponse)();
            updateUserInfo_1.updateUserInfo.password(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Password is a required field');
            });
        });
        it('should throw an error if newPassword is empty', () => {
            const req = (0, auth_mock_1.authMockRequest)({}, {
                currentPassword: 'manny1234',
                newPassword: '',
                confirmPassword: 'manny1234',
            });
            const res = (0, auth_mock_1.authMockResponse)();
            updateUserInfo_1.updateUserInfo.password(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Password is a required field');
            });
        });
        it('should throw an error if confirmPassword is empty', () => {
            const req = (0, auth_mock_1.authMockRequest)({}, {
                currentPassword: 'manny1234',
                newPassword: 'manny1234',
                confirmPassword: '',
            });
            const res = (0, auth_mock_1.authMockResponse)();
            updateUserInfo_1.updateUserInfo.password(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Confirm password does not match new password.');
            });
        });
        it('should throw an error if currentPassword does not exist', () => {
            const req = (0, auth_mock_1.authMockRequest)({}, {
                currentPassword: 'manny1234',
                newPassword: 'manny12345',
                confirmPassword: 'manny12345',
            }, auth_mock_1.authUserPayload);
            const res = (0, auth_mock_1.authMockResponse)();
            const mockUser = Object.assign(Object.assign({}, user_mock_1.existingUser), { comparePassword: () => false });
            jest.spyOn(auth_service_1.authService, 'getAuthUserByUsername').mockResolvedValue(mockUser);
            updateUserInfo_1.updateUserInfo.password(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid credentials');
            });
        });
        it('should send correct json response', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, auth_mock_1.authMockRequest)({}, {
                currentPassword: 'manny1234',
                newPassword: 'manny12345',
                confirmPassword: 'manny12345',
            }, auth_mock_1.authUserPayload);
            const res = (0, auth_mock_1.authMockResponse)();
            const mockUser = Object.assign(Object.assign({}, user_mock_1.existingUser), { comparePassword: () => true, hashPassword: () => 'djejdjr123482ejsj' });
            jest.spyOn(auth_service_1.authService, 'getAuthUserByUsername').mockResolvedValue(mockUser);
            jest.spyOn(user_service_1.userService, 'updatePassword');
            const spy = jest.spyOn(email_queue_1.emailQueue, 'addEmailJob');
            yield updateUserInfo_1.updateUserInfo.password(req, res);
            expect(user_service_1.userService.updatePassword).toHaveBeenCalledWith(`${req.currentUser.username}`, 'djejdjr123482ejsj');
            expect(email_queue_1.emailQueue.addEmailJob).toHaveBeenCalledWith(spy.mock.calls[0][0], spy.mock.calls[0][1]);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Password updated successfully',
            });
        }));
    });
});
//# sourceMappingURL=updateUserInfo.test.js.map