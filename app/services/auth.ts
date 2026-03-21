const API_URL = "https://oauth.goqconsultant.com"; // Cambiala por la real

export const authService = {
  register: async (data: any) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  login: async (credentials: any) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(credentials),
    });
    return response.json();
  }
};