"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { Search, Filter, CheckCircle2, XCircle, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { motion, AnimatePresence } from "motion/react"
import { Registration } from "@/types"
import { useEventsQuery } from "@/hooks/use-events-api"
import { useEventRegistrations, useManualCheckinMutation } from "@/hooks/use-registrations-api"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
}

export default function CheckInPage() {
  const [selectedEventId, setSelectedEventId] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const { data: eventsData } = useEventsQuery()
  const events = eventsData?.data || []
  const { data: registrations = [], isLoading } = useEventRegistrations(selectedEventId)
  const checkinMutation = useManualCheckinMutation()

  const handleToggleAttendance = (reg: Registration, isChecked: boolean) => {
    if (!isChecked) {
      toast.info("Không thể hủy điểm danh qua hệ thống.")
      return
    }
    if (!selectedEventId) return
    checkinMutation.mutate(
      { eventId: selectedEventId, payload: { email: reg.userEmail } },
      {
        onSuccess: () => toast.success(`Đã điểm danh cho ${reg.userName}`),
        onError: () => toast.error("Điểm danh thất bại. Vui lòng thử lại."),
      }
    )
  }

  const filteredData = useMemo(() => {
    return registrations.filter(reg => {
      const matchesSearch =
        reg.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.eventName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "present" && reg.status === 'ĐÃ ĐIỂM DANH') ||
        (statusFilter === "absent" && reg.status !== 'ĐÃ ĐIỂM DANH')
      return matchesSearch && matchesStatus
    })
  }, [registrations, searchTerm, statusFilter])

  const checkedInCount = registrations.filter(r => r.status === 'ĐÃ ĐIỂM DANH').length
  const total = registrations.length

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-10">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Quản lý Điểm danh</h1>
          <p className="text-sm text-slate-500">Ghi nhận người tham gia tại các sự kiện.</p>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <Card className="bg-white shadow-sm border-slate-200/60 overflow-hidden">
          <CardHeader className="pb-4 px-4 sm:px-6 border-b border-slate-100">
            <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center">
              <div className="w-full lg:w-72">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block font-mono">Chọn sự kiện</label>
                <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                  <SelectTrigger className="h-10 text-sm focus:ring-indigo-500 transition-all">
                    <CalendarDays className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
                    <SelectValue placeholder="-- Chọn sự kiện --" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full lg:flex-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block font-mono">Tìm kiếm người tham gia</label>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <Input placeholder="MSSV, Tên hoặc Sự kiện..." className="pl-9 h-10 text-sm focus-visible:ring-indigo-500 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <div className="w-full lg:w-56">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block font-mono">Lọc trạng thái</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-10 text-sm focus:ring-indigo-500 transition-all">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="present">Đã hiện diện</SelectItem>
                    <SelectItem value="absent">Vắng mặt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" className="h-10 text-xs px-2 sm:px-4 shrink-0 hover:bg-slate-100 transition-colors" onClick={() => { setSearchTerm(""); setStatusFilter("all") }}>
                <Filter className="mr-2 h-3.5 w-3.5" /> Đặt lại
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!selectedEventId ? (
              <div className="h-32 flex items-center justify-center text-slate-400 italic text-sm">
                Vui lòng chọn sự kiện để xem danh sách điểm danh.
              </div>
            ) : isLoading ? (
              <div className="h-32 flex items-center justify-center text-slate-400 italic text-sm">
                Đang tải dữ liệu...
              </div>
            ) : (
              <Table>
                <TableHeader className="hidden sm:table-header-group bg-slate-50/50">
                  <TableRow>
                    <TableHead className="w-[120px] lg:w-[150px] px-6 py-4">MSSV</TableHead>
                    <TableHead>Họ và tên</TableHead>
                    <TableHead className="hidden md:table-cell">Khoa/Phòng</TableHead>
                    <TableHead className="hidden lg:table-cell">Sự kiện</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right pr-6">Điểm danh</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {filteredData.length > 0 ? (
                      filteredData.map((reg) => (
                        <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={reg.id} className="group flex flex-col sm:table-row p-4 sm:p-0 border-b last:border-0 sm:border-b relative hover:bg-slate-50/55 transition-colors">
                          <TableCell className="hidden sm:table-cell font-mono text-xs px-6 text-slate-500">{reg.studentId}</TableCell>
                          <TableCell className="p-0 sm:px-4 sm:py-4">
                            <div className="font-semibold text-slate-900 text-sm sm:text-base">{reg.userName}</div>
                            <div className="sm:hidden mt-1 flex flex-col gap-0.5 text-[10px] text-slate-500 font-medium">
                              <span className="font-mono">MSSV: {reg.studentId} • {reg.faculty}</span>
                              <span className="truncate max-w-[250px]">Sự kiện: {reg.eventName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-slate-600 text-xs">{reg.faculty}</TableCell>
                          <TableCell className="hidden lg:table-cell text-slate-600 text-xs truncate max-w-[200px]">{reg.eventName}</TableCell>
                          <TableCell className="p-0 sm:p-4 mt-3 sm:mt-0 absolute top-4 right-14 sm:relative sm:top-auto sm:right-auto">
                            {reg.status === 'ĐÃ ĐIỂM DANH' ? (
                              <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 text-[10px] rounded-full px-2 animate-in fade-in zoom-in duration-300">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Có mặt
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-100 text-[10px] rounded-full px-2 animate-in fade-in zoom-in duration-300">
                                <XCircle className="w-3 h-3 mr-1" /> Vắng mặt
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right p-0 sm:pr-6 absolute top-4 right-4 sm:relative sm:top-auto sm:right-auto leading-none">
                            <Switch
                              checked={reg.status === 'ĐÃ ĐIỂM DANH'}
                              onCheckedChange={(checked) => handleToggleAttendance(reg, checked)}
                              disabled={checkinMutation.isPending}
                              className="data-[state=checked]:bg-emerald-500"
                            />
                          </TableCell>
                        </motion.tr>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-slate-400 italic text-sm">
                          Không tìm thấy dữ liệu phù hợp.
                        </TableCell>
                      </TableRow>
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={container} className="grid gap-6 md:grid-cols-3">
        <motion.div variants={item}>
          <Card className="bg-white border-slate-200/60 shadow-sm overflow-hidden h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Thống kê điểm danh</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-bold text-slate-900">{checkedInCount}</span>
                <span className="text-xs text-slate-400">/ {total} sinh viên</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${total > 0 ? (checkedInCount / total) * 100 : 0}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-emerald-500 h-full"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-white border-slate-200/60 shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Tỷ lệ vắng mặt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-bold text-amber-600">{total - checkedInCount}</span>
                <span className="text-xs text-slate-400">sinh viên chưa đến</span>
              </div>
              <div className="mt-4 flex gap-1 items-center">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${total > 0 ? ((total - checkedInCount) / total) * 100 : 0}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="bg-amber-500 h-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-indigo-600 text-white shadow-lg shadow-indigo-200 border-none h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-16 h-16" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-[10px] text-indigo-100">Mẹo quản lý</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-indigo-50 leading-relaxed font-medium">
                Chọn sự kiện trước, sau đó dùng MSSV để tìm kiếm sinh viên. Bật công tắc để điểm danh ngay lập tức.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
