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
   * Get all orders for admin dashboard with pagination and filters
   */
  async getAllOrdersPaginated(
    params: {
      page?: number;
      size?: number;
      sortBy?: string;
      sortDirection?: string;
      shopId?: string;
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
    } = {}
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
      // Clean up params (remove empty/null values)
      const cleanParams: any = {};
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          cleanParams[key] = value;
        }
      });

      const response = await apiClient.get<any>(
        API_ENDPOINTS.ADMIN_ORDERS.ALL,
        { params: cleanParams }
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
   */
  async getOrderById(orderId: string): Promise<AdminOrderDTO> {
    try {
      const response = await apiClient.get<ApiResponse<AdminOrderDTO>>(
        API_ENDPOINTS.ADMIN_ORDERS.BY_ID(orderId)
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
   * Verify delivery by pickup token (delivery agent only)
   */
  async verifyDelivery(pickupToken: string): Promise<any> {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        `/orders/delivery/verify/${pickupToken}`,
        {}
      );
      return response.data;
    } catch (error) {
      console.error("Error verifying delivery:", error);
      throw error;
    }
  }

  /**
   * Get pending orders count
   */
  async getPendingOrdersCount(): Promise<number> {
    try {
      const response = await apiClient.get<{ success: boolean; count: number }>(
        API_ENDPOINTS.ADMIN_ORDERS.COUNT_PENDING
      );
      return response.data.count || 0;
    } catch (error) {
      console.error("Error fetching pending orders count:", error);
      return 0;
    }
  }
}

export const orderService = new OrderService();
