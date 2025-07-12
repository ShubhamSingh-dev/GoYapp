import jwt, { SignOptions } from "jsonwebtoken";
import { User } from "@prisma/client";

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
}

export const generateToken = (user: User) => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
  };

  const secret = process.env.JWT_SECRET;
  const expiresIn = (process.env.JWT_EXPIRES_IN ||
    "7d") as SignOptions["expiresIn"];

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const options: SignOptions = {
    expiresIn,
  };
  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

export const extractTokenFromHeader = (authHeader: string): string | null => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
};
