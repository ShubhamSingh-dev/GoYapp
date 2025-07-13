import api from "./api";
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from "../types/auth";

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post("/auth/register", credentials);
    return response.data;
  },

  async getProfile(): Promise<AuthResponse> {
    const response = await api.get("/auth/me");
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },
};
