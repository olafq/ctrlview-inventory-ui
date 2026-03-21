"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/app/services/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(true); // true = Empresa, false = Empleado
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    company_name: "",
    company_code: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Construimos el payload dinámicamente para evitar enviar campos nulos
    // que rompen la validación de Pydantic en el backend.
    const payload: any = {
      email: formData.email,
      password: formData.password,
      full_name: formData.full_name,
      is_admin: isAdmin,
    };

    if (isAdmin) {
      payload.company_name = formData.company_name;
    } else {
      payload.company_code = formData.company_code;
    }
    
    try {
      // 2. Llamada al servicio (asegurarse que auth.ts tenga la "/" final)
      const res = await authService.register(payload);
      
      if (res.status === "success") {
        if (isAdmin) {
          alert(`¡Empresa creada con éxito! Tu código de vinculación es: ${res.company_code}. Guardalo para tus empleados.`);
        } else {
          alert("Registro exitoso como empleado.");
        }
        
        // Redirección al Login
        router.push("/auth/login");
      } else {
        alert("Error: " + (res.detail || "No se pudo completar el registro"));
      }
    } catch (error: any) {
      console.error("Error en registro:", error);
      // Mostramos el mensaje de error específico que viene del backend
      alert(error.message || "Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-white flex items-center justify-center p-6">
      <form 
        onSubmit={handleSubmit} 
        className="bg-[#1a1d23] p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-800"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-orange-500">Crear cuenta en Sync</h2>
        
        {/* Selector de Rol */}
        <div className="flex gap-4 mb-6">
          <button 
            type="button"
            onClick={() => setIsAdmin(true)}
            className={`flex-1 py-2 rounded-lg border transition-all ${isAdmin ? 'bg-orange-600 border-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.4)]' : 'border-gray-600 text-gray-400'}`}
          > Empresa </button>
          <button 
            type="button"
            onClick={() => setIsAdmin(false)}
            className={`flex-1 py-2 rounded-lg border transition-all ${!isAdmin ? 'bg-orange-600 border-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.4)]' : 'border-gray-600 text-gray-400'}`}
          > Empleado </button>
        </div>

        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Nombre completo" 
            required
            className="w-full p-3 bg-gray-900 rounded border border-gray-700 focus:border-orange-500 outline-none transition"
            onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
          />
          
          <input 
            type="email" 
            placeholder="Email" 
            required
            className="w-full p-3 bg-gray-900 rounded border border-gray-700 focus:border-orange-500 outline-none transition"
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
          />

          <input 
            type="password" 
            placeholder="Contraseña" 
            required
            className="w-full p-3 bg-gray-900 rounded border border-gray-700 focus:border-orange-500 outline-none transition"
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
          />

          {isAdmin ? (
            <input 
              type="text" 
              placeholder="Nombre de tu Empresa" 
              required
              className="w-full p-3 bg-gray-900 rounded border border-orange-900/30 focus:border-orange-500 outline-none transition"
              onChange={(e) => setFormData({...formData, company_name: e.target.value})} 
            />
          ) : (
            <input 
              type="text" 
              placeholder="Código de Empresa (proporcionado por tu admin)" 
              required
              className="w-full p-3 bg-gray-900 rounded border border-orange-900/30 focus:border-orange-500 outline-none transition"
              onChange={(e) => setFormData({...formData, company_code: e.target.value})} 
            />
          )}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full mt-8 bg-orange-600 hover:bg-orange-700 py-3 rounded-lg font-bold transition-all transform active:scale-[0.98] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? "Registrando..." : (isAdmin ? "Registrar Empresa" : "Unirme a Empresa")}
        </button>

        <p className="text-center mt-6 text-sm text-gray-400">
          ¿Ya tienes cuenta?{" "}
          <button 
            type="button"
            onClick={() => router.push("/auth/login")}
            className="text-orange-500 hover:underline"
          >
            Inicia sesión
          </button>
        </p>
      </form>
    </div>
  );
}