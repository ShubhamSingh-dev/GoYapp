import Joi from "joi";

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().min(3).max(20).required(),
  password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const createRoomSchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  description: Joi.string().max(200).optional(),
  isPrivate: Joi.boolean().optional(),
  maxUsers: Joi.number().min(2).max(50).optional(),
});

export const updateRoomSchema = Joi.object({
  name: Joi.string().min(1).max(50).optional(),
  description: Joi.string().max(200).optional(),
  isPrivate: Joi.boolean().optional(),
  maxUsers: Joi.number().min(2).max(50).optional(),
});