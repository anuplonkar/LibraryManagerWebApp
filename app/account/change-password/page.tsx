// app/account/change-password/page.tsx
"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ChangePasswordPage() {
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function handleChange() {
    setMsg(null);
    if (pwd.length < 8) { setMsg("Password must be at least 8 characters."); return; }
    if (pwd !== pwd2) { setMsg("Passwords do not match."); return; }

    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) { setMsg("Please sign in first."); return; }

    const { error } = await supabase.auth.updateUser({ password: pwd });
    if (error) { setMsg(error.message); return; }
    setMsg("✅ Password updated. Please use the new password next time.");
    setPwd(""); setPwd2("");
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Change Password</h1>
      <input className="w-full rounded border px-3 py-2" type="password" placeholder="New password (min 8 chars)" value={pwd} onChange={(e)=>setPwd(e.target.value)} />
      <input className="w-full rounded border px-3 py-2" type="password" placeholder="Confirm new password" value={pwd2} onChange={(e)=>setPwd2(e.target.value)} />
      <button className="rounded bg-black px-4 py-2 text-white" onClick={handleChange}>Update Password</button>
      {msg && <p className="text-sm text-gray-600">{msg}</p>}
    </div>
  );
}
