'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import { api } from '@/services/api';
import { Product } from '@/types';
import { Search, Filter, ArrowLeft, ArrowRight, Package, Loader2, AlertCircle } from 'lucide-react';

const CATEGORIES = ['All', 'Electronics', 'Apparel', 'Home', 'Books', 'Toys', 'Office'];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const limit = 8; // products per page

  // Input states for search to prevent querying on every keypress
  const [searchInput, setSearchInput] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page,
        limit,
      };
      
      if (search.trim()) {
        params.search = search.trim();
      }
      
      if (category !== 'All') {
        params.category = category;
      }

      const response = await api.get<Product[]>('/products/', { params });
      setProducts(response.data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch products. Please ensure the Product Service is running.');
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1); // Reset to first page
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
            Active
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-semibold text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
            Draft
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-500/10">
            Archived
          </span>
        );
      case 'OUT_OF_STOCK':
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/10">
            Out of Stock
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
      title="Product Catalog"
      description="View and browse inventory catalog configurations across microservices."
    >
      <div className="space-y-6">
        {/* Filters Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="block w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </form>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Filter className="h-4 w-4" />
              <span>Category:</span>
            </div>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="rounded-md border border-slate-300 bg-white py-1.5 px-3 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm"
              >
                <div className="bg-slate-100 h-48 w-full"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/4 mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 border border-red-200 bg-red-50/50 rounded-lg text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
            <h3 className="text-md font-semibold text-slate-900 mb-1">Error Loading Products</h3>
            <p className="text-sm text-slate-600 max-w-md mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 border border-dashed border-slate-300 bg-white rounded-lg text-center">
            <Package className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Products Found</h3>
            <p className="text-sm text-slate-500 max-w-sm mb-4">
              We couldn&apos;t find any products matching your search criteria.
            </p>
            {(search || category !== 'All') && (
              <button
                onClick={() => {
                  setSearch('');
                  setSearchInput('');
                  setCategory('All');
                  setPage(1);
                }}
                className="text-sm font-semibold text-blue-600 hover:text-blue-500"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col h-full"
                >
                  <div className="bg-slate-100 h-48 w-full relative flex items-center justify-center overflow-hidden border-b border-slate-100">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Package className="h-12 w-12 text-slate-300 group-hover:scale-110 transition-transform duration-300" />
                    )}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(product.status)}
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-grow justify-between space-y-4">
                    <div>
                      <span className="text-xs font-semibold tracking-wide uppercase text-blue-600">
                        {product.category}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                        {product.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <span className="text-lg font-extrabold text-slate-900">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                      <span className="text-xs font-medium text-slate-400">ID: {product.id}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow-sm">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  disabled={products.length < limit}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>

              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-700">
                    Showing page <span className="font-semibold">{page}</span> (page size: {limit})
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      className="relative inline-flex items-center rounded-l-md px-3 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 focus:outline-offset-0">
                      {page}
                    </span>
                    <button
                      disabled={products.length < limit}
                      onClick={() => setPage((prev) => prev + 1)}
                      className="relative inline-flex items-center rounded-r-md px-3 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
