import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import type {
  Booking,
  Conversation,
  Listing,
  Message,
  Notification,
  Review,
  UserRecord,
} from "@shared/contracts";

export interface ConversationReadReceipt {
  conversationId: string;
  userId: string;
  lastReadAt: string;
}

export interface PaymentSessionRecord {
  id: string;
  bookingId: string;
  provider: "mock" | "stripe";
  checkoutUrl: string;
  publishableKey?: string;
  status: "pending" | "paid" | "failed" | "cancelled";
  createdAt: string;
}

export interface Database {
  users: UserRecord[];
  listings: Listing[];
  bookings: Booking[];
  reviews: Review[];
  conversations: Conversation[];
  messages: Message[];
  notifications: Notification[];
  conversationReads: ConversationReadReceipt[];
  paymentSessions: PaymentSessionRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), "server", "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

function now() {
  return new Date().toISOString();
}

function makeUser(seed: Partial<UserRecord> & Pick<UserRecord, "email" | "name" | "location">): UserRecord {
  return {
    id: seed.id ?? nanoid(),
    email: seed.email,
    name: seed.name,
    phone: seed.phone ?? "",
    location: seed.location,
    bio: seed.bio ?? "",
    avatar:
      seed.avatar ??
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    verificationStatus: seed.verificationStatus ?? "verified",
    rating: seed.rating ?? 4.8,
    reviewCount: seed.reviewCount ?? 0,
    trustScore: seed.trustScore ?? 92,
    joinedAt: seed.joinedAt ?? now(),
    role: seed.role ?? "renter",
    passwordHash: seed.passwordHash ?? bcrypt.hashSync("password123", 10),
  };
}

function createSeed(): Database {
  const owner = makeUser({
    id: "user-owner",
    email: "owner@rentconnect.dev",
    name: "Sarah Photography",
    location: "London",
    bio: "Professional photographer renting premium gear.",
    phone: "+44 7700 000111",
    reviewCount: 41,
    rating: 4.9,
    trustScore: 97,
    role: "owner",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  });

  const renter = makeUser({
    id: "user-renter",
    email: "renter@rentconnect.dev",
    name: "Alex Walker",
    location: "Manchester",
    bio: "Weekend adventurer and frequent renter.",
    phone: "+44 7700 000222",
    reviewCount: 12,
    rating: 4.7,
    trustScore: 88,
    role: "renter",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
  });

  const nowIso = now();
  const listings: Listing[] = [
    {
      id: "item-camera",
      ownerId: owner.id,
      title: "Canon EOS R5 Creator Kit",
      category: "Photography",
      description: "Flagship mirrorless camera bundle with lenses, tripod, and backup batteries.",
      pricePerDay: 55,
      location: "London",
      images: [
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1502920917128-1aa500764ce7?auto=format&fit=crop&w=1200&q=80",
      ],
      features: ["2 lenses", "Tripod", "ND filters", "Battery pack"],
      insuranceEnabled: true,
      cancellationPolicy: "Free cancellation up to 48 hours before pickup.",
      isActive: true,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: "item-camping",
      ownerId: renter.id,
      title: "4-Person Camping Bundle",
      category: "Camping",
      description: "Tent, sleeping mats, stove, and lanterns for quick weekend trips.",
      pricePerDay: 28,
      location: "Manchester",
      images: [
        "https://images.unsplash.com/photo-1504280390368-3971f827c3d9?auto=format&fit=crop&w=1200&q=80",
      ],
      features: ["Tent", "Stove", "Lantern", "2 mats"],
      insuranceEnabled: true,
      cancellationPolicy: "Flexible cancellation up to 24 hours before pickup.",
      isActive: true,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];

  const bookings: Booking[] = [
    {
      id: "booking-1",
      itemId: "item-camera",
      ownerId: owner.id,
      renterId: renter.id,
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      quantity: 1,
      dayCount: 3,
      subtotal: 165,
      serviceFee: 12,
      damageWaiver: 15,
      totalPrice: 192,
      status: "confirmed",
      paymentStatus: "paid",
      createdAt: nowIso,
    },
  ];

  const conversations: Conversation[] = [
    {
      id: "conversation-1",
      itemId: "item-camera",
      bookingId: "booking-1",
      participantIds: [owner.id, renter.id],
      updatedAt: nowIso,
    },
  ];

  const messages: Message[] = [
    {
      id: nanoid(),
      conversationId: "conversation-1",
      senderId: renter.id,
      content: "Hi, is pickup on Friday evening okay?",
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
    {
      id: nanoid(),
      conversationId: "conversation-1",
      senderId: owner.id,
      content: "Yes, 6pm works. I will share the exact address tomorrow.",
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ];

  const reviews: Review[] = [
    {
      id: nanoid(),
      itemId: "item-camera",
      bookingId: "booking-1",
      authorId: renter.id,
      targetUserId: owner.id,
      rating: 5,
      comment: "Gear was spotless and pickup was smooth.",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const notifications: Notification[] = [
    {
      id: nanoid(),
      userId: owner.id,
      type: "booking",
      title: "Upcoming booking",
      body: "Alex Walker is collecting the Canon EOS R5 kit in 3 days.",
      href: "/dashboard?tab=bookings",
      read: false,
      createdAt: nowIso,
    },
    {
      id: nanoid(),
      userId: renter.id,
      type: "message",
      title: "New message",
      body: "Sarah Photography replied to your conversation.",
      href: "/dashboard?tab=messages&conversationId=conversation-1",
      read: false,
      createdAt: nowIso,
    },
  ];

  return {
    users: [owner, renter],
    listings,
    bookings,
    reviews,
    conversations,
    messages,
    notifications,
    conversationReads: [
      {
        conversationId: "conversation-1",
        userId: renter.id,
        lastReadAt: nowIso,
      },
    ],
    paymentSessions: [],
  };
}

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(createSeed(), null, 2), "utf8");
  }
}

export function readDb(): Database {
  ensureDb();
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as Database;
}

export function writeDb(db: Database) {
  ensureDb();
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
}

export function updateDb<T>(updater: (db: Database) => T): T {
  const db = readDb();
  const result = updater(db);
  writeDb(db);
  return result;
}
