"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
export default function LearningNav() {
  const pathname = usePathname();
  const [name, setName] = useState<string | null>(null);
  useEffect(() => { fetch("/api/auth/me").then(r => r.json()).then(d => setName(d.user?.name ?? null)).catch(() => undefined); if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined); }, [pathname]);
  return <nav className="nav shell" aria-label="Main navigation">
    <Link className="brand" href="/"><span className="brand-mark">e</span>edulearn</Link>
    <div className="nav-links">{[["/learn", "Learn"], ["/tutor", "Tutor"], ["/progress", "Progress"]].map(([href, label]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}</div>
    <Link className="profile-pill" href="/account">{name ? name + " · Account" : "Sign in"}</Link>
  </nav>;
}
