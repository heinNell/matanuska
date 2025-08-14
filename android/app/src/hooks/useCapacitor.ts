// src/hooks/useCapacitor.ts
import { useState, useEffect } from "react";
import { isPlatform } from "@ionic/react";
import { BarcodeScanner } from "@capacitor-community/barcode-scanner";

// Define the return type of our hook for better type safety
interface CapacitorHook {
  isNative: boolean;
  scanQRCode: () => Promise<string | null>;
}

export const useCapacitor = (): CapacitorHook => {
  const [isNative, setIsNative] = useState<boolean>(false);

  useEffect(() => {
    setIsNative(isPlatform("capacitor"));
  }, []);

  const scanQRCode = async (): Promise<string | null> => {
    if (!isNative) {
      console.error("QR scanning is only available on a native platform.");
      return null;
    }

    try {
      // Check for camera permissions
      const status = await BarcodeScanner.checkPermission({ force: true });

      if (status.granted) {
        // Prepare and start the scanner
        await BarcodeScanner.prepare();
        const result = await BarcodeScanner.startScan();

        // Stop the scan after a result is found
        await BarcodeScanner.stopScan();

        if (result.hasContent) {
          return result.content;
        }
      } else {
        throw new Error("Camera permissions not granted.");
      }
    } catch (error) {
      console.error("Barcode scanner error:", error);
      // It's good practice to throw the error so the calling function can handle it
      throw error;
    } finally {
      // Ensure the scanner is always stopped
      await BarcodeScanner.stopScan();
    }

    return null;
  };

  return { isNative, scanQRCode };
};
