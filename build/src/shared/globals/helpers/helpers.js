"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Helpers = void 0;
const crypto_1 = __importDefault(require("crypto"));
const mongodb_1 = require("mongodb");
class Helpers {
    static firstLetterUpperCase(str) {
        const valueString = str.toLowerCase();
        return valueString
            .split(' ')
            .map((namePart) => namePart[0].toUpperCase() + namePart.substring(1))
            .join(' ');
    }
    static lowerCase(str) {
        return str.toLowerCase();
    }
    static generateRandomIntegers(integerLength) {
        const characters = '0123456789';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < integerLength; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return parseInt(result, 10);
    }
    static generateRandomCharacters(bytes) {
        const randomBytes = crypto_1.default.randomBytes(bytes);
        return randomBytes.toString('hex');
    }
    static parseJson(prop) {
        try {
            JSON.parse(prop);
        }
        catch (error) {
            return prop;
        }
        return JSON.parse(prop);
    }
    static checkValidObjectId(id) {
        if (!id || !mongodb_1.ObjectId.isValid(id)) {
            return false;
        }
        const objectId = new mongodb_1.ObjectId(id);
        if (String(objectId) !== id) {
            return false;
        }
        return true;
    }
    static isDataBase64(value) {
        const dataUrlRegex = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\\/?%\s]*)\s*$/i;
        return dataUrlRegex.test(value);
    }
    static isValidHttpsUrl(value) {
        const urlPattern = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-/]))?/;
        return urlPattern.test(value);
    }
    static shuffle(list) {
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
        }
        return list;
    }
    static escapeRegex(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    }
}
exports.Helpers = Helpers;
//# sourceMappingURL=helpers.js.map