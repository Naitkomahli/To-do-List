import SegmentedControl from './SegmentedControl';
import ProgressCard from './ProgressCard';
import TodoTable from './TodoTable';
import ProfileDropdown from './ProfileDropdown';

const Dashboard = ({ onCompleteAction }) => {
  return (
    <div className="flex-1 flex flex-col bg-[#FAFAFA] px-4 sm:px-6 select-none overflow-hidden relative safe-pt">
      
      {/* Top Header Row */}
      <div className="h-12 sm:h-14 w-full flex items-center justify-between shrink-0 mb-2">
        {/* Empty left block for balance */}
        <div className="w-8 sm:w-9" />
        
        {/* Centered Title */}
        <h1 className="text-sm font-bold text-neutral-900 tracking-wide font-sans text-center">
          To Do
        </h1>
        
        {/* Right side Profile Dropdown */}
        <div className="w-8 sm:w-9 flex justify-end">
          <ProfileDropdown />
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 flex flex-col gap-4 sm:gap-5 overflow-hidden">
        {/* Apple Style Segmented Pill Selectors */}
        <div className="shrink-0">
          <SegmentedControl />
        </div>

        {/* Progress Dashboard Card */}
        <div className="shrink-0">
          <ProgressCard />
        </div>

        {/* Dynamic Interactive To Do Table */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <TodoTable onCompleteAction={onCompleteAction} />
        </div>
      </div>
      
    </div>
  );
};

export default Dashboard;