import { AlertTriangle, Camera, CheckCircle, Info, Save, X } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Input, TextArea } from '../../ui/FormElements';
import TyreScanner from './TyreScanner';

interface TyreInspectionMobileProps {
  tyreId?: string;
  tyreNumber?: string;
  onSave: (inspectionData: TyreInspectionData) => Promise<void>;
  onCancel: () => void;
}

interface TyreInspectionData {
  tyreId: string;
  tyreNumber: string;
  inspectionDate: string;
  inspectorName: string;
  mileage: number;
  treadDepthOutside: number;
  treadDepthCenter: number;
  treadDepthInside: number;
  pressure: number;
  visualCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'failed';
  sidewallCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'failed';
  overallRating: 'pass' | 'monitor' | 'replace';
  notes: string;
  photos: string[];
  recommendations: string[];
}

const TyreInspectionMobile: React.FC<TyreInspectionMobileProps> = ({
  tyreId,
  tyreNumber,
  onSave,
  onCancel
}) => {
  const [showScanner, setShowScanner] = useState(!tyreId);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<TyreInspectionData>({
    tyreId: tyreId || '',
    tyreNumber: tyreNumber || '',
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectorName: '',
    mileage: 0,
    treadDepthOutside: 0,
    treadDepthCenter: 0,
    treadDepthInside: 0,
    pressure: 0,
    visualCondition: 'good',
    sidewallCondition: 'good',
    overallRating: 'pass',
    notes: '',
    photos: [],
    recommendations: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof TyreInspectionData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleScanComplete = (scanData: { barcode?: string; photo?: string }) => {
    if (scanData.barcode) {
      setFormData(prev => ({
        ...prev,
        tyreId: scanData.barcode || '',
        tyreNumber: scanData.barcode || ''
      }));
    }

    if (scanData.photo) {
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, scanData.photo!]
      }));
    }

    setShowScanner(false);
  };

  const addPhoto = () => {
    setShowScanner(true);
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.tyreNumber) newErrors.tyreNumber = 'Tyre number is required';
    if (!formData.inspectorName) newErrors.inspectorName = 'Inspector name is required';
    if (formData.mileage <= 0) newErrors.mileage = 'Valid mileage is required';
    if (formData.treadDepthOutside < 0) newErrors.treadDepthOutside = 'Valid tread depth required';
    if (formData.treadDepthCenter < 0) newErrors.treadDepthCenter = 'Valid tread depth required';
    if (formData.treadDepthInside < 0) newErrors.treadDepthInside = 'Valid tread depth required';
    if (formData.pressure <= 0) newErrors.pressure = 'Valid pressure is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Failed to save inspection:', error);
    } finally {
      setSaving(false);
    }
  };

  const getOverallRatingColor = (rating: string) => {
    switch (rating) {
      case 'pass': return 'text-green-600 bg-green-50 border-green-200';
      case 'monitor': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'replace': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getOverallRatingIcon = (rating: string) => {
    switch (rating) {
      case 'pass': return <CheckCircle className="h-4 w-4" />;
      case 'monitor': return <Info className="h-4 w-4" />;
      case 'replace': return <AlertTriangle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">Tyre Inspection</h2>
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Tyre Identification */}
        <Card>
          <CardHeader>
            <h3 className="font-medium">Tyre Identification</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex space-x-2">
                <Input
                  label="Tyre Number *"
                  value={formData.tyreNumber}
                  onChange={(e) => handleInputChange('tyreNumber', e.target.value)}
                  placeholder="Enter or scan tyre number"
                  className={errors.tyreNumber ? 'border-red-500' : ''}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScanner(true)}
                >
                  Scan
                </Button>
              </div>
              {errors.tyreNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.tyreNumber}</p>
              )}
            </div>

            <div>
              <Input
                label="Inspector Name *"
                value={formData.inspectorName}
                onChange={(e) => handleInputChange('inspectorName', e.target.value)}
                placeholder="Enter inspector name"
                className={errors.inspectorName ? 'border-red-500' : ''}
              />
              {errors.inspectorName && (
                <p className="text-red-500 text-xs mt-1">{errors.inspectorName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Inspection Date"
                  type="date"
                  value={formData.inspectionDate}
                  onChange={(e) => handleInputChange('inspectionDate', e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="Current Mileage *"
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => handleInputChange('mileage', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className={errors.mileage ? 'border-red-500' : ''}
                />
                {errors.mileage && (
                  <p className="text-red-500 text-xs mt-1">{errors.mileage}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tread Depth Measurements */}
        <Card>
          <CardHeader>
            <h3 className="font-medium">Tread Depth (mm)</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Input
                  label="Outside *"
                  type="number"
                  step="0.1"
                  value={formData.treadDepthOutside}
                  onChange={(e) => handleInputChange('treadDepthOutside', parseFloat(e.target.value) || 0)}
                  className={errors.treadDepthOutside ? 'border-red-500' : ''}
                />
              </div>

              <div>
                <Input
                  label="Center *"
                  type="number"
                  step="0.1"
                  value={formData.treadDepthCenter}
                  onChange={(e) => handleInputChange('treadDepthCenter', parseFloat(e.target.value) || 0)}
                  className={errors.treadDepthCenter ? 'border-red-500' : ''}
                />
              </div>

              <div>
                <Input
                  label="Inside *"
                  type="number"
                  step="0.1"
                  value={formData.treadDepthInside}
                  onChange={(e) => handleInputChange('treadDepthInside', parseFloat(e.target.value) || 0)}
                  className={errors.treadDepthInside ? 'border-red-500' : ''}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pressure & Conditions */}
        <Card>
          <CardHeader>
            <h3 className="font-medium">Pressure & Condition</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                label="Pressure (PSI) *"
                type="number"
                value={formData.pressure}
                onChange={(e) => handleInputChange('pressure', parseInt(e.target.value) || 0)}
                placeholder="0"
                className={errors.pressure ? 'border-red-500' : ''}
              />
              {errors.pressure && (
                <p className="text-red-500 text-xs mt-1">{errors.pressure}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visual Condition
                </label>
                <select
                  value={formData.visualCondition}
                  onChange={(e) => handleInputChange('visualCondition', e.target.value as any)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sidewall Condition
                </label>
                <select
                  value={formData.sidewallCondition}
                  onChange={(e) => handleInputChange('sidewallCondition', e.target.value as any)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Rating */}
        <Card>
          <CardHeader>
            <h3 className="font-medium">Overall Assessment</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'pass', label: 'Pass', color: 'green' },
                  { value: 'monitor', label: 'Monitor', color: 'yellow' },
                  { value: 'replace', label: 'Replace', color: 'red' }
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('overallRating', option.value)}
                    className={`p-3 rounded-lg border-2 flex items-center justify-center space-x-2 ${formData.overallRating === option.value
                      ? getOverallRatingColor(option.value)
                      : 'border-gray-200 text-gray-600'
                      }`}
                  >
                    {formData.overallRating === option.value && getOverallRatingIcon(option.value)}
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes & Observations
              </label>
              <TextArea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Enter any additional notes or observations..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Photos</h3>
              <Button variant="outline" size="sm" onClick={addPhoto}>
                <Camera className="h-4 w-4 mr-2" />
                Add Photo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {formData.photos.length === 0 ? (
              <div className="text-center py-4">
                <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No photos added</p>
                <Button variant="outline" size="sm" onClick={addPhoto} className="mt-2">
                  Take Photo
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="bg-white border-t p-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Inspection
            </>
          )}
        </Button>
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <TyreScanner
          scanMode="both"
          title="Scan Tyre or Take Photo"
          onScanComplete={handleScanComplete}
          onCancel={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default TyreInspectionMobile;
