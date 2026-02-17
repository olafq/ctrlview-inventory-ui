"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Store,
  Package,
  Truck,
  CreditCard,
} from "lucide-react";

const API_BASE = "https://oauth.goqconsultant.com";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const channelId = 1;

  // =========================
  // Fetch Orders
  // =========================
  const fetchOrders = async () => {
    try {
        const res = await fetch(
          `${API_BASE}/integrations/mercadolibre/orders?channel_id=${channelId}`
        );

        const json = await res.json();

     if (json.data && Array.isArray(json.data)) {
          setOrders(json.data);
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

  // =========================
  // STATUS BADGE STYLE
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

  // =========================
  // CHANNEL STYLE
  // =========================
  const getChannelStyle = (channel: string) => {
    switch (channel) {
      case "mercadolibre":
        return "bg-yellow-100 text-yellow-800";
      case "shopify":
        return "bg-emerald-100 text-emerald-700";
      case "tiendanube":
        return "bg-sky-100 text-sky-700";
      case "amazon":
        return "bg-orange-100 text-orange-700";
      case "pos":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // =========================
  // CHANNEL ICON
  // =========================
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "mercadolibre":
        return <ShoppingCart size={14} className="mr-1" />;
      case "shopify":
        return <Store size={14} className="mr-1" />;
      case "tiendanube":
        return <Package size={14} className="mr-1" />;
      case "amazon":
        return <Truck size={14} className="mr-1" />;
      case "pos":
        return <CreditCard size={14} className="mr-1" />;
      default:
        return <Package size={14} className="mr-1" />;
    }
  };

  // =========================
  // DATE FORMATTER
  // =========================
  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  return (
    <div className="p-8">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          {lastSync && (
            <p className="text-sm text-gray-500 mt-1">
              Last sync: {lastSync}
            </p>
          )}
        </div>

        <button
          onClick={handleSync}
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          {loading ? "Syncing..." : "Sync Orders"}
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b text-gray-700 uppercase text-xs tracking-wider">
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
            {initialLoading && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-400">
                  Loading orders...
                </td>
              </tr>
            )}

            {!initialLoading && orders.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-400">
                  No orders found
                </td>
              </tr>
            )}

            {orders.map((o: any) => (
              <tr
                key={o.id}
                className="border-b last:border-none hover:bg-gray-50 transition"
              >
                <td className="p-4 font-medium">
                  {o.external_order_id}
                </td>

                <td className="p-4 text-gray-500">
                  {o.id}
                </td>

                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getChannelStyle(
                      o.channel
                    )}`}
                  >
                    {getChannelIcon(o.channel)}
                    {o.channel_name || o.channel}
                  </span>
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
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
                  {formatDate(o.ml_last_updated)}
                </td>

                <td className="p-4 text-gray-500">
                  {formatDate(o.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
