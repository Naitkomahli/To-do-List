import { useState, useRef } from 'react';
import { useTodo } from '../context/TodoContext';
import { Check, Plus, Trash2, Inbox } from 'lucide-react';

const CircularProgress = ({ percentage, size = 48, strokeWidth = 4, color = '#1A73E8' }) => {
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
        <span className="text-xs font-bold text-neutral-700">{percentage}%</span>
      </div>
    </div>
  );
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
          {/* Today Header — Subjudul besar + progress */}
          <div className="mb-5 px-1">
            <div className="flex items-center gap-4">
              <CircularProgress
                percentage={todayCompletionPercentage}
                size={52}
                strokeWidth={4}
                color="#EAB308"
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                  Today
                </h2>
                <p className="text-sm text-neutral-400 font-medium mt-0.5">
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
                  <Inbox className="w-6 h-6 text-amber-300" />
                </div>
                <h4 className="text-sm font-semibold text-neutral-400 mb-1">
                  Belum ada tugas
                </h4>
                <p className="text-xs text-neutral-300 max-w-[200px]">
                  Ketuk tombol di bawah untuk menambahkan tugas hari ini.
                </p>
              </div>
            ) : (
              todayTasks.map((task) => {
                const isEditing = editingTaskId === task.id;
                return (
                  <div
                    key={task.id}
                    className={`group flex items-center gap-3 py-2.5 px-3.5 bg-white border border-neutral-100 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:border-neutral-200 min-h-[48px] ${
                      task.completed ? 'opacity-50' : ''
                    }`}
                  >
                    <button
                      onClick={() => handleToggleNormal(task)}
                      className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center transition-all duration-300 focus:outline-none cursor-pointer ${
                        task.completed
                          ? 'bg-green-500 border-2 border-green-500 text-white shadow-sm shadow-green-500/30 scale-110'
                          : 'border-2 border-neutral-300 hover:border-green-400 hover:bg-green-50 hover:scale-110'
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
                          className="w-full bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-sm sm:text-base font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                        />
                      ) : (
                        <span
                          onClick={() => handleStartEdit(task)}
                          className={`block text-sm sm:text-base font-semibold tracking-wide truncate cursor-pointer todo-strikethrough ${
                            task.completed
                              ? 'completed text-green-600 line-through'
                              : 'text-neutral-800'
                          }`}
                        >
                          {task.text}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task)}
                      className="w-7 h-7 shrink-0 flex items-center justify-center text-neutral-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all duration-200 opacity-60 group-hover:opacity-100 cursor-pointer"
                      title="Hapus tugas"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}

            {activeSection === 'today' ? (
              <div className="flex items-center gap-3 py-2.5 px-3.5 bg-white border border-amber-200 rounded-xl shadow-sm min-h-[48px]">
                <div className="w-6 h-6 rounded-full border-2 border-neutral-200 shrink-0 bg-neutral-50" />
                <input
                  ref={addInputRef}
                  type="text"
                  value={newText}
                  placeholder="Ketik dan tekan enter..."
                  onChange={(e) => setNewText(e.target.value)}
                  onBlur={() => handleSaveNew('today')}
                  onKeyDown={(e) => handleKeyPressNew(e, 'today')}
                  className="flex-1 bg-transparent text-sm sm:text-base font-medium text-neutral-800 focus:outline-none placeholder-neutral-400"
                />
              </div>
            ) : (
              <button
                onClick={() => handleStartAdd('today')}
                className="flex items-center gap-3 py-3.5 px-3.5 border-2 border-dashed border-neutral-200 hover:border-amber-300/50 bg-transparent group rounded-xl transition-all duration-200 cursor-pointer w-full text-left min-h-[48px]"
              >
                <div className="w-6 h-6 rounded-full border-2 border-neutral-300 group-hover:border-amber-400 transition-colors flex items-center justify-center shrink-0">
                  <Plus className="w-3.5 h-3.5 text-neutral-400 group-hover:text-amber-500" />
                </div>
                <span className="text-sm font-semibold text-neutral-400 group-hover:text-neutral-500 transition-colors">
                  Tambah tugas hari ini
                </span>
              </button>
            )}
          </div>
        </section>

        {/* ===================== THIS WEEK SECTION ===================== */}
        <section className="min-w-0 overflow-x-auto no-scrollbar pb-4">
          <div className="min-w-[640px] sm:min-w-[700px]">
            {/* This Week Header — Subjudul besar + progress */}
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
                  <p className="text-sm text-neutral-400 font-medium mt-0.5">
                    {weeklyCompleted}/{weeklyTotal} centangan
                  </p>
                </div>
              </div>
            </div>

            {/* Header Row */}
            <div className="flex items-center gap-3 mb-3 px-3.5">
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">Tugas</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 pr-1">
                {DAYS_SHORT.map((day, i) => (
                  <div
                    key={i}
                    className="w-10 sm:w-[44px] flex items-center justify-center text-[10px] sm:text-xs font-black text-neutral-400 uppercase tracking-wider"
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
                    <Inbox className="w-6 h-6 text-violet-300" />
                  </div>
                  <h4 className="text-sm font-semibold text-neutral-400 mb-1">
                    Belum ada tugas mingguan
                  </h4>
                  <p className="text-xs text-neutral-300 max-w-[200px]">
                    Ketuk tombol di bawah untuk menambahkan tugas mingguan.
                  </p>
                </div>
              ) : (
                weeklyTasks.map((task) => {
                  const isEditing = editingTaskId === task.id;
                  const isAllDone = task.history?.every(Boolean);
                  return (
                    <div
                      key={task.id}
                      className={`group flex items-center gap-3 py-2.5 px-3.5 bg-white border border-neutral-100 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:border-neutral-200 min-h-[48px] ${
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
                            className="w-full bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-sm sm:text-base font-medium focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20"
                          />
                        ) : (
                          <span
                            onClick={() => handleStartEdit(task)}
                            className={`block text-sm sm:text-base font-semibold tracking-wide truncate cursor-pointer todo-strikethrough ${
                              isAllDone
                                ? 'completed text-green-600 line-through'
                                : 'text-neutral-800'
                            }`}
                          >
                            {task.text}
                          </span>
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
                                  ? 'bg-green-500 text-white shadow-sm shadow-green-500/30 scale-105'
                                  : 'border-2 border-neutral-200 bg-neutral-50 hover:border-green-400 hover:scale-105'
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
                        className="w-7 h-7 shrink-0 flex items-center justify-center text-neutral-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all duration-200 opacity-60 group-hover:opacity-100 cursor-pointer"
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
                <div className="flex items-center gap-3 py-2.5 px-3.5 bg-white border border-violet-200 rounded-xl shadow-sm min-h-[48px]">
                  <input
                    ref={addInputRef}
                    type="text"
                    value={newText}
                    placeholder="Ketik dan tekan enter..."
                    onChange={(e) => setNewText(e.target.value)}
                    onBlur={() => handleSaveNew('week')}
                    onKeyDown={(e) => handleKeyPressNew(e, 'week')}
                    className="flex-1 bg-transparent text-sm sm:text-base font-medium text-neutral-800 focus:outline-none placeholder-neutral-400"
                  />
                </div>
              ) : (
                <button
                  onClick={() => handleStartAdd('week')}
                  className="flex items-center gap-3 py-3.5 px-3.5 border-2 border-dashed border-neutral-200 hover:border-violet-300/50 bg-transparent group rounded-xl transition-all duration-200 cursor-pointer w-full text-left min-h-[48px]"
                >
                  <span className="text-sm sm:text-base font-semibold text-neutral-400 group-hover:text-neutral-500 transition-colors">
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