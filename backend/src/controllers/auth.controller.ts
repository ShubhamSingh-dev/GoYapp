import { AuthService } from "../services/auth.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { Response } from "express";

export class AuthController {
  private authService = new AuthService();

  register = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { user, token } = await this.authService.register(req.body);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: { user, token },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Registration failed",
      });
    }
  };

 login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { user, token } = await this.authService.login(req.body);

      res.json({
        success: true,
        message: "Login successful",
        data: { user, token },
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || "Login failed",
      });
    }
  };

  getProfile = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const user = await this.authService.getUserById(req.user!.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch profile",
      });
    }
  };

  logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // stateless JWT, logout only on client-side
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  };

  updateProfile = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      // Implementation for profile update
      res.json({
        success: true,
        message: "Profile updated successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update profile",
      });
    }
  };
}
