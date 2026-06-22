/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

export function StudentQR() {
  const { user } = useAuth();
  const [timestamp] = useState(() => Date.now());

  if (!user) return null;

  const qrData = JSON.stringify({
    uid: user.uid,
    email: user.email,
    schoolId: user.schoolId,
    timestamp
  });

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden max-w-xs mx-auto">
      <CardHeader className="text-center bg-red-600 text-white pb-6 pt-8">
        <CardTitle className="text-xl font-bold tracking-tight">Your Participation ID</CardTitle>
        <CardDescription className="text-red-100 italic">Present this at the event entry</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center -mt-6">
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 transition-transform hover:scale-105 duration-300">
          <QRCodeCanvas 
            value={qrData} 
            size={180}
            level="H"
            includeMargin={true}
            fgColor="#B91C1C" // red-700
          />
        </div>
        <div className="mt-6 text-center">
           <p className="font-bold text-gray-900">{user.displayName}</p>
           <p className="text-xs text-gray-400 font-mono mt-1">{user.schoolId}</p>
        </div>
      </CardContent>
    </Card>
  );
}


