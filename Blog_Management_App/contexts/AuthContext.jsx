"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginUser } from "@/services/auth.service";
import { getProfile } from "@/services/user.service";
import {
  clearAuthData,
  getStoredUser,
  getToken,
  setAuthCookies,
  setStoredUser,
  setToken,
} from "@/utils/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const existingToken = getToken();
      if (!existingToken) {
        setLoading(false);
        return;
      }

      setTokenState(existingToken);

      const savedUser = getStoredUser();
      if (savedUser) {
        setUser(savedUser);
      }

      try {
        const profile = await getProfile();
        setUser(profile);
        setStoredUser(profile);
        setAuthCookies(existingToken, profile?.role);
      } catch {
        clearAuthData();
        setUser(null);
        setTokenState(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const handleAuthLogout = () => {
      setUser(null);
      setTokenState(null);
    };

    window.addEventListener("auth:logout", handleAuthLogout);
    return () => {
      window.removeEventListener("auth:logout", handleAuthLogout);
    };
  }, []);

  const login = async ({ email, password }) => {
    const response = await loginUser({ email, password });
    const authToken = response?.token;
    const roleFromLogin = response?.data?.role;

    setToken(authToken);
    setTokenState(authToken);
    setAuthCookies(authToken, roleFromLogin);

    const profile = await getProfile();
    setUser(profile);
    setStoredUser(profile);
    setAuthCookies(authToken, profile?.role);
    return profile;
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
    setTokenState(null);
  };

  const refreshProfile = async () => {
    const profile = await getProfile();
    setUser(profile);
    setStoredUser(profile);

    const activeToken = getToken();
    if (activeToken) {
      setAuthCookies(activeToken, profile?.role);
    }
    return profile;
  };

  const updateUserInState = (updatedFields) => {
    setUser((previousUser) => {
      const nextUser = {
        ...previousUser,
        ...updatedFields,
      };
      setStoredUser(nextUser);

      const activeToken = getToken();
      if (activeToken) {
        setAuthCookies(activeToken, nextUser?.role);
      }

      return nextUser;
    });
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      loading,
      login,
      logout,
      refreshProfile,
      updateUserInState,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
