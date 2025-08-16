"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type AppUser = { full_name: string; role: string };

export default function Dashboard() {
  const [stats, setStats] = useState<{books:number; members:number; loans:number; overdue:number}>({
    books: 0, members: 0, loans: 0, overdue: 0
  });
  const [users, setUsers] = useState<AppUser[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: books }, { data: loans }, { data: members }, { data: appUsers }] = await Promise.all([
        supabase.from("books").select("id"),
        supabase.from("loans").select("id, due_at, returned_at"),
        supabase.from("members").select("id"),
        supabase.from("app_users").select("full_name, role").order("created_at", { ascending: true }),
      ]);

      const booksCount = books?.length ?? 0;
      const membersCount = members?.length ?? 0;
      const activeLoans = (loans ?? []).filter((l:any)=>!l.returned_at).length;
      const now = new Date();
      const overdue = (loans ?? []).filter((l:any)=>!l.returned_at && new Date(l.due_at) < now).length;

      setStats({ books: booksCount, members: membersCount, loans: activeLoans, overdue });
      setUsers((appUsers as any) ?? []);
    })();
  }, []);

  const Card = ({label,value}:{label:string;value:number}) => (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card label="Books" value={stats.books}/>
        <Card label="Members" value={stats.members}/>
        <Card label="Active Loans" value={stats.loans}/>
        <Card label="Overdue" value={stats.overdue}/>
      </div>

      {/* App Users panel */}
      <div className="rounded-2xl border bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">App Users</h2>
          <div className="text-sm text-gray-500">
            {users.length} total{users.length > 0 && ", "}
            {users.length > 0 && (() => {
              const counts = users.reduce((acc:Record<string,number>, u) => {
                acc[u.role] = (acc[u.role] || 0) + 1; return acc;
              }, {});
              return Object.entries(counts).map(([role, n]) => `${role}: ${n}`).join(" · ");
            })()}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">{u.full_name}</td>
                  <td className="px-4 py-2 capitalize">{u.role}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-gray-500" colSpan={2}>No app users found yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
