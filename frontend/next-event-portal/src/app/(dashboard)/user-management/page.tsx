'use client'

import { useRouter } from 'next/navigation';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserRole } from '@/types';
import { UserCog, User, Search, Mail, Fingerprint, ShieldCheck, Filter, Download } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useUsers } from '@/context/UsersContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function UserManagement() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const { user: currentUser } = useAuth();
  const { users, loading } = useUsers();

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

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchUserPlaceholder')}
            className="pl-12 h-12 bg-white border-slate-200 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-sm"
          />
        </div>
        <Button variant="outline" className="h-12 w-12 p-0 border-slate-200 rounded-xl bg-white shadow-sm">
          <Filter className="h-4 w-4 text-slate-400" />
        </Button>
        <Button
          onClick={handleExportPDF}
          disabled={filteredUsers.length === 0}
          className="bg-red-600 hover:bg-red-700 font-bold uppercase tracking-widest text-[10px] h-12 px-5 rounded-xl shadow-sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Xuất PDF
        </Button>
      </div>

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
