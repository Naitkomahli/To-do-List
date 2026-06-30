import { useState, useRef } from 'react';
import { useTodo } from '../context/TodoContext';
import { Check, Plus, Trash2, Flame, CalendarDays } from 'lucide-react';

const DAYS_SHORT = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const DAYS_LONG = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const DonutChart = ({ percentage, size = 88, strokeWidth = 8 }) => {
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
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-extrabold text-stone-800 leading-none">{percentage}%</span>
        <span className="text-[8px] font-semibold text-stone-400 mt-0.5 uppercase tracking-wider">Selesai</span>
      </div>
    </div>
  );
};

const MiniBarChart = ({ tasks }) => {
  const dayTotals = Array(7).fill(0);
  tasks.forEach(task => {
    if (task.history) {
      task.history.forEach((checked, i) => {
        if (checked) dayTotals[i]++;
      });
    }
  });

  const maxVal = Math.max(...dayTotals, 1);

  return (
    <div className="flex items-end gap-1.5 h-14 px-1">
      {DAYS_SHORT.map((day, i) => {
        const value = dayTotals[i];
        const height = Math.max((value / maxVal) * 100, value > 0 ? 15 : 4);
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <span className="text-[8px] font-semibold text-stone-400">{value}</span>
            <div
              className="w-full rounded-md transition-all duration-500"
              style={{
                height: `${height}%`,
                backgroundColor: value > 0 ? '#D97706' : '#EDE6D8',
                minHeight: value > 0 ? '8px' : '4px',
              }}
            />
            <span className="text-[7px] font-semibold text-stone-400 uppercase">{day}</span>
          </div>
        );
      })}
    </div>
  );
};

const HabitsView = ({ onCompleteAction }) => {
  const {
    weeklyTasks,
    toggleTask,
    addTask,
    deleteTask,
    updateTaskText,
    weeklyCompleted,
    weeklyTotal,
    weeklyCompletionPercentage,
  } = useTodo();

  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editText, setEditText] = useState('');
  const addInputRef = useRef(null);

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const weekRange = `${startOfWeek.getDate()} ${startOfWeek.toLocaleDateString('id-ID', { month: 'short' })} — ${endOfWeek.getDate()} ${endOfWeek.toLocaleDateString('id-ID', { month: 'short' })} ${endOfWeek.getFullYear()}`;

  const calcStreak = () => {
    let streak = 0;
    const MAX_DAYS = 365;
    for (let d = new Date(), i = 0; i < MAX_DAYS; d.setDate(d.getDate() - 1), i++) {
      const dayOfWeek = (d.getDay() + 6) % 7;
      let checkedToday = false;
      weeklyTasks.forEach(task => {
        if (task.history && task.history[dayOfWeek]) {
          checkedToday = true;
        }
      });
      if (checkedToday) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };
  const streak = calcStreak();

  const handleToggle = (task, dayIndex) => {
    toggleTask(task.id, dayIndex);
    const nowChecked = !task.history[dayIndex];
    onCompleteAction(
      nowChecked
        ? `✅ "${task.text}" — ${DAYS_LONG[dayIndex]}!`
        : `↩️ "${task.text}" — ${DAYS_LONG[dayIndex]}`
    );
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setNewText('');
    setTimeout(() => addInputRef.current?.focus(), 50);
  };

  const handleSaveNew = () => {
    if (newText.trim()) {
      addTask(newText.trim(), 'Category', 'This Week');
      onCompleteAction(`Created habit "${newText.trim()}"`);
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
          <DonutChart percentage={weeklyCompletionPercentage} size={88} strokeWidth={8} />
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-extrabold text-stone-800 tracking-tight leading-tight">
              Habits
            </h2>
            <p className="text-[13px] font-medium text-stone-400 mt-0.5">{weekRange}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-white border border-stone-100 rounded-xl px-3.5 py-2 text-center shadow-sm">
              <span className="block text-lg font-extrabold text-amber-600 leading-none">{weeklyCompleted}/{weeklyTotal}</span>
              <span className="block text-[9px] font-semibold text-stone-400 mt-0.5 uppercase tracking-wider">Centang</span>
            </div>
            {streak > 0 && (
              <div className="bg-amber-light border border-amber-200/40 rounded-xl px-3 py-2 text-center">
                <div className="flex items-center gap-1 justify-center">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span className="text-lg font-extrabold text-amber-600 leading-none">{streak}</span>
                </div>
                <span className="block text-[8px] font-semibold text-amber-500/60 mt-0.5 uppercase tracking-wider">Streak</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {weeklyTasks.length > 0 && (
        <div className="mb-4 bg-white border border-stone-100 rounded-xl shadow-card p-3.5">
          <h3 className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2.5">Minggu Ini</h3>
          <MiniBarChart tasks={weeklyTasks} />
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pb-2">
        <div className="flex items-center gap-2 mb-3 px-3.5">
          <div className="flex-1 min-w-0" />
          {DAYS_SHORT.map((day, i) => {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + i);
            const isToday = dayDate.toDateString() === today.toDateString();
            return (
              <div key={i} className="w-9 sm:w-10 flex flex-col items-center gap-0.5 shrink-0">
                <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">{day}</span>
                <span className={`text-[10px] font-semibold ${isToday ? 'text-amber-600' : 'text-stone-300'}`}>
                  {dayDate.getDate()}
                </span>
              </div>
            );
          })}
          <div className="w-7 shrink-0" />
        </div>

        <div className="space-y-2">
          {weeklyTasks.length === 0 && !isAdding ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 flex items-center justify-center mb-4">
                <CalendarDays className="w-7 h-7 text-amber-400" />
              </div>
              <h4 className="text-sm font-bold text-stone-500 mb-1">Belum ada habit</h4>
              <p className="text-xs font-medium text-stone-400 max-w-[220px]">Tambah habit untuk mulai lacak progres mingguanmu.</p>
            </div>
          ) : (
            weeklyTasks.map((task) => {
              const isEditing = editingTaskId === task.id;
              const isAllDone = task.history?.every(Boolean);
              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-2 py-2.5 px-3.5 bg-white border border-stone-100 rounded-xl transition-all duration-200 shadow-card hover:shadow-card-hover hover:border-stone-200 min-h-[48px] ${
                    isAllDone ? 'opacity-40' : ''
                  }`}
                >
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
                      <div className="flex items-center gap-2">
                        {task.history && (
                          <div className="w-1 h-7 rounded-full shrink-0 overflow-hidden bg-stone-100">
                            <div
                              className="w-full bg-gradient-to-b from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                              style={{
                                height: `${Math.round((task.history.filter(Boolean).length / 7) * 100)}%`,
                              }}
                            />
                          </div>
                        )}
                        <span
                          onClick={() => handleEdit(task)}
                          className={`block text-[14px] font-semibold tracking-wide truncate todo-strikethrough max-w-[130px] sm:max-w-[200px] ${
                            isAllDone
                              ? 'completed text-stone-400'
                              : 'text-stone-700'
                          }`}
                        >
                          {task.text}
                        </span>
                      </div>
                    )}
                  </div>

                  {task.history && (
                    <div className="flex items-center gap-2 shrink-0">
                      {task.history.map((checked, dayIndex) => {
                        const dayDate = new Date(startOfWeek);
                        dayDate.setDate(startOfWeek.getDate() + dayIndex);
                        const isToday = dayDate.toDateString() === today.toDateString();
                        return (
                          <button
                            key={dayIndex}
                            onClick={() => handleToggle(task, dayIndex)}
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                              checked
                                ? 'bg-success text-white shadow-glow-amber'
                                : isToday
                                  ? 'border-2 border-amber-300 bg-amber-50 hover:border-success hover:bg-success-light'
                                  : 'border-2 border-stone-200 bg-white hover:border-success hover:bg-success-light'
                            }`}
                          >
                            {checked && <Check className="w-4 h-4 stroke-[3.5] check-pop" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

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
            <div className="flex items-center gap-2 py-2.5 px-3.5 bg-white border border-amber-300/50 rounded-xl shadow-card min-h-[48px]">
              <input
                ref={addInputRef}
                type="text"
                value={newText}
                placeholder="Nama habit..."
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
                Tambah habit baru
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitsView;
