import React, { useEffect, useState } from "react";

interface WialonConfigProps {
  /** Optional company ID to load/save config for a specific company */
  companyId?: string;
}

interface WialonConfig {
  baseUrl: string;
  token: string;
  refreshToken?: string;
  language: string;
  defaultView: "monitoring" | "tracks" | "dashboard";
  expiresAt?: number;
}

/**
 * WialonConfig Component
 *
 * Allows administrators to configure Wialon integration settings
 * such as host URL, access tokens and default views.
 */
const WialonConfig: React.FC<WialonConfigProps> = ({ companyId = "default" }) => {
  const [config, setConfig] = useState<WialonConfig>({
    baseUrl: "https://hosting.wialon.com/",
    token: "",
    language: "en",
    defaultView: "monitoring",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isTokenVisible, setIsTokenVisible] = useState(false);

  // Languages supported by Wialon
  const languages = [
    { code: "en", name: "English" },
    { code: "ru", name: "Russian" },
    { code: "es", name: "Spanish" },
    { code: "de", name: "German" },
    { code: "fr", name: "French" },
    { code: "zh", name: "Chinese" },
    { code: "ar", name: "Arabic" },
  ];

  // Load configuration from Firestore
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);

        // Dynamically import Firebase modules
        const { doc, getDoc } = await import("firebase/firestore");
        const { db } = await import("../../firebase");

        const configRef = doc(db, "integrationConfig", `wialon-${companyId}`);
        const docSnap = await getDoc(configRef);

        if (docSnap.exists()) {
          setConfig({ ...config, ...(docSnap.data() as WialonConfig) });
        }
      } catch (err) {
        console.error("Error fetching Wialon configuration:", err);
        setError("Failed to load configuration. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [companyId]);

  // Save configuration to Firestore
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError("");
      setSaveSuccess(false);

      // Validate required fields
      if (!config.baseUrl || !config.token) {
        setError("Base URL and Token are required fields.");
        return;
      }

      // Format base URL to ensure it ends with '/'
      let formattedBaseUrl = config.baseUrl;
      if (!formattedBaseUrl.endsWith("/")) {
        formattedBaseUrl += "/";
      }

      // Dynamically import Firebase modules
      const { doc, getDoc, updateDoc, setDoc } = await import("firebase/firestore");
      const { db } = await import("../../firebase");

      const configRef = doc(db, "integrationConfig", `wialon-${companyId}`);
      const docSnap = await getDoc(configRef);

      if (docSnap.exists()) {
        await updateDoc(configRef, {
          ...config,
          baseUrl: formattedBaseUrl,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await setDoc(configRef, {
          ...config,
          baseUrl: formattedBaseUrl,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      setSaveSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error saving Wialon configuration:", err);
      setError("Failed to save configuration. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Add a handler for toggling token visibility
  const handleToggleTokenVisibility = () => {
    setIsTokenVisible((v) => !v);
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading configuration...</div>;
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Wialon Integration Configuration</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded">{error}</div>
      )}

      {saveSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-300 text-green-700 rounded">
          Configuration saved successfully!
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-700 mb-1">
          Wialon Base URL
        </label>
        <input
          id="baseUrl"
          type="text"
          value={config.baseUrl}
          onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
          placeholder="https://hosting.wialon.com/"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          The base URL for your Wialon instance (e.g., https://hosting.wialon.com/)
        </p>
      </div>

      <div className="mb-4">
        <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
          Wialon Token
        </label>
        <div className="relative">
          <input
            id="token"
            type={isTokenVisible ? "text" : "password"}
            value={config.token}
            onChange={(e) => setConfig({ ...config, token: e.target.value })}
            placeholder="Enter your Wialon token"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={handleToggleTokenVisibility}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            {isTokenVisible ? (
              <span className="text-xs">Hide</span>
            ) : (
              <span className="text-xs">Show</span>
            )}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          The authentication token for accessing your Wialon account
        </p>
      </div>

      <div className="mb-4">
        <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
          Default Language
        </label>
        <select
          id="language"
          value={config.language}
          onChange={(e) => setConfig({ ...config, language: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name} ({lang.code})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="defaultView" className="block text-sm font-medium text-gray-700 mb-1">
          Default View
        </label>
        <select
          id="defaultView"
          value={config.defaultView}
          onChange={(e) => setConfig({ ...config, defaultView: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="monitoring">Monitoring</option>
          <option value="tracks">Tracks</option>
          <option value="dashboard">Dashboard</option>
        </select>
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isSaving ? "Saving..." : "Save Configuration"}
        </button>
      </div>
    </div>
  );
};

export default WialonConfig;
