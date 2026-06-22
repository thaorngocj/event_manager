'use client'

import { useRouter } from 'next/navigation';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Mail, Briefcase, Calendar, CheckCircle2, Eye, QrCode, Search, ChevronLeft, ChevronRight, Download, History } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRegistrations } from '@/context/RegistrationsContext';
import { useEvents } from '@/context/EventsContext';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function ParticipatedEvents() {
  const { t, resolve } = useLanguage();
  const { user } = useAuth();
  const { getUserRegistrations } = useRegistrations();
  const { events } = useEvents();

  const [selectedQR, setSelectedQR] = useState<{ eventName: string, regId: string, eventId: string } | null>(null);
  const [qrTimestamp, setQrTimestamp] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = user?.role === UserRole.ADMIN;
  const isStudent = user?.role === UserRole.STUDENT;
  const userRegistrations = user ? getUserRegistrations(user.uid) : [];

  const filteredRegistrations = userRegistrations.filter(reg => {
    const event = events.find(e => e.id === reg.eventId);
    if (!event) return false;
    const title = resolve(event.title).toLowerCase();
    return title.includes(searchQuery.toLowerCase());
  });

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg-p');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 100;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        ctx.fillStyle = 'black';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(selectedQR?.eventName || 'Event Entry', canvas.width / 2, img.height + 60);
      }
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR_${selectedQR?.eventName.replace(/\s+/g, '_')}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="space-y-8">
      {/* Support Header - Only for students */}
      {isStudent && (
        <div className="bg-[#1e3a5f] -mx-4 md:-mx-8 -mt-4 md:-mt-8 py-3 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center text-[10px] font-black text-white/70 uppercase tracking-widest gap-2 shadow-sm border-b border-white/10 overflow-hidden relative">
          <div className="absolute inset-0 bg-red-600/5 skew-x-12 -translate-x-1/2"></div>
          <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-center md:text-left relative z-10">
            <span className="text-white">Trung tâm Hỗ trợ Sinh viên</span>
            <span>Phone: 028 7109 9218 (Ext: 3310/3311)</span>
          </div>
          <div className="flex gap-4 relative z-10">
            <span className="text-white bg-red-600 px-3 py-1 rounded-full lowercase text-[9px] shadow-lg shadow-red-900/40">{user?.displayName}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4 md:space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50">
            <div className="bg-[#1e3a5f] p-4 text-center">
              <h3 className="text-white text-[10px] font-black uppercase tracking-[0.2em]">
                {t('personalInfo')}
              </h3>
            </div>
            <div className="p-6 text-center space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-slate-50 border-2 border-white shadow-inner mx-auto flex items-center justify-center">
                <span className="text-3xl font-black text-slate-300 italic">{user?.displayName?.[0]}</span>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-black text-slate-900 italic uppercase tracking-tight leading-none">{user?.displayName}</p>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Mail className="h-2.5 w-2.5 text-red-500" />
                    {user?.email}
                  </div>
                  {isStudent && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Briefcase className="h-2.5 w-2.5 text-blue-500" />
                      {t('facultyInfo')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {!isAdmin && (
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-lg shadow-slate-200/40 p-2">
              <div className="flex flex-col gap-1">
                <Link href="/my-events" className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all group">
                  <Calendar className="h-4 w-4 group-hover:text-red-600" />
                  <span className="text-[11px] font-black uppercase tracking-widest transition-all">
                    {t('myEvent')}
                  </span>
                </Link>
                <Link href="/participated-events" className="w-full flex items-center gap-3 p-4 bg-emerald-600 text-white rounded-2xl transition-all shadow-lg shadow-emerald-100">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    {t('participationInEvent')}
                  </span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className={cn(isAdmin ? "lg:col-span-4" : "lg:col-span-3")}>
          {!isAdmin ? (
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/60">
            <div className="bg-slate-900 p-4 md:px-8 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-white text-[11px] font-black uppercase tracking-[0.2em] italic">
                {t('registeredEventsList')}
              </h3>
              <div className="flex gap-1">
                <div className="h-1.5 w-6 bg-emerald-500 rounded-full"></div>
                <div className="h-1.5 w-2 bg-slate-700 rounded-full"></div>
              </div>
            </div>
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                 <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-slate-400 font-mono">
                   <span>{t('show')}</span>
                   <select className="border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 outline-none">
                     <option>10</option>
                   </select>
                   <span>{t('entries')}</span>
                 </div>
                 <div className="relative">
                   <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
                   <Input 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder={t('searchEvent')} 
                     className="h-11 text-[11px] w-full sm:w-[280px] pr-12 bg-slate-50 border-slate-100 rounded-xl font-bold uppercase tracking-widest focus:ring-emerald-500 transition-all"
                   />
                 </div>
              </div>

              <div className="border border-slate-50 rounded-2xl overflow-hidden ring-1 ring-slate-100">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-white border-b border-slate-100">
                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-12 text-center">#</th>
                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('eventName')}</th>
                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('eventCode')}</th>
                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('startTime')}</th>
                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('status')}</th>
                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('operation')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegistrations.length > 0 ? filteredRegistrations.map((reg, idx) => {
                        const event = events.find(e => e.id === reg.eventId);
                        if (!event) return null;
                        
                        const bgColor = event.id === '1' ? 'bg-[#5b9bd5]' : event.id === '2' ? 'bg-[#e08e8e]' : 'bg-[#16a085]';

                        return (
                          <tr key={reg.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 text-[11px] font-bold text-slate-500 text-center">{idx + 1}</td>
                            <td className="p-4">
                               <Link href={`/events/${event.id}`}>
                                 <div className={cn("px-4 py-3 rounded-sm text-white text-[11px] font-black tracking-tight leading-tight italic uppercase min-h-[40px] flex items-center hover:opacity-90 transition-opacity", bgColor)}>
                                   {resolve(event.title)}
                                 </div>
                               </Link>
                            </td>
                            <td className="p-4 text-[11px] font-bold text-slate-900 uppercase font-mono">{event.id.substring(0, 4)}</td>
                            <td className="p-4 text-[11px] font-bold text-slate-500">{event.startTime}<br/>{event.date}</td>
                            <td className="p-4">
                               <span className={cn(
                                 "px-2 py-1 rounded-sm text-[9px] font-black text-white uppercase tracking-tighter",
                                 reg.status === 'ATTENDED' ? "bg-green-600" : "bg-red-500"
                               )}>
                                 {reg.status === 'ATTENDED' ? t('attendanceTaken') : t('noRollCallYet')}
                               </span>
                            </td>
                            <td className="p-4">
                               <div className="flex gap-2 justify-center">
                                 <Link href={`/events/${event.id}`}>
                                   <button className="w-9 h-9 rounded-md bg-[#5bc0de] flex items-center justify-center text-white hover:bg-[#31b0d5] transition-colors shadow-sm" title={t('eyeInfo')}>
                                     <Eye className="h-4 w-4" />
                                   </button>
                                 </Link>

                                 <button
                                   onClick={() => { setQrTimestamp(Date.now()); setSelectedQR({ eventName: resolve(event.title), regId: reg.id, eventId: event.id }); }}
                                   disabled={reg.status !== 'APPROVED' && reg.status !== 'ATTENDED'}
                                   className={cn(
                                     "w-9 h-9 rounded-md flex items-center justify-center transition-colors shadow-sm",
                                     (reg.status === 'APPROVED' || reg.status === 'ATTENDED')
                                       ? "bg-[#5cb85c] hover:bg-[#449d44] text-white"
                                       : "bg-slate-100 text-slate-300 cursor-not-allowed"
                                   )}
                                   title={reg.status === 'APPROVED' || reg.status === 'ATTENDED' ? t('qrShort') : 'Requires Approval'}
                                 >
                                   <QrCode className="h-4 w-4" />
                                 </button>
                               </div>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={6} className="p-12 text-center text-xs font-black text-slate-400 uppercase tracking-widest">
                            {t('noEventsYet')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden divide-y divide-slate-100">
                  {filteredRegistrations.length > 0 ? filteredRegistrations.map((reg, idx) => {
                    const event = events.find(e => e.id === reg.eventId);
                    if (!event) return null;
                    
                    const bgColor = event.id === '1' ? 'bg-[#5b9bd5]' : event.id === '2' ? 'bg-[#e08e8e]' : 'bg-[#16a085]';

                    return (
                      <div key={reg.id} className="p-6 space-y-5 hover:bg-slate-50 transition-all relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 transition-all scale-y-0 group-hover:scale-y-100"></div>
                        <div className="flex justify-between items-start gap-4">
                          <Link href={`/events/${event.id}`} className="flex-1">
                            <div className={cn("px-4 py-3 rounded-2xl text-white text-[10px] font-black tracking-tight leading-tight italic uppercase min-h-[30px] flex items-center shadow-lg transform active:scale-95 transition-all text-center justify-center", bgColor)}>
                              {resolve(event.title)}
                            </div>
                          </Link>
                          <Badge className={cn(
                            "text-[8px] font-black px-3 py-1.5 uppercase tracking-widest border-none shrink-0 shadow-sm",
                            reg.status === 'ATTENDED' ? "bg-emerald-100 text-emerald-700" : "bg-red-50 text-red-600"
                          )}>
                            {reg.status === 'ATTENDED' ? 'VERIFIED' : 'PENDING'}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-end">
                          <div className="space-y-2">
                             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <Calendar className="h-3 w-3 text-emerald-500" />
                                <span>{event.startTime} â€¢ {event.date}</span>
                             </div>
                             <p className="text-[12px] font-black text-slate-900 uppercase tracking-tight font-mono">CODE: {event.id.substring(0, 4)}</p>
                          </div>

                          <div className="flex gap-2">
                            <Link href={`/events/${event.id}`}>
                              <Button variant="ghost" size="icon" className="h-12 w-12 bg-slate-100 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-2xl transition-all">
                                <Eye className="h-5 w-5" />
                              </Button>
                            </Link>
                            <Button 
                              onClick={() => { setQrTimestamp(Date.now()); setSelectedQR({ eventName: resolve(event.title), regId: reg.id, eventId: event.id }); }}
                              disabled={reg.status !== 'APPROVED' && reg.status !== 'ATTENDED'}
                              className={cn(
                                "h-12 w-12 p-0 rounded-2xl transition-all shadow-lg active:scale-95",
                                (reg.status === 'APPROVED' || reg.status === 'ATTENDED')
                                  ? "bg-emerald-600 text-white hover:bg-black shadow-emerald-100"
                                  : "bg-slate-100 text-slate-200"
                              )}
                            >
                              <QrCode className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="p-12 text-center text-xs font-black text-slate-400 uppercase tracking-widest">
                      {t('noEventsYet')}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 font-mono">
                <p>{t('showingEntries')} 1 {t('to')} {filteredRegistrations.length} {t('of')} {filteredRegistrations.length} {t('entries')}</p>
                <div className="flex border border-slate-200 rounded-sm overflow-hidden">
                  <button className="px-2 py-1 border-r border-slate-200 hover:bg-slate-50 transition-colors">Â«</button>
                  <button className="px-3 py-1 bg-[#1e3a5f] text-white">1</button>
                  <button className="px-2 py-1 border-l border-slate-200 hover:bg-slate-50 transition-colors">Â»</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/60 p-12 text-center">
              <History className="h-16 w-16 text-slate-200 mx-auto mb-6" />
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">Participation History</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] max-w-sm mx-auto">
                Personal event participation history is disabled for administrator roles. Please use the administrative dashboard to view global statistics.
              </p>
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                className="mt-8 bg-slate-900 text-white rounded-xl h-11 px-8 font-black uppercase tracking-widest italic text-[10px]"
              >
                Go to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      <Dialog open={!!selectedQR} onOpenChange={(open) => !open && setSelectedQR(null)}>
        <DialogContent className="max-w-md bg-white rounded-3xl overflow-hidden p-0 border-none shadow-2xl">
          <div className="bg-[#1e3a5f] p-8 text-center space-y-2">
            <DialogTitle className="text-white text-2xl font-black italic uppercase tracking-tighter">
              Event Ticket
            </DialogTitle>
            <DialogDescription className="text-white/60 text-xs font-bold uppercase tracking-widest">
              Scan this code at the event entrance
            </DialogDescription>
          </div>
          
          <div className="p-10 flex flex-col items-center justify-center space-y-8">
            <div className="p-6 bg-white rounded-[2rem] shadow-xl ring-1 ring-slate-100 relative group">
              {selectedQR && (
                <QRCodeSVG
                  id="qr-code-svg-p"
                  value={`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'}/checkin/confirm?regId=${selectedQR.regId}&eventId=${selectedQR.eventId}&userId=${user?.uid}&t=${qrTimestamp}&event=${encodeURIComponent(selectedQR.eventName)}`}
                  size={200}
                  level="H"
                />
              )}
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[2rem]">
                <div className="h-12 w-12 rounded-full bg-[#1e3a5f] flex items-center justify-center">
                  <QrCode className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-lg font-black text-[#1e3a5f] uppercase italic max-w-[280px] mx-auto leading-tight">
                {selectedQR?.eventName}
              </h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Verified Admission Ticket
              </p>
            </div>

            <div className="w-full pt-4 space-y-3">
              <Button 
                onClick={downloadQR}
                className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest italic flex items-center justify-center gap-3 shadow-lg shadow-red-100 transition-all active:scale-95"
              >
                <Download className="h-5 w-5" />
                Download Ticket
              </Button>
              <Button 
                variant="ghost"
                onClick={() => setSelectedQR(null)}
                className="w-full h-12 text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest text-[10px]"
              >
                Close Window
              </Button>
            </div>
          </div>
          
          <div className="bg-slate-50 p-6 flex items-center justify-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Ready for verification
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}







