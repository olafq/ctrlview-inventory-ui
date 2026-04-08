"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from 'next/navigation';

function MercadoLibreInventoryContent() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  const [context, setContext] = useState<{ tid: string | null; cid: string | null }>({
    tid: null,
    cid: null
  });

  // FUNCIÓN PARA RECUPERAR IDENTIDAD DESDE EL TOKEN
  const resolveIdentity = useCallback(async () => {
    try {
      const token = localStorage.getItem("sync_token");
      if (!token) {
        setErrorInfo("No hay token de acceso. Por favor, inicia sesión.");
        return;
      }

      // 1. Consultamos al backend quién es este usuario usando el token
      const res = await fetch("https://api.mecca-bot-recepcion.com/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Error al validar identidad");

      const userData = await res.json();
      
      // 2. Buscamos el canal de Mercado Libre
      const mlChannel = userData.channels?.find((c: any) => c.type === 'mercadolibre')?.id;
      
      if (userData.tenant_id && mlChannel) {
        setContext({ 
          tid: userData.tenant_id.toString(), 
          cid: mlChannel.toString() 
        });
        // Opcional: Guardamos en caché para la próxima
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
    // Si tenemos IDs en la URL, los usamos. Si no, resolvemos identidad.
    const urlTid = searchParams.get('tenant_id');
    const urlCid = searchParams.get('channel_id');

    if (urlTid && urlCid) {
      setContext({ tid: urlTid, cid: urlCid });
    } else {
      resolveIdentity();
    }
  }, [searchParams, resolveIdentity]);

  // CARGA DE PRODUCTOS
  const fetchData = useCallback(async () => {
    const { tid, cid } = context;
    if (!tid || !cid) return;

    setLoading(true);
    try {
      const response = await fetch(`https://api.mecca-bot-recepcion.com/integrations/mercadolibre/items?tenant_id=${tid}&channel_id=${cid}`);
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

  // UI DE ERROR
  if (errorInfo) {
    return (
      <div className="p-20 text-center bg-[#0f1115] min-h-screen">
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl inline-block">
          <p className="text-red-500 font-mono text-xs uppercase tracking-widest">{errorInfo}</p>
          <button onClick={() => window.location.href = '/auth/login'} className="mt-4 text-[10px] bg-white text-black px-4 py-2 rounded-lg font-bold uppercase">Volver al Login</button>
        </div>
      </div>
    );
  }

  // UI DE CARGA
  if (!context.tid || !context.cid) {
    return (
      <div className="p-20 text-center bg-[#0f1115] min-h-screen text-gray-500 font-mono text-xs animate-pulse tracking-[0.3em]">
        VERIFICANDO_SISTEMA_DE_IDENTIDAD...
      </div>
    );
  }

  return (
    <div className="p-10 bg-[#0f1115] min-h-screen text-white">
      <header className="mb-12 border-b border-white/5 pb-8">
        <h1 className="text-5xl font-black italic tracking-tighter text-orange-500">Meli_Inventory</h1>
        <div className="flex gap-4 mt-2">
          <span className="text-[9px] font-mono text-gray-500">TENANT_{context.tid}</span>
          <span className="text-[9px] font-mono text-gray-500">CHANNEL_{context.cid}</span>
        </div>
      </header>

      <div className="bg-[#161920] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-32 text-center text-gray-700 font-black italic tracking-widest animate-pulse">EXTRACTING_DATA...</div>
        ) : items.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em] bg-white/5">
                <th className="px-10 py-6">External_ID</th>
                <th className="px-10 py-6 text-right">Price</th>
                <th className="px-10 py-6 text-center">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((item: any) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-10 py-5 font-mono text-xs text-gray-500 group-hover:text-orange-500">{item.external_item_id}</td>
                  <td className="px-10 py-5 text-right font-black text-white italic">${item.price?.toLocaleString()}</td>
                  <td className="px-10 py-5 text-center text-gray-400 font-mono">{item.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-32 text-center text-gray-600 font-bold uppercase tracking-widest italic">
            No se detectaron productos en este canal.
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