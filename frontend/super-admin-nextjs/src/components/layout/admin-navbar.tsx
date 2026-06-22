"use client"

import { Search, User, LogOut, Key, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/store/use-auth-store"
import { useRouter } from "next/navigation"

export function AdminNavbar() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 sm:gap-4">
        <SidebarTrigger className="flex shrink-0" />
        <div className="hidden sm:flex relative items-center bg-slate-100 rounded-lg px-3 py-1.5 w-48 lg:w-96">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="bg-transparent border-none text-sm ml-2 outline-none w-full text-slate-600"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full outline-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors cursor-pointer">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" alt="Admin" />
                <AvatarFallback>QT</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal px-2 py-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none text-slate-900">{user?.name || "Quản trị viên"}</p>
                  <p className="text-[11px] leading-none text-slate-500 font-medium">
                    {user?.email || "admin@university.edu.vn"}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" /> Xem hồ sơ
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/profile?tab=password" className="flex items-center">
                  <Key className="mr-2 h-4 w-4" /> Đổi mật khẩu
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" disabled>
                <Shield className="mr-2 h-4 w-4 text-slate-300" />
                <span className="text-slate-400">Quyền hạn: {user?.role ?? "—"}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-50 font-medium" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
