'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/Logo'
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsLoading(true)
    setError(null)
    try {
      await authService.forgotPassword(email)
      setSuccess(true)
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.')
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
              <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Quên mật khẩu</h1>
              <p className="text-sm text-slate-500 font-medium">
                Nhập email để nhận hướng dẫn đặt lại mật khẩu
              </p>
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
                  <p className="font-black text-slate-900 uppercase tracking-tight">Email đã được gửi!</p>
                  <p className="text-sm text-slate-500 mt-2">
                    Nếu email <strong>{email}</strong> tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.
                  </p>
                </div>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-sm text-sm uppercase tracking-widest transition-all active:scale-95"
                >
                  Quay lại đăng nhập
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 text-left">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-600">{error}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-500">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="vd. user@va.edu.vn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 bg-slate-50 border-slate-100 rounded-sm text-sm font-medium"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-bold py-4 rounded-sm text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isLoading ? 'Đang gửi...' : 'Gửi hướng dẫn'}
                </button>

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors font-bold uppercase tracking-widest text-[10px]"
                >
                  <ArrowLeft className="h-3 w-3" /> Quay lại đăng nhập
                </Link>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
