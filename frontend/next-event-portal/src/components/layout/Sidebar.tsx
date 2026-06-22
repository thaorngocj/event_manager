'use client'
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Calendar, History, ShieldCheck, Users, LogOut, Menu, Home, CheckCircle2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Logo } from '@/components/Logo';
export function Sidebar({ onClose }: { onClose?: () => void }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };
  const menuItems = [
    // Chung tất cả role
    { name: t('homepage'), icon: Home, path: '/' },
    { name: t('dashboard'), icon: LayoutDashboard, path: '/dashboard' },
    // "Sự kiện" — also active when on /calendar since calendar is a tab inside events
    { name: t('events'), icon: Calendar, path: '/events', alsoActive: ['/calendar'] },
    // STUDENT: Xem sự kiện, Đăng ký, Nhận QR, Lịch sử ngày rèn luyện
    { name: t('myEvent'), icon: CheckCircle2, path: '/my-events', roles: ['STUDENT'] },
    { name: t('history'), icon: History, path: '/history', roles: ['STUDENT'] },
    // EVENT_MANAGER: Xem danh sách, Check-in, Xuất danh sách
    { name: t('checkin'), icon: ShieldCheck, path: '/checkin', roles: ['EVENT_MANAGER'] }, // ADMIN: Tạo & quản lý sự kiện, Import dữ liệu, Tra cứu & xuất
    { name: t('userManagement'), icon: Users, path: '/user-management', roles: ['ADMIN'] },
    { name: t('historicalImport'), icon: ShieldCheck, path: '/historical-import', roles: ['ADMIN'] },
    // Chung tất cả role
    { name: t('personalInfo'), icon: User, path: '/personal-info' },
  ];
  const filteredItems = menuItems.filter(item =>
    !item.roles || (user && item.roles.includes(user.role))
  );
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return t('admin');
      case 'EVENT_MANAGER': return t('eventManager');
      case 'STUDENT': return t('student');
      default: return role;
    }
  };
  return (
    <aside
      className={cn(
        "bg-white flex flex-col shrink-0 h-full transition-all duration-300 z-20 overflow-hidden",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      <div className="p-6 h-20 flex items-center justify-between shrink-0 border-b border-slate-50">
        <a href="/"><Logo collapsed={isCollapsed} variant="dark" className="scale-75 md:scale-90 origin-left" /></a>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hover:bg-slate-50 text-slate-400 hidden lg:flex rounded-xl"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <nav className="flex-1 px-3 space-y-1 py-6 overflow-y-auto custom-scrollbar">
        {filteredItems.map((item) => {
          const isActive = item.path === '/'
            ? pathname === '/'
            : (pathname === item.path || pathname.startsWith(item.path + '/') ||
               (item.alsoActive?.some(p => pathname === p || pathname.startsWith(p + '/'))));
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onClose}
              className={cn(
                "flex items-center px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-300 relative group overflow-hidden",
                isActive
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                  : "text-slate-400 hover:bg-slate-50 hover:text-red-600"
              )}
            >
              {/* Active Indicator Line */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
              <item.icon className={cn(
                "h-4 w-4 flex-shrink-0 transition-all duration-300",
                isCollapsed ? "mx-auto" : "mr-4",
              )} />
              {!isCollapsed && <span className="italic relative z-10">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
      {user && (
        <div className="p-4 shrink-0">
          <div className={cn("flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-3xl transition-all shadow-xl shadow-slate-200/50 relative overflow-hidden group",
            isCollapsed && "justify-center p-2"
          )}>
            <div className="absolute inset-0 bg-red-600/5 -skew-x-12 translate-x-1/2 group-hover:translate-x-0 transition-transform duration-700"></div>
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[11px] font-black shrink-0 border border-white/5 shadow-inner text-white italic relative z-10">
              {user?.displayName?.[0] || 'U'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1 relative z-10">
                <p className="text-[11px] font-black truncate text-white leading-tight uppercase italic tracking-tight">{user?.displayName}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="text-[8px] text-white/50 uppercase font-black tracking-[0.1em] leading-none">{getRoleLabel(user?.role || '')}</p>
                </div>
              </div>
            )}
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="h-8 w-8 text-white/30 hover:text-red-500 hover:bg-white/5 rounded-xl transition-all relative z-10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
