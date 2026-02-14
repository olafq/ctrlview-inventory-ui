"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [connected, setConnected] = useState<boolean | null>(null);

  const channelId = 1;

  const API_BASE = "https://oauth.goqconsultant.com";

  const checkStatus = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/integrations/mercadolibre/oauth/status?channel_id=${channelId}`
      );
      const data = await res.json();
      setConnected(data.connected);
    } catch (err) {
      console.error(err);
      setConnected(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const connect = () => {
    window.location.href = `${API_BASE}/integrations/mercadolibre/oauth/login?channel_id=${channelId}`;
  };

  const disconnect = async () => {
    try {
      await fetch(
        `${API_BASE}/integrations/mercadolibre/oauth/disconnect?channel_id=${channelId}`,
        {
          method: "POST",
        }
      );

      setConnected(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-lg font-semibold mb-4">
          MercadoLibre Integration
        </h2>

        {connected === null && <p>Cargando...</p>}

        {connected === true && (
          <>
            <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
              MercadoLibre conectado correctamente ✅
            </div>

            <div className="flex gap-3">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded cursor-not-allowed"
                disabled
              >
                Conectado
              </button>

              <button
                onClick={disconnect}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Desconectar
              </button>
            </div>
          </>
        )}

        {connected === false && (
          <>
            <div className="bg-yellow-100 text-yellow-700 p-3 rounded mb-4">
              MercadoLibre no conectado
            </div>

            <button
              onClick={connect}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Conectar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
