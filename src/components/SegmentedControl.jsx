const SegmentedControl = ({ tabs, activeTab, onChange }) => {
  const activeIndex = tabs.indexOf(activeTab);

  return (
    <div className="relative bg-stone-100 p-1 rounded-[10px] flex items-center w-fit mx-auto shadow-inner">
      <div
        className="absolute top-1 bottom-1 bg-gradient-to-r from-amber-600 to-orange-500 rounded-[8px] shadow-glow-amber pill-slider"
        style={{
          width: `calc(${100 / tabs.length}% - 4px)`,
          transform: `translateX(${activeIndex * 100 + activeIndex * 0.5}%)`
        }}
      />
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`relative flex-1 py-1.5 px-5 text-[12px] font-semibold text-center rounded-[9px] z-10 whitespace-nowrap transition-colors duration-200 ${
              isActive ? 'text-white drop-shadow-sm' : 'text-stone-500 hover:text-stone-700'
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
