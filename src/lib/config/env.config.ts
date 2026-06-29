import Joi from "joi";

export const envValidationSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  ARCJET_KEY: Joi.string().required(),
  BETTER_AUTH_SECRET: Joi.string().required(),
  BETTER_AUTH_URL: Joi.string().uri().optional(),
  PORT: Joi.number().port().default(8080),
});
