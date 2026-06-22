'use client'

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useRegistrations } from '@/context/RegistrationsContext';
import { useEvents } from '@/context/EventsContext';
import { cn } from '@/lib/utils';
import { UserRole, EventStatus } from '@/types';
import { StudentQR } from '@/components/StudentQR';
import { useLanguage } from '@/context/LanguageContext';
import { statisticsService, OverviewStats } from '@/services/statistics.service';

export default function Dashboard() {
  const { user } = useAuth();
  const { t, resolve } = useLanguage();
  const router = useRouter();
  const { registrations } = useRegistrations();
  const { events } = useEvents();
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);

  const isAdmin = user && (
    user.role === UserRole.ADMIN ||
    user.role === UserRole.EVENT_MANAGER
  );

  useEffect(() => {
    if (user?.role === UserRole.ADMIN) {
      statisticsService.getOverview()
        .then(data => setOverviewStats(data))
        .catch(() => {});
    }
  }, [user?.role]);

  // Student stats
  const now = Date.now();
  const attendedCount = registrations.filter(r => r.status === 'ATTENDED').length;
  const upcomingCount = registrations.filter(r => {
    if (r.status === 'CANCELLED' || r.status === 'ATTENDED') return false;
    const event = events.find(e => e.id === r.eventId);
    return event && new Date(event.date).getTime() > now;
  }).length;

  const recentRegistrations = registrations
    .filter(r => r.status !== 'CANCELLED')
    .sort((a, b) => b.registeredAt - a.registeredAt)
    .slice(0, 3)
    .map(r => ({ reg: r, event: events.find(e => e.id === r.eventId) }))
    .filter((item): item is { reg: (typeof registrations)[0]; event: (typeof events)[0] } => !!item.event);

  if (!isAdmin) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter italic uppercase">
              {t('welcome')}, <span className="text-red-600">{user?.displayName}</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cổng thông tin hoạt động cá nhân</p>
          </div>
          <Badge className="bg-red-600 font-bold uppercase tracking-widest text-[10px] px-4 py-2">
            Tài khoản sinh viên
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <StudentQR />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black italic uppercase tracking-tight text-slate-800">Thống kê của bạn</h3>
                <div className="w-10 h-1 bg-red-600 rounded-full"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="p-4 md:p-6 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sự kiện đã tham gia</p>
                  <p className="text-3xl md:text-4xl font-black text-slate-900 italic">{attendedCount}</p>
                </div>
                <div className="p-4 md:p-6 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sự kiện sắp tới</p>
                  <p className="text-3xl md:text-4xl font-black text-slate-900 italic">{upcomingCount}</p>
                </div>
              </div>
            </div>

            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardHeader className="bg-slate-900 text-white p-6">
                <CardTitle className="text-xl font-black italic uppercase">Đăng ký gần đây</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {recentRegistrations.length > 0 ? recentRegistrations.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-slate-50 transition-colors cursor-pointer gap-2"
                      onClick={() => router.push(`/events/${item.event.id}`)}
                    >
                      <div>
                        <p className="font-bold text-slate-900 uppercase italic leading-tight">{resolve(item.event.title)}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                          {item.event.date} • {resolve(item.event.location)}
                        </p>
                      </div>
                      <Badge className={cn(
                        "border-none font-bold uppercase tracking-widest text-[9px]",
                        item.reg.status === 'ATTENDED' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                      )}>
                        {item.reg.status === 'ATTENDED' ? 'Đã điểm danh' : 'Đã đăng ký'}
                      </Badge>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
                      Chưa có đăng ký nào
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Admin / EVENT_MANAGER view
  const checkinRate = overviewStats?.checkinRate;
  const checkinRateDisplay = checkinRate !== undefined
    ? (typeof checkinRate === 'number' ? `${checkinRate.toFixed(1)}%` : String(checkinRate))
    : '—';
  const pendingCheckin = overviewStats
    ? overviewStats.totalRegistrations - overviewStats.totalCheckins
    : '—';

  const stats = [
    { label: t('activeEvents'), count: overviewStats ? String(overviewStats.totalEvents) : '—', description: t('weekStat'), color: 'text-emerald-600' },
    { label: t('totalReg'), count: overviewStats ? String(overviewStats.totalRegistrations) : '—', description: t('across') + ' ' + t('events').toLowerCase(), color: 'text-slate-400' },
    { label: t('pendingCheckin'), count: String(pendingCheckin), description: t('actionRequired'), color: 'text-red-600', boldDesc: true },
    { label: 'Tỷ lệ điểm danh', count: checkinRateDisplay, description: t('monitoring'), color: 'text-slate-400' },
  ];

  const recentEvents = events.slice(0, 5);

  const statusLabel = (status: EventStatus) => {
    if (status === EventStatus.OPEN) return 'open';
    if (status === EventStatus.COMPLETED) return 'completed';
    if (status === EventStatus.UPCOMING) return 'upcoming';
    return 'closed';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
            <p className="text-sm text-slate-500 font-medium mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900">{stat.count}</p>
            <div className={cn(
              "mt-2 text-xs font-medium",
              stat.color,
              stat.boldDesc && "font-bold uppercase tracking-wider"
            )}>
              {stat.description}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 md:p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/50 gap-4">
          <h2 className="font-bold text-slate-800 tracking-tight italic">{t('recentActivities')}</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={() => router.push('/events')} className="flex-1 sm:flex-none h-8 text-xs font-bold uppercase tracking-widest text-slate-600 bg-white border-slate-200">
              {t('filters')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push('/checkin')} className="flex-1 sm:flex-none h-8 text-xs font-bold uppercase tracking-widest text-slate-600 bg-white border-slate-200">
              {t('checkin')}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {/* Desktop Table */}
          <table className="hidden md:table w-full text-left border-collapse">
            <thead className="bg-white border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('eventName')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('dateTime')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Sức chứa</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('status')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentEvents.map((event, idx) => {
                const sl = statusLabel(event.status);
                return (
                  <tr key={event.id} className={cn(idx % 2 !== 0 && "bg-slate-50/30")}>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">{resolve(event.title)}</p>
                      <p className="text-xs text-slate-500">{resolve(event.location)} • {event.category}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{event.date} {event.startTime}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{event.capacity}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide",
                        event.status === EventStatus.OPEN && "bg-emerald-100 text-emerald-700",
                        event.status === EventStatus.COMPLETED && "bg-slate-100 text-slate-600",
                        event.status === EventStatus.UPCOMING && "bg-blue-100 text-blue-700",
                        event.status === EventStatus.CLOSED && "bg-red-100 text-red-700",
                      )}>
                        {t(sl)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => router.push(event.status === EventStatus.COMPLETED ? `/attendance/${event.id}` : `/checkin`)}
                        className={cn(
                          "text-xs font-bold uppercase transition-colors",
                          event.status === EventStatus.COMPLETED ? "text-slate-600 hover:text-slate-800" : "text-red-600 hover:text-red-800"
                        )}
                      >
                        {event.status === EventStatus.COMPLETED ? t('viewReport') : t('checkin')}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {recentEvents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
                    Chưa có sự kiện nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-slate-100">
            {recentEvents.map((event) => {
              const sl = statusLabel(event.status);
              return (
                <div key={event.id} className="p-4 space-y-4">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-tight uppercase italic">{resolve(event.title)}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{resolve(event.location)} • {event.category}</p>
                    </div>
                    <span className={cn(
                      "px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest shrink-0",
                      event.status === EventStatus.OPEN ? "bg-emerald-100 text-emerald-700" :
                      event.status === EventStatus.COMPLETED ? "bg-slate-100 text-slate-600" :
                      event.status === EventStatus.UPCOMING ? "bg-blue-100 text-blue-700" :
                      "bg-red-100 text-red-700",
                    )}>
                      {t(sl)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{event.date} {event.startTime}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(event.status === EventStatus.COMPLETED ? `/attendance/${event.id}` : `/checkin`)}
                      className={cn(
                        "h-8 px-3 text-[10px] font-black uppercase tracking-widest",
                        event.status === EventStatus.COMPLETED ? "text-slate-600" : "text-red-600"
                      )}
                    >
                      {event.status === EventStatus.COMPLETED ? t('viewReport') : t('checkin')}
                    </Button>
                  </div>
                </div>
              );
            })}
            {recentEvents.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
                Chưa có sự kiện nào
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
