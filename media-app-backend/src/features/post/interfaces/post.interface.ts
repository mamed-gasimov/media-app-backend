import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

import { IReactions } from '@reaction/interfaces/reaction.interface';

export interface IPostDocument extends Document {
  _id?: string | ObjectId;
  userId: string;
  username: string;
  email: string;
  avatarColor: string;
  profilePicture: string;
  post: string;
  bgColor: string;
  commentsCount: number;
  imgVersion?: string;
  imgId?: string;
  feelings?: string;
  gifUrl?: string;
  privacy?: string;
  videoId?: string;
  videoVersion?: string;
  reactions?: IReactions;
  createdAt?: Date;
  updatedAt?: Date | null;
}

export interface IGetPostsQuery {
  _id?: ObjectId | string;
  username?: string;
  imgId?: string;
  gifUrl?: string;
}

export interface ISavePostToCache {
  key: ObjectId | string;
  currentUserId: string;
  uId: string;
  createdPost: IPostDocument;
}

export interface IPostJobData {
  key?: string;
  value?: IPostDocument;
  keyOne?: string;
  keyTwo?: string;
}

export interface IQueryComplete {
  ok?: number;
  n?: number;
}

export interface IQueryDeleted {
  deletedCount?: number;
}
