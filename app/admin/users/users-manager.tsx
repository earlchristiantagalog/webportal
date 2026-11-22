"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import styles from "./users.module.css";

type Role = "STUDENT" | "TEACHER";
type User = { id: string; name: string; email: string; role: Role; sectionId: string | null; isActive: boolean };
type Section = { id: string; grade: string; name: string };
type Form = { name: string; email: string; role: Role; sectionId: string };
const emptyForm: Form = { name: "", email: "", role: "STUDENT", sectionId: "" };

async function json<T>(response: Response): Promise<T> {
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data && typeof data === "object" && "error" in data && typeof data.error === "string"
      ? data.error : "The request could not be completed.");
  }
  return data as T;
}

async function fetchProfiles(signal?: AbortSignal) {
  const [userRes, sectionRes] = await Promise.all([
    fetch("/api/admin/users", { cache: "no-store", signal }),
    fetch("/api/admin/sections", { cache: "no-store", signal }),
  ]);
  const [userData, sectionData] = await Promise.all([
    json<{ users: User[] }>(userRes), json<{ sections: Section[] }>(sectionRes),
  ]);
  return { users: userData.users, sections: sectionData.sections };
}

export default function UsersManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState<{ text: string; success: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Form>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | Role>("ALL");

  useEffect(() => {
    const controller = new AbortController();
    fetchProfiles(controller.signal).then((data) => {
      if (!controller.signal.aborted) {
        setUsers(data.users);
        setSections(data.sections);
        setLoading(false);
      }
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) {
        setLoadError(error instanceof Error ? error.message : "Could not load profiles.");
        setLoading(false);
      }
    });
    return () => controller.abort();
  }, []);

  async function retry() {
    setLoading(true);
    setLoadError("");
    try {
      const data = await fetchProfiles();
      setUsers(data.users);
      setSections(data.sections);
      setLoading(false);
    }
    catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load profiles.");
      setLoading(false);
    }
  }

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setNotice(null);
    setShowForm(true);
  }

  function edit(user: User) {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, role: user.role, sectionId: user.sectionId ?? "" });
    setNotice(null);
    setShowForm(true);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch(editingId ? `/api/admin/users/${encodeURIComponent(editingId)}` : "/api/admin/users", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sectionId: form.role === "STUDENT" ? form.sectionId || null : null }),
      });
      const { user } = await json<{ user: User }>(response);
      setUsers((current) => editingId
        ? current.map((item) => item.id === user.id ? user : item)
        : [user, ...current]);
      setNotice({ text: `${user.name}'s profile was ${editingId ? "updated" : "saved"}.`, success: true });
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : "Could not save profile.", success: false });
    } finally {
      setBusy(false);
    }
  }

  async function toggle(user: User) {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const { user: updated } = await json<{ user: User }>(await fetch(`/api/admin/users/${encodeURIComponent(user.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      }));
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNotice({ text: `${updated.name}'s profile is now ${updated.isActive ? "active" : "inactive"}.`, success: true });
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : "Could not update status.", success: false });
    } finally {
      setBusy(false);
    }
  }

  const visible = useMemo(() => users.filter((user) =>
    (filter === "ALL" || user.role === filter) &&
    `${user.name} ${user.email}`.toLowerCase().includes(query.trim().toLowerCase())
  ), [users, filter, query]);
  const sectionNames = new Map(sections.map((section) => [section.id, `${section.grade} – ${section.name}`]));

  if (loading) return <div className={`card ${styles.loading}`} role="status"><span className="spinner-border spinner-border-sm text-success" aria-hidden="true" /> Loading profiles...</div>;
  if (loadError) return <div className="alert alert-warning" role="alert"><strong>Users could not be loaded.</strong><p className="mt-1 mb-2">{loadError}</p><button className="btn btn-sm btn-outline-dark" onClick={retry}>Try again</button></div>;

  return (
    <>
      <div className="row g-3 mb-4">
        <div className="col-sm-4"><div className={styles.metric}><span>Total profiles</span><strong>{users.length.toString().padStart(2, "0")}</strong><small>Students and teachers</small></div></div>
        <div className="col-sm-4"><div className={styles.metric}><span>Students</span><strong>{users.filter((user) => user.role === "STUDENT").length.toString().padStart(2, "0")}</strong><small>Registered profiles</small></div></div>
        <div className="col-sm-4"><div className={styles.metric}><span>Teachers</span><strong>{users.filter((user) => user.role === "TEACHER").length.toString().padStart(2, "0")}</strong><small>Registered profiles</small></div></div>
      </div>
      <section className={styles.panel} aria-labelledby="users-heading">
        <div className={styles.heading}>
          <div><h2 id="users-heading">People directory</h2><p>Keep school profiles organized and up to date.</p></div>
          <button type="button" className={`btn btn-success ${styles.primaryButton}`} onClick={openNew} disabled={busy}>+ Add user</button>
        </div>
        {notice && <div className={`alert alert-${notice.success ? "success" : "warning"} ${styles.notice}`} role="alert">{notice.text}</div>}
        {showForm && (
          <form className={styles.form} onSubmit={save}>
            <div className={styles.formTop}><h3>{editingId ? "Edit profile" : "New profile"}</h3><button type="button" className="btn btn-sm btn-outline-secondary" disabled={busy} onClick={() => { setShowForm(false); setNotice(null); }}>Cancel</button></div>
            <div className="row g-3">
              <div className="col-md-6"><label className="form-label" htmlFor="user-name">Full name *</label><input id="user-name" className="form-control" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} maxLength={100} required disabled={busy} placeholder="e.g. Maria Reyes" /></div>
              <div className="col-md-6"><label className="form-label" htmlFor="user-email">Email address *</label><input id="user-email" type="email" className="form-control" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} maxLength={254} required disabled={busy} placeholder="name@example.com" /></div>
              <div className="col-md-6"><label className="form-label" htmlFor="user-role">Role *</label><select id="user-role" className="form-select" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as Role, sectionId: "" })} disabled={busy}><option value="STUDENT">Student</option><option value="TEACHER">Teacher</option></select></div>
              {form.role === "STUDENT" && <div className="col-md-6"><label className="form-label" htmlFor="user-section">Section (optional)</label><select id="user-section" className="form-select" value={form.sectionId} onChange={(event) => setForm({ ...form, sectionId: event.target.value })} disabled={busy}><option value="">Not assigned</option>{sections.map((section) => <option key={section.id} value={section.id}>{section.grade} – {section.name}</option>)}</select></div>}
            </div>
            <div className={styles.formBottom}><span>Profiles do not grant login access.</span><button type="submit" className={`btn btn-success ${styles.primaryButton}`} disabled={busy}>{busy ? "Saving..." : editingId ? "Save changes" : "Save profile"}</button></div>
          </form>
        )}
        <div className={styles.toolbar}>
          <label className="visually-hidden" htmlFor="user-search">Search users</label>
          <input id="user-search" className="form-control" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or email..." />
          <label className="visually-hidden" htmlFor="user-filter">Filter by role</label>
          <select id="user-filter" className="form-select" value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}><option value="ALL">All roles</option><option value="STUDENT">Students</option><option value="TEACHER">Teachers</option></select>
          <span>{visible.length} shown</span>
        </div>
        {visible.length ? (
          <div className="table-responsive"><table className={`table table-hover align-middle mb-0 ${styles.table}`}>
            <thead><tr><th scope="col">NAME</th><th scope="col">ROLE</th><th scope="col">SECTION</th><th scope="col">STATUS</th><th scope="col"><span className="visually-hidden">Actions</span></th></tr></thead>
            <tbody>{visible.map((user) => <tr key={user.id}>
              <td><div className={styles.person}><span className={styles.avatar}>{user.name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span><span><strong>{user.name}</strong><small>{user.email}</small></span></div></td>
              <td><span className={`${styles.role} ${user.role === "STUDENT" ? styles.student : styles.teacher}`}>{user.role === "STUDENT" ? "Student" : "Teacher"}</span></td>
              <td>{user.sectionId ? sectionNames.get(user.sectionId) ?? "Unassigned" : "—"}</td>
              <td><span className={`${styles.status} ${user.isActive ? styles.active : styles.inactive}`}>{user.isActive ? "Active" : "Inactive"}</span></td>
              <td><div className={styles.actions}><button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => edit(user)} disabled={busy}>Edit</button><button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => toggle(user)} disabled={busy}>{user.isActive ? "Deactivate" : "Reactivate"}</button></div></td>
            </tr>)}</tbody>
          </table></div>
        ) : <div className={styles.empty}><span aria-hidden="true">◎</span><strong>{users.length ? "No matching users" : "No user profiles yet"}</strong><p>{users.length ? "Try a different search or role filter." : "Add a student or teacher to get started."}</p></div>}
        <div className={styles.footer}>Profiles are saved to Neon. Admin API access is development-only until authentication is configured.</div>
      </section>
    </>
  );
}
