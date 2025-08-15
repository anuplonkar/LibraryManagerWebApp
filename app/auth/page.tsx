"use client";
import { useState } from "react";
import { signIn, signOut, getSession } from "@/lib/auth";

export default function AuthPage() {
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [msg,setMsg] = useState("");

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <input className="w-full rounded border px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
      <input className="w-full rounded border px-3 py-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
      <div className="flex gap-2">
        <button className="rounded bg-black px-4 py-2 text-white" onClick={async ()=>{
          try { await signIn(email,password); setMsg("Signed in."); } catch(e:any){ setMsg(e.message); }
        }}>Sign in</button>
        <button className="rounded border px-4 py-2" onClick={async()=>{ await signOut(); setMsg("Signed out."); }}>Sign out</button>
        <button className="rounded border px-4 py-2" onClick={async()=>{ const s=await getSession(); setMsg(s ? "Session active" : "No session"); }}>Check session</button>
      </div>
      {msg && <p className="text-sm text-gray-600">{msg}</p>}
    </div>
  );
}
