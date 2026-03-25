// app/services/auth.ts

const API_URL = "https://oauth.goqconsultant.com";

export const authService = {
  /**
   * Registro de usuario (Empresa o Empleado)
   */
  register: async (data: any) => {
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
   * Login de usuario - CORREGIDO PARA JSON
   */
  login: async (credentials: any) => {
    // 1. Usamos la URL sin barra al final (FastAPI prefiere esto)
    // 2. Cambiamos el Content-Type a application/json
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      // 3. Enviamos un JSON stringify, NO URLSearchParams
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Esto capturará el error "401" de credenciales incorrectas
      throw new Error(errorData.detail || "Error en el login");
    }

    return response.json();
  }
};