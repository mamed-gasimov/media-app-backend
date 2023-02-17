import Joi from 'joi';

const addCommentSchema = Joi.object().keys({
  postId: Joi.string().required().messages({
    'any.required': 'postId is a required property',
  }),
  comment: Joi.string().required().messages({
    'any.required': 'comment is a required property',
  }),
  profilePicture: Joi.string().optional().allow(null, ''),
});

export { addCommentSchema };
