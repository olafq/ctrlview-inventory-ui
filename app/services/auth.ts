// app/services/auth.ts

const API_URL = "https://oauth.goqconsultant.com";

export const authService = {
  /**
   * Registro de usuario (Empresa o Empleado)
   * Se agrega la "/" al final para evitar redirecciones 307 que rompen CORS en Vercel.
   */
  register: async (data: any) => {
    // IMPORTANTE: Asegurate de que el objeto 'data' que viene del formulario
    // use "company_name" para que coincida con tu RegisterSchema de Python.
    const response = await fetch(`${API_URL}/auth/register`, { 
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Error en el registro");
    }

    return response.json();
  },

  /**
   * Login de usuario
   */
  login: async (credentials: any) => {
    // También agregamos la "/" por consistencia y seguridad
    const response = await fetch(`${API_URL}/auth/login/`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded" 
      },
      body: new URLSearchParams(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Error en el login");
    }

    return response.json();
  }
};