"use client";
import { useEffect, useState, useCallback } from 'react';
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

export default function ExternalItemsPage() {
  const searchParams = useSearchParams();
  
  // 1. Estados dinámicos
  const [items, setItems] = useState<ExternalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // 2. Obtención de IDs (Tenant y Channel)
  // Nota: En producción esto debería venir de tu AuthContext o sesión segura.
  const tenantId = "1"; 
  const channelId = searchParams.get('channel_id') || "1";

  // 3. Función para traer datos (GET)
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://oauth.goqconsultant.com/integrations/mercadolibre/items?tenant_id=${tenantId}&channel_id=${channelId}`
      );
      if (!response.ok) throw new Error("Error en la conexión con la API");
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("❌ Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  }, [channelId, tenantId]);

  // 4. Función para disparar la sincronización (POST)
  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch(
        `https://oauth.goqconsultant.com/integrations/mercadolibre/import/start?tenant_id=${tenantId}&channel_id=${channelId}`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        alert("Sincronización iniciada. Los productos aparecerán en unos instantes.");
        // Polling manual: re-intentamos cargar en 5 segundos
        setTimeout(fetchItems, 5000);
      } else {
        alert("Error al iniciar la sincronización.");
      }
    } catch (error) {
      alert("No se pudo conectar con el servidor.");
    } finally {
      setSyncing(false);
    }
  };

  // 5. Carga inicial
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="p-6 text-white min-h-screen bg-[#0f1115]">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Mercado Libre</h1>
          <p className="text-gray-400 mt-2">Gestión de ítems externos vinculados</p>
        </div>
        
        <button 
          onClick={handleSync}
          disabled={syncing || loading}
          className={`px-6 py-2 rounded-lg font-bold transition-all ${
            syncing 
            ? "bg-gray-700 text-gray-400 cursor-not-allowed" 
            : "bg-orange-500 hover:bg-orange-600 text-black shadow-lg shadow-orange-500/20"
          }`}
        >
          {syncing ? "Sincronizando..." : "Sincronizar Catálogo"}
        </button>
      </header>

      <div className="bg-[#1a1d23] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-[#252a33] text-gray-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">ID ML</th>
              <th className="px-6 py-4">SKU / Custom ID</th>
              <th className="px-6 py-4">Precio</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500 animate-pulse">
                  Cargando inventario real...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">
                  No hay productos vinculados. Dale a "Sincronizar Catálogo".
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-[#252a33] transition-colors group">
                  <td className="px-6 py-4 font-mono text-orange-500 text-sm">{item.external_id}</td>
                  <td className="px-6 py-4 text-sm">{item.sku || "Sin SKU"}</td>
                  <td className="px-6 py-4 text-sm font-semibold">${item.price.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">{item.stock} u.</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                      item.status === 'active' 
                      ? 'bg-green-900/30 text-green-400 border border-green-500/20' 
                      : 'bg-red-900/30 text-red-400 border border-red-500/20'
                    }`}>
                      {item.status === 'active' ? 'Activo' : item.status}
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