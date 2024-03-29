import Joi from 'joi';

const userProfileInfoSchema = Joi.object().keys({
  quote: Joi.string().optional().allow(null, ''),
  work: Joi.string().optional().allow(null, ''),
  school: Joi.string().optional().allow(null, ''),
  location: Joi.string().optional().allow(null, ''),
  social: {
    facebook: Joi.string().optional().allow(null, ''),
    instagram: Joi.string().optional().allow(null, ''),
    twitter: Joi.string().optional().allow(null, ''),
    youtube: Joi.string().optional().allow(null, ''),
  },
  notifications: {
    messages: Joi.boolean().optional(),
    reactions: Joi.boolean().optional(),
    comments: Joi.boolean().optional(),
    follows: Joi.boolean().optional(),
  },
});

const changePasswordSchema = Joi.object().keys({
  currentPassword: Joi.string().required().min(8).max(20).messages({
    'string.base': 'Password should be a type of string',
    'string.min': 'Password must have a minimum length of {#limit}',
    'string.max': 'Password should have a maximum length of {#limit}',
    'string.empty': 'Password is a required field',
  }),
  newPassword: Joi.string().required().min(8).max(20).messages({
    'string.base': 'Password should be a type of string',
    'string.min': 'Password must have a minimum length of {#limit}',
    'string.max': 'Password should have a maximum length of {#limit}',
    'string.empty': 'Password is a required field',
  }),
  confirmPassword: Joi.any().equal(Joi.ref('newPassword')).required().messages({
    'any.only': 'Confirm password does not match new password.',
  }),
});

const getUsersSchema = Joi.object().keys({
  page: Joi.number().integer().positive().required(),
  pageSize: Joi.number().integer().positive().required(),
});

export { userProfileInfoSchema, changePasswordSchema, getUsersSchema };
