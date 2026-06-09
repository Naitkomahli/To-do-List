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
      }
      setAuthLoading(false);
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Simpan user ke localStorage untuk quick load ───
  useEffect(() => {
    if (user) {
      localStorage.setItem('todo_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('todo_user');
    }
  }, [user]);

  // ─── Timeframe state (lokal — preferensi UI) ───
  const [timeframe, setTimeframe] = useState(() => {
    return localStorage.getItem('todo_timeframe') || 'Today';
  });

  useEffect(() => {
    localStorage.setItem('todo_timeframe', timeframe);
  }, [timeframe]);

  // ─── Tasks state dari Firestore ───
  const [tasks, setTasks] = useState([]);

  // Reset tasks saat user logout
  useEffect(() => {
    if (!user && tasks.length > 0) {
      setTasks([]);
    }
  }, [user, tasks.length]);

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
  const todayDate = getTodayDate();
  const todayTasks = tasks.filter(t => t.timeframe === 'Today' && (!t.date || t.date === todayDate));
  const weeklyTasks = tasks.filter(t => t.timeframe === 'This Week');

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
  const todayCompletionPercentage = todayTotal > 0
    ? Math.round((todayCompleted / todayTotal) * 100)
    : 0;
  const weeklyCompletionPercentage = weeklyTotal > 0
    ? Math.round((weeklyCompleted / weeklyTotal) * 100)
    : 0;

  const value = {
    user,
    authLoading,
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