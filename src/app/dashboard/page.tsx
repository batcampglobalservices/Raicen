import Link from "next/link";
import { currentSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await currentSession();
  const firstName = session?.name.split(" ")[0] ?? "there";
  return <section className="dashboard-page">
    <div className="dashboard-welcome"><div><p className="eyebrow">YOUR LEARNING SPACE</p><h1>Hey, <em>{firstName}.</em><br/>What are we exploring?</h1><Link className="button primary" href="/dashboard/chat">Start chatting →</Link></div><div className="learning-orbit" aria-hidden="true"><span className="orbit-dot one">?</span><span className="orbit-dot two">+</span><span className="orbit-dot three">✦</span><div className="orbit-core">today<br/><strong>learn</strong></div></div></div>
    <div className="dashboard-section-title"><div><p className="eyebrow">QUICK START</p><h2>Pick a spark.</h2></div><Link href="/dashboard/chat" className="text-button">New chat</Link></div>
    <div className="next-step-grid"><Link href="/dashboard/chat" className="next-step-card card-chat"><span>◌</span><h3>Ask anything</h3><b>Open chat →</b></Link><Link href="/dashboard/progress" className="next-step-card card-progress"><span>↗</span><h3>Your progress</h3><b>See results →</b></Link><Link href="/dashboard/chat" className="next-step-card card-quiz"><span>✦</span><h3>Make a quiz</h3><b>Start with chat →</b></Link></div>
    <section className="dashboard-note"><span>✦</span><div><strong>One good question is enough to begin.</strong></div></section>
  </section>;
}
