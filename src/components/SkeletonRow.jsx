const SkeletonRow = () => (
  <div className="flex items-center gap-3 py-2.5 px-3.5 bg-white border border-stone-100 rounded-xl shadow-card min-h-[48px]">
    <div className="skeleton w-6 h-6 rounded-full shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="skeleton h-3 rounded-full w-2/5" />
      <div className="skeleton h-2 rounded-full w-1/5" />
    </div>
    <div className="skeleton w-7 h-7 rounded-lg shrink-0" />
  </div>
);

export default SkeletonRow;
