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
/* eslint-disable @typescript-eslint/no-explicit-any */
const signup_1 = require("../../controllers/signup");
const cloudinaryUploads = __importStar(require("../../../../shared/globals/helpers/cloudinaryUpload"));
const auth_mock_1 = require("../../../../mocks/auth.mock");
const auth_service_1 = require("../../../../shared/services/db/auth.service");
const user_cache_1 = require("../../../../shared/services/redis/user.cache");
jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/user.cache');
jest.mock('@service/queues/user.queue');
jest.mock('@service/queues/auth.queue');
jest.mock('@global/helpers/cloudinaryUpload');
const getTestData = (body, outputMessage) => {
    const req = (0, auth_mock_1.authMockRequest)({}, body);
    const res = (0, auth_mock_1.authMockResponse)();
    signup_1.signUp.create(req, res).catch((error) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual(outputMessage);
    });
};
describe('SignUp', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });
    it('should throw an error if username is not available', () => {
        getTestData({
            username: '',
            email: 'manny@test.com',
            password: 'qwerty123',
            avatarColor: 'red',
            avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==',
        }, 'Username is a required field');
    });
    it('should throw an error if username length is less than minimum length', () => {
        getTestData({
            username: 'te',
            email: 'manny@test.com',
            password: 'qwerty123',
            avatarColor: 'red',
            avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==',
        }, 'Invalid username');
    });
    it('should throw an error if username length is greater than maximum length', () => {
        getTestData({
            username: 'some very long username',
            email: 'manny@test.com',
            password: 'qwerty123',
            avatarColor: 'red',
            avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==',
        }, 'Invalid username');
    });
    it('should throw an error if email is not valid', () => {
        getTestData({
            username: 'test',
            email: 'invalid email',
            password: 'qwerty123',
            avatarColor: 'red',
            avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==',
        }, 'Email must be valid');
    });
    it('should throw an error if email is not available', () => {
        getTestData({
            username: 'test',
            email: '',
            password: 'qwerty123',
            avatarColor: 'red',
            avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==',
        }, 'Email is a required field');
    });
    it('should throw an error if password is not available', () => {
        getTestData({
            username: 'test',
            email: 'test@gmail.com',
            password: '',
            avatarColor: 'red',
            avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==',
        }, 'Password is a required field');
    });
    it('should throw an error if password length is less than minimum length', () => {
        getTestData({
            username: 'test',
            email: 'test@gmail.com',
            password: 'te',
            avatarColor: 'red',
            avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==',
        }, 'Invalid password');
    });
    it('should throw an error if password length is greater than maximum length', () => {
        getTestData({
            username: 'test',
            email: 'test@gmail.com',
            password: 'some really long password',
            avatarColor: 'red',
            avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==',
        }, 'Invalid password');
    });
    it('should throw unauthorize error if user already exists', () => {
        const req = (0, auth_mock_1.authMockRequest)({}, {
            username: 'test',
            email: 'manny@me.com',
            password: 'qwerty123',
            avatarColor: 'red',
            avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==',
        });
        const res = (0, auth_mock_1.authMockResponse)();
        jest.spyOn(auth_service_1.authService, 'getUserByUsernameOrEmail').mockResolvedValue(auth_mock_1.authMock);
        signup_1.signUp.create(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('User is already exists!');
        });
    });
    it('should set session data for valid credentials and send correct json response', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const req = (0, auth_mock_1.authMockRequest)({}, {
            username: 'test',
            email: 'manny@me.com',
            password: 'qwerty123',
            avatarColor: 'red',
            avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==',
        });
        const res = (0, auth_mock_1.authMockResponse)();
        jest.spyOn(auth_service_1.authService, 'getUserByUsernameOrEmail').mockResolvedValue(null);
        const userSpy = jest.spyOn(user_cache_1.UserCache.prototype, 'saveUserToCache');
        jest
            .spyOn(cloudinaryUploads, 'uploads')
            .mockImplementation(() => Promise.resolve({ version: '1234737373', public_id: '123456' }));
        yield signup_1.signUp.create(req, res);
        expect((_a = req.session) === null || _a === void 0 ? void 0 : _a.jwt).toBeDefined();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'User is created successfully!',
            user: userSpy.mock.calls[0][2],
            token: (_b = req.session) === null || _b === void 0 ? void 0 : _b.jwt,
        });
    }));
});
//# sourceMappingURL=signup.test.js.map