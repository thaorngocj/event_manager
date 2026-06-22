"use client"

import * as React from "react"
import { LayoutDashboard, Calendar, ClipboardCheck, UserCog, BarChart3, LogOut, FileText, CalendarDays } from "lucide-react"
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
    <Sidebar className="border-r border-slate-800 bg-slate-900 text-slate-300">
      <SidebarHeader className="p-6 border-b border-slate-800">
        <Logo textClassName="text-white" />
      </SidebarHeader>
      <SidebarContent className="bg-slate-900">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 font-bold uppercase text-[10px] tracking-widest px-6 mt-4">
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
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all relative group",
                        isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
                      )}
                    >
                      <item.icon className={cn("w-4 h-4 flex-shrink-0 z-10 transition-transform duration-200", isActive && "scale-110")} />
                      <span className="z-10">{item.title}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute inset-x-0 inset-y-0 bg-indigo-600 rounded-md shadow-lg shadow-indigo-600/20"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </Link>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-slate-800 bg-slate-900">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar className="w-8 h-8 border border-slate-700">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name?.substring(0, 2) || "QT"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-white truncate">{user?.name || "Quản trị viên"}</span>
                <span className="text-[10px] text-slate-500 truncate">{user?.email || "admin@university.edu.vn"}</span>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
