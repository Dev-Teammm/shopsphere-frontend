import apiClient from "../api-client";
import {
  AdminOrderListResponse,
  AdminOrderDTO,
  ApiResponse,
} from "../types/order";
import { API_ENDPOINTS } from "../constants";

class OrderService {
  /**
   * Get all orders for admin dashboard
   */
  async getAllOrders(): Promise<AdminOrderDTO[]> {
    try {
      const response = await apiClient.get<AdminOrderListResponse>(
        API_ENDPOINTS.ADMIN_ORDERS.ALL
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  }

  /**
   * Get all orders for admin dashboard with pagination
   * @param shopId Optional shop ID to filter orders by shop
   */
  async getAllOrdersPaginated(
    page: number = 0,
    size: number = 15,
    sortBy: string = "createdAt",
    sortDir: string = "desc",
    shopId?: string
  ): Promise<{
    data: AdminOrderDTO[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalElements: number;
      pageSize: number;
      hasNext: boolean;
      hasPrevious: boolean;
      isFirst: boolean;
      isLast: boolean;
    };
  }> {
    try {
      const params: any = { page, size, sortBy, sortDir };
      if (shopId) {
        params.shopId = shopId;
      }
      const response = await apiClient.get<any>(
        API_ENDPOINTS.ADMIN_ORDERS.ALL,
        { params }
      );
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error: any) {
      // Handle shop-related errors
      if (error.response?.status === 403 || error.response?.status === 400) {
        const errorMessage =
          error.response?.data?.message || "Access denied to this shop";
        if (
          errorMessage.toLowerCase().includes("shop") ||
          errorMessage.toLowerCase().includes("authorized")
        ) {
          throw new Error(errorMessage);
        }
      }
      console.error("Error fetching paginated orders:", error);
      throw error;
    }
  }

  /**
   * Search orders with filters
   */
  async searchOrders(searchRequest: {
    orderNumber?: string;
    userId?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    orderStatus?: string;
    paymentStatus?: string;
    city?: string;
    state?: string;
    country?: string;
    totalMin?: number;
    totalMax?: number;
    startDate?: string;
    endDate?: string;
    paymentMethod?: string;
    trackingNumber?: string;
    searchKeyword?: string;
    shopId?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  }): Promise<{
    data: AdminOrderDTO[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalElements: number;
      pageSize: number;
      hasNext: boolean;
      hasPrevious: boolean;
      isFirst: boolean;
      isLast: boolean;
    };
  }> {
    try {
      const response = await apiClient.post<any>(
        API_ENDPOINTS.ADMIN_ORDERS.SEARCH,
        searchRequest
      );
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("Error searching orders:", error);
      throw error;
    }
  }

  /**
   * Get orders by status for admin dashboard
   */
  async getOrdersByStatus(status: string): Promise<AdminOrderDTO[]> {
    try {
      const response = await apiClient.get<AdminOrderListResponse>(
        API_ENDPOINTS.ADMIN_ORDERS.BY_STATUS(status)
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching orders by status:", error);
      throw error;
    }
  }

  /**
   * Get order by ID for admin
   * @param orderId The order ID
   * @param shopId Optional shop ID for shop-specific view
   * @param shopSlug Optional shop slug for shop-specific view
   */
  async getOrderById(
    orderId: string,
    shopId?: string,
    shopSlug?: string
  ): Promise<AdminOrderDTO> {
    try {
      const params: any = {};
      if (shopId) params.shopId = shopId;
      if (shopSlug) params.shopSlug = shopSlug;

      const response = await apiClient.get<ApiResponse<AdminOrderDTO>>(
        API_ENDPOINTS.ADMIN_ORDERS.BY_ID(orderId),
        { params }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  }

  /**
   * Update order status (admin only)
   */
  async updateOrderStatus(
    orderId: string,
    status: string
  ): Promise<AdminOrderDTO> {
    try {
      const response = await apiClient.put<ApiResponse<AdminOrderDTO>>(
        API_ENDPOINTS.ADMIN_ORDERS.UPDATE_STATUS(orderId),
        { status }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  }

  /**
   * Update order tracking information (admin only)
   */
  async updateOrderTracking(
    orderId: string,
    trackingNumber: string,
    estimatedDelivery?: string
  ): Promise<AdminOrderDTO> {
    try {
      const payload: { trackingNumber: string; estimatedDelivery?: string } = {
        trackingNumber,
      };

      if (estimatedDelivery) {
        payload.estimatedDelivery = estimatedDelivery;
      }

      const response = await apiClient.put<ApiResponse<AdminOrderDTO>>(
        API_ENDPOINTS.ADMIN_ORDERS.UPDATE_TRACKING(orderId),
        payload
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating order tracking:", error);
      throw error;
    }
  }

  /**
   * Get pending orders count
   * @param shopId Shop UUID (required)
   */
  async getPendingOrdersCount(shopId: string): Promise<number> {
    try {
      const response = await apiClient.get<{ success: boolean; count: number }>(
        API_ENDPOINTS.ADMIN_ORDERS.COUNT_PENDING,
        { params: { shopId } }
      );
      return response.data.count || 0;
    } catch (error) {
      console.error("Error fetching pending orders count:", error);
      return 0;
    }
  }
}

export const orderService = new OrderService();
