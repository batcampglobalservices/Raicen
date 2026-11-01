"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Conversation={id:string;title:string;updatedAt:string};
export default function ConversationHistory({activeId}:{activeId?:string}){
 const [items,setItems]=useState<Conversation[]>([]);
 useEffect(()=>{fetch("/api/conversations").then(r=>r.ok?r.json():{conversations:[]}).then(data=>setItems(data.conversations??[])).catch(()=>undefined);},[]);
 return <section className="conversation-history"><p className="eyebrow">RECENT CHATS</p>{items.length?items.slice(0,8).map(item=><Link key={item.id} href={"/dashboard/chat?id="+item.id} className={item.id===activeId?"history-link active":"history-link"}>{item.title}</Link>):<p className="history-empty">Your chats will appear here.</p>}</section>;
}
