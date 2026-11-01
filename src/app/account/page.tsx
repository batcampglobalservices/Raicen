"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LearningNav from "@/components/learning-nav";
export default function AccountPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [user, setUser] = useState<{name:string}|null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { fetch("/api/auth/me").then(async r=>{const data=await r.json().catch(()=>null);if(!r.ok)throw Error(data?.error??"Unable to check your account.");setUser(data?.user??null);}).catch(()=>setError("Unable to check your account. Reload to try again.")).finally(()=>setChecking(false)); }, []);
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/auth/" + mode, { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify(fields) });
      const data = await response.json().catch(() => null);
      if(!response.ok) throw new Error(data?.error ?? "The account service returned an unexpected response. Please try again.");
      router.push("/dashboard");
    } catch(e) { setError(e instanceof Error ? e.message : "Unable to connect. Please try again."); } finally { setBusy(false); }
  }
  return <main><LearningNav /><section className="flow-panel">
    {checking ? <p role="status">Checking your account…</p> : user ? <><h1>Hello, {user.name}.</h1><p>Your account saves completed practice and scores.</p><button className="button primary" onClick={async()=>{setBusy(true);try{const r=await fetch("/api/auth/logout",{method:"POST"});if(!r.ok)throw Error();router.replace("/");router.refresh();}catch{setError("Could not sign out. Please retry.");setBusy(false);}}} disabled={busy}>Sign out</button></> : <>
      <p className="eyebrow">YOUR LEARNING ACCOUNT</p><h1>{mode==="login"?"Welcome back.":"Create your account."}</h1><p>Save your practice results and pick up where you left off.</p>
      <form onSubmit={submit}>
        {mode==="register" && <label>Your name<input name="name" autoComplete="given-name" required maxLength={120}/></label>}
        <label>Email<input name="email" type="email" autoComplete="email" required maxLength={320}/></label>
        <label>Password<input name="password" type="password" autoComplete={mode==="login"?"current-password":"new-password"} required minLength={8} maxLength={128}/></label>
        <button className="button primary" disabled={busy}>{busy?"Please wait…":mode==="login"?"Sign in":"Create account"}</button>
      </form>
      <button className="text-button" disabled={busy} onClick={()=>{setMode(mode==="login"?"register":"login");setError("");}}>{mode==="login"?"New here? Create an account":"Already have an account? Sign in"}</button>
    </>}{error && <p role="alert" className="flow-error">{error}</p>}
  </section></main>;
}
