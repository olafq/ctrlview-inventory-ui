"use client";

import { useEffect, useState } from "react";

const API_BASE = "https://oauth.goqconsultant.com";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const channelId = 1;

  const fetchOrders = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/integrations/mercadolibre/orders?channel_id=${channelId}`
      );
      const data = await res.json();
      setOrders(data || []);
    } catch (err) {
      console.error("Error loading orders:", err);
      setOrders([]);
    }
  };

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

  // =========================
  // Status Badge Colors
  // =========================
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "cancelled":
      case "refunded":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getChannelStyle = (channel: string) => {
    switch (channel) {
      case "mercadolibre":
        return "bg-blue-100 text-blue-700";
      case "shopify":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

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

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b text-sm text-gray-600 uppercase">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Internal ID</th>
              <th className="p-4">Channel</th>
              <th className="p-4">Status</th>
              <th className="p-4">Total</th>
              <th className="p-4">Currency</th>
              <th className="p-4">Last Updated</th>
              <th className="p-4">Created</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            )}

            {orders.map((o: any) => (
              <tr
                key={o.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-4 font-medium">
                  {o.external_order_id}
                </td>

                <td className="p-4 text-gray-500">
                  {o.id}
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getChannelStyle(
                      "mercadolibre"
                    )}`}
                  >
                    Mercado Libre
                  </span>
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                      o.status
                    )}`}
                  >
                    {o.status}
                  </span>
                </td>

                <td className="p-4 font-semibold">
                  ${o.total_amount}
                </td>

                <td className="p-4">
                  {o.currency}
                </td>

                <td className="p-4 text-gray-500">
                  {o.ml_last_updated
                    ? new Date(o.ml_last_updated).toLocaleString()
                    : "-"}
                </td>

                <td className="p-4 text-gray-500">
                  {o.created_at
                    ? new Date(o.created_at).toLocaleString()
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
