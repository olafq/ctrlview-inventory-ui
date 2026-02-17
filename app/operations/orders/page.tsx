"use client";

import { useEffect, useState } from "react";

const API_BASE = "https://oauth.goqconsultant.com";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const channelId = 1;

  // =========================
  // Fetch Sales desde DB
  // =========================
  const fetchOrders = async () => {
    try {
        const res = await fetch(
        `${API_BASE}/integrations/mercadolibre/orders?channel_id=${channelId}`
        );

        const data = await res.json();

        if (Array.isArray(data)) {
        setOrders(data);
        } else {
        setOrders([]);
        }
    } catch (err) {
        console.error("Error loading orders:", err);
        setOrders([]);
    }
  };

  // =========================
  // Sync Orders
  // =========================
  const handleSync = async () => {
    setLoading(true);

    try {
      await fetch(
        `${API_BASE}/integrations/mercadolibre/orders/sync?channel_id=${channelId}`,
        { method: "POST" }
      );

      setLastSync(new Date().toLocaleString());

      await fetchOrders();
    } catch (err) {
      console.error("Sync failed:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          {lastSync && (
            <p className="text-sm text-gray-500">
              Last sync: {lastSync}
            </p>
          )}
        </div>

        <button
          onClick={handleSync}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Syncing..." : "Sync Orders"}
        </button>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total</th>
              <th className="p-3">Currency</th>
              <th className="p-3">Last Updated</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            )}

            {orders.map((o: any) => (
              <tr key={o.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{o.id}</td>
                <td className="p-3 capitalize">{o.status}</td>
                <td className="p-3">{o.total_amount}</td>
                <td className="p-3">{o.currency_id}</td>
                <td className="p-3">
                  {o.date_last_updated
                    ? new Date(o.date_last_updated).toLocaleString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
