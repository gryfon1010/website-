import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuthPayload } from "@/services/auth";
import { getCurrentUser, login, signup } from "@/services/auth";
import { getStoredToken, setStoredToken, setUnauthorizedHandler } from "@/services/http";
import type { User } from "@shared/contracts";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: AuthPayload) => Promise<void>;
  signup: (payload: AuthPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    enabled: Boolean(token),
    retry: false,
  });

  const saveSession = (nextToken: string | null, nextUser?: User | null) => {
    setToken(nextToken);
    setStoredToken(nextToken);
    if (nextUser) {
      queryClient.setQueryData(["auth", "me"], nextUser);
    } else {
      queryClient.removeQueries({ queryKey: ["auth", "me"] });
    }
  };

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => saveSession(data.token, data.user),
  });

  const signupMutation = useMutation({
    mutationFn: signup,
    onSuccess: (data) => saveSession(data.token, data.user),
  });

  useEffect(() => {
    setUnauthorizedHandler(() => {
      saveSession(null, null);
      queryClient.clear();
    });
    return () => setUnauthorizedHandler(null);
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: userQuery.data ?? null,
      token,
      isAuthenticated: Boolean(token && userQuery.data),
      isLoading: userQuery.isLoading || loginMutation.isPending || signupMutation.isPending,
      login: async (payload) => {
        await loginMutation.mutateAsync(payload);
      },
      signup: async (payload) => {
        await signupMutation.mutateAsync(payload);
      },
      logout: () => {
        saveSession(null, null);
        queryClient.clear();
      },
    }),
    [loginMutation, queryClient, signupMutation, token, userQuery.data, userQuery.isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
