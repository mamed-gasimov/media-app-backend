import { model, Schema } from 'mongoose';

import { IMessageDocument } from '@chat/interfaces/chat.interface';

const messageSchema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
  senderId: { type: Schema.Types.ObjectId, ref: 'User' },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User' },
  senderUsername: { type: String, default: '' },
  senderAvatarColor: { type: String, default: '' },
  senderProfilePicture: { type: String, default: '' },
  receiverUsername: { type: String, default: '' },
  receiverAvatarColor: { type: String, default: '' },
  receiverProfilePicture: { type: String, default: '' },
  body: { type: String, default: '' },
  gifUrl: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  deleteForMe: { type: Boolean, default: false },
  selectedImage: { type: String, default: '' },
  reaction: Array,
  createdAt: { type: Date, default: Date.now },
});

const MessageModel = model<IMessageDocument>('Message', messageSchema, 'Message');
export { MessageModel };
