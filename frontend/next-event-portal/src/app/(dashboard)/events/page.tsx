'use client'

import { useRouter } from 'next/navigation';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, FileEdit, Trash2, Check, ImagePlus } from 'lucide-react';
import { Event, EventStatus, UserRole } from '@/types';
import { uploadService } from '@/services/upload.service';
import { cn } from '@/lib/utils';

import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventsContext';
import { useEventsQuery, useCreateEvent, useUpdateEvent, useDeleteEvent } from '@/hooks/useEvents';
import { motion } from 'motion/react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
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

export default function Events() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { t, resolve } = useLanguage();
  const { user } = useAuth();
  const { searchQuery } = useEvents();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const limit = 6;
  const { data: eventsData, isLoading } = useEventsQuery({ search: searchQuery || undefined, page, limit });
  const events = eventsData?.data || [];
  const totalPages = eventsData?.totalPages || 1;

  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();

  const [newEvent, setNewEvent] = useState({ title: '', description: '', location: '', date: '', endDate: '', time: '', capacity: '200' });
  const [eventDisplayMode, setEventDisplayMode] = useState<'HERO' | 'FEATURED' | 'HIGHLIGHT' | 'NORMAL'>('FEATURED');
  const [eventCategory, setEventCategory] = useState('ACADEMIC');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});

  useEffect(() => {
    const now = new Date();
    apiClient.get('/events/calendar', {
      params: { year: now.getFullYear(), month: now.getMonth() + 1 },
    }).then(res => {
      if (res.data?.categoryColors) setCategoryColors(res.data.categoryColors);
    }).catch(() => {});
  }, []);

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
      setUploadedImageUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setNewEvent({ title: '', description: '', location: '', date: '', endDate: '', time: '', capacity: '200' });
    setImagePreview(null);
    setUploadedImageUrl(null);
    setEditingId(null);
    setEventDisplayMode('FEATURED');
    setEventCategory('ACADEMIC');
    setIsCreateOpen(false);
  };

  const handleEditClick = (event: Event) => {
    const getVal = (val: string | { EN: string; VI: string }) =>
      typeof val === 'string' ? val : val?.VI || val?.EN || '';
    setEditingId(event.id);
    setNewEvent({
      title: getVal(event.title),
      description: getVal(event.description),
      location: getVal(event.location),
      date: event.date,
      endDate: event.closingDate || event.date,
      time: event.startTime,
      capacity: String(event.capacity),
    });
    setImagePreview(event.image || null);
    setUploadedImageUrl(event.image || null);
    setEventDisplayMode((event.displayCategory ?? 'FEATURED') as 'HERO' | 'FEATURED' | 'HIGHLIGHT' | 'NORMAL');
    setEventCategory(event.category || 'ACADEMIC');
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = () => {
    const payload = {
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      closingDate: newEvent.endDate,
      startTime: newEvent.time,
      endTime: '',
      location: newEvent.location,
      capacity: Number(newEvent.capacity) || 200,
      status: EventStatus.OPEN,
      organizerId: user?.uid || 'anonymous',
      category: eventCategory,
      displayCategory: eventDisplayMode,
      image: uploadedImageUrl || imagePreview || undefined,
    };
    if (editingId) {
      updateEventMutation.mutate({ id: editingId, payload });
    } else {
      createEventMutation.mutate(payload);
    }
    resetForm();
  };

  const canCreate = user?.role === UserRole.ADMIN || user?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-12">
      {/* Support Header - Only for students */}
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
        
        {canCreate && (
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
                  {/* Ảnh bìa */}
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
                            <ImagePlus className="w-8 h-8" /><span className="text-[10px] font-black uppercase tracking-tighter">Thay đổi ảnh</span>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); setImagePreview(null); setUploadedImageUrl(null); }} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 z-20">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                            <ImagePlus className="w-6 h-6" />
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-tighter text-slate-600">DRAG & DROP IMAGE</p>
                            <p className="text-[10px] font-black uppercase tracking-tighter text-red-500">OR BROWSE FILES</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Tên */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">TÊN SỰ KIỆN</Label>
                    <Input placeholder="VD: HỘI THẢO AI 2026" className="h-12 bg-slate-50 border-none rounded-xl" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} />
                  </div>

                  {/* Chi tiết */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">CHI TIẾT SỰ KIỆN</Label>
                    <Textarea placeholder="Nhập mô tả sự kiện..." className="min-h-[100px] bg-slate-50 border-none rounded-xl" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} />
                  </div>

                  {/* Ngày */}
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

                  {/* Giờ + Sức chứa */}
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

                  {/* Địa điểm */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">ĐỊA ĐIỂM</Label>
                    <Input value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="VD: Hội trường A" className="h-12 bg-slate-50 border-none rounded-xl" />
                  </div>

                  {/* Hiển thị + Thể loại */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">HIỂN THỊ TRÊN HOMEPAGE</Label>
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
                      <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                        {[
                          { value: 'ACADEMIC', label: 'Học thuật' },
                          { value: 'CULTURE', label: 'Văn hóa' },
                          { value: 'SPORT', label: 'Thể thao' },
                          { value: 'COMMUNITY', label: 'Cộng đồng' },
                          { value: 'NATIONAL', label: 'Quốc gia' },
                          { value: 'SCHOOL', label: 'Nhà trường' },
                          { value: 'SEMINAR', label: 'Hội thảo' },
                        ].map(({ value, label }) => (
                          <button key={value} type="button" onClick={() => setEventCategory(value)}
                            className={`w-full flex items-center justify-between px-4 py-3 text-[10px] font-bold transition-colors ${eventCategory === value ? 'bg-slate-50 text-red-600' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                            {label}
                            {eventCategory === value && <Check className="w-3 h-3 text-red-600" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8 pt-0 mt-auto">
                  <Button
                    onClick={handleCreateSubmit}
                    disabled={isUploading}
                    type="button"
                    className="w-full h-12 sm:h-14 bg-slate-900 hover:bg-slate-800 text-white font-black italic uppercase tracking-widest rounded-xl transition-all shadow-xl text-xs sm:text-sm active:scale-95"
                  >
                    {isUploading ? 'Đang upload ảnh...' : editingId ? 'LƯU THAY ĐỔI' : 'XÁC NHẬN & XUẤT BẢN SỰ KIỆN'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        <div className="flex flex-col items-center gap-3">
          <div className="w-2 h-2 rounded-full border-2 border-yellow-500"></div>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest italic">Đến VA và trải nghiệm những khoảnh khắc thú vị nhất!</p>
          <div className="h-[1px] w-48 bg-slate-100"></div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-slate-400 py-12">Đang tải danh sách sự kiện...</div>
      ) : events.length === 0 ? (
        <div className="text-center text-slate-500 py-12">
          <FileEdit className="w-12 h-12 mx-auto text-slate-300 mb-4 opacity-20" />
          <h3 className="text-lg font-medium text-slate-900">Chưa có sự kiện trong tháng</h3>
          <p className="text-sm mt-1">Hiện tại không có sự kiện nào hoặc không tìm thấy sự kiện phù hợp.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-x-8 gap-y-12 max-w-6xl mx-auto">
            {events.map((event) => (
          <motion.div 
            key={event.id}
            whileHover={{ y: -5 }}
            onClick={() => router.push(`/events/${event.id}`)}
            className="group relative h-[380px] rounded-sm overflow-hidden shadow-2xl flex flex-col cursor-pointer"
          >
            {/* Top Half: Image */}
            <div className="flex-1 relative overflow-hidden">
               <img src={event.image} alt={resolve(event.title)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
               <div className="absolute top-4 left-4">
                  <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none text-[9px] font-black tracking-widest uppercase px-3 py-1.5 shadow-xl">
                    {CATEGORY_VI[event.category?.toUpperCase() ?? ''] ?? event.category}
                  </Badge>
                </div>
            </div>
            
            {/* Bottom Half: Info */}
            <div
              className="h-[120px] transition-colors p-6 flex flex-col justify-between relative"
              style={{ backgroundColor: getEventColor(event) }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent" />
              
              <h3 className="text-lg font-black text-white italic leading-tight line-clamp-1 uppercase tracking-tighter relative z-10">
                {resolve(event.title)}
              </h3>
              
              <div className="flex justify-between items-end relative z-10">
                <div className="space-y-1">
                  <div className="text-[11px] font-black text-white uppercase tracking-widest">
                    {event.startTime} - {event.date}
                  </div>
                </div>
                {canCreate ? (
                  <div className="flex gap-2">
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
                      onClick={(e) => { e.stopPropagation(); deleteEventMutation.mutate(event.id); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    {resolve(event.location)}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12 pb-8">
              <Button
                variant="outline"
                className="h-10 px-4 text-xs font-bold uppercase tracking-widest"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trang trước
              </Button>
              <div className="h-10 px-4 flex items-center justify-center text-xs font-bold bg-slate-50 rounded-md">
                {page} / {totalPages}
              </div>
              <Button
                variant="outline"
                className="h-10 px-4 text-xs font-bold uppercase tracking-widest"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Trang sau
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}







