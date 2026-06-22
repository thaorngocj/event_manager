'use client'

import { useRouter } from 'next/navigation';

import * as React from 'react';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'motion/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ShieldCheck, Lock, UserCog, Eye, EyeOff } from 'lucide-react';
import { loginSchema } from '@/lib/schemas/auth.schema';

import { Logo } from '@/components/Logo';

export default function Login() {
  const { t } = useLanguage();
  const { signIn, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErrorMsg(null);

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setErrorMsg(result.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginAs = async (mockEmail: string) => {
    setEmail(mockEmail);
    setPassword('password123');
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await signIn(mockEmail, 'password123');
      router.push('/dashboard');
    } catch {
      setErrorMsg('Demo login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[20000ms] scale-110 animate-[zoom_20s_infinite]"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070&auto=format&fit=crop")' }}
      />
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[500px] px-4"
      >
        <div className="bg-white rounded-sm shadow-2xl overflow-hidden">
          <div className="p-8 md:p-12 text-center space-y-8">
            <div className="flex flex-col items-center gap-4">
              <Logo variant="dark" />
              <h1 className="text-4xl font-black text-slate-800">
                {t('login')}
              </h1>
            </div>

            <form onSubmit={handleLogin} className="space-y-6 text-left">
              {errorMsg && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-600">
                    {errorMsg}
                  </p>
                </div>
              )}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-500">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="vd. user@va.edu.vn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 bg-slate-50 border-slate-100 rounded-sm text-sm font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-bold text-slate-500">
                      Mật khẩu
                    </Label>
                    <a href="/forgot-password" className="text-[10px] font-bold text-red-600 hover:underline uppercase tracking-widest">
                      Quên mật khẩu?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 bg-slate-50 border-slate-100 rounded-sm text-sm font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-bold py-4 px-8 rounded-sm text-sm transition-all transform active:scale-95 shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : null}
                {isSubmitting ? 'Đang xác thực...' : t('loginWithEmail')}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <p className="text-[10px] font-bold text-slate-400">Đăng nhập nhanh (Demo)</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => loginAs('student@va.edu.vn')}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-sm border border-slate-100 flex flex-col items-center gap-2 group transition-all"
                >
                  <Mail className="h-4 w-4 text-slate-400 group-hover:text-red-600" />
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-900">Sinh viên</span>
                </button>
                <button
                  onClick={() => loginAs('manager@va.edu.vn')}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-sm border border-slate-100 flex flex-col items-center gap-2 group transition-all"
                >
                  <UserCog className="h-4 w-4 text-slate-400 group-hover:text-red-600" />
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-900">Quản lý</span>
                </button>
                <button
                  onClick={() => loginAs('admin@va.edu.vn')}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-sm border border-slate-100 flex flex-col items-center gap-2 group transition-all"
                >
                  <ShieldCheck className="h-4 w-4 text-slate-400 group-hover:text-red-600" />
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-900">Quản trị</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => router.push('/')}
                className="block text-slate-400 text-xs font-medium hover:text-slate-600 transition-colors"
              >
                ← {t('backToHome')}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes zoom {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
