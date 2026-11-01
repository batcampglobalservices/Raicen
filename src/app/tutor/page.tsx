"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LearningNav from "@/components/learning-nav";
import Markdown from "react-markdown";
import { curriculumContext } from "@/lib/curriculum";

type Message = { role: "user" | "assistant"; content: string };
type TutorResult = { reply:string; difficultyAreas:string[]; readiness:"starting"|"building"|"ready"; nextQuestion:string; quizPlan:{count:number;focus:string[]} };
const topics=Object.keys(curriculumContext);
const welcome=(topic:string):Message[]=>[{role:"assistant",content:"Let’s work on "+topic+". Would you like a short explanation, a worked example, or help with a particular question?"}];
type Saved={topic:string;notes:string;messages:Message[];result:TutorResult|null;draft?:string};
export default function TutorPage() {
 const router=useRouter();
 const [topic,setTopic]=useState(topics[0]);
 const [messages,setMessages]=useState<Message[]>(welcome(topics[0]));
 const [input,setInput]=useState("");
 const [notes,setNotes]=useState("");
 const [result,setResult]=useState<TutorResult|null>(null);
 const [busy,setBusy]=useState(false);
 const [quizBusy,setQuizBusy]=useState(false);
 const [ready,setReady]=useState(false);
 const [error,setError]=useState("");
 const end=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const requested=new URLSearchParams(location.search).get("topic");
  let saved:Saved|null=null;
  try{saved=JSON.parse(sessionStorage.getItem("edulearn:tutor")??"null");}catch{}
  const selected=requested && topics.includes(requested)?requested:saved?.topic && topics.includes(saved.topic)?saved.topic:topics[0];
  queueMicrotask(()=>{
   setTopic(selected);
   if(saved?.topic===selected && Array.isArray(saved.messages) && saved.messages.length){setNotes(saved.notes??"");setMessages(saved.messages);setResult(saved.result??null);setInput(saved.draft??"");}
   else setMessages(welcome(selected));
   try {const review=JSON.parse(sessionStorage.getItem("edulearn:review")??"null");if(review?.topic===selected && typeof review.message==="string"){setInput(review.message.slice(0,1800));sessionStorage.removeItem("edulearn:review");}}catch{}
   setReady(true);
  });
 },[]);
 useEffect(()=>{
  if(ready)sessionStorage.setItem("edulearn:tutor",JSON.stringify({topic,notes,messages,result,draft:input}));
 },[topic,notes,messages,result,input,ready]);
 useEffect(()=>{end.current?.scrollIntoView({block:"nearest"});},[messages,busy]);
 function selectTopic(value:string) {
  if(busy||quizBusy||value===topic)return;
  setTopic(value);setNotes("");setInput("");setResult(null);setError("");setMessages(welcome(value));
  history.replaceState(null,"","/tutor?topic="+encodeURIComponent(value));
 }
 async function send(content=input) {
  const text=content.trim();if(!text||busy||quizBusy)return;
  setBusy(true);setError("");setInput("");
  const previous=messages;
  const next=[...messages,{role:"user" as const,content:text}];
  setMessages(next);
  try{
   const response=await fetch("/api/tutor",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({topic,classLevel:"SSS 1",notes,messages:next.slice(-18)}),signal:AbortSignal.timeout(55000)});
   const data=await response.json();if(!response.ok)throw Error(data.error??"Your tutor couldn’t respond. Please try again.");
   setResult(data);setMessages([...next,{role:"assistant",content:data.reply}]);
  }catch(e){setMessages(previous);setInput(text);setError(e instanceof Error && e.name!=="TimeoutError"?e.message:"The tutor took too long to respond. Your message is still here; please retry.");}
  finally{setBusy(false);}
 }
 async function createQuiz(){
  setQuizBusy(true);setError("");
  try{
   const response=await fetch("/api/practice",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({topic,notes,focus:result?.difficultyAreas??[],conversation:messages.slice(-8).map(m=>m.role+": "+m.content).join("\n").slice(-16000)}),signal:AbortSignal.timeout(100000)});
   const data=await response.json();if(!response.ok)throw Error(data.error??"Could not prepare practice.");
   router.push("/practice?id="+data.id);
  }catch(e){setError(e instanceof Error && e.name!=="TimeoutError"?e.message:"Quiz preparation took too long. Please retry.");setQuizBusy(false);}
 }
 return <main className="tutor-page"><LearningNav/><section className="tutor-shell">
  <div className="tutor-heading"><p className="eyebrow">LEARN → PRACTISE → REVIEW</p><h1>Let’s work through it.</h1><p>Start with an explanation or bring a question. When you’re ready, practise what you’ve learned.</p>
   <details className="notes-disclosure"><summary>Add your class notes <span>Optional</span></summary><label className="notes-box">Your notes<textarea value={notes} disabled={busy||quizBusy} maxLength={6000} rows={3} onChange={e=>setNotes(e.target.value)} placeholder="Paste the notes you want help understanding…"/></label><small>Notes and this conversation stay in this browser tab. Notes are sent to the AI tutor when you ask a question or prepare practice.</small></details>
  </div>
  <div className="tutor-layout">
   <aside className="tutor-sidebar"><p className="eyebrow">YOUR TOPIC · SSS 1</p>{topics.map(t=><button key={t} className={topic===t?"topic-choice active":"topic-choice"} aria-pressed={topic===t} disabled={!ready||busy||quizBusy} onClick={()=>selectTopic(t)}>{t}</button>)}<p className="flow-note">Changing topic starts a new conversation. Refreshing keeps the current one.</p></aside>
   <section className="chat-card" aria-label="Tutor conversation"><div className="chat-top"><strong>{topic}</strong><span>{busy?"Thinking…":"Your tutor"}</span></div>
    <div className="messages" role="log" aria-live="polite" aria-label="Messages">{messages.map((m,i)=><div className={m.role==="user"?"message user":"message"} key={i}><span className="message-avatar">{m.role==="user"?"You":"e"}</span><div><div className="teaching-copy"><Markdown skipHtml components={{a:({children})=><span>{children}</span>}}>{m.content}</Markdown></div>{m.role==="assistant" && i===messages.length-1 && result?.nextQuestion && !m.content.includes(result.nextQuestion) && <p className="tutor-question"><strong>Try this:</strong> {result.nextQuestion}</p>}</div></div>)}
     {messages.length===1 && <div className="starter-prompts"><p>Start wherever feels right.</p>{["Explain it from the beginning","Show me a worked example","Check what I understand"].map(p=><button key={p} disabled={!ready||busy||quizBusy} onClick={()=>send(p)}>{p}</button>)}</div>}
     {busy&&<p role="status">Your tutor is working through your question…</p>}<div ref={end}/>
    </div>
    {error&&<p className="flow-error" role="alert">{error}</p>}
    <form className="chat-input" onSubmit={e=>{e.preventDefault();void send();}}>
     <textarea aria-label="Your message to the tutor" maxLength={1800} value={input} onChange={e=>setInput(e.target.value)} rows={2} placeholder="What would you like help with?" onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();void send();}}}/>
     <button className="send-button" type="submit" disabled={!ready||busy||quizBusy||!input.trim()}>Send</button><small>Enter to send · Shift + Enter for a new line</small>
    </form>
   </section>
   <aside className="tutor-insights"><p className="eyebrow">YOUR NEXT STEP</p><h2>{result?.readiness==="ready"?"Try it independently":result?"Keep building":"Start with your tutor"}</h2><p className="flow-note">A short quiz helps check which ideas have stuck.</p>
    {Boolean(result?.difficultyAreas.length)&&<div className="insight-section"><h3>Suggested practice</h3>{result?.difficultyAreas.map(area=><span className="difficulty-tag" key={area}>{area}</span>)}</div>}
    <button className="button primary full" disabled={!ready||busy||quizBusy||!result} onClick={createQuiz}>{quizBusy?"Preparing five questions…":"Practise this topic →"}</button>
    <p className="flow-note">{result?"Five questions based on this topic and the discussion. You can review every answer afterwards.":"Have a conversation first so your practice can focus on what you need."}</p>
   </aside>
  </div>
 </section></main>;
}
