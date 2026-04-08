"use client";
import { useState } from "react";
import { authService } from "@/app/services/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  
  // 1. Unificamos a 'email' para que coincida con el Schema del backend
  const [formData, setFormData] = useState({
    email: "", 
    password: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Limpiamos errores previos

    try {
      // 2. Enviamos el JSON (el service ya hace el stringify)
      const res = await authService.login(formData);

      if (res && res.access_token) {
        // 3. Guardamos el token para la sesión
        localStorage.setItem("sync_token", res.access_token);
        
        // 4. Redirigimos al dashboard principal
        router.push("/dashboard"); 
      }
    } catch (error: any) {
      console.error("Error en login:", error);
      // 5. Capturamos el error 422 o 401 del backend
      setError(error.message || "Credenciales incorrectas o error de servidor.");
    } finally {
      // 6. BLOQUE CRÍTICO: Esto destraba el botón de "Iniciando sesión..." 
      // independientemente de si la respuesta fue buena o mala.
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
              disabled={loading} // Bloquea el input mientras carga
              className={`w-full p-3 bg-gray-900 rounded border border-gray-700 focus:border-orange-500 outline-none transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Contraseña</label>
            <input
              type="password"
              required
              disabled={loading}
              className={`w-full p-3 bg-gray-900 rounded border border-gray-700 focus:border-orange-500 outline-none transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {/* Sección de error visible para el usuario */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}

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
            type="button"
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