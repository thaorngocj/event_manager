'use client'

import { useRouter } from 'next/navigation';

import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserRole } from '@/types';
import { UserCog, User, Search, Mail, Fingerprint, ShieldCheck, Filter, Download, Upload, X, CheckCircle2, AlertCircle, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useUsers } from '@/context/UsersContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { userService } from '@/services/user.service';
import { toast } from 'sonner';

type ImportRow = {
  email: string;
  password: string;
  schoolId: string;
  role: string;
  name: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
};

export default function UserManagement() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const { user: currentUser } = useAuth();
  const { users, loading } = useUsers();

  // ── Excel import state ──
  const [showImport, setShowImport] = useState(false);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExcelFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (e.target) e.target.value = '';

    try {
      const XLSX = await import('xlsx');
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });

      if (raw.length === 0) { toast.error('File Excel không có dữ liệu'); return; }

      // Normalize column headers (case-insensitive, trim spaces)
      const norm = (v: unknown) => String(v ?? '').trim();
      const findCol = (row: Record<string, unknown>, ...keys: string[]) => {
        for (const k of Object.keys(row)) {
          if (keys.some(key => k.toLowerCase().replace(/\s/g, '') === key.toLowerCase().replace(/\s/g, ''))) {
            return norm(row[k]);
          }
        }
        return '';
      };

      const rows: ImportRow[] = raw.map(r => {
        const email    = findCol(r, 'email');
        const password = findCol(r, 'password', 'matkhau', 'mật khẩu');
        const schoolId = findCol(r, 'mssv', 'schoolid', 'studentid', 'masinhvien', 'mã số sinh viên');
        const rolRaw   = findCol(r, 'role', 'vaitro', 'vai trò', 'chucvu');
        const name     = findCol(r, 'name', 'hoten', 'họ tên', 'fullname', 'ten');

        // Map role text → enum
        const roleMap: Record<string, string> = {
          admin: UserRole.ADMIN,
          'quản trị': UserRole.ADMIN,
          'quan tri': UserRole.ADMIN,
          'event_manager': UserRole.EVENT_MANAGER,
          'eventmanager': UserRole.EVENT_MANAGER,
          'ban to chuc': UserRole.EVENT_MANAGER,
          'ban tổ chức': UserRole.EVENT_MANAGER,
          'to chuc': UserRole.EVENT_MANAGER,
          student: UserRole.STUDENT,
          'sinh vien': UserRole.STUDENT,
          'sinh viên': UserRole.STUDENT,
        };
        const role = roleMap[rolRaw.toLowerCase()] ?? UserRole.STUDENT;

        const error = !email ? 'Thiếu email' : !password ? 'Thiếu mật khẩu' : '';
        return { email, password, schoolId, role, name, status: error ? 'error' : 'pending', error } as ImportRow;
      });

      setImportRows(rows);
      setShowImport(true);
    } catch (err) {
      console.error(err);
      toast.error('Không thể đọc file Excel. Kiểm tra định dạng .xlsx / .xls');
    }
  };

  const handleImport = async () => {
    const valid = importRows.filter(r => r.status !== 'error');
    if (valid.length === 0) { toast.error('Không có dòng hợp lệ để nhập'); return; }

    setImporting(true);
    let success = 0, failed = 0;

    // Try bulk first, fall back to per-row
    try {
      await userService.importBulk(valid.map(r => ({
        email: r.email, password: r.password,
        schoolId: r.schoolId, role: r.role, name: r.name,
      })));
      success = valid.length;
      setImportRows(prev => prev.map(r => r.status === 'pending' ? { ...r, status: 'success' } : r));
    } catch {
      // Fall back to individual creates
      const updated = [...importRows];
      for (let i = 0; i < updated.length; i++) {
        if (updated[i].status === 'error') continue;
        try {
          await userService.create({ email: updated[i].email, password: updated[i].password, schoolId: updated[i].schoolId, role: updated[i].role, name: updated[i].name });
          updated[i] = { ...updated[i], status: 'success' };
          success++;
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Lỗi';
          updated[i] = { ...updated[i], status: 'error', error: msg };
          failed++;
        }
        setImportRows([...updated]);
      }
    }

    setImporting(false);
    if (success > 0) toast.success(`Đã nhập ${success} người dùng thành công${failed > 0 ? `, ${failed} thất bại` : ''}`);
    else toast.error(`Nhập thất bại (${failed} lỗi)`);
  };

  const canAccess = currentUser?.role === UserRole.ADMIN;

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.schoolId.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('DANH SACH NGUOI DUNG HE THONG', 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Ngay xuat: ${new Date().toLocaleDateString('vi-VN')}`, 14, 30);
    doc.text(`Tong so: ${filteredUsers.length}  |  Sinh vien: ${filteredUsers.filter(u => u.role === UserRole.STUDENT).length}  |  Ban to chuc: ${filteredUsers.filter(u => u.role === UserRole.EVENT_MANAGER).length}  |  Admin: ${filteredUsers.filter(u => u.role === UserRole.ADMIN).length}`, 14, 36);

    autoTable(doc, {
      head: [['Ho ten', 'Email', 'MSSV', 'Vai tro', 'Trang thai']],
      body: filteredUsers.map(u => [
        u.name,
        u.email,
        u.schoolId || '-',
        u.role === UserRole.ADMIN ? 'Admin' : u.role === UserRole.EVENT_MANAGER ? 'Ban to chuc' : 'Sinh vien',
        u.status,
      ]),
      startY: 44,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38] },
      styles: { fontSize: 8 },
    });

    doc.save(`danh-sach-nguoi-dung-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const getRoleIcon = (role: string) => {
    switch (role as UserRole) {
      case UserRole.ADMIN: return <ShieldCheck className="h-4 w-4 text-red-600" />;
      case UserRole.EVENT_MANAGER: return <UserCog className="h-4 w-4 text-blue-600" />;
      default: return <User className="h-4 w-4 text-slate-400" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role as UserRole) {
      case UserRole.ADMIN: return t('admin');
      case UserRole.EVENT_MANAGER: return t('eventManager');
      case UserRole.STUDENT: return t('student');
      default: return role;
    }
  };

  if (!canAccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <ShieldCheck className="h-12 w-12 text-slate-200 mx-auto" />
          <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Không có quyền truy cập</p>
          <p className="text-slate-400 text-xs">Chỉ ADMIN mới có thể xem danh sách người dùng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">{t('userControl')}</h1>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t('manageRoles')}</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Tổng người dùng</p>
          <p className="text-3xl font-black text-slate-900 italic">{users.length}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Sinh viên</p>
          <p className="text-3xl font-black text-blue-600 italic">{users.filter(u => u.role === UserRole.STUDENT).length}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Ban tổ chức</p>
          <p className="text-3xl font-black text-amber-600 italic">{users.filter(u => u.role === UserRole.EVENT_MANAGER).length}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Quản trị</p>
          <p className="text-3xl font-black text-red-600 italic">{users.filter(u => u.role === UserRole.ADMIN).length}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchUserPlaceholder')}
            className="pl-12 h-12 bg-white border-slate-200 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-sm"
          />
        </div>
        <Button variant="outline" className="h-12 w-12 p-0 border-slate-200 rounded-xl bg-white shadow-sm shrink-0">
          <Filter className="h-4 w-4 text-slate-400" />
        </Button>
        {/* Import Excel */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleExcelFile}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="bg-emerald-600 hover:bg-emerald-700 font-bold uppercase tracking-widest text-[10px] h-12 px-5 rounded-xl shadow-sm shrink-0"
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Nhập Excel
        </Button>
        <Button
          onClick={handleExportPDF}
          disabled={filteredUsers.length === 0}
          className="bg-red-600 hover:bg-red-700 font-bold uppercase tracking-widest text-[10px] h-12 px-5 rounded-xl shadow-sm shrink-0"
        >
          <Download className="h-4 w-4 mr-2" />
          Xuất PDF
        </Button>
      </div>

      {/* ── Import Excel Modal ── */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white shrink-0">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="font-black uppercase tracking-tight text-sm">Nhập danh sách người dùng từ Excel</p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    {importRows.length} dòng · {importRows.filter(r => r.status !== 'error').length} hợp lệ · {importRows.filter(r => r.status === 'error').length} lỗi
                  </p>
                </div>
              </div>
              <button onClick={() => { setShowImport(false); setImportRows([]); }} className="text-slate-400 hover:text-white transition-colors p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Template hint */}
            <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-100 shrink-0">
              <p className="text-emerald-800 text-[11px] font-bold">
                Cột cần có: <span className="font-black">email · password · mssv · role · name</span>
                &nbsp;— role: <span className="italic">student / event_manager / admin</span>
              </p>
            </div>

            {/* Table preview */}
            <div className="overflow-auto flex-1">
              <table className="w-full text-[11px]">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-black uppercase tracking-widest text-slate-400 text-[9px] w-8">#</th>
                    <th className="px-4 py-3 text-left font-black uppercase tracking-widest text-slate-400 text-[9px]">Email</th>
                    <th className="px-4 py-3 text-left font-black uppercase tracking-widest text-slate-400 text-[9px]">Mật khẩu</th>
                    <th className="px-4 py-3 text-left font-black uppercase tracking-widest text-slate-400 text-[9px]">MSSV</th>
                    <th className="px-4 py-3 text-left font-black uppercase tracking-widest text-slate-400 text-[9px]">Họ tên</th>
                    <th className="px-4 py-3 text-left font-black uppercase tracking-widest text-slate-400 text-[9px]">Role</th>
                    <th className="px-4 py-3 text-left font-black uppercase tracking-widest text-slate-400 text-[9px]">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {importRows.map((row, i) => (
                    <tr key={i} className={cn(
                      'transition-colors',
                      row.status === 'error' && 'bg-red-50',
                      row.status === 'success' && 'bg-emerald-50',
                    )}>
                      <td className="px-4 py-2.5 text-slate-400 font-bold">{i + 1}</td>
                      <td className="px-4 py-2.5 font-bold text-slate-800">{row.email || <span className="text-red-400 italic">trống</span>}</td>
                      <td className="px-4 py-2.5 text-slate-500 font-mono">{'•'.repeat(Math.min(row.password.length, 8))}</td>
                      <td className="px-4 py-2.5 text-slate-600 font-bold">{row.schoolId || '—'}</td>
                      <td className="px-4 py-2.5 text-slate-600">{row.name || '—'}</td>
                      <td className="px-4 py-2.5">
                        <span className={cn(
                          'px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider',
                          row.role === UserRole.ADMIN && 'bg-red-100 text-red-700',
                          row.role === UserRole.EVENT_MANAGER && 'bg-blue-100 text-blue-700',
                          row.role === UserRole.STUDENT && 'bg-slate-100 text-slate-600',
                        )}>
                          {row.role === UserRole.ADMIN ? 'Admin' : row.role === UserRole.EVENT_MANAGER ? 'Ban TC' : 'Sinh viên'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        {row.status === 'pending' && <span className="text-slate-400 text-[9px] font-bold uppercase">Chờ nhập</span>}
                        {row.status === 'success' && <span className="flex items-center gap-1 text-emerald-600 text-[9px] font-black uppercase"><CheckCircle2 className="h-3 w-3" />Thành công</span>}
                        {row.status === 'error' && (
                          <span className="flex items-center gap-1 text-red-500 text-[9px] font-black uppercase">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            {row.error || 'Lỗi'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0 gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-slate-800 transition-colors flex items-center gap-1.5"
              >
                <Upload className="h-3.5 w-3.5" /> Chọn file khác
              </button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => { setShowImport(false); setImportRows([]); }}
                  className="font-black uppercase tracking-widest text-[10px] h-10 px-5 rounded-xl border-slate-200"
                  disabled={importing}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={importing || importRows.filter(r => r.status === 'pending').length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl"
                >
                  {importing
                    ? <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />Đang nhập...</>
                    : <><Upload className="h-3.5 w-3.5 mr-2" />Nhập {importRows.filter(r => r.status === 'pending').length} người dùng</>
                  }
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card className="border-none shadow-xl bg-white rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-50 bg-slate-50/50">
                  <TableHead className="text-[10px] uppercase font-black tracking-widest text-slate-400 py-6 pl-8">{t('identityHeader')}</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-widest text-slate-400">{t('permissionsHeader')}</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-widest text-slate-400 text-center">{t('statusHeader')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-red-50/20 transition-colors border-b border-slate-50 last:border-0">
                    <TableCell className="py-6 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black italic border-2 border-white shadow-sm">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 italic uppercase text-sm">{user.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              <Mail className="h-2.5 w-2.5 mr-1" />
                              {user.email}
                            </span>
                            <span className="flex items-center text-[9px] font-black text-slate-400 uppercase tracking-widest border-l border-slate-200 pl-3">
                              <Fingerprint className="h-2.5 w-2.5 mr-1" />
                              {user.schoolId}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700 uppercase tracking-widest w-[180px]">
                        {getRoleIcon(user.role)}
                        {getRoleLabel(user.role)}
                      </div>
                    </TableCell>
                    <TableCell className="py-6 text-center">
                      <Badge variant={user.status === 'Active' ? 'secondary' : 'outline'} className={cn(
                        "px-3 py-1 font-black text-[9px] tracking-widest uppercase border-none",
                        user.status === 'Active' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'bg-slate-50 text-slate-400 shadow-sm'
                      )}>
                        {t(user.status.toLowerCase())}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-slate-100">
             {filteredUsers.map((user) => (
               <div key={user.id} className="p-4 space-y-3">
                 <div className="flex justify-between items-start">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black italic border-2 border-white shadow-sm shrink-0">
                       {user.name[0]}
                     </div>
                     <div>
                       <p className="font-black text-slate-900 italic uppercase text-xs">{user.name}</p>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{user.schoolId}</p>
                     </div>
                   </div>
                   <Badge variant={user.status === 'Active' ? 'secondary' : 'outline'} className={cn(
                     "px-2 py-0.5 font-black text-[8px] tracking-widest uppercase border-none",
                     user.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'
                   )}>
                     {t(user.status.toLowerCase())}
                   </Badge>
                 </div>

                 <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700 uppercase">
                   {getRoleIcon(user.role)}
                   {getRoleLabel(user.role)}
                 </div>

                 <div className="pt-1">
                   <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                     <Mail className="h-2.5 w-2.5" />
                     {user.email}
                   </p>
                 </div>
               </div>
             ))}
          </div>

          {loading && (
            <div className="py-20 text-center">
              <div className="h-8 w-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}
          {!loading && filteredUsers.length === 0 && (
            <div className="py-20 text-center">
              <div className="flex flex-col items-center gap-3">
                 <Search className="h-8 w-8 text-slate-200" />
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t('noResultsFound')}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
