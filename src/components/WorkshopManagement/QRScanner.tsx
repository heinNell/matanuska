import React from "react";
import { useNavigate } from "react-router-dom";
import UnifiedQRScanner from "../mobile/UnifiedQRScanner";

interface QRScannerProps {
  onScan?: (data: string) => void;
  onClose?: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const navigate = useNavigate();

  const handleScanResult = (result: any) => {
    const data = result.data;

    console.log("QR Scan result:", data);

    // Process the scanned data - could be a URL or a JSON string
    try {
      // First check if it's a workshop-related URL
      if (data.includes("/workshop/")) {
        // It's a URL, navigate to it
        navigate(data);
      } else if (data.startsWith("{") && data.endsWith("}")) {
        // It's a JSON string, parse it
        const parsedData = JSON.parse(data);

        // Handle different types of QR data
        if (parsedData.type === "fleet") {
          navigate(`/workshop/driver-inspection?fleet=${parsedData.fleetNumber}`);
        } else if (parsedData.type === "tyre") {
          navigate(
            `/workshop/tyre-inspection?fleet=${parsedData.fleetNumber}&position=${parsedData.position}`
          );
        } else if (parsedData.type === "part") {
          navigate(`/workshop/part-details?partNumber=${parsedData.partNumber}`);
        } else {
          // Default handling
          if (onScan) onScan(data);
        }
      } else {
        // Just pass the raw data to the handler
        if (onScan) onScan(data);
      }
    } catch (err) {
      console.error("Invalid QR code format:", err);
      // Still pass the raw data if parsing fails
      if (onScan) onScan(data);
    }
  };

  return (
    <UnifiedQRScanner
      onScanComplete={handleScanResult}
      onClose={onClose}
      title="Workshop QR Scanner"
      scanMode="barcode"
      showLocationCapture={false}
      placeholder="Enter workshop code manually"
    />
  );
};

export default QRScanner;
