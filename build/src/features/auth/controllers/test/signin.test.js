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
const signin_1 = require("../../controllers/signin");
const helpers_1 = require("../../../../shared/globals/helpers/helpers");
const auth_mock_1 = require("../../../../mocks/auth.mock");
const user_mock_1 = require("../../../../mocks/user.mock");
const auth_service_1 = require("../../../../shared/services/db/auth.service");
const user_service_1 = require("../../../../shared/services/db/user.service");
const USERNAME = 'John';
const PASSWORD = 'qwerty123';
const WRONG_USERNAME = 'jo';
const WRONG_PASSWORD = 'qw';
const LONG_PASSWORD = 'some very long long password';
const LONG_USERNAME = 'some very long long username';
jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
const getTestData = (body, outputMessage) => {
    const req = (0, auth_mock_1.authMockRequest)({}, body);
    const res = (0, auth_mock_1.authMockResponse)();
    signin_1.signIn.read(req, res).catch((error) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual(outputMessage);
    });
};
describe('SignIn', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });
    it('should throw an error if username is not available', () => {
        getTestData({ username: '', password: PASSWORD }, 'Username is a required field');
    });
    it('should throw an error if username length is less than minimum length', () => {
        getTestData({ username: WRONG_USERNAME, password: WRONG_PASSWORD }, 'Invalid username');
    });
    it('should throw an error if username length is greater than maximum length', () => {
        getTestData({ username: LONG_USERNAME, password: WRONG_PASSWORD }, 'Invalid username');
    });
    it('should throw an error if password is not available', () => {
        getTestData({ username: USERNAME, password: '' }, 'Password is a required field');
    });
    it('should throw an error if password length is less than minimum length', () => {
        getTestData({ username: USERNAME, password: WRONG_PASSWORD }, 'Invalid password');
    });
    it('should throw an error if password length is greater than maximum length', () => {
        getTestData({ username: USERNAME, password: LONG_PASSWORD }, 'Invalid password');
    });
    it('should throw an error if request session jwt token already exist', () => {
        const req = (0, auth_mock_1.authMockRequest)({ jwt: '12345' }, { username: USERNAME, password: PASSWORD });
        const res = (0, auth_mock_1.authMockResponse)();
        signin_1.signIn.read(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('You need to sign out first.');
        });
    });
    it('should throw an error if username does not exist', () => {
        const req = (0, auth_mock_1.authMockRequest)({}, { username: USERNAME, password: PASSWORD });
        const res = (0, auth_mock_1.authMockResponse)();
        jest.spyOn(auth_service_1.authService, 'getAuthUserByUsername').mockResolvedValueOnce(null);
        signin_1.signIn.read(req, res).catch((error) => {
            expect(auth_service_1.authService.getAuthUserByUsername).toHaveBeenCalledWith(helpers_1.Helpers.firstLetterUpperCase(req.body.username));
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid credentials!');
        });
    });
    it('should throw an error if password is not correct', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, auth_mock_1.authMockRequest)({}, { username: USERNAME, password: PASSWORD });
        const res = (0, auth_mock_1.authMockResponse)();
        auth_mock_1.authMock.comparePassword = () => Promise.resolve(false);
        signin_1.signIn.read(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid credentials!');
        });
    }));
    it('should set session data for valid credentials and send correct json response', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const req = (0, auth_mock_1.authMockRequest)({}, { username: USERNAME, password: PASSWORD });
        const res = (0, auth_mock_1.authMockResponse)();
        auth_mock_1.authMock.comparePassword = () => Promise.resolve(true);
        jest.spyOn(auth_service_1.authService, 'getAuthUserByUsername').mockResolvedValue(auth_mock_1.authMock);
        jest.spyOn(user_service_1.userService, 'getUserByAuthId').mockResolvedValue(user_mock_1.mergedAuthAndUserData);
        yield signin_1.signIn.read(req, res);
        expect((_a = req.session) === null || _a === void 0 ? void 0 : _a.jwt).toBeDefined();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'User logged in successfully!',
            user: user_mock_1.mergedAuthAndUserData,
            token: (_b = req.session) === null || _b === void 0 ? void 0 : _b.jwt,
        });
    }));
});
//# sourceMappingURL=signin.test.js.map