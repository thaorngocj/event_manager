"use client"

import { useState } from "react"
import { useAuthStore } from "@/store/use-auth-store"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { motion } from "motion/react"
import { User, Shield, Key, Mail, Lock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  SUPER_ADMIN:   { label: "Super Admin", color: "bg-red-100 text-red-700" },
  ADMIN:         { label: "Admin",       color: "bg-purple-100 text-purple-700" },
  EVENT_MANAGER: { label: "Manager",     color: "bg-blue-100 text-blue-700" },
  STUDENT:       { label: "Student",     color: "bg-slate-100 text-slate-700" },
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const [tab, setTab] = useState<"info" | "password">("info")
  const [username, setUsername] = useState(user?.name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [saving, setSaving] = useState(false)
  const [resetEmail, setResetEmail] = useState(user?.email ?? "")
  const [sending, setSending] = useState(false)

  const roleInfo = ROLE_LABELS[user?.role ?? ""] ?? { label: user?.role ?? "", color: "bg-slate-100 text-slate-600" }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await apiClient.patch("/users/me", { username, email })
      toast.success("Cập nhật hồ sơ thành công!")
    } catch {
      toast.error("Cập nhật thất bại")
    } finally {
      setSaving(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!resetEmail) return toast.error("Vui lòng nhập email")
    setSending(true)
    try {
      await apiClient.post("/auth/forgot-password", { email: resetEmail })
      toast.success("Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư!")
    } catch {
      toast.error("Gửi email thất bại")
    } finally {
      setSending(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-6 pb-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Hồ sơ cá nhân</h1>
        <p className="text-sm text-slate-500">Quản lý thông tin tài khoản của bạn.</p>
      </div>

      {/* Avatar + Role */}
      <Card className="bg-white shadow-sm">
        <CardContent className="pt-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <div className="space-y-1.5">
            <p className="text-lg font-bold text-slate-900">{user?.name}</p>
            <p className="text-sm text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />{user?.email}
            </p>
            <Badge className={`text-[10px] font-bold uppercase tracking-tight rounded-full ${roleInfo.color}`}>
              <Shield className="w-3 h-3 mr-1" />{roleInfo.label}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Custom Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setTab("info")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === "info" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <User className="w-4 h-4" /> Thông tin cá nhân
        </button>
        <button
          onClick={() => setTab("password")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === "password" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Key className="w-4 h-4" /> Đổi mật khẩu
        </button>
      </div>

      {/* Tab: Thông tin */}
      {tab === "info" && (
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Thông tin cá nhân</CardTitle>
            <CardDescription>Cập nhật tên hiển thị và email tài khoản.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Họ và tên</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Nguyễn Văn A" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@school.edu" />
            </div>
            <div className="space-y-2">
              <Label>Vai trò</Label>
              <div className="h-10 px-3 flex items-center border rounded-md bg-slate-50 text-sm font-medium text-slate-500">
                {roleInfo.label}
              </div>
              <p className="text-[11px] text-slate-400">Vai trò không thể thay đổi tại đây.</p>
            </div>
            <Button onClick={handleSaveProfile} disabled={saving} className="w-full h-11">
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tab: Đổi mật khẩu */}
      {tab === "password" && (
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Đổi mật khẩu</CardTitle>
            <CardDescription>Nhập email để nhận link đặt lại mật khẩu qua hộp thư.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                Hệ thống sẽ gửi link đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư sau khi gửi yêu cầu.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Email tài khoản</Label>
              <Input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="email@school.edu" />
            </div>
            <Button onClick={handleForgotPassword} disabled={sending} className="w-full h-11 bg-red-600 hover:bg-red-700">
              {sending ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}
