"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["/dashboard", "Overview", "✦"],
  ["/dashboard/chat", "Chat", "◌"],
  ["/dashboard/progress", "Progress", "↗"],
  ["/dashboard/account", "Account", "○"],
] as const;

export default function DashboardShell({ name, children }: { name: string; children: React.ReactNode }) {
  const pathname = usePathname();
  return <div className="dashboard-shell">
    <aside className="dashboard-sidebar">
      <Link href="/dashboard" className="dashboard-brand"><span>e</span>edulearn</Link>
      <nav aria-label="Dashboard navigation">{items.map(([href,label,icon])=><Link key={href} href={href} className={pathname===href?"dash-nav active":"dash-nav"} aria-current={pathname===href?"page":undefined}><i>{icon}</i>{label}</Link>)}</nav>
      <div className="learner-chip"><span>{name.slice(0,1).toUpperCase()}</span><div><strong>{name}</strong><small>Learning space</small></div></div>
    </aside>
    <div className="dashboard-main"><header className="dashboard-mobile-head"><Link href="/dashboard" className="dashboard-brand"><span>e</span>edulearn</Link><Link href="/dashboard/account" aria-label="Account" className="mobile-avatar">{name.slice(0,1).toUpperCase()}</Link></header>{children}</div>
  </div>;
}
