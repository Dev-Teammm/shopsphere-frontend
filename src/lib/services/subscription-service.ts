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
};
