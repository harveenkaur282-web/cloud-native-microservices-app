'use client';

import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { api } from '@/services/api';
import { useSandbox } from '@/hooks/use-sandbox';
import { 
  Server, 
  Package, 
  Archive, 
  ShoppingCart, 
  Activity,
  CheckCircle,
  XCircle,
  Heart,
  ArrowRight,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import Mascot from '@/components/mascot/Mascot';
import Link from 'next/link';

interface ServiceStatus {
  name: string;
  key: string;
  status: 'loading' | 'up' | 'down';
  endpoint: string;
}

export default function DashboardPage() {
  const { mode } = useSandbox();

  const [statuses, setStatuses] = useState<ServiceStatus[]>([
    { name: 'API Gateway', key: 'gateway', status: 'loading', endpoint: '/health' },
    { name: 'User Service', key: 'users', status: 'loading', endpoint: '/users/health' },
    { name: 'Product Service', key: 'products', status: 'loading', endpoint: '/products/' },
    { name: 'Inventory Service', key: 'inventory', status: 'loading', endpoint: '/inventory/1' },
    { name: 'Order Service', key: 'orders', status: 'loading', endpoint: '/orders/' },
  ]);

  const [productCount, setProductCount] = useState<number | null>(null);
  const [totalStock, setTotalStock] = useState<number | null>(null);
  const [orderCount, setOrderCount] = useState<number | null>(null);

  useEffect(() => {
    checkHealth();
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const productsRes = await api.get('/products/', { params: { page: 1, limit: 100 } });
      setProductCount(productsRes.data.length);

      const ordersRes = await api.get('/orders/');
      setOrderCount(ordersRes.data.length);

      let stockSum = 0;
      await Promise.all(
        productsRes.data.map(async (p: any) => {
          try {
            const invRes = await api.get(`/inventory/${p.id}`);
            stockSum += invRes.data.available_quantity || 0;
          } catch {
            // Unmapped stock counts as 0
          }
        })
      );
      setTotalStock(stockSum);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    }
  };

  const checkHealth = async () => {
    let isGatewayUp = false;
    try {
      const res = await api.get('/health');
      if (res.status === 200 && res.data?.status === 'healthy') {
        isGatewayUp = true;
        updateStatus('gateway', 'up');
      } else {
        updateStatus('gateway', 'down');
      }
    } catch {
      updateStatus('gateway', 'down');
      setStatuses(prev => 
        prev.map(s => s.key === 'gateway' ? { ...s, status: 'down' } : { ...s, status: 'down' })
      );
      return;
    }

    if (!isGatewayUp) return;

    const downstreamChecks = statuses.filter(s => s.key !== 'gateway');

    await Promise.all(
      downstreamChecks.map(async (service) => {
        try {
          const res = await api.get(service.endpoint);
          if (res.status === 503 || res.data?.error === 'Service unavailable') {
            updateStatus(service.key, 'down');
          } else {
            updateStatus(service.key, 'up');
          }
        } catch (error: any) {
          if (error.response) {
            if (error.response.status === 503 || error.response.data?.error === 'Service unavailable') {
              updateStatus(service.key, 'down');
            } else {
              updateStatus(service.key, 'up');
            }
          } else {
            updateStatus(service.key, 'down');
          }
        }
      })
    );
  };

  const updateStatus = (key: string, status: 'up' | 'down') => {
    setStatuses(prev => 
      prev.map(s => s.key === key ? { ...s, status } : s)
    );
  };

  const handleRefreshAll = () => {
    checkHealth();
    fetchMetrics();
  };

  return (
    <PageContainer 
      title={mode === 'operator' ? "Telemetry Status" : "Welcome Operator!"} 
      description={
        mode === 'operator'
          ? "Inspect cluster connection points and health metrics."
          : "Explore the custom microservice cluster sandbox."
      }
      action={
        <button 
          onClick={handleRefreshAll}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white shadow transition-all duration-150 active:scale-95 cursor-pointer uppercase tracking-wider border-transparent ${
            mode === 'operator' ? 'bg-[#B8B8FF] hover:bg-[#a3a3f5]' : 'bg-[#FFB7B2] hover:bg-[#f3a49e]'
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          Refresh Stats
        </button>
      }
    >
      {/* Welcome Banner Card */}
      <div className="bg-white border border-[#FFE5D9] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6 relative overflow-hidden text-left">
        <div className="bg-[#FFE5D9]/20 p-2 rounded-2xl border border-[#FFE5D9]/40 flex-shrink-0">
          <Mascot state="idle" size={80} />
        </div>
        <div className="space-y-1.5 flex-1 relative z-10 font-sans">
          <h3 className="text-lg font-bold text-[#2E2522] flex items-center gap-2">
            {mode === 'operator' ? 'Cluster Console Active' : 'CloudCart Sandbox Mode Active'}
          </h3>
          <p className="text-xs text-[#7D726D] max-w-2xl leading-relaxed font-sans">
            {mode === 'operator'
              ? "You are inspecting the decoupled backend environment. Monitor services health, create catalog schemas, and restock products."
              : "Welcome to our cloud-native e-commerce project! Click the Shop Catalog to browse products, add items to your cart, and simulate UPI/Card checkout processing."}
          </p>
          <div className="pt-2">
            <Link 
              href={mode === 'operator' ? "/inventory" : "/products"}
              className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider hover:underline ${
                mode === 'operator' ? 'text-[#B8B8FF]' : 'text-[#FFB7B2]'
              }`}
            >
              {mode === 'operator' ? 'Audit Warehouse Inventory' : 'Explore Shop Catalog'}
              <ArrowRight className="h-4.5 w-4.5" />
            </Link>
          </div>
        </div>
      </div>

      {mode === 'operator' ? (
        /* DEVELOPER OPERATOR TELEMETRY DASHBOARD */
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 font-sans text-left">
            <div className="bg-white border border-[#FFE5D9] rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#7D726D]">Products</span>
                <Package className="h-4.5 w-4.5 text-[#B8B8FF]" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-[#2E2522] tracking-tight">
                  {productCount !== null ? String(productCount).padStart(2, '0') : '—'}
                </span>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">// catalog items registered</p>
              </div>
            </div>

            <div className="bg-white border border-[#FFE5D9] rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#7D726D]">Warehouse Stock</span>
                <Archive className="h-4.5 w-4.5 text-[#B8B8FF]" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-[#2E2522] tracking-tight">
                  {totalStock !== null ? String(totalStock).padStart(2, '0') : '—'}
                </span>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">// physical units available</p>
              </div>
            </div>

            <div className="bg-white border border-[#FFE5D9] rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#7D726D]">Orders Processed</span>
                <ShoppingCart className="h-4.5 w-4.5 text-[#B8B8FF]" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-[#2E2522] tracking-tight">
                  {orderCount !== null ? String(orderCount).padStart(2, '0') : '—'}
                </span>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">// logged transaction sets</p>
              </div>
            </div>

            <div className="bg-white border border-[#FFE5D9] rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#7D726D]">Cluster state</span>
                <Server className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <div className="mt-4 flex items-center gap-1.5 font-bold">
                {statuses.every(s => s.status === 'up') ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                    <span className="text-xs text-emerald-500 uppercase tracking-wider">All Systems Operational</span>
                  </>
                ) : statuses.some(s => s.status === 'down') ? (
                  <>
                    <XCircle className="h-5 w-5 text-rose-400" />
                    <span className="text-xs text-rose-500 uppercase tracking-wider">Services Disrupted</span>
                  </>
                ) : (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-slate-200 border-t-[#B8B8FF] animate-spin" />
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Syncing node pings...</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Services Health Check checklists */}
          <div className="bg-white border border-[#FFE5D9] rounded-3xl shadow-sm overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-[#FFE5D9] flex items-center justify-between bg-[#FFFBF4]/30">
              <h3 className="text-xs font-bold text-[#2E2522] uppercase tracking-wider flex items-center gap-2">
                <Heart className="h-4 w-4 text-[#B8B8FF]" />
                Cluster Node Status
              </h3>
              <span className="text-[9px] text-[#7D726D] font-bold uppercase tracking-wider">Proxy Ingress on Port 8000</span>
            </div>
            <div className="divide-y divide-[#FFE5D9]/50">
              {statuses.map((service) => (
                <div key={service.key} className="flex items-center justify-between px-6 py-4">
                  <div className="space-y-0.5 font-sans">
                    <p className="text-xs font-extrabold text-[#2E2522]">{service.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {service.key === 'gateway' ? 'http://localhost:8000' + service.endpoint : '/api/v1' + service.endpoint}
                    </p>
                  </div>

                  <div>
                    {service.status === 'loading' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-500 text-[10px] font-bold uppercase animate-pulse">
                        Pinging...
                      </span>
                    )}
                    {service.status === 'up' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#E2FCEF] text-[#4ADE80] border border-[#A7F3D0]/50 text-[10px] font-bold uppercase">
                        ONLINE
                      </span>
                    )}
                    {service.status === 'down' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 text-rose-500 border border-rose-100 text-[10px] font-bold uppercase">
                        OFFLINE
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* CUSTOMER SHOPPING DASHBOARD OVERVIEW */
        <div className="grid gap-6 md:grid-cols-2 font-sans text-left">
          {/* Quick Metrics */}
          <div className="bg-white border border-[#FFE5D9] rounded-3xl p-6 shadow-sm flex flex-col justify-between h-48 relative overflow-hidden">
            <div className="flex items-center justify-between text-[#FFB7B2]">
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#7D726D]">Shopping Catalog</span>
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-2xl font-extrabold text-[#2E2522]">
                {productCount !== null ? String(productCount).padStart(2, '0') : '—'}
              </h4>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">// items available to purchase</p>
            </div>
            <Link 
              href="/products"
              className="text-xs font-bold text-[#FFB7B2] uppercase tracking-wider inline-flex items-center gap-1 hover:underline"
            >
              Browse Catalog
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="bg-white border border-[#FFE5D9] rounded-3xl p-6 shadow-sm flex flex-col justify-between h-48 relative overflow-hidden">
            <div className="flex items-center justify-between text-[#FFB7B2]">
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#7D726D]">My Checkout Orders</span>
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-2xl font-extrabold text-[#2E2522]">
                {orderCount !== null ? String(orderCount).padStart(2, '0') : '—'}
              </h4>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">// trace logs recorded</p>
            </div>
            <Link 
              href="/orders"
              className="text-xs font-bold text-[#FFB7B2] uppercase tracking-wider inline-flex items-center gap-1 hover:underline"
            >
              View Order Ledger
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
