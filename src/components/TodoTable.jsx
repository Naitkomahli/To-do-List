import { useState, useRef } from 'react';
import { useTodo } from '../context/TodoContext';
import { Check, Plus, Trash2, Inbox } from 'lucide-react';

const CircularProgress = ({ percentage, size = 48, strokeWidth = 4, color = '#EAB308' }) => {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="#F3F4F6"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-extrabold text-neutral-800">{percentage}%</span>
      </div>
    </div>
  );
};

// ─── Category color map ───
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

const TodoTable = ({ onCompleteAction }) => {
  const {
    todayTasks,
    weeklyTasks,
    toggleTask,
    addTask,
    deleteTask,
    updateTaskText,
    todayCompleted,
    todayTotal,
    weeklyCompleted,
    weeklyTotal,
    todayCompletionPercentage,
    weeklyCompletionPercentage,
  } = useTodo();

  const [activeSection, setActiveSection] = useState(null); // 'today' | 'week' | null
  const [newText, setNewText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editText, setEditText] = useState('');

  const addInputRef = useRef(null);

  const DAYS_SHORT = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const DAYS_LONG = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  // Handlers
  const handleToggleNormal = (task) => {
    toggleTask(task.id);
    onCompleteAction(
      task.completed ? `Unchecked "${task.text}"` : `Completed "${task.text}"!`
    );
  };

  const handleToggleWeekly = (task, dayIndex) => {
    toggleTask(task.id, dayIndex);
    const isNowChecked = !task.history[dayIndex];
    onCompleteAction(
      isNowChecked
        ? `Checked "${task.text}" untuk hari ${DAYS_LONG[dayIndex]}!`
        : `Unchecked "${task.text}" untuk hari ${DAYS_LONG[dayIndex]}`
    );
  };

  const handleStartAdd = (type) => {
    setActiveSection(type);
    setNewText('');
    setTimeout(() => addInputRef.current?.focus(), 50);
  };

  const handleSaveNew = (type) => {
    if (newText.trim()) {
      addTask(newText.trim(), 'Category', type === 'week' ? 'This Week' : 'Today');
      onCompleteAction(`Created task "${newText.trim()}"`);
      setNewText('');
    }
    setActiveSection(null);
  };

  const handleKeyPressNew = (e, type) => {
    if (e.key === 'Enter') handleSaveNew(type);
    if (e.key === 'Escape') {
      setActiveSection(null);
      setNewText('');
    }
  };

  const handleStartEdit = (task) => {
    setEditingTaskId(task.id);
    setEditText(task.text);
  };

  const handleSaveEdit = (id) => {
    if (editText.trim()) updateTaskText(id, editText.trim());
    else deleteTask(id);
    setEditingTaskId(null);
  };

  const handleKeyPressEdit = (e, id) => {
    if (e.key === 'Enter') handleSaveEdit(id);
    if (e.key === 'Escape') setEditingTaskId(null);
  };

  const handleDeleteTask = (task) => {
    if (window.confirm(`Delete "${task.text}"?`)) {
      deleteTask(task.id);
      onCompleteAction(`Deleted "${task.text}"`);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 select-none pb-2 font-sans">
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-10">
        {/* ===================== TODAY SECTION ===================== */}
        <section className="min-w-0">
          {/* Today Header */}
          <div className="mb-5 px-1">
            <div className="flex items-center gap-4">
              <CircularProgress
                percentage={todayCompletionPercentage}
                size={52}
                strokeWidth={4}
                color="#F59E0B"
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                  Today
                </h2>
                <p className="text-sm font-semibold text-neutral-500 mt-0.5">
                  {todayCompleted}/{todayTotal} selesai
                </p>
              </div>
            </div>
          </div>

          {/* Today Task List */}
          <div className="flex flex-col gap-2">
            {todayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-14 px-6 text-center">
                <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                  <Inbox className="w-6 h-6 text-amber-400" />
                </div>
                <h4 className="text-sm font-bold text-neutral-500 mb-1">
                  Belum ada tugas
                </h4>
                <p className="text-xs text-neutral-400 max-w-[200px]">
                  Ketuk tombol di bawah untuk menambahkan tugas hari ini.
                </p>
              </div>
            ) : (
              todayTasks.map((task) => {
                const isEditing = editingTaskId === task.id;
                const catColor = CATEGORY_COLORS[task.category] || CATEGORY_COLORS['Category'];
                return (
                  <div
                    key={task.id}
                    className={`group flex items-center gap-3 py-2.5 px-3.5 bg-white border border-neutral-100 rounded-xl transition-all duration-200 shadow-card hover:shadow-card-hover hover:border-neutral-200 min-h-[48px] ${
                      task.completed ? 'opacity-50' : ''
                    }`}
                  >
                    <button
                      onClick={() => handleToggleNormal(task)}
                      className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center transition-all duration-300 focus:outline-none cursor-pointer ${
                        task.completed
                          ? 'bg-emerald-500 border-2 border-emerald-500 text-white shadow-glow-green scale-110'
                          : 'border-2 border-neutral-300 hover:border-emerald-400 hover:bg-emerald-50 hover:scale-110'
                      }`}
                    >
                      {task.completed && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                    </button>

                    <div className="flex-1 min-w-0 overflow-hidden">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onBlur={() => handleSaveEdit(task.id)}
                          onKeyDown={(e) => handleKeyPressEdit(e, task.id)}
                          autoFocus
                          className="w-full bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-sm sm:text-base font-semibold text-neutral-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                        />
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            onClick={() => handleStartEdit(task)}
                            className={`block text-sm sm:text-base font-bold tracking-wide truncate cursor-pointer todo-strikethrough max-w-[180px] sm:max-w-[280px] ${
                              task.completed
                                ? 'completed text-emerald-600 line-through'
                                : 'text-neutral-900'
                            }`}
                          >
                            {task.text}
                          </span>
                          {/* Category badge */}
                          {task.category && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide shrink-0"
                              style={{
                                backgroundColor: catColor.bg,
                                color: catColor.text,
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor.dot }} />
                              {task.category}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task)}
                      className="w-7 h-7 shrink-0 flex items-center justify-center text-neutral-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Hapus tugas"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}

            {activeSection === 'today' ? (
              <div className="flex items-center gap-3 py-2.5 px-3.5 bg-white border border-amber-300 rounded-xl shadow-card min-h-[48px]">
                <div className="w-6 h-6 rounded-full border-2 border-neutral-200 shrink-0 bg-neutral-50" />
                <input
                  ref={addInputRef}
                  type="text"
                  value={newText}
                  placeholder="Ketik dan tekan enter..."
                  onChange={(e) => setNewText(e.target.value)}
                  onBlur={() => handleSaveNew('today')}
                  onKeyDown={(e) => handleKeyPressNew(e, 'today')}
                  className="flex-1 bg-transparent text-sm sm:text-base font-semibold text-neutral-900 focus:outline-none placeholder-neutral-400"
                />
              </div>
            ) : (
              <button
                onClick={() => handleStartAdd('today')}
                className="flex items-center gap-3 py-3.5 px-3.5 border-2 border-dashed border-neutral-200 hover:border-amber-300 bg-amber-50/30 hover:bg-amber-50/60 group rounded-xl transition-all duration-200 cursor-pointer w-full text-left min-h-[48px]"
              >
                <div className="w-6 h-6 rounded-full border-2 border-neutral-300 group-hover:border-amber-400 transition-colors flex items-center justify-center shrink-0">
                  <Plus className="w-3.5 h-3.5 text-neutral-400 group-hover:text-amber-500" />
                </div>
                <span className="text-sm font-bold text-neutral-500 group-hover:text-amber-600 transition-colors">
                  Tambah tugas hari ini
                </span>
              </button>
            )}
          </div>
        </section>

        {/* ===================== THIS WEEK SECTION ===================== */}
        <section className="min-w-0 overflow-x-auto no-scrollbar pb-4">
          <div className="min-w-[640px] sm:min-w-[700px]">
            {/* This Week Header */}
            <div className="mb-5 px-1">
              <div className="flex items-center gap-4">
                <CircularProgress
                  percentage={weeklyCompletionPercentage}
                  size={52}
                  strokeWidth={4}
                  color="#8B5CF6"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                    This Week
                  </h2>
                  <p className="text-sm font-semibold text-neutral-500 mt-0.5">
                    {weeklyCompleted}/{weeklyTotal} centangan
                  </p>
                </div>
              </div>
            </div>

            {/* Header Row */}
            <div className="flex items-center gap-3 mb-3 px-3.5">
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Tugas</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 pr-1">
                {DAYS_SHORT.map((day, i) => (
                  <div
                    key={i}
                    className="w-10 sm:w-[44px] flex items-center justify-center text-[10px] sm:text-xs font-extrabold text-neutral-500 uppercase tracking-wider"
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className="w-8 shrink-0" />
            </div>

            {/* Task Rows */}
            <div className="flex flex-col gap-2.5">
              {weeklyTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-14 px-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-violet-50 flex items-center justify-center mb-4">
                    <Inbox className="w-6 h-6 text-violet-400" />
                  </div>
                  <h4 className="text-sm font-bold text-neutral-500 mb-1">
                    Belum ada tugas mingguan
                  </h4>
                  <p className="text-xs text-neutral-400 max-w-[200px]">
                    Ketuk tombol di bawah untuk menambahkan tugas mingguan.
                  </p>
                </div>
              ) : (
                weeklyTasks.map((task) => {
                  const isEditing = editingTaskId === task.id;
                  const isAllDone = task.history?.every(Boolean);
                  const catColor = CATEGORY_COLORS[task.category] || CATEGORY_COLORS['Category'];
                  return (
                    <div
                      key={task.id}
                      className={`group flex items-center gap-3 py-2.5 px-3.5 bg-white border border-neutral-100 rounded-xl transition-all duration-200 shadow-card hover:shadow-card-hover hover:border-neutral-200 min-h-[48px] ${
                        isAllDone ? 'opacity-50' : ''
                      }`}
                    >
                      {/* Task Name */}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onBlur={() => handleSaveEdit(task.id)}
                            onKeyDown={(e) => handleKeyPressEdit(e, task.id)}
                            autoFocus
                            className="w-full bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-sm sm:text-base font-semibold text-neutral-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                          />
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              onClick={() => handleStartEdit(task)}
                              className={`block text-sm sm:text-base font-bold tracking-wide truncate cursor-pointer todo-strikethrough max-w-[180px] sm:max-w-[280px] ${
                                isAllDone
                                  ? 'completed text-emerald-600 line-through'
                                  : 'text-neutral-900'
                              }`}
                            >
                              {task.text}
                            </span>
                            {/* Category badge */}
                            {task.category && (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide shrink-0"
                                style={{
                                  backgroundColor: catColor.bg,
                                  color: catColor.text,
                                }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor.dot }} />
                                {task.category}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Weekly 7-day circles */}
                      {task.history && (
                        <div className="flex items-center gap-3 shrink-0 pr-1">
                          {task.history.map((isDayChecked, dayIndex) => (
                            <button
                              key={dayIndex}
                              onClick={() => handleToggleWeekly(task, dayIndex)}
                              className={`w-10 h-10 sm:w-[44px] sm:h-[44px] rounded-full flex items-center justify-center shrink-0 transition-all duration-200 focus:outline-none cursor-pointer ${
                                isDayChecked
                                  ? 'bg-emerald-500 text-white shadow-glow-green scale-105'
                                  : 'border-2 border-neutral-200 bg-neutral-50 hover:border-emerald-400 hover:bg-emerald-50 hover:scale-105'
                              }`}
                            >
                              {isDayChecked && <Check className="w-4 h-4 stroke-[4]" />}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteTask(task)}
                        className="w-7 h-7 shrink-0 flex items-center justify-center text-neutral-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Hapus tugas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}

              {/* Add Task for Weekly */}
              {activeSection === 'week' ? (
                <div className="flex items-center gap-3 py-2.5 px-3.5 bg-white border border-violet-300 rounded-xl shadow-card min-h-[48px]">
                  <input
                    ref={addInputRef}
                    type="text"
                    value={newText}
                    placeholder="Ketik dan tekan enter..."
                    onChange={(e) => setNewText(e.target.value)}
                    onBlur={() => handleSaveNew('week')}
                    onKeyDown={(e) => handleKeyPressNew(e, 'week')}
                    className="flex-1 bg-transparent text-sm sm:text-base font-semibold text-neutral-900 focus:outline-none placeholder-neutral-400"
                  />
                </div>
              ) : (
                <button
                  onClick={() => handleStartAdd('week')}
                  className="flex items-center gap-3 py-3.5 px-3.5 border-2 border-dashed border-neutral-200 hover:border-violet-300 bg-violet-50/30 hover:bg-violet-50/60 group rounded-xl transition-all duration-200 cursor-pointer w-full text-left min-h-[48px]"
                >
                  <span className="text-sm sm:text-base font-bold text-neutral-500 group-hover:text-violet-600 transition-colors">
                    + Tambah tugas mingguan
                  </span>
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TodoTable;
