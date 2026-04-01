import axios from 'axios';

const TOKEN_KEY = 'accessToken';
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5027';
const API_KEY = import.meta.env.VITE_API_KEY ?? 'error';
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isRefreshCall = originalRequest.url?.includes('/admin/refresh-token');
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshCall) {
      originalRequest._retry = true;



      try {
        console.debug('[Auth] Access token expired, attempting refresh...');
        const response = await axios.post(
          `${API_URL}/admin/refresh-token`,
          {},
          { headers: { 'x-api-key': API_KEY }, withCredentials: true }
        );

        const { accessToken } = response.data;
        console.debug('[Auth] Token refreshed successfully');
        localStorage.setItem(TOKEN_KEY, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError: any) {
        console.error('[Auth] Refresh failed:', refreshError?.response?.status, refreshError?.response?.data);
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
