import { useState } from 'react';
import { TodoProvider, useTodo } from './context/TodoContext';
import DeviceFrame from './components/DeviceFrame';
import AuthGateway from './components/AuthGateway';
import Dashboard from './components/Dashboard';
import './App.css';

function MainAppContent() {
  const { user, authLoading } = useTodo();
  const [islandMessage, setIslandMessage] = useState('');

  const handleTriggerIsland = (message) => {
    setIslandMessage(message);
  };

  // Loading screen while Firebase auth is initializing
  if (authLoading) {
    return (
      <DeviceFrame>
          <div className="flex-1 flex items-center justify-center bg-surface">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 rounded-full border-[3px] border-slate-200 border-t-accent animate-spin" />
            <p className="text-sm text-neutral-400 font-medium">Loading...</p>
          </div>
        </div>
      </DeviceFrame>
    );
  }

  return (
    <DeviceFrame islandMessage={islandMessage}>
      {user ? (
        <Dashboard onCompleteAction={handleTriggerIsland} />
      ) : (
        <AuthGateway />
      )}
    </DeviceFrame>
  );
}

function App() {
  return (
    <TodoProvider>
      <MainAppContent />
    </TodoProvider>
  );
}

export default App;
