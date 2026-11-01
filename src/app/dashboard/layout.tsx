import { redirect } from "next/navigation";
import { currentSession } from "@/lib/session";
import DashboardShell from "@/components/dashboard-shell";

// Session-aware dashboard pages render at request time rather than during static prerendering.
export const instant = false;

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const session = await currentSession();
  if (!session) redirect("/account?next=/dashboard");
  return <DashboardShell name={session.name}>{children}</DashboardShell>;
}
