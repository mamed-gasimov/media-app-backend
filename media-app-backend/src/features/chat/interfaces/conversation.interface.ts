import { Document, Types } from 'mongoose';

export interface IConversationDocument extends Document {
  _id: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
}
