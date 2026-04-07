import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthContext";
import type { Message, Notification } from "@shared/contracts";

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      setSocket((current) => {
        current?.disconnect();
        return null;
      });
      return;
    }

    const nextSocket = io("/", {
      auth: { token },
      transports: ["websocket"],
    });

    nextSocket.on("notification:new", (_notification: Notification) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    });

    nextSocket.on("message:new", (message: Message) => {
      queryClient.invalidateQueries({ queryKey: ["chat", "messages", message.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    });

    setSocket(nextSocket);
    return () => {
      nextSocket.disconnect();
    };
  }, [queryClient, token]);

  const value = useMemo(() => socket, [socket]);
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
