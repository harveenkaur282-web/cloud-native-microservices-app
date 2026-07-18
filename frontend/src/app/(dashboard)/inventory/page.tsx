'use client';

import { useState, useEffect, useCallback } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { api } from '@/services/api';
import { Product, Inventory } from '@/types';
import { AlertCircle, RefreshCw, Layers, ShieldAlert, CheckCircle, Clock, Loader2, Server, Plus, X } from 'lucide-react';
import Mascot from '@/components/mascot/Mascot';

interface CombinedInventoryItem {
  productId: number;
  productName: string;
  category: string;
  availableQuantity: number | null;
  reservedQuantity: number | null;
  updatedAt: string | null;
  loading: boolean;
  error: boolean;
  unregistered: boolean;
}

export default function InventoryPage() {
  const [items, setItems] = useState<CombinedInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mapping Modal States
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProductName, setSelectedProductName] = useState('');
  const [initialStock, setInitialStock] = useState('50');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const fetchInventoryData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const productsRes = await api.get<Product[]>('/products/', {
        params: { page: 1, limit: 50 },
      });
      const products = productsRes.data;

      const initialItems: CombinedInventoryItem[] = products.map((p) => ({
        productId: p.id,
        productName: p.name,
        category: p.category,
        availableQuantity: null,
        reservedQuantity: null,
        updatedAt: null,
        loading: true,
        error: false,
        unregistered: false,
      }));
      setItems(initialItems);
      setLoading(false);

      await Promise.all(
        products.map(async (p) => {
          try {
            const inventoryRes = await api.get<Inventory>(`/inventory/${p.id}`);
            setItems((prev) =>
              prev.map((item) =>
                item.productId === p.id
                  ? {
                      ...item,
                      availableQuantity: inventoryRes.data.available_quantity,
                      reservedQuantity: inventoryRes.data.reserved_quantity,
                      updatedAt: inventoryRes.data.updated_at,
                      loading: false,
                      error: false,
                      unregistered: false,
                    }
                  : item
              )
            );
          } catch (err: any) {
            if (err.response?.status === 404) {
              setItems((prev) =>
                prev.map((item) =>
                  item.productId === p.id
                    ? {
                        ...item,
                        availableQuantity: 0,
                        reservedQuantity: 0,
                        updatedAt: null,
                        loading: false,
                        error: false,
                        unregistered: true,
                      }
                    : item
                )
              );
            } else {
              console.error(`Failed to fetch inventory for product ${p.id}`, err);
              setItems((prev) =>
                prev.map((item) =>
                  item.productId === p.id
                    ? { ...item, loading: false, error: true }
                    : item
                )
              );
            }
          }
        })
      );
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch catalog definitions. Please ensure the services are running.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  const handleOpenMapModal = (productId: number, productName: string) => {
    setSelectedProductId(productId);
    setSelectedProductName(productName);
    setInitialStock('50');
    setMapError(null);
    setMapModalOpen(true);
  };

  const handleMapInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProductId === null) return;
    setIsSubmitting(true);
    setMapError(null);
    try {
      const stockNum = parseInt(initialStock, 10);
      if (isNaN(stockNum) || stockNum < 0) {
        throw new Error('Stock quantity must be a non-negative integer.');
      }

      await api.post('/inventory/', {
        product_id: selectedProductId,
        available_quantity: stockNum,
      });

      setMapModalOpen(false);
      fetchInventoryData();
    } catch (err: any) {
      console.error(err);
      setMapError(err.message || 'Failed to map inventory database record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStockStatus = (available: number | null, isError: boolean, isUnregistered: boolean) => {
    if (isError) {
      return (
        <span className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-500 border border-rose-100">
          <AlertCircle className="h-3 w-3" /> Error
        </span>
      );
    }
    if (isUnregistered) {
      return (
        <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-600 border border-amber-200/50">
          <AlertCircle className="h-3 w-3" /> Unmapped
        </span>
      );
    }
    if (available === null) {
      return (
        <span className="inline-flex items-center gap-1 rounded-xl bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-400 border border-slate-200 animate-pulse">
          Syncing...
        </span>
      );
    }
    if (available <= 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-500 border border-rose-100">
          <ShieldAlert className="h-3 w-3" /> Out of stock
        </span>
      );
    }
    if (available <= 5) {
      return (
        <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-600 border border-amber-200/50">
          <ShieldAlert className="h-3 w-3" /> Low stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-xl bg-[#E2FCEF] px-2 py-0.5 text-[9px] font-bold text-[#4ADE80] border border-[#A7F3D0]/30">
        <CheckCircle className="h-3 w-3" /> Stable
      </span>
    );
  };

  return (
    <PageContainer
      title="Warehouse Inventory"
      description="Monitor physical stock allocations managed by the Inventory Service."
    >
      <div className="space-y-6 font-sans text-left">
        {/* Info summaries */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-3xl border border-[#FFE5D9] shadow-sm flex items-start gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FFB7B2]" />
            <div className="bg-[#FFB7B2]/10 p-2.5 rounded-xl text-[#FFB7B2] border border-[#FFB7B2]/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#2E2522] uppercase tracking-wider">Total Registry</h4>
              <p className="text-[10px] text-[#7D726D] mt-1 leading-relaxed font-sans">
                Unique items registered across Product Services and mapped to warehouse records.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#FFE5D9] shadow-sm flex items-start gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#C8E6C9]" />
            <div className="bg-[#C8E6C9]/10 p-2.5 rounded-xl text-[#C8E6C9] border border-[#C8E6C9]/20">
              <CheckCircle className="h-5 w-5 text-[#4ADE80]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#2E2522] uppercase tracking-wider">Available Stock</h4>
              <p className="text-[10px] text-[#7D726D] mt-1 leading-relaxed font-sans">
                Units on warehouse shelves unassigned and ready for incoming checkouts.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#FFE5D9] shadow-sm flex items-start gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#E8E8FF]" />
            <div className="bg-[#E8E8FF]/10 p-2.5 rounded-xl text-[#B8B8FF] border border-[#E8E8FF]/20">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#2E2522] uppercase tracking-wider">Reserved items</h4>
              <p className="text-[10px] text-[#7D726D] mt-1 leading-relaxed font-sans">
                Items locked for active, unpaid checkout sessions to guarantee fulfillment.
              </p>
            </div>
          </div>
        </div>

        {/* Database Table Card */}
        <div className="bg-white rounded-3xl border border-[#FFE5D9] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#FFE5D9] p-4 bg-[#FFFBF4]/20">
            <h3 className="text-xs font-bold text-[#2E2522] uppercase tracking-wider flex items-center gap-2">
              <Server className="h-4 w-4 text-[#FFB7B2]" />
              Warehouse Mappings
            </h3>
            <button
              onClick={fetchInventoryData}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#FFE5D9] bg-white px-3 py-2 text-xs font-bold text-[#7D726D] hover:bg-[#FFE5D9]/20 transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw className="h-3 w-3" />
              Reload Telemetry
            </button>
          </div>

          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-[#FFB7B2]" />
              <p className="text-xs text-slate-500 font-semibold">// Fetching warehouse ratios...</p>
            </div>
          ) : error ? (
            <div className="p-16 text-center flex flex-col items-center justify-center bg-white border-t border-[#FFE5D9]">
              <AlertCircle className="h-8 w-8 text-rose-400 mb-3" />
              <h4 className="text-xs font-bold text-[#2E2522] uppercase">Fulfillment Stream Offline</h4>
              <p className="text-xs text-slate-500 mt-1.5 max-w-sm">{error}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center bg-white border-t border-[#FFE5D9]">
              <Mascot state="sleeping" size={80} className="mb-4" />
              <h4 className="text-xs font-bold text-[#2E2522] uppercase">No stock cataloged</h4>
              <p className="text-xs text-[#7D726D] mt-1">
                Register products in the catalog database to view inventory mappings.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs text-slate-500">
                <thead className="bg-[#FFFBF4]/10 text-[10px] font-bold uppercase tracking-wider text-[#7D726D] border-b border-[#FFE5D9]">
                  <tr>
                    <th scope="col" className="px-6 py-4">Database Key</th>
                    <th scope="col" className="px-6 py-4">Product Name</th>
                    <th scope="col" className="px-6 py-4">Registry State</th>
                    <th scope="col" className="px-6 py-4 text-right">Shelf Available</th>
                    <th scope="col" className="px-6 py-4 text-right">Locked Reserved</th>
                    <th scope="col" className="px-6 py-4 text-center">Ratio Allocation (Available vs Reserved)</th>
                    <th scope="col" className="px-6 py-4 text-right">Last Sync</th>
                    <th scope="col" className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FFE5D9]/50 border-t border-[#FFE5D9]">
                  {items.map((item) => {
                    const total = (item.availableQuantity || 0) + (item.reservedQuantity || 0);
                    const avPercent = total > 0 ? ((item.availableQuantity || 0) / total) * 100 : 0;
                    const resPercent = total > 0 ? ((item.reservedQuantity || 0) / total) * 100 : 0;

                    return (
                      <tr key={item.productId} className="hover:bg-[#FFFBF4]/10 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-400">
                          {String(item.productId).padStart(5, '0')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#2E2522]">{item.productName}</div>
                          <div className="text-[9px] text-[#FFB7B2] font-bold uppercase">{item.category}</div>
                        </td>
                        <td className="px-6 py-4">
                          {getStockStatus(item.availableQuantity, item.error, item.unregistered)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-[#2E2522]">
                          {item.loading ? (
                            <span className="inline-block animate-pulse h-3 w-6 bg-slate-100 rounded"></span>
                          ) : item.error || item.unregistered ? (
                            <span className="text-slate-300">—</span>
                          ) : (
                            item.availableQuantity
                          )}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-400">
                          {item.loading ? (
                            <span className="inline-block animate-pulse h-3 w-6 bg-slate-100 rounded"></span>
                          ) : item.error || item.unregistered ? (
                            <span className="text-slate-300">—</span>
                          ) : (
                            item.reservedQuantity
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {item.loading || item.error || item.unregistered ? (
                            <div className="h-1.5 w-32 bg-slate-100 rounded mx-auto" />
                          ) : (
                            <div className="h-2 w-32 bg-[#FFFDF9] border border-[#FFE5D9] rounded-full overflow-hidden flex mx-auto">
                              <div 
                                style={{ width: `${avPercent}%` }} 
                                className="h-full bg-[#FFB7B2]" 
                                title={`Available: ${avPercent.toFixed(1)}%`}
                              />
                              <div 
                                style={{ width: `${resPercent}%` }} 
                                className="h-full bg-[#D8D8FF]" 
                                title={`Reserved: ${resPercent.toFixed(1)}%`}
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-[10px] text-slate-400">
                          {item.loading ? (
                            <span className="inline-block animate-pulse h-3 w-12 bg-slate-100 rounded"></span>
                          ) : item.error || !item.updatedAt ? (
                            <span className="text-slate-300">—</span>
                          ) : (
                            new Date(item.updatedAt).toLocaleTimeString()
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.unregistered && (
                            <button
                              onClick={() => handleOpenMapModal(item.productId, item.productName)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#B8B8FF]/10 hover:bg-[#B8B8FF]/20 border border-[#B8B8FF]/20 text-[#B8B8FF] rounded-xl text-[10px] font-bold uppercase transition-all cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                              Map Stock
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MAP STOCK MODAL DIALOG */}
      {mapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center font-sans">
          <div className="fixed inset-0 bg-[#2D2D39]/30 backdrop-blur-sm" onClick={() => setMapModalOpen(false)} />
          <div className="bg-white border border-[#FFE5D9] rounded-3xl p-6 shadow-2xl relative w-full max-w-sm z-10 mx-4 animate-scaleUp text-left">
            <button 
              onClick={() => setMapModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <form onSubmit={handleMapInventorySubmit} className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#2E2522] uppercase tracking-wider flex items-center gap-2">
                  <Server className="h-4 w-4 text-[#B8B8FF]" />
                  Initialize stock record
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Map product entry to active warehouse inventory.</p>
              </div>

              {mapError && (
                <div className="p-2.5 rounded bg-rose-50 border border-rose-100 text-[10px] text-rose-800 font-bold">
                  {mapError}
                </div>
              )}

              <div className="space-y-3.5 text-xs text-[#2E2522]">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-[#7D726D] mb-1">Target Product</label>
                  <input 
                    disabled
                    type="text" 
                    value={selectedProductName}
                    className="w-full rounded-xl border border-[#FFE5D9] bg-slate-50 p-2.5 text-slate-400 cursor-not-allowed font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase text-[#7D726D] mb-1">Initial Shelf Available *</label>
                  <input 
                    required
                    type="number" 
                    placeholder="50"
                    value={initialStock}
                    onChange={(e) => setInitialStock(e.target.value)}
                    className="w-full rounded-xl border border-[#FFE5D9] p-2.5 placeholder-slate-300 focus:outline-none focus:border-[#B8B8FF]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setMapModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#FFE5D9] font-bold text-slate-400 hover:bg-[#FFE5D9]/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#B8B8FF] hover:bg-[#a3a3f5] rounded-xl text-white font-bold cursor-pointer disabled:opacity-40 uppercase tracking-wider"
                >
                  {isSubmitting ? 'Mapping...' : 'Create Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
