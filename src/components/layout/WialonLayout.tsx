import React, { useState, useEffect, ReactNode } from 'react';
import WialonNavigation from './WialonNavigation';
import { useWialonSession } from '../../hooks/useWialonSession';
import { useWialonContext } from '../../context/WialonContext';

interface WialonLayoutProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'fullscreen' | 'minimal';
  showNavigation?: boolean;
  showFooter?: boolean;
}

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: string;
}

const WialonLayout: React.FC<WialonLayoutProps> = ({
  children,
  className = "",
  variant = 'default',
  showNavigation = true,
  showFooter = true
}) => {
  const { isConnected, status, error } = useWialonSession();
  const { units, loading: unitsLoading, error: unitsError } = useWialonContext();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Auto-generate breadcrumbs based on current path
  useEffect(() => {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);

    const crumbs: BreadcrumbItem[] = [
      { label: 'Home', path: '/', icon: '🏠' }
    ];

    // Add breadcrumb items based on path segments
    let currentPath = '';
    segments.forEach(segment => {
      currentPath += `/${segment}`;
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      crumbs.push({ label, path: currentPath });
    });

    setBreadcrumbs(crumbs);
  }, []);

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setSidebarCollapsed(prev => !prev);
  };

  // Connection status component
  const ConnectionStatus = () => (
    <div className={`connection-indicator flex items-center space-x-2 px-3 py-1 rounded-md text-sm ${
      isConnected
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800'
    }`}>
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
      {status?.user && <span className="text-xs">({status.user.name})</span>}
    </div>
  );

  // Fleet status summary
  const FleetSummary = () => {
    if (unitsLoading) return <span className="text-gray-500">Loading...</span>;

    const onlineUnits = units.filter(unit =>
      unit.lastMessage && (Date.now() - unit.lastMessage.timestamp * 1000) < 300000
    ).length;
    const offlineUnits = units.length - onlineUnits;

    return (
      <div className="fleet-summary flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span>{onlineUnits} Online</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <span>{offlineUnits} Offline</span>
        </div>
        <div className="text-gray-500">
          Total: {units.length} vehicles
        </div>
      </div>
    );
  };

  // Breadcrumbs component
  const Breadcrumbs = () => (
    <nav className="breadcrumbs flex items-center space-x-1 text-sm text-gray-600">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-gray-400">/</span>}
          {crumb.path ? (
            <a
              href={crumb.path}
              className="hover:text-blue-600 flex items-center space-x-1"
            >
              {crumb.icon && <span>{crumb.icon}</span>}
              <span>{crumb.label}</span>
            </a>
          ) : (
            <span className="text-gray-800 flex items-center space-x-1">
              {crumb.icon && <span>{crumb.icon}</span>}
              <span>{crumb.label}</span>
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );

  // Error boundary component
  const ErrorDisplay = () => {
    if (!error && !unitsError) return null;

    return (
      <div className="error-banner bg-red-50 border border-red-200 p-3 mb-4 rounded-md">
        <div className="flex items-center space-x-2">
          <span className="text-red-500 text-lg">⚠️</span>
          <div>
            <p className="text-red-800 font-medium">System Error</p>
            <p className="text-red-600 text-sm">
              {error || unitsError}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Fullscreen layout (for maps, reports, etc.)
  if (variant === 'fullscreen') {
    return (
      <div className={`wialon-layout fullscreen ${className}`}>
        <ErrorDisplay />
        <main className="layout-content h-screen overflow-hidden">
          {children}
        </main>
      </div>
    );
  }

  // Minimal layout (for login, setup, etc.)
  if (variant === 'minimal') {
    return (
      <div className={`wialon-layout minimal ${className}`}>
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Fleet Manager</h1>
              <p className="mt-2 text-gray-600">Wialon Fleet Management System</p>
            </div>
          </div>
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default layout with sidebar navigation
  return (
    <div className={`wialon-layout default ${className} flex h-screen bg-gray-50`}>
      {/* Sidebar Navigation */}
      {showNavigation && (
        <div className={`layout-sidebar ${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
          <WialonNavigation
            variant="sidebar"
            collapsed={sidebarCollapsed}
            onToggleCollapse={handleSidebarToggle}
            className="h-full bg-white border-r"
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="layout-main flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <header className="layout-header bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="header-left flex items-center space-x-4">
            <Breadcrumbs />
          </div>

          <div className="header-right flex items-center space-x-4">
            <FleetSummary />
            <ConnectionStatus />
            <div className="current-time text-sm text-gray-600">
              {currentTime.toLocaleString()}
            </div>
          </div>
        </header>

        {/* Error Display */}
        <ErrorDisplay />

        {/* Page Content */}
        <main className="layout-content flex-1 overflow-auto p-6">
          {children}
        </main>

        {/* Footer */}
        {showFooter && (
          <footer className="layout-footer bg-white border-t px-6 py-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="footer-left">
                <p>© 2024 Fleet Manager - Wialon Integration</p>
              </div>

              <div className="footer-right flex items-center space-x-4">
                <a href="/help" className="hover:text-blue-600">Help</a>
                <a href="/support" className="hover:text-blue-600">Support</a>
                <a href="/privacy" className="hover:text-blue-600">Privacy</a>
                <div className="flex items-center space-x-1">
                  <span>Version:</span>
                  <span className="font-mono">1.0.0</span>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>

      {/* Mobile Navigation */}
      <WialonNavigation
        variant="mobile"
        className="lg:hidden"
      />
    </div>
  );
};

export default WialonLayout;
