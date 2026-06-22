'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useRegistrations } from '@/context/RegistrationsContext'
import { apiClient } from '@/lib/api-client'
import { UserRole } from '@/types'
import { CheckCircle2, XCircle, Loader2, QrCode, ShieldCheck, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

function ConfirmContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const { reload } = useRegistrations()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const regId = searchParams.get('regId')
  const eventId = searchParams.get('eventId')
  const userId = searchParams.get('userId')
  const eventName = searchParams.get('event') || 'Sự kiện'

  const isManager =
    user?.role === UserRole.EVENT_MANAGER ||
    user?.role === UserRole.ADMIN

  const handleCheckin = async () => {
    if (!regId || !eventId || !userId) return
    setStatus('loading')
    try {
      const qrData = JSON.stringify({
        userId: parseInt(userId),
        registrationId: parseInt(regId),
      })
      await apiClient.post(`/registrations/events/${eventId}/checkin`, { qrData })
      setStatus('success')
      setMessage('Điểm danh thành công!')
      // Reload portal registrations context
      reload().catch(() => {})
    } catch (err: unknown) {
      setStatus('error')
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setMessage(msg || 'Điểm danh thất bại. Vui lòng thử lại.')
    }
  }

  if (!isManager) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center space-y-4 max-w-sm">
          <XCircle className="h-16 w-16 text-red-400 mx-auto" />
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Không có quyền</h2>
          <p className="text-sm text-slate-500 font-medium">
            Chỉ Event Manager hoặc Admin mới có thể điểm danh.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e3a5f] to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-[#1e3a5f] p-8 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <QrCode className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic">
            ĐIỂM DANH
          </h1>
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">
            Xác nhận tham dự sự kiện
          </p>
        </div>

        {/* Event info */}
        <div className="p-6 border-b border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sự kiện</p>
          <p className="text-base font-black text-slate-900 italic uppercase tracking-tight leading-tight">
            {eventName}
          </p>
          <div className="mt-3 flex gap-3">
            <div className="flex-1 bg-slate-50 rounded-xl p-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mã đăng ký</p>
              <p className="text-sm font-black text-slate-900 font-mono">#{regId}</p>
            </div>
            <div className="flex-1 bg-slate-50 rounded-xl p-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mã SV</p>
              <p className="text-sm font-black text-slate-900 font-mono">#{userId}</p>
            </div>
          </div>
        </div>

        {/* Action / Result */}
        <div className="p-6">
          {status === 'idle' && (
            <Button
              onClick={handleCheckin}
              className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-red-900/30 transition-all active:scale-95"
            >
              <ShieldCheck className="h-5 w-5 mr-2" />
              Xác nhận điểm danh
            </Button>
          )}

          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <Loader2 className="h-10 w-10 text-red-600 animate-spin" />
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Đang xử lý...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center text-center py-4 gap-3 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-black text-emerald-700 uppercase tracking-tighter">ĐÃ ĐIỂM DANH</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{message}</p>
              </div>
              <div className="w-full bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mt-2">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                  Sinh viên đã được ghi nhận tham dự sự kiện này.
                </p>
              </div>
              <Button
                onClick={() => router.push('/checkin')}
                className="w-full h-12 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs mt-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quét sinh viên tiếp theo
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center text-center py-4 gap-3">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
              <div>
                <p className="text-lg font-black text-red-700 uppercase tracking-tighter">THẤT BẠI</p>
                <p className="text-xs text-slate-500 font-bold mt-1">{message}</p>
              </div>
              <Button
                onClick={() => setStatus('idle')}
                variant="outline"
                className="w-full rounded-xl font-black uppercase tracking-widest text-xs h-11 border-slate-200"
              >
                Thử lại
              </Button>
            </div>
          )}
        </div>

        <div className="px-6 pb-6">
          <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest">
            Điểm danh bởi: {user?.displayName || user?.email}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function CheckinConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="h-10 w-10 text-white animate-spin" />
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  )
}
