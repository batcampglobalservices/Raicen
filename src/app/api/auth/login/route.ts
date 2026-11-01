import { sessionToken } from "@/lib/session";
import { z } from "zod";
import { NextResponse } from "next/server";
import { login } from "@/lib/store";
import { dbLogin } from "@/lib/db-store";
import { allowRequest } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!allowRequest(request.headers.get("x-forwarded-for") ?? "unknown")) return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  const parsed = z.object({email:z.email().max(320),password:z.string().min(1).max(128)}).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({error:"Enter a valid email, password."},{status:400});
  const body = parsed.data;
  const user = body.email && body.password ? (process.env.DATABASE_URL ? await dbLogin(body.email, body.password) : await login(body.email, body.password)) : null;
  if (!user) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  const response = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
  response.cookies.set("edulearn_user", sessionToken(user), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 7, path: "/" });
  return response;
}
