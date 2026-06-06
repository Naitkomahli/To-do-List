import { useState, useEffect, useReducer } from 'react';
import { ShieldCheck } from 'lucide-react';

const DeviceFrame = ({ children, islandMessage }) => {
  const [islandExpanded, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'EXPAND': return true;
      case 'COLLAPSE': return false;
      default: return state;
    }
  }, false);

  // Animate dynamic island when an islandMessage changes
  useEffect(() => {
    if (islandMessage) {
      dispatch({ type: 'EXPAND' });
      const timer = setTimeout(() => {
        dispatch({ type: 'COLLAPSE' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [islandMessage]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black overflow-x-hidden">
      {/* Dynamic Island - Fixed Top Notification */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-[320px] px-4 pointer-events-none">
        <div
          className={`bg-black/90 backdrop-blur-lg rounded-full transition-all duration-500 ease-out flex items-center justify-center mx-auto shadow-lg ${
            islandExpanded
              ? 'w-full h-12 px-5 opacity-100'
              : 'w-24 h-[2px] opacity-0'
          }`}
        >
          {islandExpanded && (
            <div className="flex items-center justify-between w-full text-[12px] text-white font-medium">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3 h-3 text-white" />
                </div>
                <span className="truncate max-w-[200px] text-left text-neutral-200">
                  {islandMessage}
                </span>
              </div>
              <span className="text-[10px] text-accent font-semibold uppercase tracking-wider shrink-0 ml-2">
                Done
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Full width, no frame restrictions */}
      <div className="w-full min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default DeviceFrame;