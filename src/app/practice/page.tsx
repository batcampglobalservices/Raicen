"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import LearningNav from "@/components/learning-nav";
import type { PracticeResult } from "@/db/practice-schema";
type Quiz={id:string;topic:string;questions:{question:string;options:string[];skill:string}[];result:PracticeResult|null};
async function fetchPractice():Promise<Quiz> {
 const id=new URLSearchParams(location.search).get("id")??"";
 const response=await fetch("/api/practice?id="+encodeURIComponent(id));
 const data=await response.json();
 if(!response.ok)throw Error(data.error);
 return data;
}
export default function PracticePage() {
 const [quiz,setQuiz]=useState<Quiz|null>(null);
 const [answers,setAnswers]=useState<Record<number,number>>({});
 const [step,setStep]=useState(0);
 const [busy,setBusy]=useState(true);
 const [error,setError]=useState("");
 const questionRef=useRef<HTMLFieldSetElement>(null);
 useEffect(()=>{questionRef.current?.focus({preventScroll:true});questionRef.current?.scrollIntoView({block:"nearest"});},[step,quiz?.id]);
 function load() {
  return fetchPractice().then(data=>{setError("");setQuiz(data);const saved=sessionStorage.getItem("answers:"+data.id);if(saved)setAnswers(JSON.parse(saved));}).catch(e=>setError(e instanceof Error?e.message:"Unable to load practice.")).finally(()=>setBusy(false));
 }
 useEffect(()=>{void load();},[]);
 function choose(index:number) {
  const next={...answers,[step]:index};setAnswers(next);
  if(quiz)sessionStorage.setItem("answers:"+quiz.id,JSON.stringify(next));
 }
 async function submit() {
  if(!quiz)return;setBusy(true);setError("");
  try {
   const response=await fetch("/api/practice",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"submit",id:quiz.id,answers:quiz.questions.map((_,i)=>answers[i])})});
   const data=await response.json();if(!response.ok)throw Error(data.error);
   setQuiz({...quiz,result:data});sessionStorage.removeItem("answers:"+quiz.id);
  }catch(e){setError(e instanceof Error?e.message:"Unable to submit. Please retry.");}finally{setBusy(false);}
 }
 const q=quiz?.questions[step];
 return <main><LearningNav/><section className="practice-shell">
  <Link className="back-link" href="/tutor">← Return to your tutor</Link>
  {error && <div role="alert" className="flow-error"><p>{error}</p><button onClick={quiz?submit:load} disabled={busy}>Try again</button></div>}
  {!quiz ? <p role="status">{busy?"Loading your quiz…":""}</p> : quiz.result ? <>
   <p className="eyebrow">{quiz.topic} · PRACTICE COMPLETE</p><h1>{quiz.result.score} out of {quiz.result.total}</h1>
   <p className="flow-lede">Review what worked, then return to your tutor for the parts that need another explanation.</p>
   <p className="save-status">{quiz.result.saved?"Saved to your learning record.":"This result is available here. Sign in before your next quiz to save future results to your learning record."}</p>
   {quiz.result.feedback.map((f,i)=><article className="review-card" key={i}><p className="eyebrow">{f.answer===f.chosen?"✓ CORRECT":"LET’S REVIEW"} · {f.skill}</p><h2>{f.question}</h2><p>Your answer: {f.options[f.chosen]}</p>{f.chosen!==f.answer && <p><strong>Correct answer: {f.options[f.answer]}</strong></p>}<p>{f.explanation}</p></article>)}
   <div className="flow-actions"><Link className="button primary flow-link" onClick={()=>{const mistakes=quiz.result!.feedback.filter(f=>f.answer!==f.chosen);sessionStorage.setItem("edulearn:review",JSON.stringify({topic:quiz.topic,message:mistakes.length?"Help me understand these mistakes from my practice. Explain one at a time: "+mistakes.map(f=>f.question+" I chose "+f.options[f.chosen]+". The correct answer was "+f.options[f.answer]+".").join("\n"):"I completed the practice successfully. Give me a harder example to check whether I can apply the ideas."}));}} href={"/tutor?topic="+encodeURIComponent(quiz.topic)}>Review with my tutor</Link><Link className="text-button" href={quiz.result.saved?"/progress":"/account"}>{quiz.result.saved?"See saved progress":"Create a learning account"}</Link></div>
  </> : q ? <>
   <p className="eyebrow">{quiz.topic} · FOCUSED PRACTICE</p><h1>One question at a time.</h1>
   <p>Question {step+1} of {quiz.questions.length} · {Object.keys(answers).length} answered</p><progress value={Object.keys(answers).length} max={quiz.questions.length} aria-label="Quiz completion"/>
   <fieldset ref={questionRef} tabIndex={-1} className="practice-question"><legend>{q.question}</legend>{q.options.map((option,i)=><label key={i} className={answers[step]===i?"practice-option chosen":"practice-option"}><input type="radio" name={"question-"+step} value={i} checked={answers[step]===i} onChange={()=>choose(i)}/><span>{option}</span></label>)}</fieldset>
   <div className="flow-actions"><button className="button" disabled={step===0 || busy} onClick={()=>setStep(step-1)}>Previous</button>{step<quiz.questions.length-1?<button className="button primary" disabled={answers[step]===undefined} onClick={()=>setStep(step+1)}>Next question →</button>:<button className="button primary" onClick={submit} disabled={busy || quiz.questions.some((_,i)=>answers[i]===undefined)}>{busy?"Saving your result…":"Submit practice"}</button>}</div>
   <p className="flow-note">Your answers stay in this tab if you refresh. You can change them before submitting.</p>
  </>:null}
 </section></main>;
}
