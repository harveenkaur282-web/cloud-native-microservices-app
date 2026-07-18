'use client';

import PageContainer from '@/components/layout/PageContainer';
import { useAuth } from '@/hooks/use-auth';
import { User, Mail, Phone, MapPin, Sparkles, ShoppingBag, ShieldCheck, Heart } from 'lucide-react';
import Mascot from '@/components/mascot/Mascot';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <PageContainer
      title="User Account"
      description="View operator credentials, database attributes, and experimental AI recommenders."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans text-left items-start">
        {/* Left Card: Passport details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#FFE5D9] rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 h-16 w-16 bg-[#FFE5D9]/20 rounded-bl-full pointer-events-none" />
            <div className="flex items-center gap-4 mb-6">
              <div className="h-14 w-14 rounded-2xl bg-[#FFB7B2]/10 border border-[#FFB7B2]/30 flex items-center justify-center text-[#FFB7B2] font-mono text-lg font-extrabold shadow-inner">
                {user?.username?.slice(0, 2).toUpperCase() || 'US'}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#2E2522]">@{user?.username || 'operator'}</h3>
                <span className="inline-flex items-center gap-1 rounded bg-[#E2FCEF] px-2 py-0.5 text-[9px] font-bold text-[#4ADE80] border border-[#A7F3D0]/30 uppercase mt-0.5">
                  <ShieldCheck className="h-3 w-3" /> Active Operator
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-[#FFE5D9]/40 text-xs">
              <div className="flex items-center gap-3 text-slate-600">
                <User className="h-4.5 w-4.5 text-[#FFB7B2]" />
                <div>
                  <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Full Operator Identity</span>
                  <span className="font-semibold text-[#2E2522]">{user?.full_name || 'Administrator'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600">
                <Mail className="h-4.5 w-4.5 text-[#B8B8FF]" />
                <div>
                  <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Primary Email Route</span>
                  <span className="font-semibold text-[#2E2522]">{user?.email || 'admin@cloudcart.local'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600">
                <Phone className="h-4.5 w-4.5 text-[#FFB7B2]" />
                <div>
                  <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Contact Number</span>
                  <span className="font-semibold text-[#2E2522]">{user?.phone_number || '+1 (555) 019-2834'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600">
                <MapPin className="h-4.5 w-4.5 text-[#B8B8FF]" />
                <div>
                  <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Dispatch Address</span>
                  <span className="font-semibold text-[#2E2522]">{user?.address || '123 Main St, New York, NY'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Cozy Future AI Assistant Suggestion Placeholder */}
        <div className="space-y-6">
          <div className="bg-white border border-[#FFE5D9] rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col items-center text-center gap-4">
            <Mascot state="idle" size={70} />
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#2E2522] uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-[#FFB7B2]" />
                AI Recommender
              </h4>
              <p className="text-[10px] text-[#7D726D] font-sans leading-relaxed">
                Our future neural assistant will map your transactions to personalized recommendations.
              </p>
            </div>

            {/* Simulated cute speech bubble recommendation suggestion */}
            <div className="bg-[#FFFBF4] border border-[#FFE5D9] rounded-2xl p-4 w-full relative text-left">
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#FFFBF4] border-t border-l border-[#FFE5D9] rotate-45" />
              <p className="text-[10px] text-[#2E2522] font-sans leading-relaxed italic">
                &ldquo;Hi! I noticed you checked catalog schemas in electronics. I recommend checking the stock logs of the mapped catalog next!&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
