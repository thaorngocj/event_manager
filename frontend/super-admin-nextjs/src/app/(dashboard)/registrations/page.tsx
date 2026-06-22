"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { Search, Filter, Download, MoreVertical, CheckCircle2, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "motion/react"
import { useEventsQuery } from "@/hooks/use-events-api"
import { useAllRegistrationsQuery } from "@/hooks/use-registrations-api"
import { Registration } from "@/types"
import { registrationService } from "@/services/registration.service"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { PaginationBar } from "@/components/ui/pagination-bar"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'ĐÃ ĐIỂM DANH': return <CheckCircle2 className="w-3 h-3 text-green-600 mr-1" />
    case 'ĐÃ XÁC NHẬN': return <CheckCircle2 className="w-3 h-3 text-blue-600 mr-1" />
    case 'CHỜ XỬ LÝ': return <Clock className="w-3 h-3 text-amber-600 mr-1" />
    case 'ĐÃ HỦY': return <XCircle className="w-3 h-3 text-red-600 mr-1" />
    default: return null
  }
}

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case 'ĐÃ ĐIỂM DANH': return "bg-green-100 text-green-700 border-green-200"
    case 'ĐÃ XÁC NHẬN': return "bg-blue-100 text-blue-700 border-blue-200"
    case 'CHỜ XỬ LÝ': return "bg-amber-100 text-amber-700 border-amber-200"
    case 'ĐÃ HỦY': return "bg-red-100 text-red-700 border-red-200"
    default: return ""
  }
}

const PAGE_SIZE = 10

export default function RegistrationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEventId, setSelectedEventId] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [page, setPage] = useState(1)

  const { data: eventsResult } = useEventsQuery()
  const events = eventsResult?.data ?? []
  const eventsMeta = useMemo(() => events.map(e => ({ id: e.id, title: e.title })), [events])
  const { data: allRegistrations = [], isLoading } = useAllRegistrationsQuery(eventsMeta)

  const filteredData = useMemo(() => {
    return allRegistrations.filter((reg: Registration) => {
      const matchesSearch =
        reg.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesEvent = selectedEventId === "all" || reg.eventId === selectedEventId
      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "checked_in" && reg.status === 'ĐÃ ĐIỂM DANH') ||
        (selectedStatus === "confirmed" && reg.status === 'ĐÃ XÁC NHẬN') ||
        (selectedStatus === "pending" && reg.status === 'CHỜ XỬ LÝ') ||
        (selectedStatus === "cancelled" && reg.status === 'ĐÃ HỦY')
      return matchesSearch && matchesEvent && matchesStatus
    })
  }, [allRegistrations, searchTerm, selectedEventId, selectedStatus])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE))
  const pagedData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleExportCSV = () => {
    const headers = ["ID", "Họ tên", "Email", "MSSV", "Sự kiện", "Ngày đăng ký", "Trạng thái"]
    const rows = filteredData.map((reg: Registration) => [
      reg.id, reg.userName, reg.userEmail, reg.studentId, reg.eventName,
      new Date(reg.registrationDate).toLocaleDateString('vi-VN'), reg.status
    ])
    const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n")
    const blob = new Blob(["﻿" + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `danh-sach-dang-ky-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const qc = useQueryClient()

  const handleReset = () => {
    setSearchTerm("")
    setSelectedEventId("all")
    setSelectedStatus("all")
    setPage(1)
  }

  const handleCancel = async (regId: string) => {
    try {
      await registrationService.cancel(regId)
      toast.success("Đã hủy đăng ký thành công")
      qc.invalidateQueries({ queryKey: ['registrations'] })
    } catch {
      toast.error("Hủy đăng ký thất bại")
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-10">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Quản lý đăng ký</h1>
          <p className="text-sm text-slate-500">Theo dõi và quản lý danh sách người tham gia.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none active:scale-95 transition-transform" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" /> Xuất CSV
          </Button>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 sm:gap-6">
        <Card className="border-none shadow-sm shadow-black/5 bg-background/50 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-4 sm:p-6 pb-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="w-full lg:flex-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block font-mono">Tìm kiếm người tham gia</label>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                  <Input placeholder="Tên, email hoặc MSSV..." className="pl-9 h-10 text-sm focus-visible:ring-red-500 transition-all" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }} />
                </div>
              </div>
              <div className="w-full lg:w-64">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block font-mono">Sự kiện</label>
                <Select value={selectedEventId} onValueChange={(v) => { setSelectedEventId(v); setPage(1) }}>
                  <SelectTrigger className="h-10 text-sm focus:ring-red-500 transition-all">
                    <SelectValue placeholder="Tất cả sự kiện" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả sự kiện</SelectItem>
                    {events.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full lg:w-48">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block font-mono">Trạng thái</label>
                <Select value={selectedStatus} onValueChange={(v) => { setSelectedStatus(v); setPage(1) }}>
                  <SelectTrigger className="h-10 text-sm focus:ring-red-500 transition-all">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="checked_in">Đã điểm danh</SelectItem>
                    <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                    <SelectItem value="pending">Đang chờ</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end self-end sm:self-auto sm:mt-0">
                <Button variant="ghost" className="h-10 text-xs px-2 sm:px-4 hover:bg-slate-100 transition-colors" onClick={handleReset}>
                  <Filter className="mr-2 h-3.5 w-3.5" /> Đặt lại
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm overflow-hidden">
          <CardContent className="p-0 text-sans">
            {isLoading ? (
              <div className="h-32 flex items-center justify-center text-slate-400 italic text-sm">Đang tải dữ liệu...</div>
            ) : (
              <Table>
                <TableHeader className="hidden sm:table-header-group bg-slate-50/50">
                  <TableRow>
                    <TableHead className="px-6 py-4">Người tham gia</TableHead>
                    <TableHead className="hidden md:table-cell">Sự kiện</TableHead>
                    <TableHead className="hidden lg:table-cell">Ngày đăng ký</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right px-6">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {pagedData.length > 0 ? pagedData.map((reg: Registration) => (
                      <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={reg.id} className="group flex flex-col sm:table-row p-4 sm:p-0 border-b last:border-0 sm:border-b relative hover:bg-slate-50/55 transition-colors">
                        <TableCell className="p-0 sm:px-6 sm:py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 font-bold text-xs shrink-0 group-hover:scale-110 transition-transform">
                              {reg.userName.charAt(0)}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-sm sm:text-base text-slate-900 group-hover:text-red-600 transition-colors truncate">{reg.userName}</span>
                              <span className="text-[11px] sm:text-xs text-slate-500 truncate">{reg.userEmail}</span>
                              <div className="sm:hidden mt-2 flex flex-col gap-1">
                                <span className="text-[11px] font-medium text-slate-700">Sự kiện: {reg.eventName}</span>
                                <span className="text-[10px] text-slate-400 font-mono">Ngày: {new Date(reg.registrationDate).toLocaleDateString('vi-VN')}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm font-medium text-slate-700 truncate max-w-[200px] block">{reg.eventName}</span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-sm text-slate-500 font-mono">{new Date(reg.registrationDate).toLocaleDateString('vi-VN')}</span>
                        </TableCell>
                        <TableCell className="p-0 sm:p-4 mt-3 sm:mt-0 absolute top-4 right-14 sm:relative sm:top-auto sm:right-auto">
                          <Badge variant="outline" className={cn(getStatusBadgeStyle(reg.status), "rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-tight")}>
                            {getStatusIcon(reg.status)}
                            {reg.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right p-0 sm:px-6 absolute top-4 right-4 sm:relative sm:top-auto sm:right-auto leading-none">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-slate-200/50">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => handleCancel(reg.id)}
                                disabled={reg.status === 'ĐÃ HỦY'}
                                className="text-red-500 focus:text-red-500 cursor-pointer font-medium"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Hủy đăng ký
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
                </TableBody>
              </Table>
            )}
          </CardContent>
          <PaginationBar
            page={page}
            totalPages={totalPages}
            total={filteredData.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </Card>
      </motion.div>
    </motion.div>
  )
}
