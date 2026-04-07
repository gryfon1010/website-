import bcrypt from "bcryptjs";
import express from "express";
import multer from "multer";
import fs from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";
import { Server as SocketIOServer } from "socket.io";
import type {
  AuthResponse,
  Booking,
  BookingDetails,
  CheckoutSession,
  ConversationSummary,
  CreateBookingInput,
  CreateListingInput,
  DashboardSummary,
  Listing,
  ListingSummary,
  Message,
  Notification,
  Review,
  UpdateProfileInput,
  User,
} from "@shared/contracts";
import { API_PREFIX, MOCK_STRIPE_PROVIDER } from "@shared/const";
import { requireAuth, signToken, toPublicUser, verifyToken, type AuthenticatedRequest } from "./lib/auth";
import { readDb, updateDb, type PaymentSessionRecord } from "./lib/db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, { cors: { origin: "*" } });
const uploadsDir = path.resolve(process.cwd(), "server", "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "-")}`),
  }),
});

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadsDir));

function daysBetween(startDate: string, endDate: string) {
  return Math.max(
    1,
    Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)),
  );
}

function overlaps(startA: string, endA: string, startB: string, endB: string) {
  return new Date(startA) < new Date(endB) && new Date(endA) > new Date(startB);
}

function pseudoDistance(from: string, to: string) {
  if (from.toLowerCase() === to.toLowerCase()) return 2;
  return Math.abs(Array.from(`${from}:${to}`).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 20) + 3;
}

function getUserOrThrow(userId: string) {
  const user = readDb().users.find((entry) => entry.id === userId);
  if (!user) throw new Error("User not found");
  return user;
}

function getListingSummary(listing: Listing, viewer?: User): ListingSummary {
  const db = readDb();
  const owner = db.users.find((entry) => entry.id === listing.ownerId);
  if (!owner) throw new Error("Owner missing");
  const reviews = db.reviews.filter((review) => review.itemId === listing.id);
  return {
    ...listing,
    owner: {
      id: owner.id,
      name: owner.name,
      avatar: owner.avatar,
      rating: owner.rating,
      reviewCount: owner.reviewCount,
      trustScore: owner.trustScore,
      verificationStatus: owner.verificationStatus,
    },
    rating: reviews.length
      ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1))
      : owner.rating,
    reviewCount: reviews.length,
    distanceKm: viewer ? pseudoDistance(viewer.location, listing.location) : 4,
  };
}

function getBookingDetails(booking: Booking, viewer?: User): BookingDetails {
  const db = readDb();
  const item = db.listings.find((entry) => entry.id === booking.itemId);
  const owner = db.users.find((entry) => entry.id === booking.ownerId);
  const renter = db.users.find((entry) => entry.id === booking.renterId);
  if (!item || !owner || !renter) throw new Error("Booking relations missing");
  return {
    ...booking,
    item: getListingSummary(item, viewer),
    owner: {
      id: owner.id,
      name: owner.name,
      avatar: owner.avatar,
      rating: owner.rating,
      reviewCount: owner.reviewCount,
      verificationStatus: owner.verificationStatus,
    },
    renter: {
      id: renter.id,
      name: renter.name,
      avatar: renter.avatar,
    },
  };
}

function getConversationSummaries(userId: string): ConversationSummary[] {
  const db = readDb();
  return db.conversations
    .filter((conversation) => conversation.participantIds.includes(userId))
    .map((conversation) => {
      const item = db.listings.find((entry) => entry.id === conversation.itemId);
      if (!item) throw new Error("Conversation item missing");
      const receipt = db.conversationReads.find(
        (entry) => entry.userId === userId && entry.conversationId === conversation.id,
      );
      const messages = db.messages
        .filter((message) => message.conversationId === conversation.id)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      return {
        id: conversation.id,
        itemId: conversation.itemId,
        itemTitle: item.title,
        itemImage: item.images[0] ?? "",
        participants: conversation.participantIds
          .filter((participantId) => participantId !== userId)
          .map((participantId) => {
            const participant = getUserOrThrow(participantId);
            return { id: participant.id, name: participant.name, avatar: participant.avatar };
          }),
        lastMessage: messages.at(-1),
        unreadCount: messages.filter(
          (message) =>
            message.senderId !== userId && (!receipt || new Date(message.createdAt) > new Date(receipt.lastReadAt)),
        ).length,
        updatedAt: conversation.updatedAt,
      };
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function createNotification(userId: string, input: Omit<Notification, "id" | "userId" | "read" | "createdAt">) {
  const notification: Notification = {
    id: nanoid(),
    userId,
    read: false,
    createdAt: new Date().toISOString(),
    ...input,
  };
  updateDb((db) => {
    db.notifications.unshift(notification);
  });
  io.to(`user:${userId}`).emit("notification:new", notification);
  return notification;
}

function markConversationRead(userId: string, conversationId: string) {
  updateDb((db) => {
    const existing = db.conversationReads.find(
      (entry) => entry.userId === userId && entry.conversationId === conversationId,
    );
    if (existing) {
      existing.lastReadAt = new Date().toISOString();
      return;
    }
    db.conversationReads.push({
      conversationId,
      userId,
      lastReadAt: new Date().toISOString(),
    });
  });
}

function buildDashboard(user: User): DashboardSummary {
  const db = readDb();
  const listings = db.listings.filter((listing) => listing.ownerId === user.id).map((listing) => getListingSummary(listing, user));
  const bookings = db.bookings
    .filter((booking) => booking.ownerId === user.id || booking.renterId === user.id)
    .map((booking) => getBookingDetails(booking, user));
  const conversations = getConversationSummaries(user.id);

  return {
    stats: {
      totalEarnings: bookings
        .filter((booking) => booking.ownerId === user.id && booking.paymentStatus === "paid")
        .reduce((sum, booking) => sum + booking.totalPrice, 0),
      activeListings: listings.filter((listing) => listing.isActive).length,
      totalBookings: bookings.length,
      unreadMessages: conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0),
    },
    listings,
    bookings,
    conversations,
    notifications: db.notifications
      .filter((notification) => notification.userId === user.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 10),
  };
}

const api = express.Router();

api.post("/auth/signup", (req, res) => {
  const { email, password, name } = req.body as { email?: string; password?: string; name?: string };
  if (!email || !password || !name) {
    res.status(400).json({ message: "Name, email, and password are required." });
    return;
  }
  const normalizedEmail = email.trim().toLowerCase();
  const auth = updateDb<AuthResponse | null>((db) => {
    if (db.users.some((user) => user.email === normalizedEmail)) return null;
    const user = {
      id: nanoid(),
      email: normalizedEmail,
      name: name.trim(),
      phone: "",
      location: "London",
      bio: "",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      verificationStatus: "pending" as const,
      rating: 5,
      reviewCount: 0,
      trustScore: 80,
      joinedAt: new Date().toISOString(),
      role: "renter" as const,
      passwordHash: bcrypt.hashSync(password, 10),
    };
    db.users.push(user);
    return { token: signToken(user.id), user: toPublicUser(user) };
  });

  if (!auth) {
    res.status(409).json({ message: "Email is already registered." });
    return;
  }

  res.status(201).json(auth);
});

api.post("/auth/login", (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  const user = readDb().users.find((entry) => entry.email === email?.trim().toLowerCase());
  if (!user || !password || !bcrypt.compareSync(password, user.passwordHash)) {
    res.status(401).json({ message: "Invalid credentials." });
    return;
  }
  res.json({ token: signToken(user.id), user: toPublicUser(user) } satisfies AuthResponse);
});

api.get("/auth/me", requireAuth, (req: AuthenticatedRequest, res) => {
  res.json(toPublicUser(req.user!));
});

api.get("/items", (req, res) => {
  const db = readDb();
  const query = req.query as Record<string, string | undefined>;
  const token = req.headers.authorization?.replace("Bearer ", "");
  let viewer: User | undefined;
  if (token) {
    try {
      const payload = verifyToken(token);
      const user = db.users.find((entry) => entry.id === payload.sub);
      viewer = user ? toPublicUser(user) : undefined;
    } catch {
      viewer = undefined;
    }
  }

  let listings = db.listings.filter((listing) => listing.isActive);
  if (query.q) {
    const q = query.q.toLowerCase();
    listings = listings.filter(
      (listing) =>
        listing.title.toLowerCase().includes(q) ||
        listing.description.toLowerCase().includes(q) ||
        listing.category.toLowerCase().includes(q),
    );
  }
  if (query.category) {
    listings = listings.filter((listing) => listing.category === query.category);
  }
  if (query.location) {
    listings = listings.filter((listing) =>
      listing.location.toLowerCase().includes((query.location ?? "").toLowerCase()),
    );
  }
  if (query.minPrice) {
    listings = listings.filter((listing) => listing.pricePerDay >= Number(query.minPrice));
  }
  if (query.maxPrice) {
    listings = listings.filter((listing) => listing.pricePerDay <= Number(query.maxPrice));
  }
  if (query.verifiedOnly === "true") {
    listings = listings.filter((listing) => getUserOrThrow(listing.ownerId).verificationStatus === "verified");
  }
  if (query.startDate && query.endDate) {
    listings = listings.filter(
      (listing) =>
        !db.bookings.some(
          (booking) =>
            booking.itemId === listing.id &&
            booking.status !== "cancelled" &&
            overlaps(query.startDate!, query.endDate!, booking.startDate, booking.endDate),
        ),
    );
  }

  res.json(listings.map((listing) => getListingSummary(listing, viewer)));
});

api.get("/items/:id", (req, res) => {
  const db = readDb();
  const listing = db.listings.find((entry) => entry.id === req.params.id);
  if (!listing) {
    res.status(404).json({ message: "Listing not found." });
    return;
  }
  const owner = db.users.find((entry) => entry.id === listing.ownerId);
  if (!owner) {
    res.status(404).json({ message: "Owner not found." });
    return;
  }
  const reviews = db.reviews
    .filter((review) => review.itemId === listing.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((review) => ({ ...review, author: toPublicUser(getUserOrThrow(review.authorId)) }));

  res.json({
    ...getListingSummary(listing),
    owner: toPublicUser(owner),
    reviews,
  });
});

api.post("/uploads", requireAuth, upload.array("files", 10), (req, res) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  res.status(201).json({
    files: files.map((file) => ({
      name: file.originalname,
      url: `/uploads/${file.filename}`,
    })),
  });
});

api.post("/items", requireAuth, (req: AuthenticatedRequest, res) => {
  const input = req.body as CreateListingInput;
  if (!input.title || !input.category || !input.description || !input.location || Number(input.pricePerDay) <= 0) {
    res.status(400).json({ message: "Missing required listing fields." });
    return;
  }

  const listing = updateDb<Listing>((db) => {
    const now = new Date().toISOString();
    const next: Listing = {
      id: nanoid(),
      ownerId: req.user!.id,
      title: input.title.trim(),
      category: input.category,
      description: input.description.trim(),
      pricePerDay: Number(input.pricePerDay),
      location: input.location.trim(),
      images: input.images,
      features: input.features,
      insuranceEnabled: input.insuranceEnabled,
      cancellationPolicy: input.cancellationPolicy,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    db.listings.unshift(next);
    return next;
  });

  createNotification(req.user!.id, {
    type: "listing",
    title: "Listing published",
    body: `${listing.title} is now live on RentConnect.`,
    href: "/dashboard?tab=listings",
  });

  res.status(201).json(getListingSummary(listing, toPublicUser(req.user!)));
});

api.put("/items/:id", requireAuth, (req: AuthenticatedRequest, res) => {
  const input = req.body as CreateListingInput & { isActive?: boolean };
  const listing = updateDb<Listing | null>((db) => {
    const entry = db.listings.find((record) => record.id === req.params.id && record.ownerId === req.user!.id);
    if (!entry) return null;
    entry.title = input.title;
    entry.category = input.category;
    entry.description = input.description;
    entry.pricePerDay = Number(input.pricePerDay);
    entry.location = input.location;
    entry.images = input.images;
    entry.features = input.features;
    entry.insuranceEnabled = input.insuranceEnabled;
    entry.cancellationPolicy = input.cancellationPolicy;
    entry.isActive = input.isActive ?? entry.isActive;
    entry.updatedAt = new Date().toISOString();
    return entry;
  });

  if (!listing) {
    res.status(404).json({ message: "Listing not found." });
    return;
  }

  res.json(getListingSummary(listing, toPublicUser(req.user!)));
});

api.delete("/items/:id", requireAuth, (req: AuthenticatedRequest, res) => {
  const removed = updateDb<boolean>((db) => {
    const index = db.listings.findIndex((entry) => entry.id === req.params.id && entry.ownerId === req.user!.id);
    if (index === -1) return false;
    db.listings.splice(index, 1);
    return true;
  });

  if (!removed) {
    res.status(404).json({ message: "Listing not found." });
    return;
  }
  res.status(204).send();
});

api.post("/bookings", requireAuth, (req: AuthenticatedRequest, res) => {
  const input = req.body as CreateBookingInput;
  const db = readDb();
  const listing = db.listings.find((entry) => entry.id === input.itemId);
  if (!listing) {
    res.status(404).json({ message: "Listing not found." });
    return;
  }
  if (listing.ownerId === req.user!.id) {
    res.status(400).json({ message: "You cannot book your own listing." });
    return;
  }
  if (
    db.bookings.some(
      (booking) =>
        booking.itemId === listing.id &&
        booking.status !== "cancelled" &&
        overlaps(input.startDate, input.endDate, booking.startDate, booking.endDate),
    )
  ) {
    res.status(409).json({ message: "Listing is not available for those dates." });
    return;
  }

  const dayCount = daysBetween(input.startDate, input.endDate);
  const subtotal = dayCount * listing.pricePerDay * input.quantity;
  const serviceFee = Math.round(subtotal * 0.08);
  const damageWaiver = listing.insuranceEnabled ? dayCount * 5 : 0;

  const booking = updateDb<Booking>((mutableDb) => {
    const next: Booking = {
      id: nanoid(),
      itemId: listing.id,
      ownerId: listing.ownerId,
      renterId: req.user!.id,
      startDate: input.startDate,
      endDate: input.endDate,
      quantity: input.quantity,
      dayCount,
      subtotal,
      serviceFee,
      damageWaiver,
      totalPrice: subtotal + serviceFee + damageWaiver,
      status: "pending",
      paymentStatus: "pending",
      createdAt: new Date().toISOString(),
    };
    mutableDb.bookings.unshift(next);
    return next;
  });

  createNotification(listing.ownerId, {
    type: "booking",
    title: "New booking request",
    body: `${req.user!.name} requested ${listing.title}.`,
    href: "/dashboard?tab=bookings",
  });

  res.status(201).json(getBookingDetails(booking, toPublicUser(req.user!)));
});

api.get("/bookings/me", requireAuth, (req: AuthenticatedRequest, res) => {
  res.json(
    readDb().bookings
      .filter((booking) => booking.renterId === req.user!.id)
      .map((booking) => getBookingDetails(booking, toPublicUser(req.user!))),
  );
});

api.get("/bookings/owner", requireAuth, (req: AuthenticatedRequest, res) => {
  res.json(
    readDb().bookings
      .filter((booking) => booking.ownerId === req.user!.id)
      .map((booking) => getBookingDetails(booking, toPublicUser(req.user!))),
  );
});

api.get("/bookings/:id", requireAuth, (req: AuthenticatedRequest, res) => {
  const booking = readDb().bookings.find((entry) => entry.id === req.params.id);
  if (!booking || (booking.ownerId !== req.user!.id && booking.renterId !== req.user!.id)) {
    res.status(404).json({ message: "Booking not found." });
    return;
  }
  res.json(getBookingDetails(booking, toPublicUser(req.user!)));
});

api.post("/payments/checkout", requireAuth, (req: AuthenticatedRequest, res) => {
  const { bookingId } = req.body as { bookingId?: string };
  const booking = readDb().bookings.find((entry) => entry.id === bookingId && entry.renterId === req.user!.id);
  if (!booking) {
    res.status(404).json({ message: "Booking not found." });
    return;
  }

  const session = updateDb<PaymentSessionRecord>((db) => {
    const next: PaymentSessionRecord = {
      id: nanoid(),
      bookingId: booking.id,
      provider: MOCK_STRIPE_PROVIDER,
      checkoutUrl: `/checkout/success?sessionId=${encodeURIComponent(nanoid())}&bookingId=${booking.id}`,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    db.paymentSessions.unshift(next);
    return next;
  });

  res.status(201).json({
    provider: session.provider,
    bookingId: session.bookingId,
    sessionId: session.id,
    checkoutUrl: session.checkoutUrl,
  } satisfies CheckoutSession);
});

api.post("/payments/session/:id/confirm", requireAuth, (req: AuthenticatedRequest, res) => {
  const session = updateDb<PaymentSessionRecord | null>((db) => {
    const entry = db.paymentSessions.find((record) => record.id === req.params.id);
    if (!entry) return null;
    entry.status = "paid";
    const booking = db.bookings.find((record) => record.id === entry.bookingId);
    if (booking) {
      booking.paymentStatus = "paid";
      booking.status = "confirmed";
    }
    return entry;
  });

  if (!session) {
    res.status(404).json({ message: "Checkout session not found." });
    return;
  }

  const booking = readDb().bookings.find((entry) => entry.id === session.bookingId);
  if (booking) {
    createNotification(booking.ownerId, {
      type: "payment",
      title: "Booking paid",
      body: "A booking has been paid and confirmed.",
      href: `/bookings/${booking.id}/confirmation`,
    });
  }

  res.json({ success: true });
});

api.post("/reviews", requireAuth, (req: AuthenticatedRequest, res) => {
  const { bookingId, rating, comment } = req.body as { bookingId?: string; rating?: number; comment?: string };
  const booking = readDb().bookings.find((entry) => entry.id === bookingId && entry.renterId === req.user!.id);
  if (!booking) {
    res.status(404).json({ message: "Booking not found." });
    return;
  }
  const review = updateDb<Review>((db) => {
    const next: Review = {
      id: nanoid(),
      itemId: booking.itemId,
      bookingId: booking.id,
      authorId: req.user!.id,
      targetUserId: booking.ownerId,
      rating: Math.max(1, Math.min(5, Number(rating ?? 5))),
      comment: comment?.trim() ?? "",
      createdAt: new Date().toISOString(),
    };
    db.reviews.unshift(next);
    return next;
  });
  res.status(201).json(review);
});

api.get("/dashboard/summary", requireAuth, (req: AuthenticatedRequest, res) => {
  res.json(buildDashboard(toPublicUser(req.user!)));
});

api.get("/chat/conversations", requireAuth, (req: AuthenticatedRequest, res) => {
  res.json(getConversationSummaries(req.user!.id));
});

api.post("/chat/conversations", requireAuth, (req: AuthenticatedRequest, res) => {
  const { itemId } = req.body as { itemId?: string };
  const listing = readDb().listings.find((entry) => entry.id === itemId);
  if (!listing) {
    res.status(404).json({ message: "Listing not found." });
    return;
  }

  const participantIds = [req.user!.id, listing.ownerId].sort();
  const conversation = updateDb((db) => {
    const existing = db.conversations.find(
      (entry) =>
        entry.itemId === itemId &&
        entry.participantIds.length === participantIds.length &&
        entry.participantIds.every((participantId, index) => participantId === participantIds[index]),
    );
    if (existing) return existing;
    const next = {
      id: nanoid(),
      itemId: itemId!,
      participantIds,
      updatedAt: new Date().toISOString(),
    };
    db.conversations.unshift(next);
    return next;
  });

  res.status(201).json(conversation);
});

api.get("/chat/conversations/:id/messages", requireAuth, (req: AuthenticatedRequest, res) => {
  const conversation = readDb().conversations.find((entry) => entry.id === req.params.id);
  if (!conversation || !conversation.participantIds.includes(req.user!.id)) {
    res.status(404).json({ message: "Conversation not found." });
    return;
  }
  markConversationRead(req.user!.id, conversation.id);
  res.json(
    readDb().messages
      .filter((message) => message.conversationId === conversation.id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  );
});

api.post("/chat/conversations/:id/messages", requireAuth, (req: AuthenticatedRequest, res) => {
  const { content } = req.body as { content?: string };
  if (!content?.trim()) {
    res.status(400).json({ message: "Message content is required." });
    return;
  }

  const conversation = readDb().conversations.find((entry) => entry.id === req.params.id);
  if (!conversation || !conversation.participantIds.includes(req.user!.id)) {
    res.status(404).json({ message: "Conversation not found." });
    return;
  }

  const message = updateDb<Message>((db) => {
    const next: Message = {
      id: nanoid(),
      conversationId: conversation.id,
      senderId: req.user!.id,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    db.messages.push(next);
    const mutableConversation = db.conversations.find((entry) => entry.id === conversation.id)!;
    mutableConversation.updatedAt = next.createdAt;
    return next;
  });

  conversation.participantIds
    .filter((participantId) => participantId !== req.user!.id)
    .forEach((participantId) => {
      createNotification(participantId, {
        type: "message",
        title: "New message",
        body: `${req.user!.name}: ${message.content}`,
        href: `/dashboard?tab=messages&conversationId=${conversation.id}`,
      });
    });

  io.to(`conversation:${conversation.id}`).emit("message:new", message);
  res.status(201).json(message);
});

api.post("/chat/conversations/:id/read", requireAuth, (req: AuthenticatedRequest, res) => {
  markConversationRead(req.user!.id, req.params.id);
  res.json({ success: true });
});

api.get("/notifications", requireAuth, (req: AuthenticatedRequest, res) => {
  res.json(
    readDb().notifications
      .filter((notification) => notification.userId === req.user!.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
});

api.post("/notifications/:id/read", requireAuth, (req: AuthenticatedRequest, res) => {
  const notification = updateDb<Notification | null>((db) => {
    const entry = db.notifications.find((record) => record.id === req.params.id && record.userId === req.user!.id);
    if (!entry) return null;
    entry.read = true;
    return entry;
  });
  if (!notification) {
    res.status(404).json({ message: "Notification not found." });
    return;
  }
  res.json(notification);
});

api.get("/profile", requireAuth, (req: AuthenticatedRequest, res) => {
  res.json(toPublicUser(req.user!));
});

api.put("/profile", requireAuth, (req: AuthenticatedRequest, res) => {
  const input = req.body as UpdateProfileInput;
  const user = updateDb<User | null>((db) => {
    const entry = db.users.find((record) => record.id === req.user!.id);
    if (!entry) return null;
    entry.name = input.name.trim();
    entry.phone = input.phone.trim();
    entry.location = input.location.trim();
    entry.bio = input.bio.trim();
    entry.avatar = input.avatar.trim() || entry.avatar;
    return toPublicUser(entry);
  });

  if (!user) {
    res.status(404).json({ message: "Profile not found." });
    return;
  }

  res.json(user);
});

// ==================== DISPUTE MODULE ====================

api.post("/disputes", requireAuth, (req: AuthenticatedRequest, res) => {
  const { bookingId, title, description, evidenceUrls = [] } = req.body as {
    bookingId: string;
    title: string;
    description: string;
    evidenceUrls?: string[];
  };

  const userId = req.user!.id;
  const db = readDb();

  // Get booking and verify user is involved
  const booking = db.bookings.find((b) => b.id === bookingId);
  if (!booking) {
    res.status(404).json({ message: "Booking not found." });
    return;
  }

  if (booking.renterId !== userId && booking.ownerId !== userId) {
    res.status(403).json({ message: "You can only raise disputes for your own bookings." });
    return;
  }

  if (booking.status === "cancelled") {
    res.status(400).json({ message: "Cannot dispute a cancelled booking." });
    return;
  }

  // Check if dispute already exists
  const existingDispute = db.disputes.find((d) => d.bookingId === bookingId);
  if (existingDispute) {
    res.status(409).json({ message: "A dispute already exists for this booking." });
    return;
  }

  // Create dispute
  const dispute = updateDb((mutableDb) => {
    const newDispute = {
      id: nanoid(),
      bookingId,
      itemId: booking.itemId,
      openedById: userId,
      renterId: booking.renterId,
      ownerId: booking.ownerId,
      title,
      description,
      evidenceUrls,
      status: "OPEN" as const,
      resolution: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mutableDb.disputes.unshift(newDispute);
    return newDispute;
  });

  // Notify other party
  const otherPartyId = booking.renterId === userId ? booking.ownerId : booking.renterId;
  createNotification(otherPartyId, {
    type: "dispute",
    title: "Dispute Raised",
    body: `A dispute has been raised for booking: ${booking.itemId}`,
    href: `/disputes/${dispute.id}`,
  });

  res.status(201).json(dispute);
});

api.get("/disputes", requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const db = readDb();

  const disputes = db.disputes
    .filter(
      (d) =>
        d.renterId === userId ||
        d.ownerId === userId ||
        d.openedById === userId,
    )
    .map((dispute) => {
      const item = db.listings.find((l) => l.id === dispute.itemId);
      const booking = db.bookings.find((b) => b.id === dispute.bookingId);
      const openedBy = db.users.find((u) => u.id === dispute.openedById);
      return {
        ...dispute,
        item: item ? { id: item.id, title: item.title } : undefined,
        booking: booking ? { id: booking.id, status: booking.status } : undefined,
        openedBy: openedBy ? { id: openedBy.id, name: openedBy.name, avatar: openedBy.avatar } : undefined,
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  res.json(disputes);
});

api.get("/disputes/:id", requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const db = readDb();

  const dispute = db.disputes.find((d) => d.id === id);
  if (!dispute) {
    res.status(404).json({ message: "Dispute not found." });
    return;
  }

  // Verify user has access
  if (
    dispute.renterId !== userId &&
    dispute.ownerId !== userId &&
    dispute.openedById !== userId
  ) {
    res.status(403).json({ message: "Access denied." });
    return;
  }

  const item = db.listings.find((l) => l.id === dispute.itemId);
  const booking = db.bookings.find((b) => b.id === dispute.bookingId);
  const openedBy = db.users.find((u) => u.id === dispute.openedById);
  const renter = db.users.find((u) => u.id === dispute.renterId);
  const owner = db.users.find((u) => u.id === dispute.ownerId);

  res.json({
    ...dispute,
    item: item ? { id: item.id, title: item.title } : undefined,
    booking: booking ? { id: booking.id, status: booking.status } : undefined,
    openedBy: openedBy ? { id: openedBy.id, name: openedBy.name, avatar: openedBy.avatar } : undefined,
    renter: renter ? { id: renter.id, name: renter.name, avatar: renter.avatar, trustScore: renter.trustScore } : undefined,
    owner: owner ? { id: owner.id, name: owner.name, avatar: owner.avatar, trustScore: owner.trustScore } : undefined,
  });
});

api.patch("/disputes/:id", requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { status, resolution } = req.body as { status?: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "CLOSED"; resolution?: string };
  const userId = req.user!.id;
  const db = readDb();

  const disputeIndex = db.disputes.findIndex((d) => d.id === id);
  if (disputeIndex === -1) {
    res.status(404).json({ message: "Dispute not found." });
    return;
  }

  const dispute = db.disputes[disputeIndex];

  // Only parties involved or admins can update
  const isAdmin = req.user!.role === "admin";
  const isInvolved = dispute.renterId === userId || dispute.ownerId === userId;

  if (!isAdmin && !isInvolved) {
    res.status(403).json({ message: "Access denied." });
    return;
  }

  // Update dispute
  updateDb((mutableDb) => {
    const mutableDispute = mutableDb.disputes[disputeIndex];
    if (status) mutableDispute.status = status;
    if (resolution) mutableDispute.resolution = resolution;
    mutableDispute.updatedAt = new Date().toISOString();
    return mutableDispute;
  });

  // If resolved, update booking status
  if (status === "RESOLVED" && resolution) {
    updateDb((mutableDb) => {
      const bookingIndex = mutableDb.bookings.findIndex((b) => b.id === dispute.bookingId);
      if (bookingIndex !== -1) {
        mutableDb.bookings[bookingIndex].status = "cancelled";
      }
    });

    // Notify both parties
    createNotification(dispute.renterId, {
      type: "dispute",
      title: "Dispute Resolved",
      body: `Your dispute has been resolved: ${resolution}`,
      href: `/disputes/${id}`,
    });

    createNotification(dispute.ownerId, {
      type: "dispute",
      title: "Dispute Resolved",
      body: `Your dispute has been resolved: ${resolution}`,
      href: `/disputes/${id}`,
    });
  }

  const updatedDispute = db.disputes[disputeIndex];
  res.json(updatedDispute);
});

api.post("/disputes/:id/evidence", requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { url } = req.body as { url: string };
  const userId = req.user!.id;
  const db = readDb();

  if (!url) {
    res.status(400).json({ message: "Evidence URL is required." });
    return;
  }

  const disputeIndex = db.disputes.findIndex((d) => d.id === id);
  if (disputeIndex === -1) {
    res.status(404).json({ message: "Dispute not found." });
    return;
  }

  const dispute = db.disputes[disputeIndex];

  // Verify user is involved
  if (dispute.renterId !== userId && dispute.ownerId !== userId) {
    res.status(403).json({ message: "Access denied." });
    return;
  }

  // Add evidence
  updateDb((mutableDb) => {
    const mutableDispute = mutableDb.disputes[disputeIndex];
    mutableDispute.evidenceUrls.push(url);
    mutableDispute.updatedAt = new Date().toISOString();
    return mutableDispute;
  });

  res.json(db.disputes[disputeIndex]);
});

app.use(API_PREFIX, api);

io.use((socket, next) => {
  const token = socket.handshake.auth.token as string | undefined;
  if (!token) {
    next(new Error("Unauthorized"));
    return;
  }
  try {
    const payload = verifyToken(token);
    socket.data.userId = payload.sub;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.data.userId as string;
  socket.join(`user:${userId}`);
  readDb()
    .conversations.filter((conversation) => conversation.participantIds.includes(userId))
    .forEach((conversation) => socket.join(`conversation:${conversation.id}`));

  socket.on("conversation:join", (conversationId: string) => {
    socket.join(`conversation:${conversationId}`);
  });
});

if (process.env.NODE_ENV === "production") {
  const staticPath = path.resolve(__dirname, "public");
  app.use(express.static(staticPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
}

const port = Number(process.env.PORT ?? 4000);
server.listen(port, () => {
  console.log(`RentConnect API running on http://localhost:${port}`);
});
