import React, { useEffect, useState } from "react";
import WialonConfig from "../../components/wialon/WialonConfig";

interface Company {
  id: string;
  name: string;
}

/**
 * WialonConfigPage Component
 *
 * Admin page for configuring Wialon integration settings
 * for the entire system or for specific companies.
 */
const WialonConfigPage: React.FC = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("default");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true);

        // Dynamically import Firebase modules
        const { collection, query, orderBy, getDocs } = await import("firebase/firestore");
        const { db } = await import("../../firebase");

        const companiesQuery = query(collection(db, "companies"), orderBy("name", "asc"));

        const querySnapshot = await getDocs(companiesQuery);
        const companiesData: Company[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name as string,
        }));

        setCompanies(companiesData);
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Wialon Configuration</h2>
      </div>

      <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h3 className="font-medium text-gray-900 dark:text-white mb-4">Configuration Target</h3>

        <div className="mb-4">
          <label
            htmlFor="company-select"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Select Company
          </label>
          <select
            id="company-select"
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="default">System Default (All Companies)</option>
            {!isLoading &&
              companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
          </select>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Configure Wialon for all companies (default) or customize for a specific company
          </p>
        </div>
      </div>

      <WialonConfig companyId={selectedCompanyId} />

      <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4 text-sm">
        <h3 className="font-medium text-blue-700 dark:text-blue-400">About Wialon Configuration</h3>
        <p className="mt-1 text-blue-600 dark:text-blue-300">
          Configure the Wialon integration settings for your organization. These settings determine
          how the Wialon platform is accessed and displayed within this application.
        </p>
        <p className="mt-2 text-blue-600 dark:text-blue-300">
          Company-specific settings override the default settings when a company is selected in the
          application.
        </p>
      </div>
    </div>
  );
};

export default WialonConfigPage;
