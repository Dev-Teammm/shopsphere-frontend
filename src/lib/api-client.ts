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
    const isAuthRequest = error.config?.url?.includes("/auth/");

    // Handle 401 Unauthorized - token expired or invalid
    if (status === 401) {
      if (!isAuthMeRequest && !isAuthRequest) {
        // Clear the invalid token
        localStorage.removeItem("authToken");
        delete apiClient.defaults.headers.common["Authorization"];
        delete apiClient.defaults.headers.Authorization;

        console.log("Token expired or invalid, redirecting to login");
        
        // Redirect to login page
        if (window.location.pathname !== "/auth") {
          window.location.href = "/auth";
        }
      }
    } 
    // Handle 403 Forbidden - user doesn't have permission
    else if (status === 403) {
      console.error("Access forbidden. User may not have required permissions.");
      
      // Check if it's a shop-related error (invalid shopId)
      const errorMessage = error.response?.data?.message || "";
      if (errorMessage.toLowerCase().includes("shop") || 
          errorMessage.toLowerCase().includes("not authorized") ||
          errorMessage.toLowerCase().includes("access denied")) {
        // Redirect to shops page if shop access is denied
        if (window.location.pathname !== "/shops") {
          console.log("Shop access denied, redirecting to shops page");
          window.location.href = "/shops";
        }
      } else if (!isAuthRequest && window.location.pathname !== "/auth") {
        // For other 403 errors, redirect to login
        localStorage.removeItem("authToken");
        delete apiClient.defaults.headers.common["Authorization"];
        delete apiClient.defaults.headers.Authorization;
        window.location.href = "/auth";
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
