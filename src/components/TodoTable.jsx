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

  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editText, setEditText] = useState('');

  const addInputRef = useRef(null);

  const DAYS_SHORT = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const DAYS_LONG = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  const isWeekly = timeframe === 'This Week';

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
    if (e.key === 'Enter') handleSaveNew();
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
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
        {/* Non-weekly view */}
        {!isWeekly && (
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-neutral-400 uppercase tracking-widest">
                  To Do List
                </h3>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {activeTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-6 text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                    <Inbox className="w-6 h-6 sm:w-7 sm:h-7 text-neutral-300" />
                  </div>
                  <h4 className="text-sm font-semibold text-neutral-400 mb-1">
                    No tasks yet
                  </h4>
                  <p className="text-xs text-neutral-300 max-w-[200px]">
                    Tap the button below to add your first task for {timeframe}.
                  </p>
                </div>
              ) : (
                activeTasks.map((task) => {
                  const isEditing = editingTaskId === task.id;
                  return (
                    <div
                      key={task.id}
                      className={`group flex items-center gap-2 py-2.5 px-3 bg-white border border-neutral-100 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md min-h-[48px] ${
                        task.completed ? 'opacity-50' : ''
                      }`}
                    >
                      <button
                        onClick={() => handleToggleNormal(task)}
                        className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center transition-all duration-200 focus:outline-none cursor-pointer ${
                          task.completed
                            ? 'bg-green-500 border border-green-500 text-white'
                            : 'border-2 border-neutral-300 hover:border-green-400'
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
                            className="w-full bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-sm sm:text-base font-medium focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
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
                        className="w-8 h-8 shrink-0 flex items-center justify-center text-neutral-300 hover:text-red-500 rounded-lg hover:bg-red-50/50 transition-colors opacity-50 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}

              {isAdding ? (
                <div className="flex items-center gap-2 py-2.5 px-3 bg-white border border-neutral-200 rounded-xl shadow-sm min-h-[48px]">
                  <div className="w-6 h-6 rounded-full border-2 border-neutral-200 shrink-0 bg-neutral-50" />
                  <input
                    ref={addInputRef}
                    type="text"
                    value={newText}
                    placeholder="Ketik dan tekan enter..."
                    onChange={(e) => setNewText(e.target.value)}
                    onBlur={handleSaveNew}
                    onKeyDown={handleKeyPressNew}
                    className="flex-1 bg-transparent text-sm sm:text-base font-medium text-neutral-800 focus:outline-none placeholder-neutral-400"
                  />
                </div>
              ) : (
                <button
                  onClick={handleStartAdd}
                  className="flex items-center gap-2 py-3.5 px-3 border-2 border-dashed border-neutral-200 hover:border-accent/40 bg-transparent group rounded-xl transition-all duration-200 cursor-pointer w-full text-left min-h-[48px]"
                >
                  <div className="w-6 h-6 rounded-full border-2 border-neutral-300 group-hover:border-accent/60 transition-colors flex items-center justify-center shrink-0">
                    <Plus className="w-3.5 h-3.5 text-neutral-400 group-hover:text-accent" />
                  </div>
                  <span className="text-sm font-semibold text-neutral-400 group-hover:text-neutral-500 transition-colors">
                    Add the task
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Weekly view */}
        {isWeekly && (
          <div className="min-w-0 overflow-x-auto no-scrollbar pb-2">
            {/* Define column widths for alignment */}
            {/* Day circle: w-10 (mobile), sm:w-[44px] (desktop) */}
            {/* Gap between circles: gap-3 */}
            {/* Total day circles width: 7 * (circle_w + 12px gap) - gap */}
            {/*   mobile: 7 * 40 + 6 * 12 = 280 + 72 = 352 */}
            {/*   desktop: 7 * 44 + 6 * 12 = 308 + 72 = 380 */}

            <div className="min-w-[600px] sm:min-w-[680px]">
              {/* Header Row */}
              <div className="flex items-center gap-3 mb-3 px-1">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-neutral-400 uppercase tracking-widest">
                    To Do List
                  </h3>
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
              </div>

              {/* Task Rows */}
              <div className="flex flex-col gap-2.5">
                {activeTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-6 text-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                      <Inbox className="w-6 h-6 sm:w-7 sm:h-7 text-neutral-300" />
                    </div>
                    <h4 className="text-sm font-semibold text-neutral-400 mb-1">
                      No tasks yet
                    </h4>
                    <p className="text-xs text-neutral-300 max-w-[200px]">
                      Tap the button below to add your first task for {timeframe}.
                    </p>
                  </div>
                ) : (
                  activeTasks.map((task) => {
                    const isEditing = editingTaskId === task.id;
                    const isAllDone = task.history?.every(Boolean);

                    return (
                      <div
                        key={task.id}
                        className={`flex items-center gap-3 py-2.5 px-3 bg-white border border-neutral-100 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md min-h-[48px] ${
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
                              className="w-full bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-sm sm:text-base font-medium focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
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
                                    ? 'bg-green-500 text-white shadow-sm shadow-green-500/30'
                                    : 'border-2 border-neutral-200 bg-neutral-50 hover:border-green-400'
                                }`}
                              >
                                {isDayChecked && <Check className="w-4 h-4 stroke-[4]" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {/* Add Task */}
                {isAdding ? (
                  <div className="flex items-center gap-3 py-2.5 px-3 bg-white border border-neutral-200 rounded-xl shadow-sm min-h-[48px]">
                    <input
                      ref={addInputRef}
                      type="text"
                      value={newText}
                      placeholder="Ketik dan tekan enter..."
                      onChange={(e) => setNewText(e.target.value)}
                      onBlur={handleSaveNew}
                      onKeyDown={handleKeyPressNew}
                      className="flex-1 bg-transparent text-sm sm:text-base font-medium text-neutral-800 focus:outline-none placeholder-neutral-400"
                    />
                  </div>
                ) : (
                  <button
                    onClick={handleStartAdd}
                    className="flex items-center gap-3 py-3.5 px-3 border-2 border-dashed border-neutral-200 hover:border-accent/40 bg-transparent group rounded-xl transition-all duration-200 cursor-pointer w-full text-left min-h-[48px]"
                  >
                    <span className="text-sm sm:text-base font-semibold text-neutral-400 group-hover:text-neutral-500 transition-colors">
                      + Add the task
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoTable;