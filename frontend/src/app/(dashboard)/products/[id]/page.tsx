'use client';

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/PageContainer';
import { api } from '@/services/api';
import { Product } from '@/types';
import { ArrowLeft, Database, Calendar, Tag, AlertCircle, Info, RefreshCw, ShoppingCart } from 'lucide-react';
import Mascot from '@/components/mascot/Mascot';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const productId = parseInt(resolvedParams.id, 10);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isNaN(productId)) {
        setError('Invalid product ID format.');
        return;
      }
      const response = await api.get<Product>(`/products/${productId}`);
      setProduct(response.data);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 404) {
        setError('Product not found in the catalog.');
      } else {
        setError('Failed to load product details. Please ensure the Product Service is running.');
      }
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center rounded-xl bg-[#E2FCEF] px-3 py-1 text-[10px] font-extrabold text-[#4ADE80] border border-[#A7F3D0]/30 uppercase">
            Active
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center rounded-xl bg-amber-50 px-3 py-1 text-[10px] font-extrabold text-amber-600 border border-amber-200/50 uppercase">
            Draft
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-xl bg-slate-50 px-3 py-1 text-[10px] font-extrabold text-slate-500 border border-slate-200/30 uppercase">
            {status}
          </span>
        );
    }
  };

  return (
    <PageContainer
      title="Product Details"
      description="View full configuration specifications of this catalog item."
    >
      <div className="space-y-6 font-sans text-left">
        {/* Back navigation */}
        <div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="h-4 w-4 text-[#FFB7B2]" />
            <span>Back to catalog</span>
          </Link>
        </div>

        {loading ? (
          <div className="animate-pulse bg-white border border-[#FFE5D9] rounded-3xl p-6 md:p-8 space-y-6">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-64 bg-slate-100 rounded-3xl"></div>
              <div className="h-64 bg-slate-100 rounded-3xl"></div>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 border border-rose-100 bg-rose-50/50 rounded-3xl text-center">
            <AlertCircle className="h-8 w-8 text-rose-500 mb-3" />
            <h3 className="text-xs font-bold text-slate-700 uppercase">Failed to load product details</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">{error}</p>
            <button
              onClick={fetchProductDetails}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#FFB7B2] border-transparent px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#f3a49e] transition-all cursor-pointer uppercase tracking-wider"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry Fetch
            </button>
          </div>
        ) : product ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Detail Panel */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-[#FFE5D9] shadow-sm overflow-hidden">
                {/* Header detail */}
                <div className="p-6 border-b border-[#FFE5D9]/60 flex items-center justify-between bg-[#FFFBF4]/20">
                  <span className="text-[10px] font-bold text-[#7D726D] uppercase flex items-center gap-1.5">
                    <Database className="h-4 w-4 text-[#FFB7B2]" />
                    Catalog Product Registry
                  </span>
                  {getStatusBadge(product.status)}
                </div>

                <div className="p-6 space-y-6">
                  {/* Title and Category */}
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#E8E8FF]/40 border border-[#D8D8FF]/30 px-3 py-1 text-[10px] font-bold text-[#FFB7B2] uppercase">
                      <Tag className="h-3.5 w-3.5" />
                      {product.category}
                    </span>
                    <h2 className="text-xl font-bold text-[#2E2522]">{product.name}</h2>
                    <p className="text-xs text-[#7D726D] leading-relaxed font-sans">
                      {product.description || 'No description details available for this product.'}
                    </p>
                  </div>

                  {/* Value */}
                  <div className="flex items-baseline gap-4 pt-4 border-t border-[#FFE5D9]/40">
                    <span className="text-3xl font-extrabold text-[#2E2522] tracking-tight">
                      ₹{parseFloat(product.price).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Base catalog price (INR)</span>
                  </div>
                </div>

                {/* Sub Metadata box */}
                <div className="p-6 bg-[#FFFBF4]/40 border-t border-[#FFE5D9]/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Database className="h-4 w-4 text-[#FFB7B2]" />
                    <div className="text-left font-sans">
                      <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Catalog Reference Key</span>
                      <span className="text-xs font-mono font-bold text-[#2E2522]">INT_ID: {product.id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-[#FFB7B2]" />
                    <div className="text-left font-sans">
                      <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Record Published</span>
                      <span className="text-xs text-[#2E2522] font-semibold">
                        {new Date(product.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informative alert box */}
              <div className="bg-white rounded-3xl border border-[#FFE5D9] p-5 flex items-start gap-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FFB7B2]" />
                <div className="bg-[#FFB7B2]/10 p-2.5 rounded-xl text-[#FFB7B2] border border-[#FFB7B2]/20">
                  <Info className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#2E2522] uppercase tracking-wider">Microservice Telemetry Mapped</h4>
                  <p className="text-[11px] text-[#7D726D] leading-relaxed font-sans">
                    Warehouse reserves and physical allocations are handled independently in the <strong>Inventory Service</strong>. Switch to the <Link href="/inventory" className="text-[#FFB7B2] hover:text-[#f3a49e] font-bold underline font-sans">Inventory Console</Link> to check stock levels.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Meta Explorer Panel */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-[#FFE5D9] shadow-sm p-6 space-y-4">
                <h3 className="text-xs font-bold text-[#2E2522] uppercase tracking-wider flex items-center gap-2">
                  <Mascot state="idle" size={40} />
                  Product Attributes
                </h3>
                <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                  Custom key-value parameters assigned to this item schema.
                </p>

                <div className="rounded-2xl bg-[#FFFBF4]/40 border border-[#FFE5D9] p-4 font-mono text-xs text-[#2E2522] overflow-x-auto max-h-[250px]">
                  {product.product_metadata && Object.keys(product.product_metadata).length > 0 ? (
                    <pre className="text-[10px] leading-relaxed text-[#7D726D]">
                      {JSON.stringify(product.product_metadata, null, 2)}
                    </pre>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic font-sans">No additional metadata registered.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}
