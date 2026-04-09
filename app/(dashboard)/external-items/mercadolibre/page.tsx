"use client";
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// --- INTERFACES ---
interface ExternalItem {
  id: number;
  external_item_id: string;
  external_title: string | null;
  external_sku: string | null;
  price: number;
  stock: number;
  status: string;
}

interface SyncStatus {
  status: 'none' | 'pending' | 'processing' | 'success' | 'failed';
  message?: string;
  finished_at?: string;
}

function MercadoLibreInventoryContent() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<ExternalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  const [context, setContext] = useState<{ tid: string | null; cid: string | null }>({
    tid: null,
    cid: null
  });

  // 1. Obtención de contexto (Tenant y Channel)
  useEffect(() => {
    const sessionStr = localStorage.getItem('user_session');
    const session = JSON.parse(sessionStr || '{}');
    
    const urlTid = searchParams.get('tenant_id');
    const urlCid = searchParams.get('channel_id');

    const mlChannel = session?.channels?.find((c: any) => c.type === 'mercadolibre')?.id;

    setContext({ 
      tid: urlTid || session?.tenant_id || null, 
      cid: urlCid || mlChannel || null 
    });
  }, [searchParams]);

  const { tid, cid } = context;

  // 2. Fetch de Items con prevención de caché
  const fetchItems = useCallback(async () => {
    if (!tid || !cid) return [];
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.mecca-bot-recepcion.com/integrations/mercadolibre/items?tenant_id=${tid}&channel_id=${cid}`,
        { cache: 'no-store' } // Forzar datos frescos del servidor
      );
      if (response.ok) {
        const data = await response.json();
        setItems(data);
        return data;
      }
    } catch (e) { 
      console.error("Error fetching items", e); 
    } finally { 
      setLoading(false); 
    }
    return [];
  }, [tid, cid]);

  // 3. Verificación de estado de Sincronización
  const checkSyncStatus = useCallback(async () => {
    if (!tid || !cid) return null;
    try {
      const response = await fetch(
        `https://api.mecca-bot-recepcion.com/integrations/mercadolibre/import/latest?tenant_id=${tid}&channel_id=${cid}`,
        { cache: 'no-store' }
      );
      const data = await response.json();
      setSyncStatus(data);
      if (data.status === 'success') fetchItems(); 
      return data;
    } catch (e) { return null; }
  }, [tid, cid, fetchItems]);

  // 4. Disparar Importación Manual
  const triggerAutoImport = useCallback(async () => {
    if (!tid || !cid) return;
    setSyncStatus({ status: 'processing' });
    await fetch(`https://api.mecca-bot-recepcion.com/integrations/mercadolibre/import/start?tenant_id=${tid}&channel_id=${cid}`, { method: 'POST' });
    
    // Polling inicial tras 2 segundos
    setTimeout(checkSyncStatus, 2000);
  }, [tid, cid, checkSyncStatus]);

  useEffect(() => {
    if (tid && cid) {
      fetchItems();
      checkSyncStatus();
    }
  }, [tid, cid, fetchItems, checkSyncStatus]);

  // Estado de carga inicial de contexto
  if (!tid || !cid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500 font-mono text-[10px] uppercase tracking-[0.5em]">
        <div className="w-8 h-8 border-2 border-orange-500/20 border-t-orange-500 animate-spin rounded-full mb-4" />
        Resolving_Identity_Context...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-[#0f1115] min-h-screen text-white font-sans selection:bg-orange-500/30">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/5 pb-10 gap-6">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">Meli_Inventory</h1>
          <div className="flex gap-3 mt-4">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded border border-white/5">TID_{tid}</span>
            <span className="text-[10px] font-mono text-orange-500 uppercase tracking-widest bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">CID_{cid}</span>
          </div>
        </div>
        <button 
          onClick={triggerAutoImport}
          disabled={syncStatus?.status === 'processing'}
          className="bg-white text-black px-8 py-4 rounded-2xl font-black text-xs tracking-[0.2em] hover:bg-orange-500 hover:text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
        >
          {syncStatus?.status === 'processing' ? 'SYNCING_DATA...' : 'Force_Extraction'}
        </button>
      </header>

      <div className="bg-[#161920]/60 rounded-[2.5rem] border border-white/5 overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] bg-white/[0.02]">
                <th className="px-10 py-8 text-white">Product_Title</th>
                <th className="px-10 py-8">SKU / External_ID</th>
                <th className="px-10 py-8 text-right">Price_ARS</th>
                <th className="px-10 py-8 text-center">Stock</th>
                <th className="px-10 py-8 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="py-32 text-center text-gray-700 font-black italic tracking-[0.5em] animate-pulse">RETRIVING_FROM_SUPABASE...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="py-32 text-center text-gray-500 italic uppercase font-bold tracking-widest">No inventory data found.</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.03] transition-all group">
                    <td className="px-10 py-7 max-w-md">
                      <span className="text-sm font-bold text-white group-hover:text-orange-500 transition-colors uppercase tracking-tight block truncate">
                        {item.external_title || "Product_Name_Not_Defined"}
                      </span>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-gray-400 font-mono tracking-tighter">{item.external_sku || "NO_SKU"}</span>
                        <span className="text-[9px] font-mono text-gray-600 uppercase tracking-tighter">{item.external_item_id}</span>
                      </div>
                    </td>
                    <td className="px-10 py-7 text-right font-black text-white italic text-base">
                      ${item.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-10 py-7 text-center">
                       <span className={`font-mono text-sm ${item.stock === 0 ? 'text-red-500/50' : 'text-gray-400'}`}>
                        {item.stock}
                       </span>
                    </td>
                    <td className="px-10 py-7 text-right">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${
                        item.status === 'active' 
                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {item.status}
                      </span>
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

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f1115]" />}>
      <MercadoLibreInventoryContent />
    </Suspense>
  );
}