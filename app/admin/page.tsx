// app/admin/page.tsx
"use client";
import { useEffect, useState } from "react";

type CreateUserResp = { email:string; password:string; userId:string; fullName:string; role:string };

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState<string>("");
  const [stored, setStored] = useState(false);

  // Create user form
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("staff");
  const [createOut, setCreateOut] = useState<CreateUserResp | null>(null);
  const [createErr, setCreateErr] = useState<string | null>(null);

  // Assign role form
  const [assignEmail, setAssignEmail] = useState("");
  const [assignUserId, setAssignUserId] = useState("");
  const [assignRoleVal, setAssignRoleVal] = useState("staff");
  const [assignMsg, setAssignMsg] = useState<string | null>(null);

  // Import status
  const [importMsg, setImportMsg] = useState<string | null>(null);

  useEffect(() => {
    const k = localStorage.getItem("ud_admin_key");
    if (k) { setAdminKey(k); setStored(true); }
  }, []);

  function saveKey() {
    if (!adminKey) return;
    localStorage.setItem("ud_admin_key", adminKey);
    setStored(true);
  }
  function clearKey() {
    localStorage.removeItem("ud_admin_key");
    setAdminKey("");
    setStored(false);
  }

  async function createUser() {
    setCreateErr(null); setCreateOut(null);
    const res = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({ fullName, role })
    });
    if (!res.ok) { const t = await res.text(); setCreateErr(t || res.statusText); return; }
    const data = await res.json();
    setCreateOut(data);
  }

  async function assignRole() {
    setAssignMsg(null);
    const res = await fetch("/api/admin/assign-role", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({ role: assignRoleVal, email: assignEmail || undefined, user_id: assignUserId || undefined })
    });
    const t = await res.text();
    setAssignMsg(res.ok ? t || "Updated." : "Error: " + (t || res.statusText));
  }

  async function handleImport(file: File, type: "books" | "members") {
    setImportMsg(null);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`/api/admin/import-${type}`, {
      method: "POST",
      headers: { "x-admin-key": adminKey },
      body: formData
    });
    const t = await res.text();
    setImportMsg(res.ok ? t : "Error: " + (t || res.statusText));
  }

  function pickFile(type: "books" | "members") {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = () => {
      if (input.files?.[0]) handleImport(input.files[0], type);
    };
    input.click();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>

      {/* Admin key */}
      <div className="rounded-2xl border bg-white p-4 space-y-2">
        <h2 className="font-medium">Admin Key</h2>
        <div className="flex gap-2">
          <input className="rounded border px-3 py-2 w-full" placeholder="Enter ADMIN_DASHBOARD_KEY" value={adminKey} onChange={e=>setAdminKey(e.target.value)} />
          <button className="rounded bg-black px-4 py-2 text-white" onClick={saveKey}>Save</button>
          {stored && <button className="rounded border px-4 py-2" onClick={clearKey}>Clear</button>}
        </div>
        <p className="text-xs text-gray-500">Stored in your browser’s localStorage.</p>
      </div>

      {/* Create user */}
      <div className="rounded-2xl border bg-white p-4 space-y-3">
        <h2 className="font-medium">Create Staff/Admin User</h2>
        <div className="grid gap-2 md:grid-cols-3">
          <input className="rounded border px-3 py-2" placeholder="Full name (e.g., Jane Librarian)" value={fullName} onChange={e=>setFullName(e.target.value)} />
          <select className="rounded border px-3 py-2" value={role} onChange={e=>setRole(e.target.value)}>
            <option value="staff">staff</option>
            <option value="admin">admin</option>
          </select>
          <button className="rounded bg-black px-4 py-2 text-white" onClick={createUser}>Create</button>
        </div>
        {createOut && (
          <div className="rounded border p-3 text-sm">
            <div className="font-medium mb-1">Created:</div>
            <div>Email: <code>{createOut.email}</code></div>
            <div>Password: <code>{createOut.password}</code></div>
            <div>User ID: <code>{createOut.userId}</code></div>
            <div>Name/Role: {createOut.fullName} — {createOut.role}</div>
            <p className="text-xs text-gray-500 mt-2">Share credentials securely and ask the user to change password at <code>/account/change-password</code>.</p>
          </div>
        )}
        {createErr && <p className="text-sm text-red-600">{createErr}</p>}
      </div>

      {/* Assign role */}
      <div className="rounded-2xl border bg-white p-4 space-y-3">
        <h2 className="font-medium">Assign Role</h2>
        <div className="grid gap-2 md:grid-cols-4">
          <input className="rounded border px-3 py-2" placeholder="Email (or leave blank to use user_id)" value={assignEmail} onChange={e=>setAssignEmail(e.target.value)} />
          <input className="rounded border px-3 py-2" placeholder="User ID (uuid)" value={assignUserId} onChange={e=>setAssignUserId(e.target.value)} />
          <select className="rounded border px-3 py-2" value={assignRoleVal} onChange={e=>setAssignRoleVal(e.target.value)}>
            <option value="staff">staff</option>
            <option value="admin">admin</option>
          </select>
          <button className="rounded bg-black px-4 py-2 text-white" onClick={assignRole}>Update</button>
        </div>
        {assignMsg && <p className="text-sm">{assignMsg}</p>}
      </div>

      {/* CSV Imports (replace Seed Books) */}
      <div className="rounded-2xl border bg-white p-4 space-y-3">
        <h2 className="font-medium">CSV Imports</h2>
        <div className="flex gap-4">
          <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" onClick={()=>pickFile("books")}>
            Import Books CSV
          </button>
          <button className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700" onClick={()=>pickFile("members")}>
            Import Members CSV
          </button>
        </div>
        {importMsg && <p className="text-sm mt-2">{importMsg}</p>}
        <p className="text-xs text-gray-500">Accepted: .csv with headers. See <code>/public/samples</code> for examples.</p>
      </div>
    </div>
  );
}
