'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Package, 
  Archive, 
  ShoppingCart, 
  Network, 
  User,
  Layers
} from 'lucide-react';

const routes = [
  {
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
  },
  {
    label: 'Products',
    icon: Package,
    href: '/products',
  },
  {
    label: 'Inventory',
    icon: Archive,
    href: '/inventory',
  },
  {
    label: 'Orders',
    icon: ShoppingCart,
    href: '/orders',
  },
  {
    label: 'Architecture',
    icon: Network,
    href: '/architecture',
  },
  {
    label: 'Profile',
    icon: User,
    href: '/profile',
  },
];

interface SidebarProps {
  className?: string;
  onLinkClick?: () => void;
}

export default function Sidebar({ className, onLinkClick }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn("flex flex-col h-full w-64 bg-slate-900 text-slate-400 border-r border-slate-800", className)}>
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-white">
          <Layers className="h-6 w-6 text-blue-500" />
          <span>CloudCart</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        {routes.map((route) => {
          const isActive = pathname === route.href || pathname.startsWith(route.href + '/');
          return (
            <Link
              key={route.href}
              href={route.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive 
                  ? "bg-slate-800 text-white" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              )}
            >
              <route.icon className={cn("h-4 w-4", isActive ? "text-blue-500" : "text-slate-400")} />
              {route.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md">
          <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-semibold text-sm">
            AD
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">Administrator</p>
            <p className="text-xs text-slate-500 truncate">admin@cloudcart.local</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
