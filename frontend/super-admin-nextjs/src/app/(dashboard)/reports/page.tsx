"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Share2, Activity, Users, TrendingUp, BarChart3, Trophy } from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts"
import { motion } from "motion/react"
import { useOverviewStats, useEventsByCategoryMonth, useRegistrationsByCategory, useTopStudents } from "@/hooks/use-stats-api"


const COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#f43f5e', '#10b981', '#f97316']

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function ReportsPage() {
  const [isMounted, setIsMounted] = useState(false)
  const { data: stats = { totalUsers: 0, totalEvents: 0, totalCheckins: 0, checkInRate: 0, totalRegistrations: 0 } } = useOverviewStats()
  const { data: categoryMonthRaw = [] } = useEventsByCategoryMonth()
  const { data: regsByCategoryRaw = [] } = useRegistrationsByCategory()
  const { data: topStudents = [] } = useTopStudents()

  const barData = categoryMonthRaw
  const pieData = regsByCategoryRaw

  useEffect(() => { setIsMounted(true) }, [])

  const metrics = [
    { label: "Tổng sinh viên", value: stats.totalUsers.toLocaleString(), change: "", icon: Users, color: "text-red-500" },
    { label: "Tổng sự kiện", value: String(stats.totalEvents), change: "", icon: BarChart3, color: "text-cyan-500" },
    { label: "Tổng lượt điểm danh", value: String(stats.totalCheckins), change: "", icon: Activity, color: "text-rose-500" },
    { label: "Tỷ lệ điểm danh TB", value: `${stats.checkInRate}%`, change: "", icon: TrendingUp, color: "text-emerald-500" },
  ]

  const handleDownloadReport = () => {
    const reportDate = new Date().toLocaleDateString('vi-VN')
    let content = `BÁO CÁO HIỆU QUẢ SỰ KIỆN - ${reportDate}\n`
    content += `==========================================\n\n`
    content += `1. CHỈ SỐ HIỆU SUẤT\n-------------------\n`
    content += `- Tổng sinh viên: ${stats.totalUsers.toLocaleString()}\n`
    content += `- Tổng sự kiện: ${stats.totalEvents}\n`
    content += `- Tổng lượt điểm danh: ${stats.totalCheckins}\n`
    content += `- Tỷ lệ điểm danh trung bình: ${stats.checkInRate}%\n\n`
    content += `2. SỰ KIỆN THEO THÁNG\n---------------------------------\n`
    barData.forEach((d: Record<string, unknown>) => { content += `${d.name}: ${d.count ?? 0} sự kiện\n` })
    content += `\n3. PHÂN BỔ ĐĂNG KÝ THEO DANH MỤC\n--------------------------------\n`
    pieData.forEach((d: Record<string, unknown>) => { content += `${d.name}: ${d.value} lượt đăng ký\n` })
    content += `\n\n--- Hết báo cáo ---`

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `bao-cao-thong-ke-${new Date().toISOString().split('T')[0]}.txt`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-10">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Báo cáo & Thống kê</h1>
          <p className="text-sm text-slate-500">Phân tích chi tiết hiệu quả sự kiện.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none active:scale-95 transition-transform">
            <Share2 className="mr-2 h-4 w-4" /> Chia sẻ
          </Button>
          <Button size="sm" className="flex-1 sm:flex-none active:scale-95 transition-transform" onClick={handleDownloadReport}>
            <Download className="mr-2 h-4 w-4" /> Tải báo cáo
          </Button>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2 border-none shadow-sm shadow-black/5 bg-background/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Sự kiện theo tháng</CardTitle>
              <CardDescription>Số lượng sự kiện được tổ chức theo từng tháng.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} stroke="#94a3b8" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" name="Số sự kiện" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm shadow-black/5 bg-background/50 backdrop-blur-sm overflow-hidden">
          <CardHeader>
            <CardTitle>Phân bổ đăng ký</CardTitle>
            <CardDescription>Phân chia theo danh mục sự kiện.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-center">
            <div className="h-[350px] w-full">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" align="center" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-sm shadow-black/5 bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Chỉ số Hiệu suất</CardTitle>
            <CardDescription>Các chỉ số chính so với kỳ trước.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 pb-4">
              {metrics.map((metric, i) => (
                <div key={i} className="space-y-2 p-4 rounded-2xl bg-white/50 border border-white hover:bg-white transition-colors group">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{metric.label}</p>
                    <metric.icon className={`w-4 h-4 ${metric.color} group-hover:scale-110 transition-transform`} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{metric.value}</p>
                  <p className={`text-[10px] ${metric.change.startsWith('+') ? 'text-emerald-600' : 'text-rose-500'} font-bold flex items-center`}>
                    {metric.change} <span className="text-slate-400 font-medium ml-1.5 uppercase tracking-tighter">so với kỳ trước</span>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-sm shadow-black/5 bg-background/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" /> Top Sinh viên tích cực
              </CardTitle>
              <CardDescription>Sinh viên tham gia nhiều sự kiện nhất.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {topStudents.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-8">Chưa có dữ liệu.</p>
            ) : (
              <div className="space-y-3">
                {topStudents.slice(0, 10).map((s: Record<string, unknown>, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/50 hover:bg-white transition-colors">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-slate-300 text-white' : i === 2 ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{String(s.username ?? s.name ?? s.email ?? 'N/A')}</p>
                      <p className="text-xs text-slate-400 truncate">{String(s.email ?? s.mssv ?? '')}</p>
                    </div>
                    <span className="text-sm font-black text-red-600 shrink-0">{Number(s.eventCount ?? s.count ?? s.totalEvents ?? 0)} sự kiện</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
