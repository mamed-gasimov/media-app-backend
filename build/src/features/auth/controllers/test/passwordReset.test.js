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
const passwordReset_1 = require("../../controllers/passwordReset");
const auth_mock_1 = require("../../../../mocks/auth.mock");
const auth_service_1 = require("../../../../shared/services/db/auth.service");
const email_queue_1 = require("../../../../shared/services/queues/email.queue");
const WRONG_EMAIL = 'test@email.com';
const CORRECT_EMAIL = 'manny@me.com';
const INVALID_EMAIL = 'test';
const CORRECT_PASSWORD = 'qwerty123';
jest.mock('@service/queues/base.queue');
jest.mock('@service/queues/email.queue');
jest.mock('@service/db/auth.service');
jest.mock('@service/emails/mail.transport');
const getTestData = (body, outputMessage, method) => {
    const req = (0, auth_mock_1.authMockRequest)({}, body);
    const res = (0, auth_mock_1.authMockResponse)();
    passwordReset_1.passwordReset[method](req, res).catch((error) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual(outputMessage);
    });
};
describe('Password', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('create', () => {
        it('should throw an error if email is invalid', () => {
            getTestData({ email: INVALID_EMAIL }, 'Field must be valid', 'create');
        });
        it('should throw "Invalid credentials" if email does not exist', () => {
            getTestData({ email: WRONG_EMAIL }, 'Invalid credentials', 'create');
        });
        it('should send correct json response', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, auth_mock_1.authMockRequest)({}, { email: CORRECT_EMAIL });
            const res = (0, auth_mock_1.authMockResponse)();
            jest.spyOn(auth_service_1.authService, 'getAuthUserByEmail').mockResolvedValue(auth_mock_1.authMock);
            jest.spyOn(email_queue_1.emailQueue, 'addEmailJob');
            yield passwordReset_1.passwordReset.create(req, res);
            expect(email_queue_1.emailQueue.addEmailJob).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Reset password email is sent.',
            });
        }));
    });
    describe('update', () => {
        it('should throw an error if password is empty', () => {
            getTestData({ password: '', confirmPassword: '' }, 'Password is a required field', 'update');
        });
        it('should throw an error if password and confirmPassword are different', () => {
            getTestData({ password: CORRECT_PASSWORD, confirmPassword: `${CORRECT_PASSWORD}2` }, 'Passwords should match', 'update');
        });
        it('should throw error if reset token is empty', () => {
            const req = (0, auth_mock_1.authMockRequest)({}, { password: CORRECT_PASSWORD, confirmPassword: CORRECT_PASSWORD }, null, {
                token: '',
            });
            const res = (0, auth_mock_1.authMockResponse)();
            passwordReset_1.passwordReset.update(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Reset token is required!');
            });
        });
        it('should throw error if reset token has expired', () => {
            const req = (0, auth_mock_1.authMockRequest)({}, { password: CORRECT_PASSWORD, confirmPassword: CORRECT_PASSWORD }, null, {
                token: '12sde3t8g8j',
            });
            const res = (0, auth_mock_1.authMockResponse)();
            jest.spyOn(auth_service_1.authService, 'getAuthUserByPasswordToken').mockResolvedValue(null);
            passwordReset_1.passwordReset.update(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Reset token has expired.');
            });
        });
        it('should send correct json response', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, auth_mock_1.authMockRequest)({}, { password: CORRECT_PASSWORD, confirmPassword: CORRECT_PASSWORD }, null, {
                token: '12sde3',
            });
            const res = (0, auth_mock_1.authMockResponse)();
            jest.spyOn(auth_service_1.authService, 'getAuthUserByPasswordToken').mockResolvedValue(auth_mock_1.authMock);
            jest.spyOn(email_queue_1.emailQueue, 'addEmailJob');
            yield passwordReset_1.passwordReset.update(req, res);
            expect(email_queue_1.emailQueue.addEmailJob).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Password successfully updated.',
            });
        }));
    });
});
//# sourceMappingURL=passwordReset.test.js.map