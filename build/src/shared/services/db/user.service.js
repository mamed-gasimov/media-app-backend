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
exports.userService = void 0;
const mongoose_1 = require("mongoose");
const user_model_1 = require("../../../features/user/models/user.model");
const follower_service_1 = require("../db/follower.service");
const auth_model_1 = require("../../../features/auth/models/auth.model");
class UserService {
    addUserData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield user_model_1.UserModel.create(data);
        });
    }
    updatePassword(username, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            yield auth_model_1.AuthModel.updateOne({ username }, { $set: { password: hashedPassword } }).exec();
        });
    }
    getUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield user_model_1.UserModel.aggregate([
                { $match: { _id: new mongoose_1.Types.ObjectId(userId) } },
                { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
                { $unwind: '$authId' },
                { $project: this.aggregateProject() },
            ]);
            return users[0];
        });
    }
    findUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return user_model_1.UserModel.findOne({ _id: userId }).exec();
        });
    }
    removeBgImg(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return user_model_1.UserModel.findOneAndUpdate({ _id: userId }, { $set: { bgImageId: '', bgImageVersion: '' } });
        });
    }
    getAllUsers(userId, skip, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield user_model_1.UserModel.aggregate([
                { $match: { _id: { $ne: new mongoose_1.Types.ObjectId(userId) } } },
                { $skip: skip },
                { $limit: limit },
                { $sort: { createdAt: -1 } },
                { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
                { $unwind: '$authId' },
                { $project: this.aggregateProject() },
            ]);
            return users;
        });
    }
    getUserByAuthId(authId) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield user_model_1.UserModel.aggregate([
                { $match: { authId: new mongoose_1.Types.ObjectId(authId) } },
                { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
                { $unwind: '$authId' },
                { $project: this.aggregateProject() },
            ]);
            return users[0];
        });
    }
    updateUserInfo(userId, info) {
        return __awaiter(this, void 0, void 0, function* () {
            yield user_model_1.UserModel.updateOne({ _id: userId }, {
                $set: {
                    work: info['work'],
                    school: info['school'],
                    quote: info['quote'],
                    location: info['location'],
                },
            }).exec();
        });
    }
    updateSocialLinks(userId, links) {
        return __awaiter(this, void 0, void 0, function* () {
            yield user_model_1.UserModel.updateOne({ _id: userId }, { $set: { social: links } }).exec();
        });
    }
    updateNotificationSettings(userId, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            yield user_model_1.UserModel.updateOne({ _id: userId }, { $set: { notifications: settings } }).exec();
        });
    }
    getTotalUsersInDb() {
        return __awaiter(this, void 0, void 0, function* () {
            const totalCount = yield user_model_1.UserModel.find({}).countDocuments();
            return totalCount;
        });
    }
    getRandomUsers(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const randomUsers = [];
            const users = yield user_model_1.UserModel.aggregate([
                { $match: { _id: { $ne: new mongoose_1.Types.ObjectId(userId) } } },
                { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
                { $unwind: '$authId' },
                { $sample: { size: 10 } },
                {
                    $addFields: {
                        username: '$authId.username',
                        email: '$authId.email',
                        avatarColor: '$authId.avatarColor',
                        uId: '$authId.uId',
                        createdAt: '$authId.createdAt',
                    },
                },
                {
                    $project: {
                        authId: 0,
                        __v: 0,
                    },
                },
            ]);
            const followers = yield follower_service_1.followerService.getFolloweesIds(`${userId}`);
            for (const user of users) {
                const followerIndex = followers.indexOf(user._id.toString());
                if (followerIndex === -1) {
                    randomUsers.push(user);
                }
            }
            return randomUsers;
        });
    }
    searchUsers(regex) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield auth_model_1.AuthModel.aggregate([
                { $match: { username: regex } },
                { $lookup: { from: 'User', localField: '_id', foreignField: 'authId', as: 'user' } },
                { $unwind: '$user' },
                {
                    $project: {
                        _id: '$user._id',
                        username: 1,
                        email: 1,
                        avatarColor: 1,
                        profilePicture: 1,
                    },
                },
            ]);
            return users;
        });
    }
    aggregateProject() {
        return {
            _id: 1,
            username: '$authId.username',
            uId: '$authId.uId',
            email: '$authId.email',
            avatarColor: '$authId.avatarColor',
            createdAt: '$authId.createdAt',
            postsCount: 1,
            work: 1,
            school: 1,
            quote: 1,
            location: 1,
            blocked: 1,
            blockedBy: 1,
            followersCount: 1,
            followingCount: 1,
            notifications: 1,
            social: 1,
            bgImageVersion: 1,
            bgImageId: 1,
            profilePicture: 1,
        };
    }
}
exports.userService = new UserService();
//# sourceMappingURL=user.service.js.map