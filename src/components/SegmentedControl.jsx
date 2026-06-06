import { useTodo } from '../context/TodoContext';

const SegmentedControl = () => {
  const { timeframe, setTimeframe } = useTodo();

  const tabs = ['Today', 'This Week'];
  const activeIndex = tabs.indexOf(timeframe);

  return (
    <div className="relative bg-neutral-100/80 p-1 rounded-[12px] flex items-center w-full max-w-[200px] mx-auto select-none">
      {/* Sliding Active Pill */}
      <div
        className="absolute top-1 bottom-1 bg-white rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] pill-slider"
        style={{
          width: 'calc(50% - 4px)',
          transform: `translateX(${activeIndex * 100 + (activeIndex * 1)}%)`
        }}
      />

      {/* Tabs */}
      {tabs.map((tab) => {
        const isActive = timeframe === tab;
        return (
          <button
            key={tab}
            onClick={() => setTimeframe(tab)}
            className={`relative flex-1 py-1.5 text-[11px] sm:text-xs font-semibold text-center rounded-[10px] cursor-pointer focus:outline-none transition-colors duration-200 z-10 ${
              isActive ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-500'
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;