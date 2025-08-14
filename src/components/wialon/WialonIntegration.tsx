import React, { useState, useEffect } from 'react';

interface WialonIntegrationProps {
  /** The Wialon token to use for authentication */
  token?: string;
  /** Button label text */
  buttonLabel?: string;
  /** Whether to open in a new tab or use an iframe */
  displayMode?: 'button' | 'iframe';
  /** Height of the iframe (only used when displayMode is 'iframe') */
  height?: number | string;
  /** Language to use for the Wialon interface */
  language?: string;
  /** Additional URL parameters to pass to Wialon */
  additionalParams?: Record<string, string>;
}

/**
 * WialonIntegration Component
 *
 * A component that provides integration with Wialon Hosting platform.
 * It can either display a button to open Wialon in a new tab or embed
 * it directly in an iframe.
 */
// Use direct Wialon link with token
const WIALON_SESSION_TOKEN = 'c1099bc37c906fd0832d8e783b60ae0dD9D1A721B294486AC08F8AA3ACAC2D2FD45FF053';
const WIALON_LOGIN_URL = 'https://hosting.wialon.com/?token=c1099bc37c906fd0832d8e783b60ae0dD9D1A721B294486AC08F8AA3ACAC2D2FD45FF053&lang=en';

const WialonIntegration: React.FC<WialonIntegrationProps> = ({
  token = WIALON_SESSION_TOKEN,
  buttonLabel = 'Open Wialon Dashboard',
  displayMode = 'button',
  height = '600px',
  language = 'en',
  additionalParams = {}
}) => {
  const [wialonUrl, setWialonUrl] = useState<string>('');
  const [iframeSupported, setIframeSupported] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Use the direct URL provided instead of constructing one
    setWialonUrl(WIALON_LOGIN_URL);

    // Check if iframe is supported (only if we're in iframe mode)
    if (displayMode === 'iframe') {
      checkIframeSupport(WIALON_LOGIN_URL);
    } else {
      setIsLoading(false);
    }
  }, [displayMode]);

  const checkIframeSupport = async (url: string) => {
    try {
      // Try to fetch the headers to check X-Frame-Options
      const response = await fetch(url, { method: 'HEAD' });
      const frameOptions = response.headers.get('X-Frame-Options');

      // If DENY or SAMEORIGIN is present, iframe embedding is not allowed
      const supported = !frameOptions ||
                        !(frameOptions.includes('DENY') ||
                          frameOptions.includes('SAMEORIGIN'));

      setIframeSupported(supported);
    } catch (error) {
      console.error('Error checking iframe support:', error);
      setIframeSupported(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenWialon = () => {
    window.open(wialonUrl, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading Wialon integration...</div>;
  }

  // Token check removed as we're using direct URL

  if (displayMode === 'iframe') {
    if (iframeSupported === false) {
      return (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg">
          <h3 className="font-medium">Iframe Embedding Not Supported</h3>
          <p className="mt-1">Wialon has X-Frame-Options that prevent embedding in an iframe. Please use the button mode instead.</p>
          <button
            onClick={handleOpenWialon} // Changed onClick to handleOpenWialon
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {buttonLabel}
          </button>
        </div>
      );
    }

    return (
      <div className="wialon-iframe-container w-full">
        <iframe
          src={wialonUrl}
          width="100%"
          height={height}
          style={{ border: 'none' }}
          title="Wialon Dashboard"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    );
  }

  // Button display mode
  return (
    <div className="wialon-button-container">
      <button
        onClick={handleOpenWialon} // Changed onClick to handleOpenWialon
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
      >
        {buttonLabel}
      </button>
    </div>
  );
};

export default WialonIntegration;
