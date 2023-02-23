"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPasswordTemplate = void 0;
const ejs_1 = __importDefault(require("ejs"));
const fs_1 = __importDefault(require("fs"));
class ForgotPasswordTemplate {
    passwordResetTemplate(username, resetLink) {
        return ejs_1.default.render(fs_1.default.readFileSync(__dirname + '/forgot-password-template.ejs', 'utf8'), {
            username,
            resetLink,
        });
    }
}
exports.forgotPasswordTemplate = new ForgotPasswordTemplate();
//# sourceMappingURL=forgotPasswordTemplate.js.map