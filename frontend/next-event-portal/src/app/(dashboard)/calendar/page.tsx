'use client'

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

interface BackendEvent {
  id: string | number;
  title: string;
  start: string; // ISO date string
  end: string;
  location: string;
  status: string;
  color: string; // hex color
  category: string;
}

interface CalendarApiResponse {
  year: number;
  month: number;
  categoryColors: Record<string, string>;
  events: BackendEvent[];
}

export default function CalendarPage() {
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<BackendEvent[]>([]);
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const monthNames = [
    "THÁNG 1", "THÁNG 2", "THÁNG 3", "THÁNG 4", "THÁNG 5", "THÁNG 6",
    "THÁNG 7", "THÁNG 8", "THÁNG 9", "THÁNG 10", "THÁNG 11", "THÁNG 12"
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-based

  useEffect(() => {
    async function fetchCalendar() {
      setLoading(true);
      try {
        const res = await apiClient.get<CalendarApiResponse>('/events/calendar', {
          params: { year, month: month + 1 }, // backend uses 1-based month
        });
        const data = res.data;
        setEvents(Array.isArray(data.events) ? data.events : []);
        setCategoryColors(data.categoryColors || {});
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCalendar();
  }, [year, month]);

  const weekdays = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => {
    const day = new Date(y, m, 1).getDay();
    return day === 0 ? 6 : day - 1; // Monday start
  };

  const daysInMonth = getDaysInMonth(year, month);
  const startOffset = getFirstDayOfMonth(year, month);
  const totalSlots = Math.ceil((daysInMonth + startOffset) / 7) * 7;
  const calendarDays = Array.from({ length: totalSlots }, (_, i) => {
    const day = i - startOffset + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  const isEventOnDay = (event: BackendEvent, d: number) => {
    const evStart = new Date(event.start);
    evStart.setHours(0, 0, 0, 0);
    const evEnd = new Date(event.end);
    evEnd.setHours(23, 59, 59, 999);
    const current = new Date(year, month, d);
    return current >= evStart && current <= evEnd;
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const CATEGORY_VI: Record<string, string> = {
    ACADEMIC: 'Học thuật', CULTURE: 'Văn hóa', SPORT: 'Thể thao',
    COMMUNITY: 'Cộng đồng', NATIONAL: 'Quốc gia', SCHOOL: 'Nhà trường', SEMINAR: 'Hội thảo',
  };

  // Build legend from categoryColors returned by backend
  const legendEntries = Object.entries(categoryColors).map(([cat, color]) => ({
    id: cat,
    label: CATEGORY_VI[cat] ?? (cat.charAt(0) + cat.slice(1).toLowerCase().replace(/_/g, ' ')),
    color,
  }));

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  return (
    <div className="min-h-screen bg-slate-50/30">
      <div className="max-w-[1400px] mx-auto py-12 px-8">
        {/* Legend */}
        {legendEntries.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
            {legendEntries.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: cat.color }} />
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{cat.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Month Header */}
        <div className="flex items-center justify-center gap-12 mb-8">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-white rounded-full transition-colors text-red-600"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div className="bg-red-600 text-white min-w-[240px] text-center px-6 py-2 rounded-sm font-black text-xl italic tracking-tighter uppercase">
            {loading ? '...' : `${monthNames[month]} NĂM ${year}`}
          </div>

          <button
            onClick={nextMonth}
            className="p-2 hover:bg-white rounded-full transition-colors text-red-600"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="border-[1px] border-red-200 bg-white shadow-2xl rounded-sm overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 bg-red-600 text-white border-b border-red-200">
            {weekdays.map((day) => (
              <div key={day} className="py-3 text-center text-sm font-black uppercase tracking-widest italic border-r border-white/20 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 border-l border-red-100">
            {calendarDays.map((day, i) => (
              <div
                key={i}
                className={cn(
                  "min-h-[220px] p-2 border-r border-b border-red-100 relative group hover:bg-slate-50/50 transition-colors",
                  day === null && "bg-slate-50/20"
                )}
              >
                {day && (
                  <>
                    <span className="absolute top-2 right-4 text-sm font-bold text-slate-400 group-hover:text-red-500 transition-colors">
                      {day}
                    </span>
                    <div className="mt-8 space-y-2">
                       {events.filter(e => isEventOnDay(e, day)).map((event) => (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={event.id}
                          className="p-2 rounded-sm text-white shadow-md relative overflow-hidden"
                          style={{ backgroundColor: event.color || '#64748b' }}
                        >
                          <div className="relative z-10 space-y-1">
                            <h4 className="text-[9px] font-black leading-tight uppercase italic tracking-tighter line-clamp-3">
                              {event.title}
                            </h4>
                            <div className="h-[1px] w-full bg-white/20 my-1" />
                            <p className="text-[8px] font-bold text-white/90 uppercase tracking-widest truncate">
                              {formatTime(event.start)} - {event.location}
                            </p>
                          </div>
                          <div className="absolute inset-0 bg-black/5 opacity-0 hover:opacity-100 transition-opacity" />
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {!loading && events.length === 0 && (
          <p className="text-center text-slate-400 text-sm mt-8">Không có sự kiện nào trong tháng này</p>
        )}
      </div>
    </div>
  );
}
