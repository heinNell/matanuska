import { ArrowDownToLine, Clipboard, Package, QrCode, Truck, Wrench } from "lucide-react";
import { QRCode } from "qrcode.react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, firestore, getDocs } from "../../firebase";

interface Vehicle {
  id: string;
  fleetNumber: string;
  make: string;
  model: string;
  type: string;
}

const QRGenerator = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [qrType, setQrType] = useState<string>("fleet");
  const [fleetNumber, setFleetNumber] = useState<string>("");
  const [position, setPosition] = useState<string>("");
  const [partNumber, setPartNumber] = useState<string>("");
  const [qrValue, setQrValue] = useState<string>("");
  const [qrGenerated, setQrGenerated] = useState<boolean>(false);
  const [description, setDescription] = useState<string>("");
  const [fleetNumbers, setFleetNumbers] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Positions for parts/tyres
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

  // Load fleet numbers from Firestore
  useEffect(() => {
    const fetchFleetNumbers = async () => {
      try {
        const db = firestore;
        const vehiclesCollection = collection(db, "vehicles");
        const vehicleSnapshot = await getDocs(vehiclesCollection);

        if (!vehicleSnapshot.empty) {
          const vehicles: Vehicle[] = vehicleSnapshot.docs.map((doc) => {
            const data = doc.data() as Vehicle;
            return { ...data, id: doc.id };
          });

          const fleetNums = vehicles.map((v) => v.fleetNumber);
          setFleetNumbers(fleetNums);
        } else {
          // If no vehicles in database, use sample data
          setFleetNumbers([
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
          ]);
        }
      } catch (error) {
        console.error("Error fetching fleet numbers:", error);
        // Fallback to sample data
        setFleetNumbers([
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
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFleetNumbers();
  }, []);

  // Generate QR code
  const generateQR = () => {
    let value = "";
    const baseUrl = window.location.origin;

    switch (qrType) {
      case "fleet":
        value = `${baseUrl}/workshop/vehicle/${fleetNumber}`;
        break;
      case "tyre":
        value = `${baseUrl}/workshop/tyres/scan?fleet=${fleetNumber}&position=${encodeURIComponent(position)}`;
        break;
      case "part":
        value = `${baseUrl}/workshop/parts/scan?part=${encodeURIComponent(partNumber)}&desc=${encodeURIComponent(description)}`;
        break;
      case "inspection":
        value = `${baseUrl}/workshop/driver-inspection?fleet=${fleetNumber}`;
        break;
      case "jobcard":
        value = `${baseUrl}/workshop/job-cards/new?fleet=${fleetNumber}`;
        break;
      default:
        value = `${baseUrl}/workshop`;
    }

    setQrValue(value);
    setQrGenerated(true);
  };

  // Reset form
  const resetForm = () => {
    setFleetNumber("");
    setPosition("");
    setPartNumber("");
    setDescription("");
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
        return fleetNumber !== "";
      case "tyre":
        return fleetNumber !== "" && position !== "";
      case "part":
        return partNumber !== "" && description !== "";
      case "inspection":
      case "jobcard":
        return fleetNumber !== "";
      default:
        return false;
    }
  };

  // Download QR code as image
  const downloadQR = () => {
    // Create a temporary canvas to generate the PNG
    const canvas = document.createElement("canvas");
    const qrSvg = document.querySelector(".qr-container svg");
    if (!qrSvg) return;

    const svgData = new XMLSerializer().serializeToString(qrSvg);
    const img = new Image();

    // Create a Blob from SVG data
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // Set canvas dimensions to match the QR code
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image on the canvas
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        // Create download link
        const downloadLink = document.createElement("a");

        let filename = "";
        switch (qrType) {
          case "fleet":
            filename = `fleet-${fleetNumber}`;
            break;
          case "tyre":
            filename = `tyre-${fleetNumber}-${position.replace(/\s+/g, "-")}`;
            break;
          case "part":
            filename = `part-${partNumber}`;
            break;
          case "inspection":
            filename = `inspection-${fleetNumber}`;
            break;
          case "jobcard":
            filename = `jobcard-${fleetNumber}`;
            break;
          default:
            filename = "qrcode";
        }

        downloadLink.download = `${filename}-qrcode.png`;
        downloadLink.href = canvas.toDataURL("image/png");
        downloadLink.click();

        // Clean up
        URL.revokeObjectURL(url);
      }
    };

    img.src = url;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">QR Code Generator</h1>
        <p className="text-gray-600">
          Generate QR codes for workshop operations, vehicles, and parts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Generate QR Code</h2>

          {/* QR Type Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">QR Code Type</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange("fleet")}
                className={`flex flex-col items-center justify-center p-3 rounded-md border ${
                  qrType === "fleet"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                <Truck
                  size={24}
                  className={qrType === "fleet" ? "text-blue-500" : "text-gray-500"}
                />
                <span className="mt-1 text-sm">Vehicle</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("tyre")}
                className={`flex flex-col items-center justify-center p-3 rounded-md border ${
                  qrType === "tyre"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={qrType === "tyre" ? "currentColor" : "#6b7280"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3" />
                  <path d="M12 19v3" />
                  <path d="m4.93 4.93 2.12 2.12" />
                  <path d="m16.95 16.95 2.12 2.12" />
                  <path d="M2 12h3" />
                  <path d="M19 12h3" />
                  <path d="m4.93 19.07 2.12-2.12" />
                  <path d="m16.95 7.05 2.12-2.12" />
                </svg>
                <span className="mt-1 text-sm">Tyre</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("part")}
                className={`flex flex-col items-center justify-center p-3 rounded-md border ${
                  qrType === "part"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                <Package
                  size={24}
                  className={qrType === "part" ? "text-blue-500" : "text-gray-500"}
                />
                <span className="mt-1 text-sm">Part</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("inspection")}
                className={`flex flex-col items-center justify-center p-3 rounded-md border ${
                  qrType === "inspection"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                <Clipboard
                  size={24}
                  className={qrType === "inspection" ? "text-blue-500" : "text-gray-500"}
                />
                <span className="mt-1 text-sm">Inspection</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("jobcard")}
                className={`flex flex-col items-center justify-center p-3 rounded-md border ${
                  qrType === "jobcard"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                <Wrench
                  size={24}
                  className={qrType === "jobcard" ? "text-blue-500" : "text-gray-500"}
                />
                <span className="mt-1 text-sm">Job Card</span>
              </button>
            </div>
          </div>

          {/* Dynamic form based on QR type */}
          <div className="space-y-4">
            {/* Fleet number field for vehicle, tyre, inspection and job cards */}
            {(qrType === "fleet" ||
              qrType === "tyre" ||
              qrType === "inspection" ||
              qrType === "jobcard") && (
              <div>
                <label
                  htmlFor="fleetNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Fleet Number
                </label>
                <select
                  id="fleetNumber"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={fleetNumber}
                  onChange={(e) => setFleetNumber(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select a Fleet Number</option>
                  {fleetNumbers.map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Position field for tyre */}
            {qrType === "tyre" && (
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                  Tyre Position
                </label>
                <select
                  id="position"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                >
                  <option value="">Select a Position</option>
                  {positions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Part fields */}
            {qrType === "part" && (
              <>
                <div>
                  <label
                    htmlFor="partNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Part Number
                  </label>
                  <input
                    type="text"
                    id="partNumber"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={partNumber}
                    onChange={(e) => setPartNumber(e.target.value)}
                    placeholder="Enter part number"
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description
                  </label>
                  <input
                    type="text"
                    id="description"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter part description"
                  />
                </div>
              </>
            )}

            {/* Generate Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={generateQR}
                disabled={!isFormValid()}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isFormValid() ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                <QrCode size={18} className="mr-2" />
                Generate QR Code
              </button>
            </div>
          </div>
        </div>

        {/* QR Code Preview */}
        <div className="col-span-1 bg-white rounded-lg shadow-md p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">QR Code Preview</h2>

          {qrGenerated ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              <div className="qr-container bg-white p-4 rounded-lg shadow-sm">
                <div style={{ padding: '20px' }}>
                  <QRCode
                    value={qrValue}
                    size={200}
                    level="M"
                  />
                </div>
              </div>
              <div className="text-sm text-gray-500 text-center break-all">
                <p className="font-medium text-gray-700 mb-1">URL encoded:</p>
                <p>{qrValue}</p>
              </div>
              <button
                onClick={downloadQR}
                className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                <ArrowDownToLine size={18} className="mr-2" />
                Download QR Code
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <QrCode size={100} strokeWidth={1} className="mb-4" />
              <p className="text-center">
                Fill in the form and click Generate to create your QR code
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
