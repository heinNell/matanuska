import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWialonContext } from '../../context/WialonContext';
import { useWialonSession } from '../../hooks/useWialonSession';

interface NavigationProps {
  className?: string;
  variant?: 'sidebar' | 'topbar' | 'mobile';
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: string | number;
  children?: NavItem[];
}

// Navigation structure for the Wialon fleet management app
const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    path: '/dashboard'
  },
  {
    id: 'fleet',
    label: 'Fleet Management',
    icon: '🚛',
    path: '/fleet',
    children: [
      { id: 'units', label: 'Vehicles', icon: '🚗', path: '/fleet/units' },
      { id: 'drivers', label: 'Drivers', icon: '👤', path: '/fleet/drivers' },
      { id: 'groups', label: 'Groups', icon: '👥', path: '/fleet/groups' }
    ]
  },
  {
    id: 'tracking',
    label: 'Live Tracking',
    icon: '🗺️',
    path: '/tracking',
    children: [
      { id: 'map', label: 'Map View', icon: '🌍', path: '/tracking/map' },
      { id: 'list', label: 'List View', icon: '📋', path: '/tracking/list' },
      { id: 'routes', label: 'Routes', icon: '🛣️', path: '/tracking/routes' }
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: '📈',
    path: '/reports',
    children: [
      { id: 'activity', label: 'Activity Reports', icon: '⏱️', path: '/reports/activity' },
      { id: 'fuel', label: 'Fuel Reports', icon: '⛽', path: '/reports/fuel' },
      { id: 'mileage', label: 'Mileage Reports', icon: '📏', path: '/reports/mileage' },
      { id: 'custom', label: 'Custom Reports', icon: '🔧', path: '/reports/custom' }
    ]
  },
  {
    id: 'alerts',
    label: 'Alerts & Notifications',
    icon: '🚨',
    path: '/alerts'
  },
  {
    id: 'geofences',
    label: 'Geofences',
    icon: '📍',
    path: '/geofences'
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    icon: '🔧',
    path: '/maintenance',
    children: [
      { id: 'schedule', label: 'Schedule', icon: '📅', path: '/maintenance/schedule' },
      { id: 'history', label: 'History', icon: '📝', path: '/maintenance/history' },
      { id: 'reminders', label: 'Reminders', icon: '⏰', path: '/maintenance/reminders' }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '⚙️',
    path: '/settings'
  }
];

const WialonNavigation: React.FC<NavigationProps> = ({
  className = "",
  variant = 'sidebar',
  collapsed = false,
  onToggleCollapse
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { units, loading: unitsLoading } = useWialonContext();
  const { isConnected, status } = useWialonSession();

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Toggle expanded state for nav items with children
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Check if current path matches nav item
  const isActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Handle navigation
  const handleNavigation = (path: string) => {
    navigate(path);
    if (variant === 'mobile') {
      setMobileMenuOpen(false);
    }
  };

  // Get navigation items with badges
  const getNavItemsWithBadges = (): NavItem[] => {
    return NAV_ITEMS.map(item => {
      if (item.id === 'alerts') {
        // Add alert count badge
        const alertCount = units.filter(unit =>
          unit.lastMessage && (Date.now() - unit.lastMessage.timestamp * 1000) > 300000
        ).length;
        return { ...item, badge: alertCount > 0 ? alertCount : undefined };
      }
      if (item.id === 'fleet') {
        // Add units count badge
        return { ...item, badge: units.length };
      }
      return item;
    });
  };

  // Render navigation item
  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isItemActive = isActive(item.path);

    return (
      <div key={item.id} className="nav-item">
        <div
          className={`nav-link flex items-center px-${level * 2 + 3} py-2 cursor-pointer transition-colors ${
            isItemActive
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
              : 'hover:bg-gray-50 text-gray-700'
          } ${variant === 'mobile' ? 'px-4' : ''}`}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              handleNavigation(item.path);
            }
          }}
        >
          <span className="nav-icon mr-3 text-lg">{item.icon}</span>

          {(!collapsed || variant === 'mobile') && (
            <>
              <span className="nav-label flex-1">{item.label}</span>

              {item.badge && (
                <span className="nav-badge bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                  {item.badge}
                </span>
              )}

              {hasChildren && (
                <span className={`nav-arrow transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                  ▶
                </span>
              )}
            </>
          )}
        </div>

        {hasChildren && isExpanded && (!collapsed || variant === 'mobile') && (
          <div className="nav-children">
            {item.children?.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Sidebar variant
  if (variant === 'sidebar') {
    return (
      <nav className={`wialon-navigation sidebar ${className} ${collapsed ? 'collapsed' : ''}`}>
        <div className="nav-header p-4 border-b">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="nav-brand">
                <h1 className="text-xl font-bold text-gray-800">Fleet Manager</h1>
                <p className="text-xs text-gray-500">Wialon Integration</p>
              </div>
            )}
            <button
              className="nav-toggle p-1 rounded hover:bg-gray-100"
              onClick={onToggleCollapse}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <span className="transform transition-transform">
                {collapsed ? '▶' : '◀'}
              </span>
            </button>
          </div>
        </div>

        {/* Connection Status */}
        <div className={`connection-status p-3 border-b ${collapsed ? 'px-2' : ''}`}>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {!collapsed && (
              <div className="flex-1">
                <p className="text-xs font-medium">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </p>
                {status?.user && (
                  <p className="text-xs text-gray-500">{status.user.name}</p>
                )}
              </div>
            )}
          </div>

          {!collapsed && !unitsLoading && (
            <div className="mt-2 text-xs text-gray-600">
              <p>{units.length} vehicles tracked</p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="nav-content flex-1 overflow-y-auto">
          {getNavItemsWithBadges().map(item => renderNavItem(item))}
        </div>

        {/* Quick Actions */}
        {!collapsed && (
          <div className="nav-footer p-3 border-t">
            <div className="space-y-2">
              <button className="w-full text-left p-2 text-sm hover:bg-gray-50 rounded">
                🔄 Refresh Data
              </button>
              <button className="w-full text-left p-2 text-sm hover:bg-gray-50 rounded">
                📱 Mobile App
              </button>
              <button className="w-full text-left p-2 text-sm hover:bg-gray-50 rounded">
                ❓ Help & Support
              </button>
            </div>
          </div>
        )}
      </nav>
    );
  }

  // Top bar variant
  if (variant === 'topbar') {
    return (
      <nav className={`wialon-navigation topbar ${className}`}>
        <div className="nav-container flex items-center justify-between p-3 border-b bg-white">
          <div className="nav-brand flex items-center space-x-4">
            <h1 className="text-lg font-bold text-gray-800">Fleet Manager</h1>
            <div className="connection-status flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          <div className="nav-items hidden lg:flex items-center space-x-1">
            {getNavItemsWithBadges().slice(0, 6).map(item => (
              <div key={item.id} className="relative group">
                <button
                  className={`nav-item px-3 py-2 rounded text-sm transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                  {item.badge && (
                    <span className="badge ml-2 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>

                {item.children && (
                  <div className="dropdown absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <div className="py-1">
                      {item.children.map(child => (
                        <button
                          key={child.id}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                          onClick={() => handleNavigation(child.path)}
                        >
                          <span className="mr-2">{child.icon}</span>
                          {child.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="nav-actions flex items-center space-x-2">
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded">
              <span>☰</span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded" title="Settings">
              ⚙️
            </button>
            <button className="p-2 hover:bg-gray-100 rounded" title="User Profile">
              👤
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // Mobile variant
  if (variant === 'mobile') {
    return (
      <>
        {/* Mobile Menu Trigger */}
        <button
          className="mobile-menu-trigger fixed top-4 left-4 z-50 lg:hidden bg-white p-2 rounded-md shadow-lg"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="text-lg">☰</span>
        </button>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="mobile-menu-overlay fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Menu */}
        <nav
          className={`wialon-navigation mobile ${className} fixed left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform z-50 lg:hidden ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="nav-header p-4 border-b flex items-center justify-between">
            <div className="nav-brand">
              <h1 className="text-xl font-bold text-gray-800">Fleet Manager</h1>
              <p className="text-xs text-gray-500">Wialon Integration</p>
            </div>
            <button
              className="p-2 hover:bg-gray-100 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="nav-content flex-1 overflow-y-auto">
            {getNavItemsWithBadges().map(item => renderNavItem(item))}
          </div>
        </nav>
      </>
    );
  }

  return null;
};

export default WialonNavigation;
