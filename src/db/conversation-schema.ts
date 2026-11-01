import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { users } from "./schema";

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  topic: text("topic"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, table => ({ userUpdated: index("conversations_user_updated_idx").on(table.userId, table.updatedAt) }));

export const conversationMessages = pgTable("conversation_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, table => ({ conversationCreated: index("conversation_messages_conversation_created_idx").on(table.conversationId, table.createdAt) }));
