import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";
export type PrivateQuestion = { question: string; options: string[]; answer: number; explanation: string; skill: string };
export type PracticeResult = { score:number; total:number; saved:boolean; feedback:{question:string;chosen:number;answer:number;options:string[];explanation:string;skill:string}[] };
export const practiceQuizzes = pgTable("practice_quizzes", {
  id: uuid("id").defaultRandom().primaryKey(),
  owner: text("owner").notNull(),
  topic: text("topic").notNull(),
  questions: jsonb("questions").$type<PrivateQuestion[]>().notNull(),
  result: jsonb("result").$type<PracticeResult>(),
  expiresAt: timestamp("expires_at", {withTimezone:true}).notNull(),
  createdAt: timestamp("created_at", {withTimezone:true}).defaultNow().notNull(),
});
