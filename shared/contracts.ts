export type UserRole = "owner" | "renter" | "admin";
export type BookingStatus = "pending" | "confirmed" | "active" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled";
export type NotificationType = "booking" | "message" | "listing" | "payment" | "system" | "dispute";
export type DisputeStatus = "open" | "under_review" | "resolved" | "closed";
export type VerificationStatus = "verified" | "pending" | "unverified";

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  location: string;
  bio: string;
  avatar: string;
  verificationStatus: VerificationStatus;
  rating: number;
  reviewCount: number;
  trustScore: number;
  joinedAt: string;
  role: UserRole;
}

export interface UserRecord extends User {
  passwordHash: string;
}

export interface Review {
  id: string;
  itemId: string;
  bookingId: string;
  authorId: string;
  targetUserId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Listing {
  id: string;
  ownerId: string;
  title: string;
  category: string;
  description: string;
  pricePerDay: number;
  location: string;
  images: string[];
  features: string[];
  insuranceEnabled: boolean;
  cancellationPolicy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListingSummary extends Listing {
  owner: Pick<User, "id" | "name" | "avatar" | "rating" | "reviewCount" | "trustScore" | "verificationStatus">;
  rating: number;
  reviewCount: number;
  distanceKm: number;
}

export interface Booking {
  id: string;
  itemId: string;
  ownerId: string;
  renterId: string;
  startDate: string;
  endDate: string;
  quantity: number;
  dayCount: number;
  subtotal: number;
  serviceFee: number;
  damageWaiver: number;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface BookingDetails extends Booking {
  item: ListingSummary;
  renter: Pick<User, "id" | "name" | "avatar">;
  owner: Pick<User, "id" | "name" | "avatar" | "rating" | "reviewCount" | "verificationStatus">;
}

export interface Conversation {
  id: string;
  itemId: string;
  participantIds: string[];
  bookingId?: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface ConversationSummary {
  id: string;
  itemId: string;
  itemTitle: string;
  itemImage: string;
  participants: Pick<User, "id" | "name" | "avatar">[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardSummary {
  stats: {
    totalEarnings: number;
    activeListings: number;
    totalBookings: number;
    unreadMessages: number;
  };
  listings: ListingSummary[];
  bookings: BookingDetails[];
  conversations: ConversationSummary[];
  notifications: Notification[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SearchParams {
  q?: string;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  verifiedOnly?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface CreateListingInput {
  title: string;
  category: string;
  description: string;
  pricePerDay: number;
  location: string;
  images: string[];
  features: string[];
  insuranceEnabled: boolean;
  cancellationPolicy: string;
}

export interface UpdateProfileInput {
  name: string;
  phone: string;
  location: string;
  bio: string;
  avatar: string;
}

export interface CreateBookingInput {
  itemId: string;
  startDate: string;
  endDate: string;
  quantity: number;
}

export interface CheckoutSession {
  provider: "mock" | "stripe";
  bookingId: string;
  sessionId: string;
  checkoutUrl: string;
  publishableKey?: string;
}

export interface RefreshTokenPayload {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pageCount: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface Dispute {
  id: string;
  bookingId: string;
  itemId: string;
  openedById: string;
  renterId: string;
  ownerId: string;
  title: string;
  description: string;
  evidenceUrls: string[];
  status: DisputeStatus;
  resolution?: string | null;
  createdAt: string;
  updatedAt: string;
}
