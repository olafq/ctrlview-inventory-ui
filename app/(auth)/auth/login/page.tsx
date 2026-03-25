"use client";
import { useState } from "react";
import { authService } from "@/app/services/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  
  // 1. Cambiamos 'username' por 'email' para que coincida con el Schema
  const [formData, setFormData] = useState({
    email: "", 
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 2. Enviamos el JSON (tu service ya se encarga de hacer el stringify)
      const res = await authService.login(formData);

      if (res.access_token) {
        localStorage.setItem("sync_token", res.access_token);
        
        // 3. Redirigimos (Asegurate de que esta ruta exista)
        router.push("/dashboard"); 
      }
    } catch (error: any) {
      console.error("Error en login:", error);
      // Mostramos el error real que viene del backend
      alert(error.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-white flex items-center justify-center p-6">
      <div className="bg-[#1a1d23] p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-800">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-orange-500">Sync App</h2>
          <p className="text-gray-400 mt-2">Ingresa a tu panel de control</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full p-3 bg-gray-900 rounded border border-gray-700 focus:border-orange-500 outline-none transition"
              placeholder="tu@email.com"
              // 4. Actualizamos el campo 'email'
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Contraseña</label>
            <input
              type="password"
              required
              className="w-full p-3 bg-gray-900 rounded border border-gray-700 focus:border-orange-500 outline-none transition"
              placeholder="••••••••"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-lg transition ${
              loading ? "bg-gray-600 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"
            }`}
          >
            {loading ? "Iniciando sesión..." : "Entrar"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-400">¿No tienes cuenta? </span>
          <button 
            onClick={() => router.push("/auth/register")}
            className="text-orange-500 hover:underline font-medium"
          >
            Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  );
}