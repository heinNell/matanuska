import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Select } from "../ui/FormElements";
import { QrCode, Truck, Wrench, Clipboard, ExternalLink, List, Download } from "lucide-react";
import { QRCode } from "qrcode.react";

const QRGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [qrType, setQrType] = useState<string>("fleet");
  const [fleetNumber, setFleetNumber] = useState<string>("");
  const [position, setPosition] = useState<string>("");
  const [partNumber, setPartNumber] = useState<string>("");
  const [qrValue, setQrValue] = useState<string>("");
  const [qrGenerated, setQrGenerated] = useState<boolean>(false);
  const [description, setDescription] = useState<string>("");

  // Mock data for dropdowns
  const fleetNumbers = [
    "21H",
    "22H",
    "23H",
    "24H",
    "26H",
    "28H",
    "31H",
    "32H",
    "33H",
    "1T",
    "2T",
    "3T",
    "4T",
    "4F",
    "5F",
    "6F",
    "7F",
    "8F",
  ];

  const positions = [
    "Front Left",
    "Front Right",
    "Rear Left",
    "Rear Right",
    "Position 1",
    "Position 2",
    "Position 3",
    "Position 4",
    "Position 5",
    "Position 6",
    "Position 7",
    "Position 8",
  ];

  // Generate QR code
  const generateQR = () => {
    let value = "";
    const baseUrl = window.location.origin;

    switch (qrType) {
      case "fleet":
        // Enhanced QR code for driver inspections and fault logging
        value = `${baseUrl}/workshop/driver-inspection?fleet=${fleetNumber}&action=inspect`;
        setDescription(`Fleet Vehicle: ${fleetNumber}`);
        break;
      case "tyre":
        // Include more data for tyre tracking - fleet, position, and inspection endpoint
        value = `${baseUrl}/workshop/tyre-inspection?fleet=${fleetNumber}&position=${position}`;
        setDescription(`Tyre: ${fleetNumber} - ${position}`);
        break;
      case "part":
        // Link to part details and maintenance history
        value = `${baseUrl}/workshop/part-details?partNumber=${partNumber}`;
        setDescription(`Part: ${partNumber}`);
        break;
      default:
        value = "";
    }

    setQrValue(value);
    setQrGenerated(true);
  };

  // Reset form
  const resetForm = () => {
    setFleetNumber("");
    setPosition("");
    setPartNumber("");
    setQrValue("");
    setQrGenerated(false);
  };

  // Handle QR type change
  const handleTypeChange = (type: string) => {
    setQrType(type);
    resetForm();
  };

  // Validate form before generation
  const isFormValid = () => {
    switch (qrType) {
      case "fleet":
        return !!fleetNumber;
      case "tyre":
        return !!fleetNumber && !!position;
      case "part":
        return !!partNumber;
      default:
        return false;
    }
  };

  // Download QR code as image
  const downloadQR = () => {
    // Create a temporary canvas to generate the PNG
    const canvas = document.createElement("canvas");
    const qrSvg = document.querySelector(".w-48 svg");
    if (!qrSvg) return;

    const svgData = new XMLSerializer().serializeToString(qrSvg);
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${qrType}-${fleetNumber || partNumber || "qr"}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Extract button's role from data attributes or text content
    const target = e.currentTarget;
    const buttonText = target.textContent?.trim().toLowerCase();

    if (buttonText?.includes("inspection history")) {
      navigate("/workshop/inspection-history");
    } else if (buttonText?.includes("batch qr generator")) {
      navigate("/workshop/batch-qr-generator");
    } else if (target.textContent?.includes("Download")) {
      downloadQR();
    } else if (target.textContent?.includes("Share")) {
      // Share QR code (e.g., copy link to clipboard)
      navigator.clipboard.writeText(qrValue);
      alert("QR code link copied to clipboard!");
    } else if (target.textContent?.includes("Generate QR Code")) {
      generateQR();
    } else if (buttonText?.includes("driver inspection")) {
      handleTypeChange("fleet");
    } else if (buttonText?.includes("tyre position")) {
      handleTypeChange("tyre");
    } else if (buttonText?.includes("spare part")) {
      handleTypeChange("part");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <QrCode className="w-7 h-7 mr-2 text-blue-500" />
            QR Code Generator
          </h2>
          <p className="text-gray-600">
            Generate QR codes for driver inspections, tyres, and parts
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onClick} variant="outline" className="flex items-center gap-2">
            <Clipboard className="w-5 h-5" />
            Inspection History
          </Button>
          <Button onClick={onClick} variant="outline" className="flex items-center gap-2">
            <List className="w-5 h-5" />
            Batch QR Generator
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Generate QR Code" />
          <CardContent>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">QR Code Type</label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border ${qrType === "fleet" ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white hover:bg-gray-50 border-gray-300"}`}
                    onClick={onClick}
                  >
                    <Truck className="w-10 h-10 mb-2" />
                    <span className="font-medium">Driver Inspection</span>
                  </button>

                  <button
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border ${qrType === "tyre" ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white hover:bg-gray-50 border-gray-300"}`}
                    onClick={onClick}
                  >
                    <div className="w-6 h-6 mb-2 rounded-full border-4 flex items-center justify-center">
                      <div className="w-1 h-1 bg-current rounded-full" />
                    </div>
                    <span>Tyre Position</span>
                  </button>

                  <button
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border ${qrType === "part" ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white hover:bg-gray-50 border-gray-300"}`}
                    onClick={onClick}
                  >
                    <Wrench className="w-6 h-6 mb-2" />
                    <span>Spare Part</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {qrType === "fleet" && (
                  <Select
                    label="Fleet Number *"
                    value={fleetNumber}
                    onChange={(e) => setFleetNumber(e.target.value)}
                    options={[
                      { label: "Select fleet number...", value: "" },
                      ...fleetNumbers.map((fleet) => ({ label: fleet, value: fleet })),
                    ]}
                  />
                )}

                {qrType === "tyre" && (
                  <>
                    <Select
                      label="Fleet Number *"
                      value={fleetNumber}
                      onChange={(e) => setFleetNumber(e.target.value)}
                      options={[
                        { label: "Select fleet number...", value: "" },
                        ...fleetNumbers.map((fleet) => ({ label: fleet, value: fleet })),
                      ]}
                    />

                    <Select
                      label="Tyre Position *"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      options={[
                        { label: "Select position...", value: "" },
                        ...positions.map((pos) => ({ label: pos, value: pos })),
                      ]}
                    />
                  </>
                )}

                {qrType === "part" && (
                  <Input
                    label="Part Number *"
                    value={partNumber}
                    onChange={(e) => setPartNumber(e.target.value)}
                    placeholder="Enter part number (e.g. BP-1234)"
                  />
                )}

                <div className="pt-4">
                  <Button
                    onClick={onClick}
                    disabled={!isFormValid()}
                    icon={<QrCode className="w-4 h-4" />}
                  >
                    Generate QR Code
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="QR Code Preview" />
          <CardContent>
            {qrGenerated ? (
              <div className="flex flex-col items-center text-center">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="w-48 h-48 bg-white flex items-center justify-center border">
                    <QRCode
                      value={qrValue}
                      size={200}
                      level="M"
                      includeMargin // Use this instead of marginSize
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2 w-full">
                  <p className="font-medium text-gray-900">{description}</p>
                  <p className="text-sm text-gray-600">{qrValue}</p>

                  <div className="pt-4 grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={onClick}
                      icon={<Download className="w-4 h-4" />}
                    >
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onClick}
                      icon={<ExternalLink className="w-4 h-4" />}
                    >
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-4">
                <Clipboard className="h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-gray-900 font-medium">No QR Code Generated</h3>
                <p className="text-gray-500 mt-2">
                  Fill in the required fields and click "Generate QR Code" to see a preview here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-medium text-blue-800 mb-4">How to Use QR Codes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-blue-700">
          <div className="space-y-2">
            <h3 className="font-medium">Fleet Vehicle QR Codes</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Place on vehicle dashboard</li>
              <li>Scan to report vehicle faults</li>
              <li>Complete driver inspections</li>
              <li>Track services and maintenance</li>
              <li>Access vehicle history</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Tyre Position QR Codes</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Attach to wheel rims or hubs</li>
              <li>Scan during tyre inspections</li>
              <li>Track tyre rotation history</li>
              <li>Monitor tread wear and pressure</li>
              <li>Log tyre replacements</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Parts QR Codes</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Label spare parts inventory</li>
              <li>Scan for part specifications</li>
              <li>Track warranty information</li>
              <li>Manage inventory levels</li>
              <li>Link to maintenance records</li>
            </ul>
          </div>
        </div>
        <p className="text-blue-700 mt-4 font-medium">
          These QR codes link directly to the appropriate inspection forms and fault reporting
          interfaces. When scanned, they'll automatically populate the form with the correct
          vehicle, tyre, or part information. All inspection data and reported faults are stored in
          Firestore for historical tracking and maintenance planning.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-blue-300 rounded p-3 bg-blue-100">
            <h4 className="font-bold text-blue-800">For Drivers:</h4>
            <p className="text-sm">
              Scan the QR code on your vehicle to quickly report issues or complete required
              inspections. No need to manually enter vehicle details.
            </p>
          </div>
          <div className="border border-blue-300 rounded p-3 bg-blue-100">
            <h4 className="font-bold text-blue-800">For Mechanics:</h4>
            <p className="text-sm">
              Scan QR codes to access maintenance history, review reported faults, and update
              service records for specific vehicles, tyres, or parts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
