import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.f9673ef592af4161819b7d91c56bee83',
  appName: 'matanuskatransport',
  webDir: 'dist',
  server: {
    url: 'https://f9673ef5-92af-4161-819b-7d91c56bee83.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    BarcodeScanner: {
      allowDuplicates: true,
      showZoom: true,
      showFlip: true,
      androidScanningLibrary: 'zxing'
    },
    Camera: {
      saveToGallery: false,
      resultType: 'base64'
    }
  }
};

export default config;
