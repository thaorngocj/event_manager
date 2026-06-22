'use client'

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useParams, useRouter } from 'next/navigation';
import { useEvents } from '@/context/EventsContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRegistrations } from '@/context/RegistrationsContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Calendar, MapPin, Clock, ArrowLeft, Users, Share2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { events } = useEvents();
  const { t, resolve } = useLanguage();
  const { user, loading } = useAuth();
  const { registerForEvent, isUserRegistered } = useRegistrations();

  const event = events.find(e => e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50">
        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">Không tìm thấy sự kiện</h1>
        <Button onClick={() => router.push('/')} className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-[10px]">
          Về trang chủ
        </Button>
      </div>
    );
  }

  const registered = user ? isUserRegistered(user.uid, event.id) : false;

  const [showConfirm, setShowConfirm] = useState(false);

  const handleRegister = () => {
    if (!user) {
      toast.error(t('loginToRegister'));
      router.push('/login');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmRegister = () => {
    registerForEvent(user!.uid, event.id);
    toast.success(t('registrationSuccess'));
    setShowConfirm(false);
  };

  return (
    <>
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20">
      {/* Hero Section */}
      <div className="relative h-[55vh] md:h-[65vh] overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src={event.image || 'https://images.unsplash.com/photo-1540575861501-7ad060e39fe5?auto=format&fit=crop&q=80&w=2000'} 
          alt={resolve(event.title)} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20"></div>
        
        <div className="absolute top-6 left-6 md:top-10 md:left-10 z-40">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="text-white hover:bg-white/20 backdrop-blur-xl border border-white/10 font-bold uppercase tracking-[0.2em] text-[10px] gap-2 px-5 h-11 rounded-full transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('back')}
          </Button>
        </div>

        <div className="absolute bottom-20 left-6 right-6 md:left-12 md:right-12 z-20">
          <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="bg-red-600/90 text-white font-black uppercase tracking-[0.3em] text-[10px] px-5 py-2 border-none backdrop-blur-md rounded-full">
                {event.category}
              </Badge>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-5xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.85] max-w-4xl"
            >
              {resolve(event.title)}
            </motion.h1>
          </div>
        </div>
        
        {/* Decorative Curve or Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f8fafc] to-transparent z-10"></div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto -mt-16 sm:-mt-20 relative z-30 px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* Main Content Area (Column Span 8) */}
          <div className="lg:col-span-8 space-y-8 md:space-y-10">
            {/* Quick Info Bar */}
            <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-6 md:p-4 shadow-2xl shadow-slate-200/60 border border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 md:px-10">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                  <Calendar className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                  <p className="text-sm font-bold text-slate-900 italic uppercase">{event.date}</p>
                </div>
              </div>
              <div className="h-[1px] md:h-10 w-full md:w-[1px] bg-slate-100"></div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</p>
                  <p className="text-sm font-bold text-slate-900 italic uppercase">{event.startTime}</p>
                </div>
              </div>
              <div className="h-[1px] md:h-10 w-full md:w-[1px] bg-slate-100"></div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <MapPin className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="truncate">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                  <p className="text-sm font-bold text-slate-900 italic uppercase truncate">{resolve(event.location)}</p>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-red-600 grow-0 shrink-0">
                  {t('eventIntroductionTitle')}
                </h2>
                <div className="h-[1px] bg-slate-200 grow"></div>
              </div>
              
              <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-6 md:p-12 shadow-xl shadow-slate-200/40 border border-slate-100/50">
                <div className="prose prose-slate max-w-none">
                  <div className="text-slate-600 text-base md:text-lg font-medium leading-relaxed whitespace-pre-wrap first-letter:text-4xl md:first-letter:text-5xl first-letter:font-black first-letter:text-red-600 first-letter:mr-3 first-letter:float-left">
                    {resolve(event.description) || "No detailed description provided for this event yet. Check back soon for more updates and exciting announcements regarding the schedule, speakers, and activities planned for this session."}
                  </div>
                </div>
              </div>
            </section>

            {/* Detailed Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl md:rounded-[2rem] p-6 md:p-8 shadow-lg shadow-slate-100 border border-slate-100 flex items-start gap-4 md:gap-6 group hover:border-red-100 transition-colors">
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-red-50 transition-colors">
                  <Users className="h-6 w-6 md:h-7 md:w-7 text-slate-400 group-hover:text-red-600 transition-colors" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Capacity</p>
                  <p className="text-xl md:text-2xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">{event.capacity} People</p>
                  <p className="text-[10px] text-slate-400 font-medium">Limited spots available. RSVP now.</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl md:rounded-[2rem] p-6 md:p-8 shadow-lg shadow-slate-100 border border-slate-100 flex items-start gap-4 md:gap-6 group hover:border-red-100 transition-colors">
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-red-50 transition-colors">
                  <Clock className="h-6 w-6 md:h-7 md:w-7 text-slate-400 group-hover:text-red-600 transition-colors" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registration Ends</p>
                  <p className="text-xl md:text-2xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">{event.closingDate || event.date}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Don&apos;t miss the deadline.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Area (Column Span 4) */}
          <div className="lg:col-span-4 lg:pl-4">
            <div className="sticky top-28 space-y-8">
              {/* Registration Card */}
              <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-slate-300/40 border border-slate-100 ring-1 ring-slate-100 flex flex-col items-center text-center">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6 md:mb-8 ring-8 ring-slate-50/50">
                  <Badge className="bg-red-600 h-8 w-8 md:h-10 md:w-10 p-0 flex items-center justify-center rounded-full animate-pulse border-none shadow-lg shadow-red-200">
                    <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-8 md:mb-10">
                  <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter text-slate-900 uppercase leading-[0.9]">
                    Reserve Your Ticket
                  </h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Available for all students
                  </p>
                </div>

                <div className="w-full space-y-4">
                  <Button
                    disabled={registered || loading}
                    onClick={handleRegister}
                    className={cn(
                      "w-full h-14 md:h-16 rounded-2xl font-black uppercase tracking-widest italic transition-all group overflow-hidden relative shadow-lg active:scale-95",
                      registered 
                        ? "bg-slate-100 text-slate-400 border border-slate-200" 
                        : "bg-red-600 hover:bg-black text-white hover:text-white"
                    )}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2 text-sm">
                      {registered ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" />
                          {t('alreadyRegistered')}
                        </>
                      ) : (
                        t('registerEvent')
                      )}
                    </span>
                  </Button>
                  
                  <div className="flex gap-3 md:gap-4">
                    <Button 
                      variant="outline"
                      className="flex-1 h-12 md:h-14 rounded-2xl font-black uppercase tracking-widest italic border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all text-[9px] md:text-[10px]"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('Link copied to clipboard!');
                      }}
                    >
                      <Share2 className="h-4 w-4 mr-2 text-red-600" />
                      Share
                    </Button>
                    <Button 
                      variant="outline"
                      className="h-12 w-12 md:h-14 md:w-14 p-0 rounded-2xl border-slate-200 hover:bg-slate-50"
                      onClick={() => toast.info('Adding to calendar...')}
                    >
                      <Calendar className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
                    </Button>
                  </div>
                </div>

                <p className="mt-6 md:mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                  Join {event.capacity - 12} others registered
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Confirm Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="w-[90vw] max-w-sm bg-white rounded-2xl border-none shadow-2xl p-6">
          <DialogHeader className="text-left">
            <DialogTitle className="text-lg font-black italic uppercase tracking-tight">
              Xác nhận đăng ký
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium mt-2 text-sm leading-relaxed">
              Bạn có chắc muốn đăng ký tham gia sự kiện{' '}
              <span className="font-black text-slate-900">"{resolve(event.title)}"</span> không?
            </DialogDescription>
          </DialogHeader>
          <div className="border-t border-slate-200/20 my-4" />
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              className="flex-1 h-11 font-bold uppercase tracking-widest text-[10px] rounded-xl border-slate-200"
            >
              Không
            </Button>
            <Button
              onClick={handleConfirmRegister}
              className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-red-900/20 active:scale-95 transition-all"
            >
              Xác nhận
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}





