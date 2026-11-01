import Link from "next/link";
import { currentSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await currentSession();
  const firstName = session?.name.split(" ")[0] ?? "there";
  return <section className="dashboard-page">
    <div className="dashboard-welcome"><div><p className="eyebrow">YOUR LEARNING SPACE</p><h1>Good to see you, <em>{firstName}.</em></h1><p>Bring a question, follow a thread of curiosity, or pick up exactly where you left off.</p><Link className="button primary" href="/dashboard/chat">Start a conversation →</Link></div><div className="learning-orbit" aria-hidden="true"><span className="orbit-dot one">?</span><span className="orbit-dot two">+</span><span className="orbit-dot three">✦</span><div className="orbit-core">today<br/><strong>learn</strong></div></div></div>
    <div className="dashboard-section-title"><div><p className="eyebrow">YOUR NEXT MOVE</p><h2>Make it a small, good step.</h2></div><Link href="/dashboard/chat" className="text-button">New question</Link></div>
    <div className="next-step-grid"><Link href="/dashboard/chat" className="next-step-card card-chat"><span>01</span><h3>Ask your tutor</h3><p>Schoolwork, a random curiosity, or something from your notes.</p><b>Open chat →</b></Link><Link href="/dashboard/progress" className="next-step-card card-progress"><span>02</span><h3>See your progress</h3><p>Your completed curriculum quizzes and results live here.</p><b>View progress →</b></Link><Link href="/dashboard/chat" className="next-step-card card-quiz"><span>03</span><h3>Make a quiz</h3><p>Turn your next conversation into five useful questions.</p><b>Start a topic →</b></Link></div>
    <section className="dashboard-note"><span>✦</span><div><strong>A good learning session can begin with one honest question.</strong><p>Your tutor can explain, challenge your thinking, or simply gist through an idea with you.</p></div></section>
  </section>;
}
