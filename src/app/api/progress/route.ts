import { NextResponse } from "next/server";
import { currentSession } from "@/lib/session";
import { dbGetAttempts } from "@/lib/db-store";
export async function GET() {
  const session = await currentSession();
  if (!session) return NextResponse.json({error:"Sign in to see your saved results."},{status:401});
  try { return NextResponse.json({attempts:await dbGetAttempts(session.id)},{headers:{"Cache-Control":"private, no-store"}}); }
  catch { return NextResponse.json({error:"Unable to load your results."},{status:503}); }
}
// Scores are written only by the server when a generated quiz is submitted.
export async function POST() { return NextResponse.json({error:"Submit your quiz through the practice page."},{status:405}); }
