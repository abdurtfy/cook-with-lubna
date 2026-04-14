import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Orders table for storing ebook purchase information.
 * Each order represents a successful purchase with payment verification.
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  /** Buyer's full name */
  buyerName: varchar("buyerName", { length: 255 }).notNull(),
  /** Buyer's email address */
  buyerEmail: varchar("buyerEmail", { length: 320 }).notNull(),
  /** Razorpay payment ID from successful transaction */
  razorpayPaymentId: varchar("razorpayPaymentId", { length: 100 }).notNull().unique(),
  /** Razorpay order ID */
  razorpayOrderId: varchar("razorpayOrderId", { length: 100 }).notNull(),
  /** Amount in paise (199 INR = 19900 paise) */
  amount: int("amount").notNull(),
  /** Currency code (INR) */
  currency: varchar("currency", { length: 3 }).default("INR").notNull(),
  /** Payment status (pending, completed, failed) */
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed"]).default("pending").notNull(),
  /** Unique token for secure ebook download */
  downloadToken: varchar("downloadToken", { length: 64 }).notNull().unique(),
  /** Whether the download link has been used */
  downloadedAt: timestamp("downloadedAt"),
  /** Order creation timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** Last update timestamp */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;