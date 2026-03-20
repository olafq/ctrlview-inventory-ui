"use client";

import { useEffect, useState } from "react";

interface ExternalItem {
  id: number;
  product_id: number;
  product_name?: string;
  channel_id: number;
  external_item_id: string;
  external_sku?: string;
  price?: number;
  stock: number;
  status?: string;
  created_at: string;
}


export default function MercadoLibreExternalItems() {
  const [items, setItems] = useState<ExternalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://oauth.goqconsultant.com/integrations/mercadolibre/external-items")
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching items:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-6">Cargando productos...</div>;
  }

  return (
    <div className="overflow-x-auto border border-gray-300 rounded-lg bg-white shadow-sm">
        <table className="min-w-full table-fixed text-sm text-black">
            <thead className="bg-gray-200 border-b border-gray-300">
            <tr>
                <th className="px-4 py-3 text-left w-[180px]">External ID</th>
                <th className="px-4 py-3 text-left w-[220px]">Product</th>
                <th className="px-4 py-3 text-left w-[120px]">SKU</th>
                <th className="px-4 py-3 text-right w-[120px]">Price</th>
                <th className="px-4 py-3 text-center w-[100px]">Stock</th>
                <th className="px-4 py-3 text-center w-[120px]">Status</th>
                <th className="px-4 py-3 text-center w-[120px]">Created</th>
            </tr>
            </thead>

            <tbody>
            {items.map((item) => (
                <tr
                key={item.id}
                className="border-b border-gray-200 hover:bg-gray-100 transition"
                >
                <td className="px-4 py-3 font-medium">
                    {item.external_item_id}
                </td>

                <td className="px-4 py-3">
                    {item.product_name}
                </td>

                <td className="px-4 py-3">
                    {item.external_sku || "-"}
                </td>

                <td className="px-4 py-3 text-right">
                    {item.price ? `$${item.price}` : "-"}
                </td>

                <td className="px-4 py-3 text-center font-semibold">
                    {item.stock}
                </td>

                <td className="px-4 py-3 text-center">
                    <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                        item.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                    >
                    {item.status || "unknown"}
                    </span>
                </td>

                <td className="px-4 py-3 text-center">
                    {new Date(item.created_at).toLocaleDateString()}
                </td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>

  );
}
