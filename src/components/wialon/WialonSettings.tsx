import React, { useState, useEffect } from 'react';
import { useWialonSession } from '../../hooks/useWialonSession';
import { useToast } from '../ui/Toast';
import type { WialonAppSettings } from '../../types/wialon-complete';

interface WialonSettingsProps {
  className?: string;
  onSettingsChanged?: (settings: WialonAppSettings) => void;
}

// Default settings structure
const DEFAULT_SETTINGS: WialonAppSettings = {
  connection: {
    baseUrl: 'https://hst-api.wialon.com',
    token: '',
    sessionTimeout: 3600, // 1 hour
    retryAttempts: 3,
    retryDelay: 2000,
    enableAutoReconnect: true,
    debug: false
  },
  units: {
    refreshInterval: 30000, // 30 seconds
    enableRealTimeUpdates: true,
    maxUnitsToLoad: 100,
    defaultFields: ['position', 'sensors', 'counters', 'connectivity']
  },
  map: {
    defaultCenter: { lat: -1.292066, lng: 36.821945 }, // Nairobi
    defaultZoom: 10,
    enableClustering: true,
    clusterMaxZoom: 15,
    showTrails: true,
    trailDuration: 24 // hours
  },
  alerts: {
    enableNotifications: true,
    soundEnabled: true,
    alertTypes: ['offline', 'speeding', 'geofence', 'fuel', 'maintenance'],
    checkInterval: 60000 // 1 minute
  },
  reports: {
    defaultTimeRange: 'week',
    maxHistoryDays: 90,
    enableScheduledReports: false,
    emailNotifications: false
  },
  ui: {
    theme: 'light',
    language: 'en',
    compactMode: false,
    showAdvancedFeatures: false
  }
};

const WialonSettings: React.FC<WialonSettingsProps> = ({
  className = "",
  onSettingsChanged
}) => {
  const { isConnected, connect, status, error } = useWialonSession();
  const { showToast } = useToast();

  const [settings, setSettings] = useState<WialonAppSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<'connection' | 'units' | 'map' | 'alerts' | 'reports' | 'ui'>('connection');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('wialon-app-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (err) {
        console.error('Failed to parse saved settings:', err);
        showToast('Failed to load saved settings', 'error');
      }
    }
  }, [showToast]);

  // Handle settings changes
  const handleSettingChange = (section: keyof WialonAppSettings, key: string, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setIsDirty(true);
  };

  // Handle array settings (like alert types)
  const handleArraySetting = (section: keyof WialonAppSettings, key: string, item: string, checked: boolean) => {
    setSettings(prev => {
      const sectionData = prev[section] as Record<string, unknown>;
      const currentArray = sectionData[key] as string[];
      const newArray = checked
        ? [...currentArray, item]
        : currentArray.filter(i => i !== item);

      return {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: newArray
        }
      };
    });
    setIsDirty(true);
  };  // Save settings
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('wialon-app-settings', JSON.stringify(settings));
      onSettingsChanged?.(settings);
      setIsDirty(false);
      showToast('Settings saved successfully', 'success');
    } catch (err) {
      console.error('Failed to save settings:', err);
      showToast('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleResetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      setSettings(DEFAULT_SETTINGS);
      setIsDirty(true);
    }
  };

  // Test connection
  const handleTestConnection = async () => {
    if (!settings.connection.token) {
      showToast('Please enter a valid token', 'error');
      return;
    }

    setTestingConnection(true);
    try {
      await connect(settings.connection.token);
      showToast('Connection test successful!', 'success');
    } catch (err) {
      console.error('Connection test failed:', err);
      showToast('Connection test failed', 'error');
    } finally {
      setTestingConnection(false);
    }
  };

  // Tab navigation
  const tabs = [
    { id: 'connection', label: 'Connection', icon: '🔌' },
    { id: 'units', label: 'Units', icon: '🚛' },
    { id: 'map', label: 'Map', icon: '🗺️' },
    { id: 'alerts', label: 'Alerts', icon: '🚨' },
    { id: 'reports', label: 'Reports', icon: '📊' },
    { id: 'ui', label: 'Interface', icon: '🎨' }
  ] as const;

  return (
    <div className={`wialon-settings ${className}`}>
      <div className="settings-header flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Wialon Settings</h2>
        <div className="settings-actions space-x-2">
          <button
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
            onClick={handleResetToDefaults}
          >
            Reset to Defaults
          </button>
          <button
            className={`px-4 py-2 text-sm rounded-md font-medium ${
              isDirty
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleSaveSettings}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Connection Status */}
      {error && (
        <div className="error-message bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="settings-content flex flex-col lg:flex-row gap-6">
        {/* Tabs Navigation */}
        <div className="settings-nav lg:w-48">
          <div className="nav-tabs space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`w-full text-left p-3 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div className="settings-panel flex-1 bg-white p-6 rounded-lg border">
          {/* Connection Settings */}
          {activeTab === 'connection' && (
            <div className="connection-settings">
              <h3 className="text-lg font-semibold mb-4">Connection Configuration</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Server URL</label>
                  <input
                    type="url"
                    className="w-full p-2 border rounded-md"
                    value={settings.connection.baseUrl}
                    onChange={(e) => handleSettingChange('connection', 'baseUrl', e.target.value)}
                    placeholder="https://hst-api.wialon.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Wialon server base URL</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Access Token</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      className="flex-1 p-2 border rounded-md"
                      value={settings.connection.token}
                      onChange={(e) => handleSettingChange('connection', 'token', e.target.value)}
                      placeholder="Enter your Wialon API token"
                    />
                    <button
                      className={`px-4 py-2 text-sm rounded-md ${
                        testingConnection
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                      onClick={handleTestConnection}
                      disabled={testingConnection || !settings.connection.token}
                    >
                      {testingConnection ? 'Testing...' : 'Test'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Session Timeout (seconds)</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded-md"
                      value={settings.connection.sessionTimeout}
                      onChange={(e) => handleSettingChange('connection', 'sessionTimeout', parseInt(e.target.value))}
                      min="300"
                      max="86400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Retry Attempts</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded-md"
                      value={settings.connection.retryAttempts}
                      onChange={(e) => handleSettingChange('connection', 'retryAttempts', parseInt(e.target.value))}
                      min="1"
                      max="10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.connection.enableAutoReconnect}
                      onChange={(e) => handleSettingChange('connection', 'enableAutoReconnect', e.target.checked)}
                      className="mr-2"
                    />
                    Enable automatic reconnection
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.connection.debug}
                      onChange={(e) => handleSettingChange('connection', 'debug', e.target.checked)}
                      className="mr-2"
                    />
                    Enable debug logging
                  </label>
                </div>

                {/* Connection Status */}
                <div className="connection-status p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="font-medium">
                      Status: {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  {status && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Server: {status.host}</p>
                      {status.user && <p>User: {status.user.name}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Units Settings */}
          {activeTab === 'units' && (
            <div className="units-settings">
              <h3 className="text-lg font-semibold mb-4">Vehicle Units Configuration</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Refresh Interval (ms)</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={settings.units.refreshInterval}
                    onChange={(e) => handleSettingChange('units', 'refreshInterval', parseInt(e.target.value))}
                  >
                    <option value={15000}>15 seconds</option>
                    <option value={30000}>30 seconds</option>
                    <option value={60000}>1 minute</option>
                    <option value={120000}>2 minutes</option>
                    <option value={300000}>5 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Maximum Units to Load</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md"
                    value={settings.units.maxUnitsToLoad}
                    onChange={(e) => handleSettingChange('units', 'maxUnitsToLoad', parseInt(e.target.value))}
                    min="10"
                    max="1000"
                  />
                </div>

                <div>
                  <label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={settings.units.enableRealTimeUpdates}
                      onChange={(e) => handleSettingChange('units', 'enableRealTimeUpdates', e.target.checked)}
                      className="mr-2"
                    />
                    Enable real-time updates
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Default Data Fields</label>
                  <div className="space-y-1">
                    {['position', 'sensors', 'counters', 'connectivity', 'status'].map(field => (
                      <label key={field} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.units.defaultFields.includes(field)}
                          onChange={(e) => handleArraySetting('units', 'defaultFields', field, e.target.checked)}
                          className="mr-2"
                        />
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Map Settings */}
          {activeTab === 'map' && (
            <div className="map-settings">
              <h3 className="text-lg font-semibold mb-4">Map Configuration</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Default Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      className="w-full p-2 border rounded-md"
                      value={settings.map.defaultCenter.lat}
                      onChange={(e) => handleSettingChange('map', 'defaultCenter', {
                        ...settings.map.defaultCenter,
                        lat: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Default Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      className="w-full p-2 border rounded-md"
                      value={settings.map.defaultCenter.lng}
                      onChange={(e) => handleSettingChange('map', 'defaultCenter', {
                        ...settings.map.defaultCenter,
                        lng: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Default Zoom Level</label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    className="w-full"
                    value={settings.map.defaultZoom}
                    onChange={(e) => handleSettingChange('map', 'defaultZoom', parseInt(e.target.value))}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>World (1)</span>
                    <span>Current: {settings.map.defaultZoom}</span>
                    <span>Street (20)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.map.enableClustering}
                      onChange={(e) => handleSettingChange('map', 'enableClustering', e.target.checked)}
                      className="mr-2"
                    />
                    Enable marker clustering
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.map.showTrails}
                      onChange={(e) => handleSettingChange('map', 'showTrails', e.target.checked)}
                      className="mr-2"
                    />
                    Show vehicle trails
                  </label>
                </div>

                {settings.map.showTrails && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Trail Duration (hours)</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded-md"
                      value={settings.map.trailDuration}
                      onChange={(e) => handleSettingChange('map', 'trailDuration', parseInt(e.target.value))}
                      min="1"
                      max="168"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Alerts Settings */}
          {activeTab === 'alerts' && (
            <div className="alerts-settings">
              <h3 className="text-lg font-semibold mb-4">Alert Configuration</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.alerts.enableNotifications}
                      onChange={(e) => handleSettingChange('alerts', 'enableNotifications', e.target.checked)}
                      className="mr-2"
                    />
                    Enable alert notifications
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.alerts.soundEnabled}
                      onChange={(e) => handleSettingChange('alerts', 'soundEnabled', e.target.checked)}
                      className="mr-2"
                    />
                    Enable alert sounds
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Check Interval</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={settings.alerts.checkInterval}
                    onChange={(e) => handleSettingChange('alerts', 'checkInterval', parseInt(e.target.value))}
                  >
                    <option value={30000}>30 seconds</option>
                    <option value={60000}>1 minute</option>
                    <option value={120000}>2 minutes</option>
                    <option value={300000}>5 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Alert Types</label>
                  <div className="space-y-1">
                    {['offline', 'speeding', 'geofence', 'fuel', 'maintenance', 'sos', 'unauthorized'].map(type => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.alerts.alertTypes.includes(type)}
                          onChange={(e) => handleArraySetting('alerts', 'alertTypes', type, e.target.checked)}
                          className="mr-2"
                        />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reports Settings */}
          {activeTab === 'reports' && (
            <div className="reports-settings">
              <h3 className="text-lg font-semibold mb-4">Reports Configuration</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Default Time Range</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={settings.reports.defaultTimeRange}
                    onChange={(e) => handleSettingChange('reports', 'defaultTimeRange', e.target.value)}
                  >
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Maximum History (days)</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md"
                    value={settings.reports.maxHistoryDays}
                    onChange={(e) => handleSettingChange('reports', 'maxHistoryDays', parseInt(e.target.value))}
                    min="7"
                    max="365"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.reports.enableScheduledReports}
                      onChange={(e) => handleSettingChange('reports', 'enableScheduledReports', e.target.checked)}
                      className="mr-2"
                    />
                    Enable scheduled reports
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.reports.emailNotifications}
                      onChange={(e) => handleSettingChange('reports', 'emailNotifications', e.target.checked)}
                      className="mr-2"
                    />
                    Email report notifications
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* UI Settings */}
          {activeTab === 'ui' && (
            <div className="ui-settings">
              <h3 className="text-lg font-semibold mb-4">Interface Preferences</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Theme</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={settings.ui.theme}
                    onChange={(e) => handleSettingChange('ui', 'theme', e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Language</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={settings.ui.language}
                    onChange={(e) => handleSettingChange('ui', 'language', e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.ui.compactMode}
                      onChange={(e) => handleSettingChange('ui', 'compactMode', e.target.checked)}
                      className="mr-2"
                    />
                    Compact mode (denser layouts)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.ui.showAdvancedFeatures}
                      onChange={(e) => handleSettingChange('ui', 'showAdvancedFeatures', e.target.checked)}
                      className="mr-2"
                    />
                    Show advanced features
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WialonSettings;
