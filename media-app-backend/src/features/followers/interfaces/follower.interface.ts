import { Document, Types } from 'mongoose';

import { IUserDocument } from '@user/interfaces/user.interface';

export interface IFollowers {
  userId: string;
}

export interface IFollowerDocument extends Document {
  _id: Types.ObjectId | string;
  followerId: Types.ObjectId;
  followeeId: Types.ObjectId;
  createdAt?: Date;
}

export interface IFollower {
  _id: Types.ObjectId | string;
  followeeId?: IFollowerData;
  followerId?: IFollowerData;
  createdAt?: Date;
}

export interface IFollowerData {
  avatarColor: string;
  followersCount: number;
  followingCount: number;
  profilePicture: string;
  postCount: number;
  username: string;
  uId: string;
  _id?: Types.ObjectId;
  userProfile?: IUserDocument;
}

export interface IFollowerJobData {
  keyOne?: string;
  keyTwo?: string;
  username?: string;
  followerDocumentId?: Types.ObjectId;
}

export interface IBlockedUserJobData {
  keyOne?: string;
  keyTwo?: string;
  type?: string;
}
