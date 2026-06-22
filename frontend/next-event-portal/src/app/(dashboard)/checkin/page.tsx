'use client'

import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Camera, ShieldCheck, RefreshCw, Search, Users, Download, UserCheck, Calendar, AlertCircle, Upload, Image as ImageIcon, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/context/LanguageContext';
import { useEvents } from '@/context/EventsContext';
import { useRegistrations } from '@/context/RegistrationsContext';
import { registrationService } from '@/services/registration.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function CheckIn() {
  const { events } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMethod, setScanMethod] = useState<'camera' | 'image'>('camera');
  const [manualEmail, setManualEmail] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<{ name: string; time: string; id: string } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraPermDenied, setCameraPermDenied] = useState(false);

  const { t, resolve } = useLanguage();
  const router = useRouter();
  const { registrations } = useRegistrations();

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
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
      // Ưu tiên dùng eventId từ trong QR code, fallback về dropdown nếu không có
      let targetEventId = resolvedEventId;
      try {
        const parsed = JSON.parse(rawText);
        if (parsed.eventId) targetEventId = String(parsed.eventId);
      } catch {
        // rawText không phải JSON hợp lệ, dùng resolvedEventId
      }
      const result = await registrationService.checkin(targetEventId, { qrData: rawText });
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
  const doQrCheckinRef = useRef(doQrCheckin);
  doQrCheckinRef.current = doQrCheckin;

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (!isScanning || !resolvedEventId || scanMethod !== 'camera') return;

    let mounted = true;
    setCameraError(null);

    const handleErr = (err: unknown) => {
      if (!mounted) return;
      const s = String(err).toLowerCase();
      const isDenied =
        s.includes('notallowed') || s.includes('permission') ||
        s.includes('denied') || s.includes('security');
      setCameraPermDenied(isDenied);
      setCameraError(
        isDenied
          ? 'Trình duyệt đang chặn quyền camera.\nNhấn "Cấp quyền Camera" bên dưới hoặc click 🔒 trên thanh địa chỉ → Camera → Cho phép.'
          : 'Không tìm thấy camera. Kiểm tra camera đã kết nối và không bị ứng dụng khác chiếm dụng.'
      );
      setIsScanning(false);
    };

    const startScan = async () => {
      // Tear down any stale stream (handles React StrictMode double-invoke)
      stopCamera();

      // --- 1. Open camera ---
      let stream: MediaStream;
      try {
        // Prefer rear camera on mobile; ideal constraint falls back gracefully on desktop
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (err) {
          if (mounted) handleErr(err);
          return;
        }
      }

      if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) { stopCamera(); return; }

      video.srcObject = stream;
      video.playsInline = true;
      video.muted = true;

      try {
        await video.play();
      } catch (err) {
        if (mounted) handleErr(err);
        return;
      }
      if (!mounted) return;

      // --- 2. QR scan loop (jsqr on canvas frames ~10 fps) ---
      const jsqr = (await import('jsqr')).default;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

      let lastScanAt = 0;

      const scanLoop = (ts: DOMHighResTimeStamp) => {
        if (!mounted) return;
        rafRef.current = requestAnimationFrame(scanLoop);

        // Throttle to ~10 fps
        if (ts - lastScanAt < 100) return;
        lastScanAt = ts;

        if (!video || video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA || video.videoWidth === 0) return;

        if (canvas.width !== video.videoWidth) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        ctx.drawImage(video, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result = jsqr(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (result && mounted) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = 0;
          stopCamera();
          setIsScanning(false);
          void doQrCheckinRef.current(result.data);
        }
      };

      rafRef.current = requestAnimationFrame(scanLoop);
    };

    void startScan();

    return () => {
      mounted = false;
      stopCamera();
    };
  }, [isScanning, resolvedEventId, scanMethod, stopCamera]);

  const toggleScanner = () => {
    if (!resolvedEventId) { toast.error('Vui lòng chọn sự kiện trước'); return; }
    if (isScanning) { stopCamera(); setIsScanning(false); }
    else { setIsScanning(true); }
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
      toast.loading('Đang xử lý ảnh...', { id: 'scan-file' });
      const lib = await import('html5-qrcode');
      const reader = new lib.Html5Qrcode('qr-reader-file-hidden');
      const result = await reader.scanFile(file, true);
      reader.clear();
      await doQrCheckinRef.current(result);
    } catch {
      toast.error('Không tìm thấy mã QR hợp lệ trong ảnh này');
    } finally {
      toast.dismiss('scan-file');
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic uppercase">
          {t('eventCheckIn')}
        </h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Select value={resolvedEventId} onValueChange={(v) => { if (v) setSelectedEventId(v); }}>
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
          {resolvedEventId && (
            <Badge className="bg-red-600 font-bold uppercase tracking-widest text-[10px] px-3 py-2 shrink-0">
              {t('activeSession')}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── LEFT: Scanner + manual ── */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
            {/* Card header */}
            <CardHeader className="bg-slate-900 text-white py-3 px-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Camera className="h-4 w-4 text-red-500 shrink-0" />
                  <div>
                    <CardTitle className="text-sm italic uppercase tracking-tight leading-none">
                      {t('qrScanner')}
                    </CardTitle>
                    <CardDescription className="text-slate-400 italic font-medium text-[10px] mt-0.5">
                      {t('scanPrompt')}
                    </CardDescription>
                  </div>
                </div>
                {/* Mode switcher */}
                <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                  <button
                    onClick={() => { setScanMethod('camera'); }}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all',
                      scanMethod === 'camera' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    )}
                  >
                    Camera
                  </button>
                  <button
                    onClick={() => { setScanMethod('image'); stopCamera(); setIsScanning(false); }}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all',
                      scanMethod === 'image' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    )}
                  >
                    Ảnh QR
                  </button>
                </div>
              </div>
            </CardHeader>

            {/* Camera viewport */}
            <CardContent className="p-0 bg-black relative overflow-hidden" style={{ aspectRatio: '3/4', maxHeight: '520px' }}>
              {/* Hidden element for file-based QR scanning */}
              <div id="qr-reader-file-hidden" className="hidden" />

              {/* ── No event selected ── */}
              {!resolvedEventId && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-slate-600" />
                  </div>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs text-center px-6">
                    Vui lòng chọn sự kiện bên trên
                  </p>
                </div>
              )}

              {/* ── Camera mode ── */}
              {resolvedEventId && scanMethod === 'camera' && (
                <>
                  {/* Native video element — no html5-qrcode DOM injection */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ display: isScanning ? 'block' : 'none' }}
                  />

                  {/* ── Scanning overlay (corners + scan line + stop button) ── */}
                  {isScanning && !cameraError && (
                    <div className="absolute inset-0 z-10">
                      {/* Semi-transparent vignette around the scan frame */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div
                          className="w-64 h-64 relative"
                          style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.52)' }}
                        >
                          {/* Corner brackets */}
                          <span className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-white rounded-tl-sm" />
                          <span className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-white rounded-tr-sm" />
                          <span className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-white rounded-bl-sm" />
                          <span className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-white rounded-br-sm" />
                          {/* Animated red scan line */}
                          <span className="absolute left-1 right-1 h-0.5 bg-red-400 shadow-[0_0_8px_2px_rgba(239,68,68,0.55)] animate-[scan_2s_ease-in-out_infinite]" />
                        </div>
                      </div>

                      {/* Hint label below frame */}
                      <div className="absolute left-0 right-0 flex justify-center pointer-events-none" style={{ top: 'calc(50% + 148px)' }}>
                        <p className="text-white/70 text-[11px] font-medium tracking-wide">
                          Đưa mã QR vào khung để quét
                        </p>
                      </div>

                      {/* Stop button */}
                      <div className="absolute bottom-5 left-0 right-0 flex justify-center pointer-events-auto">
                        <button
                          onClick={toggleScanner}
                          className="flex items-center gap-2 px-5 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[11px] font-black uppercase tracking-widest hover:bg-black/60 transition-all active:scale-95"
                        >
                          <X className="h-3.5 w-3.5" /> Dừng quét
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Camera error state ── */}
                  {cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-20 p-6 gap-4">
                      <AlertCircle className="h-10 w-10 text-red-500 shrink-0" />
                      <p className="text-white font-bold text-[13px] text-center whitespace-pre-line leading-relaxed">
                        {cameraError}
                      </p>
                      <div className="flex flex-col gap-2 w-full max-w-xs">
                        {cameraPermDenied && (
                          <Button
                            onClick={async () => {
                              try {
                                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                                stream.getTracks().forEach(t => t.stop());
                                setCameraError(null);
                                setCameraPermDenied(false);
                                setIsScanning(true);
                              } catch {
                                setCameraError('Quyền camera bị từ chối. Nhấn biểu tượng 🔒 trên thanh địa chỉ → Camera → Cho phép, rồi tải lại trang.');
                              }
                            }}
                            className="bg-white text-slate-900 hover:bg-slate-100 font-black uppercase tracking-widest text-[10px] rounded-xl h-11"
                          >
                            <Camera className="h-3.5 w-3.5 mr-2" /> Cấp quyền Camera
                          </Button>
                        )}
                        <Button
                          onClick={() => { setCameraError(null); setCameraPermDenied(false); setIsScanning(true); }}
                          variant="outline"
                          className="border-slate-700 text-white hover:bg-slate-800 font-black uppercase tracking-widest text-[10px] rounded-xl h-10"
                        >
                          <RefreshCw className="h-3.5 w-3.5 mr-2" /> Thử lại
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* ── Idle state (not scanning) ── */}
                  {!isScanning && !cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-10">
                      <div className="w-24 h-24 bg-slate-800/80 rounded-full flex items-center justify-center mb-6 border-4 border-slate-700 shadow-2xl">
                        <QrCode className="h-11 w-11 text-slate-400" />
                      </div>
                      <p className="text-slate-400 text-sm font-black italic uppercase tracking-widest mb-1">
                        {t('scannerIdle')}
                      </p>
                      <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-8">
                        SẴN SÀNG HOẠT ĐỘNG
                      </p>
                      <Button
                        onClick={toggleScanner}
                        className="bg-red-600 hover:bg-red-700 font-black uppercase tracking-widest text-xs h-12 px-10 rounded-xl shadow-2xl shadow-red-900/50 transition-all active:scale-95"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        {t('startScanning')}
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* ── Image upload mode ── */}
              {resolvedEventId && scanMethod === 'image' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full max-w-xs aspect-square rounded-3xl border-2 border-dashed border-slate-700 hover:border-red-600/60 hover:bg-slate-900/60 transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="h-8 w-8 text-slate-500 group-hover:text-red-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-black italic uppercase tracking-tighter">Tải lên ảnh QR</p>
                      <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1">Chọn từ thư viện hoặc tệp</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-slate-500">
                    <ImageIcon className="h-3 w-3" />
                    <p className="text-[9px] font-bold uppercase tracking-widest">Định dạng: JPG, PNG, WEBP</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manual email checkin */}
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg italic uppercase tracking-tight flex items-center gap-3">
                <Search className="h-5 w-5 text-red-600" />
                ĐIỂM DANH THỦ CÔNG
              </CardTitle>
              <CardDescription className="italic font-medium text-slate-500">
                Nhập email sinh viên để điểm danh trực tiếp.
              </CardDescription>
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
                {manualLoading
                  ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  : <UserCheck className="h-4 w-4 mr-2" />}
                Điểm danh
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT: Status + stats ── */}
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
                    <p className="text-[9px] text-emerald-700 font-bold uppercase tracking-widest">
                      {lastCheckIn.id} • {t('verifiedAt')} {lastCheckIn.time}
                    </p>
                  </div>
                  <div className="ml-4">
                    <Badge className="bg-emerald-600 font-bold uppercase tracking-widest text-[9px] border-none shadow-lg shadow-emerald-900/20">
                      {t('verified')}
                    </Badge>
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
                onClick={() => router.push(`/attendance/${resolvedEventId || 'recent'}`)}
                className="flex-1 bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[10px] h-11 rounded-xl shadow-lg shadow-slate-900/10"
              >
                <Users className="h-4 w-4 mr-2" />
                {t('viewAttendance')}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/attendance/${resolvedEventId || 'recent'}`)}
                className="h-11 w-11 p-0 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 2%; }
          50% { top: 95%; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}
