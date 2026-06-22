"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Calendar, Activity, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
} from "recharts"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { motion } from "motion/react"
import { useOverviewStats, useActivities } from "@/hooks/use-stats-api"
import { useEventsQuery } from "@/hooks/use-events-api"
import { useAllRegistrationsQuery } from "@/hooks/use-registrations-api"

const CHART_COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#6366f1", "#ec4899"]

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function DashboardPage() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  const { data: stats = { totalUsers: 0, totalEvents: 0, totalCheckins: 0, checkInRate: 0, totalRegistrations: 0 } } = useOverviewStats()
  const { data: eventsResult } = useEventsQuery()
  const events = eventsResult?.data ?? []
  const { data: activities = [] } = useActivities(20)
  const { data: registrations = [] } = useAllRegistrationsQuery(events)

  useEffect(() => { setIsMounted(true) }, [])

  // Build daily registration trend for current month
  const trendData = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const countByDay: Record<number, number> = {}
    registrations.forEach(r => {
      const d = new Date(r.registrationDate)
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate()
        countByDay[day] = (countByDay[day] ?? 0) + 1
      }
    })
    return Array.from({ length: daysInMonth }, (_, i) => ({
      name: `${i + 1}`,
      registrations: countByDay[i + 1] ?? 0,
    }))
  }, [registrations])

  // Build event breakdown from real data (top 5)
  const eventBreakdown = events.slice(0, 5).map((e, idx) => ({
    id: e.id,
    name: e.title,
    registered: e.registeredCount,
    capacity: e.capacity,
    color: CHART_COLORS[idx % CHART_COLORS.length],
  }))

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tổng quan hệ thống</h1>
        <div className="flex items-center gap-2">
          <Card className="px-3 py-1 flex items-center gap-2 text-xs border-none shadow-none bg-muted/50">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Hệ thống đang hoạt động
          </Card>
        </div>
      </div>

      <motion.div variants={container} className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <motion.div variants={item}>
          <Card className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng hệ thống User</CardTitle>
              <Users className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-slate-900">{stats.totalUsers.toLocaleString()}</span>
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> 12%
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng số sự kiện</CardTitle>
              <Calendar className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-slate-900">{stats.totalEvents}</span>
                <span className="text-xs text-slate-400 font-medium">{stats.totalRegistrations} lượt đăng ký</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item} className="col-span-2 lg:col-span-1">
          <Card className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tỷ lệ điểm danh TB</CardTitle>
              <Activity className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-slate-900">{stats.checkInRate}%</span>
                <span className="text-xs text-amber-600 font-medium">Cao</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <motion.div variants={item} className="lg:col-span-4 h-full">
          <Card className="bg-white shadow-sm overflow-hidden flex flex-col min-w-0 h-full">
            <CardHeader>
              <CardTitle>Xu hướng đăng ký</CardTitle>
              <CardDescription>Khối lượng đăng ký hàng ngày trong tháng hiện tại.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px]">
              <div className="h-full w-full min-h-[300px]">
                {isMounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                      <Area type="monotone" dataKey="registrations" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorReg)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="lg:col-span-3 h-full">
          <Card className="bg-white shadow-sm h-full flex flex-col">
            <CardHeader>
              <CardTitle>Hoạt động gần đây</CardTitle>
              <CardDescription>Các hành động quản trị và tạo sự kiện mới.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.slice(0, 5).map((activity: { user: string; action: string; time: string; date: string }, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                      {String(activity.user || 'N/A').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.user}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.action}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono shrink-0">{activity.time}</span>
                  </div>
                ))}
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="w-full mt-4 text-xs">
                    Xem tất cả hoạt động
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Tất cả hoạt động</DialogTitle>
                    <DialogDescription>Hoạt động quản trị trong 7 ngày gần đây</DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-6 pt-4">
                      {activities.map((activity: { user: string; action: string; time: string; date: string }, i: number) => (
                        <div key={i} className="flex items-start gap-3 relative pb-6 border-l-2 border-muted ml-4 pl-6 last:pb-0 last:border-0 overflow-visible">
                          <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-background border-2 border-primary flex items-center justify-center z-10 shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          </div>
                          <div className="flex-1 min-w-0 -mt-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-900">{activity.user}</p>
                              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase">{activity.date}</span>
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{activity.action}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-2">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <motion.div variants={item}>
          <Card className="bg-white shadow-sm overflow-hidden flex flex-col min-w-0 h-full">
            <CardHeader>
              <CardTitle>Phân bổ lượt đăng ký theo sự kiện</CardTitle>
              <CardDescription>So sánh số lượng người tham gia giữa các sự kiện hiện tại.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px]">
              <div className="h-full w-full min-h-[300px]">
                {isMounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={eventBreakdown} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, width: 100 }} width={100} />
                      <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                      <Bar dataKey="registered" radius={[0, 4, 4, 0]} barSize={25}>
                        {eventBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-white shadow-sm h-full">
            <CardHeader>
              <CardTitle>Chi tiết tình trạng đăng ký</CardTitle>
              <CardDescription>Tiến độ lấp đầy chỗ trống cho từng sự kiện. Nhấp để xem chi tiết.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {eventBreakdown.map((event, i) => (
                  <div
                    key={event.id}
                    onClick={() => router.push(`/events/${event.id}`)}
                    className="space-y-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700 group-hover:text-red-600 transition-colors truncate max-w-[200px]">{event.name}</span>
                      <span className="text-slate-500 font-mono shrink-0">{event.registered} / {event.capacity}</span>
                    </div>
                    <Progress
                      value={event.capacity > 0 ? (event.registered / event.capacity) * 100 : 0}
                      className="h-2 bg-slate-100 rounded-full"
                      indicatorClassName={i % 2 === 0 ? "bg-red-600" : "bg-emerald-500"}
                    />
                    <div className="flex justify-end">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        {event.capacity > 0 ? Math.round((event.registered / event.capacity) * 100) : 0}% Hoàn thành
                      </span>
                    </div>
                  </div>
                ))}
                {eventBreakdown.length === 0 && (
                  <p className="text-center text-slate-400 text-sm py-8">Chưa có sự kiện nào.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
