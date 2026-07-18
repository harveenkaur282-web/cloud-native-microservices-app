'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useSandbox } from '@/hooks/use-sandbox';
import Logo from './Logo';
import { 
  Home, 
  Package, 
  Archive, 
  ShoppingCart, 
  User,
  Heart,
  Network,
  Settings,
  ShoppingBag
} from 'lucide-react';

interface SidebarProps {
  className?: string;
  onLinkClick?: () => void;
}

export default function Sidebar({ className, onLinkClick }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { mode, setMode } = useSandbox();

  // Define conditional routes based on mode
  const routes = mode === 'customer' 
    ? [
        {
          label: 'Overview',
          icon: Home,
          href: '/dashboard',
        },
        {
          label: 'Shop Catalog',
          icon: ShoppingBag,
          href: '/products',
        },
        {
          label: 'My Orders',
          icon: ShoppingCart,
          href: '/orders',
        },
        {
          label: 'My Profile',
          icon: User,
          href: '/profile',
        },
      ]
    : [
        {
          label: 'Telemetry Stats',
          icon: Home,
          href: '/dashboard',
        },
        {
          label: 'Catalog Manager',
          icon: Package,
          href: '/products',
        },
        {
          label: 'Warehouse Stock',
          icon: Archive,
          href: '/inventory',
        },
        {
          label: 'Fulfillment Log',
          icon: ShoppingCart,
          href: '/orders',
        },
        {
          label: 'Topology Map',
          icon: Network,
          href: '/architecture',
        },
        {
          label: 'Operator Profile',
          icon: User,
          href: '/profile',
        },
      ];

  const getInitials = (name?: string) => {
    if (!name) return 'OP';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <aside className={cn("flex flex-col h-full w-64 bg-[#FFFDF9] text-[#2E2522] border-r border-[#FFE5D9]", className)}>
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-[#FFE5D9] gap-3 justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-sans font-bold text-[#2E2522] tracking-tight">
          <Logo size={32} />
          <span className="text-sm font-extrabold tracking-wide uppercase">CloudCart</span>
        </Link>
      </div>

      {/* Mode Selector Panel */}
      <div className="p-4 border-b border-[#FFE5D9] bg-[#FFFBF4]/40 text-left font-sans">
        <span className="block text-[8px] font-bold text-[#7D726D] uppercase tracking-wider mb-2">Sandbox Console Mode</span>
        <div className="flex rounded-xl bg-white border border-[#FFE5D9] p-1 gap-1">
          <button
            onClick={() => setMode('customer')}
            className={cn(
              "flex-1 text-[9px] font-extrabold uppercase py-2 rounded-lg text-center transition-all cursor-pointer",
              mode === 'customer'
                ? "bg-[#FFB7B2] text-white shadow-sm"
                : "text-[#7D726D] hover:bg-[#FFE5D9]/15"
            )}
          >
            Customer
          </button>
          <button
            onClick={() => setMode('operator')}
            className={cn(
              "flex-1 text-[9px] font-extrabold uppercase py-2 rounded-lg text-center transition-all cursor-pointer",
              mode === 'operator'
                ? "bg-[#B8B8FF] text-white shadow-sm"
                : "text-[#7D726D] hover:bg-[#FFE5D9]/15"
            )}
          >
            Operator
          </button>
        </div>
      </div>

      {/* Routes List */}
      <nav className="flex-1 space-y-1.5 px-4 py-6 font-sans text-left">
        {routes.map((route) => {
          const isActive = pathname === route.href || pathname.startsWith(route.href + '/');
          const isOperatorColor = mode === 'operator';
          
          return (
            <Link
              key={route.href}
              href={route.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-2xl transition-all duration-200 border",
                isActive 
                  ? isOperatorColor 
                    ? "bg-[#B8B8FF]/10 text-[#B8B8FF] border-[#B8B8FF]/30 shadow-sm"
                    : "bg-[#FFB7B2]/10 text-[#FFB7B2] border-[#FFB7B2]/30 shadow-sm" 
                  : "text-[#7D726D] border-transparent hover:bg-[#FFE5D9]/20 hover:text-[#2E2522]"
              )}
            >
              <route.icon className={cn(
                "h-4.5 w-4.5 transition-transform duration-200", 
                isActive 
                  ? isOperatorColor ? "text-[#B8B8FF] scale-110" : "text-[#FFB7B2] scale-110"
                  : "text-[#7D726D]"
              )} />
              {route.label}
            </Link>
          );
        })}
      </nav>

      {/* Active User Footer Section */}
      <div className="p-4 border-t border-[#FFE5D9] bg-[#FFFBF4]">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className={cn(
            "h-8.5 w-8.5 rounded-xl flex items-center justify-center font-mono text-xs font-extrabold shadow-inner border",
            mode === 'operator'
              ? "bg-[#B8B8FF]/10 text-[#B8B8FF] border-[#B8B8FF]/30"
              : "bg-[#FFB7B2]/10 text-[#FFB7B2] border-[#FFB7B2]/30"
          )}>
            {getInitials(user?.username)}
          </div>
          <div className="flex-1 overflow-hidden font-sans text-left">
            <p className="text-xs font-extrabold text-[#2E2522] truncate uppercase tracking-tight">{user?.username || 'GUEST_OPERATOR'}</p>
            <p className="text-[10px] text-[#7D726D] truncate lowercase">{user?.email || 'unauthenticated'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
