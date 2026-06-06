import { useState, useEffect, useRef } from 'react';
import { useTodo } from '../context/TodoContext';
import { LogOut, RefreshCw, Download, ChevronDown } from 'lucide-react';

const ProfileDropdown = () => {
  const { user, logout } = useTodo();
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the PWA install prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 hover:bg-neutral-100/80 rounded-full pr-2 pl-0.5 py-0.5 transition-colors cursor-pointer focus:outline-none"
      >
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-neutral-200/80 bg-neutral-100">
          {avatarError || !user.avatar ? (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs font-bold text-neutral-500">{getInitial(user.name)}</span>
            </div>
          ) : (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover"
              onError={() => setAvatarError(true)}
            />
          )}
        </div>
        <ChevronDown className="w-3 h-3 text-neutral-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-11 w-60 bg-white rounded-2xl shadow-xl shadow-neutral-100/50 border border-neutral-100 p-4 z-50 animate-fade-in flex flex-col gap-4 origin-top-right">
          <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
            {avatarError || !user.avatar ? (
              <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                <span className="text-sm font-bold text-accent">{getInitial(user.name)}</span>
              </div>
            ) : (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border border-neutral-100"
                onError={() => setAvatarError(true)}
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-neutral-800 truncate">{user.name}</h4>
              <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={() => { logout(); setIsOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-neutral-600 hover:text-black hover:bg-neutral-50 transition-all text-xs font-medium cursor-pointer text-left"
            >
              <RefreshCw className="w-4 h-4 stroke-[2]" />
              <span>Switch Account</span>
            </button>

            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-accent hover:bg-accent-light/30 transition-all text-xs font-semibold cursor-pointer text-left"
              >
                <Download className="w-4 h-4 stroke-[2]" />
                <span>Install App</span>
              </button>
            )}
          </div>

          <button
            onClick={() => { logout(); setIsOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-red-50/50 hover:bg-red-50 text-red-500 hover:text-red-600 transition-all text-xs font-semibold cursor-pointer text-left border border-red-100/30"
          >
            <LogOut className="w-4 h-4 stroke-[2]" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;