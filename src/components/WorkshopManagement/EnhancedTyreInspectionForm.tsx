import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { QRCode } from "qrcode.react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SignaturePad from "react-signature-canvas";

// 1. Import your custom useCapacitor hook (update path as needed)
import { useCapacitor } from "@/hooks/useCapacitor"; // <-- Update if needed

interface TyreInspectionFormProps {
  fleetNumber?: string;
  position?: string;
  onComplete?: (data: any) => void;
}

const EnhancedTyreInspectionForm: React.FC<TyreInspectionFormProps> = ({
  fleetNumber,
  position,
  onComplete,
}) => {
  const params = useParams();
  const navigate = useNavigate();
  const locationHook = useLocation();
  const queryParams = new URLSearchParams(locationHook.search);

  // Use provided props or extract from URL params/query
  const vehicleId = fleetNumber || params.fleetId || queryParams.get("fleet") || "";
  const tyrePosition = position || params.position || queryParams.get("position") || "";

  const [odometer, setOdometer] = useState<number | "">("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [inspectionData, setInspectionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tyreBrand, setTyreBrand] = useState<string>("");
  const [tyreSize, setTyreSize] = useState<string>("");
  const [treadDepth, setTreadDepth] = useState<number | "">("");
  const [pressure, setPressure] = useState<number | "">("");
  const [condition, setCondition] = useState<string>("good");
  const [notes, setNotes] = useState<string>("");
  const [inspectorName, setInspectorName] = useState<string>("");
  const [showSig, setShowSig] = useState<boolean>(false);
  const [sigPad, setSigPad] = useState<any>(null);

  // 2. Use the Capacitor hook
  const { isNative, hasPermissions, scanQRCode, takePhoto, stopScan, requestPermissions } =
    useCapacitor();

  // Load any existing inspection data
  useEffect(() => {
    if (vehicleId && tyrePosition) {
      loadInspectionData(vehicleId, tyrePosition);
    }
  }, [vehicleId, tyrePosition]);

  const loadInspectionData = async (fleet: string, position: string) => {
    try {
      setIsLoading(true);
      const db = getFirestore();
      const inspectionQuery = await getDoc(doc(db, "tyre_inspections", `${fleet}-${position}`));

      if (inspectionQuery.exists()) {
        const data = inspectionQuery.data();
        setInspectionData(data);
        setTyreBrand(data.tyreBrand || "");
        setTyreSize(data.tyreSize || "");
        setTreadDepth(data.treadDepth || "");
        setPressure(data.pressure || "");
        setCondition(data.condition || "good");
        setNotes(data.notes || "");
        setInspectorName(data.inspectorName || "");
        setOdometer(data.odometer || "");
        if (data.photo) setPhoto(data.photo);
        if (data.signature) setSignature(data.signature);
        if (data.gpsLocation) setGpsLocation(data.gpsLocation);
      }
    } catch (error) {
      console.error("Error loading inspection data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Integrate hook-enhanced photo capture, but retain placeholder for web!
  const handlePhotoCapture = async () => {
    // Try native first, fallback to placeholder
    if (isNative) {
      const granted = await requestPermissions();
      if (!granted) {
        alert("Camera permission required.");
        return;
      }
      const base64 = await takePhoto();
      if (base64) {
        setPhoto("data:image/jpeg;base64," + base64);
        return;
      }
    }
    // Web fallback (preserved!)
    setPhoto("data:image/png;base64,iVBORw0KG...");
  };

  // Replace the old handleSignatureCapture with new signature handling
  const handleSignatureCapture = () => {
    setShowSig(true);
  };

  const saveSignature = () => {
    if (sigPad) {
      setSignature(sigPad.getTrimmedCanvas().toDataURL("image/png"));
      setShowSig(false);
    }
  };

  const clearSignature = () => {
    if (sigPad) {
      sigPad.clear();
    }
  };

  // 5. Integrate geolocation for both web/mobile
  const handleLocationCapture = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGpsLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => {
          alert("Failed to get location: " + err.message);
          // Fallback: use the existing static default
          setGpsLocation({ lat: -33.8688, lng: 151.2093 });
        }
      );
    } else {
      // Fallback: use the existing static default
      setGpsLocation({ lat: -33.8688, lng: 151.2093 });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const inspectionDataToSave = {
        fleetNumber: vehicleId,
        position: tyrePosition,
        tyreBrand,
        tyreSize,
        treadDepth,
        pressure,
        condition,
        notes,
        inspectorName,
        odometer,
        photo,
        signature,
        gpsLocation,
        inspectionDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };

      // Save to Firestore
      const db = getFirestore();
      const docId = `${vehicleId}-${tyrePosition}`;
      await setDoc(doc(db, "tyre_inspections", docId), inspectionDataToSave, { merge: true });

      setInspectionData(inspectionDataToSave);

      // Call onComplete callback if provided
      if (onComplete) {
        onComplete(inspectionDataToSave);
      }

      alert("Inspection saved successfully!");

      // Navigate back or to a confirmation page
      navigate(`/workshop/tyres?fleet=${vehicleId}`);
    } catch (error) {
      console.error("Error saving inspection:", error);
      alert("Failed to save inspection. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Tyre Inspection Form</h2>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ... everything below remains unchanged ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700">
                Vehicle ID / Fleet Number
              </label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={vehicleId}
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700">Tyre Position</label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={tyrePosition}
                readOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700">Tyre Brand</label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={tyreBrand}
                onChange={(e) => setTyreBrand(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700">Tyre Size</label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={tyreSize}
                onChange={(e) => setTyreSize(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700">Tread Depth (mm)</label>
              <input
                type="number"
                step="0.1"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={treadDepth}
                onChange={(e) => setTreadDepth(e.target.value ? parseFloat(e.target.value) : "")}
                required
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700">Pressure (PSI)</label>
              <input
                type="number"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={pressure}
                onChange={(e) => setPressure(e.target.value ? parseInt(e.target.value) : "")}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700">Odometer</label>
              <input
                type="number"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value ? parseInt(e.target.value) : "")}
                required
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700">Condition</label>
              <select
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                required
              >
                <option value="new">New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
                <option value="critical">Critical - Replace</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700">Inspector Name</label>
            <input
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={inspectorName}
              onChange={(e) => setInspectorName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handlePhotoCapture}
            >
              {photo ? "Retake Photo" : "Take Photo"}
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handleSignatureCapture}
            >
              {signature ? "Redo Signature" : "Add Signature"}
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handleLocationCapture}
            >
              {gpsLocation ? "Update Location" : "Get Location"}
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={async () => {
                if (isNative) {
                  const result = await scanQRCode();
                  if (result) {
                    alert("QR code scanned: " + result);
                    // You can parse the result and navigate or update form data here
                  }
                } else {
                  alert("QR scanning is only available in the mobile app");
                }
              }}
            >
              Scan Tyre QR Code
            </button>
          </div>

          {/* Preview area for photo and signature */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {photo && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Photo Preview:</p>
                <div className="border border-gray-300 rounded-md p-2">
                  <img src={photo} alt="Tyre" className="w-full h-40 object-cover rounded" />
                </div>
              </div>
            )}

            {signature && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Signature:</p>
                <div className="border border-gray-300 rounded-md p-2">
                  <img src={signature} alt="Signature" className="w-full h-20 object-contain" />
                </div>
              </div>
            )}
          </div>

          {/* QR Code for this tyre */}
          <div className="mt-6 text-center">
            <p className="text-sm font-medium text-gray-700 mb-2">Tyre QR Code:</p>
            <div className="inline-block bg-white p-3 rounded-md shadow-sm border border-gray-200">
              <QRCode
                value={`${window.location.origin}/workshop/tyres/scan?fleet=${vehicleId}&position=${tyrePosition}`}
                size={150}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Scan to view this tyre's details</p>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="button"
              className="inline-flex items-center justify-center mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => navigate(`/workshop/tyres?fleet=${vehicleId}`)}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Inspection"}
            </button>
          </div>
        </form>
      )}

      {/* Add Signature Modal */}
      {showSig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-full max-w-lg">
            <h3 className="text-lg font-medium mb-4">Add Signature</h3>
            <div className="border border-gray-300 rounded">
              <SignaturePad
                ref={setSigPad}
                canvasProps={{
                  className: "w-full h-64",
                }}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                onClick={clearSignature}
              >
                Clear
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded hover:bg-gray-600"
                onClick={() => setShowSig(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                onClick={saveSignature}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {inspectionData && (
        <div className="mt-8 border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-900">Generate Report</h3>
          <p className="text-sm text-gray-500">Create a PDF report of this tyre inspection.</p>
          <button
            type="button"
            className="mt-3 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            onClick={() => {
              // Assuming TyreInspectionPDFGenerator is a component that handles PDF generation
              alert("PDF generation would be implemented here");
            }}
          >
            Generate PDF Report
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedTyreInspectionForm;
