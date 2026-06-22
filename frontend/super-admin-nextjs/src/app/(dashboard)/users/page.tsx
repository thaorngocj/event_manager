"use client"

import * as React from "react"
import { useState } from "react"
import { Search, UserPlus, Shield, ShieldAlert, ShieldCheck, MoreHorizontal, Settings2, Pencil, Upload, Download, FileUp, CheckCircle2, AlertCircle } from "lucide-react"
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
  useImportUsersMutation,
  useDownloadImportTemplate,
} from "@/hooks/use-users-api"
import { useFacultiesQuery } from "@/hooks/use-faculties-api"
import { PaginationBar } from "@/components/ui/pagination-bar"

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
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importReport, setImportReport] = useState<{ created: number; failed: number; errors: { row?: number; message: string }[] } | null>(null)
  const [roleFilter, setRoleFilter] = useState<UserRole | "All">("All")
  const [statusFilter, setStatusFilter] = useState<"All" | "HOẠT ĐỘNG" | "KHOÁ">("All")
  const [newUser, setNewUser] = useState({ fullname: "", email: "", password: "", role: "", mssv: "", facultyId: "", major: "", cohort: "", classId: "", trainingPoints: "", unionRole: "" })
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  const { data: usersResult, isLoading } = useUsersQuery(search || undefined, page, PAGE_SIZE)
  const users = usersResult?.data ?? []
  const totalUsers = usersResult?.total ?? 0
  const totalPages = usersResult?.totalPages ?? 1
  const { data: faculties = [] } = useFacultiesQuery()
  const createUser = useCreateUserMutation()
  const updateUser = useUpdateUserMutation()
  const deleteUser = useDeleteUserMutation()
  const activateUser = useActivateUserMutation()
  const deactivateUser = useDeactivateUserMutation()
  const importUsers = useImportUsersMutation()
  const downloadTemplate = useDownloadImportTemplate()

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
    if (!newUser.password) return toast.error("Vui lòng nhập mật khẩu")
    const pwd = newUser.password
    if (pwd.length < 6) return toast.error("Mật khẩu phải có ít nhất 6 ký tự")
    try {
      await createUser.mutateAsync({
        username: newUser.fullname,
        email: newUser.email,
        password: pwd,
        role: newUser.role || "Student",
        ...(newUser.mssv ? { mssv: newUser.mssv } : {}),
        ...(newUser.facultyId && newUser.facultyId !== 'none' ? { facultyId: parseInt(newUser.facultyId) } : {}),
        ...(newUser.major ? { major: newUser.major } : {}),
        ...(newUser.cohort ? { cohort: newUser.cohort } : {}),
        ...(newUser.classId ? { classId: newUser.classId } : {}),
        ...(newUser.trainingPoints ? { trainingPoints: parseInt(newUser.trainingPoints) } : {}),
        ...(newUser.unionRole ? { unionRole: newUser.unionRole } : {}),
      })
      setIsCreateDialogOpen(false)
      setNewUser({ fullname: "", email: "", password: "", role: "", mssv: "", facultyId: "", major: "", cohort: "", classId: "", trainingPoints: "", unionRole: "" })
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

  const handleImport = async () => {
    if (!importFile) return toast.error("Vui lòng chọn file để import")
    setImportReport(null)
    try {
      const result = await importUsers.mutateAsync(importFile)
      const errors = extractErrors(result)
      const created = result?.created ?? result?.successCount ?? result?.data?.length ?? 0
      const failed = result?.failed ?? result?.failedCount ?? errors.length
      setImportReport({ created, failed, errors })
      if (failed === 0 && errors.length === 0) {
        setIsImportDialogOpen(false)
        setImportFile(null)
        toast.success(`Import thành công ${created} tài khoản`)
      }
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, unknown> } })?.response?.data
      const errors = extractErrors(data)
      if (errors.length === 0 && data?.message) errors.push({ message: String(data.message) })
      if (errors.length === 0) errors.push({ message: "Import thất bại. Vui lòng kiểm tra lại định dạng file." })
      setImportReport({ created: Number(data?.created ?? 0), failed: Number(data?.failed ?? data?.failedCount ?? errors.length), errors })
    }
  }

  function extractErrors(data: Record<string, unknown> | null | undefined): { row?: number; message: string }[] {
    if (!data) return []
    const candidates = [data.errors, data.details, data.failedRows, data.errorList, data.errorDetails]
    for (const c of candidates) {
      if (Array.isArray(c) && c.length > 0) {
        return c.map((e: Record<string, unknown>) => ({
          row: e.row != null ? Number(e.row) : e.line != null ? Number(e.line) : e.index != null ? Number(e.index) + 1 : undefined,
          message: String(e.message ?? e.error ?? e.reason ?? e.msg ?? JSON.stringify(e)),
        }))
      }
    }
    return []
  }

  const handleDownloadTemplate = async () => {
    try {
      await downloadTemplate.mutateAsync()
      toast.success("Đã tải file mẫu")
    } catch {
      toast.error("Tải file mẫu thất bại")
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-10">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Thành viên & Phân quyền</h1>
          <p className="text-sm text-slate-500">Quản lý cấp độ truy cập và các thành viên.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Dialog open={isImportDialogOpen} onOpenChange={(open) => { setIsImportDialogOpen(open); if (!open) { setImportFile(null); setImportReport(null) } }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto h-10 px-6 active:scale-95 transition-transform">
                <Upload className="mr-2 h-4 w-4" /> Import danh sách
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden rounded-2xl">
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
                <DialogTitle className="text-base font-black uppercase tracking-widest italic">Import danh sách người dùng</DialogTitle>
                <DialogDescription className="font-medium text-xs mt-0.5">File Excel (.xlsx, .xls) — theo đúng thứ tự cột file mẫu</DialogDescription>
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* Column order preview */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 space-y-2.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Thứ tự cột trong file mẫu</p>
                  <div className="grid grid-cols-5 gap-1 text-center">
                    {["Họ và tên", "Email", "Mật khẩu", "MSSV", "Vai trò"].map((col, i) => (
                      <div key={col} className="rounded-lg bg-white border border-slate-200 px-1 py-1.5 shadow-sm">
                        <span className="block text-[9px] font-black text-red-500 mb-0.5">{i + 1}</span>
                        <span className="text-[10px] font-bold text-slate-700 leading-tight">{col}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-1">Cột Vai trò — nhập đúng giá trị:</p>
                    <div className="flex flex-wrap gap-1">
                      {["STUDENT", "EVENT_MANAGER", "ADMIN", "SUPER_ADMIN"].map(r => (
                        <code key={r} className="text-[10px] font-bold bg-white border border-amber-200 text-amber-700 rounded px-1.5 py-0.5">{r}</code>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Download template */}
                <Button variant="outline" size="sm" className="w-full border-slate-200 text-slate-600 font-bold uppercase tracking-widest text-[10px] h-9 rounded-xl" onClick={handleDownloadTemplate} disabled={downloadTemplate.isPending}>
                  <Download className="mr-2 h-3.5 w-3.5" />
                  {downloadTemplate.isPending ? "Đang tải..." : "Tải file mẫu (.xlsx)"}
                </Button>

                {/* Drop zone */}
                <div
                  className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-colors ${importFile ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:border-red-400 hover:bg-red-50/30"}`}
                  onClick={() => document.getElementById("import-file-input")?.click()}
                >
                  <input
                    id="import-file-input"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => { setImportFile(e.target.files?.[0] ?? null); setImportReport(null) }}
                  />
                  {importFile ? (
                    <div className="space-y-1.5">
                      <CheckCircle2 className="h-9 w-9 text-emerald-500 mx-auto" />
                      <p className="text-sm font-bold text-emerald-700">{importFile.name}</p>
                      <p className="text-xs text-emerald-600">{(importFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div className="space-y-2 group">
                      <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto group-hover:bg-white transition-colors">
                        <FileUp className="h-7 w-7 text-slate-300 group-hover:text-red-400 transition-colors" />
                      </div>
                      <p className="text-sm font-bold text-slate-600">Nhấp để chọn hoặc kéo thả</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">.xlsx hoặc .xls hoặc .csv — tối đa 10MB</p>
                    </div>
                  )}
                </div>


                {/* Result — success */}
                {importReport && importReport.failed === 0 && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1">
                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Import thành công</p>
                    <p className="text-sm text-emerald-800">✓ {importReport.created} tài khoản đã được tạo</p>
                  </div>
                )}

                {/* Result — errors */}
                {importReport && importReport.failed > 0 && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                        <p className="text-[10px] font-black text-red-700 uppercase tracking-widest">Import hoàn tất có lỗi</p>
                      </div>
                      <div className="flex gap-3 text-[11px] font-bold">
                        {importReport.created > 0 && <span className="text-emerald-600">✓ {importReport.created}</span>}
                        <span className="text-red-600">✕ {importReport.failed}</span>
                      </div>
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {importReport.errors.length > 0 ? importReport.errors.map((e, i) => (
                        <div key={i} className="flex gap-2 text-[11px] text-red-700 bg-white/80 rounded-lg px-2.5 py-1.5">
                          {e.row != null && <span className="font-black shrink-0">Dòng {e.row}:</span>}
                          <span className="font-medium">{e.message}</span>
                        </div>
                      )) : (
                        <p className="text-[11px] text-red-600 bg-white/80 rounded-lg px-2.5 py-1.5 font-medium">
                          Có {importReport.failed} bản ghi lỗi. Kiểm tra lại: email trùng, vai trò sai, thiếu trường bắt buộc.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" className="flex-1 rounded-xl font-bold uppercase tracking-widest text-[10px] h-10" onClick={() => { setIsImportDialogOpen(false); setImportFile(null); setImportReport(null) }}>
                    {importReport && importReport.failed > 0 ? "Đóng" : "Hủy"}
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 font-bold uppercase tracking-widest text-[10px] h-10 rounded-xl italic shadow-md shadow-red-900/20"
                    onClick={handleImport}
                    disabled={importUsers.isPending || !importFile}
                  >
                    {importUsers.isPending ? "Đang import..." : importReport ? "Import lại" : "Bắt đầu import"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto h-10 px-6 active:scale-95 transition-transform">
                <UserPlus className="mr-2 h-4 w-4" /> Thêm thành viên
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Thêm thành viên mới</DialogTitle>
                <DialogDescription>Điền thông tin để tạo tài khoản trong hệ thống.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 grid gap-2">
                    <Label htmlFor="fullname">Họ và tên <span className="text-red-500">*</span></Label>
                    <Input id="fullname" placeholder="VD: Nguyễn Văn A" value={newUser.fullname} onChange={(e) => setNewUser({ ...newUser, fullname: e.target.value })} />
                  </div>
                  <div className="col-span-2 grid gap-2">
                    <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                    <Input id="email" type="email" placeholder="email@university.edu.vn" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                  </div>
                  <div className="col-span-2 grid gap-2">
                    <Label htmlFor="password">Mật khẩu <span className="text-red-500">*</span></Label>
                    <Input id="password" type="password" placeholder="••••••••" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="mssv">MSSV</Label>
                    <Input id="mssv" placeholder="VD: 2374802010348" value={newUser.mssv} onChange={(e) => setNewUser({ ...newUser, mssv: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cohort">Khóa học</Label>
                    <Input id="cohort" placeholder="VD: 2021-2025" value={newUser.cohort} onChange={(e) => setNewUser({ ...newUser, cohort: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="classId">Lớp</Label>
                    <Input id="classId" placeholder="VD: 71K29CNTT07" value={newUser.classId} onChange={(e) => setNewUser({ ...newUser, classId: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="major">Ngành</Label>
                    <Input id="major" placeholder="VD: Công nghệ thông tin" value={newUser.major} onChange={(e) => setNewUser({ ...newUser, major: e.target.value })} />
                  </div>
                  {faculties.length > 0 && (
                    <div className="col-span-2 grid gap-2">
                      <Label htmlFor="facultyId">Khoa</Label>
                      <Select value={newUser.facultyId} onValueChange={(val) => setNewUser({ ...newUser, facultyId: val })}>
                        <SelectTrigger><SelectValue placeholder="Chọn khoa" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Không chọn</SelectItem>
                          {faculties.map((f: { id: string; code: string; name: string }) => (
                            <SelectItem key={f.id} value={f.id}>{f.code} — {f.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="trainingPoints">Điểm rèn luyện</Label>
                    <Input id="trainingPoints" type="number" min="0" placeholder="0" value={newUser.trainingPoints} onChange={(e) => setNewUser({ ...newUser, trainingPoints: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unionRole">Chức vụ Đoàn/Hội</Label>
                    <Input id="unionRole" placeholder="VD: Bí thư" value={newUser.unionRole} onChange={(e) => setNewUser({ ...newUser, unionRole: e.target.value })} />
                  </div>
                  <div className="col-span-2 grid gap-2">
                    <Label htmlFor="role">Vai trò <span className="text-red-500">*</span></Label>
                    <Select value={newUser.role} onValueChange={(val) => setNewUser({ ...newUser, role: val })}>
                      <SelectTrigger><SelectValue placeholder="Chọn vai trò" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Super Admin">Super Admin</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Student">Student</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateUser} disabled={createUser.isPending} className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-bold">
                  {createUser.isPending ? "Đang tạo..." : "Tạo tài khoản"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <div className="grid gap-6">
        <motion.div variants={item}>
          <Card className="bg-white shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b px-4 sm:px-6">
              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative group flex-1 min-w-[180px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                  <Input
                    placeholder="Tìm kiếm theo tên, email..."
                    className="pl-9 h-10 text-sm focus-visible:ring-red-500 transition-all"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  />
                </div>

                {/* Role filter */}
                <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | "All")}>
                  <SelectTrigger className="h-10 w-44 text-[12px] font-medium border-slate-200 focus:ring-red-500 bg-white">
                    <SelectValue placeholder="Tất cả vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    {([
                      { label: "Tất cả vai trò", value: "All" },
                      { label: "Student", value: "Student" },
                      { label: "Manager", value: "Manager" },
                      { label: "Admin", value: "Admin" },
                      { label: "Super Admin", value: "Super Admin" },
                    ] as { label: string; value: UserRole | "All" }[]).map(({ label, value }) => {
                      const count = value === "All" ? users.length : users.filter(u => u.role === value).length
                      return (
                        <SelectItem key={value} value={value} className="text-[12px]">
                          <span className="flex items-center gap-2">
                            <span>{label}</span>
                            <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{count}</span>
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>

                {/* Status filter */}
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                  <SelectTrigger className="h-10 w-44 text-[12px] font-medium border-slate-200 focus:ring-red-500 bg-white">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {([
                      { label: "Tất cả trạng thái", value: "All" },
                      { label: "Hoạt động", value: "HOẠT ĐỘNG" },
                      { label: "Đã khoá", value: "KHOÁ" },
                    ] as { label: string; value: typeof statusFilter }[]).map(({ label, value }) => {
                      const count = value === "All" ? users.length : users.filter(u => u.status === value).length
                      return (
                        <SelectItem key={value} value={value} className="text-[12px]">
                          <span className="flex items-center gap-2">
                            {value !== "All" && (
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${value === "HOẠT ĐỘNG" ? "bg-emerald-500" : "bg-slate-300"}`} />
                            )}
                            <span>{label}</span>
                            <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{count}</span>
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>

                {/* Clear filters */}
                {(roleFilter !== "All" || statusFilter !== "All" || search) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setRoleFilter("All"); setStatusFilter("All"); setSearch("") }}
                    className="h-10 px-3 text-[12px] text-slate-400 hover:text-red-600 hover:bg-red-50 font-medium transition-colors"
                  >
                    Xóa lọc
                  </Button>
                )}

                <div className="ml-auto">
                  <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-red-600 transition-colors h-10">
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
                      {users.filter(u =>
                        (roleFilter === "All" || u.role === roleFilter) &&
                        (statusFilter === "All" || u.status === statusFilter)
                      ).map((user) => (
                        <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={user.id} className="group flex flex-col sm:table-row p-4 sm:p-0 border-b last:border-0 sm:border-b relative hover:bg-slate-50/55 transition-colors">
                          <TableCell className="p-0 sm:px-6 sm:py-4">
                            <div className="flex flex-col group-hover:translate-x-1 transition-transform">
                              <span className="font-semibold text-sm sm:text-base text-slate-900 group-hover:text-red-600 transition-colors">{user.name}</span>
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
            </CardContent>
            <PaginationBar
              page={page}
              totalPages={totalPages}
              total={totalUsers}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
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
