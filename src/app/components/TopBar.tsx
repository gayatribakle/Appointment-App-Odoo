import { Search, Bell, User } from 'lucide-react';

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="h-16 bg-[#121821] border-b border-[#2A3441] flex items-center justify-between px-6 fixed top-0 left-64 right-0 z-10">
      <h2 className="text-xl text-[#E6EDF3]">{title}</h2>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 h-10 pl-10 pr-4 bg-[#1A2330] border border-[#2A3441] rounded-lg text-sm text-[#E6EDF3] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#4F9CF9]"
          />
        </div>

        <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#1A2330] transition-colors relative">
          <Bell className="text-[#94A3B8]" size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF4444] rounded-full"></span>
        </button>

        <button className="w-10 h-10 flex items-center justify-center bg-[#4F9CF9] rounded-full">
          <User className="text-[#E6EDF3]" size={20} />
        </button>
      </div>
    </header>
  );
}
