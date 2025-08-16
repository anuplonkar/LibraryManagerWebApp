"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Member = {
  id: string;
  member_code: string | null;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  flat_number?: string | null;
  status: string;
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState<Partial<Member>>({
    full_name: "",
    email: "",
    phone: "",
    flat_number: "",
    status: "active",
  });
  const [editing, setEditing] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from("members").select("*").order("created_at", { ascending: false });
    setMembers((data as any) ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = members.filter((m) => {
    const t = (q || "").toLowerCase();
    return [m.member_code || "", m.full_name, m.email || "", m.phone || "", m.flat_number || "", m.status]
      .some((s) => (s || "").toLowerCase().includes(t));
  });

  async function save() {
    if (!form.full_name) return;

    // validate flat_number (<= 5 alphanumeric)
    if (form.flat_number && !/^[A-Za-z0-9]{1,5}$/.test(form.flat_number)) {
      alert("Flat Number must be 1–5 alphanumeric characters");
      return;
    }

    if (editing) {
      await supabase
        .from("members")
        .update({
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          flat_number: form.flat_number,
          status: form.status,
        })
        .eq("id", editing);
    } else {
      await supabase.from("members").insert({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        flat_number: form.flat_number,
        status: form.status ?? "active",
      });
    }
    setForm({ full_name: "", email: "", phone: "", flat_number: "", status: "active" });
    setEditing(null);
    await load();
  }

  async function remove(id: string) {
    await supabase.from("members").delete().eq("id", id);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Search by code, name, email, phone, flat number…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          className="rounded bg-black px-4 py-2 text-white"
          onClick={() => document.getElementById("add")?.scrollIntoView()}
        >
          + Add
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3">Member Code</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Flat No.</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="px-4 py-3">{m.member_code || <span className="text-gray-400">(auto)</span>}</td>
                <td className="px-4 py-3">{m.full_name}</td>
                <td className="px-4 py-3">{m.email}</td>
                <td className="px-4 py-3">{m.phone}</td>
                <td className="px-4 py-3">{m.flat_number}</td>
                <td className="px-4 py-3">{m.status}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    className="rounded border px-3 py-1 mr-2"
                    onClick={() => {
                      setEditing(m.id);
                      setForm(m);
                      document.getElementById("add")?.scrollIntoView();
                    }}
                  >
                    Edit
                  </button>
                  <button className="rounded border px-3 py-1" onClick={() => remove(m.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={7}>
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div id="add" className="rounded-2xl border bg-white p-4">
        <h2 className="text-lg font-semibold mb-3">{editing ? "Edit Member" : "Add Member"}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="rounded border px-3 py-2"
            placeholder="Full Name"
            value={form.full_name || ""}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
          />
          <input
            className="rounded border px-3 py-2"
            placeholder="Email"
            value={form.email || ""}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <input
            className="rounded border px-3 py-2"
            placeholder="Phone"
            value={form.phone || ""}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <input
            className="rounded border px-3 py-2"
            placeholder="Flat No. (e.g. A101)"
            value={form.flat_number || ""}
            onChange={(e) => setForm((f) => ({ ...f, flat_number: e.target.value }))}
          />
          <select
            className="rounded border px-3 py-2"
            value={form.status || "active"}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </div>
        <p className="mt-2 text-xs text-gray-500">Member Code is generated automatically (e.g., M-01000) when you save.</p>
        <div className="mt-3 flex gap-2">
          <button className="rounded bg-black px-4 py-2 text-white" onClick={save}>
            {editing ? "Save changes" : "Add member"}
          </button>
          {editing && (
            <button
              className="rounded border px-4 py-2"
              onClick={() => {
                setEditing(null);
                setForm({ full_name: "", email: "", phone: "", flat_number: "", status: "active" });
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
