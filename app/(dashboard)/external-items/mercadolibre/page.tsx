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

  // 1. Cargar items desde el backend
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://oauth.goqconsultant.com/integrations/mercadolibre/items?tenant_id=${tenantId}&channel_id=${channelId}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error("❌ Error al traer items:", error);
    } finally {
      setLoading(false);
    }
  }, [channelId, tenantId]);

  // 2. Consultar el estado del último proceso de importación
  const fetchLatestSync = useCallback(async () => {
    try {
      const response = await fetch(`https://oauth.goqconsultant.com/integrations/mercadolibre/import/latest?tenant_id=${tenantId}&channel_id=${channelId}`);
      if (response.ok) {
        const data = await response.json();
        setSyncStatus(data);
      }
    } catch (e) {
      console.error("Error al obtener estado de sincronización", e);
    }
  }, [channelId, tenantId]);

  // 3. Disparar sincronización manual
  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch(`https://oauth.goqconsultant.com/integrations/mercadolibre/import/start?tenant_id=${tenantId}&channel_id=${channelId}`, { method: 'POST' });
      if (response.ok) {
        fetchLatestSync();
        setTimeout(fetchItems, 5000);
      }
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchLatestSync();
    const interval = setInterval(fetchLatestSync, 15000);
    return () => clearInterval(interval);
  }, [fetchItems, fetchLatestSync]);

  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* ENCABEZADO PREMIUM */}
        <header className="flex justify-between items-end mb-10 border-b border-gray-800/50 pb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Mercado Libre</h1>
            <p className="text-gray-500 mt-2 font-medium">Gestión de inventario y sincronización de canales externos</p>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] bg-gray-900/50 px-3 py-1 rounded-full border border-gray-800">
              Channel ID: {channelId}
            </span>
            <button 
              onClick={handleSync}
              disabled={syncing || syncStatus?.status === 'processing'}
              className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-2xl ${
                syncing || syncStatus?.status === 'processing'
                ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                : "bg-orange-500 hover:bg-orange-600 text-black shadow-orange-500/20 active:scale-95"
              }`}
            >
              {syncing || syncStatus?.status === 'processing' ? "Procesando..." : "Sincronizar Ahora"}
            </button>
          </div>
        </header>

        {/* BANNER DE ESTADO DE IMPORTACIÓN */}
        {syncStatus && syncStatus.status !== 'none' && (
          <div className={`mb-8 p-5 rounded-2xl border backdrop-blur-md transition-all ${
            syncStatus.status === 'success' ? 'bg-green-500/5 border-green-500/20 text-green-400' :
            syncStatus.status === 'failed' ? 'bg-red-500/5 border-red-500/20 text-red-400' :
            'bg-blue-500/5 border-blue-500/20 text-blue-400 animate-pulse'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`h-2.5 w-2.5 rounded-full ${
                  syncStatus.status === 'success' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 
                  syncStatus.status === 'failed' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 
                  'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                }`} />
                <p className="text-sm font-semibold tracking-wide">
                  {syncStatus.status === 'success' ? 'Sincronización Completada' : 
                   syncStatus.status === 'failed' ? 'Error en la Sincronización' : 'Sincronizando con Mercado Libre...'}
                  <span className="ml-4 opacity-60 font-normal italic text-xs">{syncStatus.message}</span>
                </p>
              </div>
              {syncStatus.finished_at && (
                <span className="text-[10px] font-mono opacity-40">Actualizado: {new Date(syncStatus.finished_at).toLocaleTimeString()}</span>
              )}
            </div>
          </div>
        )}

        {/* CONTENEDOR DE LA TABLA */}
        <div className="bg-[#161920] rounded-3xl border border-gray-800/50 overflow-hidden shadow-2xl backdrop-blur-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1c212c]/50 text-gray-400 text-[11px] uppercase tracking-[0.2em] font-bold">
                <th className="px-8 py-6">ID ML</th>
                <th className="px-8 py-6">SKU / Referencia</th>
                <th className="px-8 py-6 text-right">Precio Unitario</th>
                <th className="px-8 py-6 text-center">Stock</th>
                <th className="px-8 py-6 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading && items.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-40 text-gray-600 font-medium italic animate-pulse">Estableciendo conexión segura con la API...</td></tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-40">
                    <div className="flex flex-col items-center">
                      <p className="text-gray-500 font-medium text-lg italic">Sin productos vinculados aún.</p>
                      <p className="text-gray-700 text-sm mt-2">Haz clic en el botón superior para importar tu catálogo.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6 font-mono text-orange-500/90 text-sm">{item.external_id}</td>
                    <td className="px-8 py-6 text-sm text-gray-300 font-medium">{item.sku || "—"}</td>
                    <td className="px-8 py-6 text-sm font-bold text-white text-right font-mono">${item.price.toLocaleString()}</td>
                    <td className="px-8 py-6 text-sm text-gray-400 text-center">
                      {item.stock} <span className="text-[10px] opacity-30 ml-1 uppercase">uds</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] border shadow-sm ${
                        item.status === 'active' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
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

        <footer className="mt-8 text-center">
          <p className="text-[10px] text-gray-700 uppercase tracking-widest font-bold">IdentityOS Inventory Engine v1.0</p>
        </footer>

      </div>
    </div>
  );
}

// Componente Wrapper para evitar errores de pre-renderizado en Vercel
export default function ExternalItemsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="text-gray-600 font-bold tracking-[0.5em] animate-pulse uppercase">Cargando Sistema</div>
      </div>
    }>
      <MercadoLibreContent />
    </Suspense>
  );
}