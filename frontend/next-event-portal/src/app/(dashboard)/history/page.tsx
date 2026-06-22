'use client'

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { registrationService } from '@/services/registration.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface HistoryItem {
  id: number;
  eventId: number;
  eventTitle: string;
  eventDate: string;
  status: string;
  registeredAt: string;
  checkedInAt: string | null;
}

export default function ParticipationHistory() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await registrationService.getMyEvents();
        const list: HistoryItem[] = Array.isArray(data) ? data : (data?.data ?? data?.items ?? []);
        // Only show attended (checked-in) events
        setHistory(list.filter(r => r.status === 'CHECKED_IN'));
      } catch {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = history.filter(item =>
    item.eventTitle?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('LICH SU NGAY REN LUYEN', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    if (user) {
      doc.text(`Ho ten: ${user.displayName || 'N/A'}`, 14, 30);
      doc.text(`Email: ${user.email || 'N/A'}`, 14, 35);
    }
    doc.text(`Ngay xuat: ${new Date().toLocaleDateString('vi-VN')}`, 14, 40);
    doc.text(`Tong su kien da tham du: ${filtered.length}`, 14, 45);

    autoTable(doc, {
      head: [['Ten su kien', 'Ngay su kien', 'Thoi gian diem danh', 'Trang thai']],
      body: filtered.map(item => [
        item.eventTitle || '-',
        item.eventDate ? new Date(item.eventDate).toLocaleDateString('vi-VN') : '-',
        item.checkedInAt ? new Date(item.checkedInAt).toLocaleString('vi-VN') : '-',
        'Da tham du',
      ]),
      startY: 55,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38] },
      styles: { fontSize: 9 },
    });

    doc.save(`lich-su-nrl-${user?.uid || 'guest'}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight italic uppercase">{t('historyTitle')}</h1>
          <p className="text-gray-500 font-medium">{t('historySubtitle')}</p>
        </div>
        <Button
          onClick={handleExportPDF}
          disabled={filtered.length === 0}
          className="bg-red-600 hover:bg-red-700 font-bold uppercase tracking-widest text-[10px] h-10 px-6"
        >
          <Download className="h-4 w-4 mr-2" />
          {t('exportPDF')}
        </Button>
      </div>

      {/* NRL Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Tổng sự kiện đã tham dự</p>
          <p className="text-3xl font-black text-red-600 italic">{history.length}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Kết quả tìm kiếm</p>
          <p className="text-3xl font-black text-slate-900 italic">{filtered.length}</p>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden rounded-xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 bg-slate-50/50 border-b border-slate-100">
          <div>
            <CardTitle className="text-lg italic">{t('trainingLogs')}</CardTitle>
            <CardDescription className="font-medium">
              Tổng sự kiện đã tham dự: <span className="text-red-600 font-bold">{filtered.length}</span>
            </CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('searchLogs')}
              className="pl-9 w-[200px] border-slate-200"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-red-100 hover:bg-transparent bg-white">
                <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400 pl-8">Tên sự kiện</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Ngày sự kiện</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Thời gian điểm danh</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400 text-right pr-8">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest italic">
                    Chưa có sự kiện nào được điểm danh
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} className="hover:bg-red-50/30 transition-colors border-b border-slate-50">
                    <TableCell className="font-semibold text-slate-900 py-4 pl-8">{item.eventTitle || '-'}</TableCell>
                    <TableCell className="text-slate-500 py-4">
                      {item.eventDate ? new Date(item.eventDate).toLocaleDateString('vi-VN') : '-'}
                    </TableCell>
                    <TableCell className="text-slate-500 py-4 font-mono text-xs">
                      {item.checkedInAt ? new Date(item.checkedInAt).toLocaleString('vi-VN') : '-'}
                    </TableCell>
                    <TableCell className="text-right py-4 pr-8">
                      <Badge variant="secondary" className="rounded shadow-none border-none font-bold uppercase tracking-wider text-[9px] px-2 py-0.5 bg-emerald-100 text-emerald-700">
                        Đã tham dự
                      </Badge>
                    </TableCell>
                  </tr>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
