import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { extractTokenFromHeader, verifyToken } from "../utils/jwt.utils";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    username: string;
  };
}

const authService = new AuthService();

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader || "");

    if (!token) {
      res.status(401).json({ error: "Access token required" });
      return;
    }

    const payload = verifyToken(token);

    //verify user still exists in db
    const user = await authService.getUserById(payload.userId);
    if (!user) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
