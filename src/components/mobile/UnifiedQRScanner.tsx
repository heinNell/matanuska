import React, { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { useNavigate } from "react-router-dom";
import { QrCode, Camera, X, MapPin, AlertCircle, Scan } from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Input } from "../ui/FormElements";
import { useCapacitor } from "../../hooks/useCapacitor";
import { toast } from "sonner";

interface UnifiedQRScannerProps {
  onScanComplete: (result: QRScanResult) => void;
  onClose?: () => void;
  title?: string;
  scanMode?: "barcode" | "photo" | "both";
  showLocationCapture?: boolean;
  placeholder?: string;
  className?: string;
}

interface QRScanResult {
  data: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  photo?: string;
  timestamp: string;
  scanMethod: "camera" | "manual" | "photo";
}

/**
 * Unified QR Scanner component that consolidates all QR scanning functionality
 * across the application, supporting both native and web environments
 */
const UnifiedQRScanner: React.FC<UnifiedQRScannerProps> = ({
  onScanComplete,
  onClose,
  title = "Scan QR Code",
  scanMode = "both",
  showLocationCapture = true,
  placeholder = "Or enter code manually",
  className = "",
}) => {
  const navigate = useNavigate();
  const { isNative, scanQRCode, takePhoto } = useCapacitor();

  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<GeolocationCoordinates | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (showLocationCapture) {
      getCurrentLocation();
    }
  }, [showLocationCapture]);

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      return;
    }

    setLocationLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      });
      setCurrentLocation(position.coords);
    } catch (err) {
      console.warn("Failed to get location:", err);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleCameraScan = async () => {
    if (!isNative) {
      toast.error("Camera scanning is only available in the mobile app");
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      let result: QRScanResult | null = null;

      if (scanMode === "barcode" || scanMode === "both") {
        const qrResult = await scanQRCode();
        if (qrResult) {
          result = {
            data: qrResult,
            timestamp: new Date().toISOString(),
            scanMethod: "camera",
            location: currentLocation
              ? {
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                  accuracy: currentLocation.accuracy,
                }
              : undefined,
          };
        }
      }

      if (!result && (scanMode === "photo" || scanMode === "both")) {
        const photo = await takePhoto();
        if (photo) {
          result = {
            data: "",
            photo: photo,
            timestamp: new Date().toISOString(),
            scanMethod: "photo",
            location: currentLocation
              ? {
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                  accuracy: currentLocation.accuracy,
                }
              : undefined,
          };
        }
      }

      if (result) {
        onScanComplete(result);
      } else {
        setError("No QR code detected or scan was cancelled");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to scan QR code";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualEntry = () => {
    if (!manualCode.trim()) {
      setError("Please enter a code");
      return;
    }

    const result: QRScanResult = {
      data: manualCode.trim(),
      timestamp: new Date().toISOString(),
      scanMethod: "manual",
      location: currentLocation
        ? {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            accuracy: currentLocation.accuracy,
          }
        : undefined,
    };

    onScanComplete(result);
  };

  const handleClose = () => {
    setManualCode("");
    setError(null);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}
    >
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center">
              <QrCode className="h-5 w-5 mr-2" />
              {title}
            </h3>
            <Button variant="outline" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Location Status */}
          {showLocationCapture && (
            <div className="flex items-center text-xs text-gray-500">
              <MapPin className="h-3 w-3 mr-1" />
              {locationLoading
                ? "Getting location..."
                : currentLocation
                  ? `Location captured (±${Math.round(currentLocation.accuracy || 0)}m)`
                  : "Location unavailable"}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-center p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          {/* Camera Scan Button */}
          <Button
            onClick={handleCameraScan}
            disabled={!isNative || isScanning}
            className="w-full"
            size="lg"
          >
            {isScanning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Scanning...
              </>
            ) : (
              <>
                <Camera className="h-5 w-5 mr-2" />
                {isNative ? `Scan with Camera` : "Camera not available"}
              </>
            )}
          </Button>

          {/* Manual Entry */}
          <div className="border-t pt-4">
            <div className="space-y-2">
              <Input
                value={manualCode}
                onChange={(e) => {
                  setManualCode(e.target.value);
                  setError(null);
                }}
                placeholder={placeholder}
                className="text-center"
              />
              <Button
                onClick={handleManualEntry}
                variant="outline"
                className="w-full"
                disabled={!manualCode.trim()}
              >
                <Scan className="h-4 w-4 mr-2" />
                Enter Code
              </Button>
            </div>
          </div>

          {/* Web Fallback Message */}
          {!isNative && (
            <div className="text-xs text-gray-500 text-center">
              Install the mobile app for full camera functionality
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedQRScanner;
