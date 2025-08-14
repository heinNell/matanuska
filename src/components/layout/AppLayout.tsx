// src/components/layout/AppLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import { SyncProvider } from "../../context/SyncContext";
import Footer from "./Footer";
import Navigation from "./Navigation";

/**
 * Application Layout Component
 *
 * Provides consistent layout with navigation and footer
 * for all application pages. Wraps content in SyncContext
 * for online/offline functionality.
 */
const AppLayout: React.FC = () => {
  return (
    <SyncProvider>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Navigation />

        <main className="flex-grow">
          <Outlet />
        </main>

        <Footer />
      </div>
    </SyncProvider>
  );
};

export default AppLayout;
