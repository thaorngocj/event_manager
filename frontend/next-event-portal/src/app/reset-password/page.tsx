'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/Logo'
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { motion } from 'motion/react'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự.'); return }
    if (password !== confirm) { setError('Mật khẩu xác nhận không khớp.'); return }
    setIsLoading(true)
    setError(null)
    try {
      await authService.resetPassword(token, password)
      setSuccess(true)
    } catch {
      setError('Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070&auto=format&fit=crop")' }}
      />
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[500px] px-4"
      >
        <div className="bg-white rounded-sm shadow-2xl overflow-hidden">
          <div className="p-8 md:p-12 text-center space-y-8">
            <div className="flex flex-col items-center gap-4">
              <Logo variant="dark" />
              <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Đặt lại mật khẩu</h1>
            </div>

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="text-center">
                  <p className="font-black text-slate-900 uppercase tracking-tight">Thành công!</p>
                  <p className="text-sm text-slate-500 mt-2">Mật khẩu đã được đặt lại. Bạn có thể đăng nhập với mật khẩu mới.</p>
                </div>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-sm text-sm uppercase tracking-widest transition-all active:scale-95"
                >
                  Đăng nhập ngay
                </button>
              </motion.div>
            ) : !token ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <p className="font-black text-red-600 uppercase tracking-tight text-sm">Link không hợp lệ</p>
                <button
                  onClick={() => router.push('/forgot-password')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-sm text-sm uppercase tracking-widest"
                >
                  Yêu cầu lại
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 text-left">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-600">{error}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500">Mật khẩu mới</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input
                      type={showPw ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 bg-slate-50 border-slate-100 rounded-sm text-sm"
                      required
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500">Xác nhận mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="pl-10 pr-10 h-12 bg-slate-50 border-slate-100 rounded-sm text-sm"
                      required
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-bold py-4 rounded-sm text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-900"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
