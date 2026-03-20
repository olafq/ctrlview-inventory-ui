"use client";
import { useState } from "react";
import { authService } from "@/app/services/auth";

export default function RegisterPage() {
  const [isAdmin, setIsAdmin] = useState(true); // true = Empresa, false = Empleado
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    company_name: "",
    company_code: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      is_admin: isAdmin,
      company_name: isAdmin ? formData.company_name : null,
      company_code: !isAdmin ? formData.company_code : null
    };
    
    const res = await authService.register(payload);
    if (res.status === "success") {
      alert(isAdmin ? `Empresa creada. Tu código es: ${res.company_code}` : "Empleado registrado");
    } else {
      alert("Error: " + res.detail);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-white flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="bg-[#1a1d23] p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-center text-orange-500">Crear cuenta en Sync</h2>
        
        {/* Selector de Rol */}
        <div className="flex gap-4 mb-6">
          <button 
            type="button"
            onClick={() => setIsAdmin(true)}
            className={`flex-1 py-2 rounded-lg border ${isAdmin ? 'bg-orange-600 border-orange-600' : 'border-gray-600'}`}
          > Empresa </button>
          <button 
            type="button"
            onClick={() => setIsAdmin(false)}
            className={`flex-1 py-2 rounded-lg border ${!isAdmin ? 'bg-orange-600 border-orange-600' : 'border-gray-600'}`}
          > Empleado </button>
        </div>

        <input type="text" placeholder="Nombre completo" className="w-full p-3 mb-4 bg-gray-900 rounded border border-gray-700"
          onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
        
        <input type="email" placeholder="Email" className="w-full p-3 mb-4 bg-gray-900 rounded border border-gray-700"
          onChange={(e) => setFormData({...formData, email: e.target.value})} />

        <input type="password" placeholder="Contraseña" className="w-full p-3 mb-4 bg-gray-900 rounded border border-gray-700"
          onChange={(e) => setFormData({...formData, password: e.target.value})} />

        {isAdmin ? (
          <input type="text" placeholder="Nombre de tu Empresa" className="w-full p-3 mb-6 bg-gray-900 rounded border border-orange-900/30"
            onChange={(e) => setFormData({...formData, company_name: e.target.value})} />
        ) : (
          <input type="text" placeholder="Código de Empresa (pedido a tu admin)" className="w-full p-3 mb-6 bg-gray-900 rounded border border-orange-900/30"
            onChange={(e) => setFormData({...formData, company_code: e.target.value})} />
        )}

        <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 py-3 rounded-lg font-bold transition">
          {isAdmin ? "Registrar Empresa" : "Unirme a Empresa"}
        </button>
      </form>
    </div>
  );
}