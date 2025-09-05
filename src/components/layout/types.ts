import { ReactNode } from 'react';

// Navigation Component Types
export interface NavigationProps {
  className?: string;
  variant?: 'sidebar' | 'topbar' | 'mobile';
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: string | number;
  children?: NavItem[];
}

// Layout Component Types
export interface WialonLayoutProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'fullscreen' | 'minimal';
  showNavigation?: boolean;
  showFooter?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: string;
}

// Layout Context Types
export interface LayoutContextType {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
}

// Mobile Layout Types
export interface MobileLayoutState {
  menuOpen: boolean;
  orientation: 'portrait' | 'landscape';
  screenSize: 'mobile' | 'tablet' | 'desktop';
}

// Theme and Appearance Types
export interface LayoutTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  mode: 'light' | 'dark' | 'auto';
}

export interface LayoutConfiguration {
  theme: LayoutTheme;
  navigation: {
    position: 'left' | 'top' | 'right';
    collapsible: boolean;
    defaultCollapsed: boolean;
  };
  header: {
    showBreadcrumbs: boolean;
    showConnectionStatus: boolean;
    showFleetSummary: boolean;
    showDateTime: boolean;
  };
  footer: {
    show: boolean;
    showVersion: boolean;
    showLinks: boolean;
  };
}
