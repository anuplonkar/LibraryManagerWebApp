"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
  const [stats, setStats] = useState<{books:number; available:number; loans:number; overdue:number}>({books:0, available:0, loans:0, overdue:0});

  useEffect(() => {
    (async () => {
      const [{ data: books }, { data: loans }] = await Promise.all([
        supabase.from("books").select("id, copies_available"),
        supabase.from("loans").select("id, due_at, returned_at"),
      ]);

      const booksCount = books?.length ?? 0;
      const available = (books ?? []).reduce((a:any,b:any)=> a + (b.copies_available ?? 0), 0);
      const activeLoans = (loans ?? []).filter((l:any)=>!l.returned_at).length;
      const now = new Date();
      const overdue = (loans ?? []).filter((l:any)=>!l.returned_at && new Date(l.due_at) < now).length;

      setStats({books: booksCount, available, loans: activeLoans, overdue});
    })();
  }, []);

  const Card = ({label,value}:{label:string;value:number}) => (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card label="Books" value={stats.books}/>
      <Card label="Copies Available" value={stats.available}/>
      <Card label="Active Loans" value={stats.loans}/>
      <Card label="Overdue" value={stats.overdue}/>
    </div>
  );
}
