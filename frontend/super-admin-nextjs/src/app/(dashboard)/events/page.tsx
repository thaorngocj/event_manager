"use client"

import * as React from "react"
import { useState } from "react"
import { Plus, Search, MoreHorizontal, Edit, Trash2, ExternalLink, Filter, ImagePlus, Check, Eye, Calendar, MapPin, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { motion, AnimatePresence } from "motion/react"
import {
  useEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} from "@/hooks/use-events-api"
import { uploadService } from "@/services/upload.service"
import { getImageUrl } from "@/lib/utils"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
}

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [eventDisplayMode, setEventDisplayMode] = useState<'HERO' | 'FEATURED' | 'HIGHLIGHT' | 'NORMAL'>("FEATURED")
  const [eventCategory, setEventCategory] = useState("ACADEMIC")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newEvent, setNewEvent] = useState({ title: "", description: "", location: "", date: "", endDate: "", time: "", capacity: "200" })

  const [page, setPage] = useState(1)
  const limit = 10
  
  // Use debounced search term if we want, but for now just use searchTerm
  const { data: eventsData, isLoading } = useEventsQuery({ 
    page, 
    limit, 
    search: searchTerm, 
    status: statusFilter === "ALL" ? undefined : statusFilter 
  })
  
  const events = eventsData?.data || []
  const totalPages = eventsData?.totalPages || 1

  const createEvent = useCreateEventMutation()
  const updateEvent = useUpdateEventMutation()
  const deleteEvent = useDeleteEventMutation()

  // Remove local filtering as it's now handled by backend
  const filteredEvents = events

  const handleImageFile = async (file: File) => {
    setImagePreview(URL.createObjectURL(file))
    setIsUploading(true)
    try {
      const url = await uploadService.uploadImage(file)
      setUploadedImageUrl(url)
    } catch {
      toast.error("Lỗi upload ảnh — ảnh sẽ không được lưu")
      setUploadedImageUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleImageFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault() }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) handleImageFile(file)
  }

  const handleOpenEdit = (event: typeof events[0]) => {
    setEditingId(event.id)
    // Parse the date back from vi-VN format (dd/mm/yyyy) to yyyy-mm-dd for input[type=date]
    const parsedDate = (() => {
      if (!event.date) return ""
      const parts = event.date.split('/')
      if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`
      return event.date
    })()
    setNewEvent({
      title: event.title,
      description: event.description,
      location: event.location,
      date: parsedDate,
      endDate: parsedDate,
      time: "",
      capacity: String(event.capacity),
    })
    setImagePreview(getImageUrl(event.imageUrl) || null)
    setUploadedImageUrl(event.imageUrl || null)
    setEventDisplayMode((event.displayCategory as 'HERO' | 'FEATURED' | 'HIGHLIGHT' | 'NORMAL') || 'FEATURED')
    setEventCategory(event.eventCategory || 'ACADEMIC')
    setIsCreateOpen(true)
  }

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent.mutateAsync(id)
      toast.success("Đã xóa sự kiện!")
    } catch {
      toast.error("Lỗi xóa sự kiện")
    }
  }

  const resetForm = () => {
    setNewEvent({ title: "", description: "", location: "", date: "", endDate: "", time: "", capacity: "200" })
    setImagePreview(null)
    setUploadedImageUrl(null)
    setEditingId(null)
    setEventDisplayMode('FEATURED')
    setEventCategory('ACADEMIC')
    setIsCreateOpen(false)
  }

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.location) {
      return toast.error("Vui lòng điền tối thiểu Tên và Địa điểm")
    }
    const startDate = newEvent.date
      ? `${newEvent.date}T${newEvent.time || '00:00'}:00.000Z`
      : new Date().toISOString()
    const endDate = newEvent.endDate
      ? `${newEvent.endDate}T23:59:00.000Z`
      : startDate
    const payload = {
      title: newEvent.title,
      description: newEvent.description,
      location: newEvent.location,
      startDate,
      endDate,
      maxParticipants: parseInt(newEvent.capacity) || 200,
      displayCategory: eventDisplayMode,
      eventCategory: eventCategory,
      ...(uploadedImageUrl ? { imageUrl: uploadedImageUrl } : {}),
    }

    try {
      if (editingId) {
        await updateEvent.mutateAsync({ id: editingId, payload })
        toast.success("Cập nhật sự kiện thành công!")
      } else {
        await createEvent.mutateAsync(payload)
        toast.success("Sự kiện đã được tạo thành công!")
      }
      resetForm()
    } catch {
      toast.error(editingId ? "Lỗi khi cập nhật sự kiện" : "Lỗi khi tạo sự kiện")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SẮP DIỄN RA': return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 rounded-full text-[10px] font-bold uppercase tracking-tight">Sắp diễn ra</Badge>
      case 'ĐANG DIỄN RA': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 rounded-full text-[10px] font-bold uppercase tracking-tight">Đang diễn ra</Badge>
      case 'ĐÃ KẾT THÚC': return <Badge variant="outline" className="bg-muted rounded-full text-[10px] font-bold uppercase tracking-tight">Đã kết thúc</Badge>
      case 'ĐÃ HỦY': return <Badge variant="destructive" className="rounded-full text-[10px] font-bold uppercase tracking-tight">Đã hủy</Badge>
      default: return <Badge className="rounded-full text-[10px] font-bold uppercase tracking-tight">{status}</Badge>
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-10">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Quản lý sự kiện</h1>
          <p className="text-sm text-slate-500">Quản lý danh sách sự kiện và lịch trình.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsCreateOpen(open) }}>
          <DialogTrigger asChild>
            <Button className={cn("w-full sm:w-auto h-10 px-6 bg-primary hover:bg-primary/90 active:scale-95 transition-all")}>
              <Plus className="mr-2 h-4 w-4" /> Thêm sự kiện mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-none shadow-2xl max-h-[95vh] flex flex-col">
            <DialogHeader className="p-6 sm:p-8 pb-0">
              <DialogTitle className="text-2xl sm:text-3xl font-black italic tracking-tighter text-slate-900 uppercase">
                {editingId ? "CHỈNH SỬA SỰ KIỆN" : "TẠO SỰ KIỆN MỚI"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium italic text-xs sm:text-sm">
                {editingId ? "Cập nhật thông tin sự kiện." : "Nhập thông tin chi tiết để tạo sự kiện mới trên hệ thống."}
              </DialogDescription>
            </DialogHeader>

            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">ẢNH BÌA SỰ KIỆN</Label>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-slate-100 rounded-2xl aspect-video bg-slate-50/50 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-100/50 transition-colors group relative overflow-hidden"
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white">
                        <ImagePlus className="w-8 h-8" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Thay đổi ảnh</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setImagePreview(null) }} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-20">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                        <ImagePlus className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-tighter text-slate-600">DRAG & DROP IMAGE</p>
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-tighter text-red-500">OR BROWSE FILES</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">TÊN SỰ KIỆN</Label>
                <Input placeholder="VD: HỘI THẢO AI 2026" className="h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/20" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">CHI TIẾT SỰ KIỆN</Label>
                <Textarea placeholder="Nhập mô tả sự kiện..." className="min-h-[100px] sm:min-h-[120px] bg-slate-50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/20 transition-all focus:bg-white" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">NGÀY BẮT ĐẦU</Label>
                  <Input type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} className="h-12 bg-slate-50 border-none rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">NGÀY KẾT THÚC</Label>
                  <Input type="date" value={newEvent.endDate} onChange={e => setNewEvent({ ...newEvent, endDate: e.target.value })} className="h-12 bg-slate-50 border-none rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">GIỜ BẮT ĐẦU</Label>
                  <Input type="time" value={newEvent.time} onChange={e => setNewEvent({ ...newEvent, time: e.target.value })} className="h-12 bg-slate-50 border-none rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">SỨC CHỨA</Label>
                  <Input type="number" placeholder="200" value={newEvent.capacity} onChange={e => setNewEvent({ ...newEvent, capacity: e.target.value })} className="h-12 bg-slate-50 border-none rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">ĐỊA ĐIỂM</Label>
                <Input value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="VD: Hội trường A" className="h-12 bg-slate-50 border-none rounded-xl" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                    <Home className="inline w-3 h-3 mr-1 mb-0.5" />
                    HIỂN THỊ TRÊN HOMEPAGE
                  </Label>
                  <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {[
                      { value: 'FEATURED', label: 'SỰ KIỆN NỔI BẬT' },
                      { value: 'HIGHLIGHT', label: 'DANH MỤC SỰ KIỆN' },
                      { value: 'HERO', label: 'ẢNH NỀN TRANG CHỦ (HERO)' },
                      { value: 'NORMAL', label: 'BÌNH THƯỜNG (ẨN)' },
                    ].map(({ value, label }) => (
                      <button key={value} type="button" onClick={() => setEventDisplayMode(value as typeof eventDisplayMode)} className={`w-full flex items-center justify-between px-4 py-3 text-[10px] font-bold transition-colors ${eventDisplayMode === value ? "bg-slate-50 text-indigo-600" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
                        {label}
                        {eventDisplayMode === value && <Check className="w-3 h-3 text-indigo-600" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">THỂ LOẠI SỰ KIỆN</Label>
                  <Select value={eventCategory} onValueChange={setEventCategory}>
                    <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-[11px] font-bold">
                      <SelectValue placeholder="Chọn thể loại" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        { value: 'ACADEMIC', label: 'Học thuật' },
                        { value: 'CULTURE', label: 'Văn hóa' },
                        { value: 'SPORT', label: 'Thể thao' },
                        { value: 'COMMUNITY', label: 'Cộng đồng' },
                        { value: 'NATIONAL', label: 'Quốc gia' },
                        { value: 'SCHOOL', label: 'Trường' },
                        { value: 'SEMINAR', label: 'Hội thảo' },
                      ].map(({ value, label }) => (
                        <SelectItem key={value} value={value} className="text-[11px] font-bold">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 pt-0 mt-auto">
              <Button
                onClick={handleCreateEvent}
                disabled={createEvent.isPending || updateEvent.isPending || isUploading}
                type="button"
                className="w-full h-12 sm:h-14 bg-slate-900 hover:bg-slate-800 text-white font-black italic uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-slate-200 text-xs sm:text-sm active:scale-95"
              >
                {isUploading ? "Đang upload ảnh..." : (createEvent.isPending || updateEvent.isPending) ? "Đang lưu..." : editingId ? "LƯU THAY ĐỔI" : "XÁC NHẬN & XUẤT BẢN SỰ KIỆN"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={item}>
        <Card className="bg-white shadow-sm border-slate-200/60 overflow-hidden">
          <CardHeader className="pb-3 px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="relative w-full lg:w-[400px] group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                <Input placeholder="Tìm kiếm sự kiện..." className="pl-9 h-10 transition-all focus-visible:ring-indigo-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { value: "ALL", label: "Tất cả" },
                  { value: "SẮP DIỄN RA", label: "Sắp diễn ra" },
                  { value: "ĐANG DIỄN RA", label: "Đang diễn ra" },
                  { value: "ĐÃ KẾT THÚC", label: "Đã kết thúc" },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setStatusFilter(value)}
                    className={`h-9 px-4 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${
                      statusFilter === value
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "border bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <div className="h-9 px-3 flex items-center justify-center border rounded-md bg-muted/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {isLoading ? "..." : `${filteredEvents.length} sự kiện`}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 sm:px-6 pt-0">
            <div className="sm:rounded-md sm:border overflow-hidden bg-white">
              <Table>
                <TableHeader className="bg-slate-50/50 hidden sm:table-header-group">
                  <TableRow>
                    <TableHead className="w-[300px] lg:w-[350px]">Thông tin sự kiện</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="hidden md:table-cell">Thời gian & Địa điểm</TableHead>
                    <TableHead className="hidden lg:table-cell">Lượt đăng ký</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-slate-400 text-sm">Đang tải...</TableCell>
                    </TableRow>
                  ) : (
                    <AnimatePresence mode="popLayout" initial={false}>
                      {filteredEvents.length > 0 ? filteredEvents.map((event) => (
                        <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={event.id} className="flex flex-col sm:table-row p-4 sm:p-0 border-b last:border-0 sm:border-b relative group hover:bg-slate-50/50 transition-colors">
                          <TableCell className="p-0 sm:p-4">
                            <Link href={`/events/${event.id}`} className="flex flex-col gap-0.5 hover:text-primary transition-colors">
                              <span className="font-bold sm:font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-600 truncate transition-colors">{event.title}</span>
                              <span className="text-xs text-muted-foreground line-clamp-1 sm:truncate max-w-[300px]">{event.description}</span>
                              <div className="md:hidden flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] text-slate-500 font-medium font-mono uppercase">
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {event.date}</span>
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location}</span>
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell className="p-0 sm:p-4 mt-2 sm:mt-0 absolute top-4 right-14 sm:relative sm:top-auto sm:right-auto">
                            {getStatusBadge(event.status)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex flex-col gap-0.5 text-xs">
                              <span className="font-medium text-slate-700">{event.date}</span>
                              <span className="text-slate-400 font-medium truncate max-w-[150px]">{event.location}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex flex-col gap-1 w-[120px]">
                              <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                                <span>{event.registeredCount} / {event.capacity}</span>
                                <span>{event.capacity > 0 ? Math.round((event.registeredCount / event.capacity) * 100) : 0}%</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${event.capacity > 0 ? (event.registeredCount / event.capacity) * 100 : 0}%` }} transition={{ duration: 1, ease: "easeOut" }} className="bg-indigo-600 h-full" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right p-0 sm:p-4 absolute top-4 right-4 sm:relative sm:top-auto sm:right-auto leading-none">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-200/50 transition-colors">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuGroup>
                                  <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono px-3 py-2">Quản lý sự kiện</DropdownMenuLabel>
                                  <DropdownMenuItem className="cursor-pointer">
                                    <Link href={`/events/${event.id}`} className="flex items-center w-full">
                                      <Eye className="mr-2 h-4 w-4" /> Chi tiết & Tham gia
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleOpenEdit(event)}>
                                    <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa thông tin
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="cursor-pointer">
                                    <ExternalLink className="mr-2 h-4 w-4" /> Xem trang đăng ký
                                  </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDeleteEvent(event.id)} className="text-red-500 focus:text-red-500 cursor-pointer font-medium">
                                  <Trash2 className="mr-2 h-4 w-4" /> Xóa sự kiện này
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-32 text-center text-slate-400 italic text-sm">
                            Không tìm thấy dữ liệu phù hợp.
                          </TableCell>
                        </TableRow>
                      )}
                    </AnimatePresence>
                  )}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-2 py-4">
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
    </motion.div>
  )
}
