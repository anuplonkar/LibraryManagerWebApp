"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Book = { id:string; title:string; author?:string|null; isbn?:string|null; tags?:string[]|null; total_copies:number; copies_available:number };

export default function BooksPage() {
  const [books,setBooks] = useState<Book[]>([]);
  const [q,setQ] = useState("");
  const [form,setForm] = useState<Partial<Book>>({title:"",author:"",isbn:"",tags:[],total_copies:1,copies_available:1});
  const [editing,setEditing] = useState<string|null>(null);

  async function load() {
    let query = supabase.from("books").select("*").order("created_at",{ascending:false});
    const { data } = await query;
    setBooks((data as any) ?? []);
  }

  useEffect(()=>{ load(); },[]);

  const filtered = books.filter(b => {
    const t = (q||"").toLowerCase();
    return [b.title, b.author||"", b.isbn||"", (b.tags||[]).join(" ")].some(s => s.toLowerCase().includes(t));
  });

  async function save() {
    if (!form.title) return;
    if (editing) {
      await supabase.from("books").update({
        title: form.title, author: form.author, isbn: form.isbn, tags: form.tags,
        total_copies: form.total_copies, copies_available: form.copies_available
      }).eq("id", editing);
    } else {
      await supabase.from("books").insert({
        title: form.title, author: form.author, isbn: form.isbn, tags: form.tags||[],
        total_copies: form.total_copies||1, copies_available: form.copies_available||1
      });
    }
    setForm({title:"",author:"",isbn:"",tags:[],total_copies:1,copies_available:1});
    setEditing(null);
    await load();
  }

  async function remove(id:string) {
    await supabase.from("books").delete().eq("id", id);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <input className="w-full rounded border px-3 py-2" placeholder="Search title, author, ISBN, tag…" value={q} onChange={e=>setQ(e.target.value)}/>
        <button className="rounded bg-black px-4 py-2 text-white" onClick={()=>document.getElementById("add")?.scrollIntoView()}>+ Add</button>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">ISBN</th>
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3">Copies</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(b=>(
              <tr key={b.id} className="border-t">
                <td className="px-4 py-3">{b.title}</td>
                <td className="px-4 py-3">{b.author}</td>
                <td className="px-4 py-3">{b.isbn}</td>
                <td className="px-4 py-3">{(b.tags||[]).join(", ")}</td>
                <td className="px-4 py-3">{b.copies_available}/{b.total_copies}</td>
                <td className="px-4 py-3 text-right">
                  <button className="rounded border px-3 py-1 mr-2" onClick={()=>{
                    setEditing(b.id);
                    setForm(b);
                    document.getElementById("add")?.scrollIntoView();
                  }}>Edit</button>
                  <button className="rounded border px-3 py-1" onClick={()=>remove(b.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length===0 && <tr><td className="px-4 py-6 text-gray-500" colSpan={6}>No books found.</td></tr>}
          </tbody>
        </table>
      </div>

      <div id="add" className="rounded-2xl border bg-white p-4">
        <h2 className="text-lg font-semibold mb-3">{editing ? "Edit Book" : "Add Book"}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded border px-3 py-2" placeholder="Title" value={form.title||""} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/>
          <input className="rounded border px-3 py-2" placeholder="Author" value={form.author||""} onChange={e=>setForm(f=>({...f,author:e.target.value}))}/>
          <input className="rounded border px-3 py-2" placeholder="ISBN" value={form.isbn||""} onChange={e=>setForm(f=>({...f,isbn:e.target.value}))}/>
          <input className="rounded border px-3 py-2" placeholder="Tags (comma separated)" value={(form.tags||[]).join(", ")} onChange={e=>setForm(f=>({...f,tags:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)}))}/>
          <input type="number" className="rounded border px-3 py-2" placeholder="Total copies" value={form.total_copies||1} onChange={e=>setForm(f=>({...f,total_copies:parseInt(e.target.value||"1",10)}))}/>
          <input type="number" className="rounded border px-3 py-2" placeholder="Copies available" value={form.copies_available||1} onChange={e=>setForm(f=>({...f,copies_available:parseInt(e.target.value||"1",10)}))}/>
        </div>
        <div className="mt-3 flex gap-2">
          <button className="rounded bg-black px-4 py-2 text-white" onClick={save}>{editing ? "Save changes" : "Add book"}</button>
          {editing && <button className="rounded border px-4 py-2" onClick={()=>{ setEditing(null); setForm({title:"",author:"",isbn:"",tags:[],total_copies:1,copies_available:1}); }}>Cancel</button>}
        </div>
      </div>
    </div>
  );
}
