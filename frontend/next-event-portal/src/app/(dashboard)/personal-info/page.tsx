'use client'

import { useState } from 'react'
import { Mail, CheckCircle2, Save, Loader2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { UserRole } from '@/types'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { uploadService } from '@/services/upload.service'
import { userService } from '@/services/user.service'

export default function PersonalInfo() {
  const { t } = useLanguage()
  const { user } = useAuth()

  const isStudent = user?.role === UserRole.STUDENT
  const isAdmin = user?.role === UserRole.ADMIN

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [email, setEmail] = useState(user?.email || '')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isUploadingImg, setIsUploadingImg] = useState(false)

  const handleImageUpload = async (file: File) => {
    setIsUploadingImg(true)
    try {
      const url = await uploadService.uploadImage(file)
      setAvatarUrl(url)
      toast.success('Ảnh đại diện đã được cập nhật')
    } catch {
      toast.error('Tải ảnh lên thất bại')
    } finally {
      setIsUploadingImg(false)
    }
  }

  const handleImageRemove = () => {
    setAvatarUrl(null)
    toast.info('Đã xóa ảnh đại diện')
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await userService.updateProfile({
        username: displayName,
        email: email,
      })
      toast.success('Cập nhật thông tin thành công')
      setIsEditing(false)
    } catch {
      toast.error('Cập nhật thất bại. Vui lòng thử lại.')
    } finally {
      setIsSaving(false)
    }
  }

  const userInfo = [
    { label: 'Họ và tên', value: user?.displayName || '', field: 'name' },
    { label: 'MSSV', value: user?.schoolId || '—', field: null },
    { label: 'Địa chỉ Email', value: user?.email || '', field: 'email' },
    { label: 'Vai trò', value: user?.role || '', field: null },
    ...(isStudent ? [
      { label: 'Ngành học', value: user?.major || '—', field: null },
      { label: 'Khóa', value: user?.cohort || '—', field: null },
      { label: 'Lớp', value: user?.classId || '—', field: null },
      { label: 'Chức vụ Đoàn/Hội', value: user?.unionRole || '—', field: null },
      { label: 'Điểm rèn luyện', value: user?.trainingPoints != null ? String(user.trainingPoints) : '—', field: null },
    ] : []),
  ]

  return (
    <div className="space-y-8">
      {isStudent && (
        <div className="bg-white border-b border-slate-100 -mx-4 md:-mx-8 -mt-4 md:-mt-8 py-2 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest gap-2">
          <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-center md:text-left">
            <span>Trung tâm Hỗ trợ Sinh viên</span>
            <span>Phone: 028 7109 9218 (Ext: 3310/3311)</span>
          </div>
          <div className="flex gap-4">
            <span className="text-red-600 bg-red-50 px-3 py-1 rounded lowercase">{user?.displayName}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {!isAdmin && (
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-sm border border-slate-200 overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100">
                <Link href="/participated-events" className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors group">
                  <CheckCircle2 className="h-4 w-4 text-slate-400 group-hover:text-green-600" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-[#1e3a5f]">
                    {t('participationInEvent')}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className={cn(isAdmin ? "lg:col-span-4" : "lg:col-span-3")}>
          <div className="bg-white rounded-sm border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-[#1e3a5f] p-3 flex items-center justify-between">
              <h3 className="text-white text-[11px] font-black uppercase tracking-widest">
                {t('personalInfo')}
              </h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-white/60 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  Chỉnh sửa
                </button>
              ) : (
                <button
                  onClick={() => { setIsEditing(false); setDisplayName(user?.displayName || ''); setEmail(user?.email || '') }}
                  className="text-white/60 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  Hủy
                </button>
              )}
            </div>

            <div className="p-4 md:p-8 bg-slate-50/30 space-y-8">
              {/* Profile Image */}
              <div className="bg-white p-4 md:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="w-full md:w-1/3">
                  <ImageUpload
                    label={t('profilePicture')}
                    onUpload={handleImageUpload}
                    onRemove={handleImageRemove}
                    description={isUploadingImg ? 'Đang tải lên...' : t('uploadImage')}
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[#1e3a5f] text-[12px] font-black uppercase tracking-widest">{t('profilePicture')}</h4>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-sm">
                    {t('footerDesc')}
                  </p>
                  {avatarUrl && (
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">✓ Ảnh đã được cập nhật</p>
                  )}
                </div>
              </div>

              {/* Info fields */}
              <div className="bg-white p-4 md:p-8 border border-slate-100 space-y-4 shadow-sm">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-black uppercase tracking-widest text-[#1e3a5f]">Họ và tên</Label>
                      <Input
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        className="border-slate-200 rounded-sm bg-slate-50 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-black uppercase tracking-widest text-[#1e3a5f]">
                        <Mail className="h-3 w-3 inline mr-1" /> Địa chỉ Email
                      </Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="border-slate-200 rounded-sm bg-slate-50 h-11"
                      />
                    </div>
                    <div className="border border-slate-100 p-4 rounded-sm bg-slate-50/50">
                      <span className="text-[11px] font-black uppercase tracking-widest text-[#1e3a5f] block mb-1">MSSV</span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase">{user?.schoolId || '-'}</span>
                    </div>
                    {isStudent && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="border border-slate-100 p-4 rounded-sm bg-slate-50/50">
                          <span className="text-[11px] font-black uppercase tracking-widest text-[#1e3a5f] block mb-1">Lớp</span>
                          <span className="text-[11px] font-bold text-slate-400 uppercase">{user?.classId || '-'}</span>
                        </div>
                        <div className="border border-slate-100 p-4 rounded-sm bg-slate-50/50">
                          <span className="text-[11px] font-black uppercase tracking-widest text-[#1e3a5f] block mb-1">Điểm rèn luyện</span>
                          <span className="text-[11px] font-bold text-slate-400 uppercase">{user?.trainingPoints ?? '-'}</span>
                        </div>
                      </div>
                    )}
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-black uppercase tracking-widest text-[10px] h-11 rounded-sm"
                    >
                      {isSaving ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang lưu...</>
                      ) : (
                        <><Save className="h-4 w-4 mr-2" /> Lưu thay đổi</>
                      )}
                    </Button>
                  </div>
                ) : (
                  userInfo.map((info, index) => (
                    <div key={index} className="border border-slate-100 p-4 rounded-sm flex flex-col md:flex-row md:items-center bg-white shadow-sm gap-2 md:gap-0">
                      <span className="text-[#1e3a5f] text-[11px] font-black uppercase tracking-widest md:min-w-[200px] md:border-r md:border-slate-50 md:mr-6 shrink-0">
                        {info.label}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight break-all">
                        {info.value}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
