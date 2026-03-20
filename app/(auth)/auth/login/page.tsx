"use client";
import { useState } from "react";
import { authService } from "@/app/services/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "", // FastAPI espera 'username' para el OAuth2
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // El login usa URLSearchParams porque el backend usa OAuth2PasswordRequestForm
      const res = await authService.login(formData);

      if (res.access_token) {
        // 1. Guardamos el token en localStorage para persistencia
        localStorage.setItem("sync_token", res.access_token);
        
        // 2. Redirigimos al dashboard principal
        router.push("/operations/orders"); // O la ruta que prefieras de inicio
      } else {
        alert("Credenciales incorrectas: " + (res.detail || "Error desconocido"));
      }
    } catch (error) {
      console.error("Error en login:", error);
      alert("Error al conectar con el servidor.");
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
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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