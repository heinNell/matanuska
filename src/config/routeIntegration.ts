// src/config/routeIntegration.ts
/**
 * Route Integration Plan for Matanuska Transport Platform
 * This file serves as a central reference for mapping between:
 * 1. Sidebar navigation items
 * 2. Route definitions in App.tsx
 * 3. Actual component files in the codebase
 */

import { SidebarItem, sidebarConfig } from "./sidebarConfig";

interface ValidatedRoute {
  path: string;
  component: string;
  status: "valid" | "missing-component";
}

interface DuplicateRoute {
  path: string;
  components: string[];
}

interface ModuleCoverage {
  total: number;
  covered: number;
  routes: Record<string, boolean>;
}

// Maps each route path to its corresponding file
// This helps identify routes that exist in the sidebar but not as actual files
export const validateRouteToComponent = (): ValidatedRoute[] => {
  const validatedRoutes: ValidatedRoute[] = [];

  // Recursively validate each sidebar item and its children
  const validateSidebarItem = (item: SidebarItem): void => {
    // Check if component file exists
    try {
      // Note: This is a runtime check and may not actually work in TypeScript build
      // For a production solution, consider using fs.existsSync in a Node.js context
      const component = require(`../${item.component}`);
      validatedRoutes.push({
        path: item.path,
        component: item.component,
        status: "valid",
      });
    } catch (e) {
      validatedRoutes.push({
        path: item.path,
        component: item.component,
        status: "missing-component",
      });
    }

    // Validate children recursively
    if (item.children?.length) {
      item.children.forEach(validateSidebarItem);
    }
  };

  sidebarConfig.forEach(validateSidebarItem);
  return validatedRoutes;
};

// Detects duplicate routes with different components
export const findDuplicateRoutes = (): DuplicateRoute[] => {
  const routeMap: Record<string, string> = {};
  const duplicates: DuplicateRoute[] = [];

  // Recursively check each sidebar item and its children
  const checkItem = (item: SidebarItem): void => {
    if (routeMap[item.path]) {
      duplicates.push({
        path: item.path,
        components: [routeMap[item.path], item.component],
      });
    } else {
      routeMap[item.path] = item.component;
    }

    if (item.children?.length) {
      item.children.forEach(checkItem);
    }
  };

  sidebarConfig.forEach(checkItem);
  return duplicates;
};

// Maps functional modules to routes for coverage analysis
export const analyzeFunctionalCoverage = (): Record<string, ModuleCoverage> => {
  const modules: Record<string, string[]> = {
    core: ["dashboard"],
    fleet: ["fleet-management"],
    tyre: ["tyres", "tyre-management", "tyre-performance-dashboard"],
    trip: ["trips", "trip-dashboard", "trip-management"],
    diesel: ["diesel", "diesel-dashboard", "diesel-management"],
    driver: ["drivers", "driver-dashboard", "driver-management"],
    workshop: ["workshop", "workshop-page", "workshop-operations"],
    inventory: ["inventory", "inventory-dashboard", "parts-inventory"],
    invoice: ["invoices", "invoice-dashboard", "invoice-management"],
    client: ["clients", "customer-dashboard"],
    wialon: ["wialon", "wialon-dashboard", "wialon-config"],
    compliance: ["compliance-dashboard", "qa-review-panel"],
    mobile: ["mobile"],
  };

  const coverage: Record<string, ModuleCoverage> = {};

  // For each module, check if related routes exist in sidebar config
  Object.entries(modules).forEach(([module, relatedRoutes]) => {
    coverage[module] = {
      total: relatedRoutes.length,
      covered: 0,
      routes: {},
    };

    relatedRoutes.forEach((route) => {
      const found = sidebarConfig.some(
        (item) =>
          item.path === `/${route}` || item.children?.some((child) => child.path === `/${route}`)
      );

      coverage[module].routes[route] = found;
      if (found) coverage[module].covered++;
    });
  });

  return coverage;
};

// This function would be executed as part of a build step
export const generateIntegrationReport = () => {
  return {
    validatedRoutes: validateRouteToComponent(),
    duplicateRoutes: findDuplicateRoutes(),
    functionalCoverage: analyzeFunctionalCoverage(),
  };
};
