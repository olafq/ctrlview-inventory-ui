"use client";
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// --- INTERFACES PROFESIONALES ---
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

function MercadoLibreInventoryContent() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<ExternalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  // --- OBTENCIÓN DINÁMICA DE CONTEXTO ---
  // No usamos "22" ni "53". Buscamos en la sesión activa
  const [context, setContext] = useState<{ tid: string | null; cid: string | null }>({
    tid: null,
    cid: null
  });

  useEffect(() => {
    // Intentamos recuperar la sesión del localStorage donde Supabase guarda el user
    const session = JSON.parse(localStorage.getItem('user_session') || '{}');
    
    // Prioridad: 1. URL Params (?tenant_id=...) | 2. Sesión guardada | 3. Metadata del objeto de consola
    const currentTenant = searchParams.get('tenant_id') || session?.tenant_id || session?.user?.user_metadata?.tenant_id;
    
    // Buscamos el canal de tipo 'mercadolibre' dentro del array de canales del usuario
    const mlChannel = session?.channels?.find((c: any) => c.type === 'mercadolibre')?.id;
    const currentChannel = searchParams.get('channel_id') || mlChannel;

    if (currentTenant && currentChannel) {
      setContext({ tid: currentTenant, cid: currentChannel });
    }
  }, [searchParams]);

  const { tid, cid } = context;

  // --- ACCIONES DE API ---
  const fetchItems = useCallback(async () => {
    if (!tid || !cid) return [];
    try {
      const response = await fetch(`https://oauth.goqconsultant.com/integrations/mercadolibre/items?tenant_id=${tid}&channel_id=${cid}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
        return data;
      }
    } catch (e) { console.error("Error fetching items", e); }
    finally { setLoading(false); }
    return [];
  }, [tid, cid]);

  const checkSyncStatus = useCallback(async () => {
    if (!tid || !cid) return null;
    try {
      const response = await fetch(`https://oauth.goqconsultant.com/integrations/mercadolibre/import/latest?tenant_id=${tid}&channel_id=${cid}`);
      const data = await response.json();
      setSyncStatus(data);
      return data;
    } catch (e) { return null; }
  }, [tid, cid]);

  const triggerAutoImport = useCallback(async () => {
    if (!tid || !cid) return;
    console.log("🚀 IdentityOS: Iniciando extracción automática...");
    await fetch(`https://oauth.goqconsultant.com/integrations/mercadolibre/import/start?tenant_id=${tid}&channel_id=${cid}`, { method: 'POST' });
    checkSyncStatus();
  }, [tid, cid, checkSyncStatus]);

  // --- LÓGICA DE CONTROL ---
  useEffect(() => {
    if (tid && cid) {
      const init = async () => {
        const existingData = await fetchItems();
        const lastSync = await checkSyncStatus();

        // Si no hay productos y la última sync falló o no existe, disparamos automáticamente
        if (existingData.length === 0 && (!lastSync || lastSync.status === 'failed' || lastSync.status === 'none')) {
          triggerAutoImport();
        }
      };
      init();
    }
  }, [tid, cid, fetchItems, checkSyncStatus, triggerAutoImport]);

  // --- UI RENDER ---
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
            <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">TID: {tid}</span>
            <span className="text-[9px] font-mono text-orange-500 uppercase tracking-widest bg-orange-500/10 px-2 py-1 rounded">CID: {cid}</span>
          </div>
        </div>
        <button 
          onClick={triggerAutoImport}
          className="bg-white text-black px-8 py-3 rounded-xl font-black text-xs tracking-widest hover:bg-orange-500 hover:text-white transition-all active:scale-95"
        >
          FORCE_EXTRACTION
        </button>
      </header>

      {syncStatus?.status === 'processing' && (
        <div className="mb-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl animate-pulse">
          <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest">Sincronización en curso: Extrayendo productos desde Mercado Libre...</p>
        </div>
      )}

      <div className="bg-[#161920]/60 rounded-[2.5rem] border border-white/5 overflow-hidden backdrop-blur-md">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[9px] text-gray-600 font-black uppercase tracking-[0.4em] bg-white/5">
              <th className="px-10 py-8 text-white">External_UID</th>
              <th className="px-10 py-8">SKU</th>
              <th className="px-10 py-8 text-right">Market_Price</th>
              <th className="px-10 py-8 text-center">Stock</th>
              <th className="px-10 py-8 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={5} className="py-20 text-center text-gray-800 font-black italic tracking-widest animate-pulse">CONNECTING_TO_DATABASE...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="py-20 text-center text-gray-500 italic uppercase font-bold tracking-widest">No data available - Check logs</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-10 py-6 font-mono text-xs text-gray-500 group-hover:text-orange-500">{item.external_id}</td>
                  <td className="px-10 py-6 text-sm font-bold text-gray-400">{item.sku || "—"}</td>
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