import apiClient from "../api-client";
import { API_ENDPOINTS } from "../constants";
import { LoginRequest, LoginResponse, User } from "../types";

/**
 * Authentication service for API calls
 */
export const authService = {
  /**
   * Login with email and password
   * @param credentials User credentials
   * @returns User data with auth details
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<any>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    let loginData: LoginResponse;
    if (response.data.success && response.data.data) {
      loginData = response.data.data;
    } else {
      loginData = response.data;
    }

    if (loginData.token) {
      const allowedRoles = ["ADMIN", "EMPLOYEE", "DELIVERY_AGENT", "VENDOR", "CUSTOMER"];
      
      if (allowedRoles.includes(loginData.role)) {
        localStorage.setItem("authToken", loginData.token);
        apiClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${loginData.token}`;
        apiClient.defaults.headers.Authorization = `Bearer ${loginData.token}`;
      }
    }

    return loginData;
  },

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("authToken");
      delete apiClient.defaults.headers.common["Authorization"];
      delete apiClient.defaults.headers.Authorization;
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
      }
    }
  },

  /**
   * Get the current logged in user
   * @returns User data
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<any>(API_ENDPOINTS.AUTH.ME);

    let userData: User;
    if (response.data.success && response.data.data) {
      userData = response.data.data;
    } else {
      userData = response.data;
    }

    return userData;
  },

  getToken(): string | null {
    return localStorage.getItem("authToken");
  },


  isAuthenticated(): boolean {
    const token = this.getToken();
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      apiClient.defaults.headers.Authorization = `Bearer ${token}`;
      return true;
    }
    return false;
  },

  refreshTokenHeaders(): void {
    const token = this.getToken();
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      apiClient.defaults.headers.Authorization = `Bearer ${token}`;
    }
  },
};
