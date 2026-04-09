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
  
  // Estado para controlar la visibilidad del modal de confirmación
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const router = useRouter();

  // Función que ejecuta el cierre definitivo
  const handleLogout = () => {
    localStorage.removeItem("sync_token"); 
    setOpen(false); 
    setShowLogoutConfirm(false); // Cerramos el modal
    router.push("/auth/login");
  };

  return (
    <html lang="es">
      <body className="h-screen overflow-hidden">
        <div className="flex h-full relative">

          {/* VENTANA DE CONFIRMACIÓN (MODAL) */}
          {showLogoutConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-center">
              <div className="bg-[#11141b] border border-gray-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚪</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">¿Cerrar sesión?</h3>
                <p className="text-gray-400 mb-8 text-sm">
                  Perderás el acceso a tu panel de control hasta que vuelvas a ingresar.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98]"
                  >
                    Sí, cerrar sesión
                  </button>
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="w-full bg-transparent hover:bg-gray-800 text-gray-400 py-3 rounded-xl transition-all"
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
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setOpen(false)}
            />
          )}

          {/* SIDEBAR */}
          <aside
            className={`
              fixed md:relative z-50
              w-64 bg-gray-900 text-white flex flex-col
              h-full transition-transform duration-300
              ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}
          >
            <div className="p-4 text-xl font-bold border-b border-gray-700">
              CtrlView
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-auto">
              <Link href="/">
                <div className="px-3 py-2 rounded hover:bg-gray-800 cursor-pointer">
                  📊 Dashboard
                </div>
              </Link>

              {/* OPERATIONS */}
              <div
                onClick={() => setOperationsOpen(!operationsOpen)}
                className="px-3 py-2 rounded hover:bg-gray-800 cursor-pointer flex justify-between"
              >
                ⚙️ Operations
                <span>{operationsOpen ? "▾" : "▸"}</span>
              </div>

              {operationsOpen && (
                <div className="ml-4 space-y-1 text-sm text-gray-300">
                  <Link href="/operations/orders">
                    <div className="px-3 py-2 hover:bg-gray-800 rounded cursor-pointer">
                      Orders
                    </div>
                  </Link>
                  <Link href="/operations/returns">
                    <div className="px-3 py-2 hover:bg-gray-800 rounded cursor-pointer">
                      Returns
                    </div>
                  </Link>
                  <Link href="/operations/messages">
                    <div className="px-3 py-2 hover:bg-gray-800 rounded cursor-pointer">
                      Messages
                    </div>
                  </Link>
                </div>
              )}

              {/* INVENTORY */}
              <Link href="/inventory">
                <div className="px-3 py-2 rounded hover:bg-gray-800 cursor-pointer">
                  📦 Inventory
                </div>
              </Link>

              {/* CHANNELS */}
              <div
                onClick={() => setChannelsOpen(!channelsOpen)}
                className="px-3 py-2 rounded hover:bg-gray-800 cursor-pointer flex justify-between"
              >
                🔗 Inventory for channels
                <span>{channelsOpen ? "▾" : "▸"}</span>
              </div>

              {channelsOpen && (
                <div className="ml-4 space-y-1 text-sm text-gray-300">
                  <Link href="/channels/mercadolibre">
                    <div className="px-3 py-2 hover:bg-gray-800 rounded cursor-pointer">
                      Mercado Libre
                    </div>
                  </Link>
                  <Link href="/channels/shopify">
                    <div className="px-3 py-2 hover:bg-gray-800 rounded cursor-pointer">
                      Shopify
                    </div>
                  </Link>
                  <Link href="/channels/tiendanube">
                    <div className="px-3 py-2 hover:bg-gray-800 rounded cursor-pointer">
                      Tienda Nube
                    </div>
                  </Link>
                  <Link href="/channels/amazon">
                    <div className="px-3 py-2 hover:bg-gray-800 rounded cursor-pointer">
                      Amazon
                    </div>
                  </Link>
                </div>
              )}

              {/* ANALYTICS */}
              <div
                onClick={() => setAnalyticsOpen(!analyticsOpen)}
                className="px-3 py-2 rounded hover:bg-gray-800 cursor-pointer flex justify-between"
              >
                📈 Analytics
                <span>{analyticsOpen ? "▾" : "▸"}</span>
              </div>

              {analyticsOpen && (
                <div className="ml-4 space-y-1 text-sm text-gray-300">
                  <Link href="/analytics/sales">
                    <div className="px-3 py-2 hover:bg-gray-800 rounded cursor-pointer">
                      Sales
                    </div>
                  </Link>
                  <Link href="/analytics/finance">
                    <div className="px-3 py-2 hover:bg-gray-800 rounded cursor-pointer">
                      Finance
                    </div>
                  </Link>
                  <Link href="/analytics/performance">
                    <div className="px-3 py-2 hover:bg-gray-800 rounded cursor-pointer">
                      Performance
                    </div>
                  </Link>
                </div>
              )}

              <Link href="/automation">
                <div className="px-3 py-2 rounded hover:bg-gray-800 cursor-pointer">
                  🤖 Automation
                </div>
              </Link>

              <Link href="/settings">
                <div className="px-3 py-2 rounded hover:bg-gray-800 cursor-pointer">
                  ⚙️ Settings
                </div>
              </Link>

              {/* SEPARADOR VISUAL Y BOTÓN DE DISPARO */}
              <div className="pt-4 border-t border-gray-700 mt-4">
                <button
                  onClick={() => setShowLogoutConfirm(true)} // Cambiado para abrir el modal
                  className="w-full text-left px-3 py-2 rounded text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2"
                >
                  🚪 Cerrar Sesión
                </button>
              </div>
            </nav>
          </aside>

          {/* MAIN */}
          <div className="flex-1 flex flex-col bg-gray-100 w-full">

            {/* HEADER */}
            <header className="h-14 bg-white border-b flex items-center px-4 md:px-6 justify-between">
              <button
                className="md:hidden text-gray-700"
                onClick={() => setOpen(true)}
              >
                ☰
              </button>
              <span className="text-sm text-gray-600">
                Inventory Management
              </span>
            </header>

            {/* CONTENT */}
            <main className="flex-1 p-4 md:p-6 overflow-auto text-gray-900">
              {children}
            </main>
          </div>

        </div>
      </body>
    </html>
  );
}