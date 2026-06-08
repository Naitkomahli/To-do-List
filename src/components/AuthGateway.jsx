import { useState } from 'react';
import { useTodo } from '../context/TodoContext';
import logo from '../assets/logo.png';

const AuthGateway = () => {
  const { loginWithGoogle } = useTodo();
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setIsOpening(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError('Google Sign-In gagal. Silakan coba lagi.');
      }
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white select-none safe-pt min-h-[80vh]">
      {/* Centered content area - vertikal tengah sempurna */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* App Logo */}
        <div className="w-[150px] h-[150px] sm:w-[170px] sm:h-[170px] rounded-[22px] sm:rounded-[26px] flex items-center justify-center mb-5 transition-transform hover:scale-105 duration-300 overflow-hidden shadow-lg shadow-neutral-100">
          <img src={logo} alt="Logo" className="w-full h-full object-contain" />
        </div>

        {/* Premium Typography */}
        <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-neutral-900 font-sans text-center">
          Welcome to To-Do
        </h1>
        <p className="text-sm text-neutral-400 mt-2 text-center max-w-[260px] leading-relaxed">
          Organise your tasks elegantly.<br />Simplicity at its peak.
        </p>

        {/* Google Sign-In Button - ditempatkan dengan spacing presisi */}
        <div className="mt-10 w-full flex flex-col items-center">
          <button
            onClick={handleGoogleLogin}
            disabled={isOpening}
            className="w-full max-w-[300px] h-[52px] rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 active:bg-neutral-100 transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow-md click-bounce cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isOpening ? (
              <div className="w-5 h-5 rounded-full border-[2.5px] border-neutral-200 border-t-neutral-800 animate-spin" />
            ) : (
              <>
                {/* Google G-Logo */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="text-sm font-semibold text-neutral-700">
                  Sign in with Google
                </span>
              </>
            )}
          </button>

          {error && (
            <p className="text-xs text-red-500 mt-3 text-center max-w-[280px]">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pb-6 sm:pb-8 text-center">
        <p className="text-[10px] text-neutral-300 font-medium">
          Your tasks stay private on this device
        </p>
      </div>
    </div>
  );
};

export default AuthGateway;