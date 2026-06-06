import SegmentedControl from './SegmentedControl';
import ProgressCard from './ProgressCard';
import TodoTable from './TodoTable';
import ProfileDropdown from './ProfileDropdown';

const Dashboard = ({ onCompleteAction }) => {
  return (
    <div className="flex-1 flex flex-col bg-[#FAFAFA] select-none overflow-hidden min-h-screen">
      {/* Top Header Row */}
      <div className="sticky top-0 z-30 bg-[#FAFAFA]/90 backdrop-blur-md border-b border-neutral-100/40">
        <div className="h-12 sm:h-14 w-full flex items-center justify-between px-4 sm:px-5">
          {/* Left empty spacer */}
          <div className="w-8 sm:w-9" />

          {/* Centered Title */}
          <h1 className="text-sm sm:text-base font-bold text-neutral-900 tracking-wide font-sans text-center">
            To Do
          </h1>

          {/* Right Profile */}
          <div className="w-8 sm:w-9 flex justify-end">
            <ProfileDropdown />
          </div>
        </div>

        {/* Segmented Control langsung di bawah header */}
        <div className="px-4 sm:px-5 pb-3">
          <SegmentedControl />
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 flex flex-col gap-4 px-4 sm:px-5 pt-4 pb-6 overflow-y-auto no-scrollbar">
        {/* Progress Dashboard Card */}
        <ProgressCard />

        {/* Dynamic Interactive To Do Table */}
        <div className="flex-1 min-h-0 flex flex-col">
          <TodoTable onCompleteAction={onCompleteAction} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;