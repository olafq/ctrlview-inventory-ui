"use client";

import { useEffect, useState } from "react";

interface ImportStatus {
  status: string;
  inserted: number;
  updated: number;
}

export default function MercadoLibrePage() {
  const [items, setItems] = useState([]);
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // IDs de ejemplo (deberían venir de tu AuthContext o Params)
  const tenant_id = 1;
  const channel_id = 1;

  const fetchData = async () => {
    try {
      // 1. Traer productos
      const itemsRes = await fetch(`https://ctrlviewinventory.onrender.com/integrations/mercadolibre/items?tenant_id=${tenant_id}&channel_id=${channel_id}`);
      const itemsData = await itemsRes.json();
      setItems(itemsData);

      // 2. Traer estado de la importación
      const statusRes = await fetch(`https://ctrlviewinventory.onrender.com/integrations/mercadolibre/import/latest?tenant_id=${tenant_id}&channel_id=${channel_id}`);
      const statusData = await statusRes.json();
      setImportStatus(statusData);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Si está importando, hacemos un refresh cada 5 segundos
    let interval: any;
    if (importStatus?.status === "pending" || importStatus?.status === "queued") {
      interval = setInterval(fetchData, 5000);
    }
    return () => clearInterval(interval);
  }, [importStatus?.status]);

  return (
    <div className="p-6 space-y-4">
      {/* BANNER DE SINCRONIZACIÓN */}
      {(importStatus?.status === "pending" || importStatus?.status === "queued") && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 animate-pulse">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700 font-medium">
                Sincronizando con Mercado Libre...
                <span className="ml-2 text-xs font-normal">
                  ({importStatus.inserted} productos procesados)
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TABLA DE PRODUCTOS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-800">Inventario Mercado Libre</h2>
          <span className="text-xs text-gray-400">Canal ID: {channel_id}</span>
        </div>
        
        {loading ? (
          <div className="p-10 text-center text-gray-400">Cargando...</div>
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
                  <td className="px-6 py-4 font-mono text-xs text-blue-600">{item.external_id}</td>
                  <td className="px-6 py-4 font-medium text-gray-700">{item.sku || "N/A"}</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">${item.price.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center font-semibold">{item.stock}</td>
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
            <p className="text-gray-400 italic">No hay productos vinculados aún.</p>
          </div>
        )}
      </div>
    </div>
  );
}