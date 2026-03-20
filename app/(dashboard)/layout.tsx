"use client";

import "./globals.css";
import Link from "next/link";
import { useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [channelsOpen, setChannelsOpen] = useState(false);
  const [operationsOpen, setOperationsOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  return (
    <html lang="es">
      <body className="h-screen overflow-hidden">
        <div className="flex h-full">

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
                🔗 Channels
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
            </nav>
          </aside>

          {/* MAIN */}
          <div className="flex-1 flex flex-col bg-gray-100 w-full">

            {/* HEADER */}
            <header className="h-14 bg-white border-b flex items-center px-4 md:px-6 justify-between">

              {/* Mobile menu button */}
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
            <main className="flex-1 p-4 md:p-6 overflow-auto">
              {children}
            </main>
          </div>

        </div>
      </body>
    </html>
  );
}
