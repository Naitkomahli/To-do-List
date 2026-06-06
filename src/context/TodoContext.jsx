import { createContext, useContext, useState, useEffect } from 'react';

const TodoContext = createContext();

// Helper: dapetin key minggu ISO (contoh: "2026-W23")
const getWeekKey = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDays = Math.floor((now - startOfYear) / 86400000);
  const weekNum = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
};

// 1. Modifikasi DEFAULT_TASKS: tipe 'This Week' sekarang menggunakan array history [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
const DEFAULT_TASKS = [
  // Today Tasks
  { id: 1, text: 'Inter', completed: true, category: 'Design System', timeframe: 'Today' },
  { id: 2, text: 'SF Pro', completed: false, category: 'Typography', timeframe: 'Today' },
  { id: 3, text: 'Tailwind CSS Integration', completed: false, category: 'Development', timeframe: 'Today' },
  { id: 4, text: 'Dims strikrough', completed: true, category: 'Animations', timeframe: 'Today' },
  { id: 5, text: 'Service Worker Configuration', completed: false, category: 'PWA', timeframe: 'Today' },
  
  // This Week Tasks (Menggunakan struktur matriks 7 hari: index 0 = Senin, 6 = Minggu)
  { id: 6, text: 'Aesthetic Radial Progress Ring', history: [true, true, false, false, false, false, false], category: 'Design System', timeframe: 'This Week' },
  { id: 7, text: 'Segmented Control Apple Transitions', history: [true, false, true, false, false, false, false], category: 'Animations', timeframe: 'This Week' },
  { id: 8, text: 'Google Auth Popup Simulation', history: [false, false, false, false, false, false, false], category: 'Auth', timeframe: 'This Week' },
  { id: 9, text: 'PWA Touch Icon Asset Creation', history: [false, false, false, false, false, false, false], category: 'PWA', timeframe: 'This Week' },
  { id: 10, text: 'Dynamic Header Remaining Subtext', history: [false, false, false, false, false, false, false], category: 'Development', timeframe: 'This Week' },
  
];

export const TodoProvider = ({ children }) => {
  // Auth state — persist login agar tidak perlu login ulang
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('todo_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.name) return parsed;
      }
    } catch {
      localStorage.removeItem('todo_user');
    }
    return null;
  });

  // Timeframe state
  const [timeframe, setTimeframe] = useState(() => {
    const savedTimeframe = localStorage.getItem('todo_timeframe');
    if (savedTimeframe === 'This Month') {
      localStorage.removeItem('todo_timeframe');
      return 'Today';
    }
    return savedTimeframe || 'Today';
  });

  // Tasks state — dengan auto-reset harian dan mingguan
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('todo_tasks');
    const loadedTasks = savedTasks ? JSON.parse(savedTasks) : DEFAULT_TASKS;

    // Filter: hapus semua task "This Month" dari localStorage lama
    let filteredTasks = loadedTasks.filter(task => task.timeframe !== 'This Month');

    // --- CETAK ULANG DEFAULT jika tidak ada data lokal (first run) ---
    const hasLocalData = savedTasks !== null;
    if (!hasLocalData) {
      filteredTasks = DEFAULT_TASKS;
    }

    // --- CEK PERGANTIAN HARI (reset Today) ---
    const todayStr = new Date().toDateString();
    const lastOpenedDate = localStorage.getItem('todo_last_opened_date');
    const isNewDay = lastOpenedDate && lastOpenedDate !== todayStr;

    // --- CEK PERGANTIAN MINGGU (reset This Week) ---
    const currentWeekKey = getWeekKey();
    const lastOpenedWeek = localStorage.getItem('todo_last_opened_week');
    const isNewWeek = lastOpenedWeek && lastOpenedWeek !== currentWeekKey;

    if (isNewDay) {
      filteredTasks = filteredTasks.map(task =>
        task.timeframe === 'Today' ? { ...task, completed: false } : task
      );
    }

    if (isNewWeek) {
      filteredTasks = filteredTasks.map(task =>
        task.timeframe === 'This Week'
          ? { ...task, history: [false, false, false, false, false, false, false] }
          : task
      );
    }

    // Simpan tanggal & week terakhir dibuka
    localStorage.setItem('todo_last_opened_date', todayStr);
    localStorage.setItem('todo_last_opened_week', currentWeekKey);

    return filteredTasks;
  });

  // Custom categories list
  const [categories] = useState([
    'Design System',
    'Typography',
    'Development',
    'Animations',
    'PWA',
    'Auth',
    'Research',
    'Marketing',
    'Category'
  ]);

  // Persist user
  useEffect(() => {
    if (user) {
      localStorage.setItem('todo_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('todo_user');
    }
  }, [user]);

  // Persist timeframe
  useEffect(() => {
    localStorage.setItem('todo_timeframe', timeframe);
  }, [timeframe]);

  // Persist tasks + update last opened date/week setiap kali tasks berubah
  useEffect(() => {
    localStorage.setItem('todo_tasks', JSON.stringify(tasks));
    localStorage.setItem('todo_last_opened_date', new Date().toDateString());
    localStorage.setItem('todo_last_opened_week', getWeekKey());
  }, [tasks]);

  // Google Login
  const loginWithGoogle = (account) => {
    setUser({
      name: account.name || 'essumr',
      email: account.email || 'essumr@todo.com',
      avatar: account.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'
    });
  };

  // Sign out
  const logout = () => {
    setUser(null);
  };

  // 3. LOGIKA BARU: Modifikasi fungsi Toggle Task agar mendukung pencentangan harian maupun matriks 7 hari
  const toggleTask = (id, dayIndex = null) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id !== id) return task;

        if (task.timeframe === 'This Week' && dayIndex !== null) {
          const newHistory = [...task.history];
          newHistory[dayIndex] = !newHistory[dayIndex];
          return { ...task, history: newHistory };
        } else {
          return { ...task, completed: !task.completed };
        }
      })
    );
  };

  // 4. LOGIKA BARU: Sesuaikan fungsi tambah tugas agar mengenali cetakan history kosong untuk tugas mingguan
  const addTask = (text, category = 'Category', taskTimeframe = timeframe) => {
    const newTask = {
      id: Date.now(),
      text,
      category,
      timeframe: taskTimeframe,
      ...(taskTimeframe === 'This Week' 
        ? { history: [false, false, false, false, false, false, false] }
        : { completed: false }
      )
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  // Delete Task
  const deleteTask = (id) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  // Update Task Text
  const updateTaskText = (id, newText) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, text: newText } : task
      )
    );
  };

  // Update Task Category
  const updateTaskCategory = (id, newCategory) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, category: newCategory } : task
      )
    );
  };

  // Backward compat: activeTasks = all tasks for legacy usage
  const activeTasks = tasks;

  // Separate today and weekly tasks
  const todayTasks = tasks.filter(t => t.timeframe === 'Today');
  const weeklyTasks = tasks.filter(t => t.timeframe === 'This Week');

  // Combined stats for progress dashboard
  const todayTotal = todayTasks.length;
  const todayCompleted = todayTasks.filter(t => t.completed).length;
  const weeklyTotal = weeklyTasks.length * 7;
  const weeklyCompleted = weeklyTasks.reduce((acc, task) => {
    return acc + (task.history ? task.history.filter(day => day).length : 0);
  }, 0);

  const totalCalculatedTasks = todayTotal + weeklyTotal;
  const completedTasksCount = todayCompleted + weeklyCompleted;
  const remainingTasksCount = totalCalculatedTasks - completedTasksCount;
  
  const completionPercentage = totalCalculatedTasks > 0
    ? Math.round((completedTasksCount / totalCalculatedTasks) * 100)
    : 0;

  return (
    <TodoContext.Provider
      value={{
        user,
        timeframe,
        tasks,
        categories,
        activeTasks,
        todayTasks,
        weeklyTasks,
        remainingTasksCount,
        completionPercentage,
        setTimeframe,
        loginWithGoogle,
        logout,
        toggleTask,
        addTask,
        deleteTask,
        updateTaskText,
        updateTaskCategory
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

/* eslint-disable-next-line react-refresh/only-export-components */
export const useTodo = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
};