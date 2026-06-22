"use client"

import * as React from "react"
import { LayoutDashboard, Calendar, ClipboardCheck, UserCog, BarChart3, LogOut, FileText, CalendarDays, GraduationCap } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Logo } from "@/components/ui/logo"
import { useAuthStore } from "@/store/use-auth-store"
import { motion } from "motion/react"

const menuItems = [
  { id: 'overview', title: 'Tổng quan', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'events', title: 'Sự kiện', icon: Calendar, path: '/events' },
  { id: 'calendar', title: 'Lịch sự kiện', icon: CalendarDays, path: '/calendar' },
  { id: 'registrations', title: 'Danh sách đăng ký', icon: ClipboardCheck, path: '/registrations' },
  { id: 'check-in', title: 'Điểm danh', icon: BarChart3, path: '/check-in' },
  { id: 'users', title: 'Thành viên & Quyền', icon: UserCog, path: '/users' },
  { id: 'faculties', title: 'Quản lý Khoa', icon: GraduationCap, path: '/faculties' },
  { id: 'reports', title: 'Báo cáo & Thống kê', icon: FileText, path: '/reports' },
]

export function AdminSidebar() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <Sidebar className="border-r border-slate-100 bg-white text-slate-800">
      <SidebarHeader className="p-6 border-b border-slate-50">
        <Logo textClassName="text-slate-900" />
      </SidebarHeader>
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-400 font-bold uppercase text-[10px] tracking-widest px-6 mt-4">
            Quản lý hệ thống
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-4 py-2">
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path))
                return (
                  <SidebarMenuItem key={item.id}>
                    <Link
                      href={item.path}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] italic transition-all relative group overflow-hidden",
                        isActive
                          ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                          : "text-slate-400 hover:bg-slate-50 hover:text-red-600"
                      )}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-full"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <item.icon className={cn("w-4 h-4 flex-shrink-0 z-10 transition-transform duration-200", isActive && "scale-110")} />
                      <span className="z-10">{item.title}</span>
                    </Link>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 relative overflow-hidden group cursor-pointer" onClick={handleLogout}>
          <div className="absolute inset-0 bg-red-600/5 -skew-x-12 translate-x-1/2 group-hover:translate-x-0 transition-transform duration-700" />
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[11px] font-black shrink-0 border border-white/5 shadow-inner text-white italic relative z-10">
            {user?.name?.substring(0, 1) || "Q"}
          </div>
          <div className="min-w-0 flex-1 relative z-10">
            <p className="text-[11px] font-black truncate text-white leading-tight uppercase italic tracking-tight">{user?.name || "Quản trị viên"}</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[8px] text-white/50 uppercase font-black tracking-[0.1em] leading-none">{user?.role || "SUPER ADMIN"}</p>
            </div>
          </div>
          <LogOut className="w-4 h-4 text-white/30 group-hover:text-red-500 transition-colors relative z-10 shrink-0" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
