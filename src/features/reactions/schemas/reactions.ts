import Joi from 'joi';

const addReactionSchema = Joi.object().keys({
  postId: Joi.string().required().messages({
    'any.required': 'postId is a required property',
  }),
  type: Joi.string().required().valid('like', 'love', 'happy', 'wow', 'sad', 'angry').messages({
    'any.required': 'Reaction type is a required property',
  }),
  profilePicture: Joi.string().optional().allow(null, ''),
  previousReaction: Joi.string()
    .valid('like', 'love', 'happy', 'wow', 'sad', 'angry')
    .optional()
    .allow(null, ''),
});

const removeReactionSchema = Joi.object().keys({
  postId: Joi.string().required().messages({
    'any.required': 'postId is a required property',
  }),
  previousReaction: Joi.string().required().valid('like', 'love', 'happy', 'wow', 'sad', 'angry').messages({
    'any.required': 'previousReaction is a required property',
  }),
});

const singleReactionByUsernameSchema = Joi.object().keys({
  postId: Joi.string().required().messages({
    'any.required': 'postId is a required property',
  }),
  username: Joi.string().required().messages({
    'any.required': 'Username is a required property',
  }),
});

const reactionsByUsernameSchema = Joi.object().keys({
  username: Joi.string().required().messages({
    'any.required': 'Username is a required property',
  }),
});

export { addReactionSchema, removeReactionSchema, singleReactionByUsernameSchema, reactionsByUsernameSchema };
