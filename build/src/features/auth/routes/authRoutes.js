"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const passwordReset_1 = require("../controllers/passwordReset");
const signin_1 = require("../controllers/signin");
const signout_1 = require("../controllers/signout");
const signup_1 = require("../controllers/signup");
class AuthRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
    }
    routes() {
        this.router.post('/signup', signup_1.signUp.create);
        this.router.post('/signin', signin_1.signIn.read);
        this.router.post('/forgot-password', passwordReset_1.passwordReset.create);
        this.router.post('/reset-password/:token', passwordReset_1.passwordReset.update);
        return this.router;
    }
    signOutRoute() {
        this.router.get('/signout', signout_1.signOut.update);
        return this.router;
    }
}
exports.authRoutes = new AuthRoutes();
//# sourceMappingURL=authRoutes.js.map