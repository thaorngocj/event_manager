'use client'

import { useRouter, useSearchParams } from 'next/navigation';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, FileEdit, Trash2, Check, ImagePlus, LayoutGrid, CalendarDays, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { Event, EventStatus, UserRole } from '@/types';
import { uploadService } from '@/services/upload.service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventsContext';
import { motion } from 'motion/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface BackendCalendarEvent {
  id: string | number;
  title: string;
  start: string;
  end: string;
  location: string;
  status: string;
  color: string;
  category: string;
}

interface Faculty {
  id: string;
  name: string;
}

export default function Events() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const { t, resolve } = useLanguage();
  const { user } = useAuth();
  const { events, deleteEvent, updateEvent, searchQuery, refreshEvents } = useEvents();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sync viewMode with URL query param ?tab=calendar
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'calendar') {
      setViewMode('calendar');
    }
  }, [searchParams]);

  const [newEvent, setNewEvent] = useState({
    title: '', description: '', location: '',
    date: '', endDate: '', time: '', capacity: '200',
    organizer: '', contactEmail: '', contactPhone: '',
    registrationDeadline: '', trainingPoints: '',
    semester: '', academicYear: '',
  });
  const [eventDisplayMode, setEventDisplayMode] = useState<'HERO' | 'FEATURED' | 'HIGHLIGHT' | 'NORMAL'>('FEATURED');
  const [eventCategory, setEventCategory] = useState('ACADEMIC');
  const [eventScale, setEventScale] = useState<string>('SCHOOL');
  const [isMandatory, setIsMandatory] = useState(false);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('none');
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});

  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState<BackendCalendarEvent[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);

  useEffect(() => {
    const now = new Date();
    apiClient.get('/events/calendar', {
      params: { year: now.getFullYear(), month: now.getMonth() + 1 },
    }).then(res => {
      if (res.data?.categoryColors) setCategoryColors(res.data.categoryColors);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    apiClient.get('/faculties').then(res => {
      const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      setFaculties(list.map((f: Record<string, unknown>) => ({ id: String(f.id), name: String(f.name) })));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (viewMode !== 'calendar') return;
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth() + 1;
    setCalendarLoading(true);
    apiClient.get('/events/calendar', { params: { year, month } })
      .then(res => {
        const data = res.data;
        setCalendarEvents(Array.isArray(data.events) ? data.events : []);
        if (data.categoryColors) setCategoryColors(data.categoryColors);
      })
      .catch(() => setCalendarEvents([]))
      .finally(() => setCalendarLoading(false));
  }, [viewMode, calendarDate]);

  const CATEGORY_VI: Record<string, string> = {
    ACADEMIC: 'Học thuật', CULTURE: 'Văn hóa', SPORT: 'Thể thao',
    COMMUNITY: 'Cộng đồng', NATIONAL: 'Quốc gia', SCHOOL: 'Nhà trường', SEMINAR: 'Hội thảo',
  };

  const getEventColor = (event: { color?: string; category?: string }): string => {
    if (event.color) return event.color;
    const cat = (event.category ?? '').toUpperCase();
    return categoryColors[cat] ?? categoryColors[event.category ?? ''] ?? '#1e4e79';
  };

  const handleImageFile = async (file: File) => {
    setImagePreview(URL.createObjectURL(file));
    setIsUploading(true);
    try {
      const url = await uploadService.uploadImage(file);
      setUploadedImageUrl(url);
    } catch {
      toast.error('Lỗi upload ảnh — ảnh sẽ không được lưu');
      setUploadedImageUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setNewEvent({
      title: '', description: '', location: '',
      date: '', endDate: '', time: '', capacity: '200',
      organizer: '', contactEmail: '', contactPhone: '',
      registrationDeadline: '', trainingPoints: '',
      semester: '', academicYear: '',
    });
    setImagePreview(null);
    setUploadedImageUrl(null);
    setEditingId(null);
    setEventDisplayMode('FEATURED');
    setEventCategory('ACADEMIC');
    setSelectedFacultyId('none');
    setIsMandatory(false);
    setEventScale('SCHOOL');
    setIsCreateOpen(false);
  };

  const handleEditClick = (event: Event) => {
    const getVal = (val: string | { EN: string; VI: string }) =>
      typeof val === 'string' ? val : val?.VI || val?.EN || '';
    const parseDateStr = (isoOrVN: string) => {
      if (!isoOrVN) return '';
      const parts = isoOrVN.split('/');
      if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      return isoOrVN.split('T')[0];
    };
    const parseTimeStr = (iso: string) => {
      if (!iso) return '';
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    setEditingId(event.id);
    setNewEvent({
      title: getVal(event.title),
      description: getVal(event.description),
      location: getVal(event.location),
      date: parseDateStr(event.date),
      endDate: event.endDate ? parseDateStr(event.endDate) : parseDateStr(event.date),
      time: parseTimeStr(event.startTime),
      capacity: String(event.capacity),
      organizer: event.organizer || '',
      contactEmail: event.contactEmail || '',
      contactPhone: event.contactPhone || '',
      registrationDeadline: event.registrationDeadline ? parseDateStr(event.registrationDeadline) : '',
      trainingPoints: event.trainingPoints ? String(event.trainingPoints) : '',
      semester: event.semester || '',
      academicYear: event.academicYear || '',
    });
    setImagePreview(event.image || null);
    setUploadedImageUrl(event.image || null);
    setEventDisplayMode((event.displayCategory ?? 'FEATURED') as 'HERO' | 'FEATURED' | 'HIGHLIGHT' | 'NORMAL');
    setEventCategory(event.category || 'ACADEMIC');
    setSelectedFacultyId(event.facultyId || 'none');
    setIsMandatory(event.isMandatory || false);
    setEventScale(event.scale || 'SCHOOL');
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async () => {
    if (!newEvent.title || !newEvent.location) {
      return toast.error('Vui lòng điền tối thiểu Tên và Địa điểm');
    }

    const startDate = newEvent.date
      ? `${newEvent.date}T${newEvent.time || '00:00'}:00.000Z`
      : new Date().toISOString();
    const endDate = newEvent.endDate
      ? `${newEvent.endDate}T23:59:00.000Z`
      : startDate;

    const payload: Record<string, unknown> = {
      title: newEvent.title,
      description: newEvent.description,
      location: newEvent.location,
      startDate,
      endDate,
      maxParticipants: parseInt(newEvent.capacity) || 200,
      displayCategory: eventDisplayMode,
      eventCategory: eventCategory,
      scale: eventScale,
      isMandatory,
      ...(uploadedImageUrl ? { imageUrl: uploadedImageUrl } : {}),
      ...(selectedFacultyId && selectedFacultyId !== 'none' ? { facultyId: parseInt(selectedFacultyId) } : {}),
      ...(newEvent.organizer ? { organizer: newEvent.organizer } : {}),
      ...(newEvent.contactEmail ? { contactEmail: newEvent.contactEmail } : {}),
      ...(newEvent.contactPhone ? { contactPhone: newEvent.contactPhone } : {}),
      ...(newEvent.registrationDeadline ? { registrationDeadline: `${newEvent.registrationDeadline}T23:59:00.000Z` } : {}),
      ...(newEvent.trainingPoints ? { trainingPoints: parseInt(newEvent.trainingPoints) } : {}),
      ...(newEvent.semester ? { semester: newEvent.semester } : {}),
      ...(newEvent.academicYear ? { academicYear: newEvent.academicYear } : {}),
    };

    setIsSubmitting(true);
    try {
      if (editingId) {
        await apiClient.patch(`/events/${editingId}`, payload);
        toast.success('Cập nhật sự kiện thành công!');
      } else {
        await apiClient.post('/events', payload);
        toast.success('Sự kiện đã được tạo thành công!');
      }
      await refreshEvents();
      resetForm();
    } catch {
      toast.error(editingId ? 'Lỗi khi cập nhật sự kiện' : 'Lỗi khi tạo sự kiện');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEventPast = (event: Event): boolean => {
    const dateStr = event.closingDate || event.date;
    if (!dateStr) return false;
    const end = new Date(dateStr);
    end.setHours(23, 59, 59, 999);
    return end < new Date();
  };

  const handleStatusChange = (event: Event, newStatus: EventStatus) => {
    if (isEventPast(event)) {
      toast.error('Sự kiện đã quá thời gian, không thể thay đổi trạng thái');
      return;
    }
    updateEvent(event.id, { status: newStatus });
  };

  const canCreate = user?.role === UserRole.ADMIN || user?.role === UserRole.EVENT_MANAGER;

  const filteredEvents = events.filter(e =>
    resolve(e.title).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calYear = calendarDate.getFullYear();
  const calMonth = calendarDate.getMonth();
  const monthNames = ["THÁNG 1","THÁNG 2","THÁNG 3","THÁNG 4","THÁNG 5","THÁNG 6","THÁNG 7","THÁNG 8","THÁNG 9","THÁNG 10","THÁNG 11","THÁNG 12"];
  const weekdays = ['Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy','Chủ Nhật'];
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (y: number, m: number) => { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; };
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const startOffset = getFirstDay(calYear, calMonth);
  const totalSlots = Math.ceil((daysInMonth + startOffset) / 7) * 7;
  const calendarDays = Array.from({ length: totalSlots }, (_, i) => { const d = i - startOffset + 1; return d > 0 && d <= daysInMonth ? d : null; });
  const isEventOnDay = (ev: BackendCalendarEvent, d: number) => {
    const s = new Date(ev.start); s.setHours(0,0,0,0);
    const e = new Date(ev.end); e.setHours(23,59,59,999);
    const cur = new Date(calYear, calMonth, d);
    return cur >= s && cur <= e;
  };
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const legendEntries = Object.entries(categoryColors).map(([cat, color]) => ({
    id: cat,
    label: CATEGORY_VI[cat] ?? (cat.charAt(0) + cat.slice(1).toLowerCase().replace(/_/g, ' ')),
    color,
  }));

  const statusOptions: { value: EventStatus; label: string; color: string }[] = [
    { value: EventStatus.OPEN, label: 'Đang mở', color: 'text-emerald-600' },
    { value: EventStatus.UPCOMING, label: 'Sắp tới', color: 'text-blue-600' },
    { value: EventStatus.CLOSED, label: 'Đã đóng', color: 'text-red-600' },
    { value: EventStatus.COMPLETED, label: 'Hoàn thành', color: 'text-slate-500' },
  ];

  const getStatusBadgeClass = (status: EventStatus) => {
    switch (status) {
      case EventStatus.OPEN: return 'bg-emerald-100 text-emerald-700';
      case EventStatus.UPCOMING: return 'bg-blue-100 text-blue-700';
      case EventStatus.CLOSED: return 'bg-red-100 text-red-700';
      case EventStatus.COMPLETED: return 'bg-slate-100 text-slate-600';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const getStatusLabel = (status: EventStatus) => statusOptions.find(o => o.value === status)?.label ?? status;

  return (
    <div className="space-y-12">
      {user?.role === UserRole.STUDENT && (
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

      <div className="text-center pt-4 md:pt-8 space-y-4 md:space-y-6">
        <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase">
          <span className="text-red-600">E</span>
          <span className="text-slate-900">vents Portal</span>
        </h2>

        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                viewMode === 'grid' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Sự kiện
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                viewMode === 'calendar' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Lịch sự kiện
            </button>
          </div>
        </div>

        {canCreate && viewMode === 'grid' && (
          <div className="flex justify-center">
            <Dialog open={isCreateOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsCreateOpen(true); }}>
              <DialogTrigger
                render={
                  <Button className="bg-red-600 hover:bg-red-700 font-bold uppercase tracking-widest text-xs h-11 px-8 rounded-lg shadow-lg shadow-red-900/20">
                    <Plus className="h-4 w-4 mr-2" />{t('createEvent')}
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-none shadow-2xl max-h-[95vh] flex flex-col">
                <DialogHeader className="p-6 sm:p-8 pb-0">
                  <DialogTitle className="text-2xl sm:text-3xl font-black italic tracking-tighter text-slate-900 uppercase">
                    {editingId ? 'CHỈNH SỬA SỰ KIỆN' : 'TẠO SỰ KIỆN MỚI'}
                  </DialogTitle>
                  <DialogDescription className="text-slate-500 font-medium italic text-xs sm:text-sm">
                    {editingId ? 'Cập nhật thông tin sự kiện.' : 'Nhập thông tin chi tiết để tạo sự kiện mới trên hệ thống.'}
                  </DialogDescription>
                </DialogHeader>

                <div className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">

                  {/* 1. Ảnh bìa */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">ẢNH BÌA SỰ KIỆN</Label>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }} />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f?.type.startsWith('image/')) handleImageFile(f); }}
                      className="border-2 border-dashed border-slate-100 rounded-2xl aspect-video bg-slate-50/50 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-100/50 transition-colors group relative overflow-hidden"
                    >
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white">
                            <ImagePlus className="w-8 h-8" />
                            <span className="text-[10px] font-black uppercase tracking-tighter">Thay đổi ảnh</span>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); setImagePreview(null); setUploadedImageUrl(null); }} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-20">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                            <ImagePlus className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div className="text-center">
                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-tighter text-slate-600">DRAG & DROP IMAGE</p>
                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-tighter text-red-500">OR BROWSE FILES</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 2. Tên sự kiện */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">TÊN SỰ KIỆN</Label>
                    <Input placeholder="VD: HỘI THẢO AI 2026" className="h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-red-500/20" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} />
                  </div>

                  {/* 3. Chi tiết */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">CHI TIẾT SỰ KIỆN</Label>
                    <Textarea placeholder="Nhập mô tả sự kiện..." className="min-h-[100px] sm:min-h-[120px] bg-slate-50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-red-500/20 transition-all focus:bg-white" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} />
                  </div>

                  {/* 4. Ngày bắt đầu / Ngày kết thúc */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">NGÀY BẮT ĐẦU</Label>
                      <Input type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} className="h-12 bg-slate-50 border-none rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">NGÀY KẾT THÚC</Label>
                      <Input type="date" value={newEvent.endDate} onChange={e => setNewEvent({ ...newEvent, endDate: e.target.value })} className="h-12 bg-slate-50 border-none rounded-xl" />
                    </div>
                  </div>

                  {/* 5. Giờ bắt đầu / Sức chứa */}
                  <div className="grid grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">GIỜ BẮT ĐẦU</Label>
                      <Input type="time" value={newEvent.time} onChange={e => setNewEvent({ ...newEvent, time: e.target.value })} className="h-12 bg-slate-50 border-none rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">SỨC CHỨA</Label>
                      <Input type="number" placeholder="200" value={newEvent.capacity} onChange={e => setNewEvent({ ...newEvent, capacity: e.target.value })} className="h-12 bg-slate-50 border-none rounded-xl" />
                    </div>
                  </div>

                  {/* 6. Địa điểm */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">ĐỊA ĐIỂM</Label>
                    <Input value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="VD: Hội trường A" className="h-12 bg-slate-50 border-none rounded-xl" />
                  </div>

                  {/* 7. Hiển thị homepage / Thể loại / Khoa */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                        <Home className="inline w-3 h-3 mr-1 mb-0.5" />
                        HIỂN THỊ TRÊN HOMEPAGE
                      </Label>
                      <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                        {[
                          { value: 'FEATURED', label: 'SỰ KIỆN NỔI BẬT' },
                          { value: 'HIGHLIGHT', label: 'DANH MỤC SỰ KIỆN' },
                          { value: 'HERO', label: 'ẢNH NỀN TRANG CHỦ (HERO)' },
                          { value: 'NORMAL', label: 'BÌNH THƯỜNG (ẨN)' },
                        ].map(({ value, label }) => (
                          <button key={value} type="button" onClick={() => setEventDisplayMode(value as typeof eventDisplayMode)}
                            className={`w-full flex items-center justify-between px-4 py-3 text-[10px] font-bold transition-colors ${eventDisplayMode === value ? 'bg-slate-50 text-red-600' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                            {label}
                            {eventDisplayMode === value && <Check className="w-3 h-3 text-red-600" />}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">THỂ LOẠI SỰ KIỆN</Label>
                      <Select value={eventCategory} onValueChange={setEventCategory}>
                        <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-[11px] font-bold">
                          <SelectValue placeholder="Chọn thể loại" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            { value: 'ACADEMIC', label: 'Học thuật' },
                            { value: 'CULTURE', label: 'Văn hóa' },
                            { value: 'SPORT', label: 'Thể thao' },
                            { value: 'COMMUNITY', label: 'Cộng đồng' },
                            { value: 'NATIONAL', label: 'Quốc gia' },
                            { value: 'SCHOOL', label: 'Trường' },
                            { value: 'SEMINAR', label: 'Hội thảo' },
                          ].map(({ value, label }) => (
                            <SelectItem key={value} value={value} className="text-[11px] font-bold">{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {faculties.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">KHOA TỔ CHỨC</Label>
                        <Select value={selectedFacultyId} onValueChange={setSelectedFacultyId}>
                          <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-[11px] font-bold">
                            <SelectValue placeholder="Chọn khoa (tuỳ chọn)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none" className="text-[11px] font-bold text-slate-400">Không chọn</SelectItem>
                            {faculties.map(f => (
                              <SelectItem key={f.id} value={f.id} className="text-[11px] font-bold">{f.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* 8. Hạn đăng ký / Điểm rèn luyện */}
                  <div className="grid grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">HẠN ĐĂNG KÝ</Label>
                      <Input type="date" value={newEvent.registrationDeadline} onChange={e => setNewEvent({ ...newEvent, registrationDeadline: e.target.value })} className="h-12 bg-slate-50 border-none rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">ĐIỂM RÈN LUYỆN</Label>
                      <Input type="number" min="0" placeholder="0" value={newEvent.trainingPoints} onChange={e => setNewEvent({ ...newEvent, trainingPoints: e.target.value })} className="h-12 bg-slate-50 border-none rounded-xl" />
                    </div>
                  </div>

                  {/* 9. Quy mô / Bắt buộc */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">QUY MÔ SỰ KIỆN</Label>
                      <Select value={eventScale} onValueChange={setEventScale}>
                        <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-[11px] font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            { value: 'CLASS', label: 'Lớp học' },
                            { value: 'FACULTY', label: 'Khoa' },
                            { value: 'SCHOOL', label: 'Trường' },
                            { value: 'UNIVERSITY', label: 'Đại học' },
                            { value: 'NATIONAL', label: 'Quốc gia' },
                          ].map(({ value, label }) => (
                            <SelectItem key={value} value={value} className="text-[11px] font-bold">{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">BẮT BUỘC THAM DỰ</Label>
                      <button
                        type="button"
                        onClick={() => setIsMandatory(v => !v)}
                        className={`w-full h-12 rounded-xl flex items-center justify-between px-4 text-[11px] font-bold transition-colors ${isMandatory ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-50 text-slate-500 border border-transparent'}`}
                      >
                        {isMandatory ? 'BẮT BUỘC' : 'TỰ NGUYỆN'}
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-black transition-colors ${isMandatory ? 'bg-red-500' : 'bg-slate-300'}`}>
                          {isMandatory ? <Check className="w-3 h-3" /> : '○'}
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* 10. Ban tổ chức */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">BAN TỔ CHỨC / NGƯỜI LIÊN HỆ</Label>
                    <Input placeholder="VD: Ban sự kiện Khoa CNTT" value={newEvent.organizer} onChange={e => setNewEvent({ ...newEvent, organizer: e.target.value })} className="h-12 bg-slate-50 border-none rounded-xl" />
                  </div>

                  {/* 11. Email / SĐT */}
                  <div className="grid grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">EMAIL LIÊN HỆ</Label>
                      <Input type="email" placeholder="contact@va.edu.vn" value={newEvent.contactEmail} onChange={e => setNewEvent({ ...newEvent, contactEmail: e.target.value })} className="h-12 bg-slate-50 border-none rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">SỐ ĐIỆN THOẠI</Label>
                      <Input type="tel" placeholder="028 xxxx xxxx" value={newEvent.contactPhone} onChange={e => setNewEvent({ ...newEvent, contactPhone: e.target.value })} className="h-12 bg-slate-50 border-none rounded-xl" />
                    </div>
                  </div>

                  {/* 12. Học kỳ / Năm học */}
                  <div className="grid grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">HỌC KỲ</Label>
                      <Input placeholder="VD: HK1" value={newEvent.semester} onChange={e => setNewEvent({ ...newEvent, semester: e.target.value })} className="h-12 bg-slate-50 border-none rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">NĂM HỌC</Label>
                      <Input placeholder="VD: 2025-2026" value={newEvent.academicYear} onChange={e => setNewEvent({ ...newEvent, academicYear: e.target.value })} className="h-12 bg-slate-50 border-none rounded-xl" />
                    </div>
                  </div>

                </div>

                <div className="p-6 sm:p-8 pt-0 mt-auto">
                  <Button
                    onClick={handleCreateSubmit}
                    disabled={isUploading || isSubmitting}
                    type="button"
                    className="w-full h-12 sm:h-14 bg-slate-900 hover:bg-slate-800 text-white font-black italic uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-slate-200 text-xs sm:text-sm active:scale-95"
                  >
                    {isUploading ? 'Đang upload ảnh...' : isSubmitting ? 'Đang lưu...' : editingId ? 'LƯU THAY ĐỔI' : 'XÁC NHẬN & XUẤT BẢN SỰ KIỆN'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-2 h-2 rounded-full border-2 border-yellow-500"></div>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest italic">Đến VA và trải nghiệm những khoảnh khắc thú vị nhất!</p>
            <div className="h-[1px] w-48 bg-slate-100"></div>
          </div>
        )}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-x-8 gap-y-12 max-w-6xl mx-auto">
          {filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              whileHover={{ y: -5 }}
              onClick={() => router.push(`/events/${event.id}`)}
              className="group relative h-[380px] rounded-sm overflow-hidden shadow-2xl flex flex-col cursor-pointer"
            >
              <div className="flex-1 relative overflow-hidden" style={{ backgroundColor: getEventColor(event) }}>
                {event.image && (
                  <img
                    src={event.image}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                )}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none text-[9px] font-black tracking-widest uppercase px-3 py-1.5 shadow-xl">
                    {CATEGORY_VI[event.category?.toUpperCase() ?? ''] ?? event.category}
                  </Badge>
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm",
                    getStatusBadgeClass(event.status)
                  )}>
                    {getStatusLabel(event.status)}
                  </span>
                </div>
              </div>

              <div
                className="h-[120px] transition-colors p-6 flex flex-col justify-between relative"
                style={{ backgroundColor: getEventColor(event) }}
              >
                <div className="absolute inset-0 bg-black/30" />
                <h3 className="text-lg font-black text-white italic leading-tight line-clamp-1 uppercase tracking-tighter relative z-10 drop-shadow-sm">
                  {resolve(event.title)}
                </h3>
                <div className="flex justify-between items-end relative z-10">
                  <div className="space-y-1">
                    <div className="text-[11px] font-black text-white/90 uppercase tracking-widest drop-shadow-sm">
                      {event.startTime} - {event.date}
                    </div>
                  </div>
                  {canCreate ? (
                    <div className="flex gap-1 items-center">
                      <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
                        {([EventStatus.OPEN, EventStatus.CLOSED] as EventStatus[]).map(s => (
                          <button
                            key={s}
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(event, s); }}
                            title={getStatusLabel(s)}
                            className={cn(
                              "h-6 px-2 rounded text-[7px] font-black uppercase tracking-widest transition-all",
                              event.status === s
                                ? s === EventStatus.OPEN ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                                : "bg-white/20 text-white/60 hover:bg-white/30"
                            )}
                          >
                            {s === EventStatus.OPEN ? 'MỞ' : 'ĐÓNG'}
                          </button>
                        ))}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10"
                        onClick={(e) => { e.stopPropagation(); handleEditClick(event); }}
                      >
                        <FileEdit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-white/50 hover:text-red-500 hover:bg-red-500/10"
                        onClick={(e) => { e.stopPropagation(); deleteEvent(event.id); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-[11px] font-black text-white/70 uppercase tracking-widest flex items-center gap-2">
                      {resolve(event.location)}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="min-h-screen bg-slate-50/30 -mx-4 md:-mx-8 px-4 md:px-8 pb-12">
          <div className="max-w-[1400px] mx-auto">
            {legendEntries.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
                {legendEntries.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: cat.color }} />
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{cat.label}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-center gap-12 mb-8">
              <button onClick={() => setCalendarDate(new Date(calYear, calMonth - 1, 1))} className="p-2 hover:bg-white rounded-full transition-colors text-red-600">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <div className="bg-red-600 text-white min-w-[240px] text-center px-6 py-2 rounded-sm font-black text-xl italic tracking-tighter uppercase">
                {calendarLoading ? '...' : `${monthNames[calMonth]} NĂM ${calYear}`}
              </div>
              <button onClick={() => setCalendarDate(new Date(calYear, calMonth + 1, 1))} className="p-2 hover:bg-white rounded-full transition-colors text-red-600">
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
            <div className="border-[1px] border-red-200 bg-white shadow-2xl rounded-sm overflow-hidden">
              <div className="grid grid-cols-7 bg-red-600 text-white border-b border-red-200">
                {weekdays.map((day) => (
                  <div key={day} className="py-3 text-center text-sm font-black uppercase tracking-widest italic border-r border-white/20 last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 border-l border-red-100">
                {calendarDays.map((day, i) => (
                  <div
                    key={i}
                    className={cn(
                      "min-h-[180px] p-2 border-r border-b border-red-100 relative group hover:bg-slate-50/50 transition-colors",
                      day === null && "bg-slate-50/20"
                    )}
                  >
                    {day && (
                      <>
                        <span className="absolute top-2 right-4 text-sm font-bold text-slate-400 group-hover:text-red-500 transition-colors">{day}</span>
                        <div className="mt-8 space-y-1.5">
                          {calendarEvents.filter(e => isEventOnDay(e, day)).map((ev) => (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              key={ev.id}
                              className="p-1.5 rounded-sm text-white shadow-md relative overflow-hidden"
                              style={{ backgroundColor: ev.color || '#64748b' }}
                            >
                              <h4 className="text-[8px] font-black leading-tight uppercase italic tracking-tighter line-clamp-2">{ev.title}</h4>
                              <p className="text-[7px] font-bold text-white/80 uppercase tracking-widest mt-0.5 truncate">{formatTime(ev.start)}</p>
                            </motion.div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {!calendarLoading && calendarEvents.length === 0 && (
              <p className="text-center text-slate-400 text-sm mt-8">Không có sự kiện nào trong tháng này</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
