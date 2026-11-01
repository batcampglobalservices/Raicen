import Link from "next/link";
import LearningNav from "@/components/learning-nav";
import { curriculumContext } from "@/lib/curriculum";
export default function LearnPage() {
  return <main><LearningNav /><section className="page shell">
    <p className="eyebrow">START HERE · SSS 1</p><h1>What would you like to understand?</h1>
    <p className="flow-lede">Choose a topic. Your tutor will explain it, work through examples, and help you practise.</p>
    <div className="subject-grid">{Object.entries(curriculumContext).map(([topic, context]) => <article className="subject-card" key={topic}>
      <p className="eyebrow">{context.subject}</p><h2>{topic}</h2>
      <ul>{context.objectives.map(o => <li key={o}>{o}</li>)}</ul>
      <Link className="button primary flow-link" href={"/tutor?topic=" + encodeURIComponent(topic)}>Learn this topic →</Link>
    </article>)}</div>
    <p className="flow-note">These four topics are the current starter catalog. More class levels and syllabus coverage are still being reviewed.</p>
  </section></main>;
}
