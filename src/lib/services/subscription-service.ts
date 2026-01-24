import apiClient from "@/lib/api-client";

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  durationInDays: number;
  isActive: boolean;
  isFreemium: boolean;
  maxProducts: number;
  maxWarehouses: number;
  maxEmployees: number;
  maxDeliveryAgents: number;
  featuresJson: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionPlanRequest {
  name: string;
  description: string;
  price: number;
  currency: string;
  durationInDays: number;
  isActive: boolean;
  isFreemium: boolean;
  maxProducts: number;
  maxWarehouses: number;
  maxEmployees: number;
  maxDeliveryAgents: number;
  featuresJson: string;
}

export interface ShopSubscription {
  id: number;
  shopId: string;
  shopName: string;
  planId: number;
  planName: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING_PAYMENT";
  paymentReference?: string;
  amountPaid: number;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export const subscriptionService = {
  getAllPlans: async (activeOnly: boolean = false): Promise<SubscriptionPlan[]> => {
    const response = await apiClient.get(`/subscriptions/plans?activeOnly=${activeOnly}`);
    return response.data;
  },

  getPlanById: async (id: number): Promise<SubscriptionPlan> => {
    const response = await apiClient.get(`/subscriptions/plans/${id}`);
    return response.data;
  },

  createPlan: async (plan: CreateSubscriptionPlanRequest): Promise<SubscriptionPlan> => {
    const response = await apiClient.post("/subscriptions/plans", plan);
    return response.data;
  },

  updatePlan: async (id: number, plan: CreateSubscriptionPlanRequest): Promise<SubscriptionPlan> => {
    const response = await apiClient.put(`/subscriptions/plans/${id}`, plan);
    return response.data;
  },

  deletePlan: async (id: number): Promise<void> => {
    await apiClient.delete(`/subscriptions/plans/${id}`);
  },

  isSystemEnabled: async (): Promise<boolean> => {
    const response = await apiClient.get("/subscriptions/config/enabled");
    return response.data;
  },

  setSystemEnabled: async (enabled: boolean): Promise<void> => {
    await apiClient.post(`/subscriptions/config/enabled?enabled=${enabled}`);
  },

  // Shop Subscription Methods
  subscribeShop: async (shopId: string, planId: number, autoRenew: boolean = false): Promise<ShopSubscription> => {
    const response = await apiClient.post(`/subscriptions/subscribe?shopId=${shopId}&planId=${planId}&autoRenew=${autoRenew}`);
    return response.data;
  },

  getActiveSubscription: async (shopId: string): Promise<ShopSubscription | null> => {
    const response = await apiClient.get(`/subscriptions/active/${shopId}`);
    return response.data;
  },

  getSubscriptionHistory: async (shopId: string): Promise<ShopSubscription[]> => {
    const response = await apiClient.get(`/subscriptions/history/${shopId}`);
    return response.data;
  },

  renewSubscription: async (shopId: string): Promise<ShopSubscription> => {
    const response = await apiClient.post(`/subscriptions/renew?shopId=${shopId}`);
    return response.data;
  },

  cancelSubscription: async (shopId: string): Promise<void> => {
    await apiClient.post(`/subscriptions/cancel?shopId=${shopId}`);
  },
};
