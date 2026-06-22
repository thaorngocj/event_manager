'use client'

import { useRouter } from 'next/navigation';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Zap, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, MapPin, Clock, User, Menu, X, Home, LogIn } from 'lucide-react';
import { Logo } from '@/components/Logo';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { useEvents } from '@/context/EventsContext';
import { useAuth } from '@/context/AuthContext';
import Lenis from 'lenis';

export default function LandingPage() {
  const router = useRouter();
  const { t, language, resolve } = useLanguage();
  const { events } = useEvents();
  const { user, signOut } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global smooth scroll initialization
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 25, // Much softer
    damping: 35,   // More damping for fluid feel
    mass: 1,
    restDelta: 0.0001
  });

  const mountainScale = useTransform(smoothProgress, [0, 1], [1, 1.3]); // More dramatic
  const mountainBlur = useTransform(smoothProgress, [0, 0.5], ["0px", "15px"]); // Softer blur
  const revealOpacity = useTransform(smoothProgress, [0.1, 0.4], [0, 1]); 
  const revealScale = useTransform(smoothProgress, [0.1, 0.6], [1.1, 1]); 
  const revealRotate = useTransform(smoothProgress, [0.1, 0.6], [-2, 0]); 

  // Removed automatic redirect to dashboard for logged-in users
  // transition to allow users to revisit landing page
  // useEffect(() => {
  //   if (user) {
  //     router.push('/dashboard', { replace: true });
  //   }
  // }, [user, navigate]);

  const [activeProposedIndex, setActiveProposedIndex] = useState(0);

  const handleProposedScroll = () => {
    if (scrollRef.current) {
      const scrollPosition = scrollRef.current.scrollLeft;
      const cardWidth = 220 + 20;
      const newIndex = Math.round(scrollPosition / cardWidth);
      setActiveProposedIndex(newIndex);
    }
  };

  const scrollProposed = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const cardWidth = 220 + 20;
      const target = scrollRef.current.scrollLeft + (direction === 'left' ? -cardWidth : cardWidth);
      scrollRef.current.scrollTo({ left: target, behavior: 'smooth' });
    }
  };

  // ── Carousel state ──
  const [catPage, setCatPage] = useState(0);
  const [catDir, setCatDir] = useState(1);
  const [featPage, setFeatPage] = useState(0);
  const [featDir, setFeatDir] = useState(1);

  const navigateCat = (dir: 1 | -1) => {
    const total = Math.max(1, Math.ceil(catEvents.length / 3));
    const next = Math.max(0, Math.min(catPage + dir, total - 1));
    setCatDir(dir); setCatPage(next);
  };
  const navigateFeat = (dir: 1 | -1) => {
    const total = Math.max(1, Math.ceil(featuredEvents.length / 3));
    const next = Math.max(0, Math.min(featPage + dir, total - 1));
    setFeatDir(dir); setFeatPage(next);
  };

  const carouselVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 280, damping: 30 } },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0, transition: { duration: 0.18 } }),
  };

  // Filter events by section
  const featuredEvents = events.filter(e => e.displayCategory === 'FEATURED');
  const catEvents = events.filter(e => e.displayCategory === 'HIGHLIGHT');
  const proposedEvents = events.filter(e => e.displayCategory === 'HERO');

  const featTotalPages = Math.max(1, Math.ceil(featuredEvents.length / 3));
  const catTotalPages = Math.max(1, Math.ceil(catEvents.length / 3));
  const visibleFeat = featuredEvents.slice(featPage * 3, (featPage + 1) * 3);
  const visibleCat = catEvents.slice(catPage * 3, (catPage + 1) * 3);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-red-100 selection:text-red-700 overflow-x-hidden">
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-16 z-50 transition-all duration-500",
        isScrolled || isMobileMenuOpen ? "h-16 md:h-20 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm" : "h-20 bg-transparent"
      )}>
        <div className="flex items-center gap-2 md:gap-6">
          {/* Mobile Menu Trigger - Now on the left corner */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-900 transition-all active:scale-95 z-50"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <Link href="/" className="flex items-center z-50">
            <Logo variant={isScrolled || isMobileMenuOpen ? 'dark' : 'light'} />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className={`text-sm font-bold transition-colors ${isScrolled ? 'text-slate-800 hover:text-red-600' : 'text-white hover:text-white/70'}`}>{t('homepage')}</Link>
          <Link href="/events" className={`text-sm font-bold transition-colors ${isScrolled ? 'text-slate-800 hover:text-red-600' : 'text-white hover:text-white/70'}`}>{t('conferenceEvent')}</Link>
          <Link href="/events?tab=calendar" className={`text-sm font-bold transition-colors ${isScrolled ? 'text-slate-800 hover:text-red-600' : 'text-white hover:text-white/70'}`}>{t('eventCalendar')}</Link>
          <div className="relative group">
            <Link href="/my-events" className={`text-sm font-bold transition-colors flex items-center gap-1 ${isScrolled ? 'text-slate-800 hover:text-red-600' : 'text-white hover:text-white/70'}`}>
              {t('myEvent')}
            </Link>
            <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-white border border-slate-100 shadow-xl rounded-sm py-2 min-w-[200px]">
                 <Link href="/my-events" className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors">
                   <ChevronRight className="h-3 w-3 text-slate-300" />
                   <span className="text-xs font-semibold text-slate-700">{t('myEvent')}</span>
                 </Link>
                 <Link href="/participated-events" className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors border-t border-slate-50">
                   <ChevronRight className="h-3 w-3 text-slate-300" />
                   <span className="text-xs font-semibold text-slate-500">{t('participationInEvent')}</span>
                 </Link>
              </div>
            </div>
          </div>
          <Link href="/personal-info" className={`text-sm font-bold transition-colors ${isScrolled ? 'text-slate-800 hover:text-red-600' : 'text-white hover:text-white/70'}`}>{t('personalInfo')}</Link>
          
          <div className={`h-6 w-[1px] ${isScrolled ? 'bg-slate-200' : 'bg-white/30'}`}></div>

          {user ? (
            <div className="flex items-center gap-3">
              <span className={`text-sm font-bold ${isScrolled ? 'text-slate-800' : 'text-white'}`}>
                {user.displayName}
              </span>
              <Button
                onClick={async () => { await signOut(); router.push('/'); }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg shadow-lg transition-all uppercase tracking-widest text-[10px] h-10"
              >
                Đăng xuất
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => router.push('/login')}
              className="bg-black hover:bg-slate-900 text-white font-bold px-6 py-2 rounded-lg shadow-lg transition-all uppercase tracking-widest text-[10px] h-10 italic tracking-tighter"
            >
              {t('portalLogin')}
            </Button>
          )}
        </div>

      </nav>

      {/* Mobile Navigation Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[999] md:hidden"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white z-[1000] md:hidden flex flex-col shadow-2xl"
            >
              <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                <Logo variant="dark" />
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-8">
                <div className="flex flex-col gap-1">
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-red-600 transition-colors border-b border-slate-50/50">
                    <Home className="h-4 w-4" />
                    <span className="text-[13px] font-medium">{t('homepage')}</span>
                  </Link>
                  <Link href="/events" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-red-600 transition-colors border-b border-slate-50/50">
                    <Calendar className="h-4 w-4" />
                    <span className="text-[13px] font-medium">{t('conferenceEvent')}</span>
                  </Link>
                  <Link href="/events?tab=calendar" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-red-600 transition-colors border-b border-slate-50/50">
                    <Clock className="h-4 w-4" />
                    <span className="text-[13px] font-medium">{t('eventCalendar')}</span>
                  </Link>
                  <Link href="/my-events" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-red-600 transition-colors border-b border-slate-50/50">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-[13px] font-medium">{t('myEvent')}</span>
                  </Link>
                  <Link href="/personal-info" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-red-600 transition-colors border-b border-slate-50/50">
                    <User className="h-4 w-4" />
                    <span className="text-[13px] font-medium">{t('personalInfo')}</span>
                  </Link>
                </div>
              </div>

              {/* Bottom pinned button */}
              <div className="p-4 border-t border-slate-100 shrink-0">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-1 py-1">
                      <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-black shrink-0">
                        {user.displayName?.[0] || 'U'}
                      </div>
                      <span className="text-sm font-black text-slate-900">{user.displayName}</span>
                    </div>
                    <Button
                      onClick={async () => { setIsMobileMenuOpen(false); await signOut(); router.push('/'); }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-[10px] h-11 rounded-lg"
                    >
                      Đăng xuất
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => { setIsMobileMenuOpen(false); router.push('/login'); }}
                    className="w-full bg-black hover:bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] h-11 rounded-lg italic"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    ĐĂNG NHẬP
                  </Button>
                )}
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section with Scroll Reveal */}
      <section ref={heroRef} className="relative h-[110vh] bg-white">
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
          {/* Base Background — dùng ảnh event HERO nếu có */}
          <motion.div
            style={{ scale: mountainScale, filter: `blur(${mountainBlur})` }}
            className="absolute inset-0 z-0"
          >
            <img
              src={proposedEvents[0]?.image || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2000'}
              alt="Hero Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40"></div>
          </motion.div>

          {/* Reveal Background — dùng ảnh event HERO thứ 2 nếu có */}
          <motion.div
            style={{
              opacity: revealOpacity,
              scale: revealScale,
              rotate: revealRotate
            }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900"
          >
            <img
              src={proposedEvents[1]?.image || proposedEvents[0]?.image || 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=2000'}
              alt="Reveal Background"
              className="absolute inset-0 w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/30"></div>
          </motion.div>

          {/* Styled Text Layer (Top layer) */}
          <div className="relative z-20 text-center px-4 w-full">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16">
              <h1
                className="text-[8rem] md:text-[16rem] font-black tracking-[-0.1em] italic leading-[0.8] uppercase select-none"
                style={{
                  backgroundImage: `url(${proposedEvents[0]?.image || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 30px 100px rgba(0,0,0,0.4)) brightness(1.8) contrast(1.2)'
                }}
              >
                VA<br />EVENT
              </h1>
              
              <div 
                onClick={() => router.push(user ? '/dashboard' : '/login')}
                className="group cursor-pointer flex flex-col items-center md:items-start"
              >
                <div className="flex items-center gap-3 text-red-600 font-black uppercase tracking-widest text-sm italic">
                  <span>Bắt đầu ngay</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
                </div>
              </div>
            </div>

            <div className="mt-16 flex flex-col items-center gap-4">
              <div className="w-[1px] h-12 bg-gradient-to-b from-slate-900 to-transparent"></div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Cuộn xuống</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-12 px-8 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto pt-0">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">
              <span className="text-red-600">{language === 'EN' ? 'F' : 'S'}</span>
              <span className="text-slate-900">{language === 'EN' ? 'eatured Events' : 'ự kiện nổi bật'}</span>
            </h2>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full border-2 border-yellow-500"></div>
              <div className="h-[1px] w-12 bg-slate-100"></div>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">{t('comeJoin')}</p>
              <div className="h-[1px] w-12 bg-slate-100"></div>
            </div>
          </div>

          <div className="relative">
            {featTotalPages > 1 && (
              <button onClick={() => navigateFeat(-1)} disabled={featPage === 0}
                className="absolute -left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white border border-slate-100 rounded-full shadow-xl flex items-center justify-center text-slate-400 hover:text-red-600 disabled:opacity-30 transition-all">
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {featTotalPages > 1 && (
              <button onClick={() => navigateFeat(1)} disabled={featPage === featTotalPages - 1}
                className="absolute -right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white border border-slate-100 rounded-full shadow-xl flex items-center justify-center text-slate-400 hover:text-red-600 disabled:opacity-30 transition-all">
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

            <div className="overflow-hidden">
              <AnimatePresence initial={false} custom={featDir} mode="wait">
                <motion.div
                  key={featPage}
                  custom={featDir}
                  variants={carouselVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  {visibleFeat.length > 0 ? visibleFeat.map((event) => (
                    <motion.div
                      key={event.id}
                      whileHover={{ y: -10 }}
                      onClick={() => router.push(`/events/${event.id}`)}
                      className="group relative h-[400px] rounded-2xl overflow-hidden shadow-xl cursor-pointer"
                    >
                      <img src={event.image || 'https://images.unsplash.com/photo-1540575861501-7ad060e39fe5?auto=format&fit=crop&q=80&w=800'} alt={resolve(event.title)} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 text-[10px] font-black tracking-widest uppercase">{event.category}</Badge>
                      </div>
                      <div className="absolute bottom-6 left-6 right-6 space-y-4">
                        <h3 className="text-lg font-black text-white italic leading-tight line-clamp-2 uppercase tracking-tighter shadow-sm">{resolve(event.title)}</h3>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-widest"><Clock className="h-3 w-3" />{event.startTime} - {event.date}</div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest"><MapPin className="h-3 w-3" />{resolve(event.location)}</div>
                        </div>
                        <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-[9px] h-9 italic"
                            onClick={(e) => { e.stopPropagation(); router.push(`/events/${event.id}`); }}>
                            {t('registerEvent')}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="col-span-3 text-center py-12 text-slate-400 font-bold uppercase tracking-widest opacity-50">Chưa có sự kiện nổi bật</div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {featTotalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: featTotalPages }).map((_, i) => (
                  <button key={i} onClick={() => { setFeatDir(i > featPage ? 1 : -1); setFeatPage(i); }}
                    className={cn("h-1.5 rounded-full transition-all duration-300", featPage === i ? "w-8 bg-red-600" : "w-4 bg-slate-200 hover:bg-slate-300")} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Event Categories Section (Slider on Dark) */}
      <section className="py-24 px-8 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(185,28,28,0.2),transparent_70%)]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white mb-4">
               {language === 'EN' ? 'Event' : 'Danh Mục'} <span className="text-red-600">{language === 'EN' ? 'Categories' : 'Sự Kiện'}</span>
            </h2>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full border border-yellow-500"></div>
              <div className="h-[1px] w-24 bg-white/20"></div>
              <div className="w-1.5 h-1.5 rounded-full border border-yellow-500"></div>
            </div>
            <p className="mt-8 text-slate-400 font-medium max-w-2xl mx-auto uppercase tracking-widest text-[11px]">
              {language === 'EN' ? 'Join VA to enjoy the best moments!' : 'Hãy đến với VA để tận hưởng những giây phút vui vẻ nhất!'}
            </p>
          </div>

          <div className="relative">
            {catTotalPages > 1 && (
              <button onClick={() => navigateCat(-1)} disabled={catPage === 0}
                className="absolute -left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-red-600 hover:border-red-600 disabled:opacity-30 transition-all">
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            <button onClick={() => navigateCat(1)} disabled={catPage === catTotalPages - 1}
              className="absolute -right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 disabled:opacity-30 transition-all shadow-xl shadow-red-900/40">
              <ChevronRight className="h-6 w-6" />
            </button>

            <div className="overflow-hidden">
              <AnimatePresence initial={false} custom={catDir} mode="wait">
                <motion.div
                  key={catPage}
                  custom={catDir}
                  variants={carouselVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6"
                >
                  {visibleCat.length > 0 ? visibleCat.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ y: -10 }}
                      onClick={() => router.push(`/events/${item.id}`)}
                      className="group cursor-pointer relative rounded-2xl overflow-hidden aspect-[16/9] shadow-2xl ring-1 ring-white/10"
                    >
                      <img src={item.image || 'https://images.unsplash.com/photo-1540575861501-7ad060e39fe5?auto=format&fit=crop&q=80&w=800'} alt={resolve(item.title)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest line-clamp-2 italic">{resolve(item.title)}</h3>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button className="h-8 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-[8px] italic px-4">{t('registerEvent')}</Button>
                        </div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="col-span-3 text-center py-20 text-slate-500 font-black uppercase tracking-widest italic opacity-50">Chưa có sự kiện trong danh mục này</div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: Math.max(catTotalPages, 1) }).map((_, i) => (
                <button key={i} onClick={() => { setCatDir(i > catPage ? 1 : -1); setCatPage(i); }}
                  className={cn("h-1 rounded-full transition-all duration-300", catPage === i ? "w-8 bg-red-600" : "w-3 bg-white/20 hover:bg-white/40")} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Events (Style from Image) */}
      <section className="py-16 px-8 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Section Header Style from Image */}
          <div className="flex flex-col items-center mb-10 px-4">
            <div className="w-12 h-3 border-t-2 border-l-2 border-r-2 border-red-600 mb-4"></div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 uppercase italic">
              {language === 'EN' ? 'Recommended' : 'Sự kiện'} <span className="text-red-600">{language === 'EN' ? 'Events' : 'đề xuất'}</span>
            </h2>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-3">
              {language === 'EN' ? 'Experience different ideas' : 'Trải nghiệm những ý tưởng khác biệt'}
            </p>
            <div className="w-16 h-[2px] bg-red-600 mt-5"></div>
          </div>

          <div className="relative group/slider">
            {/* Slider Controls */}
            <button
              onClick={() => scrollProposed('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-20 w-10 h-10 bg-white border border-slate-100 rounded-full shadow-2xl flex items-center justify-center text-slate-400 hover:text-red-600 hover:scale-110 transition-all opacity-0 group-hover/slider:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scrollProposed('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-20 w-10 h-10 bg-white border border-slate-100 rounded-full shadow-2xl flex items-center justify-center text-slate-400 hover:text-red-600 hover:scale-110 transition-all opacity-0 group-hover/slider:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div
              ref={scrollRef}
              onScroll={handleProposedScroll}
              className="flex gap-5 overflow-x-auto no-scrollbar pb-6 scroll-smooth"
            >
              {proposedEvents.length > 0 ? proposedEvents.map((event) => (
                <motion.div
                  key={event.id}
                  whileHover={{ y: -4 }}
                  onClick={() => router.push(`/events/${event.id}`)}
                  className="w-[180px] md:w-[220px] shrink-0 group cursor-pointer"
                >
                  <div className="aspect-[4/3] rounded-sm overflow-hidden mb-4 relative shadow-sm">
                    <img
                      src={event.image || 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800'}
                      alt={resolve(event.title)}
                      className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    />
                  </div>

                  <div className="space-y-2 px-1">
                    <div className="w-8 h-[2px] bg-red-600"></div>
                    <h3 className="text-sm font-black text-slate-900 leading-tight line-clamp-2 uppercase italic tracking-tighter">
                      {resolve(event.title)}
                    </h3>

                    <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5 text-red-600" />
                        {event.date}
                      </div>
                    </div>

                    <p className="text-slate-500 text-[10px] leading-relaxed line-clamp-2 font-medium">
                      {resolve(event.description)}
                    </p>

                    <div className="pt-1 flex items-center gap-1 text-red-600 font-black text-[9px] uppercase tracking-widest group/link">
                      <span>Xem chi tiết</span>
                      <ArrowRight className="h-2.5 w-2.5 transition-transform group-hover/link:translate-x-1" />
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="w-full text-center py-20 text-slate-400 font-bold uppercase tracking-widest opacity-50 bg-white rounded-3xl border-2 border-dashed border-slate-100 italic">
                  Chưa có sự kiện đề xuất
                </div>
              )}
            </div>
            
            {/* Horizontal bar pagination from image */}
            {proposedEvents.length > 0 && (
              <div className="flex justify-center gap-4 mt-12">
                {Array.from({ length: Math.min(proposedEvents.length, 4) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (scrollRef.current) {
                        const cardWidth = 220 + 20;
                        scrollRef.current.scrollTo({
                          left: i * cardWidth,
                          behavior: 'smooth'
                        });
                      }
                    }}
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      activeProposedIndex === i ? "w-12 bg-red-600" : "w-10 bg-slate-200 hover:bg-slate-300"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-20 px-8 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-6">
            <Link href="/" className="flex items-center">
              <Logo variant="light" />
            </Link>
            <p className="text-slate-400 text-sm max-w-xs font-medium leading-relaxed">
              {t('footerDesc')}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
            <div className="space-y-4">
              <p className="text-xs font-black text-red-600 uppercase tracking-widest">{t('platform')}</p>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">{t('dashboard')}</a>
                <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">{t('qrScanning')}</a>
                <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">{t('reporting')}</a>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-xs font-black text-red-600 uppercase tracking-widest">{t('company')}</p>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">{t('aboutUs')}</a>
                <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">{t('support')}</a>
                <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">{t('privacy')}</a>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/10 mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('vluRights')}</p>
          <div className="flex gap-8">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('systemStatus')}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">v1.4.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}







