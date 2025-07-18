import { Router } from "express";
import { validateRequest } from "../middleware/validation.middleware";
import {
  loginSchema,
  registerSchema,
  updateUserSchema,
} from "../utils/validation.utils";
import { AuthController } from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();
const authController = new AuthController();

router.post(
  "/register",
  validateRequest(registerSchema),
  authController.register
);

router.post("/login", validateRequest(loginSchema), authController.login);

//protected routes
router.get("/me", authenticateToken, authController.getProfile);

router.post("/logout", authenticateToken, authController.logout);

router.put(
  "/update",
  authenticateToken,
  validateRequest(updateUserSchema),
  authController.updateProfile
);

export default router;
