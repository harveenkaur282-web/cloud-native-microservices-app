'use client';

import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { api } from '@/services/api';
import { 
  Server, 
  ShieldCheck, 
  ShieldAlert, 
  Package, 
  Archive, 
  ShoppingCart, 
  Activity,
  Layers,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  key: string;
  status: 'loading' | 'up' | 'down';
  endpoint: string;
}

export default function DashboardPage() {
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
      // Fetch products
      const productsRes = await api.get('/products/', { params: { page: 1, limit: 100 } });
      setProductCount(productsRes.data.length);

      // Fetch orders
      const ordersRes = await api.get('/orders/');
      setOrderCount(ordersRes.data.length);

      // Fetch stock levels concurrently
      let stockSum = 0;
      await Promise.all(
        productsRes.data.map(async (p: any) => {
          try {
            const invRes = await api.get(`/inventory/${p.id}`);
            stockSum += invRes.data.available_quantity || 0;
          } catch {
            // Unregistered inventory records count as 0 stock
          }
        })
      );
      setTotalStock(stockSum);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    }
  };

  const checkHealth = async () => {
    // 1. Check Gateway first
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
      // If gateway is down, all other downstream service requests through gateway will fail
      setStatuses(prev => 
        prev.map(s => s.key === 'gateway' ? { ...s, status: 'down' } : { ...s, status: 'down' })
      );
      return;
    }

    if (!isGatewayUp) return;

    // 2. Check other downstream services via Gateway
    const downstreamChecks = statuses.filter(s => s.key !== 'gateway');

    await Promise.all(
      downstreamChecks.map(async (service) => {
        try {
          const res = await api.get(service.endpoint);
          
          // Downstream services respond or return 401/404 if they are active.
          // The Gateway returns 503 {"error": "Service unavailable"} if a downstream is offline.
          if (res.status === 503 || res.data?.error === 'Service unavailable') {
            updateStatus(service.key, 'down');
          } else {
            updateStatus(service.key, 'up');
          }
        } catch (error: any) {
          // If we get an error response (like 401 Unauthorized or 404 Not Found), the service is UP.
          // If we get a 503 Service Unavailable, the service is DOWN.
          if (error.response) {
            if (error.response.status === 503 || error.response.data?.error === 'Service unavailable') {
              updateStatus(service.key, 'down');
            } else {
              updateStatus(service.key, 'up');
            }
          } else {
            // Network failure or no response
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
      title="CloudCart System Overview" 
      description="Real-time status monitoring and analytics for the cloud-native microservices e-commerce application."
      action={
        <button 
          onClick={handleRefreshAll}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <Activity className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
          Refresh Status
        </button>
      }
    >
      {/* Overview Intro */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-950 mb-2 flex items-center gap-2">
          <Layers className="h-5 w-5 text-blue-600" />
          Welcome to the CloudCart Control Panel
        </h3>
        <p className="text-sm text-slate-500 max-w-3xl leading-relaxed">
          This administration dashboard integrates with the CloudCart API Gateway, allowing developers and administrators to manage product catalogs, inventory stock levels, order lifecycles, and check system architecture topology in real time.
        </p>
      </div>
 
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Products Managed</span>
            <Package className="h-5 w-5 text-slate-400" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-semibold text-slate-900">
              {productCount !== null ? productCount : '—'}
            </span>
            <p className="text-xs text-slate-400 mt-1">Total active catalog products</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inventory Items</span>
            <Archive className="h-5 w-5 text-slate-400" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-semibold text-slate-900">
              {totalStock !== null ? totalStock : '—'}
            </span>
            <p className="text-xs text-slate-400 mt-1">Available warehouse items</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Orders Logged</span>
            <ShoppingCart className="h-5 w-5 text-slate-400" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-semibold text-slate-900">
              {orderCount !== null ? orderCount : '—'}
            </span>
            <p className="text-xs text-slate-400 mt-1">Fulfillment lifecycle records</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">System State</span>
            <Server className="h-5 w-5 text-slate-400" />
          </div>
          <div className="mt-2.5 flex items-center gap-1.5">
            {statuses.every(s => s.status === 'up') ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-700">Healthy</span>
              </>
            ) : statuses.some(s => s.status === 'down') ? (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm font-semibold text-red-700">Degraded</span>
              </>
            ) : (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-blue-500 animate-spin" />
                <span className="text-sm font-semibold text-slate-500">Checking...</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Services Health Panel */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-md font-semibold text-slate-950 flex items-center gap-2">
            <Server className="h-4.5 w-4.5 text-slate-500" />
            Microservices Health Status
          </h3>
          <span className="text-xs text-slate-400">Proxied via Port 8000</span>
        </div>
        <div className="divide-y divide-slate-100">
          {statuses.map((service) => (
            <div key={service.key} className="flex items-center justify-between px-6 py-3.5">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-slate-900">{service.name}</p>
                <p className="text-xs text-slate-500 font-mono">
                  {service.key === 'gateway' ? 'http://localhost:8000' + service.endpoint : '/api/v1' + service.endpoint}
                </p>
              </div>

              <div>
                {service.status === 'loading' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 animate-pulse">
                    Checking...
                  </span>
                )}
                {service.status === 'up' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="h-3 w-3" />
                    ONLINE
                  </span>
                )}
                {service.status === 'down' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                    <ShieldAlert className="h-3 w-3" />
                    OFFLINE
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
