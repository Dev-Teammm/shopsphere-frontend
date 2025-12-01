"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { shopService, ShopDTO } from "@/lib/services/shop-service";
import { useAppSelector } from "@/lib/redux/hooks";
import { UserRole } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Store, Package, Plus, ArrowRight, Building2 } from "lucide-react";
import Image from "next/image";
import ProtectedRoute from "@/components/auth/protected-route";

function ShopsPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAppSelector((state) => state.auth);

  const {
    data: shops,
    isLoading: shopsLoading,
    error: shopsError,
    refetch,
  } = useQuery({
    queryKey: ["userShops"],
    queryFn: () => shopService.getUserShops(),
    enabled: !!user,
    retry: 1,
  });

  useEffect(() => {
    if (shopsError && (!shops || shops.length === 0)) {
      toast({
        title: "Using Demo Data",
        description: "Could not connect to server. Showing demo shops for testing.",
        variant: "default",
      });
    }
  }, [shopsError, shops, toast]);

  const handleOpenShop = (shopId: string) => {
    if (user?.role === UserRole.DELIVERY_AGENT) {
      router.push(`/delivery-agent/dashboard?shopId=${shopId}`);
    } else if (
      user?.role === UserRole.VENDOR ||
      user?.role === UserRole.EMPLOYEE ||
      user?.role === UserRole.ADMIN
    ) {
      router.push(`/dashboard?shopId=${shopId}`);
    }
  };

  const handleCreateShop = () => {
    toast({
      title: "Coming Soon",
      description: "Shop creation functionality will be available soon.",
    });
  };

  if (shopsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-48 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Shops</h1>
          <p className="text-muted-foreground">
            Select a shop to manage or create a new one
          </p>
        </div>
        {(user?.role === UserRole.VENDOR || user?.role === UserRole.ADMIN) && (
          <Button onClick={handleCreateShop} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Create Shop
          </Button>
        )}
      </div>


      {!shopsLoading && shops && shops.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No shops found</h3>
              <p className="text-muted-foreground mb-6">
                {user?.role === UserRole.VENDOR || user?.role === UserRole.ADMIN
                  ? "You don't have any shops yet. Create your first shop to get started."
                  : "You are not associated with any shops yet."}
              </p>
              {(user?.role === UserRole.VENDOR || user?.role === UserRole.ADMIN) && (
                <Button onClick={handleCreateShop} size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create Shop
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {shops && shops.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <Card key={shop.shopId} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="relative h-48 w-full bg-muted rounded-t-lg overflow-hidden">
                  {shop.logoUrl ? (
                    <Image
                      src={shop.logoUrl}
                      alt={shop.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Store className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  {shop.status === "PENDING" && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                        Pending
                      </span>
                    </div>
                  )}
                  {shop.status === "ACTIVE" && shop.isActive && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Active
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <CardTitle className="mb-2">{shop.name}</CardTitle>
                {shop.description && (
                  <CardDescription className="line-clamp-2 mb-4">
                    {shop.description}
                  </CardDescription>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span>{shop.productCount || 0} products</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleOpenShop(shop.shopId)}
                  className="w-full gap-2"
                  size="lg"
                >
                  Open
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopsPage() {
  return (
    <ProtectedRoute allowedRoles={[UserRole.VENDOR, UserRole.EMPLOYEE, UserRole.DELIVERY_AGENT, UserRole.ADMIN]}>
      <ShopsPageContent />
    </ProtectedRoute>
  );
}

