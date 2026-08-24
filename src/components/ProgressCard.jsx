import { useTodo } from '../context/TodoContext';
import { Sparkles } from 'lucide-react';

const ProgressCard = () => {
  const { user, tabView, todayRemaining, weeklyRemaining } = useTodo();

  const today = new Date();
  const formattedDate = today.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  const sisaCount = tabView === 'To-Do List' ? todayRemaining : weeklyRemaining;
  const sisaLabel = tabView === 'To-Do List' ? 'Tugas' : 'Centang';

  return (
    <div className="relative w-full bg-gradient-to-br from-amber-100/80 via-amber-50/90 to-orange-100/70 border border-amber-200/50 rounded-2xl shadow-card-premium overflow-hidden">
      {/* Radial glow kanan atas */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(217,119,6,0.14),transparent_60%)] pointer-events-none" />
      {/* Inner highlight tepi atas */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

      <div className="relative p-4 sm:p-5 flex items-center gap-4">
        <div className="relative w-11 h-11 rounded-full shrink-0 animate-float">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-glow-amber ring-2 ring-white/60">
            {user?.name ? (
              <span className="font-display text-base font-bold text-white drop-shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <Sparkles className="w-5 h-5 text-white/80" />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 bg-white/70 backdrop-blur-sm border border-white/70 rounded-full px-3 py-1 shadow-card">
            <span className="font-display text-[13px] font-extrabold text-stone-800 tracking-tight truncate max-w-[140px] sm:max-w-[200px]">
              {user?.name ? `Hai, ${user.name.split(' ')[0]}` : 'Hai'}
            </span>
          </div>
          <p className="text-[12px] font-medium text-stone-400 mt-1.5">
            {formattedDate}
          </p>
        </div>

        <div className="bg-white/75 backdrop-blur-sm rounded-xl px-3.5 py-2 text-center border border-amber-100/40 shadow-card shrink-0 active:scale-[0.97] transition-transform">
          <span className="block font-display text-lg font-extrabold text-accent-dark leading-none tabular-nums">{sisaCount}</span>
          <span className="block text-[9px] font-semibold text-stone-400 mt-0.5 uppercase tracking-wider">Sisa {sisaLabel}</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;
