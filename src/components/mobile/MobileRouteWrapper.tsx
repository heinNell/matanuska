import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "../hooks/use-mobile";
import { Capacitor } from "@capacitor/core";

interface MobileRouteWrapperProps {
  children: React.ReactNode;
  mobileRoute?: string;
}

/**
 * Wrapper component that detects mobile devices and conditionally
 * redirects to mobile-optimized routes or provides mobile layout
 */
const MobileRouteWrapper: React.FC<MobileRouteWrapperProps> = ({ children, mobileRoute }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const isNativeApp = Capacitor.isNativePlatform();

  React.useEffect(() => {
    // Auto-redirect to mobile route if on mobile and mobile route exists
    if (isMobile && mobileRoute && !location.pathname.includes("/mobile")) {
      // Only redirect if we're not already on a mobile route
      navigate(mobileRoute, { replace: true });
    }
  }, [isMobile, mobileRoute, location.pathname, navigate]);

  // If we're on mobile and have a mobile route, show loading while redirecting
  if (isMobile && mobileRoute && !location.pathname.includes("/mobile")) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading mobile interface...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default MobileRouteWrapper;
