import {
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import QRCode from "qrcode.react";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import SignaturePad from "react-signature-canvas";
import { useCapacitor } from "../../hooks/useCapacitor";

/* ────────────────────────────────────────────────────────── */
/*                           Types                           */
/* ────────────────────────────────────────────────────────── */

interface TyreInspectionFormProps {
  fleetNumber?: string;
  position?: string;
  onComplete?: (data: any) => void;
}

/* ────────────────────────────────────────────────────────── */
/*                   Small runtime type-guard                */
/* ────────────────────────────────────────────────────────── */

const hasCatch = (
  v: unknown
): v is { catch: (cb: () => void) => void } =>
  !!v && typeof (v as any).catch === "function";

/* ────────────────────────────────────────────────────────── */
/*                         Component                         */
/* ────────────────────────────────────────────────────────── */

const EnhancedTyreInspectionForm: React.FC<
  TyreInspectionFormProps
> = ({ fleetNumber, position, onComplete }) => {
  /* ---------- routing params ---------- */
  const params = useParams();
  const navigate = useNavigate();
  const locationHook = useLocation();
  const queryParams = new URLSearchParams(locationHook.search);

  const vehicleId =
    fleetNumber ||
    params.fleetId ||
    queryParams.get("fleet") ||
    "";
  const tyrePosition =
    position ||
    params.position ||
    queryParams.get("position") ||
    "";

  /* ---------- local state ---------- */
  const [odometer, setOdometer] = useState<number | "">("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [gpsLocation, setGpsLocation] =
    useState<{ lat: number; lng: number } | null>(null);
  const [inspectionData, setInspectionData] =
    useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tyreBrand, setTyreBrand] = useState<string>("");
  const [tyreSize, setTyreSize] = useState<string>("");
  const [treadDepth, setTreadDepth] =
    useState<number | "">("");
  const [pressure, setPressure] = useState<number | "">("");
  const [condition, setCondition] = useState<string>("good");
  const [notes, setNotes] = useState<string>("");
  const [inspectorName, setInspectorName] =
    useState<string>("");
  const [showSig, setShowSig] = useState<boolean>(false);
  const sigPadRef = useRef<SignaturePad>(null);

  const {
    isNative,
    hasPermissions,
    scanQRCode,
    takePhoto,
    stopScan,
    requestPermissions,
  } = useCapacitor();

  /* ───────── cleanup: safe stopScan ───────── */
  useEffect(() => {
    return () => {
      if (isNative && typeof stopScan === "function") {
        try {
          const maybe = stopScan();
          if (hasCatch(maybe)) maybe.catch(() => {});
        } catch {
          /* ignore */
        }
      }
    };
  }, [isNative, stopScan]);

  /* ───────── preload any existing doc ───────── */
  useEffect(() => {
    if (vehicleId && tyrePosition) {
      void loadInspectionData(vehicleId, tyrePosition);
    }
  }, [vehicleId, tyrePosition]);

  /* ------------------------------------------- */
  /*                Firestore I/O                */
  /* ------------------------------------------- */

  const loadInspectionData = async (
    fleet: string,
    position: string
  ) => {
    try {
      setIsLoading(true);
      const db = getFirestore();
      const ref = doc(
        db,
        "tyre_inspections",
        `${fleet}-${position}`
      );
      const snap = await getDoc(ref);
      if (!snap.exists()) return;

      const d = snap.data();
      setInspectionData(d);
      setTyreBrand(d.tyreBrand || "");
      setTyreSize(d.tyreSize || "");
      setTreadDepth(d.treadDepth || "");
      setPressure(d.pressure || "");
      setCondition(d.condition || "good");
      setNotes(d.notes || "");
      setInspectorName(d.inspectorName || "");
      setOdometer(d.odometer || "");
      if (d.photo) setPhoto(d.photo);
      if (d.signature) setSignature(d.signature);
      if (d.gpsLocation) setGpsLocation(d.gpsLocation);
    } catch (e) {
      console.error("Error loading inspection:", e);
    } finally {
      setIsLoading(false);
    }
  };

  /* ------------------------------------------- */
  /*               media / helpers               */
  /* ------------------------------------------- */

  const handlePhotoCapture = useCallback(async () => {
    if (isNative) {
      // Check if the necessary permissions are available
      let granted = false;

      if (hasPermissions === true) {
        granted = true;
      } else {
        // Request permissions if we don't have them
        const permissionResult = await requestPermissions();
        granted = permissionResult === true;
      }

      if (!granted)
        return alert("Camera permission required.");

      const base64 = await takePhoto();
      if (typeof base64 === "string") {
        setPhoto("data:image/jpeg;base64," + base64);
        return;
      }
    }
    // Fallback for non-native environments
    setPhoto("data:image/png;base64,iVBORw0KG...");
  }, [
    hasPermissions,
    isNative,
    requestPermissions,
    takePhoto,
  ]);

  const handleSignatureCapture = () => setShowSig(true);

  const saveSignature = () => {
    if (!sigPadRef.current) {
      console.error("Signature pad reference is not available");
      return;
    }

    try {
      const trimmedCanvas = sigPadRef.current.getTrimmedCanvas();
      const dataUrl = trimmedCanvas.toDataURL("image/png");
      setSignature(dataUrl);
      setShowSig(false);
    } catch (error) {
      console.error("Error saving signature:", error);
      alert("Could not save signature. Please try again.");
    }
  };

  const clearSignature = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
    }
  };

  const handleLocationCapture = () => {
    if (!navigator.geolocation) {
      return setGpsLocation({
        lat: -33.8688,
        lng: 151.2093,
      });
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setGpsLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      (err) => {
        alert("Failed to get location: " + err.message);
        setGpsLocation({ lat: -33.8688, lng: 151.2093 });
      }
    );
  };

  /* ───────── submit ───────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const payload = {
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
      await setDoc(
        doc(
          db,
          "tyre_inspections",
          `${vehicleId}-${tyrePosition}`
        ),
        payload,
        { merge: true }
      );
      setInspectionData(payload);
      onComplete?.(payload);
      alert("Inspection saved!");
      navigate(`/workshop/tyres?fleet=${vehicleId}`);
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setIsLoading(false);
    }
  };

  /* ──────────────────────────────────────────── */
  /*                    Render                    */
  /* ──────────────────────────────────────────── */

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">
        Tyre Inspection Form
      </h2>

      {/* Display existing inspection info */}
      {inspectionData && !isLoading && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-700">
            <span className="font-medium">Last inspection:</span> {new Date(inspectionData.inspectionDate).toLocaleDateString()}
            {inspectionData.inspectorName && ` by ${inspectionData.inspectorName}`}
          </p>
        </div>
      )}

      {/* ---------- loading spinner ---------- */}
      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* ---------- basic data ---------- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Odometer
              </span>
              <input
                type="number"
                value={odometer}
                onChange={(e) =>
                  setOdometer(
                    e.target.value === ""
                      ? ""
                      : Number(e.target.value)
                  )
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Tyre Brand
              </span>
              <input
                type="text"
                value={tyreBrand}
                onChange={(e) =>
                  setTyreBrand(e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Tyre Size
              </span>
              <input
                type="text"
                value={tyreSize}
                onChange={(e) =>
                  setTyreSize(e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Tread Depth (mm)
              </span>
              <input
                type="number"
                value={treadDepth}
                onChange={(e) =>
                  setTreadDepth(
                    e.target.value === ""
                      ? ""
                      : Number(e.target.value)
                  )
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Pressure (kPa)
              </span>
              <input
                type="number"
                value={pressure}
                onChange={(e) =>
                  setPressure(
                    e.target.value === ""
                      ? ""
                      : Number(e.target.value)
                  )
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </label>

            {/* condition select */}
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Condition
              </span>
              <select
                value={condition}
                onChange={(e) =>
                  setCondition(e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="critical">Poor</option>
              </select>
            </label>
          </div>

          {/* inspector & notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Inspector Name
              </span>
              <input
                type="text"
                value={inspectorName}
                onChange={(e) =>
                  setInspectorName(e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Notes
              </span>
              <textarea
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </label>
          </div>

          {/* ---------- action buttons ---------- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={handlePhotoCapture}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {photo ? "Retake Photo" : "Take Photo"}
            </button>

            <button
              type="button"
              onClick={handleSignatureCapture}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {signature ? "Redo Signature" : "Add Signature"}
            </button>

            <button
              type="button"
              onClick={handleLocationCapture}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {gpsLocation
                ? "Update Location"
                : "Get Location"}
            </button>

            {/* QR scanning */}
            <button
              type="button"
              onClick={async () => {
                if (!isNative)
                  return alert(
                    "QR scanning is only available in the mobile app"
                  );

                try {
                  // Check permissions properly
                  let granted = false;

                  if (hasPermissions === true) {
                    granted = true;
                  } else {
                    // Request permissions if we don't have them
                    const permissionResult = await requestPermissions();
                    granted = permissionResult === true;
                  }

                  if (!granted)
                    return alert(
                      "Camera permission required."
                    );
                  const res = await scanQRCode();
                  if (res) alert("QR code: " + res);
                } finally {
                  // Safe stopping of scanner
                  if (typeof stopScan === "function") {
                    try {
                      stopScan();
                    } catch (error) {
                      console.error("Error stopping scan:", error);
                    }
                  }
                }
              }}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Scan Tyre QR Code
            </button>
          </div>

          {/* ---------- previews ---------- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {photo && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Photo Preview:
                </p>
                <div className="border rounded-md p-2">
                  <img
                    src={photo}
                    alt="Tyre"
                    className="w-full h-40 object-cover rounded"
                  />
                </div>
              </div>
            )}

            {signature && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Signature:
                </p>
                <div className="border rounded-md p-2">
                  <img
                    src={signature}
                    alt="Signature"
                    className="w-full h-20 object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ---------- QR code for quick link ---------- */}
          <div className="mt-6 text-center">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Tyre QR Code:
            </p>
            <div className="inline-block bg-white p-3 rounded-md shadow-sm border">
              <QRCode
                value={`${window.location.origin}/workshop/tyres/scan?fleet=${vehicleId}&position=${tyrePosition}`}
                size={150}
                level="H"
                includeMargin
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Scan to view this tyre’s details
            </p>
          </div>

          {/* ---------- submit ---------- */}
          <div className="pt-4">
            <button
              type="submit"
              className="inline-flex items-center justify-center px-6 py-2 rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Save Inspection
            </button>
          </div>
        </form>
      )}

      {/* ---------- signature modal ---------- */}
      {showSig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-full max-w-lg">
            <h3 className="text-lg font-medium mb-4 flex justify-between items-center">
              <span>Add Signature</span>
              <button
                onClick={() => setShowSig(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                ✕
              </button>
            </h3>

            <p className="text-sm text-gray-600 mb-2">
              Please sign in the box below using your finger or mouse
            </p>

            <div className="border rounded bg-gray-50">
                <SignaturePad
                  ref={sigPadRef}
                  canvasProps={{
                    className: "w-full h-64",
                    style: {
                      backgroundColor: "rgb(248, 250, 252)",
                      touchAction: "none"
                    }
                  }}
                />
            </div>

            <div className="flex justify-between gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowSig(false)}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearSignature}
                  className="px-4 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={saveSignature}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Save Signature
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTyreInspectionForm;
