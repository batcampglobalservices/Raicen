import { eq, desc } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { quizAttempts, users, topics } from "@/db/schema";
import { hashPassword, verifyPassword, type Attempt, type User } from "@/lib/store";

export async function dbRegister(email: string, password: string, name: string): Promise<User | null> {
  const db = getDatabase(); if (!db) return null;
  const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1); if (existing.length) return null;
  const [user] = await db.insert(users).values({ email: email.toLowerCase(), name, passwordHash: hashPassword(password) }).returning();
  return { id: user.id, email: user.email, name: user.name, passwordHash: user.passwordHash, createdAt: user.createdAt.toISOString() };
}
export async function dbLogin(email: string, password: string): Promise<User | null> {
  const db = getDatabase(); if (!db) return null;
  const rows = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1); const user = rows[0];
  if (!user || !verifyPassword(password, user.passwordHash)) return null;
  return { id: user.id, email: user.email, name: user.name, passwordHash: user.passwordHash, createdAt: user.createdAt.toISOString() };
}
export async function dbAddAttempt(value: Omit<Attempt, "id" | "createdAt">) { const db=getDatabase(); if(!db) return null; const [row]=await db.insert(quizAttempts).values(value).returning(); return { ...row, createdAt: row.createdAt.toISOString() }; }
export async function dbGetAttempts(userId: string) {
 const db=getDatabase(); if(!db) throw new Error("Database unavailable");
 const rows=await db.select({id:quizAttempts.id,topicId:quizAttempts.topicId,topicTitle:topics.title,score:quizAttempts.score,total:quizAttempts.total,createdAt:quizAttempts.createdAt}).from(quizAttempts).innerJoin(topics,eq(topics.id,quizAttempts.topicId)).where(eq(quizAttempts.userId,userId)).orderBy(desc(quizAttempts.createdAt));
 return rows.map(row=>({...row,createdAt:row.createdAt.toISOString()}));
}
export async function dbTopicIdFromSlug(slug: string) { const db=getDatabase(); if(!db) return null; const [topic]=await db.select({ id: topics.id }).from(topics).where(eq(topics.slug, slug)).limit(1); return topic?.id ?? null; }
