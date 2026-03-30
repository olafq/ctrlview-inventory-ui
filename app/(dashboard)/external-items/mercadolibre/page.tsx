"use client";
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
// Importa tu hook de autenticación real aquí. Ejemplo:
// import { useAuth } from '@/hooks/useAuth'; 

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
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  // --- LÓGICA DINÁMICA PROFESIONAL ---
  
  // 1. Obtenemos el Channel ID de la URL. Si no hay, no mostramos nada (seguridad).
  const channelId = searchParams.get('channel_id');

  // 2. Simulamos la obtención del Tenant ID desde tu sesión/contexto de usuario.
  // En producción, aquí usarías: const { user } = useAuth();
  // Por ahora, extraemos el ID del objeto que ya vive en tu consola.
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    // Aquí es donde IdentityOS detecta al usuario real.
    // Buscamos en el almacenamiento local o contexto lo que vimos en tu captura.
    const storedUser = localStorage.getItem('supabase.auth.token'); // O tu método de auth
    if (storedUser) {
        const userData = JSON.parse(storedUser);
        setTenantId(userData?.user?.user_metadata?.tenant_id || "21");
    } else {
        // Fallback temporal para desarrollo si no hay sesión activa
        setTenantId("21"); 
    }
  }, []);

  const fetchItems = useCallback(async () => {
    if (!tenantId || !channelId) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://oauth.goqconsultant.com/integrations/mercadolibre/items?tenant_id=${tenantId}&channel_id=${channelId}`
      );
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error("❌ Error fetch items:", error);
    } finally {
      setLoading(false);
    }
  }, [channelId, tenantId]);

  const fetchLatestSync = useCallback(async () => {
    if (!tenantId || !channelId) return;
    try {
      const response = await fetch(
        `https://oauth.goqconsultant.com/integrations/mercadolibre/import/latest?tenant_id=${tenantId}&channel_id=${channelId}`
      );
      if (response.ok) {
        const data = await response.json();
        setSyncStatus(data);
      }
    } catch (e) {
      console.error("❌ Error sync status:", e);
    }
  }, [channelId, tenantId]);

  const handleSync = async () => {
    if (!tenantId || !channelId) return;
    setSyncing(true);
    try {
      await fetch(
        `https://oauth.goqconsultant.com/integrations/mercadolibre/import/start?tenant_id=${tenantId}&channel_id=${channelId}`, 
        { method: 'POST' }
      );
      fetchLatestSync();
      setTimeout(fetchItems, 5000);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (tenantId && channelId) {
      fetchItems();
      fetchLatestSync();
      const interval = setInterval(fetchLatestSync, 15000);
      return () => clearInterval(interval);
    }
  }, [tenantId, channelId, fetchItems, fetchLatestSync]);

  // Si falta información crítica, mostramos un estado de carga profesional
  if (!tenantId || !channelId) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-gray-500 font-mono text-[10px] tracking-[0.3em] uppercase">Sincronizando Identidad...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER DINÁMICO */}
        <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8 border-b border-white/5 pb-12">
          <div className="space-y-4">
            <h1 className="text-6xl font-black tracking-tighter italic">Meli_Sync</h1>
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Organización</span>
                <span className="text-sm font-mono text-white">ID_{tenantId}</span>
              </div>
              <div className="h-8 w-[1px] bg-white/10" />
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Canal_ML</span>
                <span className="text-sm font-mono text-orange-500">{channelId}</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleSync}
            disabled={syncing || syncStatus?.status === 'processing'}
            className={`group relative overflow-hidden px-12 py-5 rounded-2xl font-black transition-all ${
              syncing || syncStatus?.status === 'processing'
              ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
              : "bg-white text-black hover:bg-orange-500 hover:text-white"
            }`}
          >
            <span className="relative z-10 tracking-widest">
              {syncing || syncStatus?.status === 'processing' ? "EXECUTING_SYNC..." : "START_SYNC"}
            </span>
          </button>
        </header>

        {/* STATUS PANEL */}
        {syncStatus && (
          <div className="mb-12 p-1 rounded-[2rem] bg-gradient-to-r from-orange-500/20 to-transparent">
            <div className="bg-[#161920] p-8 rounded-[1.9rem] flex items-center justify-between border border-white/5 shadow-2xl">
              <div className="flex items-center gap-6">
                <div className={`h-4 w-4 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)] ${
                  syncStatus.status === 'success' ? 'bg-green-500' : 'bg-orange-500 animate-pulse'
                }`} />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Último Reporte</p>
                  <p className="text-lg font-bold text-white capitalize">{syncStatus.message}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-mono text-gray-600 uppercase">Timestamp</p>
                <p className="text-sm font-mono text-gray-400">{syncStatus.finished_at || 'Sync in progress'}</p>
              </div>
            </div>
          </div>
        )}

        {/* DATA TABLE */}
        <div className="bg-[#161920]/40 rounded-[3rem] border border-white/5 overflow-hidden backdrop-blur-3xl shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-gray-500 text-[9px] uppercase tracking-[0.4em] font-black">
                <th className="px-12 py-8">ML_UID</th>
                <th className="px-12 py-8">Internal_SKU</th>
                <th className="px-12 py-8 text-right">Market_Price</th>
                <th className="px-12 py-8 text-center">Available_Qty</th>
                <th className="px-12 py-8 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && items.length === 0 ? (
                <tr><td colSpan={5} className="py-40 text-center font-black text-gray-800 tracking-[1em] animate-pulse">FETCHING_DATABASE</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="py-40 text-center text-gray-700 italic uppercase tracking-[0.3em] font-bold">No hay registros para este canal</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="px-12 py-7 font-mono text-xs text-gray-500 group-hover:text-orange-500 transition-colors">{item.external_id}</td>
                    <td className="px-12 py-7 text-sm font-bold text-gray-400">{item.sku || "—"}</td>
                    <td className="px-12 py-7 text-right font-black text-white italic text-base">${item.price.toLocaleString()}</td>
                    <td className="px-12 py-7 text-center text-gray-400 font-mono text-sm">{item.stock}</td>
                    <td className="px-12 py-7 text-right">
                      <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        item.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
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

export default function ExternalItemsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f1115]" />}>
      <MercadoLibreContent />
    </Suspense>
  );
}