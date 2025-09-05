import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image, FileText, RotateCcw, Check, X, Download, Trash2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { toast } from 'sonner';

interface CapturedImage {
  id: string;
  dataUrl: string;
  timestamp: Date;
  metadata?: {
    width?: number;
    height?: number;
    location?: {
      latitude: number;
      longitude: number;
      accuracy?: number;
    };
  };
}

interface MobileCameraCaptureProps {
  onCapture?: (images: CapturedImage[]) => void;
  onClose?: () => void;
  title?: string;
  captureMode?: 'single' | 'multiple' | 'document';
  showLocationCapture?: boolean;
  maxImages?: number;
  quality?: number;
}

export const MobileCameraCapture: React.FC<MobileCameraCaptureProps> = ({
  onCapture,
  onClose,
  title = 'Camera Capture',
  captureMode = 'single',
  showLocationCapture = true,
  maxImages = 5,
  quality = 80,
}) => {
  const [isNativeApp, setIsNativeApp] = useState(false);
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null>(null);

  useEffect(() => {
    setIsNativeApp(Capacitor.isNativePlatform());

    if (showLocationCapture && Capacitor.isNativePlatform()) {
      getCurrentLocation();
    }
  }, [showLocationCapture]);

  const getCurrentLocation = async () => {
    try {
      const { Geolocation } = await import('@capacitor/geolocation');
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      setCurrentLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      });
    } catch (error) {
      console.warn('Location access denied or failed:', error);
    }
  };

  const capturePhoto = async () => {
    if (!isNativeApp) {
      toast.error('Camera capture requires the mobile app');
      return;
    }

    if (captureMode === 'multiple' && capturedImages.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setIsCapturing(true);

    try {
      const { Camera } = await import('@capacitor/camera');
      const { CameraResultType, CameraSource } = await import('@capacitor/camera');

      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        quality,
        allowEditing: captureMode === 'document',
        width: captureMode === 'document' ? 1200 : 800,
        height: captureMode === 'document' ? 1600 : 600,
        correctOrientation: true,
      });

      if (photo.dataUrl) {
        const newImage: CapturedImage = {
          id: `img_${Date.now()}`,
          dataUrl: photo.dataUrl,
          timestamp: new Date(),
          metadata: {
            width: photo.width,
            height: photo.height,
            location: currentLocation || undefined,
          },
        };

        if (captureMode === 'single') {
          setCapturedImages([newImage]);
        } else {
          setCapturedImages(prev => [...prev, newImage]);
        }

        toast.success('Photo captured successfully');
      }
    } catch (error) {
      console.error('Camera capture failed:', error);
      toast.error('Failed to capture photo');
    } finally {
      setIsCapturing(false);
    }
  };

  const deleteImage = (imageId: string) => {
    setCapturedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleComplete = () => {
    if (capturedImages.length === 0) {
      toast.error('Please capture at least one photo');
      return;
    }

    onCapture?.(capturedImages);
  };

  const downloadImage = (image: CapturedImage) => {
    const link = document.createElement('a');
    link.href = image.dataUrl;
    link.download = `capture_${image.timestamp.toISOString().slice(0, 19).replace(/:/g, '-')}.jpg`;
    link.click();
  };

  const handleWebFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    files.forEach((file, index) => {
      if (capturedImages.length + index >= maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: CapturedImage = {
          id: `web_${Date.now()}_${index}`,
          dataUrl: e.target?.result as string,
          timestamp: new Date(),
          metadata: {
            location: currentLocation || undefined,
          },
        };

        setCapturedImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            {title}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Capture Controls */}
          <div className="space-y-3">
            {isNativeApp ? (
              <Button
                onClick={capturePhoto}
                disabled={isCapturing || (captureMode === 'multiple' && capturedImages.length >= maxImages)}
                className="w-full"
                size="lg"
              >
                <Camera className="h-5 w-5 mr-2" />
                {isCapturing ? 'Capturing...' :
                 captureMode === 'document' ? 'Scan Document' :
                 captureMode === 'multiple' ? `Take Photo (${capturedImages.length}/${maxImages})` :
                 'Take Photo'}
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="w-full"
                  variant="outline"
                >
                  <Image className="h-4 w-4 mr-2" />
                  Upload Images
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  multiple={captureMode === 'multiple'}
                  accept="image/*"
                  className="hidden"
                  onChange={handleWebFileUpload}
                />
                <p className="text-xs text-gray-500 text-center">
                  Web fallback - Upload from device gallery
                </p>
              </div>
            )}

            {/* Capture Mode Info */}
            {captureMode === 'document' && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                <div className="flex items-center text-blue-800">
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Document Mode</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Position document within camera frame. Editing tools will be available.
                </p>
              </div>
            )}
          </div>

          {/* Location Status */}
          {showLocationCapture && (
            <div className="text-xs text-gray-500 flex items-center">
              {currentLocation ? (
                <>
                  <Check className="h-3 w-3 mr-1 text-green-500" />
                  Location captured (±{currentLocation.accuracy?.toFixed(0)}m)
                </>
              ) : (
                <>
                  <RotateCcw className="h-3 w-3 mr-1 animate-spin" />
                  Acquiring location...
                </>
              )}
            </div>
          )}

          {/* Captured Images */}
          {capturedImages.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Captured Images ({capturedImages.length})</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {capturedImages.map((image) => (
                  <div key={image.id} className="border rounded-lg p-2">
                    <div className="flex items-start space-x-3">
                      <img
                        src={image.dataUrl}
                        alt={`Captured ${image.timestamp.toLocaleTimeString()}`}
                        className="w-16 h-16 object-cover rounded border flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {image.timestamp.toLocaleString()}
                        </p>
                        {image.metadata?.location && (
                          <p className="text-xs text-gray-500">
                            📍 {image.metadata.location.latitude.toFixed(4)}, {image.metadata.location.longitude.toFixed(4)}
                          </p>
                        )}
                        <div className="flex space-x-1 mt-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => downloadImage(image)}
                            className="h-6 px-2 text-xs"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteImage(image.id)}
                            className="h-6 px-2 text-xs text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleComplete}
              disabled={capturedImages.length === 0}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-2" />
              Complete ({capturedImages.length})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileCameraCapture;
