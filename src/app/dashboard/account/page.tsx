"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardAccountPage() {
  const router=useRouter(); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  async function signOut(){setBusy(true);setError("");try{const response=await fetch("/api/auth/logout",{method:"POST"});if(!response.ok)throw Error();router.replace("/");router.refresh();}catch{setError("Could not sign out. Please try again.");setBusy(false);}}
  return <section className="dashboard-page account-dashboard"><p className="eyebrow">ACCOUNT</p><h1>Your learning space is yours.</h1><p className="dashboard-copy">Your completed curriculum practice is saved to this account. Conversation history will be added here as the dashboard evolves.</p><div className="settings-card"><h2>Session</h2><p>You are signed in on this device.</p><button className="button" onClick={signOut} disabled={busy}>{busy?"Signing out…":"Sign out"}</button>{error&&<p role="alert" className="flow-error">{error}</p>}</div></section>;
}
