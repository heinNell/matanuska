import { ArrowLeft, Printer, QrCode } from "lucide-react";
import { QRCode } from "qrcode.react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { useFleetData, Vehicle } from "../../hooks/useFleetData";

type QRCodeType = "inspection" | "jobcard" | "fleet";

export const QRCodeBatchGenerator: React.FC = () => {
  const navigate = useNavigate();
  const { vehicles, loading } = useFleetData();
  const [qrType, setQrType] = useState<QRCodeType>("inspection");
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);

  const generateQRValue = (fleetNumber: string, type: QRCodeType) => {
    const baseUrl = window.location.origin;
    switch (type) {
      case "inspection":
        return `${baseUrl}/workshop/driver-inspection?fleet=${fleetNumber}`;
      case "jobcard":
        return `${baseUrl}/workshop/job-cards?fleet=${fleetNumber}`;
      case "fleet":
        return `${baseUrl}/workshop/fleet/${fleetNumber}`;
      default:
        return `${baseUrl}/workshop/fleet/${fleetNumber}`;
    }
  };

  const handleSelectAll = () => {
    if (selectedVehicles.length === vehicles.length) {
      setSelectedVehicles([]);
    } else {
      setSelectedVehicles(vehicles.map((v: Vehicle) => v.fleetNumber));
    }
  };

  const handleVehicleToggle = (fleetNumber: string) => {
    setSelectedVehicles((prev) =>
      prev.includes(fleetNumber) ? prev.filter((fn) => fn !== fleetNumber) : [...prev, fleetNumber]
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const vehiclesToShow =
    selectedVehicles.length > 0
      ? vehicles.filter((v: Vehicle) => selectedVehicles.includes(v.fleetNumber))
      : vehicles;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="print:hidden">
        <Card>
          <CardHeader title="QR Code Batch Generator">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                <h2 className="text-xl font-bold">QR Code Batch Generator</h2>
              </div>
              <Button
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Single QR Generator
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">QR Code Type:</label>
                <select
                  value={qrType}
                  onChange={(e) => setQrType(e.target.value as QRCodeType)}
                  className="border rounded px-3 py-1"
                >
                  <option value="inspection">Inspection Form</option>
                  <option value="jobcard">Job Card</option>
                  <option value="fleet">Fleet Details</option>
                </select>
              </div>

              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedVehicles.length === vehicles.length ? "Deselect All" : "Select All"}
              </Button>

              <Button
                onClick={handlePrint}
                className="flex items-center gap-2"
                disabled={vehiclesToShow.length === 0}
              >
                <Printer className="w-4 h-4" />
                Print QR Codes
              </Button>
            </div>

            <div className="text-sm text-gray-600">
              <p>Selected: {selectedVehicles.length} vehicles</p>
              <p>QR codes will link to: {qrType} workflow</p>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Selection */}
        <Card className="mt-4">
          <CardHeader title="Select Vehicles" />
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {vehicles.map((vehicle: Vehicle) => (
                <label
                  key={vehicle.id}
                  className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedVehicles.includes(vehicle.fleetNumber)}
                    onChange={() => handleVehicleToggle(vehicle.fleetNumber)}
                    className="rounded"
                  />
                  <div className="text-sm">
                    <div className="font-medium">{vehicle.fleetNumber}</div>
                    <div className="text-gray-500 text-xs">{vehicle.make}</div>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Grid - Print Layout */}
      <div className="print:block">
        <div className="print:text-center print:mb-4 hidden print:block">
          <h1 className="text-xl font-bold">Fleet QR Codes - {qrType.toUpperCase()}</h1>
          <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 print:grid-cols-3 gap-6 print:gap-4">
          {vehiclesToShow.map((vehicle: Vehicle) => (
            <Card key={vehicle.id} className="print:border print:shadow-none">
              <CardContent className="p-4 text-center">
                <QRCode
                  value={generateQRValue(vehicle.fleetNumber, qrType)}
                  size={120}
                  level="M"
                  includeMargin
                />
                <div className="mt-3 space-y-1">
                  <div className="font-bold text-lg">{vehicle.fleetNumber}</div>
                  <div className="text-sm text-gray-600">{vehicle.registration}</div>
                  <div className="text-xs text-gray-500">
                    {vehicle.make} {vehicle.model}
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border">
                    {qrType.toUpperCase()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Print Instructions */}
      <div className="print:hidden">
        <Card>
          <CardHeader title="Printing Instructions" />
          <CardContent className="space-y-2 text-sm">
            <p>• Use A4 paper or adhesive label sheets</p>
            <p>• Recommended: 65mm x 65mm sticker labels</p>
            <p>• Print in black and white for better contrast</p>
            <p>• Test scan before applying to vehicles</p>
            <p>• Apply QR codes to clean, visible areas on vehicles</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QRCodeBatchGenerator;
