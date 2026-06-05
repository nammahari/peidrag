import { useCallback, useState } from "react";
import { Puck, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import { puckConfig } from "./sections";
import { downloadZip, type TemplateId, type ThemeMeta } from "./compiler";
import type { Project } from "./storage";

const TEMPLATES: { id: TemplateId; label: string; hint: string; bindings: string[] }[] = [
  {
    id: "index",
    label: "Home",
    hint: "index.hbs",
    bindings: ["site.title", "site.description", "Use a Posts loop to iterate over posts"],
  },
  {
    id: "post",
    label: "Post",
    hint: "post.hbs",
    bindings: ["post.title", "post.excerpt", "post.content", "post.date", "post.feature_image", "post.primary_author.*"],
  },
  {
    id: "page",
    label: "Page",
    hint: "page.hbs",
    bindings: ["post.title", "post.content", "post.feature_image"],
  },
  {
    id: "tag",
    label: "Tag",
    hint: "tag.hbs",
    bindings: ["tag.name", "tag.description", "Use a Posts loop for posts in this tag"],
  },
  {
    id: "author",
    label: "Author",
    hint: "author.hbs",
    bindings: ["author.name", "author.bio", "author.profile_image", "author.cover_image"],
  },
];

const emptyData: Data = { content: [], root: { props: {} } };

type Props = {
  project: Project;
  onChange: (project: Project) => void;
  onBack: () => void;
};

export default function Editor({ project, onChange, onBack }: Props) {
  const [active, setActive] = useState<TemplateId>("index");
  const [showSettings, setShowSettings] = useState(false);
  const [showBindings, setShowBindings] = useState(false);

  const activeTemplate = TEMPLATES.find((t) => t.id === active)!;

  const handlePuckChange = useCallback(
    (data: Data) => {
      onChange({
        ...project,
        templates: { ...project.templates, [active]: data },
        updatedAt: Date.now(),
      });
    },
    [active, project, onChange],
  );

  const handleMetaChange = useCallback(
    (patch: Partial<ThemeMeta>) => {
      onChange({
        ...project,
        meta: { ...project.meta, ...patch },
        updatedAt: Date.now(),
      });
    },
    [project, onChange],
  );

  const handleDownload = useCallback(async () => {
    await downloadZip({ meta: project.meta, templates: project.templates });
  }, [project]);

  return (
    <div className="pd-app">
      <header className="pd-toolbar">
        <div className="pd-toolbar__left">
          <button className="pd-iconbtn" onClick={onBack} aria-label="Back" title="Back to dashboard">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="pd-mark pd-mark--sm" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
            </svg>
          </span>
          <div className="pd-toolbar__title">
            <strong>{project.name}</strong>
            <span className="pd-toolbar__file">{activeTemplate.hint}</span>
          </div>
        </div>

        <nav className="pd-toolbar__tabs" aria-label="Templates">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              className={`pd-tab ${active === t.id ? "pd-tab--active" : ""}`}
              onClick={() => setActive(t.id)}
              title={t.hint}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="pd-toolbar__actions">
          <button
            className={`pd-btn pd-btn--ghost ${showBindings ? "pd-btn--on" : ""}`}
            onClick={() => setShowBindings((s) => !s)}
            title="Show data bindings available in this template"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: -2 }}>
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72" />
            </svg>
            Bindings
          </button>
          <button className="pd-btn pd-btn--ghost" onClick={() => setShowSettings((s) => !s)}>
            Theme settings
          </button>
          <button className="pd-btn pd-btn--primary" onClick={handleDownload}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: -2 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export .zip
          </button>
        </div>
      </header>

      {showBindings && (
        <div className="pd-binding-strip">
          <div className="pd-binding-strip__label">
            <span className="pd-pill pd-pill--mono">{activeTemplate.hint}</span>
            <span>Ghost bindings available on this template</span>
          </div>
          <ul>
            <li className="pd-binding-strip__group">Always available: <code>site.*</code>, <code>member.*</code>, <code>navigation</code></li>
            {activeTemplate.bindings.map((b) => (
              <li key={b}>{b.includes(".") ? <code>{b}</code> : b}</li>
            ))}
          </ul>
          <div className="pd-binding-strip__divider" />
          <div className="pd-binding-strip__label">
            <span className="pd-pill">how to pull content</span>
            <span>To bind to a specific Ghost post/page, set a Container's "Pull content from Ghost":</span>
          </div>
          <ul>
            <li>Tag your post in Ghost admin with internal tag <code>#hero</code> → Container source <code>Post — by tag</code>, filter <code>hero</code></li>
            <li>Page by slug → Container source <code>Page — by slug</code>, filter <code>about</code></li>
            <li>All <code>post.*</code> bindings on children inside resolve to the fetched post</li>
            <li><code>Posts loop</code> iterates posts and exposes the same bindings per item</li>
          </ul>
        </div>
      )}

      {showSettings && (
        <div className="pd-settings">
          <div className="pd-settings__grid">
            <label>
              <span>Theme name</span>
              <input value={project.meta.name} onChange={(e) => handleMetaChange({ name: e.target.value })} />
            </label>
            <label>
              <span>Description</span>
              <input value={project.meta.description} onChange={(e) => handleMetaChange({ description: e.target.value })} />
            </label>
            <label>
              <span>Version</span>
              <input value={project.meta.version} onChange={(e) => handleMetaChange({ version: e.target.value })} />
            </label>
            <label>
              <span>Author</span>
              <input value={project.meta.author} onChange={(e) => handleMetaChange({ author: e.target.value })} />
            </label>
            <label className="pd-settings__color">
              <span>Primary color</span>
              <div className="pd-color-wrap">
                <input
                  type="color"
                  value={project.meta.primaryColor}
                  onChange={(e) => handleMetaChange({ primaryColor: e.target.value })}
                />
                <input
                  type="text"
                  value={project.meta.primaryColor}
                  onChange={(e) => handleMetaChange({ primaryColor: e.target.value })}
                />
              </div>
            </label>
          </div>
        </div>
      )}

      <div className="pd-editor">
        <Puck
          key={active}
          config={puckConfig}
          data={project.templates[active] ?? emptyData}
          onChange={handlePuckChange}
        />
      </div>
    </div>
  );
}
