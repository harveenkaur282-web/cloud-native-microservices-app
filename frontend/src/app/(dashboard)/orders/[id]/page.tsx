'use client';

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import { api } from '@/services/api';
import { Order, Product } from '@/types';
import { useSandbox } from '@/hooks/use-sandbox';
import { ArrowLeft, Package, AlertCircle, AlertTriangle, CheckCircle, Truck, ShoppingBag, Landmark, CreditCard, Loader2, Check } from 'lucide-react';
import Mascot from '@/components/mascot/Mascot';

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
  
  const { mode } = useSandbox();

  // Action / Payment state management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | null>(null);

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

      const initialItems: ResolvedItem[] = orderData.items.map((item) => ({
        id: item.id,
        productId: item.product_id,
        quantity: item.quantity,
        name: `Product #${item.product_id}`,
        category: 'Syncing...',
        loading: true,
      }));
      setItems(initialItems);

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
                  ? { ...pi, loading: false }
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

  // Handle pipeline status transitions in Operator Mode
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

  // Handle pay authorization in Customer Mode
  const handlePayOrderSubmit = async () => {
    if (!order || !paymentMethod) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      const res = await api.post<Order>(`/orders/${order.id}/pay`, {
        payment_method: paymentMethod
      });
      setOrder(res.data);
    } catch (err: any) {
      console.error(err);
      setActionError('Payment authorization failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const getTimelineIcon = (step: string) => {
    switch (step) {
      case 'PENDING':
        return <ShoppingBag className="h-4 w-4" />;
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4" />;
      case 'PAID':
        return <Landmark className="h-4 w-4" />;
      case 'SHIPPED':
        return <Truck className="h-4 w-4" />;
      case 'DELIVERED':
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const renderTimeline = () => {
    if (!order) return null;

    if (order.status === 'CANCELLED') {
      return (
        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-5 flex items-start gap-3 text-rose-800">
          <AlertTriangle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div className="text-left font-sans">
            <h4 className="font-bold text-xs uppercase tracking-wide">Fulfillment Interrupted</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              This order has been set to the CANCELLED state. All reserved warehouse stock has been rolled back.
            </p>
          </div>
        </div>
      );
    }

    const currentIdx = LIFECYCLE_STEPS.indexOf(order.status);

    return (
      <div className="space-y-6">
        <h3 className="text-xs font-bold text-[#2E2522] uppercase tracking-wider">// Checkout Progress Map</h3>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4 select-none">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#FFE5D9] -translate-y-1/2 hidden md:block z-0"></div>

          {LIFECYCLE_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentIdx;
            const isActive = idx === currentIdx;

            return (
              <div key={step} className="flex md:flex-col items-center gap-4 md:gap-2 relative z-10 flex-1">
                <div
                  className={`h-9 w-9 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                    isActive
                      ? mode === 'operator' ? 'bg-[#B8B8FF] text-white border-[#B8B8FF] shadow scale-110' : 'bg-[#FFB7B2] text-white border-[#FFB7B2] shadow scale-110'
                      : isCompleted
                      ? 'bg-[#C8E6C9] text-white border-[#C8E6C9]'
                      : 'bg-white text-slate-300 border-[#FFE5D9]'
                  }`}
                >
                  {getTimelineIcon(step)}
                </div>

                <div className="text-left md:text-center">
                  <span
                    className={`block text-[10px] font-bold tracking-wider ${
                      isActive 
                        ? mode === 'operator' ? 'text-[#B8B8FF]' : 'text-[#FFB7B2]'
                        : isCompleted ? 'text-emerald-500' : 'text-slate-400'
                    }`}
                  >
                    {step}
                  </span>
                  <span className="block text-[8px] text-slate-400 font-extrabold uppercase mt-0.5">
                    {isActive ? 'CURRENT' : isCompleted ? 'DONE' : 'PENDING'}
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
      title="Trace Details"
      description="Orchestrate and advance active checkout pipeline states."
    >
      <div className="space-y-6 font-sans text-left">
        <div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to ledger</span>
          </Link>
        </div>

        {loading ? (
          <div className="animate-pulse bg-white border border-[#FFE5D9] rounded-3xl p-6 shadow-sm space-y-6">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-10 bg-slate-200 rounded w-full"></div>
            <div className="h-32 bg-slate-200 rounded w-full"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 border border-rose-100 bg-rose-50/50 rounded-3xl text-center">
            <AlertCircle className="h-8 w-8 text-rose-500 mb-3" />
            <h3 className="text-xs font-bold text-slate-700 uppercase">Fulfillment trace disrupted</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">{error}</p>
            <button
              onClick={fetchOrderDetails}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#FFB7B2] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#f3a49e] transition-all cursor-pointer uppercase tracking-wider border-transparent"
            >
              Retry Connection
            </button>
          </div>
        ) : order ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Main Order Info & Timeline */}
            <div className="lg:col-span-2 space-y-6">
              {/* Timeline Card */}
              <div className="bg-white rounded-3xl border border-[#FFE5D9] shadow-sm p-6">
                {renderTimeline()}
              </div>

              {/* Items Card */}
              <div className="bg-white rounded-3xl border border-[#FFE5D9] shadow-sm overflow-hidden">
                <div className="border-b border-[#FFE5D9] p-4 bg-[#FFFBF4]/20 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#2E2522] uppercase tracking-wider">Ordered items</h3>
                  <span className="text-[10px] text-slate-400">Order Service Registry</span>
                </div>

                <div className="divide-y divide-[#FFE5D9]/50">
                  {items.map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-[#FFFBF4]/40 border border-[#FFE5D9]/40 flex items-center justify-center text-slate-400">
                          <Package className="h-4.5 w-4.5 text-[#FFB7B2]" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#2E2522]">{item.name}</h4>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#E8E8FF]/40 border border-[#D8D8FF]/30 text-[#FFB7B2] font-bold uppercase mt-1 inline-block">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block text-xs font-bold text-[#2E2522]">
                          Quantity: {item.quantity}
                        </span>
                        <span className="block text-[9px] text-slate-400 mt-0.5">
                          ID: {item.productId}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions & Overview Panel */}
            <div className="space-y-6">
              {/* Operator Controls Panel */}
              {mode === 'operator' && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                <div className="bg-white rounded-3xl border border-[#FFE5D9] shadow-sm p-6 space-y-4">
                  <h3 className="text-xs font-bold text-[#2E2522] uppercase tracking-wider">Fulfillment controls</h3>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                    Update pipeline status. Actions validate checkout rules downstream.
                  </p>

                  {actionError && (
                    <div className="flex items-start gap-2 rounded bg-rose-50 p-3 text-xs text-rose-800 border border-rose-100">
                      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-rose-500" />
                      <span>{actionError}</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    {nextState && (
                      <button
                        onClick={() => handleUpdateStatus(nextState)}
                        disabled={isSubmitting}
                        className="w-full justify-center rounded-2xl bg-[#B8B8FF] hover:bg-[#a3a3f5] text-xs font-bold text-white py-3 px-4 shadow transition-all duration-150 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed uppercase tracking-wider border-transparent"
                      >
                        {isSubmitting ? 'UPDATING...' : `ADVANCE TO ${nextState}`}
                      </button>
                    )}

                    {canCancel && (
                      <button
                        onClick={() => handleUpdateStatus('CANCELLED')}
                        disabled={isSubmitting}
                        className="w-full justify-center rounded-2xl border border-[#FFE5D9] hover:bg-[#FFE5D9]/20 text-xs font-bold text-slate-500 py-3 px-4 transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider"
                      >
                        {isSubmitting ? 'CANCELLING...' : 'Cancel Order'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Customer Payment Panel */}
              {mode === 'customer' && order.status === 'PENDING' && (
                <div className="bg-white rounded-3xl border border-[#FFE5D9] shadow-sm p-6 space-y-4 animate-scaleUp">
                  <div>
                    <h3 className="text-xs font-bold text-[#2E2522] uppercase tracking-wider">Payment Required</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                      Select mock payment method to finalize database transactions.
                    </p>
                  </div>

                  {actionError && (
                    <div className="p-2.5 rounded bg-rose-50 border border-rose-100 text-[10px] text-rose-800 font-bold">
                      {actionError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3.5">
                    <button
                      onClick={() => setPaymentMethod('UPI')}
                      className={`flex flex-col items-center gap-2.5 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        paymentMethod === 'UPI'
                          ? 'border-[#FFB7B2] bg-[#FFB7B2]/15 text-[#FFB7B2] font-bold'
                          : 'border-[#FFE5D9] bg-white text-slate-500 hover:bg-[#FFE5D9]/10'
                      }`}
                    >
                      <Landmark className="h-5.5 w-5.5" />
                      <span className="text-[9px] uppercase font-bold tracking-wider">UPI</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('CARD')}
                      className={`flex flex-col items-center gap-2.5 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        paymentMethod === 'CARD'
                          ? 'border-[#FFB7B2] bg-[#FFB7B2]/15 text-[#FFB7B2] font-bold'
                          : 'border-[#FFE5D9] bg-white text-slate-500 hover:bg-[#FFE5D9]/10'
                      }`}
                    >
                      <CreditCard className="h-5.5 w-5.5" />
                      <span className="text-[9px] uppercase font-bold tracking-wider">Card</span>
                    </button>
                  </div>

                  <button
                    onClick={handlePayOrderSubmit}
                    disabled={isSubmitting || !paymentMethod}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#FFB7B2] hover:bg-[#f3a49e] rounded-xl text-xs font-bold text-white shadow-sm cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed uppercase tracking-wider border-transparent"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        Authorizing...
                      </>
                    ) : (
                      'Authorize Payment'
                    )}
                  </button>
                </div>
              )}

              {/* Overview Details Card */}
              <div className="bg-white rounded-3xl border border-[#FFE5D9] shadow-sm p-6 space-y-4">
                <h3 className="text-xs font-bold text-[#2E2522] uppercase tracking-wider">Order Summary</h3>

                <div className="space-y-3 font-sans">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#7D726D]">Fulfillment Ref</span>
                    <span className="font-mono text-[#2E2522] font-bold">#{order.id}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#7D726D]">Pipeline State</span>
                    <span>{getStatusBadge(order.status)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#7D726D]">Operator Key</span>
                    <span className="font-mono text-[#2E2522]">USR_{String(order.user_id).padStart(4, '0')}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#7D726D]">Date Created</span>
                    <span className="text-[#2E2522]">
                      {new Date(order.created_at).toLocaleString()}
                    </span>
                  </div>

                  <hr className="border-[#FFE5D9]/60" />

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">Total Amount</span>
                    <span className={`text-xl font-bold ${
                      mode === 'operator' ? 'text-[#B8B8FF]' : 'text-[#FFB7B2]'
                    }`}>
                      ₹{parseFloat(order.total_amount).toFixed(2)}
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
