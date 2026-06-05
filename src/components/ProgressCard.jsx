import { useTodo } from '../context/TodoContext';

const ProgressCard = () => {
  const { user, remainingTasksCount, completionPercentage } = useTodo();
  
  // Custom SVG Radial Circle calculations
  const radius = 28;
  const strokeWidth = 5.5;
  const circumference = 2 * Math.PI * radius; // ~175.93
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <div className="w-full bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-neutral-100/60 select-none">
      {/* Header bar section (Light blue tint) */}
      <div className="bg-[#E8F0FE]/70 px-4 sm:px-6 py-2 sm:py-2.5 border-b border-[#D2E3FC]/40">
        <span className="text-[10px] font-bold text-accent tracking-widest uppercase">
          Progress Dashboard
        </span>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-6 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left Stats Text */}
        <div className="flex flex-col min-w-0 flex-1">
          <h2 className="text-base sm:text-xl font-bold tracking-tight text-neutral-800 leading-tight truncate">
            Welcome{user?.name ? <span className="text-neutral-900"> {user.name}</span> : ' guest'}
          </h2>
          <span className="text-xs text-neutral-400 font-medium mt-2 flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <strong className="text-neutral-700 font-semibold">{remainingTasksCount}</strong> tasks remaining
          </span>
        </div>

        {/* Right Radial Progress Ring */}
        <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
            {/* Inner background circle */}
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="#F3F4F6"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Animating completion circle */}
            <circle
              cx="32"
              cy="32"
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
          {/* Centered percentage text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-neutral-800 tracking-tighter">
              {completionPercentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;