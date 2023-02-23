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
const chat_mock_1 = require("../../../../mocks/chat.mock");
const auth_mock_1 = require("../../../../mocks/auth.mock");
const user_mock_1 = require("../../../../mocks/user.mock");
const searchUser_1 = require("../../controllers/searchUser");
const user_service_1 = require("../../../../shared/services/db/user.service");
jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/user.cache');
describe('Search User', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });
    describe('user', () => {
        it('should send correct json response if searched user exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, chat_mock_1.chatMockRequest)({}, {}, auth_mock_1.authUserPayload, { query: 'Danny' });
            const res = (0, chat_mock_1.chatMockResponse)();
            jest.spyOn(user_service_1.userService, 'searchUsers').mockResolvedValue([user_mock_1.searchedUserMock]);
            yield searchUser_1.searchUser.user(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Search results',
                search: [user_mock_1.searchedUserMock],
            });
        }));
        it('should send correct json response if searched user does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, chat_mock_1.chatMockRequest)({}, {}, auth_mock_1.authUserPayload, { query: 'DannyBoy' });
            const res = (0, chat_mock_1.chatMockResponse)();
            jest.spyOn(user_service_1.userService, 'searchUsers').mockResolvedValue([]);
            yield searchUser_1.searchUser.user(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Search results',
                search: [],
            });
        }));
    });
});
//# sourceMappingURL=searchUser.test.js.map