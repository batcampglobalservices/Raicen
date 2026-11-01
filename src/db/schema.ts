import { pgTable, uuid, varchar, text, integer, timestamp, uniqueIndex, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({ emailUnique: uniqueIndex("users_email_unique").on(table.email) }));

export const subjects = pgTable("subjects", { id: uuid("id").defaultRandom().primaryKey(), slug: varchar("slug", { length: 80 }).notNull(), title: varchar("title", { length: 120 }).notNull() }, (table) => ({ slugUnique: uniqueIndex("subjects_slug_unique").on(table.slug) }));
export const topics = pgTable("topics", { id: uuid("id").defaultRandom().primaryKey(), subjectId: uuid("subject_id").notNull().references(() => subjects.id), slug: varchar("slug", { length: 80 }).notNull(), title: varchar("title", { length: 160 }).notNull(), summary: text("summary").notNull(), minutes: integer("minutes").notNull() });
export const quizAttempts = pgTable("quiz_attempts", { id: uuid("id").defaultRandom().primaryKey(), userId: uuid("user_id").notNull().references(() => users.id), topicId: uuid("topic_id").notNull().references(() => topics.id), score: integer("score").notNull(), total: integer("total").notNull(), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull() });
export const lessons = pgTable("lessons", { id: uuid("id").defaultRandom().primaryKey(), topicId: uuid("topic_id").notNull().references(() => topics.id), classLevel: varchar("class_level", { length: 40 }).notNull(), promptVersion: varchar("prompt_version", { length: 30 }).notNull(), model: varchar("model", { length: 100 }).notNull(), content: jsonb("content").notNull(), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull() }, (table) => ({ lessonUnique: uniqueIndex("lessons_cache_key").on(table.topicId, table.classLevel, table.promptVersion, table.model) }));
