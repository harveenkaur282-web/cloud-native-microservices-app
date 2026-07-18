'use client';

import { useState } from 'react';
import { Menu, X, Heart, ShoppingCart, Trash2, ShieldCheck, CreditCard, Landmark, Check, Loader2 } from 'lucide-react';
import Sidebar from './Sidebar';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useSandbox } from '@/hooks/use-sandbox';
import { api } from '@/services/api';
import Mascot from '@/components/mascot/Mascot';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment' | 'success'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | null>(null);
  
  // Checkout API status
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pathname = usePathname();
  const { user } = useAuth();
  const { mode, cart, removeFromCart, clearCart } = useSandbox();

  // Determine current page title based on path
  const getPageTitle = () => {
    const segment = pathname.split('/')[1];
    if (!segment) return 'OVERVIEW';
    return segment.toUpperCase();
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0);
  };

  // Perform backend order creation
  const handleProceedToCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const orderItems = cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      }));

      // Create order in backend (registers as PENDING and locks inventory)
      const res = await api.post('/orders/', {
        user_id: user?.id || 1, // Fallback if user ID is missing
        items: orderItems
      });

      setCreatedOrder(res.data);
      setCheckoutStep('payment');
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Failed to submit order. Check microservices connection.';
      setErrorMsg(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Process mock payment against backend pay API
  const handleProcessPayment = async () => {
    if (!createdOrder || !paymentMethod) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      // Call mock payment endpoint we just added in the backend Order Service
      await api.post(`/orders/${createdOrder.id}/pay`, {
        payment_method: paymentMethod
      });

      setCheckoutStep('success');
      clearCart();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Payment verification failed downstream.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseCart = () => {
    setCartOpen(false);
    // Reset steps after drawer closes
    setTimeout(() => {
      setCheckoutStep('cart');
      setPaymentMethod(null);
      setCreatedOrder(null);
      setErrorMsg(null);
    }, 300);
  };

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-[#FFE5D9] bg-[#FFFDF9] px-4 md:px-6 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="text-[#7D726D] hover:text-[#2E2522] md:hidden p-1.5 rounded-xl hover:bg-[#FFE5D9]/20 border border-transparent cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>

          <h2 className="text-sm font-extrabold font-sans tracking-widest text-[#2E2522] flex items-center gap-2">
            <span className={mode === 'operator' ? "text-[#B8B8FF] font-normal" : "text-[#FFB7B2] font-normal"}>//</span>
            {getPageTitle()}
          </h2>
        </div>

        <div className="flex items-center gap-4 font-sans">
          {/* Mode indicators */}
          {mode === 'operator' ? (
            <div className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 bg-[#B8B8FF]/10 text-[#B8B8FF] rounded-xl border border-[#B8B8FF]/20">
              <ShieldCheck className="h-3 w-3" />
              <span>SANDBOX_ADMIN</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 bg-[#FFB7B2]/10 text-[#FFB7B2] rounded-xl border border-[#FFB7B2]/20">
              <Heart className="h-3 w-3 fill-current text-[#FFB7B2]" />
              <span>SHOPPING_CLIENT</span>
            </div>
          )}

          {/* Cart Icon trigger for customers */}
          {mode === 'customer' && (
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-[#7D726D] hover:text-[#2E2522] rounded-xl hover:bg-[#FFE5D9]/20 border border-transparent transition-colors cursor-pointer"
            >
              <ShoppingCart className="h-4.5 w-4.5" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-[#FFB7B2] text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce shadow">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          )}

          <div className="h-5 w-px bg-[#FFE5D9]" />

          <span className="text-xs font-extrabold text-[#2E2522] hidden sm:inline-block">
            {user?.username ? `@${user.username}` : 'guest_session'}
          </span>
        </div>
      </header>

      {/* Cart Drawer Sliding Overlay */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end font-sans">
          <div 
            className="fixed inset-0 bg-[#2D2D39]/30 backdrop-blur-sm transition-opacity" 
            onClick={handleCloseCart}
          />
          
          <div className="relative w-full max-w-sm bg-[#FFFDF9] border-l border-[#FFE5D9] shadow-2xl flex flex-col justify-between h-full z-10 animate-slideLeft text-left">
            {/* Drawer Header */}
            <div className="flex h-16 items-center justify-between px-6 border-b border-[#FFE5D9]">
              <h3 className="text-xs font-bold text-[#2E2522] uppercase tracking-wider flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-[#FFB7B2]" />
                Shopping Cart
              </h3>
              <button 
                onClick={handleCloseCart}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Error Message banner */}
            {errorMsg && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-[11px] text-rose-800 flex items-start gap-2">
                <span className="font-bold">Error:</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {checkoutStep === 'cart' && (
                cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                    <Mascot state="sleeping" size={80} />
                    <div>
                      <h4 className="text-xs font-bold text-[#2E2522] uppercase tracking-wider">Your cart is empty</h4>
                      <p className="text-[10px] text-[#7D726D] mt-1.5 max-w-[200px] leading-relaxed">
                        Add cute items from the Shop Catalog to initiate stock checkouts.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between gap-4 p-3 bg-white border border-[#FFE5D9] rounded-2xl shadow-sm">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#2E2522] truncate">{item.product.name}</p>
                          <p className="text-[10px] text-[#FFB7B2] font-semibold mt-0.5">₹{parseFloat(item.product.price).toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-bold text-slate-400">Qty: {item.quantity}</span>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50/50 cursor-pointer transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {checkoutStep === 'payment' && createdOrder && (
                <div className="space-y-6">
                  <div className="text-center bg-[#FFFBF4] border border-[#FFE5D9] p-4 rounded-2xl">
                    <span className="text-[9px] font-bold text-[#7D726D] uppercase tracking-wider">Order Reference ID</span>
                    <h4 className="text-sm font-mono font-extrabold text-[#2E2522] mt-0.5">#{String(createdOrder.id).padStart(5, '0')}</h4>
                    <div className="h-px bg-[#FFE5D9] my-2" />
                    <div className="flex items-center justify-between text-xs font-bold text-[#2E2522] px-2">
                      <span>Total Amount:</span>
                      <span>₹{parseFloat(createdOrder.total_amount).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="block text-[10px] font-bold text-[#7D726D] uppercase tracking-wider">Choose Payment Method</span>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setPaymentMethod('UPI')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all cursor-pointer ${
                          paymentMethod === 'UPI'
                            ? 'border-[#FFB7B2] bg-[#FFB7B2]/10 text-[#FFB7B2] font-bold'
                            : 'border-[#FFE5D9] bg-white text-slate-500 hover:bg-[#FFE5D9]/10'
                        }`}
                      >
                        <Landmark className="h-5 w-5" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">UPI Option</span>
                      </button>

                      <button
                        onClick={() => setPaymentMethod('CARD')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all cursor-pointer ${
                          paymentMethod === 'CARD'
                            ? 'border-[#FFB7B2] bg-[#FFB7B2]/10 text-[#FFB7B2] font-bold'
                            : 'border-[#FFE5D9] bg-white text-slate-500 hover:bg-[#FFE5D9]/10'
                        }`}
                      >
                        <CreditCard className="h-5 w-5" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Card Option</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {checkoutStep === 'success' && (
                <div className="h-full flex flex-col items-center justify-center text-center gap-5">
                  <Mascot state="success" size={90} />
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-[#2E2522] uppercase tracking-wider flex items-center justify-center gap-1.5">
                      <Check className="h-4.5 w-4.5 text-emerald-500 bg-emerald-50 border border-emerald-100 rounded-full p-0.5" />
                      Payment Complete!
                    </h4>
                    <p className="text-[10px] text-[#7D726D] max-w-[200px] leading-relaxed mx-auto">
                      Order successfully updated to <strong>PAID</strong> in the database. Open the Control Center to trace shipping logs!
                    </p>
                  </div>
                  <button
                    onClick={handleCloseCart}
                    className="w-full mt-4 py-3 bg-[#FFB7B2] hover:bg-[#f3a49e] rounded-xl text-xs font-bold text-white shadow-sm uppercase tracking-wider cursor-pointer active:scale-95 transition-transform"
                  >
                    Return to Catalog
                  </button>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            {checkoutStep !== 'success' && cart.length > 0 && (
              <div className="p-6 border-t border-[#FFE5D9] bg-[#FFFBF4] space-y-4">
                {checkoutStep === 'cart' ? (
                  <>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-bold text-[#7D726D] uppercase">Est. Total:</span>
                      <span className="text-base font-extrabold text-[#2E2522]">₹{getCartTotal().toFixed(2)}</span>
                    </div>
                    <button
                      onClick={handleProceedToCheckout}
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#FFB7B2] hover:bg-[#f3a49e] rounded-2xl text-xs font-bold text-white shadow-md active:scale-95 transition-transform cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed uppercase tracking-wider"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating Order...
                        </>
                      ) : (
                        'Proceed to Checkout'
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleProcessPayment}
                    disabled={isSubmitting || !paymentMethod}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#FFB7B2] hover:bg-[#f3a49e] rounded-2xl text-xs font-bold text-white shadow-md active:scale-95 transition-transform cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed uppercase tracking-wider"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying Payment...
                      </>
                    ) : (
                      'Authorize Payment'
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-[#2D2D39]/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar drawer */}
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-[#FFFDF9]">
            <div className="absolute top-0 right-0 -mr-12 pt-4">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white cursor-pointer"
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
