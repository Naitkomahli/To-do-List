import { useState, useRef } from 'react';
import { useTodo } from '../context/TodoContext';
import { Check, Plus, Trash2, Inbox } from 'lucide-react';

const TodoTable = ({ onCompleteAction }) => {
  const {
    timeframe,
    activeTasks,
    toggleTask,
    addTask,
    deleteTask,
    updateTaskText,
  } = useTodo();

  const [isAdding, setIsAdding]           = useState(false);
  const [newText, setNewText]             = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editText, setEditText]           = useState('');

  const addInputRef = useRef(null);

  const DAYS_SHORT = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const DAYS_LONG  = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  const isWeekly = timeframe === 'This Week';

  // ─── Handlers ────────────────────────────────────────────────────────────────

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

  const handleStartAdd = () => {
    setIsAdding(true);
    setTimeout(() => addInputRef.current?.focus(), 50);
  };

  const handleSaveNew = () => {
    if (newText.trim()) {
      addTask(newText.trim());
      onCompleteAction(`Created task "${newText.trim()}"`);
      setNewText('');
    }
    setIsAdding(false);
  };

  const handleKeyPressNew = (e) => {
    if (e.key === 'Enter')  handleSaveNew();
    if (e.key === 'Escape') { setIsAdding(false); setNewText(''); }
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
    if (e.key === 'Enter')  handleSaveEdit(id);
    if (e.key === 'Escape') setEditingTaskId(null);
  };

  const handleDeleteTask = (task) => {
    if (window.confirm(`Delete "${task.text}"?`)) {
      deleteTask(task.id);
      onCompleteAction(`Deleted "${task.text}"`);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col min-h-0 select-none pb-4 font-sans">

      {/* Single scrollable container — everything scrolls together */}
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto no-scrollbar">
        {/* w-max min-w-full: expands to fit content, but always fills container width */}
        <div className="w-max min-w-full px-1 sm:px-3">

          {/* ── Header Row ──────────────────────────────────────────────────── */}
          <div className={`flex items-center gap-2 sm:gap-3 mb-2 w-full ${isWeekly ? 'pr-2 sm:pr-0' : ''}`}>
            <div className={`shrink-0 overflow-hidden ${isWeekly ? 'w-24 sm:w-32' : 'flex-1'}`}>
              <h3 className="text-xs sm:text-sm font-bold text-neutral-500 uppercase tracking-wider truncate">
                To Do List
              </h3>
            </div>

            {isWeekly && DAYS_SHORT.map((day, i) => (
              <div
                key={i}
                className="w-8 sm:w-10 shrink-0 flex items-center justify-center text-[8px] sm:text-[9px] font-black text-neutral-400 uppercase"
              >
                {day}
              </div>
            ))}

            {/* Spacer for delete column */}
            {isWeekly && <div className="w-8 sm:w-8 shrink-0" />}
          </div>

          {/* ── Task Rows ───────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-1.5 sm:gap-1.5">
            {activeTasks.length === 0 ? (
              /* ── Empty State ── */
              <div className="flex flex-col items-center justify-center py-10 sm:py-12 px-6 text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                  <Inbox className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-300" />
                </div>
                <h4 className="text-sm font-semibold text-neutral-400 mb-1">
                  No tasks yet
                </h4>
                <p className="text-[11px] text-neutral-300 max-w-[200px]">
                  Tap the button below to add your first task for {timeframe}.
                </p>
              </div>
            ) : (
              activeTasks.map((task) => {
              const isEditing       = editingTaskId === task.id;
              const isAllWeeklyDone = isWeekly && task.history?.every(Boolean);
              const isTaskCompleted = isWeekly ? isAllWeeklyDone : task.completed;

              return (
                <div
                  key={task.id}
                  className={`group flex items-center gap-2 sm:gap-3 py-2.5 sm:py-2.5 px-2 sm:px-3 bg-white border border-neutral-100 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md w-full min-h-[44px] ${
                    isTaskCompleted ? 'opacity-50' : ''
                  }`}
                >
                  {/* Checkbox — non-weekly only */}
                  {!isWeekly && (
                    <button
                      onClick={() => handleToggleNormal(task)}
                      className={`w-6 h-6 sm:w-5 sm:h-5 rounded-full shrink-0 flex items-center justify-center transition-all duration-300 focus:outline-none cursor-pointer ${
                        task.completed
                          ? 'bg-green-500 border border-green-500 text-white hover:scale-105'
                          : 'border border-neutral-300 hover:border-green-400'
                      }`}
                    >
                      {task.completed && <Check className="w-3.5 h-3.5 sm:w-3 sm:h-3 stroke-[3.5]" />}
                    </button>
                  )}

                  {/* Task Name */}
                  <div className={`${isWeekly ? 'w-24 sm:w-32' : 'flex-1'} shrink-0 overflow-hidden`}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={() => handleSaveEdit(task.id)}
                        onKeyDown={(e) => handleKeyPressEdit(e, task.id)}
                        autoFocus
                        className="w-full bg-white border border-neutral-200 rounded-lg px-2 py-0.5 text-xs focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                      />
                    ) : (
                      <span
                        onClick={() => handleStartEdit(task)}
                        className={`text-xs font-semibold tracking-wide truncate cursor-pointer block todo-strikethrough ${
                          isTaskCompleted
                            ? 'completed text-green-600 line-through'
                            : 'text-neutral-800'
                        }`}
                      >
                        {task.text}
                      </span>
                    )}
                  </div>

                  {/* Weekly 7-day circles — lebih kecil di HP */}
                  {isWeekly && task.history && task.history.map((isDayChecked, dayIndex) => (
                    <button
                      key={dayIndex}
                      onClick={() => handleToggleWeekly(task, dayIndex)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 focus:outline-none cursor-pointer ${
                        isDayChecked
                          ? 'bg-green-500 text-white scale-105 shadow-sm shadow-green-500/40'
                          : 'border border-neutral-200 bg-neutral-50 hover:border-green-400'
                      }`}
                    >
                      {isDayChecked && <Check className="w-3 h-3 sm:w-3 sm:h-3 stroke-[4]" />}
                    </button>
                  ))}

                  {/* Delete Button — visible on mobile, hover on desktop */}
                  <button
                    onClick={() => handleDeleteTask(task)}
                    className="w-8 shrink-0 flex items-center justify-center p-1 text-neutral-300 hover:text-red-500 rounded-lg hover:bg-red-50/50 transition-colors opacity-50 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 cursor-pointer min-h-[44px]"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              );
            }))}

            {isAdding ? (
              <div className="flex items-center gap-2 sm:gap-3 py-2.5 sm:py-2.5 px-2 sm:px-3 bg-white border border-neutral-200 rounded-xl shadow-sm min-h-[44px]">
                <div className="w-5 h-5 rounded-full border border-neutral-200 shrink-0 bg-neutral-50" />
                <input
                  ref={addInputRef}
                  type="text"
                  value={newText}
                  placeholder="Ketik dan tekan enter..."
                  onChange={(e) => setNewText(e.target.value)}
                  onBlur={handleSaveNew}
                  onKeyDown={handleKeyPressNew}
                  className="flex-1 bg-transparent text-xs font-semibold text-neutral-800 focus:outline-none placeholder-neutral-400"
                />
              </div>
            ) : (
              <button
                onClick={handleStartAdd}
                className="flex items-center gap-2 sm:gap-3 py-3.5 sm:py-3.5 px-2 sm:px-3 border border-dashed border-neutral-200 hover:border-accent bg-transparent group rounded-xl transition-all duration-200 cursor-pointer w-full text-left min-h-[44px]"
              >
                <div className="w-5 h-5 rounded-full border border-neutral-300 group-hover:border-accent transition-colors flex items-center justify-center shrink-0">
                  <Plus className="w-3.5 h-3.5 text-neutral-400 group-hover:text-accent" />
                </div>
                <span className="text-xs font-bold text-neutral-400 group-hover:text-neutral-500 transition-colors">
                  Add the task
                </span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default TodoTable;