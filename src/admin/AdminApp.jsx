import { useCallback, useEffect, useMemo, useState } from "react";
import { apiBaseUrl } from "../lib/api";
import { adminRequest, clearAdminToken, getAdminToken, setAdminToken } from "../lib/adminApi";
import "./admin.css";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "grid" },
  { id: "projects", label: "Projects", icon: "layers" },
  { id: "messages", label: "Contact messages", icon: "mail" },
  { id: "resume", label: "Resume & files", icon: "file" },
  { id: "settings", label: "Settings", icon: "settings" },
];

const paths = {
  grid: <><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="5" rx="2"/><rect x="13" y="10" width="8" height="11" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/></>,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.5.9L16 20.7h-2.8l-.4-1.8a8 8 0 0 1-1.6-.6l-1.6.8-2-2 1-1.6a8 8 0 0 1-.5-1.6l-1.8-.6v-2.8l1.8-.5a8 8 0 0 1 .7-1.6L8 6.8l2-2 1.6.9a8 8 0 0 1 1.6-.5l.6-1.8h2.8l.5 1.8a8 8 0 0 1 1.6.7l1.6-.8 2 2-.9 1.6a8 8 0 0 1 .5 1.6l1.8.6v2.8l-1.8.5a8 8 0 0 1-.5 1.2Z" transform="translate(-2 -1) scale(.95)"/></>,
  search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
  close: <><path d="m18 6-12 12M6 6l12 12"/></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></>,
  external: <><path d="M14 3h7v7M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></>,
  arrow: <><path d="M7 17 17 7M7 7h10v10"/></>,
};

function Icon({ name, size = 19 }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

const dateFormat = (value) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
const shortDate = (value) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value)) : "—";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await adminRequest("admin/login/", { method: "POST", body: JSON.stringify({ username: username.trim(), password }) });
      setAdminToken(data.token);
      onLogin({ username: data.username, email: data.email });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return <div className="admin-login-wrap">
    <div className="admin-login-aside">
      <div className="admin-brand-mark">EA</div>
      <p className="admin-eyebrow">PORTFOLIO CONTROL CENTER</p>
      <h1>Your work,<br/>well presented.</h1>
      <p className="admin-login-copy">A focused workspace to keep your projects current and your conversations close.</p>
      <div className="admin-aside-bottom"><span className="admin-live-dot"/> Private administrator access</div>
    </div>
    <div className="admin-login-main">
      <form className="admin-login-card" onSubmit={submit}>
        <span className="admin-login-kicker">WELCOME BACK</span>
        <h2>Sign in to your dashboard</h2>
        <p>Use the Django administrator username and password you created.</p>
        {!apiBaseUrl && <div className="admin-alert admin-alert--error">The API URL is missing. Configure <code>VITE_API_BASE_URL</code> and restart the frontend.</div>}
        {error && <div className="admin-alert admin-alert--error" role="alert">{error}</div>}
        <label className="admin-field"><span>Username or email</span><input autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required /></label>
        <label className="admin-field"><span>Password</span><div className="admin-password-field"><input type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /><button type="button" className="admin-text-button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Hide" : "Show"}</button></div></label>
        <button className="admin-primary-button admin-login-button" type="submit" disabled={busy || !apiBaseUrl}>{busy ? "Signing in…" : "Sign in"}<Icon name="chevron" size={17}/></button>
        <a className="admin-back-link" href={import.meta.env.BASE_URL}>← Back to public portfolio</a>
      </form>
    </div>
  </div>;
}

function Sidebar({ page, setPage, onLogout, mobileOpen, closeMobile, user, collapsed, toggleCollapsed }) {
  return <>
    {mobileOpen && <button type="button" className="admin-mobile-scrim" aria-label="Close navigation" onClick={closeMobile}/>}
    <aside className={`admin-sidebar${mobileOpen ? " is-open" : ""}${collapsed ? " is-collapsed" : ""}`}>
      <div className="admin-brand-row"><a className="admin-brand" href="#/admin/dashboard"><span className="admin-brand-mark">EA</span><span><strong>Ebisa Ajema</strong><small>Portfolio studio</small></span></a><button className="admin-collapse-toggle" onClick={toggleCollapsed} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}><Icon name="chevron" size={16}/></button></div>
      <div className="admin-workspace"><span className="admin-avatar">{(user?.username || "E").slice(0, 1).toUpperCase()}</span><span><strong>Workspace</strong><small>Personal portfolio</small></span><span className="admin-workspace-dot"/></div>
      <div className="admin-nav-label">WORKSPACE</div>
      <nav className="admin-side-nav" aria-label="Admin navigation">
        {navItems.map((item) => <a key={item.id} href={`#/admin/${item.id}`} onClick={() => { setPage(item.id); closeMobile(); }} className={`admin-nav-link${page === item.id ? " is-active" : ""}`} aria-current={page === item.id ? "page" : undefined}><Icon name={item.icon}/><span>{item.label}</span></a>)}
      </nav>
      <div className="admin-sidebar-bottom">
        <a className="admin-nav-link" href={import.meta.env.BASE_URL} target="_blank" rel="noreferrer"><Icon name="external"/><span>View public portfolio</span></a>
        <button className="admin-nav-link admin-logout-link" onClick={onLogout}><Icon name="logout"/><span>Sign out</span></button>
        <div className="admin-sidebar-user"><span className="admin-avatar">{(user?.username || "E").slice(0, 1).toUpperCase()}</span><span><strong>{user?.username || "Administrator"}</strong><small>Administrator</small></span><button onClick={onLogout} aria-label="Sign out"><Icon name="logout" size={17}/></button></div>
      </div>
    </aside>
  </>;
}

function AdminHeader({ page, onMenu }) {
  const title = navItems.find((item) => item.id === page)?.label || "Dashboard";
  return <header className="admin-topbar"><button className="admin-icon-button admin-menu-button" onClick={onMenu} aria-label="Open navigation"><Icon name="menu"/></button><div className="admin-heading"><div className="admin-breadcrumb">Portfolio <Icon name="chevron" size={13}/><span>{title}</span></div><h1>{page === "dashboard" ? "Good to see you" : title}</h1></div><a className="admin-topbar-link" href={import.meta.env.BASE_URL} target="_blank" rel="noreferrer">View website <Icon name="external" size={15}/></a></header>;
}

function MetricCard({ label, value, note, icon, tone = "blue" }) {
  return <article className={`admin-metric admin-metric--${tone}`}><div className="admin-metric-top"><span>{label}</span><span className="admin-metric-icon"><Icon name={icon}/></span></div><strong>{value ?? "—"}</strong><small>{note}</small></article>;
}

function EmptyState({ title, text, action, onAction }) {
  return <div className="admin-empty"><span className="admin-empty-icon"><Icon name="layers" size={23}/></span><strong>{title}</strong><p>{text}</p>{action && <button className="admin-secondary-button" onClick={onAction}><Icon name="plus" size={16}/>{action}</button>}</div>;
}

function DashboardPage({ refreshPage }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    setLoading(true); setError("");
    adminRequest("admin/summary/").then(setData).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);
  useEffect(load, [load, refreshPage]);
  return <>
    {error && <div className="admin-alert admin-alert--error" role="alert">{error}</div>}
    {loading && !data ? <div className="admin-loading"><span className="admin-spinner"/> Loading your portfolio data…</div> : data && <>
      <div className="admin-welcome-card"><div><span className="admin-eyebrow">YOUR PORTFOLIO AT A GLANCE</span><h2>Everything in one place.</h2><p>Keep your work up to date and stay on top of new conversations.</p></div><a href={import.meta.env.BASE_URL} target="_blank" rel="noreferrer" className="admin-welcome-link">Open public site <Icon name="arrow" size={16}/></a></div>
      <div className="admin-metrics-grid"><MetricCard label="Published projects" value={data.projects_published} note={`${data.projects_draft} drafts ready to review`} icon="layers" tone="blue"/><MetricCard label="Unread messages" value={data.messages_unread} note={`${data.messages_total} messages received`} icon="mail" tone="teal"/><MetricCard label="Resume" value={data.resume_available ? "Available" : "Not uploaded"} note={data.resume_updated_at ? `Updated ${shortDate(data.resume_updated_at)}` : "Add a resume PDF for visitors"} icon="file" tone={data.resume_available ? "green" : "amber"}/><MetricCard label="All projects" value={data.projects_total} note="Published and draft work" icon="grid" tone="violet"/></div>
      <div className="admin-dashboard-grid">
        <section className="admin-panel"><div className="admin-panel-head"><div><h2>Recent messages</h2><p>The latest notes from your contact form</p></div><a href="#/admin/messages" className="admin-inline-link">View inbox <Icon name="chevron" size={15}/></a></div>
          {data.recent_messages.length ? <div className="admin-recent-list">{data.recent_messages.map((message) => <a href={`#/admin/messages?id=${message.id}`} className="admin-recent-row" key={message.id}><span className={`admin-message-avatar${message.status === "unread" ? " is-unread" : ""}`}>{message.name.slice(0,1).toUpperCase()}</span><span className="admin-recent-main"><strong>{message.name}</strong><small>{message.subject}</small></span><span className="admin-recent-meta"><time>{shortDate(message.created_at)}</time><span className={`admin-status ${message.status === "unread" ? "is-unread" : "is-read"}`}>{message.status}</span></span></a>)}</div> : <EmptyState title="Your inbox is clear" text="Contact form submissions will show up here."/>}
        </section>
        <section className="admin-panel"><div className="admin-panel-head"><div><h2>Recently updated</h2><p>Your latest project changes</p></div><a href="#/admin/projects" className="admin-inline-link">All projects <Icon name="chevron" size={15}/></a></div>
          {data.recent_projects.length ? <div className="admin-project-list">{data.recent_projects.map((project) => <a href="#/admin/projects" className="admin-project-row" key={project.id}><span className="admin-project-thumbnail"><Icon name="layers"/></span><span className="admin-recent-main"><strong>{project.title}</strong><small>Updated {shortDate(project.updated_at)}</small></span><span className={`admin-status ${project.is_published ? "is-published" : "is-draft"}`}>{project.is_published ? "Published" : "Draft"}</span></a>)}</div> : <EmptyState title="No projects yet" text="Add your first project when the API is ready."/>}
        </section>
      </div>
    </>}
  </>;
}

function ProjectEditor({ project, onClose, onSaved }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(project?.image || "");
  const [form, setForm] = useState({ title: project?.title || "", slug: project?.slug || "", short_description: project?.short_description || "", description: project?.description || "", technologies: (project?.technologies || []).join(", "), github_url: project?.github_url || "", live_demo_url: project?.live_demo_url || "", is_featured: project?.is_featured || false, is_published: project?.is_published ?? false });
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const changeTitle = (value) => {
    update("title", value);
    if (!project) update("slug", value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError("");
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, key === "technologies" ? JSON.stringify(value.split(",").map((item) => item.trim()).filter(Boolean)) : String(value)));
    const file = event.currentTarget.elements.image.files[0];
    if (file) formData.append("image", file);
    try {
      await adminRequest(project ? `admin/projects/${project.id}/` : "admin/projects/", { method: project ? "PATCH" : "POST", body: formData });
      onSaved(); onClose();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="project-editor-title"><div className="admin-modal-head"><div><span className="admin-eyebrow">PROJECT DETAILS</span><h2 id="project-editor-title">{project ? "Edit project" : "New project"}</h2></div><button className="admin-icon-button" onClick={onClose} aria-label="Close"><Icon name="close"/></button></div><form onSubmit={submit} className="admin-form">
    {error && <div className="admin-alert admin-alert--error">{error}</div>}
    <div className="admin-form-grid"><label className="admin-field"><span>Project title *</span><input value={form.title} onChange={(e) => changeTitle(e.target.value)} maxLength={120} required/></label><label className="admin-field"><span>Slug *</span><input value={form.slug} onChange={(e) => update("slug", e.target.value)} maxLength={140} required/></label></div>
    <label className="admin-field"><span>Short description *</span><input value={form.short_description} onChange={(e) => update("short_description", e.target.value)} maxLength={240} required/></label>
    <label className="admin-field"><span>Full description *</span><textarea rows="4" value={form.description} onChange={(e) => update("description", e.target.value)} required/></label>
    <label className="admin-field"><span>Technologies <small>Separate with commas</small></span><input value={form.technologies} onChange={(e) => update("technologies", e.target.value)} placeholder="React, Django, PostgreSQL"/></label>
    <div className="admin-form-grid"><label className="admin-field"><span>GitHub URL</span><input type="url" value={form.github_url} onChange={(e) => update("github_url", e.target.value)} placeholder="https://github.com/…"/></label><label className="admin-field"><span>Live demo URL</span><input type="url" value={form.live_demo_url} onChange={(e) => update("live_demo_url", e.target.value)} placeholder="https://…"/></label></div>
    <label className="admin-field"><span>Project screenshot <small>JPG, PNG, or WebP · up to 5 MB</small></span><input type="file" name="image" accept="image/jpeg,image/png,image/webp" onChange={(e) => setPreview(e.target.files?.[0] ? URL.createObjectURL(e.target.files[0]) : preview)}/>{preview && <img className="admin-upload-preview" src={preview} alt="Project screenshot preview"/>}</label>
    <div className="admin-checkbox-row"><label><input type="checkbox" checked={form.is_featured} onChange={(e) => update("is_featured", e.target.checked)}/> Featured project</label><label><input type="checkbox" checked={form.is_published} onChange={(e) => update("is_published", e.target.checked)}/> Published on website</label></div>
    <div className="admin-modal-actions"><button type="button" className="admin-secondary-button" onClick={onClose}>Cancel</button><button className="admin-primary-button" disabled={busy}>{busy ? "Saving…" : project ? "Save changes" : "Create project"}</button></div>
  </form></section></div>;
}

function ProjectPreview({ project, onClose }) {
  return <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="project-preview-title"><div className="admin-modal-head"><div><span className="admin-eyebrow">{project.is_published ? "PUBLISHED PROJECT" : "DRAFT PREVIEW"}</span><h2 id="project-preview-title">{project.title}</h2></div><button className="admin-icon-button" onClick={onClose} aria-label="Close"><Icon name="close"/></button></div>{project.image && <img className="admin-upload-preview" src={project.image} alt={`${project.title} screenshot`}/>}<p className="admin-preview-short">{project.short_description}</p><p className="admin-preview-description">{project.description}</p><div className="admin-tech-tags">{project.technologies?.map((technology) => <span key={technology}>{technology}</span>)}</div><div className="admin-modal-actions">{project.github_url && <a className="admin-secondary-button" href={project.github_url} target="_blank" rel="noreferrer">GitHub <Icon name="external" size={14}/></a>}{project.live_demo_url && <a className="admin-secondary-button" href={project.live_demo_url} target="_blank" rel="noreferrer">Live demo <Icon name="external" size={14}/></a>}<button className="admin-primary-button" onClick={onClose}>Done</button></div></section></div>;
}

function ProjectsPage({ notify }) {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [featured, setFeatured] = useState("all");
  const [editor, setEditor] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [page, setPage] = useState(1);
  const load = useCallback(() => {
    const query = new URLSearchParams({ page: String(page) });
    if (search.trim()) query.set("search", search.trim());
    if (filter !== "all") query.set("status", filter);
    if (featured !== "all") query.set("featured", featured);
    setError("");
    adminRequest(`admin/projects/?${query}`).then(setData).catch((err) => setError(err.message));
  }, [page, search, filter, featured]);
  useEffect(load, [load]);
  async function toggle(project, publish) {
    setBusyId(project.id);
    try { await adminRequest(`admin/projects/${project.id}/`, { method: "PATCH", body: JSON.stringify({ is_published: publish }) }); notify(publish ? "Project published" : "Project moved to drafts"); load(); }
    catch (err) { setError(err.message); }
    finally { setBusyId(null); }
  }
  async function remove(project) {
    if (!window.confirm(`Delete “${project.title}”? This cannot be undone.`)) return;
    try { await adminRequest(`admin/projects/${project.id}/`, { method: "DELETE" }); notify("Project deleted"); load(); }
    catch (err) { setError(err.message); }
  }
  return <>
    <div className="admin-page-toolbar"><div><p>Manage the projects shown on your public portfolio.</p></div><button className="admin-primary-button" onClick={() => setEditor({})}><Icon name="plus" size={17}/> New project</button></div>
    {error && <div className="admin-alert admin-alert--error" role="alert">{error}</div>}
    <div className="admin-list-tools"><label className="admin-search"><Icon name="search"/><input aria-label="Search projects" placeholder="Search projects…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}/></label><label className="admin-select-label"><span>Status</span><select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}><option value="all">All projects</option><option value="published">Published</option><option value="draft">Drafts</option></select></label><label className="admin-select-label"><span>Featured</span><select value={featured} onChange={(e) => { setFeatured(e.target.value); setPage(1); }}><option value="all">All</option><option value="true">Featured</option><option value="false">Not featured</option></select></label></div>
    <section className="admin-panel admin-table-panel">{data?.results?.length ? <><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Project</th><th>Technologies</th><th>Status</th><th>Updated</th><th><span className="admin-sr-only">Actions</span></th></tr></thead><tbody>{data.results.map((project) => <tr key={project.id}><td><div className="admin-project-cell">{project.image ? <img src={project.image} alt=""/> : <span className="admin-project-thumbnail"><Icon name="layers"/></span>}<span><strong>{project.title}</strong><small>{project.short_description}</small></span></div></td><td><div className="admin-tech-tags">{project.technologies?.slice(0,3).map((tech) => <span key={tech}>{tech}</span>)}{project.technologies?.length > 3 && <span>+{project.technologies.length - 3}</span>}</div></td><td><span className={`admin-status ${project.is_published ? "is-published" : "is-draft"}`}>{project.is_published ? "Published" : "Draft"}</span></td><td>{shortDate(project.updated_at)}</td><td><div className="admin-row-actions"><button onClick={() => setPreview(project)}>Preview</button><button onClick={() => setEditor(project)}>Edit</button><button disabled={busyId === project.id} onClick={() => toggle(project, !project.is_published)}>{project.is_published ? "Unpublish" : "Publish"}</button><button className="is-danger" onClick={() => remove(project)}>Delete</button></div></td></tr>)}</tbody></table></div><div className="admin-table-footer"><span>{data.count} project{data.count === 1 ? "" : "s"}</span><div><button className="admin-secondary-button" disabled={!data.previous || page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page}</span><button className="admin-secondary-button" disabled={!data.next} onClick={() => setPage((value) => value + 1)}>Next</button></div></div></> : data ? <EmptyState title="No projects found" text={search ? "Try another search or clear your filters." : "Create your first project to get started."} action={!search ? "Create project" : null} onAction={() => setEditor({})}/> : <div className="admin-loading"><span className="admin-spinner"/> Loading projects…</div>}</section>
    {editor && <ProjectEditor project={editor.id ? editor : null} onClose={() => setEditor(null)} onSaved={() => { load(); notify("Project saved"); }}/>}
    {preview && <ProjectPreview project={preview} onClose={() => setPreview(null)}/>}
  </>;
}

function MessagesPage({ notify }) {
  const params = new URLSearchParams(window.location.hash.split("?")[1] || "");
  const [selectedId, setSelectedId] = useState(params.get("id"));
  const [messages, setMessages] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const syncSelectedMessage = () => {
      const query = new URLSearchParams(window.location.hash.split("?")[1] || "");
      setSelectedId(query.get("id"));
    };
    window.addEventListener("hashchange", syncSelectedMessage);
    return () => window.removeEventListener("hashchange", syncSelectedMessage);
  }, []);
  useEffect(() => { const query = new URLSearchParams({ page: String(page) }); if (search) query.set("search", search); if (filter !== "all") query.set("status", filter); adminRequest(`admin/messages/?${query}`).then(setMessages).catch((err) => setError(err.message)); }, [page, search, filter, refresh]);
  useEffect(() => { if (!selectedId) { setSelected(null); return; } adminRequest(`admin/messages/${selectedId}/`).then((message) => { setSelected(message); if (message.status === "unread") adminRequest(`admin/messages/${message.id}/`, { method: "PATCH", body: JSON.stringify({ status: "read" }) }).then((updated) => { setSelected(updated); setRefresh((v) => v + 1); }); }).catch((err) => setError(err.message)); }, [selectedId]);
  function chooseMessage(id) { setSelectedId(String(id)); window.location.hash = `#/admin/messages?id=${id}`; }
  async function toggleRead(message) { try { const updated = await adminRequest(`admin/messages/${message.id}/`, { method: "PATCH", body: JSON.stringify({ status: message.status === "read" ? "unread" : "read" }) }); setSelected(updated); setRefresh((v) => v + 1); notify(updated.status === "read" ? "Marked as read" : "Marked as unread"); } catch (err) { setError(err.message); } }
  async function remove(message) { if (!window.confirm(`Delete the message from ${message.name}? This cannot be undone.`)) return; try { await adminRequest(`admin/messages/${message.id}/`, { method: "DELETE" }); setSelected(null); setSelectedId(null); window.location.hash = "#/admin/messages"; setRefresh((v) => v + 1); notify("Message deleted"); } catch (err) { setError(err.message); } }
  return <>
    <div className="admin-page-toolbar"><p>Private messages submitted through your portfolio contact form.</p></div>{error && <div className="admin-alert admin-alert--error">{error}</div>}
    <div className="admin-inbox-tools"><label className="admin-search"><Icon name="search"/><input placeholder="Search messages…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}/></label><div className="admin-filter-tabs">{["all", "unread", "read"].map((value) => <button className={filter === value ? "is-active" : ""} key={value} onClick={() => { setFilter(value); setPage(1); }}>{value[0].toUpperCase() + value.slice(1)}</button>)}</div></div>
    <section className="admin-inbox-panel"><div className="admin-inbox-list">{messages?.results?.length ? messages.results.map((message) => <button key={message.id} className={`admin-inbox-item${String(message.id) === selectedId ? " is-selected" : ""}${message.status === "unread" ? " is-unread" : ""}`} onClick={() => chooseMessage(message.id)}><span className="admin-message-avatar">{message.name.slice(0,1).toUpperCase()}</span><span className="admin-inbox-item-copy"><span><strong>{message.name}</strong><time>{shortDate(message.created_at)}</time></span><b>{message.subject}</b><small>{message.message}</small></span></button>) : messages ? <div className="admin-inbox-empty">{search || filter !== "all" ? "No messages match these filters." : "No messages yet. New contact form submissions will appear here."}</div> : <div className="admin-loading"><span className="admin-spinner"/> Loading inbox…</div>}
      {messages && <div className="admin-inbox-pagination"><button disabled={!messages.previous || page <= 1} onClick={() => setPage((v) => v - 1)}>Previous</button><span>{messages.count} messages</span><button disabled={!messages.next} onClick={() => setPage((v) => v + 1)}>Next</button></div>}
    </div><div className="admin-message-detail">{selected ? <><div className="admin-detail-actions"><button className="admin-secondary-button" onClick={() => toggleRead(selected)}>{selected.status === "read" ? "Mark unread" : "Mark read"}</button><button className="admin-danger-button" onClick={() => remove(selected)}>Delete</button></div><span className="admin-status is-unread">{selected.status}</span><h2>{selected.subject}</h2><p className="admin-detail-date">Received {dateFormat(selected.created_at)}</p><div className="admin-sender-card"><span className="admin-message-avatar">{selected.name.slice(0,1).toUpperCase()}</span><span><strong>{selected.name}</strong><a href={`mailto:${selected.email}`}>{selected.email}</a></span><a className="admin-reply-button" href={`mailto:${encodeURIComponent(selected.email)}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}>Reply by email <Icon name="arrow" size={15}/></a></div><div className="admin-message-body">{selected.message}</div></> : <div className="admin-detail-placeholder"><span className="admin-empty-icon"><Icon name="mail" size={22}/></span><strong>Select a message</strong><p>Choose a message from your inbox to read it here.</p></div>}</div></section>
  </>;
}

function ResumePage({ notify }) {
  const [resume, setResume] = useState(null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(() => adminRequest("admin/resume/").then(setResume).catch((err) => setError(err.message)), []);
  useEffect(load, [load]);
  async function upload(event) { event.preventDefault(); if (!file) return; const formElement = event.currentTarget; setBusy(true); setError(""); const data = new FormData(); data.append("file", file); try { const result = await adminRequest("admin/resume/", { method: "PUT", body: data }); setResume(result); setFile(null); formElement.reset(); notify("Resume uploaded"); } catch (err) { setError(err.message); } finally { setBusy(false); } }
  async function remove() { if (!window.confirm("Remove the resume from your public portfolio?")) return; try { const result = await adminRequest("admin/resume/", { method: "DELETE" }); setResume(result); notify("Resume removed"); } catch (err) { setError(err.message); } }
  return <><div className="admin-page-toolbar"><p>Upload the PDF visitors can download from your portfolio.</p></div>{error && <div className="admin-alert admin-alert--error">{error}</div>}<div className="admin-resume-grid"><section className="admin-panel admin-resume-current"><div className="admin-panel-head"><div><h2>Current resume</h2><p>This file is available to public website visitors.</p></div><span className={`admin-status ${resume?.available ? "is-published" : "is-draft"}`}>{resume?.available ? "Available" : "Not uploaded"}</span></div>{resume?.available ? <div className="admin-resume-file"><span className="admin-file-icon"><Icon name="file" size={25}/></span><span><strong>{resume.filename}</strong><small>Updated {dateFormat(resume.updated_at)}</small></span><a className="admin-secondary-button" href={resume.url} target="_blank" rel="noreferrer">Preview <Icon name="external" size={15}/></a><a className="admin-secondary-button" href={resume.download_url}>Download</a></div> : <EmptyState title="No resume uploaded" text="Upload your current resume when you are ready to make it available."/>}{resume?.available && <button className="admin-danger-button admin-remove-resume" onClick={remove}>Remove resume</button>}</section><section className="admin-panel"><div className="admin-panel-head"><div><h2>{resume?.available ? "Replace resume" : "Upload a resume"}</h2><p>PDF only · Maximum file size 10 MB</p></div></div><form className="admin-upload-zone" onSubmit={upload}><label className="admin-upload-input"><span className="admin-upload-icon"><Icon name="file" size={24}/></span><strong>{file?.name || "Choose a PDF file"}</strong><small>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "or drag and drop it here"}</small><input type="file" accept="application/pdf,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)}/></label><button className="admin-primary-button" disabled={!file || busy}>{busy ? "Uploading…" : resume?.available ? "Replace resume" : "Upload resume"}</button></form></section></div><div className="admin-info-note"><strong>Public file note</strong><p>Your resume is intended for public download. Uploaded files use your backend's configured media storage; configure persistent storage before production deployment.</p></div></>;
}

function SettingsPage({ user }) {
  return <><div className="admin-page-toolbar"><p>Account and connection details for this dashboard.</p></div><div className="admin-settings-grid"><section className="admin-panel"><div className="admin-panel-head"><div><h2>Administrator</h2><p>Signed in account</p></div></div><div className="admin-setting-row"><span className="admin-avatar">{(user?.username || "E").slice(0,1).toUpperCase()}</span><span><strong>{user?.username}</strong><small>{user?.email || "Email not set on this account"}</small></span></div><div className="admin-setting-row"><span className="admin-setting-icon"><Icon name="logout"/></span><span><strong>Private dashboard session</strong><small>Sign out to revoke this session token.</small></span></div></section><section className="admin-panel"><div className="admin-panel-head"><div><h2>API connection</h2><p>Backend endpoint configured for this build.</p></div></div><div className="admin-api-status"><span className={`admin-live-dot${apiBaseUrl ? "" : " is-offline"}`}/><span><strong>{apiBaseUrl ? "API URL configured" : "API URL not configured"}</strong><small>{apiBaseUrl || "Set VITE_API_BASE_URL in the frontend environment."}</small></span></div><p className="admin-settings-help">Database, email provider, and secret settings remain on your backend host and are not exposed in this dashboard.</p></section></div></>;
}

function Toast({ toast }) { return toast ? <div className="admin-toast" role="status">{toast}</div> : null; }

export default function AdminApp() {
  const [route, setRoute] = useState(() => window.location.hash.slice(1).split("?")[0] || "/admin/login");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(getAdminToken()));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState("");
  const [revision, setRevision] = useState(0);
  const page = route.replace("/admin/", "") || "dashboard";
  useEffect(() => { const update = () => setRoute(window.location.hash.slice(1).split("?")[0] || "/admin/login"); window.addEventListener("hashchange", update); return () => window.removeEventListener("hashchange", update); }, []);
  useEffect(() => {
    if (!getAdminToken()) { setAuthLoading(false); return; }
    adminRequest("admin/me/").then((account) => {
      setUser(account);
      if (window.location.hash === "#/admin/login" || window.location.hash === "#/admin/") window.location.hash = "#/admin/dashboard";
    }).catch(() => { clearAdminToken(); setUser(null); }).finally(() => setAuthLoading(false));
  }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(""), 3200); return () => clearTimeout(timer); }, [toast]);
  const notify = useCallback((message) => setToast(message), []);
  const pageView = useMemo(() => {
    if (page === "projects") return <ProjectsPage notify={notify}/>;
    if (page === "messages") return <MessagesPage notify={notify}/>;
    if (page === "resume") return <ResumePage notify={notify}/>;
    if (page === "settings") return <SettingsPage user={user}/>;
    return <DashboardPage refreshPage={revision}/>;
  }, [page, notify, user, revision]);
  function signOut() { adminRequest("admin/logout/", { method: "POST" }).catch(() => {}).finally(() => { clearAdminToken(); setUser(null); setRoute("/admin/login"); window.location.hash = "#/admin/login"; }); }
  function loggedIn(account) { setUser(account); setAuthLoading(false); setRoute("/admin/dashboard"); window.location.hash = "#/admin/dashboard"; setRevision((v) => v + 1); }

  if (authLoading) return <div className="admin-auth-loading"><span className="admin-spinner"/> Checking administrator session…</div>;
  if (!user) return <LoginPage onLogin={loggedIn}/>;
  return <div className={`admin-shell${sidebarCollapsed ? " is-sidebar-collapsed" : ""}`}><Sidebar page={page} setPage={setRoute} onLogout={signOut} mobileOpen={mobileOpen} closeMobile={() => setMobileOpen(false)} user={user} collapsed={sidebarCollapsed} toggleCollapsed={() => setSidebarCollapsed((value) => !value)}/><div className="admin-main"><AdminHeader page={page} onMenu={() => setMobileOpen(true)}/><main className="admin-content">{pageView}</main><footer className="admin-footer"><span>Portfolio Studio</span><span>Private administrator workspace</span></footer></div><Toast toast={toast}/></div>;
}
