"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LearningNav from "@/components/learning-nav";
type Attempt = {id:string; topicTitle?:string; topicId:string; score:number; total:number; createdAt:string};
export function ProgressPage({dashboard=false}:{dashboard?:boolean}) {
  const [attempts,setAttempts]=useState<Attempt[]>([]);
  const [state,setState]=useState("loading");
  function load() {fetch("/api/progress").then(async r=>{if(r.status===401){setState("guest");return;}if(!r.ok)throw Error();setAttempts((await r.json()).attempts);setState("ready");}).catch(()=>setState("error"));}
  useEffect(()=>{load();},[]);
  return <main>{!dashboard&&<LearningNav/>}<section className={dashboard?"dashboard-page dashboard-progress":"page shell"}><p className="eyebrow">YOUR LEARNING RECORD</p><h1>See how you’re doing.</h1>
    {state==="loading"?<p role="status">Loading your results…</p>:state==="guest"?<div className="flow-panel"><h2>Keep a record of your learning.</h2><p>Sign in to see your saved practice results. You can still learn and practise without an account.</p><Link className="button primary flow-link" href="/account">Sign in or create an account</Link></div>:state==="error"?<div role="alert"><p>Your results could not be loaded.</p><button className="button primary" onClick={load}>Try again</button></div>:attempts.length?<>
      <div className="stats-grid"><div className="stat-card"><span>Completed quizzes</span><strong>{attempts.length}</strong></div><div className="stat-card"><span>Average score</span><strong>{Math.round(attempts.reduce((s,a)=>s+a.score/a.total*100,0)/attempts.length)}%</strong></div><div className="stat-card"><span>Topics practised</span><strong>{new Set(attempts.map(a=>a.topicId)).size}</strong></div></div>
      <h2>Recent practice</h2>{attempts.map(a=><article className="activity" key={a.id}><div><strong>{a.topicTitle??"Topic practice"}</strong><p>{new Date(a.createdAt).toLocaleString()}</p></div><strong>{a.score}/{a.total}</strong></article>)}
    </>:<div className="flow-panel"><h2>Your first result starts here.</h2><p>Ask your tutor about a topic, then make a quiz from the conversation. Your result will appear here.</p><Link className="button primary flow-link" href={dashboard?"/dashboard/chat":"/tutor"}>Start a conversation</Link></div>}
  </section></main>;
}

export default function StandaloneProgressPage() { const router=useRouter(); useEffect(()=>{router.replace("/dashboard/progress");},[router]); return null; }
