"use client";
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// --- INTERFACES ACTUALIZADAS CON EL NUEVO CAMPO ---
interface ExternalItem {
  id: number;
  external_item_id: string;
  external_title: string | null; // Nuevo campo del backend
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

  useEffect(() => {
    const sessionStr = localStorage.getItem('user_session');
    const session = JSON.parse(sessionStr || '{}');
    
    const urlTid = searchParams.get('tenant_id');
    const urlCid = searchParams.get('channel_id');

    // Buscamos el canal de ML dinámicamente
    const mlChannel = session?.channels?.find((c: any) => c.type === 'mercadolibre')?.id;

    setContext({ 
      tid: urlTid || session?.tenant_id || null, 
      cid: urlCid || mlChannel || null 
    });
  }, [searchParams]);

  const { tid, cid } = context;

  const fetchItems = useCallback(async () => {
    if (!tid || !cid) return [];
    setLoading(true);
    try {
      const response = await fetch(`https://api.mecca-bot-recepcion.com/integrations/mercadolibre/items?tenant_id=${tid}&channel_id=${cid}`);
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

  const checkSyncStatus = useCallback(async () => {
    if (!tid || !cid) return null;
    try {
      const response = await fetch(`https://api.mecca-bot-recepcion.com/integrations/mercadolibre/import/latest?tenant_id=${tid}&channel_id=${cid}`);
      const data = await response.json();
      setSyncStatus(data);
      if (data.status === 'success') fetchItems(); 
      return data;
    } catch (e) { return null; }
  }, [tid, cid, fetchItems]);

  const triggerAutoImport = useCallback(async () => {
    if (!tid || !cid) return;
    setSyncStatus({ status: 'processing' });
    await fetch(`https://api.mecca-bot-recepcion.com/integrations/mercadolibre/import/start?tenant_id=${tid}&channel_id=${cid}`, { method: 'POST' });
    
    // Polling corto para actualizar el estado
    setTimeout(checkSyncStatus, 2000);
  }, [tid, cid, checkSyncStatus]);

  useEffect(() => {
    if (tid && cid) {
      fetchItems();
      checkSyncStatus();
    }
  }, [tid, cid, fetchItems, checkSyncStatus]);

  if (!tid || !cid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500 font-mono text-[10px] uppercase tracking-[0.5em]">
        <div className="w-8 h-8 border-2 border-orange-500/20 border-t-orange-500 animate-spin rounded-full mb-4" />
        Resolving_Identity_Context...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-[#0f1115] min-h-screen text-white">
      <header className="flex justify-between items-end mb-12 border-b border-white/5 pb-10">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase">Meli_Inventory</h1>
          <div className="flex gap-4 mt-3">
            <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">TENANT: {tid}</span>
            <span className="text-[9px] font-mono text-orange-500 uppercase tracking-widest bg-orange-500/10 px-2 py-1 rounded">CHANNEL: {cid}</span>
          </div>
        </div>
        <button 
          onClick={triggerAutoImport}
          disabled={syncStatus?.status === 'processing'}
          className="bg-white text-black px-8 py-3 rounded-xl font-black text-xs tracking-widest hover:bg-orange-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
        >
          {syncStatus?.status === 'processing' ? 'SYNCING...' : 'FORCE_EXTRACTION'}
        </button>
      </header>

      <div className="bg-[#161920]/60 rounded-[2.5rem] border border-white/5 overflow-hidden backdrop-blur-md">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[9px] text-gray-600 font-black uppercase tracking-[0.4em] bg-white/5">
              <th className="px-10 py-8 text-white">Product_Title</th>
              <th className="px-10 py-8">SKU / Ext_ID</th>
              <th className="px-10 py-8 text-right">Market_Price</th>
              <th className="px-10 py-8 text-center">Stock</th>
              <th className="px-10 py-8 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={5} className="py-20 text-center text-gray-800 font-black italic tracking-widest animate-pulse">FETCHING_FROM_SUPABASE...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="py-20 text-center text-gray-500 italic uppercase font-bold tracking-widest">No products found for CID: {cid}</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white group-hover:text-orange-500 transition-colors uppercase tracking-tight">
                        {item.external_title || "PRODUCT_WITHOUT_NAME"}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-gray-400">{item.external_sku || "—"}</span>
                      <span className="text-[9px] font-mono text-gray-600 uppercase tracking-tighter">{item.external_item_id}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right font-black text-white italic text-base">${item.price.toLocaleString()}</td>
                  <td className="px-10 py-6 text-center text-gray-400 font-mono">{item.stock}</td>
                  <td className="px-10 py-6 text-right">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      item.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
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
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f1115]" />}>
      <MercadoLibreInventoryContent />
    </Suspense>
  );
}