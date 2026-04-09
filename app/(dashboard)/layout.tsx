"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation"; 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [channelsOpen, setChannelsOpen] = useState(false);
  const [operationsOpen, setOperationsOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  
  // Estado para el modal de cierre de sesión
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("sync_token"); 
    setOpen(false); 
    setShowLogoutConfirm(false);
    router.push("/auth/login");
  };

  return (
    <html lang="es">
      <body className="h-screen overflow-hidden bg-[#090a0c] text-white">
        <div className="flex h-full relative">

          {/* VENTANA DE CONFIRMACIÓN (MODAL) */}
          {showLogoutConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 text-center">
              <div className="bg-[#11141b] border border-white/5 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  🚪
                </div>
                <h3 className="text-xl font-black text-white mb-2 italic uppercase tracking-tighter">¿Cerrar sesión?</h3>
                <p className="text-gray-500 mb-8 text-[10px] font-mono uppercase tracking-widest leading-relaxed">
                  Perderás el acceso a tu panel operativo hasta que vuelvas a autenticarte.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl transition-all active:scale-[0.98] uppercase text-[10px] tracking-widest"
                  >
                    Confirmar Salida
                  </button>
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="w-full bg-white/5 hover:bg-white/10 text-gray-400 py-4 rounded-xl transition-all uppercase text-[10px] tracking-widest"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Overlay mobile */}
          {open && (
            <div
              className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
          )}

          {/* SIDEBAR */}
          <aside
            className={`
              fixed md:relative z-50
              w-64 bg-[#0d0f14] text-white flex flex-col
              h-full transition-transform duration-300 border-r border-white/5
              ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}
          >
            <div className="p-8 text-2xl font-black italic tracking-tighter border-b border-white/5 uppercase">
              Ctrl<span className="text-orange-500">View</span>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-auto font-mono text-[11px] uppercase tracking-widest text-gray-400">
              <Link href="/">
                <div className="px-4 py-3 rounded-xl hover:bg-white/5 hover:text-white cursor-pointer transition-all italic flex items-center gap-3">
                  <span>📊</span> Dashboard
                </div>
              </Link>

              {/* OPERATIONS */}
              <div
                onClick={() => setOperationsOpen(!operationsOpen)}
                className="px-4 py-3 rounded-xl hover:bg-white/5 hover:text-white cursor-pointer flex justify-between items-center transition-all italic"
              >
                <span className="flex items-center gap-3">⚙️ Operations</span>
                <span className="text-[8px]">{operationsOpen ? "▼" : "▶"}</span>
              </div>

              {operationsOpen && (
                <div className="ml-6 space-y-1 border-l border-white/5 pl-4 animate-in slide-in-from-left-2 duration-200">
                  <Link href="/operations/orders">
                    <div className="py-2 hover:text-orange-500 cursor-pointer transition-colors">Orders</div>
                  </Link>
                  <Link href="/operations/returns">
                    <div className="py-2 hover:text-orange-500 cursor-pointer transition-colors">Returns</div>
                  </Link>
                </div>
              )}

              {/* INVENTORY */}
              <Link href="/inventory">
                <div className="px-4 py-3 rounded-xl hover:bg-white/5 hover:text-white cursor-pointer transition-all italic flex items-center gap-3">
                  <span>📦</span> Inventory
                </div>
              </Link>

              {/* CHANNELS */}
              <div
                onClick={() => setChannelsOpen(!channelsOpen)}
                className={`px-4 py-3 rounded-xl hover:bg-white/5 hover:text-white cursor-pointer flex justify-between items-center transition-all italic ${channelsOpen ? 'text-orange-500 bg-orange-500/5' : ''}`}
              >
                <span className="flex items-center gap-3">🔗 Channels</span>
                <span className="text-[8px]">{channelsOpen ? "▼" : "▶"}</span>
              </div>

              {channelsOpen && (
                <div className="ml-6 space-y-1 border-l border-white/5 pl-4 animate-in slide-in-from-left-2 duration-200">
                  <Link href="/channels/mercadolibre">
                    <div className="py-2 hover:text-white text-gray-300 cursor-pointer transition-colors">Mercado Libre</div>
                  </Link>
                  <Link href="/channels/shopify">
                    <div className="py-2 hover:text-white text-gray-300 cursor-pointer transition-colors">Shopify</div>
                  </Link>
                </div>
              )}

              <Link href="/settings">
                <div className="px-4 py-3 rounded-xl hover:bg-white/5 hover:text-white cursor-pointer transition-all italic flex items-center gap-3">
                  <span>🛠️</span> Settings
                </div>
              </Link>

              {/* BOTÓN DE CERRAR SESIÓN */}
              <div className="pt-4 border-t border-white/5 mt-4">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full text-left px-4 py-3 rounded-xl text-red-500/60 hover:bg-red-500/10 hover:text-red-500 transition-all italic flex items-center gap-3"
                >
                  <span>🚪</span> Cerrar Sesión
                </button>
              </div>
            </nav>
          </aside>

          {/* MAIN WRAPPER */}
          <div className="flex-1 flex flex-col bg-[#090a0c] w-full h-full overflow-hidden">

            {/* HEADER */}
            <header className="h-16 bg-[#090a0c] border-b border-white/5 flex items-center px-8 justify-between shrink-0">
              <button
                className="md:hidden text-white text-2xl"
                onClick={() => setOpen(true)}
              >
                ☰
              </button>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.4em] italic">
                  System_Status: <span className="text-green-500 animate-pulse">Online</span>
                </span>
              </div>
            </header>

            {/* ÁREA DE CONTENIDO */}
            <main className="flex-1 overflow-auto bg-[#090a0c]">
              {children}
            </main>
          </div>

        </div>
      </body>
    </html>
  );
}