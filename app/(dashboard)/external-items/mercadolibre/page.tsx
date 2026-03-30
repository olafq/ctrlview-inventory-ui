"use client";
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Interfaces para mantener el tipado estricto de IdentityOS
interface ExternalItem {
  id: number;
  external_id: string;
  sku: string | null;
  price: number;
  stock: number;
  status: string;
}

interface SyncStatus {
  status: 'none' | 'pending' | 'processing' | 'success' | 'failed';
  message?: string;
  finished_at?: string;
}

function MercadoLibreContent() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<ExternalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  // --- LÓGICA DE SESIÓN PROFESIONAL ---
  // En un entorno real, esto viene de tu useAuth() o context.
  // Según tu consola, el tenant es 21.
  const [user, setUser] = useState<{tenant_id: number} | null>(null);

  useEffect(() => {
    // Simulamos la recuperación del usuario logueado que vimos en tu consola
    // Aquí deberías usar tu lógica de auth real.
    setUser({ tenant_id: 21 }); 
  }, []);

  const tenantId = user?.tenant_id.toString();
  const channelId = searchParams.get('channel_id') || "50"; 

  const fetchItems = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await fetch(`https://oauth.goqconsultant.com/integrations/mercadolibre/items?tenant_id=${tenantId}&channel_id=${channelId}`);
      if (res.ok) setItems(await res.json());
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [channelId, tenantId]);

  const fetchLatestSync = useCallback(async () => {
    if (!tenantId) return;
    try {
      const res = await fetch(`https://oauth.goqconsultant.com/integrations/mercadolibre/import/latest?tenant_id=${tenantId}&channel_id=${channelId}`);
      if (res.ok) setSyncStatus(await res.json());
    } catch (e) {
      console.error("Sync status error", e);
    }
  }, [channelId, tenantId]);

  useEffect(() => {
    if (tenantId) {
      fetchItems();
      fetchLatestSync();
      const interval = setInterval(fetchLatestSync, 20000);
      return () => clearInterval(interval);
    }
  }, [tenantId, fetchItems, fetchLatestSync]);

  // Si no hay tenantId (sesión cargando), mostramos un loader premium
  if (!tenantId) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="text-orange-500 font-black tracking-[0.4em] animate-pulse">VALIDATING_SESSION</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#e5e7eb] p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER DINÁMICO */}
        <header className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-gray-800/40 pb-10">
          <div className="space-y-1">
            <h1 className="text-5xl font-black text-white tracking-tighter">MERCADO LIBRE</h1>
            <div className="flex gap-4 items-center">
              <span className="text-[10px] bg-white/5 px-3 py-1 rounded text-gray-500 font-bold tracking-widest uppercase">
                Tenant: {tenantId}
              </span>
              <span className="text-[10px] bg-orange-500/10 px-3 py-1 rounded text-orange-500 font-bold tracking-widest uppercase">
                Channel: {channelId}
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => {/* POST a /import/start */}}
            className="mt-6 md:mt-0 bg-white text-black hover:bg-orange-500 hover:text-white px-8 py-4 rounded-xl font-black transition-all duration-500 shadow-xl active:scale-95"
          >
            SYNC_CHANNEL
          </button>
        </header>

        {/* STATUS BANNER */}
        {syncStatus && (
          <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className={`p-1 rounded-2xl bg-gradient-to-r ${
              syncStatus.status === 'success' ? 'from-green-500/20 to-transparent' : 
              syncStatus.status === 'failed' ? 'from-red-500/20 to-transparent' : 'from-blue-500/20 to-transparent'
            }`}>
              <div className="bg-[#161920] p-4 rounded-[14px] flex items-center justify-between border border-white/5">
                <span className="text-xs font-bold tracking-widest opacity-80 uppercase italic">
                  Last Sync Status: {syncStatus.status} — {syncStatus.message}
                </span>
                <span className="text-[10px] font-mono opacity-30 italic">{syncStatus.finished_at || 'In progress...'}</span>
              </div>
            </div>
          </div>
        )}

        {/* TABLE BODY */}
        <div className="bg-[#161920]/50 border border-white/[0.03] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <table className="w-full">
            <thead className="bg-white/[0.02]">
              <tr className="text-[9px] uppercase tracking-[0.4em] text-gray-600 font-black">
                <th className="px-10 py-8">ML_EXTERNAL_ID</th>
                <th className="px-10 py-8">SKU_REF</th>
                <th className="px-10 py-8 text-right">UNIT_PRICE</th>
                <th className="px-10 py-8 text-center">TOTAL_STOCK</th>
                <th className="px-10 py-8 text-right">GLOBAL_STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {loading ? (
                <tr><td colSpan={5} className="py-40 text-center font-black text-gray-800 tracking-[1em] animate-pulse">LOADING_DATA</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="py-40 text-center text-gray-700 italic font-medium uppercase tracking-widest text-sm">No items found for this tenant</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="group hover:bg-white/[0.01] transition-all">
                    <td className="px-10 py-6 font-mono text-sm text-gray-500 group-hover:text-orange-500">{item.external_id}</td>
                    <td className="px-10 py-6 text-sm font-bold text-gray-400 uppercase tracking-tighter">{item.sku || '---'}</td>
                    <td className="px-10 py-6 text-right font-black text-white text-sm italic">${item.price.toLocaleString()}</td>
                    <td className="px-10 py-6 text-center text-gray-500 text-xs font-bold">{item.stock}</td>
                    <td className="px-10 py-6 text-right">
                      <div className={`inline-block px-3 py-1 rounded text-[10px] font-black border ${
                        item.status === 'active' ? 'border-green-500/20 text-green-500 bg-green-500/5' : 'border-red-500/20 text-red-500 bg-red-500/5'
                      }`}>
                        {item.status.toUpperCase()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ExternalItemsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f1115]" />}>
      <MercadoLibreContent />
    </Suspense>
  );
}