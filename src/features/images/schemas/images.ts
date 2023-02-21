import Joi from 'joi';

const addImageSchema = Joi.object().keys({
  image: Joi.string().required(),
});

export { addImageSchema };
