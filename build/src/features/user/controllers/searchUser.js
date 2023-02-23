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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUser = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const helpers_1 = require("../../../shared/globals/helpers/helpers");
const user_service_1 = require("../../../shared/services/db/user.service");
const errorHandler_1 = require("../../../shared/globals/helpers/errorHandler");
class SearchUser {
    user(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { query } = req.params;
            if (!(query === null || query === void 0 ? void 0 : query.trim())) {
                throw new errorHandler_1.BadRequestError('Invalid request');
            }
            const regex = new RegExp(helpers_1.Helpers.escapeRegex(query), 'i');
            const users = yield user_service_1.userService.searchUsers(regex);
            const usersExcludeCurrent = users.filter((item) => String(item._id) !== String(req.currentUser.userId));
            res.status(http_status_codes_1.default.OK).json({ message: 'Search results', search: usersExcludeCurrent });
        });
    }
}
exports.searchUser = new SearchUser();
//# sourceMappingURL=searchUser.js.map