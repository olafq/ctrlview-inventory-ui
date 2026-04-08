"use client";
import { useState } from "react";
import { authService } from "@/app/services/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: "", 
    password: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(""); 

    try {
      // 1. Llamada al servicio de autenticación
      const res = await authService.login(formData);

      if (res && res.access_token) {
        // 2. Guardamos el token de acceso
        localStorage.setItem("sync_token", res.access_token);
        
        // 3. GUARDADO CRÍTICO: Guardamos los datos del usuario (Tenant ID y Canales)
        // Esto es lo que permite que el inventario no se resetee a ID: 1
        if (res.user) {
          localStorage.setItem("user_session", JSON.stringify(res.user));
        }
        
        // 4. Redirigimos al dashboard
        router.push("/dashboard"); 
      } else {
        setError("La respuesta del servidor no contiene datos de acceso.");
      }
    } catch (error: any) {
      console.error("Error en login:", error);
      setError(error.message || "Credenciales incorrectas o error de servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-white flex items-center justify-center p-6">
      <div className="bg-[#1a1d23] p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-800">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-orange-500 italic tracking-tighter">IDENTITY_OS</h2>
          <p className="text-gray-400 mt-2 text-xs uppercase tracking-[0.2em]">Ingresa a tu panel de control</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Email_Address</label>
            <input
              type="email"
              required
              disabled={loading}
              className={`w-full p-3 bg-black/40 rounded-lg border border-white/5 focus:border-orange-500 outline-none transition font-mono text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="admin@identity.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Access_Key</label>
            <input
              type="password"
              required
              disabled={loading}
              className={`w-full p-3 bg-black/40 rounded-lg border border-white/5 focus:border-orange-500 outline-none transition font-mono text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-[10px] p-3 rounded-lg text-center font-bold uppercase tracking-widest">
              Error: {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.3em] transition-all active:scale-95 ${
              loading 
                ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                : "bg-white text-black hover:bg-orange-500 hover:text-white"
            }`}
          >
            {loading ? "Authenticating..." : "Establish_Connection"}
          </button>
        </form>

        <div className="mt-8 text-center text-[10px] uppercase tracking-widest">
          <span className="text-gray-600">¿No tienes cuenta? </span>
          <button 
            type="button"
            onClick={() => router.push("/auth/register")}
            className="text-orange-500 hover:underline font-bold"
          >
            Regístrate_aquí
          </button>
        </div>
      </div>
    </div>
  );
}