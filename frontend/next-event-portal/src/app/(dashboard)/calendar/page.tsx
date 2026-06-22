'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function CalendarPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/events?tab=calendar');
  }, [router]);
  return null;
}
