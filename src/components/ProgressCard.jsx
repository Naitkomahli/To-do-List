import { useTodo } from '../context/TodoContext';

const ProgressCard = () => {
  const { user, remainingTasksCount, completionPercentage } = useTodo();

  // SVG Radial Circle
  const radius = 32;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <div className="w-full bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-neutral-100/80 select-none transition-shadow hover:shadow-[0_4px_24px_rgba(0,0,0,0.04)] duration-300">
      {/* Header */}
      <div className="bg-[#E8F0FE]/50 px-4 sm:px-5 py-2.5 border-b border-[#D2E3FC]/30 flex items-center justify-between">
        <span className="text-[10px] font-bold text-accent tracking-widest uppercase">
          Progress Dashboard
        </span>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] text-neutral-400 font-medium uppercase tracking-wide">Live</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
        {/* Left Stats */}
        <div className="flex flex-col min-w-0 flex-1">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-neutral-800 leading-tight truncate">
            Welcome{user?.name ? (
              <span className="text-neutral-900"> {user.name}</span>
            ) : ' guest'}
          </h2>
          <div className="flex items-center gap-2 mt-2.5">
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md bg-neutral-100 text-[11px] font-semibold text-neutral-600">
              {remainingTasksCount} remaining
            </span>
            <span className="text-[11px] text-neutral-400 font-medium">
              / {completionPercentage}% done
            </span>
          </div>
        </div>

        {/* Right Radial Progress */}
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-full h-full" viewBox="0 0 72 72">
            <circle
              cx="36"
              cy="36"
              r={radius}
              stroke="#F3F4F6"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx="36"
              cy="36"
              r={radius}
              stroke="#1A73E8"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="radial-progress-ring"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-neutral-800 tracking-tight">
              {completionPercentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;