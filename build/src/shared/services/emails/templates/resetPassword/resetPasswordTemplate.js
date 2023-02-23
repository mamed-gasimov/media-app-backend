"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordTemplate = void 0;
const ejs_1 = __importDefault(require("ejs"));
const fs_1 = __importDefault(require("fs"));
class ResetPasswordTemplate {
    passwordResetConfirmationTemplate(templateParams) {
        const { username, email, ipaddress, date } = templateParams;
        return ejs_1.default.render(fs_1.default.readFileSync(__dirname + '/reset-password-template.ejs', 'utf8'), {
            username,
            email,
            ipaddress,
            date,
        });
    }
}
exports.resetPasswordTemplate = new ResetPasswordTemplate();
//# sourceMappingURL=resetPasswordTemplate.js.map