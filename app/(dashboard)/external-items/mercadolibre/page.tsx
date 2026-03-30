"use client";
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface ExternalItem {
  id: number;
  external_id: string;
  sku: string | null;
  price: number;
  stock: number;
  status: string;
  is_active: boolean;
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
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  const tenantId = "1"; 
  const channelId = searchParams.get('channel_id') || "1";

  // 1. Obtener items
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://oauth.goqconsultant.com/integrations/mercadolibre/items?tenant_id=${tenantId}&channel_id=${channelId}`
      );
      if (!response.ok) throw new Error("Error API");
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("❌ Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  }, [channelId, tenantId]);

  // 2. Obtener el estado de la última sincronización
  const fetchLatestSync = useCallback(async () => {
    try {
      const response = await fetch(
        `https://oauth.goqconsultant.com/integrations/mercadolibre/import/latest?tenant_id=${tenantId}&channel_id=${channelId}`
      );
      const data = await response.json();
      setSyncStatus(data);
    } catch (e) {
      console.error("Error fetching sync status", e);
    }
  }, [channelId, tenantId]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch(
        `https://oauth.goqconsultant.com/integrations/mercadolibre/import/start?tenant_id=${tenantId}&channel_id=${channelId}`,
        { method: 'POST' }
      );
      if (response.ok) {
        fetchLatestSync();
        setTimeout(fetchItems, 5000);
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchLatestSync();
    // Polling suave cada 15 segundos para actualizar el banner si está procesando
    const interval = setInterval(fetchLatestSync, 15000);
    return () => clearInterval(interval);
  }, [fetchItems, fetchLatestSync]);

  return (
    <div className="p-6 text-white min-h-screen bg-[#0f1115]">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 tracking-tight">Mercado Libre</h1>
          <p className="text-gray-400 mt-1 text-sm italic">Sincronización de inventario IdentityOS</p>
        </div>
        
        <button 
          onClick={handleSync}
          disabled={syncing || loading || syncStatus?.status === 'processing'}
          className={`px-6 py-2 rounded-lg font-bold transition-all shadow-lg ${
            syncing || syncStatus?.status === 'processing'
            ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
            : "bg-orange-500 hover:bg-orange-600 text-black shadow-orange-500/10"
          }`}
        >
          {syncing || syncStatus?.status === 'processing' ? "Sincronizando..." : "Sincronizar Ahora"}
        </button>
      </header>

      {/* BANNER DE ESTADO */}
      {syncStatus && syncStatus.status !== 'none' && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between ${
          syncStatus.status === 'success' ? 'bg-green-900/10 border-green-500/20 text-green-400' :
          syncStatus.status === 'failed' ? 'bg-red-900/10 border-red-500/20 text-red-400' :
          'bg-blue-900/10 border-blue-500/20 text-blue-400 animate-pulse'
        }`}>
          <div className="flex items-center gap-3 text-sm">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                syncStatus.status === 'success' ? 'bg-green-500' : syncStatus.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                syncStatus.status === 'success' ? 'bg-green-500' : syncStatus.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
              }`}></span>
            </span>
            <p>
              <strong>Estado:</strong> {
                syncStatus.status === 'success' ? 'Sincronización completada' :
                syncStatus.status === 'failed' ? 'Error en la sincronización' : 'Procesando cambios...'
              }
              <span className="ml-2 opacity-70">({syncStatus.message})</span>
            </p>
          </div>
          {syncStatus.finished_at && (
            <span className="text-[10px] uppercase opacity-50 font-mono">
              Last: {new Date(syncStatus.finished_at).toLocaleTimeString()}
            </span>
          )}
        </div>
      )}

      {/* TABLA */}
      <div className="bg-[#1a1d23] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-[#252a33] text-gray-400 text-xs uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">ID ML</th>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4">Precio</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading && items.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-20 text-gray-600 animate-pulse font-light italic">Consultando base de datos...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-20 text-gray-600">No se encontraron ítems importados.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-[#20252e] transition-colors border-l-2 border-transparent hover:border-orange-500">
                  <td className="px-6 py-4 font-mono text-orange-500 text-sm">{item.external_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-300 font-light">{item.sku || "—"}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-200">${item.price.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{item.stock} <span className="text-[10px] opacity-40">unidades</span></td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      item.status === 'active' 
                      ? 'bg-green-500/5 text-green-500 border-green-500/20' 
                      : 'bg-red-500/5 text-red-500 border-red-500/20'
                    }`}>
                      {item.status.toUpperCase()}
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

export default function ExternalItemsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f1115] flex items-center justify-center text-gray-500 font-light italic">Cargando IdentityOS Engine...</div>}>
      <MercadoLibreContent />
    </Suspense>
  );
}