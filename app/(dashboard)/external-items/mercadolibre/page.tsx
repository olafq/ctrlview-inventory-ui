"use client";

export default function ExternalItemsPage() {
  // Datos de ejemplo para que la tabla no se vea vacía mientras conectamos la API
  const mockItems = [
    { id: "MLA123", title: "Producto de Prueba ML", price: 1500, stock: 10, status: "active" },
    { id: "MLA456", title: "Item de Ejemplo", price: 2500, stock: 5, status: "paused" },
  ];

  return (
      <div className="p-6 text-white">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100">Ítems Externos</h1>
          <p className="text-gray-400 mt-2">Sincronización directa con Mercado Libre</p>
        </header>

        <div className="bg-[#1a1d23] rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#252a33] text-gray-400 text-sm uppercase">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Título</th>
                <th className="px-6 py-4">Precio</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {mockItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#252a33] transition">
                  <td className="px-6 py-4 font-mono text-orange-500">{item.id}</td>
                  <td className="px-6 py-4">{item.title}</td>
                  <td className="px-6 py-4">${item.price}</td>
                  <td className="px-6 py-4">{item.stock}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                    }`}>
                      {item.status === 'active' ? 'Activo' : 'Pausado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  );
}