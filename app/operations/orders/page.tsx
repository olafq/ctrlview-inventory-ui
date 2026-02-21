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
  const channelId = 1;

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, offset: 0, limit: 50 });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // =========================
  // Build Query
  // =========================
  const buildQuery = () => {
    const params = new URLSearchParams();
    params.append("channel_id", channelId.toString());
    params.append("offset", meta.offset.toString());
    params.append("limit", meta.limit.toString());

    if (status) params.append("status", status);
    if (search) params.append("order_id", search);
    if (dateFrom) params.append("date_from", dateFrom);
    if (dateTo) params.append("date_to", dateTo);

    return params.toString();
  };

  // =========================
  // Fetch Orders
  // =========================
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE}/integrations/mercadolibre/orders?${buildQuery()}`,
        { cache: "no-store" }
      );

      if (!res.ok) throw new Error("Failed to fetch orders");

      const json = await res.json();

      setOrders(json.data || []);
      setMeta(json.meta || { total: 0, offset: 0, limit: 50 });
    } catch (err) {
      console.error("Error loading orders:", err);
      setOrders([]);
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [meta.offset]);

  // =========================
  // Sync Orders
  // =========================
  const handleSync = async () => {
    try {
      setLoading(true);

      await fetch(
        `${API_BASE}/integrations/mercadolibre/orders/sync?channel_id=${channelId}`,
        { method: "POST" }
      );

      await fetchOrders();
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Pagination
  // =========================
  const nextPage = () => {
    if (meta.offset + meta.limit < meta.total) {
      setMeta({ ...meta, offset: meta.offset + meta.limit });
    }
  };

  const prevPage = () => {
    if (meta.offset - meta.limit >= 0) {
      setMeta({ ...meta, offset: meta.offset - meta.limit });
    }
  };

  // =========================
  // Reset Filters
  // =========================
  const resetFilters = async () => {
    setSearch("");
    setStatus("");
    setDateFrom("");
    setDateTo("");

    const newMeta = { ...meta, offset: 0 };
    setMeta(newMeta);

    setTimeout(() => {
      fetchOrders();
    }, 0);
  };

  // =========================
  // Styles
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

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  const start = meta.total === 0 ? 0 : meta.offset + 1;
  const end = Math.min(meta.offset + meta.limit, meta.total);

  return (
    <div className="p-8">

      {/* HEADER + SYNC */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>

        <button
          onClick={handleSync}
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          {loading ? "Syncing..." : "Sync Orders"}
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search Order ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-md text-sm"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border px-3 py-2 rounded-md text-sm"
        >
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>

        <input
          type="datetime-local"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="border px-3 py-2 rounded-md text-sm"
        />

        <input
          type="datetime-local"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="border px-3 py-2 rounded-md text-sm"
        />

        <button
          onClick={() => {
            setMeta({ ...meta, offset: 0 });
            fetchOrders();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
        >
          Apply
        </button>

        <button
          onClick={resetFilters}
          className="bg-gray-200 px-4 py-2 rounded-md text-sm"
        >
          Reset
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
            {initialLoading ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-400">
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-400">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((o: any) => (
                <tr key={o.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{o.external_order_id}</td>
                  <td className="p-4 text-gray-500">{o.id}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getChannelStyle(
                        o.channel
                      )}`}
                    >
                      {getChannelIcon(o.channel)}
                      {o.channel_name}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                        o.status
                      )}`}
                    >
                      {o.status || "—"}
                    </span>
                  </td>
                  <td className="p-4 font-semibold">${o.total_amount}</td>
                  <td className="p-4">{o.currency}</td>
                  <td className="p-4 text-gray-500">
                    {formatDate(o.ml_last_updated)}
                  </td>
                  <td className="p-4 text-gray-500">
                    {formatDate(o.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-6 text-sm">
        <div>
          Showing {start}–{end} of {meta.total}
        </div>

        <div className="flex gap-2">
          <button
            onClick={prevPage}
            disabled={meta.offset === 0}
            className="px-4 py-2 border rounded disabled:opacity-40"
          >
            Previous
          </button>
          <button
            onClick={nextPage}
            disabled={meta.offset + meta.limit >= meta.total}
            className="px-4 py-2 border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
}