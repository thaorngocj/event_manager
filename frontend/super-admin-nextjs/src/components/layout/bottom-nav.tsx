"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Calendar, ClipboardCheck, BarChart3, UserCog, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "motion/react"

const navItems = [
  { id: 'overview', title: 'Tổng quan', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'events', title: 'Sự kiện', icon: Calendar, path: '/events' },
  { id: 'check-in', title: 'Điểm danh', icon: BarChart3, path: '/check-in' },
  { id: 'registrations', title: 'Đăng ký', icon: ClipboardCheck, path: '/registrations' },
  { id: 'users', title: 'Thành viên', icon: UserCog, path: '/users' },
  { id: 'reports', title: 'Báo cáo', icon: FileText, path: '/reports' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-1 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <nav className="flex items-center justify-between h-16 relative">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path))
          return (
            <Link
              key={item.id}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors relative z-10",
                isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0 transition-transform duration-200", isActive && "scale-110")} />
              <span className="text-[9px] font-semibold truncate w-full text-center px-0.5">
                {item.title}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavActive"
                  className="absolute inset-x-2 inset-y-1 bg-indigo-50 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
