import { useCallback, useEffect, useMemo, useState } from "react";
import Dashboard from "./Dashboard";
import Editor from "./Editor";
import { loadProjects, saveProjects, type Project } from "./storage";
import "./App.css";

export default function App() {
  const initial = useMemo(loadProjects, []);
  const [projects, setProjects] = useState<Project[]>(initial);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  const handleCreate = useCallback((p: Project) => {
    setProjects((prev) => [p, ...prev]);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setActiveId((cur) => (cur === id ? null : cur));
  }, []);

  const handleRename = useCallback((id: string, name: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, name, meta: { ...p.meta, name }, updatedAt: Date.now() } : p,
      ),
    );
  }, []);

  const handleEditorChange = useCallback((updated: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  const active = projects.find((p) => p.id === activeId) ?? null;

  if (active) {
    return (
      <Editor
        project={active}
        onChange={handleEditorChange}
        onBack={() => setActiveId(null)}
      />
    );
  }

  return (
    <Dashboard
      projects={projects}
      onOpen={setActiveId}
      onCreate={handleCreate}
      onDelete={handleDelete}
      onRename={handleRename}
    />
  );
}
