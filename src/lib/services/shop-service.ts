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

const MOCK_SHOPS: ShopDTO[] = [
  {
    shopId: "mock-shop-1",
    name: "Tech Store Pro",
    description: "Your one-stop shop for all tech gadgets and accessories",
    slug: "tech-store-pro",
    logoUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
    status: "ACTIVE",
    ownerId: "mock-owner-1",
    ownerName: "John Doe",
    contactEmail: "contact@techstorepro.com",
    contactPhone: "+1234567890",
    address: "123 Tech Street, Silicon Valley",
    isActive: true,
    productCount: 45,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    shopId: "mock-shop-2",
    name: "Fashion Boutique",
    description: "Trendy fashion items for the modern lifestyle",
    slug: "fashion-boutique",
    logoUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
    status: "ACTIVE",
    ownerId: "mock-owner-1",
    ownerName: "John Doe",
    contactEmail: "info@fashionboutique.com",
    contactPhone: "+1234567891",
    address: "456 Fashion Avenue, New York",
    isActive: true,
    productCount: 128,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    shopId: "mock-shop-3",
    name: "Home Essentials",
    description: "Everything you need for your home and kitchen",
    slug: "home-essentials",
    logoUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
    status: "PENDING",
    ownerId: "mock-owner-1",
    ownerName: "John Doe",
    contactEmail: "support@homeessentials.com",
    contactPhone: "+1234567892",
    address: "789 Home Street, Los Angeles",
    isActive: false,
    productCount: 67,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class ShopService {
  async getUserShops(): Promise<ShopDTO[]> {
    try {
      const response = await apiClient.get<ShopDTO[]>(API_ENDPOINTS.SHOPS.USER_SHOPS);
      if (response.data && response.data.length > 0) {
        return response.data;
      }
      return MOCK_SHOPS;
    } catch (error) {
      console.error("Error fetching user shops, using mock data:", error);
      return MOCK_SHOPS;
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
}

export const shopService = new ShopService();

