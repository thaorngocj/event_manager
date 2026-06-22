"use client"

import * as React from "react"
import { useState } from "react"
import { Search, UserPlus, Shield, ShieldAlert, ShieldCheck, MoreHorizontal, Settings2, Pencil } from "lucide-react"
import { User, UserRole } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { motion, AnimatePresence } from "motion/react"
import {
  useUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
} from "@/hooks/use-users-api"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
}

export default function UsersPage() {
  const [search, setSearch] = useState("")
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState({ fullname: "", email: "", password: "", role: "", mssv: "" })

  const [page, setPage] = useState(1)
  const { data: usersData, isLoading } = useUsersQuery({ search: search || undefined, page, limit: 10 })
  const users = usersData?.data || []
  const totalPages = usersData?.totalPages || 1
  const createUser = useCreateUserMutation()
  const updateUser = useUpdateUserMutation()
  const deleteUser = useDeleteUserMutation()
  const activateUser = useActivateUserMutation()
  const deactivateUser = useDeactivateUserMutation()

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'Super Admin': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 rounded-full text-[10px] font-bold uppercase tracking-tight"><ShieldAlert className="w-3 h-3 mr-1" /> Super Admin</Badge>
      case 'Admin': return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 rounded-full text-[10px] font-bold uppercase tracking-tight"><ShieldAlert className="w-3 h-3 mr-1" /> Admin</Badge>
      case 'Manager': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 rounded-full text-[10px] font-bold uppercase tracking-tight"><ShieldCheck className="w-3 h-3 mr-1" /> Manager</Badge>
      case 'Student': return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 rounded-full text-[10px] font-bold uppercase tracking-tight"><Shield className="w-3 h-3 mr-1" /> Student</Badge>
      default: return <Badge className="rounded-full text-[10px] font-bold uppercase tracking-tight">{role}</Badge>
    }
  }

  const handleEditClick = (user: User) => {
    setEditingUser({ ...user, password: "" })
    setIsEditDialogOpen(true)
  }

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.fullname) return toast.error("Vui lòng điền đủ thông tin")
    const pwd = newUser.password || "password123"
    if (pwd.length < 6) return toast.error("Mật khẩu phải có ít nhất 6 ký tự")
    try {
      await createUser.mutateAsync({
        username: newUser.fullname,
        email: newUser.email,
        password: pwd,
        role: newUser.role || "Student",
        ...(newUser.mssv ? { mssv: newUser.mssv } : {}),
      })
      setIsCreateDialogOpen(false)
      setNewUser({ fullname: "", email: "", password: "", role: "", mssv: "" })
      toast.success("Đã tạo thành viên mới!")
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ? `Lỗi: ${msg}` : "Tạo thành viên thất bại")
    }
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return
    try {
      await updateUser.mutateAsync({
        id: editingUser.id,
        payload: { username: editingUser.name, email: editingUser.email, role: editingUser.role, ...((editingUser as any).mssv ? { mssv: (editingUser as any).mssv } : {}) },
      })
      setIsEditDialogOpen(false)
      setEditingUser(null)
      toast.success("Đã cập nhật thông tin thành viên thành công!")
    } catch {
      toast.error("Cập nhật thất bại")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteUser.mutateAsync(id)
      toast.success("Đã xóa vĩnh viễn")
    } catch {
      toast.error("Xóa thất bại")
    }
  }

  const handleDeactivate = async (id: string) => {
    try {
      await deactivateUser.mutateAsync(id)
      toast.success("Đã khóa tài khoản")
    } catch {
      toast.error("Thao tác thất bại")
    }
  }

  const handleActivate = async (id: string) => {
    try {
      await activateUser.mutateAsync(id)
      toast.success("Đã mở khóa tài khoản")
    } catch {
      toast.error("Thao tác thất bại")
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-10">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Thành viên & Phân quyền</h1>
          <p className="text-sm text-slate-500">Quản lý cấp độ truy cập và các thành viên.</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto h-10 px-6 active:scale-95 transition-transform">
              <UserPlus className="mr-2 h-4 w-4" /> Thêm thành viên
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Thêm quản trị viên mới</DialogTitle>
              <DialogDescription>Chỉ định vai trò và mời thành viên tham gia hệ thống.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="fullname">Họ và tên</Label>
                <Input id="fullname" placeholder="VD: Nguyễn Văn A" value={newUser.fullname} onChange={(e) => setNewUser({ ...newUser, fullname: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Địa chỉ Email</Label>
                <Input id="email" type="email" placeholder="email@university.edu.vn" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input id="password" type="password" placeholder="••••••••" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mssv">Mã sinh viên (MSSV)</Label>
                <Input id="mssv" placeholder="VD: 2374802010348" value={newUser.mssv} onChange={(e) => setNewUser({ ...newUser, mssv: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Vai trò</Label>
                <Select value={newUser.role} onValueChange={(val) => setNewUser({ ...newUser, role: val })}>
                  <SelectTrigger><SelectValue placeholder="Chọn một vai trò" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateUser} disabled={createUser.isPending} className="w-full h-11">
                {createUser.isPending ? "Đang tạo..." : "Gửi lời mời"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="grid gap-6">
        <motion.div variants={item}>
          <Card className="bg-white shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative w-full sm:w-72 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <Input
                    placeholder="Tìm kiếm..."
                    className="pl-9 h-10 text-sm focus-visible:ring-indigo-500 transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-indigo-600 transition-colors">
                    <Settings2 className="w-4 h-4 mr-2" /> Logic hệ thống
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 text-sans">
              <Table>
                <TableHeader className="hidden sm:table-header-group bg-slate-50/50">
                  <TableRow>
                    <TableHead className="px-6 py-4">Thành viên</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead className="hidden md:table-cell">Trạng thái</TableHead>
                    <TableHead className="hidden lg:table-cell">Truy cập cuối</TableHead>
                    <TableHead className="text-right px-6">Quản lý</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-slate-400 text-sm">Đang tải...</TableCell>
                    </TableRow>
                  ) : (
                    <AnimatePresence mode="popLayout" initial={false}>
                      {users.map((user) => (
                        <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={user.id} className="group flex flex-col sm:table-row p-4 sm:p-0 border-b last:border-0 sm:border-b relative hover:bg-slate-50/55 transition-colors">
                          <TableCell className="p-0 sm:px-6 sm:py-4">
                            <div className="flex flex-col group-hover:translate-x-1 transition-transform">
                              <span className="font-semibold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 transition-colors">{user.name}</span>
                              <span className="text-[11px] sm:text-xs text-slate-500">{user.email}</span>
                              <div className="sm:hidden mt-2 flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'HOẠT ĐỘNG' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{user.status}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="p-0 sm:p-4 mt-2 sm:mt-0 absolute top-4 right-14 sm:relative sm:top-auto sm:right-auto">
                            {getRoleBadge(user.role)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${user.status === 'HOẠT ĐỘNG' ? 'bg-emerald-500' : 'bg-slate-300'} animate-pulse`} />
                              <span className="text-xs font-semibold text-slate-600 uppercase tracking-tight">{user.status}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="text-xs text-slate-400 font-mono">Hôm nay, 10:45 AM</span>
                          </TableCell>
                          <TableCell className="text-right p-0 sm:px-6 absolute top-4 right-4 sm:relative sm:top-auto sm:right-auto leading-none">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className={cn("h-8 w-8 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-slate-200/50")}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem onClick={() => handleEditClick(user)} className="cursor-pointer font-medium">
                                  <Pencil className="w-4 h-4 mr-2" /> Chỉnh sửa thông tin
                                </DropdownMenuItem>
                                {user.status === 'KHOÁ' ? (
                                  <DropdownMenuItem onClick={() => handleActivate(user.id)} className="cursor-pointer">Mở khóa tài khoản</DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleDeactivate(user.id)} className="cursor-pointer">Khóa tài khoản này</DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-red-500 focus:text-red-500 cursor-pointer font-medium">
                                  Xóa vĩnh viễn (Xóa hẳn)
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  )}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-slate-500">
                    Trang {page} / {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Trang trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Trang sau
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={container} className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Super Admin", desc: "Toàn quyền hệ thống, quản lý tài khoản và cấu hình cấp cao.", color: "text-red-500", Icon: ShieldAlert },
            { label: "Admin", desc: "Quản lý sự kiện, danh sách đăng ký và điểm danh.", color: "text-purple-500", Icon: ShieldAlert },
            { label: "Manager", desc: "Quản lý các sự kiện và danh sách đăng ký, tạo báo cáo.", color: "text-blue-500", Icon: ShieldCheck },
            { label: "Student", desc: "Truy cập vào ứng dụng khách, đăng ký sự kiện và nhận vé.", color: "text-slate-500", Icon: Shield },
          ].map((role) => (
            <motion.div key={role.label} variants={item}>
              <Card className="bg-white hover:bg-slate-50 transition-colors border-dashed border-2 h-full group">
                <CardHeader className="p-4">
                  <CardTitle className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${role.color}`}>
                    <role.Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    {role.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed uppercase">{role.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa tài khoản</DialogTitle>
            <DialogDescription>Cập nhật thông tin tài khoản thành viên hệ thống.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-fullname">Họ và tên</Label>
                <Input id="edit-fullname" value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Địa chỉ Email</Label>
                <Input id="edit-email" type="email" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-mssv">Mã sinh viên (MSSV)</Label>
                <Input id="edit-mssv" placeholder="VD: 2374802010348" value={(editingUser as any).mssv ?? ""} onChange={(e) => setEditingUser({ ...editingUser, mssv: e.target.value } as any)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Vai trò</Label>
                <Select value={editingUser.role} onValueChange={(val: UserRole) => setEditingUser({ ...editingUser, role: val })}>
                  <SelectTrigger><SelectValue placeholder="Chọn vai trò" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Super Admin">Super Admin (Toàn quyền hệ thống)</SelectItem>
                    <SelectItem value="Admin">Admin (Quản lý sự kiện)</SelectItem>
                    <SelectItem value="Manager">Manager (Quyền vận hành)</SelectItem>
                    <SelectItem value="Student">Student (Sinh viên)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSaveEdit} disabled={updateUser.isPending}>
              {updateUser.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
