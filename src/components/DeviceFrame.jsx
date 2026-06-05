import { useState, useEffect, useReducer } from 'react';
import { ShieldCheck, Laptop, Phone, Wifi, Battery, Signal } from 'lucide-react';

const DeviceFrame = ({ children, islandMessage }) => {
  const [currentTime, setCurrentTime] = useState('');
  const [showMock, setShowMock] = useState(() => {
    // Di HP asli (layar kecil <= 430px) atau PWA standalone, langsung tampilkan konten saja tanpa bingkai
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isMobileScreen = window.innerWidth <= 430;
      return !isStandalone && !isMobileScreen;
    }
    return true;
  });

  // useReducer untuk menghindari ESLint react-hooks-error tentang setState di dalam useEffect
  const [islandExpanded, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'EXPAND': return true;
      case 'COLLAPSE': return false;
      default: return state;
    }
  }, false);

  // Synced local time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      setCurrentTime(`${hours}:${minutesStr} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

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

  // Mode tanpa bingkai HP (untuk HP asli / PWA / layar kecil)
  if (!showMock) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-black">
        {/* Toggle back to Mockup (hanya di desktop) */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowMock(true)}
            className="flex items-center gap-2 bg-black text-white hover:bg-neutral-800 transition-all shadow-lg px-4 py-3 rounded-full text-xs font-semibold tracking-wide click-bounce"
          >
            <Phone className="w-4 h-4" />
            <span>Show Device Frame</span>
          </button>
        </div>
        <div className="w-full max-w-md mx-auto min-h-screen bg-white shadow-sm flex flex-col">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center p-4 md:p-8 font-sans overflow-x-hidden selection:bg-accent-light selection:text-accent">
      
      {/* Top Floating Control Bar */}
      <div className="mb-6 flex items-center justify-between w-full max-w-[420px] bg-white/70 backdrop-blur px-5 py-3 rounded-2xl shadow-sm border border-white/40">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">
            Mobile-First PWA Demo
          </span>
        </div>
        
        <button
          onClick={() => setShowMock(false)}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-600 hover:text-black transition-colors click-bounce"
          title="Toggle Fullscreen Responsive View"
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Fullscreen Web</span>
        </button>
      </div>

      {/* iPhone 15 Pro Physical Frame */}
      <div className="relative w-[390px] h-[844px] rounded-[55px] bg-[#161617] p-[12px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] ring-[1px] ring-white/10 flex flex-col overflow-hidden">
        
        {/* Inner Screen Bezel Border */}
        <div className="relative w-full h-full rounded-[45px] bg-[#FAFAFA] overflow-hidden flex flex-col border-[2px] border-neutral-900/50 shadow-inner">
          
          {/* TOP BAR / NOTIFICATIONS */}
          <div className="h-12 w-full px-7 flex items-center justify-between text-black font-semibold text-[13px] select-none z-40 bg-transparent shrink-0">
            {/* Dynamic Clock */}
            <span className="w-20 text-left">{currentTime || '9:41 AM'}</span>
            
            {/* Dynamic Island Container */}
            <div className="absolute left-1/2 -translate-x-1/2 top-2.5 z-50">
              <div
                className={`bg-black rounded-full transition-all duration-500 ease-out flex items-center justify-center ${
                  islandExpanded
                    ? 'w-56 h-10 px-4 shadow-[0_10px_20px_rgba(0,0,0,0.3)]'
                    : 'w-[100px] h-[30px] px-1'
                }`}
              >
                {islandExpanded ? (
                  <div className="flex items-center justify-between w-full text-[11px] text-white font-medium animate-fade-in">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                        <ShieldCheck className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="truncate max-w-[140px] text-left text-neutral-300">
                        {islandMessage}
                      </span>
                    </div>
                    <span className="text-[10px] text-accent font-semibold uppercase tracking-wider">
                      Done
                    </span>
                  </div>
                ) : (
                  // Tiny dots inside idle Dynamic Island
                  <div className="flex items-center justify-between w-full px-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-900/80" />
                    <div className="w-3.5 h-3.5 rounded-full bg-neutral-900/80 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-neutral-800" />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Phone Status Symbols */}
            <div className="w-20 flex items-center justify-end gap-1.5">
              <Signal className="w-3.5 h-3.5 stroke-[2.5]" />
              <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
              <Battery className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>

          {/* INNER VIEW CONTENT */}
          <div className="flex-1 w-full overflow-hidden flex flex-col relative">
            {children}
          </div>

          {/* BOTTOM HOME INDICATOR BAR */}
          <div className="h-6 w-full flex items-center justify-center shrink-0 select-none bg-transparent pb-1 z-40">
            <div className="w-[120px] h-[4px] rounded-full bg-black/40" />
          </div>

        </div>
      </div>
      
      {/* PWA Install Tip Footer */}
      <span className="mt-4 text-[10px] text-neutral-400 font-medium tracking-wide">
        Replicates exact iOS 17 & Android PWA UX specifications.
      </span>
    </div>
  );
};

export default DeviceFrame;