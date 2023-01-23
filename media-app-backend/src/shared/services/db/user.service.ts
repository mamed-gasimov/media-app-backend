import { Types } from 'mongoose';

import {
  IBasicInfo,
  INotificationSettings,
  ISocialLinks,
  IUserDocument,
} from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/user.model';

class UserService {
  public async addUserData(data: IUserDocument) {
    await UserModel.create(data);
  }

  public async getUserById(userId: string) {
    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: { _id: new Types.ObjectId(userId) } },
      { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' },
      { $project: this.aggregateProject() },
    ]);
    return users[0] as IUserDocument | undefined;
  }

  public async findUserById(userId: string) {
    return UserModel.findOne({ _id: userId }).exec();
  }

  public async removeBgImg(userId: string) {
    return UserModel.findOneAndUpdate({ _id: userId }, { $set: { bgImageId: '', bgImageVersion: '' } });
  }

  public async getAllUsers(userId: string, skip: number, limit: number) {
    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: { _id: { $ne: new Types.ObjectId(userId) } } },
      { $skip: skip },
      { $limit: limit },
      { $sort: { createdAt: -1 } },
      { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' },
      { $project: this.aggregateProject() },
    ]);
    return users;
  }

  public async getUserByAuthId(authId: string) {
    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: { authId: new Types.ObjectId(authId) } },
      { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' },
      { $project: this.aggregateProject() },
    ]);
    return users[0];
  }

  public async updateUserInfo(userId: string, info: IBasicInfo) {
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          work: info['work'],
          school: info['school'],
          quote: info['quote'],
          location: info['location'],
        },
      }
    ).exec();
  }

  public async updateSocialLinks(userId: string, links: ISocialLinks) {
    await UserModel.updateOne({ _id: userId }, { $set: { social: links } }).exec();
  }

  public async updateNotificationSettings(userId: string, settings: INotificationSettings) {
    await UserModel.updateOne({ _id: userId }, { $set: { notifications: settings } }).exec();
  }

  public async getTotalUsersInDb() {
    const totalCount = await UserModel.find({}).countDocuments();
    return totalCount;
  }

  private aggregateProject() {
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

export const userService = new UserService();
