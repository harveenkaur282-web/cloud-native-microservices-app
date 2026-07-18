'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import { api } from '@/services/api';
import { Product } from '@/types';
import { useSandbox } from '@/hooks/use-sandbox';
import { Search, Plus, X, Package, Loader2, AlertCircle, ShoppingBag, Eye, Trash2, CheckCircle2 } from 'lucide-react';
import Mascot from '@/components/mascot/Mascot';

// Category-specific SVG illustration fallbacks
function CategoryIllustration({ category, size = 48 }: { category: string; size?: number }) {
  const normCat = category.toLowerCase();
  if (normCat.includes('laptop') || normCat.includes('computer')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFB7B2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="2" y1="20" x2="22" y2="20" />
        <line x1="12" y1="17" x2="12" y2="20" />
      </svg>
    );
  }
  if (normCat.includes('audio') || normCat.includes('headphone') || normCat.includes('sound')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#B8B8FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
    );
  }
  if (normCat.includes('accessory') || normCat.includes('keyboard') || normCat.includes('mouse')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFD8B2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="10" rx="2" ry="2" />
        <path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
      </svg>
    );
  }
  if (normCat.includes('monitor') || normCat.includes('screen') || normCat.includes('tv')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#A7F3D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="12" rx="2" />
        <line x1="12" y1="15" x2="12" y2="21" />
        <line x1="8" y1="21" x2="16" y2="21" />
      </svg>
    );
  }
  if (normCat.includes('apparel') || normCat.includes('clothing') || normCat.includes('wear')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFB7B2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.37 4.65a2.44 2.44 0 0 0-2.83-.83l-2.07.82a2 2 0 0 1-1.47 0l-2.07-.82a2.44 2.44 0 0 0-2.83.83L4.1 9.4a2 2 0 0 0-.25 2.1l1.45 2.9A2 2 0 0 0 7.1 15.5h9.8a2 2 0 0 0 1.8-1.1l1.45-2.9a2 2 0 0 0-.25-2.1l-4.73-4.75z" />
        <path d="M12 2v20" />
      </svg>
    );
  }
  // Default cute parcel box
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFB7B2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <polygon points="12 22.08 12 12 3 6.92 3 17 12 22.08" />
      <polygon points="12 12 21 6.92 21 17 12 22.08" />
      <polygon points="12 2 21 6.92 12 12 3 6.92 12 2" />
      <line x1="12" y1="5.14" x2="12" y2="12" />
    </svg>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const limit = 8;
  const [searchInput, setSearchInput] = useState('');

  // Mode & Cart hook contexts
  const { mode, addToCart } = useSandbox();

  // Create Product Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  
  // Create Product Form States
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newInitialQuantity, setNewInitialQuantity] = useState('50');

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

      // Dynamically extract unique categories from list request
      const allRes = await api.get<Product[]>('/products/', { params: { page: 1, limit: 100 } });
      const uniqueCats = Array.from(new Set(allRes.data.map(p => p.category)));
      setAllCategories(['All', ...uniqueCats.filter(Boolean)]);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load products. Please check if the Product Service is running.');
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
    setPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1);
  };

  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError(null);
    try {
      const priceNum = parseFloat(newPrice);
      if (isNaN(priceNum) || priceNum <= 0) {
        throw new Error('Please enter a valid price greater than 0.');
      }

      await api.post('/products/', {
        name: newName,
        price: priceNum,
        category: newCategory || 'General',
        description: newDescription,
        image_url: newImageUrl,
        initial_quantity: parseInt(newInitialQuantity, 10) || 50,
        product_metadata: {}
      });

      setCreateSuccess(true);
      fetchProducts();
      setTimeout(() => {
        setCreateModalOpen(false);
        setCreateSuccess(false);
        // Reset form
        setNewName('');
        setNewPrice('');
        setNewCategory('');
        setNewDescription('');
        setNewImageUrl('');
        setNewInitialQuantity('50');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setCreateError(err.message || 'Failed to create product schema record.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <PageContainer
      title={mode === 'operator' ? "Catalog Manager" : "Shop Catalog"}
      description={
        mode === 'operator' 
          ? "Create, audit, and inspect Pydantic data schemas in the Product Service." 
          : "Add adorable products to your cart and test the microservice checkout pipeline."
      }
      action={
        mode === 'operator' && (
          <button 
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#B8B8FF] hover:bg-[#a3a3f5] rounded-2xl text-xs font-bold text-white shadow transition-all duration-150 active:scale-95 cursor-pointer uppercase tracking-wider border-transparent"
          >
            <Plus className="h-4 w-4" />
            Create Product
          </button>
        )
      }
    >
      <div className="space-y-6 font-sans text-left">
        {/* Filters Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-3xl border border-[#FFE5D9] shadow-sm">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="block w-full rounded-2xl border border-[#FFE5D9] bg-white py-2 pl-9 pr-3 text-xs placeholder-slate-400 text-[#2E2522] focus:border-[#FFB7B2] focus:outline-none focus:ring-2 focus:ring-[#FFB7B2]/20"
            />
          </form>

          {/* Dynamic Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {allCategories.map((cat) => {
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? mode === 'operator'
                        ? 'bg-[#B8B8FF] border-[#B8B8FF] text-white shadow-sm'
                        : 'bg-[#FFB7B2] border-[#FFB7B2] text-white shadow-sm'
                      : 'bg-white border-[#FFE5D9] text-[#7D726D] hover:bg-[#FFE5D9]/10 hover:text-[#2E2522]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid Catalog */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-[#FFB7B2]" />
            <p className="text-xs text-slate-500 font-semibold">// Reading catalog items...</p>
          </div>
        ) : error ? (
          <div className="p-16 text-center flex flex-col items-center justify-center bg-white border border-[#FFE5D9] rounded-3xl">
            <AlertCircle className="h-8 w-8 text-rose-400 mb-3" />
            <h4 className="text-xs font-bold text-[#2E2522] uppercase tracking-wider">Catalog Sync Refused</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center bg-white border border-[#FFE5D9] rounded-3xl">
            <Mascot state="sleeping" size={80} className="mb-4" />
            <h4 className="text-sm font-bold text-[#2E2522] uppercase tracking-wide">Catalog Empty</h4>
            <p className="text-xs text-[#7D726D] mt-1 max-w-sm">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-[#FFE5D9] overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full p-4 relative group"
              >
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[9px] font-extrabold uppercase text-[#FFB7B2] bg-[#FFB7B2]/10 px-2 py-0.5 rounded-lg border border-[#FFB7B2]/20">
                    {product.category}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">ID_{String(product.id).padStart(4, '0')}</span>
                </div>

                {/* Vector Image container */}
                <div className="bg-[#FFFBF4]/40 h-36 rounded-2xl flex items-center justify-center border border-[#FFE5D9]/40 mb-4 transition-transform group-hover:scale-[1.02] duration-300 relative overflow-hidden">
                  {product.image_url && product.image_url.startsWith('http') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        // Fallback on broken image link
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {(!product.image_url || !product.image_url.startsWith('http')) && (
                      <CategoryIllustration category={product.category} size={48} />
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 mb-4">
                  <h3 className="text-sm font-bold text-[#2E2522] line-clamp-1">{product.name}</h3>
                  <p className="text-[11px] text-[#7D726D] font-sans leading-relaxed line-clamp-2">
                    {product.description || 'No description provided.'}
                  </p>
                </div>

                {/* Operations */}
                <div className="flex items-center justify-between pt-3 border-t border-[#FFE5D9]/50 mt-auto">
                  <span className="text-base font-extrabold text-[#2E2522]">
                    ₹{parseFloat(product.price).toFixed(2)}
                  </span>
                  <div className="flex gap-1.5">
                    {mode === 'customer' ? (
                      <button
                        onClick={() => addToCart(product, 1)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFB7B2] hover:bg-[#f3a49e] rounded-xl text-[10px] font-bold text-white transition-all uppercase tracking-wider cursor-pointer border-transparent"
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <Link
                        href={`/products/${product.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#B8B8FF]/10 hover:bg-[#B8B8FF]/20 border border-[#B8B8FF]/20 rounded-xl text-[10px] font-bold text-[#B8B8FF] transition-all uppercase tracking-wider"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Inspect
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {products.length > 0 && (
          <div className="flex items-center justify-between border border-[#FFE5D9] bg-white px-6 py-4 rounded-3xl shadow-sm">
            <span className="text-[10px] text-[#7D726D] font-bold uppercase tracking-wider">
              Page cursor: <span className="text-[#2E2522]">{page}</span>
            </span>
            <div className="flex gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 rounded-xl border border-[#FFE5D9] text-[10px] font-bold text-[#7D726D] hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
              >
                PREV
              </button>
              <button
                disabled={products.length < limit}
                onClick={() => setPage((prev) => prev + 1)}
                className="px-3 py-1.5 rounded-xl border border-[#FFE5D9] text-[10px] font-bold text-[#7D726D] hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
              >
                NEXT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE PRODUCT SCHEMA DIALOG MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center font-sans">
          <div className="fixed inset-0 bg-[#2D2D39]/30 backdrop-blur-sm" onClick={() => setCreateModalOpen(false)} />
          <div className="bg-white border border-[#FFE5D9] rounded-3xl p-6 shadow-2xl relative w-full max-w-md z-10 mx-4 animate-scaleUp text-left">
            <button 
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {createSuccess ? (
              <div className="py-8 flex flex-col items-center justify-center text-center gap-4">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                <div>
                  <h4 className="text-sm font-bold text-[#2E2522] uppercase tracking-wider">Product Registered!</h4>
                  <p className="text-[10px] text-[#7D726D] mt-1.5">
                    Syncing product metadata & initializing database reserves...
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateProductSubmit} className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#2E2522] uppercase tracking-wider flex items-center gap-2">
                    <Plus className="h-4 w-4 text-[#B8B8FF]" />
                    Register New Product
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Publish a new data entry into the catalog service.</p>
                </div>

                {createError && (
                  <div className="p-2.5 rounded bg-rose-50 border border-rose-100 text-[10px] text-rose-800 font-bold">
                    {createError}
                  </div>
                )}

                <div className="space-y-3.5 text-xs text-[#2E2522]">
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-[#7D726D] mb-1">Product Name *</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Mechanical Keyboard"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full rounded-xl border border-[#FFE5D9] p-2.5 placeholder-slate-300 focus:outline-none focus:border-[#B8B8FF]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-[#7D726D] mb-1">Price (USD) *</label>
                      <input 
                        required
                        type="number" 
                        step="0.01"
                        placeholder="29.99"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="w-full rounded-xl border border-[#FFE5D9] p-2.5 placeholder-slate-300 focus:outline-none focus:border-[#B8B8FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-[#7D726D] mb-1">Category *</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Audio, Accessories"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full rounded-xl border border-[#FFE5D9] p-2.5 placeholder-slate-300 focus:outline-none focus:border-[#B8B8FF]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-[#7D726D] mb-1">Initial Stock *</label>
                      <input 
                        required
                        type="number" 
                        placeholder="50"
                        value={newInitialQuantity}
                        onChange={(e) => setNewInitialQuantity(e.target.value)}
                        className="w-full rounded-xl border border-[#FFE5D9] p-2.5 placeholder-slate-300 focus:outline-none focus:border-[#B8B8FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-[#7D726D] mb-1">External Image URL</label>
                      <input 
                        type="text" 
                        placeholder="https://images.unsplash..."
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="w-full rounded-xl border border-[#FFE5D9] p-2.5 placeholder-slate-300 focus:outline-none focus:border-[#B8B8FF]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase text-[#7D726D] mb-1">Product Description</label>
                    <textarea 
                      rows={2}
                      placeholder="Explain features and specifications..."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full rounded-xl border border-[#FFE5D9] p-2.5 placeholder-slate-300 focus:outline-none focus:border-[#B8B8FF]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#FFE5D9] font-bold text-slate-400 hover:bg-[#FFE5D9]/10 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-5 py-2.5 bg-[#B8B8FF] hover:bg-[#a3a3f5] rounded-xl text-white font-bold cursor-pointer disabled:opacity-40 uppercase tracking-wider"
                  >
                    {isCreating ? 'Creating...' : 'Register Item'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
