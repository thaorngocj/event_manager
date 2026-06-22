"use client"

import React, { useState } from "react"
import { Search, Plus, Pencil, Trash2, GraduationCap, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { motion, AnimatePresence } from "motion/react"
import {
  useFacultiesQuery,
  useCreateFacultyMutation,
  useUpdateFacultyMutation,
  useDeleteFacultyMutation,
} from "@/hooks/use-faculties-api"
import { PaginationBar } from "@/components/ui/pagination-bar"

interface FacultyItem {
  id: string
  name: string
  description: string
  createdAt: string
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
}

const PAGE_SIZE = 10

export default function FacultiesPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingFaculty, setEditingFaculty] = useState<FacultyItem | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", description: "" })

  const { data: faculties = [], isLoading } = useFacultiesQuery()
  const createFaculty = useCreateFacultyMutation()
  const updateFaculty = useUpdateFacultyMutation()
  const deleteFaculty = useDeleteFacultyMutation()

  const filtered = faculties.filter((f: FacultyItem) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.description.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pagedFiltered = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const openCreate = () => {
    setForm({ name: "", description: "" })
    setIsCreateOpen(true)
  }

  const openEdit = (f: FacultyItem) => {
    setForm({ name: f.name, description: f.description })
    setEditingFaculty(f)
  }

  const handleCreate = async () => {
    if (!form.name.trim()) return toast.error("Vui lòng nhập tên khoa")
    try {
      await createFaculty.mutateAsync({ name: form.name.trim(), description: form.description.trim() })
      toast.success("Thêm khoa thành công")
      setIsCreateOpen(false)
    } catch {
      toast.error("Thêm khoa thất bại")
    }
  }

  const handleUpdate = async () => {
    if (!editingFaculty || !form.name.trim()) return toast.error("Vui lòng nhập tên khoa")
    try {
      await updateFaculty.mutateAsync({
        id: editingFaculty.id,
        payload: { name: form.name.trim(), description: form.description.trim() },
      })
      toast.success("Cập nhật khoa thành công")
      setEditingFaculty(null)
    } catch {
      toast.error("Cập nhật thất bại")
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await deleteFaculty.mutateAsync(deletingId)
      toast.success("Xóa khoa thành công")
    } catch {
      toast.error("Xóa thất bại")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-10">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Quản lý Khoa</h1>
          <p className="text-sm text-slate-500">Danh sách các khoa / phòng ban trong hệ thống.</p>
        </div>
        <Button onClick={openCreate} className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs rounded-xl">
          <Plus className="mr-2 h-4 w-4" /> Thêm khoa
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div variants={item}>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm kiếm khoa..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9 bg-white border-slate-200"
          />
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item}>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 font-medium">Tổng số khoa</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{faculties.length}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div variants={item} className="text-center py-20 text-slate-400">
          <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Không có khoa nào{search ? " phù hợp" : ""}</p>
        </motion.div>
      ) : (
        <motion.div variants={container} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {pagedFiltered.map((f: FacultyItem) => (
              <motion.div key={f.id} variants={item} layout>
                <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate">{f.name}</p>
                          {f.description && (
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{f.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-400 hover:text-slate-700"
                          onClick={() => openEdit(f)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-400 hover:text-red-600"
                          onClick={() => setDeletingId(f.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <motion.div variants={item}>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <PaginationBar
            page={page}
            totalPages={totalPages}
            total={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </motion.div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black uppercase italic tracking-tight">Thêm khoa mới</DialogTitle>
            <DialogDescription>Nhập thông tin khoa / phòng ban cần thêm vào hệ thống.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="create-name">Tên khoa <span className="text-red-500">*</span></Label>
              <Input
                id="create-name"
                placeholder="VD: Khoa Công nghệ Thông tin"
                value={form.name}
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-desc">Mô tả</Label>
              <Textarea
                id="create-desc"
                placeholder="Mô tả ngắn về khoa..."
                rows={3}
                value={form.description}
                onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Hủy</Button>
            <Button
              onClick={handleCreate}
              disabled={createFaculty.isPending}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              {createFaculty.isPending ? "Đang lưu..." : "Thêm khoa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingFaculty} onOpenChange={(o: boolean) => !o && setEditingFaculty(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black uppercase italic tracking-tight">Chỉnh sửa khoa</DialogTitle>
            <DialogDescription>Cập nhật thông tin khoa trong hệ thống.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tên khoa <span className="text-red-500">*</span></Label>
              <Input
                id="edit-name"
                value={form.name}
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Mô tả</Label>
              <Textarea
                id="edit-desc"
                rows={3}
                value={form.description}
                onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFaculty(null)}>Hủy</Button>
            <Button
              onClick={handleUpdate}
              disabled={updateFaculty.isPending}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              {updateFaculty.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deletingId} onOpenChange={(o: boolean) => !o && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa khoa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Khoa sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteFaculty.isPending ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
