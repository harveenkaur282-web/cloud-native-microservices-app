'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Lock, User, Mail, Phone, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Mascot, { MascotState } from '@/components/mascot/Mascot';
import Logo from '@/components/layout/Logo';

export default function RegisterPage() {
  const { user, register } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mascotState, setMascotState] = useState<MascotState>('idle');

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

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
    if (!username.trim() || !fullName.trim() || !email.trim() || !phoneNumber.trim() || !address.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      setMascotState('error');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    setMascotState('typing');

    try {
      await register({
        username: username.trim(),
        full_name: fullName.trim(),
        email: email.trim(),
        phone_number: phoneNumber.trim(),
        address: address.trim(),
        password,
      });

      setSuccess(true);
      setMascotState('success');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail;
      setError(detail || 'Registration failed. Username/email might be registered.');
      setMascotState('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFDF9] px-4 py-12 relative overflow-hidden select-none">
      {/* Floating Pastel Shapes */}
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
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-lg space-y-6 relative z-10"
      >
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-[#FFE5D9] shadow-sm mb-4">
            <Logo size={44} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#2E2522]">
            Create a CloudCart Account
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Or{' '}
            <Link
              href="/login"
              className="font-bold text-[#FFB7B2] hover:text-[#f3a49e] transition-colors underline decoration-dotted"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        {/* Mascot */}
        <div className="flex justify-center -mb-2">
          <Mascot state={mascotState} size={84} />
        </div>

        {/* Form panel */}
        <div className="bg-white/80 backdrop-blur-md p-8 border border-[#FFE5D9] rounded-3xl shadow-xl shadow-pink-900/5 text-left">
          {success ? (
            <div className="text-center py-6 space-y-3 font-sans">
              <h3 className="text-lg font-bold text-[#2E2522]">Registration Successful!</h3>
              <p className="text-xs text-slate-500">// Directing to login console...</p>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 p-3 text-xs text-rose-800 border border-rose-100 font-sans">
                  <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-[10px] font-bold text-[#2E2522] uppercase tracking-wider"
                  >
                    Username
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <User className="h-4 w-4 text-slate-400" />
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
                      className="block w-full rounded-2xl border border-[#FFE5D9] bg-white/60 py-2 pl-9 pr-3 text-xs placeholder-slate-400 focus:border-[#FFB7B2] focus:outline-none focus:ring-2 focus:ring-[#FFB7B2]/20 transition-all font-sans text-[#2E2522]"
                      placeholder="johndoe"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-[10px] font-bold text-[#2E2522] uppercase tracking-wider"
                  >
                    Full Name
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={fullName}
                      onFocus={() => setMascotState('typing')}
                      onBlur={() => setMascotState('idle')}
                      onChange={(e) => handleInputChange(e.target.value, setFullName)}
                      className="block w-full rounded-2xl border border-[#FFE5D9] bg-white/60 py-2 pl-9 pr-3 text-xs placeholder-slate-400 focus:border-[#FFB7B2] focus:outline-none focus:ring-2 focus:ring-[#FFB7B2]/20 transition-all font-sans text-[#2E2522]"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="email"
                    className="block text-[10px] font-bold text-[#2E2522] uppercase tracking-wider"
                  >
                    Email Address
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onFocus={() => setMascotState('typing')}
                      onBlur={() => setMascotState('idle')}
                      onChange={(e) => handleInputChange(e.target.value, setEmail)}
                      className="block w-full rounded-2xl border border-[#FFE5D9] bg-white/60 py-2 pl-9 pr-3 text-xs placeholder-slate-400 focus:border-[#FFB7B2] focus:outline-none focus:ring-2 focus:ring-[#FFB7B2]/20 transition-all font-sans text-[#2E2522]"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="phoneNumber"
                    className="block text-[10px] font-bold text-[#2E2522] uppercase tracking-wider"
                  >
                    Phone Number
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Phone className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      required
                      value={phoneNumber}
                      onFocus={() => setMascotState('typing')}
                      onBlur={() => setMascotState('idle')}
                      onChange={(e) => handleInputChange(e.target.value, setPhoneNumber)}
                      className="block w-full rounded-2xl border border-[#FFE5D9] bg-white/60 py-2 pl-9 pr-3 text-xs placeholder-slate-400 focus:border-[#FFB7B2] focus:outline-none focus:ring-2 focus:ring-[#FFB7B2]/20 transition-all font-sans text-[#2E2522]"
                      placeholder="+1 (555) 019-2834"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-[10px] font-bold text-[#2E2522] uppercase tracking-wider"
                  >
                    Delivery Address
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 pt-2.5">
                      <MapPin className="h-4 w-4 text-slate-400" />
                    </div>
                    <textarea
                      id="address"
                      name="address"
                      required
                      rows={2}
                      value={address}
                      onFocus={() => setMascotState('typing')}
                      onBlur={() => setMascotState('idle')}
                      onChange={(e) => handleInputChange(e.target.value, setAddress)}
                      className="block w-full rounded-2xl border border-[#FFE5D9] bg-white/60 py-2 pl-9 pr-3 text-xs placeholder-slate-400 focus:border-[#FFB7B2] focus:outline-none focus:ring-2 focus:ring-[#FFB7B2]/20 transition-all font-sans text-[#2E2522]"
                      placeholder="123 Main St, New York, NY"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="password"
                    className="block text-[10px] font-bold text-[#2E2522] uppercase tracking-wider"
                  >
                    Password
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-4 w-4 text-slate-400" />
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
                      className="block w-full rounded-2xl border border-[#FFE5D9] bg-white/60 py-2 pl-9 pr-3 text-xs placeholder-slate-400 focus:border-[#FFB7B2] focus:outline-none focus:ring-2 focus:ring-[#FFB7B2]/20 transition-all font-sans text-[#2E2522]"
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
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
