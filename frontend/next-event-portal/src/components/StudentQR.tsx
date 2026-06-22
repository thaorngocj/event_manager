'use client'

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { QrCode } from 'lucide-react';

export function StudentQR() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden max-w-xs mx-auto">
      <CardHeader className="text-center bg-red-600 text-white pb-6 pt-8">
        <CardTitle className="text-xl font-bold tracking-tight">Thẻ sinh viên</CardTitle>
        <CardDescription className="text-red-100 italic">Mã nhận dạng tài khoản của bạn</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 pt-6">
        <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center">
          <QrCode className="h-10 w-10 text-red-600" />
        </div>
        <div className="text-center">
          <p className="font-bold text-gray-900 text-lg">{user.displayName}</p>
          <p className="text-xs text-gray-400 font-mono mt-1">{user.email}</p>
          {user.schoolId && (
            <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-widest">MSSV: {user.schoolId}</p>
          )}
        </div>
        <Link href="/my-events" className="w-full">
          <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl h-11">
            <QrCode className="h-4 w-4 mr-2" />
            Xem QR vé sự kiện
          </Button>
        </Link>
        <p className="text-[10px] text-gray-400 text-center">
          Vào <strong>Sự kiện của tôi</strong> để lấy QR điểm danh cho từng sự kiện
        </p>
      </CardContent>
    </Card>
  );
}


