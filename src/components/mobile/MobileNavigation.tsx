import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Plus, 
  BarChart3, 
  User,
  Scan,
  Settings,
  Bell
} from 'lucide-react';

interface MobileNavigationProps {
  onNewTyre?: () => void;
  onScanTyre?: () => void;
  notificationCount?: number;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  onNewTyre,
  onScanTyre,
  notificationCount = 0
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/tyres',
      action: () => navigate('/tyres')
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      path: '/tyres/search',
      action: () => navigate('/tyres')
    },
    {
      id: 'scan',
      label: 'Scan',
      icon: Scan,
      path: '/tyres/scan',
      action: onScanTyre || (() => {})
    },
    {
      id: 'add',
      label: 'Add',
      icon: Plus,
      path: '/tyres/add',
      action: onNewTyre || (() => navigate('/tyres/add'))
    },
    {
      id: 'stats',
      label: 'Stats',
      icon: BarChart3,
      path: '/tyres/stats',
      action: () => navigate('/tyres')
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile',
      action: () => navigate('/profile'),
      hidden: true // Hidden for now, will be enabled in future release
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings',
      action: () => navigate('/settings'),
      hidden: true // Hidden for now, will be enabled in future release
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path || 
           (path === '/tyres' && location.pathname.startsWith('/tyres'));
  };

  return (
    <div className="mobile-navigation">
      {/* Top notification bar (optional) */}
      {notificationCount > 0 && (
        <div className="notification-bar">
          <div className="flex items-center justify-between px-4 py-2 bg-blue-50 border-b">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                {notificationCount} pending inspection{notificationCount > 1 ? 's' : ''}
              </span>
            </div>
            <button className="text-blue-600 text-sm font-medium">
              View
            </button>
          </div>
        </div>
      )}

      {/* Bottom navigation */}
      <nav className="bottom-navigation">
        <div className="nav-container">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`nav-item ${active ? 'active' : ''}`}
              >
                <div className="nav-icon">
                  <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                  {item.id === 'scan' && (
                    <div className="scan-indicator" />
                  )}
                </div>
                <span className={`nav-label ${active ? 'text-blue-600' : 'text-gray-400'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <style>{`
        .mobile-navigation {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 50;
        }

        .notification-bar {
          background: white;
          border-top: 1px solid #e5e7eb;
        }

        .bottom-navigation {
          background: white;
          border-top: 1px solid #e5e7eb;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
          padding-bottom: env(safe-area-inset-bottom, 0);
        }

        .nav-container {
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 8px 0;
          min-height: 60px;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          border: none;
          background: none;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 60px;
          position: relative;
        }

        .nav-item:active {
          transform: scale(0.95);
        }

        .nav-item.active .nav-icon {
          transform: scale(1.1);
        }

        .nav-icon {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
          transition: transform 0.2s ease;
        }

        .scan-indicator {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background: #10b981;
          border: 2px solid white;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .nav-label {
          font-size: 10px;
          font-weight: 500;
          text-align: center;
          transition: color 0.2s ease;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        /* Floating action button style for scan */
        .nav-item[data-scan="true"] {
          position: relative;
        }

        .nav-item[data-scan="true"] .nav-icon {
          background: #3b82f6;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          margin-bottom: 8px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .nav-item[data-scan="true"] .nav-icon svg {
          color: white !important;
        }

        /* Responsive adjustments */
        @media (max-width: 320px) {
          .nav-container {
            padding: 6px 0;
          }
          
          .nav-item {
            padding: 6px 8px;
            min-width: 50px;
          }
          
          .nav-label {
            font-size: 9px;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .bottom-navigation {
            background: #1f2937;
            border-top-color: #374151;
          }
          
          .notification-bar {
            background: #1f2937;
          }
        }
      `}</style>
    </div>
  );
};

export default MobileNavigation;
