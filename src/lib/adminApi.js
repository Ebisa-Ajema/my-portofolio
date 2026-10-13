import { apiBaseUrl, apiUrl } from "./api";

const TOKEN_KEY = "portfolio-admin-token";

export const getAdminToken = () => sessionStorage.getItem(TOKEN_KEY);
export const setAdminToken = (token) => sessionStorage.setItem(TOKEN_KEY, token);
export const clearAdminToken = () => sessionStorage.removeItem(TOKEN_KEY);

export async function adminRequest(path, options = {}) {
  if (!apiBaseUrl) throw new Error("The admin API is not configured. Set VITE_API_BASE_URL and restart the frontend.");
  const headers = new Headers(options.headers || {});
  const token = getAdminToken();
  if (token) headers.set("Authorization", `Token ${token}`);
  if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  const response = await fetch(apiUrl(path), { ...options, headers });
  if (response.status === 401 || response.status === 403) {
    if (token && path !== "admin/login/") clearAdminToken();
    throw new Error(response.status === 401 ? "Your session expired. Please sign in again." : "You do not have permission to perform this action.");
  }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.detail || Object.values(data).flat().find((value) => typeof value === "string");
    throw new Error(detail || "The request could not be completed.");
  }
  return data;
}
