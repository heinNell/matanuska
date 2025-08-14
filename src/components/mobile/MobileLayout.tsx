import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
// Import NavigationBar conditionally to avoid build errors
// import { NavigationBar } from '@capacitor/navigation-bar';
import { App } from '@capacitor/app';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showStatusBar?: boolean;
  statusBarStyle?: 'light' | 'dark';
  backgroundColor?: string;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title = 'Tyre Management',
  showStatusBar = true,
  statusBarStyle = 'dark',
  backgroundColor = '#ffffff'
}) => {
  const [isNativeApp, setIsNativeApp] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useEffect(() => {
    setIsNativeApp(Capacitor.isNativePlatform());
    
    if (Capacitor.isNativePlatform()) {
      initializeNativeFeatures();
    }
  }, []);

  const initializeNativeFeatures = async () => {
    try {
      // Set status bar style
      if (showStatusBar) {
        await StatusBar.setStyle({
          style: statusBarStyle === 'light' ? Style.Light : Style.Dark
        });
        
        await StatusBar.setBackgroundColor({
          color: backgroundColor
        });
      } else {
        await StatusBar.hide();
      }

      // Set navigation bar color on Android
      // Commented out due to missing @capacitor/navigation-bar package
      // if (Capacitor.getPlatform() === 'android') {
      //   await NavigationBar.setColor({
      //     color: backgroundColor
      //   });
      // }

      // Get device info
      const info = await App.getInfo();
      setDeviceInfo(info);

    } catch (error) {
      console.error('Failed to initialize native features:', error);
    }
  };

  return (
    <div className={`mobile-layout ${isNativeApp ? 'native-app' : 'web-app'}`}>
      {/* Safe area handling for iOS */}
      <div className="safe-area-top" />
      
      {/* Title bar */}
      <div className="mobile-title-bar">
        <h1 className="mobile-title">{title}</h1>
        {deviceInfo && (
          <div className="device-info-indicator">
            <span className="device-badge">{deviceInfo.platform}</span>
            <span className="device-version">{deviceInfo.appVersion}</span>
          </div>
        )}
      </div>
      
      {/* Main content area */}
      <div className="mobile-content">
        {children}
      </div>
      
      {/* Safe area handling for iOS */}
      <div className="safe-area-bottom" />

      {/* Mobile-specific styles */}
      <style>{`
        .mobile-layout {
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .native-app {
          /* iOS safe area support */
          padding-top: env(safe-area-inset-top, 0);
          padding-bottom: env(safe-area-inset-bottom, 0);
          padding-left: env(safe-area-inset-left, 0);
          padding-right: env(safe-area-inset-right, 0);
        }

        .web-app {
          /* Web fallback */
          padding-top: 0;
        }

        .mobile-title-bar {
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          background-color: ${backgroundColor};
        }
        
        .mobile-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }
        
        .device-info-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .device-badge {
          font-size: 12px;
          padding: 2px 6px;
          background-color: #f0f0f0;
          border-radius: 4px;
          color: #666;
        }
        
        .device-version {
          font-size: 11px;
          color: #888;
        }
        
        .mobile-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .safe-area-top {
          height: env(safe-area-inset-top, 0);
          background-color: ${backgroundColor};
        }

        .safe-area-bottom {
          height: env(safe-area-inset-bottom, 0);
          background-color: ${backgroundColor};
        }

        /* Optimize for mobile interactions */
        * {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        input, textarea, [contenteditable] {
          -webkit-user-select: text;
          -khtml-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
        }

        /* Prevent zoom on input focus */
        input[type="color"],
        input[type="date"],
        input[type="datetime"],
        input[type="datetime-local"],
        input[type="email"],
        input[type="month"],
        input[type="number"],
        input[type="password"],
        input[type="search"],
        input[type="tel"],
        input[type="text"],
        input[type="time"],
        input[type="url"],
        input[type="week"],
        select:focus,
        textarea {
          font-size: 16px;
        }

        /* Custom scrollbar for mobile */
        ::-webkit-scrollbar {
          width: 4px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 2px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }

        /* Hide scrollbar when not needed */
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        /* Loading animations */
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Mobile-optimized buttons */
        .mobile-button {
          min-height: 44px;
          min-width: 44px;
          padding: 12px 16px;
          font-size: 16px;
        }

        /* Large touch targets */
        .touch-target {
          min-height: 44px;
          min-width: 44px;
        }

        /* Prevent text selection on UI elements */
        .no-select {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>
    </div>
  );
};

export default MobileLayout;
