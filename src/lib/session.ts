import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

type Session = { id: string; name: string; expires: number };
function signature(value: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET must be configured");
  return createHmac("sha256", secret).update(value).digest("base64url");
}
export function sessionToken(user: { id: string; name: string }) {
  const payload = Buffer.from(JSON.stringify({ id: user.id, name: user.name, expires: Date.now() + 7 * 86400000 })).toString("base64url");
  return payload + "." + signature(payload);
}
export async function currentSession(): Promise<Session | null> {
  const token = (await cookies()).get("edulearn_user")?.value;
  if (!token) return null;
  try {
    const [payload, mac] = token.split(".");
    const actual = Buffer.from(mac ?? "");
    const expected = Buffer.from(signature(payload));
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const value = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    return typeof value.id === "string" && typeof value.name === "string" && value.expires > Date.now() ? value : null;
  } catch { return null; }
}
