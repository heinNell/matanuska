import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import type { BarcodeScanner as BarcodeScannerType } from '@capacitor-community/barcode-scanner';
import { Scan, Camera as CameraIcon, X, Check, RefreshCw, Info } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Card, CardContent, CardHeader } from '../../ui/Card';

interface TyreScannerProps {
  onScanComplete: (result: ScanResult) => void;
  onCancel: () => void;
  scanMode?: 'barcode' | 'photo' | 'both';
  title?: string;
}

interface ScanResult {
  barcode?: string;
  photo?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
}

const TyreScanner: React.FC<TyreScannerProps> = ({
  onScanComplete,
  onCancel,
  scanMode = 'both',
  title = 'Scan Tyre'
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult>({});
  const [error, setError] = useState<string | null>(null);
  const [isNativeApp, setIsNativeApp] = useState(false);
  // State for dynamically loaded modules
  const [barcodeScannerModule, setBarcodeScannerModule] = useState<typeof BarcodeScannerType | null>(null);
  const [cameraModule, setCameraModule] = useState<any>(null);
  // Store enum values from dynamic imports
  const [cameraEnums, setCameraEnums] = useState<{
    resultType: Record<string, any>;
    source: Record<string, any>;
  }>({ resultType: {}, source: {} });

  useEffect(() => {
    setIsNativeApp(Capacitor.isNativePlatform());

    // Dynamically load modules
    const loadModules = async () => {
      try {
        // Load BarcodeScanner module
        const barcodeModule = await import('@capacitor-community/barcode-scanner');
        setBarcodeScannerModule(barcodeModule.BarcodeScanner);

        // Load Camera module and store enums
        const cameraModule = await import('@capacitor/camera');
        setCameraModule(cameraModule.Camera);
        setCameraEnums({
          resultType: cameraModule.CameraResultType,
          source: cameraModule.CameraSource
        });

        // Check permissions after modules are loaded
        await checkPermissions();
      } catch (err) {
        console.error('Failed to load scanner modules:', err);
        setError('Failed to initialize scanner. Please try again.');
      }
    };

    loadModules();
  }, []);

  const checkPermissions = async () => {
    try {
      if (Capacitor.isNativePlatform() && barcodeScannerModule) {
        const status = await barcodeScannerModule.checkPermission({ force: true });
        // Handle potentially undefined status.granted
        setHasPermission(status.granted === true);
      } else {
        setHasPermission(true); // Web fallback
      }
    } catch (err) {
      console.error('Permission check failed:', err);
      setHasPermission(false);
    }
  };

  const startBarcodeScanning = async () => {
    try {
      setIsScanning(true);
      setError(null);

      if (!isNativeApp) {
        // Web fallback - show manual input
        const barcode = prompt('Enter barcode manually:');
        if (barcode) {
          setScanResult(prev => ({ ...prev, barcode }));
        }
        setIsScanning(false);
        return;
      }

      if (!barcodeScannerModule) {
        throw new Error('Barcode scanner not initialized');
      }

      // Hide background
      await barcodeScannerModule.hideBackground();
      document.body.classList.add('scanner-active');

      const result = await barcodeScannerModule.startScan();

      if (result.hasContent) {
        setScanResult(prev => ({ ...prev, barcode: result.content }));
      }
    } catch (err) {
      console.error('Barcode scanning failed:', err);
      setError('Failed to scan barcode. Please try again.');
    } finally {
      setIsScanning(false);
      document.body.classList.remove('scanner-active');
      if (barcodeScannerModule) {
        await barcodeScannerModule.showBackground();
      }
    }
  };

  const takePhoto = async () => {
    try {
      setError(null);

      if (!cameraModule || !cameraEnums.resultType || !cameraEnums.source) {
        throw new Error('Camera not initialized');
      }

      // Use the dynamically loaded Camera module with properly loaded enums
      const cameraResult = await cameraModule.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: cameraEnums.resultType.Base64,
        source: cameraEnums.source.Camera,
      });

      if (cameraResult.base64String) {
        const photoData = `data:image/jpeg;base64,${cameraResult.base64String}`;
        setScanResult(prev => ({ ...prev, photo: photoData }));
      }
    } catch (err) {
      console.error('Photo capture failed:', err);
      setError('Failed to take photo. Please try again.');
    }
  };

  const stopScanning = async () => {
    try {
      if (isNativeApp && barcodeScannerModule) {
        await barcodeScannerModule.stopScan();
        await barcodeScannerModule.showBackground();
        document.body.classList.remove('scanner-active');
      }
      setIsScanning(false);
    } catch (err) {
      console.error('Failed to stop scanning:', err);
    }
  };

  const handleComplete = () => {
    onScanComplete(scanResult);
  };

  const handleReset = () => {
    setScanResult({});
    setError(null);
  };

  if (hasPermission === null) {
    return (
      <Card className="mx-4 mt-4">
        <CardContent className="p-6 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p>Checking camera permissions...</p>
        </CardContent>
      </Card>
    );
  }

  if (hasPermission === false) {
    return (
      <Card className="mx-4 mt-4">
        <CardContent className="p-6 text-center">
          <Info className="h-8 w-8 mx-auto mb-4 text-yellow-500" />
          <h3 className="font-semibold mb-2">Camera Permission Required</h3>
          <p className="text-gray-600 mb-4">
            Please enable camera permissions to scan barcodes and take photos.
          </p>
          <Button onClick={checkPermissions} className="mr-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Again
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={isScanning ? stopScanning : onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Scanning Controls */}
          {(scanMode === 'barcode' || scanMode === 'both') && (
            <div className="space-y-2">
              <Button
                onClick={startBarcodeScanning}
                disabled={isScanning || !barcodeScannerModule}
                className="w-full"
                variant={scanResult.barcode ? "outline" : "primary"}
              >
                <Scan className="h-4 w-4 mr-2" />
                {isScanning ? 'Scanning...' : scanResult.barcode ? 'Scan Again' : 'Scan Barcode'}
              </Button>

              {scanResult.barcode && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    <strong>Barcode:</strong> {scanResult.barcode}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Photo Controls */}
          {(scanMode === 'photo' || scanMode === 'both') && (
            <div className="space-y-2">
              <Button
                onClick={takePhoto}
                disabled={!cameraModule || !cameraEnums.resultType}
                className="w-full"
                variant={scanResult.photo ? "outline" : "primary"}
              >
                <CameraIcon className="h-4 w-4 mr-2" />
                {scanResult.photo ? 'Take Another Photo' : 'Take Photo'}
              </Button>

              {scanResult.photo && (
                <div className="space-y-2">
                  <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800 mb-2">Photo captured successfully</p>
                    <img
                      src={scanResult.photo}
                      alt="Captured"
                      className="w-full h-32 object-cover rounded border"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1"
              disabled={!scanResult.barcode && !scanResult.photo}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>

            <Button
              onClick={handleComplete}
              className="flex-1"
              variant="primary"
              disabled={!scanResult.barcode && !scanResult.photo}
            >
              <Check className="h-4 w-4 mr-2" />
              Complete
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-500 text-center pt-2">
            {isNativeApp ? (
              <p>Point camera at barcode to scan automatically</p>
            ) : (
              <p>Web version - manual barcode entry available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scanner overlay styles */}
      <style>{`
        .scanner-active {
          visibility: hidden;
        }
        .scanner-active .scanner-ui {
          visibility: visible;
        }
      `}</style>
    </div>
  );
};

export default TyreScanner;
