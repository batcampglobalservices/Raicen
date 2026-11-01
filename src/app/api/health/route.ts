import { NextResponse } from "next/server";
export function GET() { return NextResponse.json({ status: "ok", service: "edulearn", timestamp: new Date().toISOString() }); }
