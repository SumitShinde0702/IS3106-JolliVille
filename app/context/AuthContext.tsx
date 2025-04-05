"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, signOut, User } from "../lib/auth";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const { user, error } = await getCurrentUser();
      if (error) throw error;
      setUser(user);
    } catch (err) {
      console.error("Error refreshing user:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      setUser(null);
      router.push("/"); // Redirect to home page after successful logout
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  // 🔐 Delay rendering until user is fetched
  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider
      value={{ user, loading, signOut: handleSignOut, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
