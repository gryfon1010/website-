import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "@server/config/env";
import { prisma } from "@server/database/prisma";

let ioInstance: Server | null = null;

export function createSocketServer(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) {
      next(new Error("Unauthorized"));
      return;
    }

    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string };
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) {
        next(new Error("Unauthorized"));
        return;
      }
      socket.data.userId = user.id;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.data.userId as string;
    socket.join(`user:${userId}`);

    const memberships = await prisma.conversationParticipant.findMany({
      where: { userId },
      select: { conversationId: true },
    });
    memberships.forEach((membership) => socket.join(`conversation:${membership.conversationId}`));

    socket.on("conversation:join", (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });
  });

  ioInstance = io;
  return io;
}

export function getIo() {
  if (!ioInstance) {
    throw new Error("Socket server has not been created.");
  }
  return ioInstance;
}
