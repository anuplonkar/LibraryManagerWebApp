"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Member = { id:string; member_code:string; full_name:string; };
type Book = { id:string; title:string; copies_available:number; };
type Loan = { id:string; member_id:string; book_id:string; issued_at:string; due_at:string; returned_at:string|null; };

export default function LoansPage() {
  const [members,setMembers] = useState<Member[]>([]);
  const [books,setBooks] = useState<Book[]>([]);
  const [loans,setLoans] = useState<Loan[]>([]);
  const [selMember,setSelMember] = useState<string>("");
  const [selBook,setSelBook] = useState<string>("");
  const [due,setDue] = useState<string>("");

  async function load() {
    const [{ data: m }, { data: b }, { data: l }] = await Promise.all([
      supabase.from("members").select("id,member_code,full_name").eq("status","active"),
      supabase.from("books").select("id,title,copies_available"),
      supabase.from("loans").select("*").order("issued_at",{ascending:false})
    ]);
    setMembers((m as any) ?? []);
    setBooks(((b as any) ?? []).filter((x:any)=> (x.copies_available ?? 0) > 0));
    setLoans((l as any) ?? []);
  }

  useEffect(()=>{ load(); },[]);

  async function issue() {
    if (!selMember || !selBook || !due) return;

    const { data: book } = await supabase.from("books").select("copies_available").eq("id", selBook).single();
    if (!book || book.copies_available <= 0) return;

    const session = await supabase.auth.getSession();
    const issuedBy = session.data.session?.user?.id;
    if (!issuedBy) { alert("Please sign in"); return; }

    const { error: loanErr } = await supabase.from("loans").insert({
      member_id: selMember, book_id: selBook, due_at: new Date(due).toISOString(), issued_by: issuedBy
    });
    if (!loanErr) {
      await supabase.from("books").update({ copies_available: book.copies_available - 1 }).eq("id", selBook);
      await supabase.from("audit_log").insert({ actor: issuedBy, action: "issue", details: { member_id: selMember, book_id: selBook, due_at: due }});
      setSelBook(""); setSelMember(""); setDue("");
      await load();
    }
  }

  async function returnLoan(loan: Loan) {
    if (loan.returned_at) return;
    const { error } = await supabase.from("loans").update({ returned_at: new Date().toISOString() }).eq("id", loan.id);
    if (!error) {
      const { data: book } = await supabase.from("books").select("copies_available").eq("id", loan.book_id).single();
      await supabase.from("books").update({ copies_available: (book?.copies_available ?? 0) + 1 }).eq("id", loan.book_id);

      const session = await supabase.auth.getSession();
      const userId = session.data.session?.user?.id;
      await supabase.from("audit_log").insert({ actor: userId, action: "return", details: { loan_id: loan.id }});
      await load();
    }
  }

  const active = loans.filter(l=>!l.returned_at);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="text-lg font-semibold mb-3">Issue a Loan</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <select className="rounded border px-3 py-2" value={selMember} onChange={e=>setSelMember(e.target.value)}>
            <option value="">Select member</option>
            {members.map(m=> <option key={m.id} value={m.id}>{m.member_code} — {m.full_name}</option>)}
          </select>
          <select className="rounded border px-3 py-2" value={selBook} onChange={e=>setSelBook(e.target.value)}>
            <option value="">Select book (available)</option>
            {books.map(b=> <option key={b.id} value={b.id}>{b.title}</option>)}
          </select>
          <input className="rounded border px-3 py-2" type="date" value={due} onChange={e=>setDue(e.target.value)}/>
          <button className="rounded bg-black px-4 py-2 text-white" onClick={issue}>Issue</button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Book</th>
              <th className="px-4 py-3">Issued</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {active.map(l=>(
              <LoanRow key={l.id} loan={l} onReturn={()=>returnLoan(l)}/>
            ))}
            {active.length===0 && <tr><td className="px-4 py-6 text-gray-500" colSpan={6}>No active loans.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LoanRow({loan, onReturn}:{loan:Loan; onReturn:()=>void}) {
  const [bookTitle,setBookTitle] = useState("-");
  const [memberName,setMemberName] = useState("-");
  useEffect(()=>{
    (async ()=>{
      const { data: b } = await supabase.from("books").select("title").eq("id", loan.book_id).single();
      const { data: m } = await supabase.from("members").select("full_name,member_code").eq("id", loan.member_id).single();
      setBookTitle(b?.title || "-");
      setMemberName(m ? `${m.member_code} — ${m.full_name}` : "-");
    })();
  },[loan.book_id, loan.member_id]);

  const overdue = new Date(loan.due_at) < new Date();

  return (
    <tr className="border-t">
      <td className="px-4 py-3">{memberName}</td>
      <td className="px-4 py-3">{bookTitle}</td>
      <td className="px-4 py-3">{new Date(loan.issued_at).toLocaleDateString()}</td>
      <td className="px-4 py-3">{new Date(loan.due_at).toLocaleDateString()}</td>
      <td className={`px-4 py-3 ${overdue ? "text-red-600 font-medium" : ""}`}>{overdue ? "Overdue" : "On time"}</td>
      <td className="px-4 py-3 text-right">
        {!loan.returned_at && <button className="rounded border px-3 py-1" onClick={onReturn}>Mark Returned</button>}
      </td>
    </tr>
  );
}
