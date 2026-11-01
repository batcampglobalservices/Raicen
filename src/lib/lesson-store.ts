import { and, eq } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { lessons } from "@/db/schema";

export async function findCachedLesson(topicId: string, classLevel: string, promptVersion: string, model: string) { const db=getDatabase(); if(!db) return null; const [row]=await db.select().from(lessons).where(and(eq(lessons.topicId,topicId),eq(lessons.classLevel,classLevel),eq(lessons.promptVersion,promptVersion),eq(lessons.model,model))).limit(1); return row?.content ?? null; }
export async function saveCachedLesson(topicId: string, classLevel: string, promptVersion: string, model: string, content: unknown) { const db=getDatabase(); if(!db) return; await db.insert(lessons).values({topicId,classLevel,promptVersion,model,content}).onConflictDoUpdate({target:[lessons.topicId,lessons.classLevel,lessons.promptVersion,lessons.model],set:{content}}); }
