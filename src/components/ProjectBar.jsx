import { useState } from 'react';
import { useTodo } from '../context/TodoContext';
import { Folder, Plus, Check, X, Trash2 } from 'lucide-react';

const chipBase = 'shrink-0 inline-flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full text-[12px] font-semibold max-w-[140px] transition-all duration-200 active:scale-95';

const ProjectBar = () => {
  const {
    projects,
    projectsLoading,
    activeProjectId,
    setActiveProjectId,
    addProject,
    renameProject,
    deleteProject,
  } = useTodo();

  // { mode: 'add' } | { mode: 'edit', project }
  const [panel, setPanel] = useState(null);
  const [name, setName] = useState('');

  const openAdd = () => {
    setPanel({ mode: 'add' });
    setName('');
  };

  const openEdit = (project) => {
    setPanel({ mode: 'edit', project });
    setName(project.name);
  };

  const closePanel = () => {
    setPanel(null);
    setName('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (panel.mode === 'add') addProject(trimmed);
    else renameProject(panel.project.id, trimmed);
    closePanel();
  };

  const handleDelete = () => {
    const { project } = panel;
    if (!window.confirm(`Hapus project "${project.name}"? Tugas di dalamnya pindah ke Semua.`)) return;
    deleteProject(project.id);
    closePanel();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closePanel();
  };

  // Setelah project dipilih dari panel, panel lama tidak relevan
  const handleChipClick = (project) => {
    closePanel();
    if (project.id === activeProjectId) openEdit(project);
    else setActiveProjectId(project.id);
  };

  if (projectsLoading) return null;

  return (
    <div
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      {/* py/-my: ruang untuk shadow glow, supaya tidak terpotong overflow-x-auto */}
      <div className="flex items-center gap-1.5 overflow-x-auto overscroll-x-contain no-scrollbar py-6 -my-6 px-4 -mx-4">
        {projects.length > 0 && (
          <button
            onClick={() => { closePanel(); setActiveProjectId('all'); }}
            aria-pressed={activeProjectId === 'all'}
            className={`${chipBase} ${
              activeProjectId === 'all'
                ? 'bg-gradient-to-r from-accent to-orange-500 text-white shadow-glow-amber'
                : 'bg-white border border-stone-100 text-stone-500 shadow-card hover:border-stone-200 hover:text-stone-700'
            }`}
          >
            Semua
          </button>
        )}

        {projects.map((project) => {
          const isActive = project.id === activeProjectId;
          return (
            <button
              key={project.id}
              onClick={() => handleChipClick(project)}
              aria-pressed={isActive}
              className={`${chipBase} ${
                isActive
                  ? 'bg-gradient-to-r from-accent to-orange-500 text-white shadow-glow-amber'
                  : 'bg-white border border-stone-100 text-stone-500 shadow-card hover:border-stone-200 hover:text-stone-700'
              }`}
            >
              <Folder className={`w-3 h-3 shrink-0 ${isActive ? 'text-white/90' : 'text-stone-400'}`} />
              <span className="truncate">{project.name}</span>
            </button>
          );
        })}

        <button
          onClick={() => { closePanel(); openAdd(); }}
          aria-label="Project baru"
          title="Project baru"
          className={`${chipBase} border border-dashed border-stone-200 text-stone-400 hover:border-accent/50 hover:text-accent hover:bg-terra-hover/60 ${
            projects.length === 0 ? 'pr-3.5' : 'px-2.5'
          }`}
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          {projects.length === 0 && <span>Project Baru</span>}
        </button>
      </div>

      {panel && (
        <form
          onSubmit={handleSubmit}
          className="mt-2 flex items-center gap-2 bg-white border border-stone-100 rounded-xl px-3 py-2 shadow-card animate-fade-in"
        >
          <Folder className="w-3.5 h-3.5 shrink-0 text-stone-300" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nama project..."
            aria-label="Nama project"
            autoFocus
            maxLength={40}
            className="flex-1 min-w-0 bg-transparent text-[13px] font-medium text-stone-800 outline-none placeholder-stone-400"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            aria-label="Simpan"
            className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg text-success hover:bg-success-light transition-colors active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
          >
            <Check className="w-4 h-4 stroke-[3]" />
          </button>
          <button
            type="button"
            onClick={closePanel}
            aria-label="Batal"
            className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg text-stone-400 hover:bg-stone-50 hover:text-stone-600 transition-colors active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
          {panel.mode === 'edit' && (
            <button
              type="button"
              onClick={handleDelete}
              aria-label="Hapus project"
              className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg text-stone-300 hover:text-danger hover:bg-danger-light transition-colors active:scale-90"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      )}
    </div>
  );
};

export default ProjectBar;
