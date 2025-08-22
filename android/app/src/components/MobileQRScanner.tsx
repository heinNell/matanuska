// src/components/MobileQRScanner.tsx
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { QrCode, Camera } from "lucide-react";
import { useCapacitor } from "../hooks/useCapacitor";
import { toast } from "sonner";

interface MobileQRScannerProps {
  onScanComplete: (data: string) => void;
}

export const MobileQRScanner: React.FC<MobileQRScannerProps> = ({ onScanComplete }) => {
  const { isNative, scanQRCode } = useCapacitor();
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const handleScan = async () => {
    if (!isNative) {
      toast.error("QR scanning is only available in the mobile app");
      return;
    }

    setIsScanning(true);
    try {
      const result = await scanQRCode();
      // Check if a result was returned and it's not null before calling onScanComplete
      if (result) {
        onScanComplete(result);
      }
    } catch (error) {
      // Using an "as Error" type assertion for better error handling
      toast.error(`Failed to scan QR code: ${(error as Error).message}`);
      console.error("QR scan error:", error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <QrCode className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Scan Vehicle QR Code</h3>
          <p className="text-sm text-gray-500 mb-4">
            Position the QR code within the camera view to scan
          </p>
          <Button onClick={handleScan} disabled={!isNative || isScanning} className="w-full">
            <Camera className="w-4 h-4 mr-2" />
            {isScanning ? "Scanning..." : isNative ? "Start Scan" : "Camera not available"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
