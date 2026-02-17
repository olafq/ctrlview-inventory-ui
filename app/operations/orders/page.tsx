"use client";

import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("https://oauth.goqconsultant.com/sales?channel_id=1")
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      <table className="w-full border">
        <thead>
          <tr className="border-b">
            <th>ID</th>
            <th>Status</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o: any) => (
            <tr key={o.id} className="border-b">
              <td>{o.external_order_id}</td>
              <td>{o.status}</td>
              <td>{o.total_amount} {o.currency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
