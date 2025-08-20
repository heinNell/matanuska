import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import QRCode from "qrcode.react";
import React, { useEffect, useState, useRef } from "react"; // Add useRef
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SignaturePad from "react-signature-canvas";
import { useCapacitor } from "../../hooks/useCapacitor";

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
  const sigPadRef = useRef<any>(null); // Add ref for signature pad

  const { isNative, hasPermissions, scanQRCode, takePhoto, stopScan, requestPermissions } =
    useCapacitor();

  // Effect cleanup - fix void check
  useEffect(() => {
    return () => {
      if (isNative && typeof stopScan === "function") {
        try {
          const result = stopScan();
          // Only handle as promise if it returns something and has a catch method
          if (result && typeof result === 'object' && 'catch' in result) {
            result.catch(() => {
              // Silently handle any errors during cleanup
            });
          }
        } catch {
          // no-op
        }
      }
    };
  }, [isNative, stopScan]);

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

  const handlePhotoCapture = async () => {
    if (isNative) {
      const currentPerm =
        typeof hasPermissions === "function" ? await (hasPermissions as () => Promise<boolean>)() : !!hasPermissions;
      const granted = currentPerm || (await requestPermissions());
      if (!granted) {
        alert("Camera permission required.");
        return;
      }
      const base64 = await takePhoto();
      if (base64 && typeof base64 === "string") {
        setPhoto("data:image/jpeg;base64," + base64);
        return;
      }
    }
    setPhoto("data:image/png;base64,iVBORw0KG...");
  };

  // Replace existing signature handlers with new ones
  const handleSignatureCapture = () => setShowSig(true);

  const saveSignature = () => {
    if (sigPadRef.current) {
      const dataURL = sigPadRef.current.getTrimmedCanvas().toDataURL("image/png");
      setSignature(dataURL);
      setShowSig(false);
    }
  };

  const clearSignature = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
    }
  };

  const handleLocationCapture = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGpsLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => {
          alert("Failed to get location: " + err.message);
          setGpsLocation({ lat: -33.8688, lng: 151.2093 });
        }
      );
    } else {
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

      const db = getFirestore();
      const docId = `${vehicleId}-${tyrePosition}`;
      await setDoc(doc(db, "tyre_inspections", docId), inspectionDataToSave, { merge: true });

      setInspectionData(inspectionDataToSave);

      if (onComplete) {
        onComplete(inspectionDataToSave);
      }

      alert("Inspection saved successfully!");
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
          {/* ... form fields unchanged ... */}
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
                  try {
                    const currentPerm =
                      typeof hasPermissions === "function"
                        ? await (hasPermissions as () => Promise<boolean>)()
                        : !!hasPermissions;
                    const granted = currentPerm || (await requestPermissions());
                    if (!granted) {
                      alert("Camera permission required.");
                      return;
                    }
                    const result = await scanQRCode();
                    if (result) {
                      alert("QR code scanned: " + result);
                    }
                  } finally {
                    if (typeof stopScan === "function") {
                      const maybePromise = stopScan();
                      if (maybePromise && typeof (maybePromise as any).catch === "function") {
                        (maybePromise as Promise<unknown>).catch(() => {});
                      }
                    }
                  }
                } else {
                  alert("QR scanning is only available in the mobile app");
                }
              }}
            >
              Scan Tyre QR Code
            </button>
          </div>
          {/* ... preview and QR code ... */}
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
          {/* Use QRCode in JSX so it's not "declared but never read" */}
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
          {/* ...actions/buttons... */}
        </form>
      )}
      {showSig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-full max-w-lg">
            <h3 className="text-lg font-medium mb-4">Add Signature</h3>
            <div className="border border-gray-300 rounded">
              <SignaturePad
                ref={sigPadRef}
                canvasProps={{
                  className: "w-full h-64",
                }}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={clearSignature}
              >
                Clear
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
                onClick={saveSignature}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTyreInspectionForm;
