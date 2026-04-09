"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from 'next/navigation';

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
        setErrorInfo("No hay token de acceso.");
        return;
      }

      const res = await fetch("https://api.mecca-bot-recepcion.com/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Error al validar identidad");
      const userData = await res.json();
      const mlChannel = userData.channels?.find((c: any) => c.type === 'mercadolibre')?.id;
      
      if (userData.tenant_id && mlChannel) {
        setContext({ tid: userData.tenant_id.toString(), cid: mlChannel.toString() });
      } else {
        setErrorInfo("Sin datos de acceso válidos.");
      }
    } catch (err) {
      setErrorInfo("Error de conexión.");
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
      const response = await fetch(
        `https://api.mecca-bot-recepcion.com/integrations/mercadolibre/items?tenant_id=${tid}&channel_id=${cid}&v=${Date.now()}`,
        { cache: 'no-store' }
      );
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [context]);

  useEffect(() => {
    if (context.tid && context.cid) fetchData();
  }, [context, fetchData]);

  if (!context.tid || !context.cid) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#090a0c]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500/20 border-t-orange-500 animate-spin rounded-full mx-auto mb-4" />
          <p className="text-[9px] font-mono text-gray-600 uppercase tracking-[0.5em]">System_Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    /* ELIMINACIÓN DE MARGEN BLANCO: w-full y bg-[#090a0c] sin paddings restrictivos en el root */
    <div className="w-full min-h-screen bg-[#090a0c] text-white overflow-x-hidden border-none">
      
      {/* Contenedor principal con padding interno para el contenido */}
      <div className="p-6 md:p-12 lg:p-16 max-w-[1600px]">
        
        {/* Header Estilo Pro con el logo MELI_INVENTORY */}
        <header className="mb-14 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-10 bg-orange-500 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.6)]" />
              <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
                MELI<span className="text-orange-500 font-light">_</span>INVENTORY
              </h1>
            </div>
            <div className="flex gap-2 ml-6">
              <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] font-mono text-gray-500 uppercase tracking-widest italic">TID_{context.tid}</span>
              <span className="px-3 py-1 rounded-md bg-orange-500/10 border border-orange-500/20 text-[9px] font-mono text-orange-400 uppercase tracking-widest font-bold italic">CID_{context.cid}</span>
            </div>
          </div>
          
          <button 
            onClick={fetchData}
            className="group relative overflow-hidden bg-white text-black px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 shadow-[0_15px_30px_rgba(255,255,255,0.05)]"
          >
            <span className="relative z-10 group-hover:text-orange-600 transition-colors">FORCE_SYNC_DATA</span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="relative">
          <div className="bg-[#11141b]/60 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
            {loading ? (
              <div className="py-48 text-center">
                <p className="text-[10px] font-mono text-gray-600 animate-pulse tracking-[1em] uppercase">Fetching_Master_Data</p>
              </div>
            ) : items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02]">
                      <th className="px-10 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 border-b border-white/5">PRODUCT_DETAILS</th>
                      <th className="px-10 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 border-b border-white/5">IDENTIFIERS</th>
                      <th className="px-10 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 border-b border-white/5 text-right">PRICING</th>
                      <th className="px-10 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 border-b border-white/5 text-center">AVAILABILITY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {items.map((item) => (
                      <tr key={item.id} className="group/row hover:bg-white/[0.03] transition-all duration-500">
                        <td className="px-10 py-8">
                          <span className="text-[14px] font-bold text-gray-200 group-hover/row:text-white transition-colors uppercase leading-tight tracking-tight block max-w-sm lg:max-w-md italic">
                            {item.external_title || "UNLABELED_ITEM"}
                          </span>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] font-black text-orange-500/60 border border-orange-500/20 px-1.5 py-0.5 rounded italic">SKU</span>
                              <span className="text-[11px] font-bold text-gray-400 font-mono tracking-tighter">{item.external_sku || "—"}</span>
                            </div>
                            <span className="text-[9px] font-mono text-gray-700 uppercase">ML_ID: {item.external_item_id}</span>
                          </div>
                        </td>
                        <td className="px-10 py-8 text-right font-black italic text-xl text-white group-hover/row:text-orange-400 transition-all">
                          <span className="text-orange-500 text-sm mr-1.5 tracking-tighter">$</span>
                          {item.price?.toLocaleString('es-AR')}
                        </td>
                        <td className="px-10 py-8 text-center">
                          <div className="inline-flex flex-col items-center bg-white/[0.02] border border-white/5 px-4 py-2 rounded-2xl group-hover/row:border-orange-500/20 transition-all">
                            <span className={`text-lg font-mono font-black ${item.stock === 0 ? 'text-red-500/40' : 'text-orange-500'}`}>
                              {item.stock.toString().padStart(2, '0')}
                            </span>
                            <span className="text-[7px] font-black text-gray-700 uppercase tracking-tighter">UNITS</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-48 text-center italic text-gray-700 font-bold uppercase tracking-widest opacity-40">Zero_Items_Found</div>
            )}
          </div>
        </main>

        <footer className="mt-16 flex justify-between items-center opacity-20">
          <p className="text-[8px] font-mono uppercase tracking-[0.5em]">IDENTITYOS // INVENTORY_SUBSYSTEM</p>
          <div className="h-px flex-1 mx-12 bg-gradient-to-r from-transparent via-white to-transparent" />
          <p className="text-[8px] font-mono uppercase tracking-[0.5em]">{new Date().getFullYear()}</p>
        </footer>
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