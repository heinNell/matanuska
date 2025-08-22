import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Camera, X, Check } from 'lucide-react';

interface QRScannerProps {
  onScan?: (data: string) => void;
  onClose?: () => void;
}

// Check if we're running in a Capacitor environment
const isCapacitor = !!(window as any).Capacitor;

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<boolean | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if running on a mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      return /android|iPad|iPhone|iPod|webOS/i.test(userAgent);
    };

    setIsMobile(checkMobile());
  }, []);

  const startScan = async () => {
    setScanning(true);
    setError(null);

    try {
      if (isCapacitor) {
        await startCapacitorScan();
      } else if (isMobile) {
        // Use the device camera API for mobile browsers
        await startMobileBrowserScan();
      } else {
        // Use a web-based QR scanner for desktop browsers
        await startWebScan();
      }
    } catch (err) {
      setError('Failed to start scanner: ' + (err instanceof Error ? err.message : String(err)));
      setScanning(false);
    }
  };

  const startCapacitorScan = async () => {
    try {
      const { BarcodeScanner } = await import('@capacitor-community/barcode-scanner');
      const status = await BarcodeScanner.checkPermission({ force: true });

      if (status.granted) {
        setPermission(true);

        // Hide the webpage background and start scanning
        await BarcodeScanner.hideBackground();
        document.body.classList.add('qr-scanning');

        const result = await BarcodeScanner.startScan();

        if (result.hasContent) {
          handleScanResult(result.content);
        }
      } else {
        setPermission(false);
        setError('Camera permission was denied');
      }
    } catch (err) {
      throw new Error('Failed to use Capacitor scanner: ' + String(err));
    } finally {
      if (isCapacitor) {
        try {
          const { BarcodeScanner } = await import('@capacitor-community/barcode-scanner');
          await BarcodeScanner.showBackground();
          document.body.classList.remove('qr-scanning');
        } catch (e) {
          console.error('Error restoring background:', e);
        }
      }
      setScanning(false);
    }
  };

  const startMobileBrowserScan = async () => {
    try {
      // For mobile browsers, we'll use the device camera
      alert('Please grant camera permission and scan a QR code');

      // Using experimental Shape Detection API if available
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['qr_code']
        });

        // Start the camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        const video = document.createElement('video');
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        document.body.appendChild(video);
        await video.play();

        // Scan until we find a QR code
        const checkVideoFrame = async () => {
          if (!scanning) {
            stream.getTracks().forEach(track => track.stop());
            video.remove();
            return;
          }

          try {
            const barcodes = await barcodeDetector.detect(video);
            if (barcodes.length > 0) {
              stream.getTracks().forEach(track => track.stop());
              video.remove();
              handleScanResult(barcodes[0].rawValue);
              return;
            }
          } catch (e) {
            console.error('Barcode detection error:', e);
          }

          requestAnimationFrame(checkVideoFrame);
        };

        checkVideoFrame();
      } else {
        // Fallback to using a mobile-optimized library
        setError('QR scanning not supported in this browser. Please use a QR code scanner app and scan manually.');
      }
    } catch (err) {
      throw new Error('Failed to access camera: ' + String(err));
    }
  };

  const startWebScan = async () => {
    try {
      // For web, we'll prompt the user to upload a QR code image
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          setError('No file selected');
          setScanning(false);
          return;
        }

        try {
          // Use a library like jsQR to decode the QR code
          const imageUrl = URL.createObjectURL(file);
          const img = new Image();
          img.src = imageUrl;
          await img.decode();

          // This would typically use a QR code decoding library
          // For now, we'll just mock a successful scan
          alert('QR code scanning from images requires jsQR or a similar library. Please implement in production.');

          // Clean up
          URL.revokeObjectURL(imageUrl);
          setScanning(false);
        } catch (err) {
          setError('Failed to process image: ' + String(err));
          setScanning(false);
        }
      };

      input.click();
    } catch (err) {
      throw new Error('Failed to start file upload: ' + String(err));
    }
  };

  const handleScanResult = (result: string) => {
    console.log('QR Scan result:', result);

    // Process the scanned data - could be a URL or a JSON string
    try {
      // First check if it's a workshop-related URL
      if (result.includes('/workshop/')) {
        // It's a URL, navigate to it
        navigate(result);
      } else if (result.startsWith('{') && result.endsWith('}')) {
        // It's a JSON string, parse it
        const data = JSON.parse(result);

        // Handle different types of QR data
        if (data.type === 'fleet') {
          navigate(`/workshop/driver-inspection?fleet=${data.fleetNumber}`);
        } else if (data.type === 'tyre') {
          navigate(`/workshop/tyre-inspection?fleet=${data.fleetNumber}&position=${data.position}`);
        } else if (data.type === 'part') {
          navigate(`/workshop/part-details?partNumber=${data.partNumber}`);
        } else {
          // Default handling
          if (onScan) onScan(result);
        }
      } else {
        // Just pass the raw data to the handler
        if (onScan) onScan(result);
      }
    } catch (err) {
      setError('Invalid QR code format: ' + String(err));
    } finally {
      setScanning(false);
    }
  };

  const stopScan = async () => {
    setScanning(false);

    if (isCapacitor) {
      try {
        const { BarcodeScanner } = await import('@capacitor-community/barcode-scanner');
        await BarcodeScanner.stopScan();
        await BarcodeScanner.showBackground();
        document.body.classList.remove('qr-scanning');
      } catch (e) {
        console.error('Error stopping Capacitor scanner:', e);
      }
    }

    if (onClose) onClose();
  };

  return (
    <div className="qr-scanner">
      {/* QR Scanner Header */}
      <div className="text-center mb-4">
        <div className="text-6xl mb-2 flex justify-center">
          <QrCode size={60} className="text-blue-500" />
        </div>
        <p className="text-gray-600 text-sm">
          Scan QR codes for vehicles, tyres, parts, or inspections
        </p>
      </div>

      {!scanning ? (
        <button
          onClick={startScan}
          className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <Camera size={20} />
          <span>Scan QR Code</span>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="text-center">
            <div className="animate-pulse text-blue-600">
              <QrCode size={40} />
            </div>
            <p className="text-sm text-gray-600 mt-2">Scanning for QR code...</p>
          </div>
          <button
            onClick={stopScan}
            className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            <X size={20} />
            <span>Cancel Scan</span>
          </button>
        </div>
      )}

      {error && (
        <div className="mt-2 text-red-500 text-sm flex items-center">
          <X size={16} className="mr-1 flex-shrink-0" />
          {error}
        </div>
      )}

      {permission === false && (
        <div className="mt-2 bg-yellow-100 border-yellow-400 border p-3 rounded-md">
          <p className="text-yellow-800 text-sm">
            Camera permission is required to scan QR codes. Please enable camera access in your browser settings.
          </p>
        </div>
      )}

      {permission === true && (
        <div className="mt-2 bg-green-100 border-green-400 border p-3 rounded-md">
          <p className="text-green-800 text-sm flex items-center">
            <Check size={16} className="mr-1 flex-shrink-0" />
            Camera permission granted. Ready to scan!
          </p>
        </div>
      )}

      {scanning && !isCapacitor && !isMobile && (
        <div className="mt-4 text-gray-600 text-sm">
          <p>Upload a QR code image to scan</p>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
