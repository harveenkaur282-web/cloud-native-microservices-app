'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import { api } from '@/services/api';
import { Order } from '@/types';
import { AlertCircle, RefreshCw, ShoppingCart, Loader2, ArrowRight } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Order[]>('/orders/');
      // Sort orders by id descending (newest first)
      const sorted = response.data.sort((a, b) => b.id - a.id);
      setOrders(sorted);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch orders. Please ensure the Order Service is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/10 border border-amber-200/50">
            Pending
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 border border-blue-200/50">
            Confirmed
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20 border border-green-200/50">
            Paid
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-700 ring-1 ring-inset ring-purple-700/10 border border-purple-200/50">
            Shipped
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 border border-emerald-200/50">
            Delivered
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/10 border border-red-200/50">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600">
            {status}
          </span>
        );
    }
  };

  return (
    <PageContainer
      title="Customer Orders"
      description="Monitor customer purchase activities, status states, and fulfillment operations."
    >
      <div className="space-y-6">
        {/* Table Container Card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900">All Orders</h3>
            <button
              onClick={fetchOrders}
              className="inline-flex items-center gap-1.5 rounded bg-white border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Reload Orders
            </button>
          </div>

          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-slate-500 font-medium">Fetching customer orders...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center flex flex-col items-center justify-center border-t border-slate-100">
              <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
              <h4 className="text-sm font-bold text-slate-900">Service Synced Failed</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md">{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-slate-400 mb-2" />
              <h4 className="text-sm font-bold text-slate-900">No Orders Registered</h4>
              <p className="text-xs text-slate-500 mt-1">
                There are no customer orders registered in the Order Service database yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-500">
                <thead className="bg-slate-50/50 text-xs font-semibold uppercase text-slate-400 border-b border-slate-100">
                  <tr>
                    <th scope="col" className="px-6 py-4">Order ID</th>
                    <th scope="col" className="px-6 py-4">User ID</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4 text-right">Items</th>
                    <th scope="col" className="px-6 py-4 text-right">Total Amount</th>
                    <th scope="col" className="px-6 py-4 text-right">Created Date</th>
                    <th scope="col" className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 border-t border-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">
                        USER_{order.user_id}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-700">
                        {order.items?.length || 0} items
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">
                        ${parseFloat(order.total_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-slate-400">
                        {new Date(order.created_at).toLocaleString(undefined, {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors"
                        >
                          Details
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
