// src/components/MobileQRScanner.tsx
import * as React from "react";                           // ◀ namespace import = no esModuleInterop needed
import { useState } from "react";
import { Card, CardContent } from "./ui/card"; // alias works inside main src tree
import { Button }            from "./ui/button";
import { QrCode, Camera }    from "lucide-react";
import { useCapacitor }      from "@/hooks/useCapacitor"; // alias updated for consistency
import { toast }             from "sonner";

interface MobileQRScannerProps {
  onScanComplete: (data: string) => void;
}

export const MobileQRScanner: React.FC<MobileQRScannerProps> = ({ onScanComplete }) => {
  const { isNative, scanQRCode } = useCapacitor();
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    if (!isNative) {
      toast.error("QR scanning is only available in the mobile app");
      return;
    }

    setIsScanning(true);
    try {
      const result = await scanQRCode();
      if (result) onScanComplete(result);                 // safe – result is non-null
    } catch (err) {
      toast.error(`Failed to scan QR code: ${(err as Error).message}`);
      console.error("QR scan error:", err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <QrCode className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-medium">Scan Vehicle&nbsp;QR&nbsp;Code</h3>
        <p className="mb-4 text-sm text-gray-500">
          Position the QR code within the camera view to scan
        </p>

        <Button onClick={handleScan} disabled={!isNative || isScanning} className="w-full">
          <Camera className="mr-2 h-4 w-4" />
          {isScanning ? "Scanning…" : isNative ? "Start Scan" : "Camera not available"}
        </Button>
      </CardContent>
    </Card>
  );
};
