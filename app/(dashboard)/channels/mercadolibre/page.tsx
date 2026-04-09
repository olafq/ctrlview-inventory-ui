"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from 'next/navigation';

// Definimos la interfaz para que TypeScript no se queje y tengamos autocompletado
interface ExternalItem {
  id: number;
  external_item_id: string;
  external_title: string | null;
  external_sku: string | null;
  price: number;
  stock: number;
  status: string;
}

function MercadoLibreInventoryContent() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<ExternalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  const [context, setContext] = useState<{ tid: string | null; cid: string | null }>({
    tid: null,
    cid: null
  });

  const resolveIdentity = useCallback(async () => {
    try {
      const token = localStorage.getItem("sync_token");
      if (!token) {
        setErrorInfo("No hay token de acceso. Por favor, inicia sesión.");
        return;
      }

      const res = await fetch("https://api.mecca-bot-recepcion.com/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Error al validar identidad");
      const userData = await res.json();
      
      const mlChannel = userData.channels?.find((c: any) => c.type === 'mercadolibre')?.id;
      
      if (userData.tenant_id && mlChannel) {
        setContext({ 
          tid: userData.tenant_id.toString(), 
          cid: mlChannel.toString() 
        });
        localStorage.setItem('user_session', JSON.stringify(userData));
      } else {
        setErrorInfo("El usuario no tiene un Tenant o Canal de Mercado Libre asignado.");
      }
    } catch (err) {
      console.error("Identity Error:", err);
      setErrorInfo("Error de conexión con el servidor de identidad.");
    }
  }, []);

  useEffect(() => {
    const urlTid = searchParams.get('tenant_id');
    const urlCid = searchParams.get('channel_id');

    if (urlTid && urlCid) {
      setContext({ tid: urlTid, cid: urlCid });
    } else {
      resolveIdentity();
    }
  }, [searchParams, resolveIdentity]);

  const fetchData = useCallback(async () => {
    const { tid, cid } = context;
    if (!tid || !cid) return;

    setLoading(true);
    try {
      // Agregamos cache: 'no-store' para que siempre traiga los títulos nuevos de Supabase
      const response = await fetch(
        `https://api.mecca-bot-recepcion.com/integrations/mercadolibre/items?tenant_id=${tid}&channel_id=${cid}&v=${Date.now()}`,
        { cache: 'no-store' }
      );
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [context]);

  useEffect(() => {
    if (context.tid && context.cid) fetchData();
  }, [context, fetchData]);

  if (errorInfo) {
    return (
      <div className="p-20 text-center bg-[#0f1115] min-h-screen">
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl inline-block shadow-[0_0_50px_rgba(239,68,68,0.1)]">
          <p className="text-red-500 font-mono text-xs uppercase tracking-widest">{errorInfo}</p>
          <button onClick={() => window.location.href = '/auth/login'} className="mt-4 text-[10px] bg-white text-black px-6 py-2 rounded-lg font-black uppercase tracking-tighter hover:bg-red-500 hover:text-white transition-all">Volver al Login</button>
        </div>
      </div>
    );
  }

  if (!context.tid || !context.cid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f1115] text-gray-600 font-mono text-[10px] uppercase tracking-[0.5em]">
        <div className="w-8 h-8 border-2 border-orange-500/20 border-t-orange-500 animate-spin rounded-full mb-4" />
        Resolving_Identity_Context...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 bg-[#0f1115] min-h-screen text-white">
      <header className="mb-16 border-b border-white/5 pb-10 flex justify-between items-end">
        <div>
          <h1 className="text-6xl font-black italic tracking-tighter text-white uppercase leading-none">Meli_Inventory</h1>
          <div className="flex gap-4 mt-4">
            <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">TID_{context.tid}</span>
            <span className="text-[10px] font-mono text-orange-500 bg-orange-500/10 px-2 py-1 rounded">CID_{context.cid}</span>
          </div>
        </div>
        <button onClick={fetchData} className="text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl border border-white/10 transition-all active:scale-95">
          Refresh_Data
        </button>
      </header>

      <div className="bg-[#161920]/80 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-md">
        {loading ? (
          <div className="p-40 text-center text-gray-700 font-black italic tracking-[1em] animate-pulse uppercase">Syncing_Records...</div>
        ) : items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em] bg-white/[0.03]">
                  <th className="px-12 py-8 text-white">Product_Title</th>
                  <th className="px-12 py-8">SKU / External_ID</th>
                  <th className="px-12 py-8 text-right">Price_ARS</th>
                  <th className="px-12 py-8 text-center">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="px-12 py-6">
                      <span className="text-sm font-bold text-white group-hover:text-orange-500 transition-colors uppercase tracking-tight block max-w-md truncate">
                        {item.external_title || "PRODUCT_NAME_UNDEFINED"}
                      </span>
                    </td>
                    <td className="px-12 py-6">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-mono text-gray-400 font-bold">{item.external_sku || "NO_SKU"}</span>
                        <span className="text-[9px] font-mono text-gray-600 uppercase tracking-tighter">{item.external_item_id}</span>
                      </div>
                    </td>
                    <td className="px-12 py-6 text-right font-black text-white italic text-base">
                      ${item.price?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-12 py-6 text-center">
                      <span className={`font-mono text-sm ${item.stock === 0 ? 'text-red-500/40' : 'text-gray-400'}`}>
                        {item.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-40 text-center text-gray-600 font-bold uppercase tracking-[0.5em] italic">
            0_Items_Found_In_Channel
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MercadoLibreInventoryContent />
    </Suspense>
  );
}