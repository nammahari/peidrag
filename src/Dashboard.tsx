import { useMemo, useState } from "react";
import { createProject, type Project } from "./storage";

type Props = {
  projects: Project[];
  onOpen: (id: string) => void;
  onCreate: (project: Project) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
};

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const min = 60_000;
  const hr = 60 * min;
  const day = 24 * hr;
  if (diff < min) return "just now";
  if (diff < hr) return `${Math.floor(diff / min)}m ago`;
  if (diff < day) return `${Math.floor(diff / hr)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return new Date(ts).toLocaleDateString();
}

export default function Dashboard({ projects, onOpen, onCreate, onDelete, onRename }: Props) {
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");

  const sorted = useMemo(
    () => [...projects].sort((a, b) => b.updatedAt - a.updatedAt),
    [projects],
  );

  const visible = useMemo(() => {
    if (!query.trim()) return sorted;
    const q = query.toLowerCase();
    return sorted.filter((p) => p.name.toLowerCase().includes(q));
  }, [sorted, query]);

  const submitNew = () => {
    const trimmed = name.trim() || "Untitled theme";
    const p = createProject(trimmed);
    onCreate(p);
    setName("");
    setShowNew(false);
    onOpen(p.id);
  };

  return (
    <div className="pd-dashboard">
      <header className="pd-dash-bar">
        <div className="pd-dash-bar__brand">
          <span className="pd-mark" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
            </svg>
          </span>
          <span className="pd-wordmark">peidrag</span>
          <span className="pd-pill">beta</span>
        </div>
        <div className="pd-dash-bar__actions">
          <a className="pd-quietlink" href="https://ghost.org/docs/themes/" target="_blank" rel="noreferrer">
            Ghost docs
          </a>
          <button className="pd-btn pd-btn--primary" onClick={() => setShowNew(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: -2 }}>
              <path d="M12 5v14M5 12h14" />
            </svg>
            New project
          </button>
        </div>
      </header>

      <main className="pd-dash-main">
        <div className="pd-dash-heading">
          <div>
            <h1>Projects</h1>
            <p>Build a Ghost theme visually — drop primitives, bind to your Ghost data, export the zip.</p>
          </div>
          {projects.length > 0 && (
            <input
              className="pd-search"
              placeholder="Search projects…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search projects"
            />
          )}
        </div>

        {projects.length === 0 ? (
          <div className="pd-firstrun">
            <div className="pd-firstrun__icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M3 9h18M9 3v18" />
              </svg>
            </div>
            <h2>No projects yet</h2>
            <p>Create your first theme. You'll start with a blank canvas of primitives — Container, Heading, Text, Image, Button, Posts Loop.</p>
            <button className="pd-btn pd-btn--primary pd-btn--lg" onClick={() => setShowNew(true)}>
              Create project
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="pd-empty-search">
            <p>No projects match “{query}”.</p>
          </div>
        ) : (
          <ul className="pd-projects">
            {visible.map((p) => {
              const initials = p.name
                .split(/\s+/)
                .map((w) => w[0])
                .filter(Boolean)
                .slice(0, 2)
                .join("")
                .toUpperCase();
              return (
                <li key={p.id} className="pd-project">
                  <button
                    className="pd-project__thumb"
                    onClick={() => onOpen(p.id)}
                    aria-label={`Open ${p.name}`}
                    style={{ background: `linear-gradient(135deg, ${p.meta.primaryColor} 0%, #0b1220 100%)` }}
                  >
                    <span>{initials || "·"}</span>
                  </button>
                  <div className="pd-project__body">
                    <input
                      className="pd-project__name"
                      value={p.name}
                      onChange={(e) => onRename(p.id, e.target.value)}
                      aria-label="Project name"
                    />
                    <p className="pd-project__meta">Updated {formatRelative(p.updatedAt)}</p>
                    <div className="pd-project__actions">
                      <button className="pd-btn pd-btn--ghost pd-btn--sm" onClick={() => onOpen(p.id)}>
                        Open
                      </button>
                      <button
                        className="pd-iconbtn pd-iconbtn--danger"
                        aria-label={`Delete ${p.name}`}
                        onClick={() => {
                          if (confirm(`Delete project “${p.name}”? This cannot be undone.`)) onDelete(p.id);
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {showNew && (
        <div className="pd-modal" role="dialog" aria-modal="true" aria-labelledby="new-title">
          <div className="pd-modal__backdrop" onClick={() => setShowNew(false)} />
          <div className="pd-modal__panel">
            <h3 id="new-title">New project</h3>
            <p className="pd-modal__hint">Give your theme a name. You can change it later.</p>
            <input
              autoFocus
              className="pd-input"
              placeholder="My Ghost theme"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitNew();
                if (e.key === "Escape") setShowNew(false);
              }}
            />
            <div className="pd-modal__actions">
              <button className="pd-btn pd-btn--ghost" onClick={() => setShowNew(false)}>
                Cancel
              </button>
              <button className="pd-btn pd-btn--primary" onClick={submitNew}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
