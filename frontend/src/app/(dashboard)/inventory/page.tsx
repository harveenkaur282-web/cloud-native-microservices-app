'use client';

import { useState, useEffect, useCallback } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { api } from '@/services/api';
import { Product, Inventory } from '@/types';
import { AlertCircle, RefreshCw, Layers, ShieldAlert, CheckCircle, Clock, Loader2 } from 'lucide-react';

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

  const fetchInventoryData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch products from Product Service (limit 50 to get a good batch)
      const productsRes = await api.get<Product[]>('/products/', {
        params: { page: 1, limit: 50 },
      });
      const products = productsRes.data;

      // Initialize items state with loading flags
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

      // 2. Fetch inventory for each product concurrently
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
              // 404 is a valid state showing product has no inventory row registered yet
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
                    ? {
                        ...item,
                        loading: false,
                        error: true,
                        unregistered: false,
                      }
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

  const getStockStatus = (available: number | null, isError: boolean, isUnregistered: boolean) => {
    if (isError) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
          <AlertCircle className="h-3 w-3" /> Error
        </span>
      );
    }
    if (isUnregistered) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
          <AlertCircle className="h-3 w-3" /> Unregistered
        </span>
      );
    }
    if (available === null) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
          Syncing...
        </span>
      );
    }
    if (available <= 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 ring-1 ring-inset ring-red-600/20">
          <ShieldAlert className="h-3 w-3" /> Out of Stock
        </span>
      );
    }
    if (available <= 5) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-600/20">
          <ShieldAlert className="h-3 w-3" /> Low Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
        <CheckCircle className="h-3 w-3" /> In Stock
      </span>
    );
  };

  return (
    <PageContainer
      title="Warehouse Inventory"
      description="Monitor and allocate stock records owned and synchronized by the Inventory Service."
    >
      <div className="space-y-6">
        {/* Visual explanation cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Total Catalog Mapping</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Represents unique items registered across Product Services and mapped to warehouse records.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="bg-emerald-50 p-2.5 rounded-lg text-emerald-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Available Stock</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Stock currently on shelves ready to be purchased and allocated to incoming user checkouts.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="bg-purple-50 p-2.5 rounded-lg text-purple-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Reserved Stock</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Stock temporarily locked and assigned to active customer orders awaiting transaction capture.
              </p>
            </div>
          </div>
        </div>

        {/* Inventory Table Card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900">Stock Levels</h3>
            <button
              onClick={fetchInventoryData}
              className="inline-flex items-center gap-1.5 rounded bg-white border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Reload Table
            </button>
          </div>

          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-slate-500 font-medium">Fetching catalog and stock data...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center flex flex-col items-center justify-center border-t border-slate-100">
              <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
              <h4 className="text-sm font-bold text-slate-900">Service Synced Failed</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md">{error}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <Layers className="h-8 w-8 text-slate-400 mb-2" />
              <h4 className="text-sm font-bold text-slate-900">No Inventory Found</h4>
              <p className="text-xs text-slate-500 mt-1">
                Register products in the catalog to populate warehouse allocations.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-500">
                <thead className="bg-slate-50/50 text-xs font-semibold uppercase text-slate-400 border-b border-slate-100">
                  <tr>
                    <th scope="col" className="px-6 py-4">Product ID</th>
                    <th scope="col" className="px-6 py-4">Product Details</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4 text-right">Available Stock</th>
                    <th scope="col" className="px-6 py-4 text-right">Reserved Stock</th>
                    <th scope="col" className="px-6 py-4 text-right">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 border-t border-slate-100">
                  {items.map((item) => (
                    <tr key={item.productId} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">
                        {item.productId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{item.productName}</div>
                        <div className="text-xs text-slate-400 capitalize">{item.category}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getStockStatus(item.availableQuantity, item.error, item.unregistered)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">
                        {item.loading ? (
                          <span className="inline-block animate-pulse h-4 w-6 bg-slate-200 rounded"></span>
                        ) : item.error ? (
                          <span className="text-red-500">-</span>
                        ) : (
                          item.availableQuantity
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-600">
                        {item.loading ? (
                          <span className="inline-block animate-pulse h-4 w-6 bg-slate-200 rounded"></span>
                        ) : item.error ? (
                          <span className="text-red-500">-</span>
                        ) : (
                          item.reservedQuantity
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-slate-400">
                        {item.loading ? (
                          <span className="inline-block animate-pulse h-4 w-12 bg-slate-200 rounded"></span>
                        ) : item.error || !item.updatedAt ? (
                          <span className="text-slate-300">-</span>
                        ) : (
                          new Date(item.updatedAt).toLocaleString(undefined, {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })
                        )}
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
