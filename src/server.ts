import { createServer } from "node:http";
import { createApp } from "@server/app";
import { env } from "@server/config/env";
import { logger } from "@server/utils/logger";
import { prisma } from "@server/database/prisma";
import { startQueueWorkers } from "@server/queues";
import { createSocketServer } from "@server/sockets";

const app = createApp();
const server = createServer(app);
export const io = createSocketServer(server);

async function bootstrap() {
  await prisma.$connect();
  startQueueWorkers();

  server.listen(env.PORT, () => {
    logger.info(`Backend listening on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch(async (error) => {
  logger.error("Failed to start backend", error);
  await prisma.$disconnect();
  process.exit(1);
});
