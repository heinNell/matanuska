import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.matanuska.fleet',
  appName: 'Matanuska Fleet',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    hostname: 'matanuska-fleet.app',
    iosScheme: 'https',
  },
  plugins: {
    // Camera optimization for native performance
    Camera: {
      permissions: [
        'camera',
        'photos'
      ]
    },

    // Geolocation with background tracking
    Geolocation: {
      permissions: [
        'location'
      ],
      enableBackground: true,
      backgroundLocationUpdates: true,
      distanceFilter: 10, // meters
      desiredAccuracy: 'high',
      stationaryRadius: 20
    },

    // App lifecycle management
    App: {
      launchAutoHide: true,
      statusBarStyle: 'light-content',
      backgroundColor: '#2563eb', // Blue theme
      allowMixedContent: false
    },

    // Local notifications for offline alerts
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#2563eb',
      sound: 'beep.wav',
    },

    // Push notifications
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
      permissions: ['alert', 'badge', 'sound']
    },

    // Status bar configuration
    StatusBar: {
      backgroundColor: '#2563eb',
      style: 'light',
      overlay: false
    },

    // Keyboard handling for forms
    Keyboard: {
      resize: 'ionic',
      resizeOnFullScreen: true,
      style: 'dark'
    },

    // Network detection
    Network: {
      // No specific config needed
    },

    // Device info
    Device: {
      // No specific config needed
    },

    // Haptics for tactile feedback
    Haptics: {
      // No specific config needed
    },

    // File system access
    Filesystem: {
      permissions: ['read', 'write'],
      directories: ['documents', 'cache']
    },

    // Secure storage for sensitive data
    Preferences: {
      group: 'com.matanuska.fleet.preferences'
    },

    // Toast messages
    Toast: {
      // No specific config needed
    },

    // Screen reader support
    ScreenReader: {
      // No specific config needed
    }
  },

  // Android specific configuration
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false, // Set to true in development

    // Background modes for location tracking
    backgroundColor: '#2563eb',

    // Intent filters for deep linking
    intentFilters: [
      {
        action: 'android.intent.action.VIEW',
        category: ['android.intent.category.DEFAULT', 'android.intent.category.BROWSABLE'],
        data: {
          scheme: 'matanuska',
          host: 'fleet'
        }
      }
    ],

    // Permissions
    permissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_BACKGROUND_LOCATION',
      'android.permission.CAMERA',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.VIBRATE',
      'android.permission.WAKE_LOCK',
      'android.permission.RECEIVE_BOOT_COMPLETED'
    ]
  },

  // iOS specific configuration
  ios: {
    scheme: 'Matanuska Fleet',
    contentInset: 'automatic',

    // Background modes
    backgroundModes: [
      'location',
      'background-processing',
      'background-fetch'
    ],

    // URL schemes for deep linking
    urlScheme: 'matanuska-fleet',

    // Privacy descriptions
    privacyDescriptions: {
      'NSCameraUsageDescription': 'The app uses camera to capture photos for job cards, parts inventory, and workshop documentation.',
      'NSLocationAlwaysAndWhenInUseUsageDescription': 'The app uses location to track vehicle positions, optimize routes, and provide location-based services.',
      'NSLocationWhenInUseUsageDescription': 'The app uses location to track vehicle positions and provide location-based services.',
      'NSPhotoLibraryUsageDescription': 'The app needs access to photo library to save and manage captured images.',
      'NSMicrophoneUsageDescription': 'The app uses microphone for voice notes in job cards and inspections.'
    }
  },

  // Development server configuration
  server: process.env.NODE_ENV === 'development' ? {
    url: 'http://localhost:5173',
    cleartext: true
  } : {
    androidScheme: 'https',
    iosScheme: 'https'
  }
};

export default config;
