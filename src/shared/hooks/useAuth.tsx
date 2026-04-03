import { useState, useCallback, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { apiClient } from "../configs/axiosConfig";

const TOKEN_KEY = "accessToken";

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
}

interface JwtPayload {
  role: string;
  nameid: string;
  email: string;
  exp: number;
}

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setIsAdmin(decoded.role === 'Administrator');
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);
    }
    setLoading(false);
  }, []);

  // Connexion
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      try {
        setLoading(true);

        const response = await apiClient.post<LoginResponse>("/admin/login/web", {
          email: credentials.email,
          password: credentials.password,
          device_info: "web",
        });

        const { accessToken } = response.data;
        localStorage.setItem(TOKEN_KEY, accessToken);
        setIsLoggedIn(true);

        try {
          const decoded = jwtDecode<JwtPayload>(accessToken);
          setIsAdmin(decoded.role === 'Administrator');
        } catch {
          setIsAdmin(false);
        }

        return true;
      } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Déconnexion
  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiClient.post("/admin/logout");
    } catch {
      // ignore errors — clear local state regardless
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setIsLoggedIn(false);
      window.location.href = "/";
    }
  }, []);

  return {
    login,
    logout,
    isLoggedIn,
    isAdmin,
    loading,
  };
}
