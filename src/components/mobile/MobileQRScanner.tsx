import React, { useState } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { QrCode, Camera } from "lucide-react";
import { useCapacitor } from "../../hooks/useCapacitor";
import UnifiedQRScanner from "./UnifiedQRScanner";
import { toast } from "sonner";

interface MobileQRScannerProps {
  onScanComplete: (data: string) => void;
  onClose?: () => void;
  title?: string;
}

export const MobileQRScanner: React.FC<MobileQRScannerProps> = ({
  onScanComplete,
  onClose,
  title = "Scan Vehicle QR Code"
}) => {
  const handleScanResult = (result: any) => {
    if (result.data) {
      onScanComplete(result.data);
    } else {
      toast.error("No QR code data found");
    }
  };

  return (
    <UnifiedQRScanner
      onScanComplete={handleScanResult}
      onClose={onClose}
      title={title}
      scanMode="barcode"
      showLocationCapture={false}
      placeholder="Enter vehicle code manually"
    />
  );
};
