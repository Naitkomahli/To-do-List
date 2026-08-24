import { useState, useRef } from 'react';
import { useTodo } from '../context/TodoContext';
import { useCountUp } from '../hooks/useCountUp';
import { fireCelebration } from '../utils/confetti';
import SkeletonRow from './SkeletonRow';
import { Check, Plus, Trash2, Flame, CalendarDays } from 'lucide-react';

const DAYS_SHORT = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const DAYS_LONG = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const DonutChart = ({ percentage, size = 88, strokeWidth = 8 }) => {
  const animatedPct = useCountUp(percentage, 700);
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (animatedPct / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="habitDonutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} stroke="#EDE6D8" strokeWidth={strokeWidth} fill="transparent" />
        <circle
          cx={size/2} cy={size/2} r={r}
          stroke="url(#habitDonutGrad)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-xl font-extrabold text-stone-800 leading-none tabular-nums">{animatedPct}%</span>
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
        const isToday = i === ((new Date().getDay() + 6) % 7);
        const height = Math.max((value / maxVal) * 100, value > 0 ? 15 : 4);
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1 group/bar">
            <span className={`text-[8px] font-semibold tabular-nums transition-colors ${value > 0 ? 'text-accent' : 'text-stone-300'} ${isToday ? 'underline underline-offset-2 decoration-stone-300' : ''}`}>{value}</span>
            <div
              className="w-full rounded-md transition-all duration-500 ease-out group-hover/bar:brightness-110"
              style={{
                height: `${height}%`,
                background: value > 0 ? 'linear-gradient(180deg, #F59E0B, #D97706)' : '#EDE6D8',
                minHeight: value > 0 ? '8px' : '4px',
              }}
            />
            <span className={`text-[7px] font-semibold uppercase ${isToday ? 'text-accent-dark' : 'text-stone-400'}`}>{day}</span>
          </div>
        );
      })}
    </div>
  );
};

const HabitsView = ({ onCompleteAction }) => {
  const {
    weeklyTasks,
    tasksLoading,
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
  const [deletingId, setDeletingId] = useState(null);
  const [pulseKey, setPulseKey] = useState(null); // `${task.id}-${dayIndex}`
  const addInputRef = useRef(null);

  const animatedCompleted = useCountUp(weeklyCompleted, 500);

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

    if (nowChecked) {
      setPulseKey(`${task.id}-${dayIndex}`);
      setTimeout(() => setPulseKey(null), 520);

      // Konfeti saat centang terakhir minggu ini
      if (weeklyCompleted + 1 === weeklyTotal) {
        setTimeout(fireCelebration, 250);
      }
    }

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

  const handleSaveNew = (e) => {
    e.preventDefault();
    if (newText.trim()) {
      addTask(newText.trim(), 'Category', 'This Week');
      onCompleteAction(`Created habit "${newText.trim()}"`);
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

  const renderDayButton = (task, checked, dayIndex, dayDate, mobile = false) => {
    const isToday = dayDate.toDateString() === today.toDateString();
    const pulse = pulseKey === `${task.id}-${dayIndex}`;
    return (
      <button
        key={dayIndex}
        onClick={() => handleToggle(task, dayIndex)}
        className={`${mobile ? 'w-9 h-9' : 'w-9 h-9 sm:w-10 sm:h-10'} rounded-full flex items-center justify-center shrink-0 transition-all duration-200 active:scale-90 ${
          pulse ? 'checkbox-active' : ''
        } ${
          checked
            ? 'bg-success text-white shadow-glow-amber'
            : isToday
              ? 'border-2 border-accent/50 bg-amber-light hover:border-success hover:bg-success-light'
              : 'border-2 border-stone-200 bg-white hover:border-success hover:bg-success-light'
        }`}
      >
        {checked && <Check className={`${mobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} stroke-[3.5] check-pop`} />}
      </button>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 select-none">
      <div className="mb-5">
        <div className="flex items-center gap-4">
          <DonutChart percentage={weeklyCompletionPercentage} size={88} strokeWidth={8} />
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-[26px] font-extrabold text-stone-800 tracking-tight leading-tight">
              Habits
            </h2>
            <p className="text-[13px] font-medium text-stone-400 mt-0.5">{weekRange}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-white border border-stone-100 rounded-xl px-3.5 py-2 text-center shadow-card-premium">
              <span className="block font-display text-lg font-extrabold text-accent leading-none tabular-nums">{animatedCompleted}/{weeklyTotal}</span>
              <span className="block text-[9px] font-semibold text-stone-400 mt-0.5 uppercase tracking-wider">Centang</span>
            </div>
            {streak > 0 && (
              <div className="bg-amber-light border border-amber-200/40 rounded-xl px-3 py-2 text-center shadow-card">
                <div className="flex items-center gap-1 justify-center">
                  <Flame className="w-4 h-4 text-accent animate-flame" />
                  <span className="font-display text-lg font-extrabold text-accent leading-none tabular-nums">{streak}</span>
                </div>
                <span className="block text-[8px] font-semibold text-amber-500/60 mt-0.5 uppercase tracking-wider">Streak</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {!tasksLoading && weeklyTasks.length > 0 && (
        <div className="mb-4 bg-white border border-stone-100 rounded-xl shadow-card-premium p-3.5 animate-fade-in">
          <h3 className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2.5">Minggu Ini</h3>
          <MiniBarChart tasks={weeklyTasks} />
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pb-2">
        <div className="hidden sm:flex items-center gap-2 mb-3 px-3.5">
          <div className="flex-1 min-w-0" />
          {DAYS_SHORT.map((day, i) => {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + i);
            const isToday = dayDate.toDateString() === today.toDateString();
            return (
              <div key={i} className="w-9 sm:w-10 flex flex-col items-center gap-0.5 shrink-0">
                <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">{day}</span>
                <span className={`text-[10px] font-semibold tabular-nums ${isToday ? 'text-accent' : 'text-stone-300'}`}>
                  {dayDate.getDate()}
                </span>
              </div>
            );
          })}
          <div className="w-7 shrink-0" />
        </div>

        <div className="space-y-2">
          {tasksLoading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : weeklyTasks.length === 0 && !isAdding ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 flex items-center justify-center mb-4 animate-float">
                <CalendarDays className="w-7 h-7 text-amber-400" />
              </div>
              <h4 className="text-sm font-bold text-stone-500 mb-1">Belum ada habit</h4>
              <p className="text-xs font-medium text-stone-400 max-w-[220px]">Tambah habit untuk mulai lacak progres mingguanmu.</p>
            </div>
          ) : (
            weeklyTasks.map((task) => {
              const isEditing = editingTaskId === task.id;
              const isAllDone = task.history?.every(Boolean);
              const isDeleting = deletingId === task.id;
              const doneCount = task.history ? task.history.filter(Boolean).length : 0;
              return (
                <div
                  key={task.id}
                  className={`py-2.5 px-3.5 bg-white border border-stone-100 rounded-xl transition-all duration-200 shadow-card hover:shadow-card-hover hover:border-stone-200 min-h-[48px] ${
                    isDeleting ? 'animate-task-exit' : 'animate-slide-in'
                  } ${isAllDone ? 'opacity-40' : ''}`}
                >
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
                    <>
                      {/* Desktop: single row with everything inline */}
                      <div className="hidden sm:flex items-center gap-2">
                        {task.history && (
                          <div className="w-1 h-7 rounded-full shrink-0 overflow-hidden bg-stone-100" title={`${doneCount}/7 hari`}>
                            <div
                              className="w-full bg-gradient-to-b from-amber-400 to-orange-500 rounded-full transition-all duration-500 ease-out"
                              style={{
                                height: `${Math.round((doneCount / 7) * 100)}%`,
                              }}
                            />
                          </div>
                        )}
                        <span
                          onClick={() => handleEdit(task)}
                          className={`block text-[14px] font-semibold tracking-wide truncate todo-strikethrough max-w-[130px] sm:max-w-[200px] cursor-text ${
                            isAllDone
                              ? 'completed text-stone-400'
                              : 'text-stone-700'
                          }`}
                        >
                          {task.text}
                        </span>
                        <div className="flex-1" />
                        {task.history && (
                          <div className="flex items-center gap-2 shrink-0">
                            {task.history.map((checked, dayIndex) => {
                              const dayDate = new Date(startOfWeek);
                              dayDate.setDate(startOfWeek.getDate() + dayIndex);
                              return renderDayButton(task, checked, dayIndex, dayDate);
                            })}
                          </div>
                        )}
                        <button
                          onClick={() => handleDelete(task)}
                          className="w-7 h-7 shrink-0 flex items-center justify-center text-stone-300 hover:text-danger hover:bg-danger-light rounded-lg transition-all duration-200 active:scale-90"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Mobile: stacked layout */}
                      <div className="sm:hidden">
                        <div className="flex items-center gap-2 mb-2">
                          {task.history && (
                            <div className="w-1 h-7 rounded-full shrink-0 overflow-hidden bg-stone-100">
                              <div
                                className="w-full bg-gradient-to-b from-amber-400 to-orange-500 rounded-full transition-all duration-500 ease-out"
                                style={{
                                  height: `${Math.round((doneCount / 7) * 100)}%`,
                                }}
                              />
                            </div>
                          )}
                          <span
                            onClick={() => handleEdit(task)}
                            className={`block text-[14px] font-semibold tracking-wide truncate todo-strikethrough flex-1 min-w-0 cursor-text ${
                              isAllDone
                                ? 'completed text-stone-400'
                                : 'text-stone-700'
                            }`}
                          >
                            {task.text}
                          </span>
                          <button
                            onClick={() => handleDelete(task)}
                            className="w-7 h-7 shrink-0 flex items-center justify-center text-stone-300 hover:text-danger hover:bg-danger-light rounded-lg transition-all duration-200 active:scale-90"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {task.history && (
                          <div className="flex items-start justify-between px-1">
                            {task.history.map((checked, dayIndex) => {
                              const dayDate = new Date(startOfWeek);
                              dayDate.setDate(startOfWeek.getDate() + dayIndex);
                              const dayName = DAYS_SHORT[dayIndex];
                              return (
                                <div key={dayIndex} className="flex flex-col items-center gap-0.5">
                                  <span className={`text-[8px] font-semibold uppercase ${dayDate.toDateString() === today.toDateString() ? 'text-accent-dark' : 'text-stone-400'}`}>{dayName}</span>
                                  {renderDayButton(task, checked, dayIndex, dayDate, true)}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}

          {!tasksLoading && (isAdding ? (
            <form onSubmit={handleSaveNew} className="contents">
            <div className="flex items-center gap-2 py-2.5 px-3.5 bg-white border border-accent/40 rounded-xl shadow-card animate-slide-in min-h-[48px] ring-4 ring-accent/5">
              <input
                ref={addInputRef}
                type="text"
                value={newText}
                placeholder="Nama habit..."
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
                Tambah habit baru
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HabitsView;
