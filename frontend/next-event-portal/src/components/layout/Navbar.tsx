'use client'

import { Bell, Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventsContext';
import { useRouter } from 'next/navigation';

export function Navbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { user } = useAuth();
  const { searchQuery, setSearchQuery } = useEvents();
  const router = useRouter();

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-3 md:px-8 shrink-0 sticky top-0 z-30">
      {/* Left: hamburger (mobile) */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="lg:hidden h-8 w-8 text-slate-500">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Right: search + bell */}
      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <Input
            placeholder="Tìm kiếm sự kiện..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim() !== '' && window.location.pathname !== '/events') {
                router.push('/events');
              }
            }}
            className="w-48 lg:w-64 pl-10 pr-4 h-9 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-slate-50/50"
          />
        </div>

        {user && (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
            <Bell className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        )}

        {!user && (
          <button
            onClick={() => router.push('/login')}
            className="bg-red-600 text-white px-3 md:px-4 py-1.5 rounded-sm hover:bg-red-700 transition-colors uppercase text-[9px] md:text-[10px] font-black tracking-widest whitespace-nowrap"
          >
            Đăng nhập
          </button>
        )}
      </div>
    </header>
  );
}
