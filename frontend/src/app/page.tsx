'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Logo from '@/components/layout/Logo';
import Mascot from '@/components/mascot/Mascot';
import { ShoppingBag, Sparkles, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#2E2522] flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background soft shapes */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-[#E8E8FF]/30 blur-2xl pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-[#FFE5D9]/40 blur-3xl pointer-events-none"
      />

      {/* Header bar */}
      <header className="max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-2.5">
          <Logo size={36} />
          <span className="font-extrabold uppercase text-sm tracking-widest text-[#2E2522]">CloudCart</span>
        </div>
        <a
          href="/login"
          className="px-5 py-2.5 bg-[#FFB7B2] hover:bg-[#f3a49e] rounded-2xl text-xs font-bold text-white shadow-md active:scale-95 transition-all duration-200 uppercase tracking-wider"
        >
          Access Console
        </a>
      </header>

      {/* Hero section */}
      <main className="max-w-4xl mx-auto w-full px-6 py-12 flex flex-col items-center text-center gap-8 z-10 relative flex-1 justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative"
        >
          <Mascot state="idle" size={100} />
        </motion.div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#E8E8FF]/40 border border-[#D8D8FF]/30 rounded-full text-[10px] font-bold text-[#FFB7B2] uppercase tracking-wider"
          >
            <Sparkles className="h-3 w-3 fill-current text-[#FFB7B2]" />
            Cloud-Native Commerce Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-4xl md:text-5xl font-extrabold font-sans tracking-tight text-[#2E2522]"
          >
            The Cozy Way to Shop & <br />
            Orchestrate Microservices
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-sm text-[#7D726D] max-w-xl mx-auto font-sans leading-relaxed"
          >
            CloudCart combines cute, handcrafted interfaces with a powerful microservice topology. Monitor stock, catalog items, and order lifecycles with Cumi by your side.
          </motion.p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#FFB7B2] hover:bg-[#f3a49e] text-xs font-bold text-white rounded-2xl shadow-lg shadow-pink-900/10 active:scale-95 transition-all duration-200 uppercase tracking-widest cursor-pointer"
          >
            Enter Dashboard
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="/products"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white border border-[#FFE5D9] hover:bg-[#FFE5D9]/20 text-xs font-bold text-[#2E2522] rounded-2xl active:scale-95 transition-all duration-200 uppercase tracking-widest cursor-pointer"
          >
            Explore Catalog
          </a>
        </div>
      </main>

      {/* Footer bar */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 border-t border-[#FFE5D9]/60 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 relative">
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">// CloudCart 2026. Handcrafted with Care.</span>
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
          <span>Made for University Showcase</span>
          <Heart className="h-3 w-3 fill-current text-rose-400" />
        </div>
      </footer>
    </div>
  );
}
