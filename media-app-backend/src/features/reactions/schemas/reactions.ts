import Joi from 'joi';

const addReactionSchema = Joi.object().keys({
  userTo: Joi.string().required().messages({
    'any.required': 'userTo is a required property',
  }),
  postId: Joi.string().required().messages({
    'any.required': 'postId is a required property',
  }),
  type: Joi.string().required().valid('like', 'love', 'happy', 'wow', 'sad', 'angry').messages({
    'any.required': 'Reaction type is a required property',
  }),
  profilePicture: Joi.string().optional().allow(null, ''),
  previousReaction: Joi.string().valid('like', 'love', 'happy', 'wow', 'sad', 'angry').optional().allow(null, ''),
  postReactions: Joi.object({
    like: Joi.number().required(),
    love: Joi.number().required(),
    happy: Joi.number().required(),
    wow: Joi.number().required(),
    sad: Joi.number().required(),
    angry: Joi.number().required(),
  }).required(),
});

const removeReactionSchema = Joi.object().keys({
  postId: Joi.string().required().messages({
    'any.required': 'postId is a required property',
  }),
  previousReaction: Joi.string().required().valid('like', 'love', 'happy', 'wow', 'sad', 'angry').messages({
    'any.required': 'previousReaction is a required property',
  }),
  postReactions: Joi.object({
    like: Joi.number().required(),
    love: Joi.number().required(),
    happy: Joi.number().required(),
    wow: Joi.number().required(),
    sad: Joi.number().required(),
    angry: Joi.number().required(),
  }).required(),
});

export { addReactionSchema, removeReactionSchema };
