'use client';

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/PageContainer';
import { api } from '@/services/api';
import { Product } from '@/types';
import { ArrowLeft, Package, Calendar, Database, Sparkles, Tag, AlertCircle } from 'lucide-react';

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
          <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
            Active
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
            Draft
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-500/10">
            Archived
          </span>
        );
      case 'OUT_OF_STOCK':
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/10">
            Out of Stock
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

  return (
    <PageContainer
      title="Product Details"
      description="View full configuration profile and technical specifications of this catalog item."
    >
      <div className="space-y-6">
        {/* Back navigation */}
        <div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to catalog</span>
          </Link>
        </div>

        {loading ? (
          <div className="animate-pulse bg-white border border-slate-200 rounded-lg p-6 md:p-8 shadow-sm space-y-6">
            <div className="h-6 bg-slate-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-64 bg-slate-100 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-16 bg-slate-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 border border-red-200 bg-red-50/50 rounded-lg text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
            <h3 className="text-md font-semibold text-slate-900 mb-1">Error Loading Product</h3>
            <p className="text-sm text-slate-600 max-w-md mb-4">{error}</p>
            <button
              onClick={fetchProductDetails}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : product ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Detail Panel */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-5 border-b border-slate-100">
                  {/* Image container */}
                  <div className="md:col-span-2 bg-slate-50 flex items-center justify-center p-6 border-r border-slate-100 relative min-h-[250px]">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="object-contain max-h-[200px] w-full rounded"
                      />
                    ) : (
                      <Package className="h-20 w-20 text-slate-300" />
                    )}
                  </div>

                  {/* Text details */}
                  <div className="md:col-span-3 p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          <Tag className="h-3 w-3" />
                          {product.category}
                        </span>
                        {getStatusBadge(product.status)}
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900">{product.name}</h2>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {product.description || 'No description available for this product.'}
                      </p>
                    </div>

                    <div className="flex items-baseline gap-4 pt-4 border-t border-slate-100">
                      <span className="text-3xl font-extrabold text-slate-900">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-400">USD (Plus applicable tax)</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Database className="h-5 w-5 text-slate-400" />
                    <div>
                      <span className="block text-xs text-slate-400">Database Record Key</span>
                      <span className="text-xs font-mono font-medium">INT_ID: {product.id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-700">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <div>
                      <span className="block text-xs text-slate-400">First Published</span>
                      <span className="text-xs font-medium">
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
            </div>

            {/* Right Meta Explorer Panel */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  Product Metadata
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  JSON attributes stored with this catalog item representing key-value parameters.
                </p>

                <div className="rounded-lg bg-slate-900 p-4 font-mono text-xs text-slate-200 overflow-x-auto max-h-[300px]">
                  {product.product_metadata && Object.keys(product.product_metadata).length > 0 ? (
                    <pre>{JSON.stringify(product.product_metadata, null, 2)}</pre>
                  ) : (
                    <span className="text-slate-500 italic">No custom metadata parameters set.</span>
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
