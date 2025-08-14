import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";
// Import types only for type checking
import type { BarcodeScanner as BarcodeScannerType } from "@capacitor-community/barcode-scanner";
import type { Camera as CameraType } from "@capacitor/camera";

export const useCapacitor = () => {
  const [isNative, setIsNative] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  // State for dynamically loaded modules
  const [barcodeScannerModule, setBarcodeScannerModule] = useState<
    typeof BarcodeScannerType | null
  >(null);
  const [cameraModule, setCameraModule] = useState<typeof CameraType | null>(null);
  const [cameraEnums, setCameraEnums] = useState<{
    resultType: Record<string, any>;
    source: Record<string, any>;
  }>({ resultType: {}, source: {} });
  const [modulesLoaded, setModulesLoaded] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());

    // Dynamically load modules only when needed
    const loadModules = async () => {
      try {
        // Load BarcodeScanner module
        const barcodeModule = await import("@capacitor-community/barcode-scanner");
        setBarcodeScannerModule(barcodeModule.BarcodeScanner);

        // Load Camera module and enums
        const cameraModule = await import("@capacitor/camera");
        setCameraModule(cameraModule.Camera);
        setCameraEnums({
          resultType: cameraModule.CameraResultType,
          source: cameraModule.CameraSource,
        });

        setModulesLoaded(true);
        await checkPermissions();
      } catch (error) {
        console.error("Failed to load Capacitor modules:", error);
      }
    };

    if (Capacitor.isNativePlatform()) {
      loadModules();
    }
  }, []);

  const checkPermissions = async () => {
    if (!Capacitor.isNativePlatform() || !barcodeScannerModule) return;
    try {
      const status = await barcodeScannerModule.checkPermission({ force: false });
      setHasPermissions(status.granted ?? false);
    } catch (error) {
      console.error("Permission check failed:", error);
    }
  };

  const requestPermissions = async () => {
    if (!Capacitor.isNativePlatform() || !barcodeScannerModule) return false;
    try {
      const status = await barcodeScannerModule.checkPermission({ force: true });
      setHasPermissions(status.granted ?? false);
      return status.granted;
    } catch (error) {
      console.error("Permission request failed:", error);
      return false;
    }
  };

  const scanQRCode = async (): Promise<string | null> => {
    if (!Capacitor.isNativePlatform() || !barcodeScannerModule) return null;
    try {
      // Ensure modules are loaded and permissions granted
      if (!modulesLoaded) {
        console.warn("Capacitor modules not loaded yet");
        return null;
      }

      await requestPermissions();
      if (!hasPermissions) return null;

      // Hide the website background
      document.body.style.background = "transparent";
      await barcodeScannerModule.hideBackground();

      const result = await barcodeScannerModule.startScan();

      // Show the website background again
      document.body.style.background = "";
      await barcodeScannerModule.showBackground();

      if (result.hasContent) {
        return result.content;
      }
      return null;
    } catch (error) {
      console.error("QR scan failed:", error);
      // Ensure background is restored on error
      document.body.style.background = "";
      if (barcodeScannerModule) {
        await barcodeScannerModule.showBackground();
      }
      return null;
    }
  };

  const takePhoto = async (): Promise<string | null> => {
    if (!Capacitor.isNativePlatform() || !cameraModule || !cameraEnums.resultType) return null;
    try {
      // Ensure modules are loaded
      if (!modulesLoaded) {
        console.warn("Capacitor modules not loaded yet");
        return null;
      }

      const image = await cameraModule.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: cameraEnums.resultType.Base64,
        source: cameraEnums.source.Camera,
      });
      return image.base64String || null;
    } catch (error) {
      console.error("Photo capture failed:", error);
      return null;
    }
  };

  const stopScan = () => {
    if (Capacitor.isNativePlatform() && barcodeScannerModule) {
      barcodeScannerModule.stopScan();
      document.body.style.background = "";
      barcodeScannerModule.showBackground();
    }
  };

  return {
    isNative,
    hasPermissions,
    scanQRCode,
    takePhoto,
    stopScan,
    requestPermissions,
    modulesLoaded,
  };
};
