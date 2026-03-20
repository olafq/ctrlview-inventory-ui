"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Verificamos si existe el token de Sync App en el navegador
    const token = localStorage.getItem("sync_token");
    
    if (!token) {
      // Si no hay token, el usuario debe iniciar sesión o registrarse
      router.push("/auth/login");
    } else {
      // Si hay token, lo mandamos a la página interna.
      // Podés crear 'app/dashboard/page.tsx' y pegar ahí lo que tenías antes.
      router.push("/dashboard"); 
    }
  }, [router]);

  // Mientras decide a dónde mandarte, mostramos un estado de carga limpio
  return (
    <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500 border-opacity-50 border-t-orange-500"></div>
        <p className="text-gray-400 font-medium animate-pulse">Cargando Sync App...</p>
      </div>
    </div>
  );
}