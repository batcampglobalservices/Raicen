import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDatabase } from "@/db/client";
import { conversations, conversationMessages } from "@/db/conversation-schema";
import { currentSession } from "@/lib/session";

const messageSchema=z.object({role:z.enum(["user","assistant"]),content:z.string().min(1).max(4000)});
const conversationSchema=z.object({title:z.string().trim().min(1).max(120),topic:z.string().max(120).optional(),notes:z.string().max(6000).default(""),messages:z.array(messageSchema).min(1).max(80)});

export async function GET(){const session=await currentSession();if(!session)return NextResponse.json({error:"Sign in to access your conversations."},{status:401});try{const db=getDatabase();if(!db)throw Error();const rows=await db.select({id:conversations.id,title:conversations.title,topic:conversations.topic,updatedAt:conversations.updatedAt}).from(conversations).where(eq(conversations.userId,session.id)).orderBy(desc(conversations.updatedAt)).limit(30);return NextResponse.json({conversations:rows},{headers:{"Cache-Control":"private, no-store"}});}catch{return NextResponse.json({error:"Your conversations could not be loaded."},{status:503});}}

export async function POST(request:Request){const session=await currentSession();if(!session)return NextResponse.json({error:"Sign in to save a conversation."},{status:401});const parsed=conversationSchema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Conversation content is invalid."},{status:400});try{const db=getDatabase();if(!db)throw Error();const [conversation]=await db.transaction(async tx=>{const [created]=await tx.insert(conversations).values({userId:session.id,title:parsed.data.title,topic:parsed.data.topic||null,notes:parsed.data.notes,updatedAt:new Date()}).returning();await tx.insert(conversationMessages).values(parsed.data.messages.map(message=>({conversationId:created.id,...message})));return [created];});return NextResponse.json({conversation:{id:conversation.id,title:conversation.title,topic:conversation.topic,updatedAt:conversation.updatedAt}},{status:201});}catch{return NextResponse.json({error:"Your conversation could not be saved."},{status:503});}}
