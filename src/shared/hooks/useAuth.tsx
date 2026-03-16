import { useState, useCallback, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { apiClient } from "../configs/axiosConfig";

const TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
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
  const [loading, setLoading] = useState<boolean>(false);


  // Vérifier si l'utilisateur est connecté au chargement
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
  }, []);

  // Connexion
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      try {
        setLoading(true);

        const response = await apiClient.post<LoginResponse>("/admin/login", {
          email: credentials.email,
          password: credentials.password,
          device_info: "web",
        });

        const { accessToken, refreshToken } = response.data;

        // Stocker les tokens
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        setIsLoggedIn(true);
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
  const logout = useCallback((): void => {
    // Supprimer les tokens
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.location.href = "/"
    setIsLoggedIn(false);
  }, []);

  return {
    login,
    logout,
    isLoggedIn,
    isAdmin,
    loading,
  };
}
