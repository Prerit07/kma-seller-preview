import axios, {
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { handleRefreshToken } from "./authService";
import { clearAuthCookies, setAuthCookies } from "@/lib/helper";
import { useSessionStore } from "@/store/useSessionStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const createCorrelationId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

// Cache the token from /api/get-token to avoid fetching on every request
let cachedAccessToken: string | null = null;
let tokenCacheTime = 0;
const TOKEN_CACHE_MS = 10_000; // cache for 10 seconds
let tokenFetchPromise: Promise<string | null> | null = null;

const getAccessToken = async (): Promise<string | null> => {
  const now = Date.now();
  if (cachedAccessToken !== null && now - tokenCacheTime < TOKEN_CACHE_MS) {
    return cachedAccessToken;
  }
  // Deduplicate concurrent fetches
  if (!tokenFetchPromise) {
    tokenFetchPromise = fetch("/api/get-token")
      .then(res => res.json())
      .then(data => {
        cachedAccessToken = data.accessToken || null;
        tokenCacheTime = Date.now();
        tokenFetchPromise = null;
        return cachedAccessToken;
      })
      .catch(() => {
        tokenFetchPromise = null;
        return null;
      });
  }
  return tokenFetchPromise;
};

export const clearTokenCache = () => {
  cachedAccessToken = null;
  tokenCacheTime = 0;
  tokenFetchPromise = null;
};

export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach access token
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const sessionId = useSessionStore.getState().sessionId;
    const accessToken = await getAccessToken();
    if (sessionId) {
      config.headers["X-Session-Id"] = sessionId;
    }
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    config.headers["x-correlation-id"] = createCorrelationId();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 and refresh token
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem("refreshToken");
    // const res = await fetch("/api/get-token");
    // const { refreshToken } = await res.json();

    // Prevent infinite retry loop
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      refreshToken
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await handleRefreshToken();
        if (newAccessToken) {
          setAuthCookies(newAccessToken, refreshToken)
          clearTokenCache();
          localStorage.setItem("accessToken", newAccessToken);
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }else{
          window.location.href = '/user-flow?isLogin=true'
        }
      } catch (refreshError) {
        console.error("Token refresh failed", refreshError);
        localStorage.clear();
        clearAuthCookies()
        window.location.href = "/user-flow?isLogin=true"
      }
    } else if (error.response?.status === 401) {
      // Don't redirect for view-limit 401s (guest user exceeded 3 free views)
      const data = error.response?.data;
      if (data?.requiresLogin === true && data?.remainingViews === 0) {
        return Promise.reject(data);
      }
      // Guests have no refresh token — let callers handle 401 (empty states, login CTAs)
      if (!refreshToken) {
        return Promise.reject(error?.response?.data ?? error);
      }
      localStorage.clear();
      clearAuthCookies();
      window.location.href = "/user-flow?isLogin=true";
    }
    return Promise.reject(error?.response?.data ?? error);
  }
);
