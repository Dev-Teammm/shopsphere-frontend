import axios from "axios";
import { API_URL } from "./constants";

// Create an Axios instance with default configs
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // If the data is FormData, remove Content-Type header to let Axios set multipart/form-data automatically
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      console.log(`[API Client] Detected FormData, removed Content-Type header for: ${config.url}`);
    }
    
    // Log request data for debugging (especially for category/brand creation)
    if (config.url?.includes("/categories") && config.method === "post") {
      console.log("[API Client] Category creation request payload:", JSON.stringify(config.data, null, 2));
      console.log("[API Client] shopId in request:", config.data?.shopId);
    }
    
    if (config.url?.includes("/brands") && config.method === "post") {
      console.log("[API Client] Brand creation request payload:", JSON.stringify(config.data, null, 2));
      console.log("[API Client] shopId in request:", config.data?.shopId);
      console.log("[API Client] Full request config.data:", config.data);
    }
    
    // Safety net: If shopSlug is in URL but shopId is missing from payload, try to inject it
    // This is a last resort - the mutation should handle this, but this ensures it's always there
    if (typeof window !== "undefined" && config.data && typeof config.data === "object" && !Array.isArray(config.data) && !(config.data instanceof FormData)) {
      const urlParams = new URLSearchParams(window.location.search);
      const shopSlug = urlParams.get("shopSlug");
      
      if (shopSlug && !config.data.shopId) {
        // Try to get shopId from sessionStorage or localStorage (if we stored it)
        const storedShopId = sessionStorage.getItem(`shopId_${shopSlug}`) || localStorage.getItem(`shopId_${shopSlug}`);
        
        if (storedShopId) {
          console.warn("[API Client] shopId missing from payload but found in storage, injecting:", storedShopId);
          config.data.shopId = storedShopId;
        } else {
          console.error("[API Client] CRITICAL: shopSlug in URL but shopId missing from payload and storage!", {
            url: config.url,
            shopSlug,
            payload: config.data,
          });
        }
      }
    }
    
    // Only add token if we're in the browser
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Also set the default header for this instance
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        console.log(`[API Client] Added Authorization header for request to: ${config.url}`);
      } else {
        console.warn(`[API Client] No auth token found in localStorage for request to: ${config.url}`);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window === "undefined") {
      return Promise.reject(error);
    }

    const status = error.response?.status;
      const isAuthMeRequest = error.config?.url?.includes("/auth/me");
    const isAuthRequest = error.config?.url?.includes("/auth/login") || 
                          error.config?.url?.includes("/auth/register");
    const currentPath = window.location.pathname;

    // Handle 401 Unauthorized - token expired or invalid
    if (status === 401) {
      // Don't redirect if it's the /me endpoint (let AuthChecker handle it)
      // Don't redirect if we're already on auth page
      if (!isAuthMeRequest && !isAuthRequest && currentPath !== "/auth") {
        // Clear the invalid token
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authChecked");
        delete apiClient.defaults.headers.common["Authorization"];
        delete apiClient.defaults.headers.Authorization;

        console.log("Token expired or invalid, redirecting to login");
        
        // Preserve current URL for return after login
        const returnUrl = window.location.search 
          ? `${currentPath}${window.location.search}`
          : currentPath;
        
        // Redirect to login page with return URL
        window.location.href = `/auth?returnUrl=${encodeURIComponent(returnUrl)}`;
      }
    } 
    // Handle 403 Forbidden - user doesn't have permission
    else if (status === 403) {
      console.error("Access forbidden. User may not have required permissions.");
      
      // Check if it's a shop-related error (invalid shopId)
      const errorMessage = error.response?.data?.message || "";
      if (errorMessage.toLowerCase().includes("shop") || 
          errorMessage.toLowerCase().includes("not authorized") ||
          errorMessage.toLowerCase().includes("access denied") ||
          errorMessage.toLowerCase().includes("cannot manage")) {
        // Redirect to shops page if shop access is denied
        if (currentPath !== "/shops") {
          console.log("Shop access denied, redirecting to shops page");
          window.location.href = "/shops";
        }
      } else if (!isAuthRequest && currentPath !== "/auth") {
        // For other 403 errors (like unauthorized role), redirect to login
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authChecked");
        delete apiClient.defaults.headers.common["Authorization"];
        delete apiClient.defaults.headers.Authorization;

        const returnUrl = window.location.search 
          ? `${currentPath}${window.location.search}`
          : currentPath;
        window.location.href = `/auth?returnUrl=${encodeURIComponent(returnUrl)}`;
      }
    } 
    // Handle 500 Internal Server Error
    else if (status === 500) {
      console.error("Server error occurred:", error.response.data);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
