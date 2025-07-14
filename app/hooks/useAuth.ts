import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RootState, AppDispatch } from "@/app/store/store";
import {
  login,
  register,
  logout,
  loadUserFromStorage,
} from "@/app/store/authSlice";
import { LoginCredentials, RegisterCredentials } from "@/app/types/auth";

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, token, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (!user && !token) {
      dispatch(loadUserFromStorage());
    }
  }, [dispatch, user, token]);

  const loginUser = async (credentials: LoginCredentials) => {
    try {
      const result = await dispatch(login(credentials)).unwrap();
      router.push("/dashboard");
      return result;
    } catch (error) {
      throw error;
    }
  };

  const registerUser = async (credentials: RegisterCredentials) => {
    try {
      const result = await dispatch(register(credentials)).unwrap();
      router.push("/dashboard");
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      await dispatch(logout()).unwrap();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/login");
    }
  };

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: !!user && !!token,
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
  };
};
