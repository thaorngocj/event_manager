"use client"

import React, { useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, MapPin, CheckCircle2, Search, Download, Upload, History, BarChart3, FileSpreadsheet, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useEventQuery } from "@/hooks/use-events-api"
import { useEventRegistrations } from "@/hooks/use-registrations-api"
import { apiClient } from "@/lib/api-client"
import { statisticsService } from "@/services/statistics.service"
import { eventService } from "@/services/event.service"
import { toast } from "sonner"

interface ImportHistoryItem {
  id: number
  fileName: string
  importedAt: string
  successCount: number
  failedCount: number
  totalRows: number
}

interface EventStats {
  totalRegistrations?: number
  totalCheckins?: number
  checkinRate?: number
  [key: string]: unknown
}

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [search, setSearch] = useState("")
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importHistory, setImportHistory] = useState<ImportHistoryItem[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [eventStats, setEventStats] = useState<EventStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const [activeTab, setActiveTab] = useState<'registrations' | 'import' | 'stats'>('registrations')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const res = await apiClient.get(`/events/${id}/export`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `Event_${id}_Participants.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Xuất file thất bại. Vui lòng thử lại.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async () => {
    if (!importFile) return
    setIsImporting(true)
    try {
      const result = await eventService.importAttendees(id, importFile)
      toast.success(`Import thành công: ${(result as Record<string, unknown>)?.successCount ?? 0} bản ghi`)
      setImportFile(null)
      loadImportHistory()
    } catch {
      toast.error('Import thất bại. Vui lòng kiểm tra file Excel.')
    } finally {
      setIsImporting(false)
    }
  }

  const loadImportHistory = async () => {
    setLoadingHistory(true)
    try {
      const data = await eventService.getImportHistory(id)
      setImportHistory(Array.isArray(data) ? data : (data?.data ?? []))
    } catch {
      setImportHistory([])
    } finally {
      setLoadingHistory(false)
      setHistoryLoaded(true)
    }
  }

  const loadStats = async () => {
    setLoadingStats(true)
    try {
      const data = await statisticsService.getEventStats(id)
      setEventStats(data as EventStats)
    } catch {
      setEventStats(null)
    } finally {
      setLoadingStats(false)
    }
  }

  const handleTabChange = (tab: 'registrations' | 'import' | 'stats') => {
    setActiveTab(tab)
    if (tab === 'import' && !historyLoaded) loadImportHistory()
    if (tab === 'stats' && !eventStats && !loadingStats) loadStats()
  }

  const { data: event, isLoading: loadingEvent } = useEventQuery(id)
  const { data: registrations = [], isLoading: loadingRegs } = useEventRegistrations(id)

  const checkedIn = registrations.filter(r => r.status === 'ĐÃ ĐIỂM DANH')
  const completionRate = event && event.capacity > 0 ? Math.round((event.registeredCount / event.capacity) * 100) : 0
  const checkInRate = event && event.registeredCount > 0 ? Math.round((checkedIn.length / event.registeredCount) * 100) : 0

  const filteredRegs = registrations.filter(r =>
    r.userName.toLowerCase().includes(search.toLowerCase()) ||
    r.studentId.toLowerCase().includes(search.toLowerCase())
  )

  if (loadingEvent) {
    return <div className="flex items-center justify-center h-[400px] text-slate-400 italic">Đang tải...</div>
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] gap-4">
        <p className="text-slate-500">Không tìm thấy sự kiện</p>
        <Button onClick={() => router.push("/dashboard")}>Quay lại tổng quan</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 sm:h-9 sm:w-9">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight truncate">{event.title}</h1>
          <p className="text-xs sm:text-sm text-slate-500 truncate">Chi tiết lượt đăng ký và điểm danh thực tế</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng đăng ký</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold">{event.registeredCount} / {event.capacity}</div>
            <Progress value={completionRate} className="h-1.5 sm:h-2 mt-3 sm:mt-4 bg-slate-100 rounded-full" indicatorClassName="bg-indigo-600" />
            <p className="text-[9px] sm:text-[10px] text-slate-400 mt-2 font-semibold uppercase">{completionRate}% HOÀN THÀNH</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Đã điểm danh</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold text-emerald-600">{checkedIn.length} người</div>
            <Progress value={checkInRate} className="h-1.5 sm:h-2 mt-3 sm:mt-4 bg-slate-100 rounded-full" indicatorClassName="bg-emerald-500" />
            <p className="text-[9px] sm:text-[10px] text-slate-400 mt-2 font-semibold uppercase">{checkInRate}% TỶ LỆ ĐIỂM DANH</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Thông tin chung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 pt-1 sm:pt-2 px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
              <span className="font-medium text-slate-700">{event.status}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { key: 'registrations', label: 'Danh sách', icon: CheckCircle2 },
          { key: 'import', label: 'Import', icon: Upload },
          { key: 'stats', label: 'Thống kê', icon: BarChart3 },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key as 'registrations' | 'import' | 'stats')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Danh sách đăng ký */}
      {activeTab === 'registrations' && (
        <Card className="bg-white shadow-sm overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6">
            <div>
              <CardTitle className="text-lg sm:text-xl">Danh sách người tham gia</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Hiển thị tất cả những người đã đăng ký.</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input className="pl-9 h-9 text-sm" placeholder="Tìm MSSV hoặc tên..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting} className="h-9 px-3 shrink-0">
                <Download className="h-4 w-4 mr-1.5" />
                {isExporting ? 'Đang xuất...' : 'Excel'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            {loadingRegs ? (
              <div className="h-32 flex items-center justify-center text-slate-400 italic text-sm">Đang tải...</div>
            ) : (
              <div className="sm:rounded-md sm:border overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="px-4 sm:px-6">Họ và tên</TableHead>
                      <TableHead>MSSV</TableHead>
                      <TableHead className="hidden sm:table-cell">Email</TableHead>
                      <TableHead className="hidden md:table-cell">Ngày đăng ký</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegs.length > 0 ? filteredRegs.map(reg => (
                      <TableRow key={reg.id} className="hover:bg-slate-50/55 transition-colors">
                        <TableCell className="px-4 sm:px-6 font-semibold text-sm text-slate-900">{reg.userName}</TableCell>
                        <TableCell className="font-mono text-xs text-slate-500">{reg.studentId}</TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-slate-500">{reg.userEmail}</TableCell>
                        <TableCell className="hidden md:table-cell font-mono text-xs text-slate-500">
                          {new Date(reg.registrationDate).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          {reg.status === 'ĐÃ ĐIỂM DANH' ? (
                            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 text-[10px] rounded-full px-2">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Có mặt
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] rounded-full px-2">{reg.status}</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-slate-400 italic text-sm">Chưa có người tham gia.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab: Import */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileSpreadsheet className="h-5 w-5 text-indigo-600" /> Import danh sách tham dự</CardTitle>
              <CardDescription>Upload file Excel để import danh sách sinh viên tham dự sự kiện này.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={e => setImportFile(e.target.files?.[0] ?? null)} />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
              >
                {importFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileSpreadsheet className="h-6 w-6 text-indigo-600" />
                    <span className="text-sm font-semibold text-slate-700">{importFile.name}</span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setImportFile(null) }} className="text-slate-400 hover:text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-500">Click để chọn file Excel (.xlsx, .xls)</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button onClick={handleImport} disabled={!importFile || isImporting} className="bg-indigo-600 hover:bg-indigo-700">
                  {isImporting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang import...</> : <><Upload className="h-4 w-4 mr-2" /> Import</>}
                </Button>
                <Button variant="outline" onClick={() => eventService.downloadImportTemplate()} className="text-slate-600">
                  <Download className="h-4 w-4 mr-2" /> Tải mẫu Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><History className="h-5 w-5 text-slate-500" /> Lịch sử import</CardTitle>
                <CardDescription>Danh sách các lần import trước đó.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={loadImportHistory} disabled={loadingHistory}>
                {loadingHistory ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Làm mới'}
              </Button>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="h-24 flex items-center justify-center text-slate-400 italic text-sm">Đang tải...</div>
              ) : importHistory.length === 0 ? (
                <div className="h-24 flex items-center justify-center text-slate-400 italic text-sm">Chưa có lịch sử import.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File</TableHead>
                      <TableHead>Ngày import</TableHead>
                      <TableHead className="text-center">Thành công</TableHead>
                      <TableHead className="text-center">Lỗi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importHistory.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-sm">{item.fileName}</TableCell>
                        <TableCell className="text-xs text-slate-500">{new Date(item.importedAt).toLocaleString('vi-VN')}</TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-emerald-50 text-emerald-700 border-none text-[10px]">{item.successCount}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`border-none text-[10px] ${item.failedCount > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>{item.failedCount}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Thống kê */}
      {activeTab === 'stats' && (
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-indigo-600" /> Thống kê chi tiết sự kiện</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <div className="h-32 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : !eventStats ? (
              <div className="h-32 flex flex-col items-center justify-center gap-3 text-slate-400">
                <p className="italic text-sm">Không có dữ liệu thống kê.</p>
                <Button variant="outline" size="sm" onClick={loadStats}>Tải lại</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(eventStats)
                  .filter(([k]) => !['id', 'eventId', 'title'].includes(k))
                  .map(([key, value]) => (
                    <div key={key} className="bg-slate-50 rounded-xl p-4 space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="text-2xl font-bold text-slate-900">{typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(1)) : String(value ?? '-')}</p>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
