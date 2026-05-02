import { LayoutDashboard, Briefcase, Users, Calendar, Clock, BookOpen } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'providers', label: 'Providers / Resources', icon: Users },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'slots', label: 'Slots', icon: Clock },
    { id: 'bookings', label: 'Bookings', icon: BookOpen },
  ];

  return (
    <aside className="w-64 h-screen bg-[#121821] border-r border-[#2A3441] flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-[#2A3441]">
        <h1 className="text-xl text-[#E6EDF3]">Booking System</h1>
        <p className="text-xs text-[#94A3B8] mt-1">Rule-Driven Scheduler</p>
      </div>

      <nav className="flex-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive
                  ? 'bg-[#4F9CF9] text-[#E6EDF3]'
                  : 'text-[#94A3B8] hover:bg-[#1A2330] hover:text-[#E6EDF3]'
              }`}
            >
              <Icon size={20} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
