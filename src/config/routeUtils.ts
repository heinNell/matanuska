import React from 'react';
import { sidebarConfig, SidebarItem } from './sidebarConfig';
import { Route, Navigate } from 'react-router-dom';

// This helper function organizes sidebar items by section
// For example, all items with path starting with "/trips/" will be grouped together
export const getSidebarItemsBySection = () => {
  return sidebarConfig.reduce<Record<string, SidebarItem[]>>((sections, item) => {
    const sectionPath = item.path.split('/')[1] || 'other';
    if (!sections[sectionPath]) {
      sections[sectionPath] = [];
    }
    sections[sectionPath].push(item);
    return sections;
  }, {});
};

// This function can be used to generate routes based on the sidebar configuration
// It requires you to provide a component mapping for dynamic import
export const generateRoutesFromSidebar = (componentMapping: Record<string, React.ComponentType<any>>) => {
  const sections = getSidebarItemsBySection();
  
  return Object.entries(sections).map(([section, items]) => {
    // Format section name for parent component (e.g., "trips" -> "TripManagementPage")
    const sectionFormatted = section.charAt(0).toUpperCase() + section.slice(1);
    const parentComponentName = `${sectionFormatted}ManagementPage`;
    const ParentComponent = componentMapping[parentComponentName];
    
    if (!ParentComponent) {
      console.warn(`Parent component ${parentComponentName} not found in component mapping`);
      return null;
    }
    
    // Create the parent route
    const parentRoute = React.createElement(
      Route,
      { 
        key: section, 
        path: section, 
        element: React.createElement(ParentComponent, null) 
      },
      [
        // Add index route that redirects to dashboard
        React.createElement(
          Route,
          { 
            key: `${section}-index`, 
            index: true, 
            element: React.createElement(Navigate, { 
              to: `/${section}/dashboard`, 
              replace: true 
            }) 
          }
        ),
        // Add child routes for each item
        ...items.map((item: SidebarItem) => {
          // Extract the subroute from the path (e.g., "/trips/active" -> "active")
          const subRoute: string = item.path.split('/').slice(2).join('/');
          const componentName: string = item.component.split('/').pop() || '';
          const Component = componentMapping[componentName];

          if (!Component) {
            console.warn(`Component ${componentName} for path ${item.path} not found in component mapping`);
            return null;
          }

          return React.createElement(
            Route,
            {
              key: item.id,
              path: subRoute,
              element: React.createElement(Component, null)
            }
          );
        }).filter(Boolean) // Filter out null values
      ]
    );

    return parentRoute;
  });
};

// This function finds a menu item by its path
export const findSidebarItemByPath = (path: string): SidebarItem | undefined => {
  return sidebarConfig.find(item => item.path === path);
};

// This function returns the breadcrumb path for a given route
export const getBreadcrumbsFromPath = (path: string): {label: string, path: string}[] => {
  const parts = path.split('/').filter(Boolean);
  const breadcrumbs = [];
  
  let currentPath = '';
  for (let i = 0; i < parts.length; i++) {
    currentPath += `/${parts[i]}`;
    
    // Try to find an exact match first
    let item = findSidebarItemByPath(currentPath);
    
    // If no exact match, try to find the closest parent
    if (!item && i > 0) {
      item = sidebarConfig.find(item => item.path.startsWith(currentPath));
    }
    
    if (item) {
      breadcrumbs.push({
        label: item.label,
        path: item.path
      });
    }
  }
  
  return breadcrumbs;
};