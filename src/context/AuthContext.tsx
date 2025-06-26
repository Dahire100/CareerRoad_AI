"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

type User = {
  name: string;
  email: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string) => void;
  signup: (name: string, email: string) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // In a real app, you'd check a token here from localStorage or a cookie.
    // For this prototype, we just finish loading and assume logged out.
    setLoading(false);
  }, []);

  const login = (email: string) => {
    setLoading(true);
    // In a real app, you'd verify credentials here
    setUser({ name: "Demo User", email });
    router.push("/dashboard");
    setLoading(false);
  };

  const signup = (name: string, email: string) => {
    setLoading(true);
    // In a real app, you'd create a new user account here
    setUser({ name, email });
    router.push("/dashboard");
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    router.push("/");
  };

  const updateUser = (updatedUser: Partial<User>) => {
    setUser((prevUser) => {
      if (prevUser) {
        return { ...prevUser, ...updatedUser };
      }
      return null;
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
