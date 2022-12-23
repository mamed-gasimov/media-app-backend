import { Document, Types } from 'mongoose';

export interface INotificationDocument extends Document {
  _id?: Types.ObjectId | string;
  userTo: string;
  userFrom: string;
  message: string;
  notificationType: string;
  entityId: Types.ObjectId;
  createdItemId: Types.ObjectId;
  comment: string;
  reaction: string;
  post: string;
  imgId: string;
  imgVersion: string;
  gifUrl: string;
  read?: boolean;
  createdAt?: Date;
  insertNotification(data: INotification): Promise<void>;
}

export interface INotification {
  userTo: string;
  userFrom: string;
  message: string;
  notificationType: string;
  entityId: Types.ObjectId;
  createdItemId: Types.ObjectId;
  createdAt: Date;
  comment: string;
  reaction: string;
  post: string;
  imgId: string;
  imgVersion: string;
  gifUrl: string;
}

export interface INotificationJobData {
  key?: string;
}

export interface INotificationTemplate {
  username: string;
  message: string;
  header: string;
}
