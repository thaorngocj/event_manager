"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Calendar, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "motion/react"
import { useEventsQuery } from "@/hooks/use-events-api"

const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
const MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12']

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null
  const parts = dateStr.split('/')
  if (parts.length === 3) return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]))
  return new Date(dateStr)
}

export default function CalendarPage() {
  const router = useRouter()
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const { data: eventsResult, isLoading } = useEventsQuery()
  const events = eventsResult?.data ?? []

  const eventsByDate = useMemo(() => {
    const map: Record<string, typeof events> = {}
    events.forEach(e => {
      const d = parseDate(e.date)
      if (!d) return
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      if (!map[key]) map[key] = []
      map[key].push(e)
    })
    return map
  }, [events])

  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const selectedEvents = selectedDate
    ? (() => {
        const d = new Date(selectedDate)
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
        return eventsByDate[key] ?? []
      })()
    : []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SẮP DIỄN RA': return 'bg-blue-500'
      case 'ĐANG DIỄN RA': return 'bg-emerald-500'
      case 'ĐÃ KẾT THÚC': return 'bg-slate-400'
      case 'ĐÃ HỦY': return 'bg-red-400'
      default: return 'bg-red-500'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-10"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Lịch sự kiện</h1>
          <p className="text-sm text-slate-500">Xem tất cả sự kiện theo lịch.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">
                {MONTHS[currentMonth]} {currentYear}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest py-2">{d}</div>
              ))}
            </div>
            {/* Cells */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const key = `${currentYear}-${currentMonth}-${day}`
                const dayEvents = eventsByDate[key] ?? []
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
                const isToday = today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === day
                const isSelected = selectedDate === dateStr

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`
                      relative min-h-[52px] p-1 rounded-lg text-left transition-all
                      ${isSelected ? 'bg-red-50 ring-2 ring-red-500' : 'hover:bg-slate-50'}
                      ${isToday ? 'ring-1 ring-red-300' : ''}
                    `}
                  >
                    <span className={`text-xs font-semibold block mb-1 ${isToday ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
                      {day}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      {dayEvents.slice(0, 2).map((e, idx) => (
                        <div key={idx} className={`h-1.5 rounded-full ${getStatusColor(e.status)}`} title={e.title} />
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[8px] text-slate-400 font-bold">+{dayEvents.length - 2}</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100">
              {[
                { label: 'Sắp diễn ra', color: 'bg-blue-500' },
                { label: 'Đang diễn ra', color: 'bg-emerald-500' },
                { label: 'Đã kết thúc', color: 'bg-slate-400' },
                { label: 'Đã hủy', color: 'bg-red-400' },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span className="text-[10px] font-medium text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Side panel */}
        <div className="space-y-4">
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {selectedDate
                  ? new Date(selectedDate).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })
                  : 'Chọn ngày để xem'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-slate-400 italic">Đang tải...</p>
              ) : !selectedDate ? (
                <p className="text-sm text-slate-400 italic">Click vào ngày trên lịch để xem sự kiện.</p>
              ) : selectedEvents.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Không có sự kiện nào ngày này.</p>
              ) : (
                <div className="space-y-3">
                  {selectedEvents.map(e => (
                    <div
                      key={e.id}
                      onClick={() => router.push(`/events/${e.id}`)}
                      className="p-3 rounded-lg border border-slate-100 hover:border-red-200 hover:bg-red-50/30 cursor-pointer transition-all"
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${getStatusColor(e.status)}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{e.title}</p>
                          {e.location && (
                            <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                              <MapPin className="h-2.5 w-2.5" /> {e.location}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 rounded-full">{e.status}</Badge>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Users className="h-2.5 w-2.5" /> {e.registeredCount}/{e.capacity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* This month summary */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Tháng này
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const thisMonthEvents = events.filter(e => {
                  const d = parseDate(e.date)
                  return d && d.getFullYear() === currentYear && d.getMonth() === currentMonth
                })
                return (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-slate-900">{thisMonthEvents.length}</p>
                      <p className="text-[10px] text-slate-500 font-medium uppercase">Tổng sự kiện</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-emerald-700">{thisMonthEvents.filter(e => e.status === 'ĐANG DIỄN RA').length}</p>
                      <p className="text-[10px] text-emerald-600 font-medium uppercase">Đang diễn ra</p>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
