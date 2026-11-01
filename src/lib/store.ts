import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export type User = { id: string; email: string; name: string; passwordHash: string; createdAt: string };
export type Attempt = { id: string; userId: string; topicId: string; score: number; total: number; createdAt: string };
type Store = { users: User[]; attempts: Attempt[] };

const file = path.join(process.cwd(), ".data", "edulearn.json");
const empty: Store = { users: [], attempts: [] };

async function load(): Promise<Store> {
  try { return JSON.parse(await readFile(file, "utf8")) as Store; } catch { return empty; }
}
async function save(store: Store) { await mkdir(path.dirname(file), { recursive: true }); await writeFile(file, JSON.stringify(store, null, 2)); }
export function hashPassword(password: string) { const salt=crypto.randomBytes(16).toString("hex"); const key=crypto.scryptSync(password,salt,64).toString("hex"); return `${salt}:${key}`; }
export function verifyPassword(password: string, encoded: string) { const [salt, key] = encoded.split(":"); if (!salt || !key) return false; const expected=crypto.scryptSync(password,salt,64); const actual=Buffer.from(key,"hex"); return actual.length===expected.length && crypto.timingSafeEqual(actual,expected); }
export async function register(email: string, password: string, name: string) { const store = await load(); if (store.users.some(u => u.email === email.toLowerCase())) return null; const user={ id: crypto.randomUUID(), email: email.toLowerCase(), name, passwordHash: hashPassword(password), createdAt: new Date().toISOString() }; store.users.push(user); await save(store); return user; }
export async function login(email: string, password: string) { const store = await load(); const user=store.users.find(u => u.email===email.toLowerCase() && verifyPassword(password,u.passwordHash)); return user ?? null; }
export async function addAttempt(attempt: Omit<Attempt,"id"|"createdAt">) { const store=await load(); const value={...attempt,id:crypto.randomUUID(),createdAt:new Date().toISOString()}; store.attempts.push(value); await save(store); return value; }
export async function getAttempts(userId: string) { const store=await load(); return store.attempts.filter(a=>a.userId===userId).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)); }
