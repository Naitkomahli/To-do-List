import { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { TodoProvider, useTodo } from './context/TodoContext';
import DeviceFrame from './components/DeviceFrame';
import AuthGateway from './components/AuthGateway';
import Dashboard from './components/Dashboard';
import './App.css';

const GOOGLE_CLIENT_ID = '39701495136-5b3so34bksvdp8pjiljcmjk3apf0fp28.apps.googleusercontent.com';

function MainAppContent() {
  const { user } = useTodo();
  const [islandMessage, setIslandMessage] = useState('');

  const handleTriggerIsland = (message) => {
    setIslandMessage(message);
  };

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
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <TodoProvider>
        <MainAppContent />
      </TodoProvider>
    </GoogleOAuthProvider>
  );
}

export default App;