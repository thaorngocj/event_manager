'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Users, Search, Download, FileSpreadsheet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { apiClient } from '@/lib/api-client';
import { eventService } from '@/services/event.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AttendeeItem {
  id: number;
  userId: number;
  username: string;
  email: string;
  mssv: string;
  status: string;
  registeredAt: string;
  checkedInAt: string | null;
}

export default function AttendanceList() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
  const { t } = useLanguage();
  const [attendees, setAttendees] = useState<AttendeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('DANH SACH DANG KY SU KIEN', 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Ma su kien: ${eventId}`, 14, 30);
    doc.text(`Ngay xuat: ${new Date().toLocaleDateString('vi-VN')}`, 14, 36);
    doc.text(`Tong so: ${filtered.length}  |  Da diem danh: ${filtered.filter(a => a.status === 'CHECKED_IN').length}`, 14, 42);

    autoTable(doc, {
      head: [['MSSV', 'Ho ten', 'Email', 'Thoi gian diem danh', 'Trang thai']],
      body: filtered.map(item => [
        item.mssv || '-',
        item.username || '-',
        item.email || '-',
        item.checkedInAt ? new Date(item.checkedInAt).toLocaleString('vi-VN') : '-',
        item.status === 'CHECKED_IN' ? 'Da diem danh' : 'Da dang ky',
      ]),
      startY: 50,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38] },
      styles: { fontSize: 8 },
    });

    doc.save(`danh-sach-dang-ky-${eventId}.pdf`);
  };

  useEffect(() => {
    if (!eventId || eventId === 'recent') {
      setLoading(false);
      return;
    }
    async function load() {
      try {
        const res = await apiClient.get(`/events/${eventId}/registrations`);
        const list: AttendeeItem[] = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        setAttendees(list);
      } catch {
        setAttendees([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [eventId]);

  const filtered = attendees.filter(item =>
    item.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.mssv?.includes(searchQuery) ||
    item.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/checkin')}
            className="rounded-full hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic uppercase">Danh sách đăng ký</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
              {eventId === 'recent' ? 'SỰ KIỆN GẦN ĐÂY' : `SỰ KIỆN: ${eventId}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => eventId && eventId !== 'recent' && eventService.exportParticipants(eventId)}
            disabled={!eventId || eventId === 'recent' || attendees.length === 0}
            variant="outline"
            className="border-slate-200 font-bold uppercase tracking-widest text-[10px] h-10 px-4"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Xuất Excel
          </Button>
          <Button
            onClick={handleExportPDF}
            disabled={filtered.length === 0}
            className="bg-red-600 hover:bg-red-700 font-bold uppercase tracking-widest text-[10px] h-10 px-6"
          >
            <Download className="h-4 w-4 mr-2" />
            Xuất PDF
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Tổng đăng ký</p>
          <p className="text-3xl font-black text-slate-900 italic">{loading ? '...' : attendees.length}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Đã điểm danh</p>
          <p className="text-3xl font-black text-emerald-600 italic">{loading ? '...' : attendees.filter(a => a.status === 'CHECKED_IN').length}</p>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 p-4 md:p-6">
          <CardTitle className="text-lg italic uppercase tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-red-600" />
            {t('participants')} ({loading ? '...' : filtered.length})
          </CardTitle>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, MSSV, email..."
              className="pl-10 h-10 bg-white border-slate-200 rounded-xl font-bold uppercase tracking-widest text-[9px] w-full"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop table */}
          <div className="overflow-x-auto hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] py-4 pl-8">MSSV</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] py-4">Họ tên</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] py-4">Email</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] py-4">Thời gian điểm danh</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] py-4 pr-8 text-right">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-20 text-center font-black uppercase tracking-[0.2em] italic text-xs text-slate-400">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : filtered.length > 0 ? (
                  filtered.map(item => (
                    <TableRow key={item.id} className="hover:bg-slate-50 border-slate-50 transition-colors">
                      <TableCell className="font-black text-slate-900 py-4 pl-8 text-xs">{item.mssv || '-'}</TableCell>
                      <TableCell className="font-black text-slate-700 italic uppercase py-4 text-xs">{item.username || '-'}</TableCell>
                      <TableCell className="text-slate-500 font-bold py-4 text-xs">{item.email}</TableCell>
                      <TableCell className="text-slate-500 font-black py-4 text-xs font-mono">
                        {item.checkedInAt ? new Date(item.checkedInAt).toLocaleTimeString('vi-VN') : '-'}
                      </TableCell>
                      <TableCell className="py-4 pr-8 text-right">
                        <Badge className={item.status === 'CHECKED_IN'
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-black uppercase tracking-widest text-[9px] px-2 py-1"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-100 border-none font-black uppercase tracking-widest text-[9px] px-2 py-1"
                        }>
                          {item.status === 'CHECKED_IN' ? 'Đã điểm danh' : 'Đã đăng ký'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-20 text-center font-black uppercase tracking-[0.2em] italic text-xs text-slate-400">
                      {t('noAttendanceData')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {loading ? (
              <div className="py-20 text-center font-black uppercase tracking-[0.2em] italic text-xs text-slate-400">Đang tải...</div>
            ) : filtered.length > 0 ? (
              filtered.map(item => (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.mssv || '-'}</p>
                      <p className="font-black text-slate-800 italic uppercase text-sm mt-1">{item.username || '-'}</p>
                    </div>
                    <Badge className={item.status === 'CHECKED_IN'
                      ? "bg-emerald-100 text-emerald-700 font-black uppercase tracking-widest text-[8px] px-2 py-1 border-none shadow-sm"
                      : "bg-blue-100 text-blue-700 font-black uppercase tracking-widest text-[8px] px-2 py-1 border-none shadow-sm"
                    }>
                      {item.status === 'CHECKED_IN' ? 'Đã điểm danh' : 'Đã đăng ký'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 font-bold">{item.email}</p>
                    {item.checkedInAt && (
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {new Date(item.checkedInAt).toLocaleTimeString('vi-VN')}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center font-black uppercase tracking-[0.2em] italic text-xs text-slate-400">
                {t('noAttendanceData')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
