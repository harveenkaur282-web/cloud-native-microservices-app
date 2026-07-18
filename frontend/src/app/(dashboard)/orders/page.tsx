'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import { api } from '@/services/api';
import { Order } from '@/types';
import { useSandbox } from '@/hooks/use-sandbox';
import { useAuth } from '@/hooks/use-auth';
import { AlertCircle, RefreshCw, ShoppingCart, Loader2, ArrowRight, Clock } from 'lucide-react';
import Mascot from '@/components/mascot/Mascot';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { mode } = useSandbox();
  const { user } = useAuth();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Order[]>('/orders/');
      let data = response.data;
      
      // If Customer mode, isolate order logs to active user credentials
      if (mode === 'customer' && user) {
        data = data.filter(order => order.user_id === user.id);
      }

      const sorted = data.sort((a, b) => b.id - a.id);
      setOrders(sorted);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch transaction logs. Please ensure the Order Service is running.');
    } finally {
      setLoading(false);
    }
  }, [mode, user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center rounded-xl bg-amber-50 px-2.5 py-0.5 text-[9px] font-bold text-amber-600 border border-amber-200/50 uppercase">
            Pending
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center rounded-xl bg-[#E8E8FF] px-2.5 py-0.5 text-[9px] font-bold text-[#FFB7B2] border border-[#D8D8FF]/30 uppercase">
            Confirmed
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center rounded-xl bg-[#E2FCEF] px-2.5 py-0.5 text-[9px] font-bold text-[#4ADE80] border border-[#A7F3D0]/30 uppercase">
            Paid
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center rounded-xl bg-[#E8E8FF] px-2.5 py-0.5 text-[9px] font-bold text-[#B8B8FF] border border-[#D8D8FF]/30 uppercase">
            Shipped
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center rounded-xl bg-[#E2FCEF] px-2.5 py-0.5 text-[9px] font-bold text-teal-600 border border-[#A7F3D0]/30 uppercase">
            Delivered
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center rounded-xl bg-rose-50 px-2.5 py-0.5 text-[9px] font-bold text-rose-500 border border-rose-100 uppercase">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-xl bg-slate-50 px-2.5 py-0.5 text-[9px] font-bold text-slate-500 border border-slate-200 uppercase">
            {status}
          </span>
        );
    }
  };

  return (
    <PageContainer
      title={mode === 'operator' ? "Fulfillment Log" : "My Checkout Orders"}
      description={
        mode === 'operator' 
          ? "Monitor order lifecycles processing across the platform pipelines." 
          : "Trace the microservice delivery pipeline status of your purchases."
      }
    >
      <div className="space-y-6 font-sans text-left">
        {/* Table Container Card */}
        <div className="bg-white rounded-3xl border border-[#FFE5D9] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#FFE5D9] p-4 bg-[#FFFBF4]/20">
            <h3 className="text-xs font-bold text-[#2E2522] uppercase tracking-wider">
              {mode === 'operator' ? 'Cluster Transaction Ledger' : 'Personal Order History'}
            </h3>
            <button
              onClick={fetchOrders}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#FFE5D9] bg-white px-3 py-2 text-xs font-bold text-[#7D726D] hover:bg-[#FFE5D9]/20 transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw className="h-3 w-3" />
              Reload Logs
            </button>
          </div>

          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-[#FFB7B2]" />
              <p className="text-xs text-slate-500 font-semibold">// Retrieving order records...</p>
            </div>
          ) : error ? (
            <div className="p-16 text-center flex flex-col items-center justify-center bg-white border-t border-[#FFE5D9]">
              <AlertCircle className="h-8 w-8 text-rose-400 mb-2" />
              <h4 className="text-xs font-bold text-[#2E2522] uppercase">Fulfillment Stream Offline</h4>
              <p className="text-xs text-slate-500 mt-1.5 max-w-sm">{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center bg-white border-t border-[#FFE5D9]">
              <Mascot state="sleeping" size={80} className="mb-4" />
              <h4 className="text-xs font-bold text-[#2E2522] uppercase">No Orders Tracked</h4>
              <p className="text-xs text-[#7D726D] mt-1">
                {mode === 'customer' 
                  ? "You haven't placed any orders yet. Visit the catalog to shop!"
                  : "There are no customer orders registered in the platform database."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs text-slate-500">
                <thead className="bg-[#FFFBF4]/10 text-[10px] font-bold uppercase tracking-wider text-[#7D726D] border-b border-[#FFE5D9]">
                  <tr>
                    <th scope="col" className="px-6 py-4">Fulfillment Ref</th>
                    <th scope="col" className="px-6 py-4">Account ID</th>
                    <th scope="col" className="px-6 py-4">Pipeline Status</th>
                    <th scope="col" className="px-6 py-4 text-right">Items</th>
                    <th scope="col" className="px-6 py-4 text-right">Total Amount</th>
                    <th scope="col" className="px-6 py-4 text-right">Timestamp</th>
                    <th scope="col" className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FFE5D9]/50 border-t border-[#FFE5D9]">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#FFFBF4]/10 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-[#2E2522]">
                        #{String(order.id).padStart(5, '0')}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-400">
                        USR_{String(order.user_id).padStart(4, '0')}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 text-right text-[#2E2522] font-semibold">
                        {order.items?.length || 0} unit(s)
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-[#2E2522]">
                        ₹{parseFloat(order.total_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-[10px] text-slate-400 flex items-center justify-end gap-1">
                        <Clock className="h-3.5 w-3.5 text-[#FFE5D9]" />
                        {new Date(order.created_at).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/orders/${order.id}`}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 border hover:bg-opacity-20 rounded-xl text-[10px] font-bold transition-all shadow-sm ${
                            mode === 'operator'
                              ? 'bg-[#B8B8FF]/10 border-[#B8B8FF]/30 text-[#B8B8FF] hover:bg-[#B8B8FF]/20'
                              : 'bg-[#FFB7B2]/10 border-[#FFB7B2]/30 text-[#FFB7B2] hover:bg-[#FFB7B2]/20'
                          }`}
                        >
                          Trace Pipeline
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
