import { useEffect, useReducer } from 'react';
import { Sparkles } from 'lucide-react';

const DeviceFrame = ({ children, islandMessage }) => {
  const [islandExpanded, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'EXPAND': return true;
      case 'COLLAPSE': return false;
      default: return state;
    }
  }, false);

  useEffect(() => {
    if (islandMessage) {
      dispatch({ type: 'EXPAND' });
      const timer = setTimeout(() => {
        dispatch({ type: 'COLLAPSE' });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [islandMessage]);

  return (
    <div className="min-h-screen bg-terra text-stone-800 overflow-x-hidden">
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-full max-w-[300px] px-4 pointer-events-none">
        <div
          className={`bg-stone-900/92 backdrop-blur-xl rounded-full transition-all duration-400 ease-out flex items-center justify-center mx-auto shadow-pop ring-1 ring-white/10 ${
            islandExpanded
              ? 'w-full h-11 px-4 opacity-100 scale-100'
              : 'w-20 h-[2px] opacity-0 scale-90'
          }`}
        >
          {islandExpanded && (
            <div className="flex items-center justify-between w-full text-[12px] font-medium animate-fade-in">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-ring shrink-0 animate-flame" />
                <span className="truncate max-w-[180px] text-left text-stone-200">
                  {islandMessage}
                </span>
              </div>
              <span className="text-[9px] text-accent-ring font-semibold uppercase tracking-wider shrink-0 ml-2">
                Done
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="w-full min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default DeviceFrame;
