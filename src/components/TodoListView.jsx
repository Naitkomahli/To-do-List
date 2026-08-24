import { useState, useRef } from 'react';
import { useTodo } from '../context/TodoContext';
import { useCountUp } from '../hooks/useCountUp';
import { fireCelebration } from '../utils/confetti';
import SkeletonRow from './SkeletonRow';
import { Check, Plus, Trash2, ListTodo } from 'lucide-react';

const CATEGORY_COLORS = {
  'Design System': { bg: '#FDF2F8', text: '#BE185D', dot: '#EC4899' },
  'Typography': { bg: '#F5F3FF', text: '#6D28D9', dot: '#8B5CF6' },
  'Development': { bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6' },
  'Animations': { bg: '#FFFBEB', text: '#B45309', dot: '#F59E0B' },
  'PWA': { bg: '#ECFDF5', text: '#047857', dot: '#10B981' },
  'Auth': { bg: '#FEF2F2', text: '#B91C1C', dot: '#EF4444' },
  'Research': { bg: '#FFF7ED', text: '#C24100', dot: '#F97316' },
  'Marketing': { bg: '#FDF4FF', text: '#A21CAF', dot: '#D946EF' },
  'Category': { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8' },
};

const CircularProgress = ({ percentage, size = 56, strokeWidth = 4 }) => {
  const animatedPct = useCountUp(percentage, 700);
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (animatedPct / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="todoRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} stroke="#EDE6D8" strokeWidth={strokeWidth} fill="transparent" />
        <circle
          cx={size/2} cy={size/2} r={r}
          stroke="url(#todoRingGrad)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold text-stone-700 font-display tabular-nums">{animatedPct}%</span>
      </div>
    </div>
  );
};

const TodoListView = ({ onCompleteAction }) => {
  const {
    todayTasks,
    tasksLoading,
    toggleTask,
    addTask,
    deleteTask,
    updateTaskText,
    todayCompleted,
    todayTotal,
    todayCompletionPercentage,
  } = useTodo();

  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editText, setEditText] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [pulsingId, setPulsingId] = useState(null);
  const addInputRef = useRef(null);

  const animatedCompleted = useCountUp(todayCompleted, 500);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  const handleToggle = (task) => {
    toggleTask(task.id);

    if (!task.completed) {
      setPulsingId(task.id);
      setTimeout(() => setPulsingId(null), 520);
    }

    // Konfeti saat tugas terakhir hari ini selesai
    if (!task.completed && todayCompleted + 1 === todayTotal) {
      setTimeout(fireCelebration, 250);
    }

    onCompleteAction(
      task.completed ? `Unchecked "${task.text}"` : `Completed "${task.text}"!`
    );
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setNewText('');
    setTimeout(() => addInputRef.current?.focus(), 50);
  };

  const handleSaveNew = (e) => {
    e.preventDefault();
    if (newText.trim()) {
      addTask(newText.trim(), 'Category', 'Today');
      onCompleteAction(`Created task "${newText.trim()}"`);
    }
    setIsAdding(false);
    setNewText('');
  };

  const handleKeyNew = (e) => {
    if (e.key === 'Escape') { setIsAdding(false); setNewText(''); }
  };

  const handleEdit = (task) => {
    setEditingTaskId(task.id);
    setEditText(task.text);
  };

  const handleSaveEdit = (id) => {
    if (editText.trim()) updateTaskText(id, editText.trim());
    else deleteTask(id);
    setEditingTaskId(null);
  };

  const handleKeyEdit = (e, id) => {
    if (e.key === 'Enter') handleSaveEdit(id);
    if (e.key === 'Escape') setEditingTaskId(null);
  };

  const handleDelete = (task) => {
    if (deletingId || !window.confirm(`Delete "${task.text}"?`)) return;
    setDeletingId(task.id);
    setTimeout(() => {
      deleteTask(task.id);
      onCompleteAction(`Deleted "${task.text}"`);
      setDeletingId(null);
    }, 240);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 select-none">
      <div className="mb-5">
        <div className="flex items-center gap-4">
          <CircularProgress percentage={todayCompletionPercentage} size={56} strokeWidth={4} />
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-[26px] font-extrabold text-stone-800 tracking-tight leading-tight">
              Today
            </h2>
            <p className="text-[13px] font-medium text-stone-400 mt-0.5">
              {formattedDate}
            </p>
          </div>
          <div className="shrink-0 bg-white border border-stone-100 rounded-xl px-3.5 py-2 text-center shadow-card-premium active:scale-[0.97] transition-transform">
            <span className="block font-display text-lg font-extrabold text-accent leading-none tabular-nums">{animatedCompleted}/{todayTotal}</span>
            <span className="block text-[9px] font-semibold text-stone-400 mt-0.5 uppercase tracking-wider">Selesai</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pb-2">
        {tasksLoading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : todayTasks.length === 0 && !isAdding ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 flex items-center justify-center mb-4 animate-float">
              <ListTodo className="w-7 h-7 text-amber-400" />
            </div>
            <h4 className="text-sm font-bold text-stone-500 mb-1">Tidak ada tugas hari ini</h4>
            <p className="text-xs font-medium text-stone-400 max-w-[200px]">Tambah tugas baru untuk memulai hari.</p>
          </div>
        ) : (
          todayTasks.map((task) => {
            const isEditing = editingTaskId === task.id;
            const isDeleting = deletingId === task.id;
            const catColor = CATEGORY_COLORS[task.category] || CATEGORY_COLORS['Category'];
            return (
              <div
                key={task.id}
                className={`flex items-center gap-3 py-2.5 px-3.5 bg-white border border-stone-100 rounded-xl transition-all duration-200 shadow-card hover:shadow-card-hover hover:border-stone-200 min-h-[48px] ${
                  isDeleting ? 'animate-task-exit' : 'animate-slide-in'
                } ${task.completed ? 'opacity-40' : ''}`}
              >
                <button
                  onClick={() => handleToggle(task)}
                  className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center transition-all duration-200 active:scale-90 ${
                    pulsingId === task.id ? 'checkbox-active' : ''
                  } ${
                    task.completed
                      ? 'bg-success border-2 border-success text-white shadow-glow-amber'
                      : 'border-2 border-stone-300 hover:border-amber-400 hover:bg-amber-50'
                  }`}
                >
                  {task.completed && <Check className="w-3.5 h-3.5 stroke-[3.5] check-pop" />}
                </button>

                <div className="flex-1 min-w-0 overflow-hidden">
                  {isEditing ? (
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(task.id); }} className="contents">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={() => { if (editText.trim()) updateTaskText(task.id, editText.trim()); else deleteTask(task.id); setEditingTaskId(null); }}
                      onKeyDown={(e) => handleKeyEdit(e, task.id)}
                      autoFocus
                      className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-sm font-medium text-stone-800 outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-shadow"
                    />
                    </form>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        onClick={() => handleEdit(task)}
                        className={`block text-[14px] font-semibold tracking-wide truncate todo-strikethrough max-w-[180px] sm:max-w-[280px] cursor-text ${
                          task.completed
                            ? 'completed text-stone-400'
                            : 'text-stone-700'
                        }`}
                      >
                        {task.text}
                      </span>
                      {task.category && task.category !== 'Category' && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide shrink-0"
                          style={{ backgroundColor: catColor.bg, color: catColor.text }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor.dot }} />
                          {task.category}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(task)}
                  className="w-7 h-7 shrink-0 flex items-center justify-center text-stone-300 hover:text-danger hover:bg-danger-light rounded-lg transition-all duration-200 active:scale-90"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}

        {!tasksLoading && (isAdding ? (
          <form onSubmit={handleSaveNew} className="contents">
          <div className="flex items-center gap-3 py-2.5 px-3.5 bg-white border border-accent/40 rounded-xl shadow-card animate-slide-in min-h-[48px] ring-4 ring-accent/5">
            <div className="w-6 h-6 rounded-full border-2 border-dashed border-stone-300 shrink-0" />
            <input
              ref={addInputRef}
              type="text"
              value={newText}
              placeholder="Ketik dan tekan enter..."
              onChange={(e) => setNewText(e.target.value)}
              onBlur={() => { setIsAdding(false); setNewText(''); }}
              onKeyDown={handleKeyNew}
              className="flex-1 bg-transparent text-[14px] font-medium text-stone-800 outline-none placeholder-stone-400"
            />
          </div>
          </form>
        ) : (
          <button
            onClick={handleStartAdd}
            className="group flex items-center gap-3 py-3 px-3.5 border border-dashed border-stone-200 hover:border-accent/50 hover:bg-terra-hover/60 rounded-xl transition-all duration-200 w-full text-left active:scale-[0.98]"
          >
            <div className="w-6 h-6 rounded-full border-2 border-dashed border-stone-300 group-hover:border-accent group-hover:rotate-90 flex items-center justify-center shrink-0 transition-all duration-300">
              <Plus className="w-3.5 h-3.5 text-stone-400 group-hover:text-accent transition-colors" />
            </div>
            <span className="text-[13px] font-medium text-stone-400 group-hover:text-accent-dark transition-colors">
              Tambah tugas hari ini
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TodoListView;
