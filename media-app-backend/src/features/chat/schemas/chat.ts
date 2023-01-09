import Joi from 'joi';

const addChatSchema = Joi.object().keys({
  conversationId: Joi.string().optional().allow(null, ''),
  receiverId: Joi.string().required(),
  body: Joi.string().optional().allow(null, ''),
  gifUrl: Joi.string().optional().allow(null, ''),
  selectedImage: Joi.string().optional().allow(null, ''),
  isRead: Joi.boolean().optional(),
});

const markChatSchema = Joi.object().keys({
  senderId: Joi.string().required(),
  receiverId: Joi.string().required(),
});

const chatUserSchema = Joi.object().keys({
  receiverId: Joi.string().required(),
});

export { addChatSchema, markChatSchema, chatUserSchema };
