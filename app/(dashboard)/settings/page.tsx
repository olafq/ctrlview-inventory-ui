"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Copy, Check, Link, Unlink } from "lucide-react";

export default function SettingsPage() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [companyCode, setCompanyCode] = useState("");
  const [loadingCode, setLoadingCode] = useState(true);
  const [copied, setCopied] = useState(false);

  const channelId = 1;
  const tenantId = 1;
  const API_BASE = "https://oauth.goqconsultant.com";

  // 1. Verificar estado de MercadoLibre
  const checkStatus = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/integrations/mercadolibre/oauth/status?channel_id=${channelId}&tenant_id=${tenantId}`
      );
      const data = await res.json();
      setConnected(data.connected);
    } catch (err) {
      console.error("Error MeLi status:", err);
      setConnected(false);
    }
  };

  // 2. Traer el código de empresa (B8344891) y debuggear
  const fetchCompanyData = async () => {
    try {
      const token = localStorage.getItem("sync_token");
      if (!token) return;

      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      const data = await res.json();
      
      // LOG DE CONTROL: Mira esto en la consola (F12) si no aparece el código
      console.log("DEBUG - Datos de /auth/me:", data);

      // Probamos todas las rutas posibles del JSON según tu base de datos
      const code = data.company_code || 
                   data.tenant?.company_code || 
                   data.user?.tenant?.company_code ||
                   (data.tenant && Array.isArray(data.tenant) ? data.tenant[0]?.company_code : null);

      if (code) {
        setCompanyCode(code);
      }
    } catch (err) {
      console.error("Error al obtener company code:", err);
    } finally {
      setLoadingCode(false);
    }
  };

  useEffect(() => {
    checkStatus();
    fetchCompanyData();
  }, []);

  const connectMeLi = () => {
    window.location.href = `${API_BASE}/integrations/mercadolibre/oauth/login?channel_id=${channelId}&tenant_id=${tenantId}`;
  };

  const disconnectMeLi = async () => {
    try {
      await fetch(
        `${API_BASE}/integrations/mercadolibre/oauth/disconnect?channel_id=${channelId}&tenant_id=${tenantId}`,
        { method: "POST" }
      );
      setConnected(false);
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = () => {
    if (!companyCode) return;
    navigator.clipboard.writeText(companyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 text-white">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-white">Configuración</h1>
        <p className="text-gray-400">Gestiona tus integraciones y accesos de equipo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* SECCIÓN: ACCESO DE EMPLEADOS */}
        <div className="bg-[#1a1d23] border border-gray-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-orange-500 mb-2">Acceso de Empleados</h2>
          <p className="text-gray-400 text-sm mb-6">
            Comparte este código con tus empleados para que se registren en tu organización.
          </p>

          <div className="space-y-4">
            <div className="relative">
              <input
                type={showCode ? "text" : "password"}
                readOnly
                value={loadingCode ? "Cargando..." : companyCode || "No disponible"}
                className="w-full bg-[#0f1115] border border-gray-700 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-orange-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showCode ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              onClick={copyToClipboard}
              disabled={loadingCode || !companyCode}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${
                copied 
                ? "bg-green-600/20 text-green-500 border border-green-600/50" 
                : "bg-orange-600 hover:bg-orange-700 text-white disabled:bg-gray-800 disabled:text-gray-600"
              }`}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? "¡Copiado!" : "Copiar Código"}
            </button>
          </div>
        </div>

        {/* SECCIÓN: MERCADOLIBRE */}
        <div className="bg-[#1a1d23] border border-gray-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold mb-4 text-white">MercadoLibre Integration</h2>
          
          {connected === null ? (
            <p className="text-gray-500 animate-pulse">Verificando conexión...</p>
          ) : connected ? (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 text-green-500 p-4 rounded-lg flex items-center gap-3">
                <Link size={20} />
                <span>Conectado correctamente ✅</span>
              </div>
              <button
                onClick={disconnectMeLi}
                className="w-full bg-red-600/10 text-red-500 border border-red-600/30 py-3 rounded-lg hover:bg-red-600 hover:text-white transition-all font-bold"
              >
                Desconectar Cuenta
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 p-4 rounded-lg flex items-center gap-3">
                <Unlink size={20} />
                <span>No conectado</span>
              </div>
              <button
                onClick={connectMeLi}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-lg font-bold transition-all shadow-lg"
              >
                Conectar MercadoLibre
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}