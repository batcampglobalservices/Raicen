import { NextResponse } from "next/server";
import { currentSession } from "@/lib/session";
export async function GET() {
  const session = await currentSession();
  return NextResponse.json({ user: session ? { id: session.id, name: session.name } : null }, { headers: { "Cache-Control": "private, no-store" } });
}
