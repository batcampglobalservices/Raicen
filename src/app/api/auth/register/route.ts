import { sessionToken } from "@/lib/session";
import { z } from "zod";
import { NextResponse } from "next/server";
import { register } from "@/lib/store";
import { dbRegister } from "@/lib/db-store";
import { allowRequest } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!allowRequest(`register:${request.headers.get("x-forwarded-for") ?? "unknown"}`)) return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  const parsed = z.object({email:z.email().max(320),password:z.string().min(8).max(128),name:z.string().trim().min(1).max(120)}).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({error:"Enter a valid email, password (at least 8 characters), and name."},{status:400});
  const body = parsed.data;
  const user = process.env.DATABASE_URL ? await dbRegister(body.email, body.password, body.name) : await register(body.email, body.password, body.name);
  if (!user) return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  const response = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } }, { status: 201 });
  response.cookies.set("edulearn_user", sessionToken(user), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 7, path: "/" });
  return response;
}
