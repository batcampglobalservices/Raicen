import { generateText, Output } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { NextResponse } from "next/server";
import { dbTopicIdFromSlug } from "@/lib/db-store";
import { findCachedLesson, saveCachedLesson } from "@/lib/lesson-store";

const lessonSchema = z.object({
  introduction: z.string().min(1).max(1200),
  objectives: z.array(z.string().min(1).max(240)).min(2).max(5),
  explanation: z.string().min(1).max(3000),
  examples: z.array(z.string().min(1).max(500)).min(1).max(5),
  summary: z.string().min(1).max(800),
  revisionPoints: z.array(z.string().min(1).max(240)).min(2).max(8),
});

const fallback = (topic: string) => ({ introduction: `${topic} becomes easier when you connect each new idea to something you already know.`, objectives: [`Define the key ideas in ${topic}.`, `Use the ideas in a simple example.`], explanation: `Start by naming the parts of ${topic}, then describe how they relate. Work one step at a time and check each step against the question.`, examples: [`Explain ${topic} to a classmate using one everyday example.`], summary: `Remember the key terms, the relationship between them, and the order of the steps.`, revisionPoints: ["Name the key terms.", "Explain the relationship.", "Practise one example."] });
const promptVersion = "lesson-v1";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { topic?: unknown; classLevel?: unknown };
  const topic = z.string().min(2).max(120).safeParse(body.topic);
  const classLevel = z.string().min(1).max(40).safeParse(body.classLevel ?? "SSS 1");
  if (!topic.success || !classLevel.success) return NextResponse.json({ error: "A valid topic and class level are required." }, { status: 400 });
  const topicId = process.env.DATABASE_URL ? await dbTopicIdFromSlug(topic.data) : null;
  const model = "openai/gpt-oss-20b";
  if (topicId) { const cached = await findCachedLesson(topicId, classLevel.data, promptVersion, model); if (cached) return NextResponse.json({ lesson: cached, source: "cache" }); }
  if (!process.env.GROQ_API_KEY) { const lesson=fallback(topic.data); if(topicId) await saveCachedLesson(topicId,classLevel.data,promptVersion,model,lesson); return NextResponse.json({ lesson, source: "development-fallback" }); }
  try {
    const result = await generateText({ model: groq("openai/gpt-oss-20b"), temperature: 0.3, maxOutputTokens: 1800, output: Output.object({ schema: lessonSchema }), prompt: `Create a clear secondary-school lesson for a Nigerian ${classLevel.data} learner about ${topic.data}. Use plain English, short paragraphs, and no unsafe or unsupported claims.` });
    const lesson=lessonSchema.parse(result.output); if(topicId) await saveCachedLesson(topicId,classLevel.data,promptVersion,model,lesson); return NextResponse.json({ lesson, source: "groq" });
  } catch { return NextResponse.json({ error: "The study engine is temporarily unavailable." }, { status: 502 }); }
}
