import apiClient from "../api-client";
import { API_ENDPOINTS } from "../constants";

export interface ShopDTO {
  shopId: string;
  name: string;
  description?: string;
  slug: string;
  logoUrl?: string;
  status: string;
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  isActive?: boolean;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

class ShopService {
  async getUserShops(): Promise<ShopDTO[]> {
    try {
      const response = await apiClient.get<ShopDTO[]>(
        API_ENDPOINTS.SHOPS.USER_SHOPS
      );
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error: any) {
      console.error("Error fetching user shops:", error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error("Unauthorized. Please log in again.");
      }
      
      if (error.response?.status === 404) {
        return [];
      }
      
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        "Failed to fetch shops. Please try again later."
      );
    }
  }

  async getShopById(shopId: string): Promise<ShopDTO> {
    try {
      const response = await apiClient.get<ShopDTO>(API_ENDPOINTS.SHOPS.BY_ID(shopId));
      return response.data;
    } catch (error) {
      console.error("Error fetching shop:", error);
      throw error;
    }
  }

  async getShopBySlug(slug: string): Promise<ShopDTO> {
    try {
      const response = await apiClient.get<ShopDTO>(`${API_ENDPOINTS.SHOPS.BASE}/slug/${slug}`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching shop by slug:", error);
      if (error.response?.status === 404) {
        throw new Error("Shop not found");
      }
      throw error;
    }
  }

  async createShop(shopData: Partial<ShopDTO>): Promise<ShopDTO> {
    try {
      const token = localStorage.getItem("authToken");
      console.log("[ShopService] Creating shop - token present:", !!token);
      
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      console.log("[ShopService] Sending JSON request with Authorization header");
      const response = await apiClient.post<ShopDTO>(
        API_ENDPOINTS.SHOPS.BASE,
        shopData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("[ShopService] Error creating shop:", error);
      if (error.response?.status === 403) {
        throw new Error("Access denied. Please check your permissions or log in again.");
      }
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create shop. Please try again."
      );
    }
  }

  async createShopWithLogo(
    shopData: Partial<ShopDTO>,
    logoFile: File
  ): Promise<ShopDTO> {
    try {
      const token = localStorage.getItem("authToken");
      console.log("[ShopService] Creating shop with logo - token present:", !!token);
      
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const formData = new FormData();
      formData.append("name", shopData.name || "");
      if (shopData.description) {
        formData.append("description", shopData.description);
      }
      formData.append("contactEmail", shopData.contactEmail || "");
      formData.append("contactPhone", shopData.contactPhone || "");
      formData.append("address", shopData.address || "");
      formData.append("isActive", String(shopData.isActive ?? true));
      formData.append("logo", logoFile);

      console.log("[ShopService] Sending multipart request with Authorization header");
      const response = await apiClient.post<ShopDTO>(
        `${API_ENDPOINTS.SHOPS.BASE}/with-logo`,
        formData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("[ShopService] Error creating shop with logo:", error);
      if (error.response?.status === 403) {
        throw new Error("Access denied. Please check your permissions or log in again.");
      }
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create shop. Please try again."
      );
    }
  }
}

export const shopService = new ShopService();

