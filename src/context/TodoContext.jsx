import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';

const TodoContext = createContext();

// ─── Helper untuk mendapatkan tanggal hari ini ───
const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ─── Helper untuk mendapatkan hari Monday minggu ini ───
const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const dayStr = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayStr}`;
};

export const TodoProvider = ({ children }) => {
  // ─── Auth state dari Firebase ───
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
  const [authLoading, setAuthLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [todayDate, setTodayDate] = useState(getTodayDate());
  const [currentWeek, setCurrentWeek] = useState(() => {
    return localStorage.getItem('todo_currentWeek') || getMonday(new Date());
  });

  // ─── Detect pergantian hari (cek tiap menit) ───
  useEffect(() => {
    const checkDate = () => {
      const newDate = getTodayDate();
      setTodayDate(prev => (prev !== newDate ? newDate : prev));
    };
    const interval = setInterval(checkDate, 60 * 1000);
    // Juga cek saat tab kembali fokus (kalau laptop sleep semalaman)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') checkDate();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', checkDate);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', checkDate);
    };
  }, []);

  // ─── Update currentWeek saat hari berganti ───
  useEffect(() => {
    const monday = getMonday(new Date());
    setCurrentWeek(prev => (prev !== monday ? monday : prev));
  }, [todayDate]);

  useEffect(() => {
    localStorage.setItem('todo_currentWeek', currentWeek);
  }, [currentWeek]);

  // ─── Firebase Auth listener ───
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || ''
        });
      } else {
        setUser(null);
        setTasks([]); // Reset tasks saat user logout
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // ─── Simpan user ke localStorage untuk quick load ───
  useEffect(() => {
    if (user) {
      localStorage.setItem('todo_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('todo_user');
    }
  }, [user]);

  // ─── Tab View state ───
  const [tabView, setTabView] = useState(() => {
    return localStorage.getItem('todo_tabView') || 'To-Do List';
  });

  useEffect(() => {
    localStorage.setItem('todo_tabView', tabView);
  }, [tabView]);

  // ─── Timeframe state (lokal — preferensi UI) ───
  const [timeframe, setTimeframe] = useState(() => {
    return localStorage.getItem('todo_timeframe') || 'Today';
  });

  useEffect(() => {
    localStorage.setItem('todo_timeframe', timeframe);
  }, [timeframe]);

  // Real-time listener: ambil tasks milik user saat ini
  useEffect(() => {
    if (!user || !user.uid) return;
    const q = query(
      collection(db, 'tasks'),
      where('uid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedTasks = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      // Urutkan berdasarkan createdAt
      loadedTasks.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return aTime - bTime;
      });
      setTasks(loadedTasks);
    }, (error) => {
      console.error('Firestore snapshot error:', error);
    });

    return unsubscribe;
  }, [user]);

  // ─── Auto-reset daily task ketika hari berganti ───
  // Task dengan timeframe 'Today' yang date-nya bukan hari ini akan di-reset
  // (completed = false, date = hari ini) sehingga berperilaku sebagai recurring daily task.
  useEffect(() => {
    if (!user || !user.uid || tasks.length === 0) return;
    tasks.forEach((task) => {
      if (
        task.timeframe === 'Today' &&
        task.date !== todayDate
      ) {
        updateDoc(doc(db, 'tasks', task.id), {
          completed: false,
          date: todayDate
        }).catch((err) => console.error('Failed to reset daily task:', err));
      }
    });
  }, [tasks, todayDate, user]);

  // ─── Auto-reset weekly history ketika minggu berganti ───
  useEffect(() => {
    if (!user || !user.uid || tasks.length === 0) return;
    const monday = getMonday(new Date());
    if (monday !== currentWeek) {
      tasks.forEach((task) => {
        if (task.timeframe === 'This Week' && task.history?.some(Boolean)) {
          updateDoc(doc(db, 'tasks', task.id), {
            history: [false, false, false, false, false, false, false]
          }).catch((err) => console.error('Failed to reset weekly task:', err));
        }
      });
    }
  }, [tasks, currentWeek, user]);

  // ─── Categories ───
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

  // ─── Google Login ───
  const loginWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        console.error('Google sign-in error:', err);
      }
      throw err;
    }
  }, []);

  // ─── Sign Out ───
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }, []);

  // ─── Toggle Task ───
  const toggleTask = useCallback(async (id, dayIndex = null) => {
    const taskRef = doc(db, 'tasks', id);
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (task.timeframe === 'This Week' && dayIndex !== null) {
      const newHistory = [...(task.history || [false, false, false, false, false, false, false])];
      newHistory[dayIndex] = !newHistory[dayIndex];
      await updateDoc(taskRef, { history: newHistory });
    } else {
      await updateDoc(taskRef, { completed: !task.completed });
    }
  }, [tasks]);

  // ─── Add Task ───
  const addTask = useCallback(async (text, category = 'Category', taskTimeframe = timeframe) => {
    if (!user || !user.uid) return;
    const newTask = {
      uid: user.uid,
      text,
      category,
      timeframe: taskTimeframe,
      createdAt: serverTimestamp(),
      ...(taskTimeframe === 'This Week'
        ? { history: [false, false, false, false, false, false, false] }
        : { completed: false, date: getTodayDate() }
      )
    };
    await addDoc(collection(db, 'tasks'), newTask);
  }, [user, timeframe]);

  // ─── Delete Task ───
  const deleteTask = useCallback(async (id) => {
    await deleteDoc(doc(db, 'tasks', id));
  }, []);

  // ─── Update Task Text ───
  const updateTaskText = useCallback(async (id, newText) => {
    await updateDoc(doc(db, 'tasks', id), { text: newText });
  }, []);

  // ─── Update Task Category ───
  const updateTaskCategory = useCallback(async (id, newCategory) => {
    await updateDoc(doc(db, 'tasks', id), { category: newCategory });
  }, []);

  // ─── Computed stats ───
  // Tampilkan semua task 'Today' sebagai daily recurring (status reset otomatis oleh effect di atas)
  const todayTasks = tasks.filter(t => t.timeframe === 'Today');
  const weeklyTasks = tasks.filter(t => t.timeframe === 'This Week');

  const todayTotal = todayTasks.length;
  const todayCompleted = todayTasks.filter(t => t.completed).length;
  const weeklyTotal = weeklyTasks.length * 7;
  const weeklyCompleted = weeklyTasks.reduce((acc, task) => {
    return acc + (task.history ? task.history.filter(day => day).length : 0);
  }, 0);

  const todayRemaining = todayTotal - todayCompleted;
  const weeklyRemaining = weeklyTotal - weeklyCompleted;
  const totalCalculatedTasks = todayTotal + weeklyTotal;
  const completedTasksCount = todayCompleted + weeklyCompleted;
  const remainingTasksCount = totalCalculatedTasks - completedTasksCount;
  const completionPercentage = totalCalculatedTasks > 0
    ? Math.round((completedTasksCount / totalCalculatedTasks) * 100)
    : 0;
  const todayCompletionPercentage = todayTotal > 0
    ? Math.round((todayCompleted / todayTotal) * 100)
    : 0;
  const weeklyCompletionPercentage = weeklyTotal > 0
    ? Math.round((weeklyCompleted / weeklyTotal) * 100)
    : 0;

  const value = {
    user,
    authLoading,
    tabView,
    timeframe,
    tasks,
    categories,
    todayTasks,
    weeklyTasks,
    remainingTasksCount,
    completionPercentage,
    todayCompletionPercentage,
    weeklyCompletionPercentage,
    todayCompleted,
    weeklyCompleted,
    todayTotal,
    weeklyTotal,
    todayRemaining,
    weeklyRemaining,
    setTabView,
    setTimeframe,
    loginWithGoogle,
    logout,
    toggleTask,
    addTask,
    deleteTask,
    updateTaskText,
    updateTaskCategory
  };

  return (
    <TodoContext.Provider value={value}>
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