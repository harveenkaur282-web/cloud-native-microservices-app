'use client';

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import { api } from '@/services/api';
import { Order, Product } from '@/types';
import { ArrowLeft, Package, User, DollarSign, Calendar, RefreshCw, AlertCircle, AlertTriangle, CheckCircle, Truck, ShoppingBag, Landmark } from 'lucide-react';

interface ResolvedItem {
  id: number;
  productId: number;
  quantity: number;
  name: string;
  category: string;
  loading: boolean;
}

const LIFECYCLE_STEPS = ['PENDING', 'CONFIRMED', 'PAID', 'SHIPPED', 'DELIVERED'];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = parseInt(resolvedParams.id, 10);

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<ResolvedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Transition actions state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchOrderDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActionError(null);
    try {
      if (isNaN(orderId)) {
        setError('Invalid order ID format.');
        return;
      }
      const response = await api.get<Order>(`/orders/${orderId}`);
      const orderData = response.data;
      setOrder(orderData);

      // Pre-initialize items list
      const initialItems: ResolvedItem[] = orderData.items.map((item) => ({
        id: item.id,
        productId: item.product_id,
        quantity: item.quantity,
        name: `Product #${item.product_id}`,
        category: 'Syncing...',
        loading: true,
      }));
      setItems(initialItems);

      // Resolve product information sequentially/concurrently
      await Promise.all(
        orderData.items.map(async (item) => {
          try {
            const productRes = await api.get<Product>(`/products/${item.product_id}`);
            setItems((prev) =>
              prev.map((pi) =>
                pi.productId === item.product_id
                  ? {
                      ...pi,
                      name: productRes.data.name,
                      category: productRes.data.category,
                      loading: false,
                    }
                  : pi
              )
            );
          } catch (err) {
            console.error(`Failed to fetch details for product ${item.product_id}`, err);
            setItems((prev) =>
              prev.map((pi) =>
                pi.productId === item.product_id
                  ? {
                      ...pi,
                      loading: false,
                    }
                  : pi
              )
            );
          }
        })
      );
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 404) {
        setError('Order not found.');
      } else {
        setError('Failed to load order details. Please ensure the Order Service is running.');
      }
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // Status transition handler
  const handleUpdateStatus = async (targetStatus: string) => {
    if (!order) return;
    setIsSubmitting(true);
    setActionError(null);

    try {
      const response = await api.patch<Order>(`/orders/${order.id}/status`, {
        status: targetStatus,
      });
      setOrder(response.data);
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail;
      setActionError(
        detail || `Could not update status to ${targetStatus}. Please check transition limits.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resolve the next logical status from PENDING -> CONFIRMED -> PAID -> SHIPPED -> DELIVERED
  const getNextStatus = (currentStatus: string): string | null => {
    const idx = LIFECYCLE_STEPS.indexOf(currentStatus);
    if (idx !== -1 && idx < LIFECYCLE_STEPS.length - 1) {
      return LIFECYCLE_STEPS[idx + 1];
    }
    return null;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/10 border border-amber-200/50">
            Pending
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 border border-blue-200/50">
            Confirmed
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20 border border-green-200/50">
            Paid
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 ring-1 ring-inset ring-purple-700/10 border border-purple-200/50">
            Shipped
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 border border-emerald-200/50">
            Delivered
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/10 border border-red-200/50">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {status}
          </span>
        );
    }
  };

  const getTimelineIcon = (step: string) => {
    switch (step) {
      case 'PENDING':
        return <ShoppingBag className="h-5 w-5" />;
      case 'CONFIRMED':
        return <CheckCircle className="h-5 w-5" />;
      case 'PAID':
        return <Landmark className="h-5 w-5" />;
      case 'SHIPPED':
        return <Truck className="h-5 w-5" />;
      case 'DELIVERED':
        return <Package className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  // Render the lifecycle timeline
  const renderTimeline = () => {
    if (!order) return null;

    if (order.status === 'CANCELLED') {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-5 flex items-start gap-3 text-red-700">
          <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Order Cancelled</h4>
            <p className="text-xs text-red-600 mt-1">
              This order has been cancelled. Any reserved stock allocations prepared for this order have been rolled back. Terminal state reached.
            </p>
          </div>
        </div>
      );
    }

    const currentIdx = LIFECYCLE_STEPS.indexOf(order.status);

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Fulfillment Timeline</h3>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
          {/* Connector Line for Desktop */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 hidden md:block z-0"></div>

          {LIFECYCLE_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentIdx;
            const isActive = idx === currentIdx;

            return (
              <div key={step} className="flex md:flex-col items-center gap-4 md:gap-2 relative z-10 flex-1">
                {/* Status Node Circle */}
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center border shadow-sm transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-100 scale-110'
                      : isCompleted
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  {getTimelineIcon(step)}
                </div>

                {/* Text Indicator */}
                <div className="text-left md:text-center">
                  <span
                    className={`block text-xs font-bold ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    {step}
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    {isActive ? 'Current State' : isCompleted ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const nextState = order ? getNextStatus(order.status) : null;
  const canCancel = order && ['PENDING', 'CONFIRMED', 'PAID'].includes(order.status);

  return (
    <PageContainer
      title="Order Details"
      description="Track and progress user checkout instances registered within the Order Service."
    >
      <div className="space-y-6">
        {/* Back link */}
        <div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to orders</span>
          </Link>
        </div>

        {loading ? (
          <div className="animate-pulse bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
            <div className="h-6 bg-slate-200 rounded w-1/4"></div>
            <div className="h-10 bg-slate-200 rounded w-full"></div>
            <div className="h-32 bg-slate-200 rounded w-full"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 border border-red-200 bg-red-50/50 rounded-lg text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
            <h3 className="text-md font-semibold text-slate-900 mb-1">Error Loading Order</h3>
            <p className="text-sm text-slate-600 max-w-md mb-4">{error}</p>
            <button
              onClick={fetchOrderDetails}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : order ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Order Info & Timeline */}
            <div className="lg:col-span-2 space-y-6">
              {/* Timeline Card */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                {renderTimeline()}
              </div>

              {/* Items Card */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 p-4 bg-slate-50/50">
                  <h3 className="text-sm font-bold text-slate-900">Ordered Items</h3>
                </div>

                <div className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                          <span className="text-xs text-slate-400 capitalize">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block text-sm font-semibold text-slate-900">
                          Qty: {item.quantity}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          Product ID: {item.productId}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions & Overview Panel */}
            <div className="space-y-6">
              {/* Status Controls Card */}
              {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Fulfillment Controls</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Advance the lifecycle state of this order. Operations validate rules against downstream microservices.
                  </p>

                  {actionError && (
                    <div className="flex items-start gap-2 rounded bg-red-50 p-3 text-xs text-red-700 border border-red-100">
                      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>{actionError}</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    {nextState && (
                      <button
                        onClick={() => handleUpdateStatus(nextState)}
                        disabled={isSubmitting}
                        className="w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none disabled:bg-blue-400 transition-colors"
                      >
                        {isSubmitting ? 'Updating...' : `Advance to ${nextState}`}
                      </button>
                    )}

                    {canCancel && (
                      <button
                        onClick={() => handleUpdateStatus('CANCELLED')}
                        disabled={isSubmitting}
                        className="w-full justify-center rounded-md border border-red-200 bg-red-50 py-2 px-4 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100 transition-colors"
                      >
                        {isSubmitting ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Overview Details Card */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Order Summary</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Order Reference</span>
                    <span className="font-mono text-slate-800 font-bold">#{order.id}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Active Status</span>
                    <span>{getStatusBadge(order.status)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Owner User ID</span>
                    <span className="font-mono text-slate-800">USER_{order.user_id}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Date Created</span>
                    <span className="text-slate-800">
                      {new Date(order.created_at).toLocaleString()}
                    </span>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-sm font-bold text-slate-950">Total Amount</span>
                    <span className="text-2xl font-extrabold text-blue-600">
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}
