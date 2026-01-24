"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  CreateSubscriptionPlanRequest,
  SubscriptionPlan,
} from "@/lib/services/subscription-service";

const planSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  currency: z.string().min(3, "Currency must be 3 characters").max(3),
  durationInDays: z.coerce.number().min(1, "Duration must be at least 1 day"),
  isActive: z.boolean().default(true),
  isFreemium: z.boolean().default(false),
  maxProducts: z.coerce.number().min(-1, "Use -1 for unlimited"),
  maxWarehouses: z.coerce.number().min(-1),
  maxEmployees: z.coerce.number().min(-1),
  maxDeliveryAgents: z.coerce.number().min(-1),
});

interface SubscriptionPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: SubscriptionPlan | null;
  onSubmit: (data: CreateSubscriptionPlanRequest) => Promise<void>;
}

export function SubscriptionPlanDialog({
  open,
  onOpenChange,
  plan,
  onSubmit,
}: SubscriptionPlanDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof planSchema>>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: plan?.name || "",
      description: plan?.description || "",
      price: plan?.price || 0,
      currency: plan?.currency || "USD",
      durationInDays: plan?.durationInDays || 30,
      isActive: plan?.isActive ?? true,
      isFreemium: plan?.isFreemium ?? false,
      maxProducts: plan?.maxProducts || 100,
      maxWarehouses: plan?.maxWarehouses || 1,
      maxEmployees: plan?.maxEmployees || 5,
      maxDeliveryAgents: plan?.maxDeliveryAgents || 2,
    },
  });

  const handleSubmit = async (values: z.infer<typeof planSchema>) => {
    try {
      setIsSubmitting(true);
      await onSubmit({
        ...values,
        featuresJson: "{}", // Placeholder for now
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {plan ? "Edit Subscription Plan" : "Create Subscription Plan"}
          </DialogTitle>
          <DialogDescription>
            Configure the details and limits for this subscription plan.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Pro Plan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input placeholder="USD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the plan features..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="durationInDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Days)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Is this plan available for purchase?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isFreemium"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Freemium</FormLabel>
                      <FormDescription>Is this a free tier?</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Resource Limits (-1 for unlimited)</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxProducts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Products</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxWarehouses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Warehouses</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxEmployees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Employees</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxDeliveryAgents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Delivery Agents</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Plan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
