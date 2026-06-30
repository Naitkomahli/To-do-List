import { useState, useEffect, useRef } from 'react';
import { useTodo } from '../context/TodoContext';
import { LogOut, Download, ChevronDown } from 'lucide-react';

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
        className="flex items-center gap-1 hover:bg-terra-hover rounded-full pr-2 pl-0.5 py-0.5 transition-colors"
      >
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-stone-100 bg-stone-100">
          {avatarError || !user.avatar ? (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs font-bold text-stone-500">{getInitial(user.name)}</span>
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
        <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-11 w-56 bg-white rounded-2xl shadow-warm border border-stone-100 p-3 z-50 animate-fade-in origin-top-right">
          <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
            {avatarError || !user.avatar ? (
              <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center">
                <span className="text-sm font-bold text-amber-700">{getInitial(user.name)}</span>
              </div>
            ) : (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-stone-100"
                onError={() => setAvatarError(true)}
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-[12px] font-semibold text-stone-700 truncate">{user.name}</h4>
              <p className="text-[10px] font-medium text-stone-400 truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-col gap-0.5 mt-1.5">
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-amber-600 hover:bg-amber-50 transition-all text-[11px] font-semibold text-left"
              >
                <Download className="w-4 h-4" />
                <span>Install App</span>
              </button>
            )}

            <button
              onClick={() => { logout(); setIsOpen(false); }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-danger hover:bg-danger-light transition-all text-[11px] font-semibold text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
