import React from "react";
import useWialonConnection from "../../hooks/useWialonConnection";
import { useWialonUnits } from "../../hooks/useWialonUnits";

interface WialonStatusProps {
    showDetails?: boolean;
    showUnitsCount?: boolean;
}

const WialonStatus: React.FC<WialonStatusProps> = ({
    showDetails = true,
    showUnitsCount = true,
}) => {
    // We assume the useWialonConnection hook provides a token or a `isReady` state.
    // The status object should be updated to include the token.
    const { status, loading: connectionLoading, refresh } = useWialonConnection();

    // Pass the token from the connection status to the useWialonUnits hook
    // We use a conditional call to avoid fetching units until the token is available.
    const { units, loading: unitsLoading, error: unitsError } = useWialonUnits(status.token);

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Wialon Integration Status
                </h3>
                <button
                    onClick={refresh}
                    className="px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-800 dark:hover:bg-blue-700 dark:text-blue-100 rounded transition-colors"
                >
                    Refresh
                </button>
            </div>

            <div className="p-2 border border-gray-200 dark:border-gray-700 rounded-md mb-2 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center">
                    <div
                        className={`w-3 h-3 rounded-full mr-2 ${status.connected ? "bg-green-500" : "bg-red-500"}`}
                    ></div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                        {connectionLoading
                            ? "Checking connection..."
                            : status.connected
                                ? "Connected"
                                : "Disconnected"}
                    </span>
                </div>

                {status.errorMessage && (
                    <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                        Error: {status.errorMessage}
                    </div>
                )}
            </div>

            {showDetails && status.connected && (
                <div className="text-sm space-y-1 mt-3">
                    {status.user && (
                        <div>
                            <span className="text-gray-500 dark:text-gray-400 inline-block w-24">Account:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{status.user}</span>
                        </div>
                    )}
                    {status.serverTime && (
                        <div>
                            <span className="text-gray-500 dark:text-gray-400 inline-block w-24">
                                Server Time:
                            </span>
                            <span className="text-gray-800 dark:text-gray-200">
                                {status.serverTime.toLocaleString()}
                            </span>
                        </div>
                    )}
                    {status.tokenExpiry && (
                        <div>
                            <span className="text-gray-500 dark:text-gray-400 inline-block w-24">
                                Token Expires:
                            </span>
                            <span
                                className={`${new Date() > status.tokenExpiry ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-gray-200"}`}
                            >
                                {status.tokenExpiry.toLocaleString()}
                            </span>
                        </div>
                    )}
                    {showUnitsCount && (
                        <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700">
                            <span className="text-gray-500 dark:text-gray-400 inline-block w-24">Units:</span>
                            {unitsLoading ? (
                                <span className="text-gray-600 dark:text-gray-400">Loading units...</span>
                            ) : unitsError ? (
                                <span className="text-red-600 dark:text-red-400">Error loading units</span>
                            ) : (
                                <span className="text-gray-800 dark:text-gray-200">
                                    {units?.length || 0} units available
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}

            {!status.connected && !connectionLoading && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                    <p className="font-medium">Troubleshooting:</p>
                    <ul className="list-disc list-inside pl-2 mt-1 space-y-1">
                        <li>Check if VITE_WIALON_SESSION_TOKEN is set in environment variables</li>
                        <li>Ensure your token has not expired</li>
                        <li>Check if wialon.js is properly loaded in the browser</li>
                        <li>Verify network connectivity to Wialon servers</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default WialonStatus;
