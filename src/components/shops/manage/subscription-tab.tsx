"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  subscriptionService,
  SubscriptionPlan,
  ShopSubscription,
} from "@/lib/services/subscription-service";
import { ShopDTO } from "@/lib/services/shop-service";
import {
  Package,
  Users,
  Warehouse,
  Truck,
  Check,
  X,
  Clock,
  Calendar,
  CreditCard,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

interface SubscriptionTabProps {
  shop: ShopDTO;
}

export function SubscriptionTab({ shop }: SubscriptionTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [subscribingPlanId, setSubscribingPlanId] = useState<number | null>(null);

  // Fetch available plans
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["subscription-plans", "active"],
    queryFn: () => subscriptionService.getAllPlans(true),
  });

  // Fetch current subscription
  const { data: activeSubscription, isLoading: activeLoading } = useQuery({
    queryKey: ["shop-subscription", shop.shopId],
    queryFn: () => subscriptionService.getActiveSubscription(shop.shopId),
  });

  // Fetch subscription history
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["shop-subscription-history", shop.shopId],
    queryFn: () => subscriptionService.getSubscriptionHistory(shop.shopId),
  });

  // Check if subscription system is enabled
  const { data: isSystemEnabled } = useQuery({
    queryKey: ["subscription-system-status"],
    queryFn: subscriptionService.isSystemEnabled,
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: ({ planId, autoRenew }: { planId: number; autoRenew: boolean }) =>
      subscriptionService.subscribeShop(shop.shopId, planId, autoRenew),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-subscription", shop.shopId] });
      queryClient.invalidateQueries({ queryKey: ["shop-subscription-history", shop.shopId] });
      queryClient.invalidateQueries({ queryKey: ["shop", shop.shopId] });
      toast({
        title: "Success",
        description: "Successfully subscribed to the plan!",
      });
      setSubscribingPlanId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Subscription Failed",
        description: error?.response?.data || "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
      setSubscribingPlanId(null);
    },
  });

  const handleSubscribe = (planId: number) => {
    setSubscribingPlanId(planId);
    subscribeMutation.mutate({ planId, autoRenew: false });
  };

  if (!isSystemEnabled) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Subscription System Disabled</h3>
            <p className="text-muted-foreground">
              The subscription system is currently disabled. Please contact support for more information.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>Your active subscription plan and status</CardDescription>
        </CardHeader>
        <CardContent>
          {activeLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : activeSubscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{activeSubscription.planName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {activeSubscription.planId && plans?.find((p) => p.id === activeSubscription.planId)?.description}
                  </p>
                </div>
                <Badge
                  className={
                    activeSubscription.status === "ACTIVE"
                      ? "bg-green-500"
                      : activeSubscription.status === "EXPIRED"
                      ? "bg-gray-500"
                      : "bg-red-500"
                  }
                >
                  {activeSubscription.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Start Date:</span>
                  <p className="font-medium">
                    {format(new Date(activeSubscription.startDate), "MMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">End Date:</span>
                  <p className="font-medium">
                    {format(new Date(activeSubscription.endDate), "MMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <p className="font-medium">
                    {activeSubscription.currency || "USD"} {activeSubscription.amountPaid?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Auto Renew:</span>
                  <p className="font-medium">
                    {activeSubscription.autoRenew ? (
                      <Check className="h-4 w-4 text-green-500 inline" />
                    ) : (
                      <X className="h-4 w-4 text-gray-500 inline" />
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No active subscription</p>
              <p className="text-sm text-muted-foreground mt-2">
                Subscribe to a plan below to activate your shop
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Choose a subscription plan for your shop</CardDescription>
        </CardHeader>
        <CardContent>
          {plansLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plans?.map((plan) => (
                <Card key={plan.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {plan.currency} {plan.price.toFixed(2)} / {plan.durationInDays} days
                        </CardDescription>
                      </div>
                      {plan.isFreemium && <Badge variant="secondary">Freemium</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <p className="text-sm text-muted-foreground min-h-[40px]">
                      {plan.description || "No description provided."}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 opacity-70" />
                        <span>
                          Products: {plan.maxProducts === -1 ? "Unlimited" : plan.maxProducts}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Warehouse className="h-4 w-4 opacity-70" />
                        <span>
                          Warehouses: {plan.maxWarehouses === -1 ? "Unlimited" : plan.maxWarehouses}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 opacity-70" />
                        <span>
                          Employees: {plan.maxEmployees === -1 ? "Unlimited" : plan.maxEmployees}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 opacity-70" />
                        <span>
                          Delivery Agents:{" "}
                          {plan.maxDeliveryAgents === -1 ? "Unlimited" : plan.maxDeliveryAgents}
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full mt-4"
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={
                        subscribingPlanId === plan.id ||
                        subscribeMutation.isPending ||
                        activeSubscription?.planId === plan.id
                      }
                    >
                      {subscribingPlanId === plan.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Subscribing...
                        </>
                      ) : activeSubscription?.planId === plan.id ? (
                        "Current Plan"
                      ) : (
                        "Subscribe"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {plans?.length === 0 && (
                <div className="col-span-full text-center p-12 text-muted-foreground">
                  No subscription plans available
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription History */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription History</CardTitle>
          <CardDescription>Past and present subscriptions for this shop</CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : history && history.length > 0 ? (
            <div className="space-y-4">
              {history.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{sub.planName}</h4>
                      <Badge
                        variant={
                          sub.status === "ACTIVE"
                            ? "default"
                            : sub.status === "EXPIRED"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {sub.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(new Date(sub.startDate), "MMM dd, yyyy")} -{" "}
                          {format(new Date(sub.endDate), "MMM dd, yyyy")}
                        </span>
                      </div>
                      <div>
                        Amount: {sub.currency || "USD"} {sub.amountPaid?.toFixed(2) || "0.00"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No subscription history available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
