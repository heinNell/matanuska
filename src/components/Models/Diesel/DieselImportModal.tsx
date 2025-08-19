// ─── React & Context ─────────────────────────────────────────────
import React, { useState } from "react";
import { useAppContext } from "../../../context/AppContext";

// ─── UI Components ───────────────────────────────────────────────
import { Button } from "../../../components/ui/Button";
import Modal from "../../ui/Modal";

// ─── Icons ───────────────────────────────────────────────────────
import {
  AlertTriangle,
  CheckCircle,
  Download,
  FileSpreadsheet,
  Upload,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────
import { DieselConsumptionRecord, FLEETS_WITH_PROBES } from "../../../types";

interface DieselImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dieselRecords?: DieselConsumptionRecord[];
}

// Preview rows parsed from CSV
type CsvRow = Record<string, string>;

const DieselImportModal: React.FC<DieselImportModalProps> = ({ isOpen, onClose }) => {
  const { connectionStatus, importDieselRecords } = useAppContext();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [db, setDb] = useState<any>(null); // Firestore instance
  const [userId, setUserId] = useState<string | null>(null); // Authenticated user ID

  // Firebase Initialization and Authentication
  useEffect(() => {
    const initFirebaseAndAuth = async () => {
      try {
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
        const app = initializeApp(firebaseConfig);
        const firestoreDb = getFirestore(app);
        const auth = getAuth(app);

        // Set up the authentication state listener
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            setUserId(user.uid);
            // Fetch data now that we have a user
            await fetchModels(firestoreDb);
          } else {
            // Sign in anonymously if not authenticated
            if (typeof __initial_auth_token !== 'undefined') {
              await signInWithCustomToken(auth, __initial_auth_token);
            } else {
              await signInAnonymously(auth);
            }
          }
        });

        // Store the db instance in state
        setDb(firestoreDb);
        return () => unsubscribe();
      } catch (err) {
        console.error("Error initializing Firebase:", err);
        setError("Failed to initialize the app. Please try again later.");
        setLoading(false);
      }
    };

    initFirebaseAndAuth();
  }, []);

  // Fetch predictive models from Firestore
  const fetchModels = async (firestoreDb: any) => {
    try {
      setLoading(true);
      const q = query(collection(firestoreDb, "predictiveModels"));
      const querySnapshot = await getDocs(q);

      const fetchedModels: PredictiveModel[] = [];
      querySnapshot.forEach((doc) => {
        fetchedModels.push({ id: doc.id, ...doc.data() } as PredictiveModel);
      });

      const sortedModels = fetchedModels.sort((a, b) => a.name.localeCompare(b.name));
      setModels(sortedModels);

      if (sortedModels.length > 0) {
        const defaultModel = sortedModels[0];
        setSelectedModel(defaultModel);
        await fetchPredictions(firestoreDb, defaultModel.id);
        await fetchInsights(firestoreDb, defaultModel.id);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching predictive models:", err);
      setError("Failed to load predictive models. Please try again later.");
      setLoading(false);
    }
  };

  // Fetch predictions for selected model
  const fetchPredictions = async (firestoreDb: any, modelId: string) => {
    if (!firestoreDb) return;
    try {
      const q = query(
        collection(firestoreDb, "predictions"),
        where("modelId", "==", modelId),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      const predictions: Prediction[] = [];

      querySnapshot.forEach((doc) => {
        predictions.push(doc.data() as Prediction);
      });

      const sortedPredictions = predictions.sort((a, b) => b.predictionDate.toMillis() - a.predictionDate.toMillis());

      setSelectedModel((prev) => (prev ? { ...prev, predictions: sortedPredictions } : null));
    } catch (err) {
      console.error("Error fetching predictions:", err);
      setError("Failed to load prediction data.");
    }
  };

  // Fetch insights for selected model
  const fetchInsights = async (firestoreDb: any, modelId: string) => {
    if (!firestoreDb) return;
    try {
      const q = query(
        collection(firestoreDb, "modelInsights"),
        where("modelId", "==", modelId),
        limit(5)
      );

      const querySnapshot = await getDocs(q);
      const fetchedInsights: ModelInsight[] = [];

      querySnapshot.forEach((doc) => {
        fetchedInsights.push({ ...doc.data() } as ModelInsight);
      });

      const sortedInsights = fetchedInsights.sort((a, b) => b.insightDate.toMillis() - a.insightDate.toMillis());

      setInsights(sortedInsights);
    } catch (err) {
      console.error("Error fetching model insights:", err);
      setError("Failed to load model insights.");
    }
  };

  // Handle model selection change
  const handleModelChange = async (modelId: string) => {
    const model = models.find((m) => m.id === modelId);
    if (model) {
      setSelectedModel(model);
      await fetchPredictions(db, modelId);
      await fetchInsights(db, modelId);
    } else {
      setSelectedModel(null);
      setInsights([]);
    }
  };

  // Format predictions for chart display
  const formatPredictionsForChart = (predictions: Prediction[] | undefined) => {
    if (!predictions || predictions.length === 0) return [];

    return predictions.map((prediction) => ({
      name: prediction.entityName,
      date: prediction.predictionDate.toDate().toLocaleDateString(),
      predicted: prediction.predictedValue,
      actual: prediction.actualValue || null,
      confidence: prediction.confidence * 100,
    }));
  };

  // Format predictions for accuracy analysis
  const formatForAccuracyChart = (predictions: Prediction[] | undefined) => {
    if (!predictions || predictions.length === 0) return [];

    return predictions
      .filter((p) => p.actualValue !== undefined)
      .map((p) => ({
        predicted: p.predictedValue,
        actual: p.actualValue as number,
        entityName: p.entityName,
        confidence: p.confidence * 100,
      }));
  };

  // Mock data for demonstration
  const mockPredictions = [
    { name: "Vehicle 1", date: "01/15/2023", predicted: 85, actual: 83, confidence: 92 },
    { name: "Vehicle 2", date: "01/16/2023", predicted: 72, actual: 75, confidence: 88 },
    { name: "Vehicle 3", date: "01/17/2023", predicted: 91, actual: 90, confidence: 94 },
    { name: "Vehicle 4", date: "01/18/2023", predicted: 68, actual: 65, confidence: 87 },
    { name: "Vehicle 5", date: "01/19/2023", predicted: 77, actual: 79, confidence: 90 },
  ];

  const mockAccuracyData = [
    { predicted: 85, actual: 83, entityName: "Vehicle 1", confidence: 92 },
    { predicted: 72, actual: 75, entityName: "Vehicle 2", confidence: 88 },
    { predicted: 91, actual: 90, entityName: "Vehicle 3", confidence: 94 },
    { predicted: 68, actual: 65, entityName: "Vehicle 4", confidence: 87 },
    { predicted: 77, actual: 79, entityName: "Vehicle 5", confidence: 90 },
  ];

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const showAlert = (message: string) => {
    setModalMessage(message);
    setModalOpen(true);
  };

  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const insightElement = event.currentTarget.closest("[data-insight-id]");
    const insightId = insightElement?.getAttribute("data-insight-id");

    if (!insightId) {
      console.error("Could not find associated insight ID");
      return;
    }

    const insight = insights.find((insight) => insight.modelId === insightId);

    if (!insight) {
      console.error("Could not find matching insight data");
      return;
    }

    if (insight.actionRequired) {
      switch (insight.severity) {
        case "high":
          window.location.href = `/action-plans/${insightId}`;
          break;

        case "medium":
          fetchActionPlanDetails(insightId);
          break;

        case "low":
          displayNotification(
            `Action plan for "${insight.message}" is available in the reports section`
          );
          break;

        default:
          console.log(`Viewing action plan for insight: ${insight.message}`);
      }
      trackInsightAction(insightId, "view_action_plan", selectedModel?.id);
    }
  };

  const fetchActionPlanDetails = (insightId: string) => {
    console.log(`Fetching action plan details for insight ${insightId}`);

    setTimeout(() => {
      showAlert(`Action plan fetched for insight ${insightId}`);
    }, 500);
  };

  const displayNotification = (message: string) => {
    console.log(`NOTIFICATION: ${message}`);

    const notification = document.createElement("div");
    notification.className =
      "fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg";
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
  };

  const trackInsightAction = (insightId: string, action: string, modelId?: string) => {
    console.log(
      `ANALYTICS: User performed ${action} on insight ${insightId} for model ${modelId || "unknown"}`
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Predictive Models & AI Insights</h1>

        <div className="flex items-center">
          <label htmlFor="model-selector" className="mr-2 text-sm font-medium text-gray-700">
            Select Model:
          </label>
          <select
            id="model-selector"
            className="border border-gray-300 rounded-md shadow-sm py-2 px-3"
            value={selectedModel?.id || ""}
            onChange={(e) => handleModelChange(e.target.value)}
            disabled={loading || models.length === 0}
          >
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {!loading && selectedModel && (
        <>
          {/* Model Overview */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="col-span-2">
                <h2 className="text-xl font-semibold mb-2">{selectedModel.name}</h2>
                <p className="text-gray-600 mb-4">{selectedModel.description}</p>

                <div className="mb-4">
                  <h3 className="font-medium text-gray-900">Key Features</h3>
                  <div className="flex flex-wrap mt-1">
                    {selectedModel.features.map((feature, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2 mb-2"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-md border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Model Performance</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-500">Model Accuracy</span>
                      <span className="text-sm font-medium">
                        {selectedModel.accuracy.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          selectedModel.accuracy > 90
                            ? "bg-green-500"
                            : selectedModel.accuracy > 75
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${selectedModel.accuracy}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Status:
                      <span
                        className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${
                            selectedModel.status === "active"
                              ? "bg-green-100 text-green-800"
                              : selectedModel.status === "training"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {selectedModel.status.charAt(0).toUpperCase() +
                          selectedModel.status.slice(1)}
                      </span>
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Last Training: {selectedModel.lastTrainingDate.toDate().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insights Panel */}
          {insights.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">AI Insights & Recommendations</h2>
              <div className="space-y-3">
                {insights.map((insight, idx) => (
                  <div
                    key={idx}
                    className={`border-l-4 p-4 ${
                      insight.severity === "high"
                        ? "border-red-500 bg-red-50"
                        : insight.severity === "medium"
                          ? "border-yellow-500 bg-yellow-50"
                          : "border-blue-500 bg-blue-50"
                    }`}
                  >
                    <div className="flex justify-between">
                      <p
                        className={`font-medium ${
                          insight.severity === "high"
                            ? "text-red-700"
                            : insight.severity === "medium"
                              ? "text-yellow-700"
                              : "text-blue-700"
                        }`}
                      >
                        {insight.message}
                      </p>
                      <span className="text-sm text-gray-500">
                        {insight.insightDate.toDate().toLocaleDateString()}
                      </span>
                    </div>

                    {insight.potentialSavings && (
                      <p className="mt-1 text-sm text-gray-600">
                        Potential savings: ${insight.potentialSavings.toLocaleString()}
                      </p>
                    )}

                    {insight.actionRequired && (
                      <div className="mt-2">
                        <button
                          className="px-3 py-1 bg-white text-sm font-medium rounded border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={onClick}
                        >
                          View Action Plan
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prediction Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Predictions Chart */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <h3 className="font-medium text-gray-900 mb-4">Prediction Results</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={
                      selectedModel.predictions && selectedModel.predictions.length > 0
                        ? formatPredictionsForChart(selectedModel.predictions)
                        : mockPredictions
                    }
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#8884d8"
                      name="Predicted"
                      strokeWidth={2}
                      dot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#82ca9d"
                      name="Actual"
                      strokeWidth={2}
                      dot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Prediction Accuracy */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <h3 className="font-medium text-gray-900 mb-4">Prediction Accuracy Analysis</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid />
                    <XAxis
                      type="number"
                      dataKey="predicted"
                      name="Predicted"
                      unit=""
                      label={{ value: "Predicted", position: "bottom" }}
                    />
                    <YAxis
                      type="number"
                      dataKey="actual"
                      name="Actual"
                      unit=""
                      label={{ value: "Actual", angle: -90, position: "left" }}
                    />
                    <ZAxis
                      type="number"
                      dataKey="confidence"
                      range={[60, 400]}
                      name="Confidence"
                      unit="%"
                    />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Legend />
                    <Scatter
                      name="Accuracy Comparison"
                      data={
                        selectedModel.predictions &&
                        selectedModel.predictions.some((p) => p.actualValue !== undefined)
                          ? formatForAccuracyChart(selectedModel.predictions)
                          : mockAccuracyData
                      }
                      fill="#8884d8"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Predictions Table */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Recent Predictions</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Entity
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Predicted Value
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actual Value
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Confidence
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Accuracy
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(selectedModel.predictions || []).slice(0, 10).map((prediction, index) => {
                    const accuracy = prediction.actualValue
                      ? (1 -
                          Math.abs(prediction.predictedValue - prediction.actualValue) /
                            prediction.actualValue) *
                        100
                      : null;

                    return (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {prediction.entityName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {prediction.predictionDate.toDate().toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {prediction.predictedValue.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {prediction.actualValue ? prediction.actualValue.toFixed(2) : "Pending"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                              <div
                                className={`h-2.5 rounded-full ${
                                  prediction.confidence > 0.9
                                    ? "bg-green-500"
                                    : prediction.confidence > 0.7
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }`}
                                style={{ width: `${prediction.confidence * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-700">
                              {(prediction.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {accuracy !== null ? (
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                ${
                                  accuracy > 90
                                    ? "bg-green-100 text-green-800"
                                    : accuracy > 75
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                            >
                              {accuracy.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">N/A</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PredictiveModels;
