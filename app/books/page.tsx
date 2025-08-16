"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Book = { id:string; title:string; author?:string|null; isbn?:string|null; tags?:string[]|null; total_copies:number; copies_available:number };

export default function BooksPage() {
  const [books,setBooks] = useState<Book[]>([]);
  const [q,setQ] = useState("");
  const [form,setForm] = useState<Partial<Book>>({title:"",author:"",isbn:""});
  const [tagsText, setTagsText] = useState<string>(""); // <-- keep raw text with commas here
  const [editing,setEditing] = useState<string|null>(null);

  async function load() {
    const { data } = await supabase.from("books").select("*").order("created_at",{ascending:false});
    setBooks((data as any) ?? []);
  }

  useEffect(()=>{ load(); },[]);

  const filtered = books.filter(b => {
    const t = (q||"").toLowerCase();
    return [b.title, b.author||"", b.isbn||"", (b.tags||[]).join(" ")].some(s => s.toLowerCase().includes(t));
  });

  async function save() {
    if (!form.title) return;

    // turn tagsText into array at save-time
    const tagsArr = tagsText.split(',').map(s=>s.trim()).filter(Boolean);

    if (editing) {
      await supabase.from("books").update({
        title: form.title, author: form.author, isbn: form.isbn, tags: tagsArr,
        total_copies: form.total_copies, copies_available: form.copies_available
      }).eq("id", editing);
    } else {
      await supabase.from("books").insert({
        title: form.title, author: form.author, isbn: form.isbn, tags: tagsArr,
        total_copies: form.total_copies || 1, copies_available: form.copies_available || form.total_copies || 1
      });
    }
    setForm({title:"",author:"",isbn:""});
    setTagsText(""); // reset text
    setEditing(null);
    await load();
  }

  async function remove(id:string) {
    await supabase.from("books").delete().eq("id", id);
    await load();
  }

  function startEdit(b: Book) {
    setEditing(b.id);
    setForm({ id: b.id, title: b.title, author: b.author || "", isbn: b.isbn || "", total_copies: b.total_copies, copies_available: b.copies_available });
    setTagsText((b.tags || []).join(", ")); // show existing tags as comma-separated text
    document.getElementById("add")?.scrollIntoView();
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
                  <button className="rounded border px-3 py-1 mr-2" onClick={()=> startEdit(b)}>Edit</button>
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
          <input className="rounded border px-3 py-2" placeholder="ISBN (e.g., 9780132350884)" value={form.isbn||""} onChange={e=>setForm(f=>({...f,isbn:e.target.value}))}/>
          <input className="rounded border px-3 py-2" placeholder="Tags (comma-separated, e.g., fantasy, classic)" value={tagsText} onChange={e=>setTagsText(e.target.value)}/>
          <input type="number" className="rounded border px-3 py-2" placeholder="Total copies (e.g., 5)" value={form.total_copies === undefined ? "" : form.total_copies} onChange={e=>setForm(f=>({...f,total_copies:parseInt(e.target.value||"0",10)}))}/>
          <input type="number" className="rounded border px-3 py-2" placeholder="Copies available (defaults to total)" value={form.copies_available === undefined ? "" : form.copies_available} onChange={e=>setForm(f=>({...f,copies_available:parseInt(e.target.value||"0",10)}))}/>
        </div>
        <p className="mt-2 text-xs text-gray-500">Enter multiple tags separated by commas. Example: <code>fantasy, classic, tolkien</code></p>
        <div className="mt-3 flex gap-2">
          <button className="rounded bg-black px-4 py-2 text-white" onClick={save}>{editing ? "Save changes" : "Add book"}</button>
          {editing && <button className="rounded border px-4 py-2" onClick={()=>{ setEditing(null); setForm({title:"",author:"",isbn:""}); setTagsText(""); }}>Cancel</button>}
        </div>
      </div>
    </div>
  );
}
