import React, { useEffect, useState } from "react";

const MapsView: React.FC = () => {
  // Use direct Wialon link with token
  const wialonLoginUrl =
    "https://hosting.wialon.eu/?lang=c1099bc37c906fd0832d8e783b60ae0d8A24EF10D94BC85901A68544D53D01792B377AD3";

  const [iframeError, setIframeError] = useState<boolean>(false);

  // Responsive iframe style
  const iframeStyle = {
    width: "100%",
    height: window.innerWidth < 640 ? "calc(100vh - 80px)" : "calc(100vh - 100px)",
    border: "none",
  };

  // Handle iframe load error
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Listen for error messages from the iframe
      if (event.data && typeof event.data === "string" && event.data.includes("error")) {
        setIframeError(true);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Handler to open Wialon in a new window
  const openWialonInNewWindow = () => {
    window.open(wialonLoginUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {!iframeError ? (
        <div className="relative">
          <iframe
            src={wialonLoginUrl}
            style={iframeStyle}
            title="Wialon Maps & Tracking"
            allowFullScreen
            onError={() => setIframeError(true)}
          />
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10">
            <button
              onClick={openWialonInNewWindow}
              className="bg-blue-500 hover:bg-blue-700 text-white text-xs sm:text-sm md:text-base font-bold py-1 sm:py-2 px-2 sm:px-4 rounded shadow-md"
              title="Open in new window"
            >
              {window.innerWidth < 640 ? "Open" : "Open in new window"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] sm:h-[calc(100vh-100px)] p-4">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 sm:px-4 py-2 sm:py-3 rounded relative max-w-xs sm:max-w-lg md:max-w-2xl mb-4 text-sm sm:text-base">
            <strong className="font-bold">Cannot embed Wialon: </strong>
            <span className="block sm:inline">
              The Wialon tracking system cannot be embedded in this page due to security
              restrictions.
            </span>
          </div>
          <button
            onClick={openWialonInNewWindow}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1.5 sm:py-2 px-3 sm:px-4 rounded shadow-md text-sm sm:text-base"
          >
            Open Wialon in new window
          </button>
        </div>
      )}
    </div>
  );
};

export default MapsView;
