'use client';

import { useState } from 'react';
import { Menu, X, ShieldAlert } from 'lucide-react';
import Sidebar from './Sidebar';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Determine current page title based on path
  const getPageTitle = () => {
    const segment = pathname.split('/')[1];
    if (!segment) return 'Overview';
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="text-slate-500 hover:text-slate-700 md:hidden p-1.5 rounded-md hover:bg-slate-100"
          >
            <Menu className="h-6 w-6" />
          </button>

          <h2 className="text-lg font-semibold text-slate-900">{getPageTitle()}</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Developer Mode</span>
          </div>

          <div className="h-6 w-px bg-slate-200" />

          <span className="text-sm font-medium text-slate-700 hidden sm:inline-block">
            Administrator
          </span>
        </div>
      </header>

      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/80 transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar drawer */}
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-slate-900">
            <div className="absolute top-0 right-0 -mr-12 pt-4">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <Sidebar onLinkClick={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
