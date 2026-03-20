export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Products</p>
          <p className="text-2xl font-bold">—</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">External Items</p>
          <p className="text-2xl font-bold">—</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Channels</p>
          <p className="text-2xl font-bold">—</p>
        </div>
      </div>
    </div>
  );
}
