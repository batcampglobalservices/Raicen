import postgres from "postgres";
import { randomUUID } from "node:crypto";

const sql = postgres(process.env.DATABASE_URL ?? "postgres://edulearn:edulearn@localhost:55432/edulearn", { prepare: false });
const subjects = [{ slug: "mathematics", title: "Mathematics" }, { slug: "biology", title: "Biology" }, { slug: "english", title: "English language" }, { slug: "chemistry", title: "Chemistry" }];
const topicData = [{ subject: "mathematics", slug: "algebra", title: "Algebraic expressions", summary: "Simplify expressions and solve one-step equations.", minutes: 12 }, { subject: "mathematics", slug: "geometry", title: "Geometry essentials", summary: "Explore angles and triangles.", minutes: 10 }, { subject: "biology", slug: "cells", title: "Cells and organisation", summary: "Understand the building blocks of life.", minutes: 14 }, { subject: "english", slug: "comprehension", title: "Reading for meaning", summary: "Use evidence and inference to understand texts.", minutes: 13 }, { subject: "chemistry", slug: "matter", title: "States of matter", summary: "Connect particles, energy, and observable changes.", minutes: 12 }];
async function main() {
  for (const subject of subjects) await sql`insert into subjects (id, slug, title) values (${randomUUID()}, ${subject.slug}, ${subject.title}) on conflict (slug) do nothing`;
  const rows = await sql`select id, slug from subjects`;
  for (const topic of topicData) { const subject=rows.find(row=>row.slug===topic.subject); if(subject) await sql`insert into topics (id, subject_id, slug, title, summary, minutes) values (${randomUUID()}, ${subject.id}, ${topic.slug}, ${topic.title}, ${topic.summary}, ${topic.minutes}) on conflict do nothing`; }
  await sql.end();
}
main().catch(async (error) => { console.error(error); await sql.end(); process.exitCode=1; });
