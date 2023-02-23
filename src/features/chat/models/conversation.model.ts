import { model, Schema } from 'mongoose';

import { IConversationDocument } from '@chat/interfaces/conversation.interface';

const conversationSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: 'User' },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User' },
});

const ConversationModel = model<IConversationDocument>('Conversation', conversationSchema, 'Conversation');
export { ConversationModel };
