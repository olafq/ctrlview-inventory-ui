"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from 'next/navigation';

interface ImportStatus {
  status: string;
  inserted: number;
  updated: number;
}

// 1. Movemos toda la lógica a un componente interno
function MercadoLibreInventoryContent() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState([]);
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const [context, setContext] = useState<{ tid: string | null; cid: string | null }>({
    tid: null,
    cid: null
  });

  useEffect(() => {
    // Verificamos que estamos en el cliente antes de tocar localStorage
    if (typeof window !== "undefined") {
      const urlTid = searchParams.get('tenant_id');
      const urlCid = searchParams.get('channel_id');

      const sessionStr = localStorage.getItem('user_session');
      const session = JSON.parse(sessionStr || '{}');
      
      const mlChannel = session?.channels?.find((c: any) => c.type === 'mercadolibre')?.id;

      setContext({ 
        tid: urlTid || session?.tenant_id || null, 
        cid: urlCid || mlChannel || null 
      });
    }
  }, [searchParams]);

  const { tid, cid } = context;

  const fetchData = useCallback(async () => {
    if (!tid || !cid) return;
    
    try {
      const itemsRes = await fetch(`https://api.mecca-bot-recepcion.com/integrations/mercadolibre/items?tenant_id=${tid}&channel_id=${cid}`);
      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        setItems(itemsData);
      }

      const statusRes = await fetch(`https://api.mecca-bot-recepcion.com/integrations/mercadolibre/import/latest?tenant_id=${tid}&channel_id=${cid}`);
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setImportStatus(statusData);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [tid, cid]);

  useEffect(() => {
    if (tid && cid) {
      fetchData();
    }
  }, [tid, cid, fetchData]);

  useEffect(() => {
    let interval: any;
    if (importStatus?.status === "pending" || importStatus?.status === "queued" || importStatus?.status === "processing") {
      interval = setInterval(fetchData, 5000);
    }
    return () => clearInterval(interval);
  }, [importStatus?.status, fetchData]);

  if (!tid || !cid) {
    return (
      <div className="p-20 text-center text-gray-400 font-mono text-xs animate-pulse">
        RESOLVIENDO_CONTEXTO_DE_IDENTIDAD...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 bg-[#f8fafc] min-h-screen">
      {/* BANNER DE SINCRONIZACIÓN */}
      {(importStatus?.status === "pending" || importStatus?.status === "queued" || importStatus?.status === "processing") && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 animate-pulse rounded-r-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-blue-500">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700 font-medium">
                Sincronizando con Mercado Libre...
                <span className="ml-2 text-xs font-normal">
                  ({importStatus.inserted || 0} productos procesados)
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TABLA DE PRODUCTOS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white text-gray-800">
          <div>
            <h2 className="font-bold">Inventario Mercado Libre</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Tenant: {tid}</p>
          </div>
          <span className="px-2 py-1 bg-orange-50 text-orange-600 text-[10px] font-black rounded border border-orange-100">
            CANAL ID: {cid}
          </span>
        </div>
        
        {loading ? (
          <div className="p-20 text-center text-gray-400 italic">Cargando base de datos...</div>
        ) : items.length > 0 ? (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-6 py-3">ML ID</th>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3 text-right">Precio</th>
                <th className="px-6 py-3 text-center">Stock</th>
                <th className="px-6 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-blue-600">
                    {item.external_item_id || item.external_id}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700">
                    {item.external_sku || item.sku || "—"}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    ${item.price?.toLocaleString() || '0'}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-gray-600">
                    {item.stock ?? 0}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      item.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-20 text-center">
            <p className="text-gray-400 italic text-sm">No se encontraron productos vinculados.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// 2. Exportamos la página envuelta en Suspense (Obligatorio para useSearchParams en Next.js)
export default function MercadoLibrePage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-gray-400">Cargando interfaz...</div>}>
      <MercadoLibreInventoryContent />
    </Suspense>
  );
}