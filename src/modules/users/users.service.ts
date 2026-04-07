import { prisma } from "@server/database/prisma";
import { recalculateUserTrustScore } from "@server/services/trust-score.service";
import { serializeUser } from "@server/services/serializers";

export async function getCurrentProfile(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  return serializeUser(user);
}

export async function updateCurrentProfile(
  userId: string,
  input: { name: string; phone?: string; location?: string; bio?: string; avatar?: string },
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      phone: input.phone || null,
      location: input.location || null,
      bio: input.bio || null,
      avatar: input.avatar || null,
    },
  });

  await recalculateUserTrustScore(user.id);
  return serializeUser(user);
}

export async function createVerificationDocument(input: { userId: string; type: "ID" | "LICENSE" | "PASSPORT" | "ADDRESS"; url: string }) {
  await prisma.verificationDocument.create({
    data: input,
  });
}
