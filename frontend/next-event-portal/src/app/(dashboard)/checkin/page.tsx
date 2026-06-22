'use client'

import { useRouter } from 'next/navigation';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Camera, ShieldCheck, RefreshCw, Search, Users, Download, UserCheck, Calendar, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useLanguage } from '@/context/LanguageContext';
import { useEvents } from '@/context/EventsContext';
import { useRegistrations } from '@/context/RegistrationsContext';
import { registrationService } from '@/services/registration.service';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function CheckIn() {
  const { events } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isScanning, setIsScanning] = useState(true);
  const [scanMethod, setScanMethod] = useState<'camera' | 'image'>('camera');
  const [manualEmail, setManualEmail] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<{name: string, time: string, id: string} | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  
  const { t, resolve } = useLanguage();
  const router = useRouter();
  const { registrations } = useRegistrations();

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resolvedEventId = selectedEventId || (events.length > 0 ? events[0].id : '');


  const doQrCheckin = async (rawText: string) => {
    if (!resolvedEventId) return;
    if (rawText.includes('/checkin/confirm')) {
      const path = rawText.startsWith('http')
        ? new URL(rawText).pathname + new URL(rawText).search
        : rawText;
      router.push(path);
      return;
    }
    try {
      const result = await registrationService.checkin(resolvedEventId, { qrData: rawText });
      const r = result as Record<string, unknown>;
      setLastCheckIn({
        name: String(r?.email || `ID ${r?.userId || '?'}`),
        id: String(r?.userId ?? ''),
        time: new Date().toLocaleTimeString(),
      });
      toast.success('Điểm danh thành công!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'QR code không hợp lệ');
    }
  };

  const handleEmailCheckIn = async () => {
    if (!manualEmail || !resolvedEventId) return;
    setManualLoading(true);
    try {
      const result = await registrationService.manualCheckin(resolvedEventId, manualEmail);
      setLastCheckIn({
        name: manualEmail,
        id: String((result as Record<string, unknown>)?.userId ?? ''),
        time: new Date().toLocaleTimeString(),
      });
      toast.success('Điểm danh thành công!');
      setManualEmail('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Điểm danh thất bại');
    } finally {
      setManualLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !resolvedEventId) return;

    try {
      toast.loading("Đang xử lý ảnh...", { id: 'scan-file' });
      
      const lib = await import('html5-qrcode');
      const html5Qr = new lib.Html5Qrcode("qr-reader-file-hidden");
      
      const result = await html5Qr.scanFile(file, true);
      html5Qr.clear();
      await doQrCheckin(result);
    } catch (err) {
      console.error(err);
      toast.error("Không tìm thấy mã QR hợp lệ trong ảnh này");
    } finally {
      toast.dismiss('scan-file');
      if (e.target) e.target.value = '';
    }
  };

  useEffect(() => {
    if (isScanning && resolvedEventId && scanMethod === 'camera') {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render((decodedText) => {
        setIsScanning(false);
        scanner.clear().catch(() => {});
        void doQrCheckin(decodedText);
      }, () => { /* suppress scan errors */ });

      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error("Failed to clear scanner", e));
      }
    };
  }, [isScanning, resolvedEventId]);

  const toggleScanner = () => {
    if (!resolvedEventId) {
      toast.error("Vui lòng chọn sự kiện trước");
      return;
    }
    setIsScanning(!isScanning);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic uppercase">{t('eventCheckIn')}</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
           <Select value={resolvedEventId} onValueChange={(value) => { if (value !== null) setSelectedEventId(value); }}>
              <SelectTrigger className="w-full sm:w-[280px] bg-white border-slate-200 rounded-xl font-bold uppercase tracking-widest text-[10px] h-11 shrink-0">
                <SelectValue placeholder="CHỌN SỰ KIỆN ĐỂ BẮT ĐẦU" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-100 rounded-xl">
                {events.map(event => (
                  <SelectItem key={event.id} value={event.id} className="font-bold uppercase text-[10px] tracking-widest py-3">
                    {resolve(event.title)}
                  </SelectItem>
                ))}
              </SelectContent>
           </Select>
           {resolvedEventId && <Badge className="bg-red-600 font-bold uppercase tracking-widest text-[10px] px-3 py-2 shrink-0">{t('activeSession')}</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
            <CardHeader className="bg-slate-900 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center italic uppercase tracking-tight">
                    <Camera className="h-5 w-5 mr-3 text-red-500" />
                    {t('qrScanner')}
                  </CardTitle>
                  <CardDescription className="text-slate-400 italic font-medium">{t('scanPrompt')}</CardDescription>
                </div>
                <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                  <button
                    onClick={() => { setScanMethod('camera'); setIsScanning(true); }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                      scanMethod === 'camera' ? "bg-red-600 text-white" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    Camera
                  </button>
                  <button
                    onClick={() => { setScanMethod('image'); setIsScanning(false); }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                      scanMethod === 'image' ? "bg-red-600 text-white" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    Ảnh QR
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 bg-black aspect-square md:aspect-video relative flex flex-col items-center justify-center overflow-hidden">
              <div id="qr-reader-file-hidden" className="hidden"></div>
              {!resolvedEventId ? (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-slate-600" />
                  </div>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Vui lòng chọn sự kiện bên trên</p>
                </div>
              ) : scanMethod === 'camera' ? (
                isScanning ? (
                  <div className="w-full h-full relative">
                    <div id="qr-reader" className="w-full h-full"></div>
                    <div className="absolute inset-0 pointer-events-none border-2 border-red-500 animate-pulse opacity-20 z-10"></div>
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
                      <div className="w-64 h-64 border-2 border-red-500 relative">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-red-500"></div>
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-red-500"></div>
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-red-500"></div>
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-red-500"></div>
                          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_10px_#ef4444] animate-[scan_2s_ease-in-out_infinite]"></div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => setIsScanning(false)}
                      variant="destructive"
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 font-black uppercase tracking-widest text-[10px]"
                    >
                      Dừng quét
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto border-4 border-slate-900 shadow-2xl">
                      <QrCode className="h-10 w-10 text-slate-600" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-slate-400 text-sm font-black italic uppercase tracking-widest">{t('scannerIdle')}</p>
                      <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">SẴN SÀNG HOẠT ĐỘNG</p>
                    </div>
                    <Button onClick={toggleScanner} className="bg-red-600 hover:bg-red-700 font-black uppercase tracking-widest text-xs h-12 px-10 rounded-xl shadow-xl shadow-red-900/40 transition-all active:scale-95">
                      {t('startScanning')}
                    </Button>
                  </div>
                )
              ) : (
                /* Scan from Image Method */
                <div className="w-full h-full p-8 flex flex-col items-center justify-center">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full max-w-sm aspect-square md:aspect-video rounded-3xl border-2 border-dashed border-slate-800 hover:border-red-600/50 hover:bg-slate-900/50 transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="h-8 w-8 text-slate-500 group-hover:text-red-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-black italic uppercase tracking-tighter">Tải lên ảnh QR</p>
                      <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1">Chọn từ thư viện hoặc tệp</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex items-center gap-2 text-slate-500">
                    <ImageIcon className="h-3 w-3" />
                    <p className="text-[9px] font-bold uppercase tracking-widest">Định dạng: JPG, PNG, WEBP</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg italic uppercase tracking-tight flex items-center gap-3">
                <Search className="h-5 w-5 text-red-600" />
                ĐIỂM DANH THỦ CÔNG
              </CardTitle>
              <CardDescription className="italic font-medium text-slate-500">Nhập email sinh viên để điểm danh trực tiếp.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailCheckIn()}
                  placeholder="Email sinh viên..."
                  className="pl-12 h-12 bg-slate-50 border-slate-100 rounded-xl font-bold text-sm"
                />
              </div>
              <Button
                onClick={handleEmailCheckIn}
                disabled={!manualEmail || !resolvedEventId || manualLoading}
                className="w-full bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[10px] h-11 rounded-xl"
              >
                {manualLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <UserCheck className="h-4 w-4 mr-2" />
                )}
                Điểm danh
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg italic uppercase tracking-tight">{t('checkInStatus')}</CardTitle>
              <CardDescription className="font-medium italic text-slate-500">{t('recentEntries')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {lastCheckIn ? (
                <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center animate-in zoom-in-95 duration-300">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mr-4 shadow-sm">
                    <ShieldCheck className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-emerald-900 uppercase italic tracking-tighter truncate">{lastCheckIn.name}</p>
                    <p className="text-[9px] text-emerald-700 font-bold uppercase tracking-widest">{lastCheckIn.id} • {t('verifiedAt')} {lastCheckIn.time}</p>
                  </div>
                  <div className="ml-4">
                    <Badge className="bg-emerald-600 font-bold uppercase tracking-widest text-[9px] border-none shadow-lg shadow-emerald-900/20">{t('verified')}</Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 font-black uppercase tracking-[0.2em] italic text-xs bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  {t('waitingFirstCheckIn')}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg italic uppercase tracking-tight">{t('eventStats')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 pt-6">
               <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('present')}</p>
                 <div className="flex items-baseline gap-1">
                    <p className="text-4xl font-black text-slate-900 italic tracking-tighter">
                      {registrations.filter(r => r.eventId === resolvedEventId && r.status === 'ATTENDED').length}
                    </p>
                    <p className="text-xs font-black text-slate-400 italic">đã xác nhận</p>
                 </div>
               </div>
               <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('totalReg')}</p>
                 <div className="flex items-baseline gap-1">
                    <p className="text-4xl font-black text-slate-900 italic tracking-tighter">
                      {registrations.filter(r => r.eventId === resolvedEventId && r.status !== 'CANCELLED').length}
                    </p>
                    <p className="text-xs font-black text-slate-400 italic">tổng số</p>
                 </div>
               </div>
            </CardContent>
            <div className="p-6 pt-0 flex gap-4">
               <Button 
                 onClick={() => {
                   router.push(`/attendance/${resolvedEventId || 'recent'}`);
                 }}
                 className="flex-1 bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[10px] h-11 rounded-xl shadow-lg shadow-slate-900/10"
               >
                 <Users className="h-4 w-4 mr-2" />
                 {t('viewAttendance')}
               </Button>
               <Button variant="outline" onClick={() => router.push(`/attendance/${resolvedEventId || 'recent'}`)} className="h-11 w-11 p-0 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl">
                 <Download className="h-4 w-4" />
               </Button>
            </div>
          </Card>
        </div>
      </div>
      
      <style>{`
        #qr-reader {
          border: none !important;
          width: 100% !important;
          height: 100% !important;
        }
        #qr-reader img {
          display: none !important;
        }
        #qr-reader__dashboard {
          padding: 10px !important;
          background: #1e293b !important;
          border-top: 1px solid #334155 !important;
          color: white !important;
        }
        #qr-reader__dashboard button {
          background-color: #ef4444 !important;
          color: white !important;
          border: none !important;
          padding: 8px 16px !important;
          border-radius: 8px !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          font-size: 10px !important;
          cursor: pointer !important;
        }
        #qr-reader__status_span {
          display: none !important;
        }
        #html5-qrcode-anchor-scan-type-change {
          color: #94a3b8 !important;
          font-size: 10px !important;
          text-decoration: none !important;
        }
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}







