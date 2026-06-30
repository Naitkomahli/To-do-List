import { useRef } from 'react';
import { useTodo } from '../context/TodoContext';
import SegmentedControl from './SegmentedControl';
import ProgressCard from './ProgressCard';
import TodoListView from './TodoListView';
import HabitsView from './HabitsView';
import ProfileDropdown from './ProfileDropdown';

const Dashboard = ({ onCompleteAction }) => {
  const { tabView, setTabView } = useTodo();
  const touchStartX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const threshold = 50;

    if (deltaX < -threshold && tabView === 'To-Do List') {
      setTabView('Habits');
    } else if (deltaX > threshold && tabView === 'Habits') {
      setTabView('To-Do List');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-terra select-none overflow-hidden min-h-screen">
      <div className="sticky top-0 z-30 bg-terra/90 backdrop-blur-md">
        <div className="h-12 sm:h-14 w-full flex items-center justify-between px-4 sm:px-5">
          <div className="w-8 sm:w-9" />
          <SegmentedControl
            tabs={['To-Do List', 'Habits']}
            activeTab={tabView}
            onChange={setTabView}
          />
          <div className="w-8 sm:w-9 flex justify-end">
            <ProfileDropdown />
          </div>
        </div>
      </div>

      <div
        className="flex-1 flex flex-col gap-3 px-4 sm:px-5 pt-3 pb-6 overflow-y-auto no-scrollbar"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <ProgressCard />
        <div className="flex-1 min-h-0 flex flex-col">
          {tabView === 'To-Do List' ? (
            <TodoListView onCompleteAction={onCompleteAction} />
          ) : (
            <HabitsView onCompleteAction={onCompleteAction} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
