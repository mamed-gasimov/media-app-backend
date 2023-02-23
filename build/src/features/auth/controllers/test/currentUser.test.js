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
const currentUser_1 = require("../../controllers/currentUser");
const auth_mock_1 = require("../../../../mocks/auth.mock");
const user_mock_1 = require("../../../../mocks/user.mock");
const user_cache_1 = require("../../../../shared/services/redis/user.cache");
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/user.cache');
jest.mock('@service/db/user.service');
const USERNAME = 'Manny';
const PASSWORD = 'qwerty123';
describe('CurrentUser', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('token', () => {
        it('should set session token to null and send correct json response', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, auth_mock_1.authMockRequest)({}, { username: USERNAME, password: PASSWORD }, auth_mock_1.authUserPayload);
            const res = (0, auth_mock_1.authMockResponse)();
            jest.spyOn(user_cache_1.UserCache.prototype, 'getUserFromCache').mockResolvedValue({});
            yield currentUser_1.currentUser.read(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                token: null,
                isUser: false,
                user: null,
            });
        }));
        it('should set session token and send correct json response', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const req = (0, auth_mock_1.authMockRequest)({ jwt: '12djdj34' }, { username: USERNAME, password: PASSWORD }, auth_mock_1.authUserPayload);
            const res = (0, auth_mock_1.authMockResponse)();
            jest.spyOn(user_cache_1.UserCache.prototype, 'getUserFromCache').mockResolvedValue(user_mock_1.existingUser);
            yield currentUser_1.currentUser.read(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                token: (_a = req.session) === null || _a === void 0 ? void 0 : _a.jwt,
                isUser: true,
                user: user_mock_1.existingUser,
            });
        }));
    });
});
//# sourceMappingURL=currentUser.test.js.map