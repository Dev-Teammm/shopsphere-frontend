"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  checkAuthStart,
  checkAuthSuccess,
  checkAuthFailure,
} from "@/lib/redux/auth-slice";
import { authService } from "@/lib/services/auth-service";
import { setupAuthHeaders } from "@/lib/utils/auth-utils";
import { User } from "@/lib/types";

/**
 * Auth checker component
 * Checks for existing auth session when the app initializes
 */
export function AuthChecker({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { checkingAuth, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );
  const hasCheckedAuth = useRef(false);
  const isChecking = useRef(false);

  useEffect(() => {
    console.log("AuthChecker useEffect triggered", {
      hasCheckedAuth: hasCheckedAuth.current,
      checkingAuth,
      isChecking: isChecking.current,
    });

    // Only check auth once per session
    if (hasCheckedAuth.current || isChecking.current) {
      console.log("Skipping auth check - already in progress or completed");
      return;
    }

    // Function to check if user is already authenticated
    const checkAuthentication = async () => {
      try {
        console.log("Starting authentication check...");
        isChecking.current = true;
        hasCheckedAuth.current = true;

        setupAuthHeaders();

        dispatch(checkAuthStart());
        console.log("Dispatched checkAuthStart");

        const token = authService.getToken();
        console.log("Token check:", token ? "Token exists" : "No token");

        if (!token) {
          console.log("No token found, user not authenticated");
          dispatch(checkAuthFailure());
          return;
        }

        console.log("Making API call to get current user...");
        const user = await authService.getCurrentUser();
        console.log("User data received:", user);
        
        const allowedRoles = ["ADMIN", "EMPLOYEE", "DELIVERY_AGENT", "VENDOR", "CUSTOMER"];
        if (!allowedRoles.includes(user.role)) {
          console.log("User has invalid role for admin portal:", user.role);
          localStorage.removeItem("authToken");
          dispatch(checkAuthFailure());
          return;
        }
        
        dispatch(checkAuthSuccess(user));
      } catch (error) {
        console.log("Auth check failed:", error);
        dispatch(checkAuthFailure());
      } finally {
        isChecking.current = false;
        console.log("Auth check completed");
      }
    };

    checkAuthentication();
  }, [dispatch]); // Removed checkingAuth from dependencies

  // Show loading during initial auth check
  if (checkingAuth && !hasCheckedAuth.current) {
    console.log(
      "Showing loading state - checkingAuth:",
      checkingAuth,
      "hasCheckedAuth:",
      hasCheckedAuth.current
    );
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (checkingAuth && hasCheckedAuth.current) {
    console.warn(
      "Auth check seems stuck - checkingAuth is true but hasCheckedAuth is true"
    );
  }

  console.log(
    "AuthChecker render - checkingAuth:",
    checkingAuth,
    "hasCheckedAuth:",
    hasCheckedAuth.current
  );

  return <>{children}</>;
}
