import { useState, useRef } from 'react';
import { useTodo } from '../context/TodoContext';
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
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} stroke="#EDE6D8" strokeWidth={strokeWidth} fill="transparent" />
        <circle
          cx={size/2} cy={size/2} r={r}
          stroke="#D97706"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold text-stone-700">{percentage}%</span>
      </div>
    </div>
  );
};

const TodoListView = ({ onCompleteAction }) => {
  const {
    todayTasks,
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
  const addInputRef = useRef(null);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  const handleToggle = (task) => {
    toggleTask(task.id);
    onCompleteAction(
      task.completed ? `Unchecked "${task.text}"` : `Completed "${task.text}"!`
    );
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setNewText('');
    setTimeout(() => addInputRef.current?.focus(), 50);
  };

  const handleSaveNew = () => {
    if (newText.trim()) {
      addTask(newText.trim(), 'Category', 'Today');
      onCompleteAction(`Created task "${newText.trim()}"`);
    }
    setIsAdding(false);
    setNewText('');
  };

  const handleKeyNew = (e) => {
    if (e.key === 'Enter') handleSaveNew();
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
    if (window.confirm(`Delete "${task.text}"?`)) {
      deleteTask(task.id);
      onCompleteAction(`Deleted "${task.text}"`);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 select-none">
      <div className="mb-5">
        <div className="flex items-center gap-4">
          <CircularProgress percentage={todayCompletionPercentage} size={56} strokeWidth={4} />
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-extrabold text-stone-800 tracking-tight leading-tight">
              Today
            </h2>
            <p className="text-[13px] font-medium text-stone-400 mt-0.5">
              {formattedDate}
            </p>
          </div>
          <div className="shrink-0 bg-white border border-stone-100 rounded-xl px-3.5 py-2 text-center shadow-sm">
            <span className="block text-lg font-extrabold text-amber-600 leading-none">{todayCompleted}/{todayTotal}</span>
            <span className="block text-[9px] font-semibold text-stone-400 mt-0.5 uppercase tracking-wider">Selesai</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pb-2">
        {todayTasks.length === 0 && !isAdding ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 flex items-center justify-center mb-4">
              <ListTodo className="w-7 h-7 text-amber-400" />
            </div>
            <h4 className="text-sm font-bold text-stone-500 mb-1">Tidak ada tugas hari ini</h4>
            <p className="text-xs font-medium text-stone-400 max-w-[200px]">Tambah tugas baru untuk memulai hari.</p>
          </div>
        ) : (
          todayTasks.map((task) => {
            const isEditing = editingTaskId === task.id;
            const catColor = CATEGORY_COLORS[task.category] || CATEGORY_COLORS['Category'];
            return (
              <div
                key={task.id}
                className={`flex items-center gap-3 py-2.5 px-3.5 bg-white border border-stone-100 rounded-xl transition-all duration-200 shadow-card hover:shadow-card-hover hover:border-stone-200 min-h-[48px] ${
                  task.completed ? 'opacity-40' : ''
                }`}
              >
                <button
                  onClick={() => handleToggle(task)}
                  className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center transition-all duration-200 ${
                    task.completed
                      ? 'bg-success border-2 border-success text-white shadow-glow-amber'
                      : 'border-2 border-stone-300 hover:border-amber-400 hover:bg-amber-50'
                  }`}
                >
                  {task.completed && <Check className="w-3.5 h-3.5 stroke-[3.5] check-pop" />}
                </button>

                <div className="flex-1 min-w-0 overflow-hidden">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={() => handleSaveEdit(task.id)}
                      onKeyDown={(e) => handleKeyEdit(e, task.id)}
                      autoFocus
                      className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-sm font-medium text-stone-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15"
                    />
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        onClick={() => handleEdit(task)}
                        className={`block text-[14px] font-semibold tracking-wide truncate todo-strikethrough max-w-[180px] sm:max-w-[280px] ${
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
                  className="w-7 h-7 shrink-0 flex items-center justify-center text-stone-300 hover:text-danger rounded-lg hover:bg-danger-light transition-all duration-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}

        {isAdding ? (
          <div className="flex items-center gap-3 py-2.5 px-3.5 bg-white border border-amber-300/50 rounded-xl shadow-card min-h-[48px]">
            <div className="w-6 h-6 rounded-full border-2 border-stone-200 shrink-0" />
            <input
              ref={addInputRef}
              type="text"
              value={newText}
              placeholder="Ketik dan tekan enter..."
              onChange={(e) => setNewText(e.target.value)}
              onBlur={handleSaveNew}
              onKeyDown={handleKeyNew}
              className="flex-1 bg-transparent text-[14px] font-medium text-stone-800 outline-none placeholder-stone-400"
            />
          </div>
        ) : (
          <button
            onClick={handleStartAdd}
            className="flex items-center gap-3 py-3 px-3.5 border border-dashed border-stone-200 hover:border-amber-300/50 rounded-xl transition-all duration-200 w-full text-left group"
          >
            <div className="w-6 h-6 rounded-full border-2 border-dashed border-stone-300 group-hover:border-amber-500 flex items-center justify-center shrink-0 transition-colors">
              <Plus className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <span className="text-[13px] font-medium text-stone-400 group-hover:text-amber-700 transition-colors">
              Tambah tugas hari ini
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default TodoListView;
