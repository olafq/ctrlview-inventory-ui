"use client";

import "./globals.css";
import Link from "next/link";
import { useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [openExternal, setOpenExternal] = useState(false);

  return (
    <html lang="es">
      <body className="h-screen overflow-hidden">
        <div className="flex h-full">

          {/* SIDEBAR */}
          <aside className="w-64 bg-gray-900 text-white flex flex-col">
            <div className="p-4 text-xl font-bold border-b border-gray-700">
              CtrlView
            </div>

            <nav className="flex-1 p-4 space-y-2">

              <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-800">
                📊 Dashboard
              </button>

              <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-800">
                📦 Products
              </button>

              {/* 🔽 External Items Dropdown */}
              <div>
                <button
                  onClick={() => setOpenExternal(!openExternal)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-800 flex justify-between items-center"
                >
                  🔗 External Items
                  <span className="text-xs">
                    {openExternal ? "▾" : "▸"}
                  </span>
                </button>

                {openExternal && (
                  <div className="ml-4 mt-1 space-y-1">
                    <Link href="/external-items/mercadolibre">
                      <div className="px-3 py-2 rounded hover:bg-gray-800 cursor-pointer text-sm">
                        Mercado Libre
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-800">
                ⬇️ Imports
              </button>

              <Link href="/settings">
                <div className="w-full text-left px-3 py-2 rounded hover:bg-gray-800 cursor-pointer">
                  ⚙️ Settings
                </div>
              </Link>

            </nav>
          </aside>

          {/* MAIN CONTENT */}
          <div className="flex-1 flex flex-col bg-gray-100">

            {/* HEADER */}
            <header className="h-14 bg-white border-b flex items-center px-6">
              <span className="text-sm text-gray-600">
                Inventory Management
              </span>
            </header>

            {/* PAGE CONTENT */}
            <main className="flex-1 p-6 overflow-auto">
              {children}
            </main>
          </div>

        </div>
      </body>
    </html>
  );
}
