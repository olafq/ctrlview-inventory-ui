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
        setContext({ tid: userData.tenant_id.toString(), cid: mlChannel.toString() });
      } else {
        setErrorInfo("Sin Tenant o Canal de Mercado Libre asignado.");
      }
    } catch (err) {
      setErrorInfo("Error de conexión con el servidor.");
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
          <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 animate-spin rounded-full mx-auto mb-4" />
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.5em]">Authenticating_System...</p>
        </div>
      </div>
    );
  }

  return (
    // Agregamos w-full y max-w-screen-2xl para que no empuje el sidebar
    <div className="w-full min-h-screen bg-[#090a0c] text-white p-4 md:p-8 lg:p-12 overflow-x-hidden">
      
      {/* Header Estilo Dashboard Pro */}
      <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">
              Meli<span className="text-orange-500">_</span>Inventory
            </h1>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] font-mono text-gray-500 uppercase tracking-widest">TID_{context.tid}</span>
            <span className="px-3 py-1 rounded-md bg-orange-500/10 border border-orange-500/20 text-[9px] font-mono text-orange-400 uppercase tracking-widest">CID_{context.cid}</span>
          </div>
        </div>
        
        <button 
          onClick={fetchData}
          className="group relative overflow-hidden bg-white text-black px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
        >
          <span className="relative z-10 group-hover:text-orange-600 transition-colors">Force_Sync_Data</span>
          <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </header>

      {/* Contenedor de Tabla Glassmorphism */}
      <main className="max-w-7xl mx-auto">
        <div className="relative group">
          {/* Brillo de fondo sutil */}
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-transparent rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          
          <div className="relative bg-[#11141b]/80 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
            {loading ? (
              <div className="py-40 text-center">
                <p className="text-[11px] font-mono text-gray-600 animate-pulse tracking-[0.8em] uppercase">Fetching_Master_Records</p>
              </div>
            ) : items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02]">
                      <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Product_Details</th>
                      <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Identifiers</th>
                      <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 text-right">Pricing</th>
                      <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 text-center">Availability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {items.map((item) => (
                      <tr key={item.id} className="group/row hover:bg-white/[0.03] transition-all duration-300">
                        <td className="px-8 py-7">
                          <div className="flex items-center gap-4">
                            <div className="w-1 h-10 bg-transparent group-hover/row:bg-orange-500 transition-all rounded-full" />
                            <span className="text-sm font-bold text-gray-200 group-hover/row:text-white transition-colors uppercase leading-tight tracking-tight max-w-xs lg:max-w-md block">
                              {item.external_title || "Unlabeled_Product"}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-7">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">SKU</span>
                              <span className="text-[11px] font-bold text-gray-300">{item.external_sku || "—"}</span>
                            </div>
                            <span className="text-[9px] font-mono text-gray-600 uppercase tracking-tighter opacity-60">ID: {item.external_item_id}</span>
                          </div>
                        </td>
                        <td className="px-8 py-7 text-right font-black italic text-lg text-white group-hover/row:text-orange-400 transition-colors">
                          ${item.price?.toLocaleString('es-AR')}
                        </td>
                        <td className="px-8 py-7 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className={`text-sm font-mono font-bold ${item.stock === 0 ? 'text-red-500/60' : 'text-orange-500'}`}>
                              {item.stock.toString().padStart(2, '0')}
                            </span>
                            <span className="text-[8px] font-mono text-gray-700 uppercase tracking-tighter">Units</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-40 text-center space-y-4">
                <p className="text-gray-600 font-bold uppercase tracking-[0.4em]">Empty_Inventory</p>
                <p className="text-[10px] text-gray-800 uppercase">Verify your Mercado Libre connection.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="max-w-7xl mx-auto mt-12 flex justify-between items-center opacity-30 group">
        <p className="text-[9px] font-mono uppercase tracking-[0.3em]">IdentityOS // Inventory_Module_v2.0</p>
        <div className="h-px flex-1 mx-8 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <p className="text-[9px] font-mono uppercase tracking-[0.3em]">{new Date().getFullYear()}</p>
      </footer>
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