'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Mascot, { MascotState } from '@/components/mascot/Mascot';
import Logo from '@/components/layout/Logo';

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mascotState, setMascotState] = useState<MascotState>('idle');

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Adjust mascot state when inputs focus or change
  const handleInputChange = (val: string, setter: (v: string) => void) => {
    setter(val);
    if (val.length > 0) {
      setMascotState('typing');
    } else {
      setMascotState('idle');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      setMascotState('error');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    setMascotState('typing');

    try {
      await login({ username, password });
      setMascotState('success');
      setTimeout(() => {
        router.push('/dashboard');
      }, 600);
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail;
      setError(detail || 'Credentials refused. Check username and password.');
      setMascotState('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFDF9] px-4 py-12 relative overflow-hidden select-none">
      {/* Floating Pastel Organic Shapes for Handcrafted Feel */}
      <motion.div
        animate={{ y: [0, -15, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-12 -left-12 h-64 w-64 rounded-full bg-[#E8E8FF]/40 blur-2xl pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 20, 0], scale: [1, 0.95, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-[#FFE5D9]/40 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, 15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 right-12 h-44 w-44 rounded-full bg-[#C8E6C9]/20 blur-xl pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md space-y-6 relative z-10"
      >
        {/* Logo and Greeting */}
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-[#FFE5D9] shadow-sm mb-4">
            <Logo size={44} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#2E2522]">
            Welcome back to CloudCart
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Or{' '}
            <Link
              href="/register"
              className="font-bold text-[#FFB7B2] hover:text-[#f3a49e] transition-colors underline decoration-dotted"
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* Mascot companion panel */}
        <div className="flex justify-center -mb-2">
          <Mascot state={mascotState} size={84} />
        </div>

        {/* Login Form Container */}
        <div className="bg-white/80 backdrop-blur-md p-8 border border-[#FFE5D9] rounded-3xl shadow-xl shadow-pink-900/5 text-left">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 p-3 text-xs text-rose-800 border border-rose-100 font-sans">
                <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-xs font-bold text-[#2E2522] uppercase tracking-wider"
                >
                  Username
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onFocus={() => setMascotState('typing')}
                    onBlur={() => setMascotState('idle')}
                    onChange={(e) => handleInputChange(e.target.value, setUsername)}
                    className="block w-full rounded-2xl border border-[#FFE5D9] bg-white/60 py-2.5 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-[#FFB7B2] focus:outline-none focus:ring-2 focus:ring-[#FFB7B2]/20 transition-all font-sans text-[#2E2522]"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-[#2E2522] uppercase tracking-wider"
                >
                  Password
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onFocus={() => setMascotState('typing')}
                    onBlur={() => setMascotState('idle')}
                    onChange={(e) => handleInputChange(e.target.value, setPassword)}
                    className="block w-full rounded-2xl border border-[#FFE5D9] bg-white/60 py-2.5 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-[#FFB7B2] focus:outline-none focus:ring-2 focus:ring-[#FFB7B2]/20 transition-all font-sans text-[#2E2522]"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center items-center rounded-2xl bg-[#FFB7B2] py-3 px-4 text-xs font-bold text-white shadow-md hover:bg-[#f3a49e] focus:outline-none focus:ring-2 focus:ring-[#FFB7B2] focus:ring-offset-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    Connecting...
                  </span>
                ) : (
                  'Sign in to platform'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
