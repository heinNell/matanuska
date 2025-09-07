import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QrCode, ArrowLeft, Clipboard } from 'lucide-react';
import QRScanner from '../../components/WorkshopManagement/QRScanner';
import { useToast } from '../../hooks/useToast';

const QRScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  // Removed unused context
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Parse return URL from query parameters if it exists
  const queryParams = new URLSearchParams(location.search);
  const returnUrl = queryParams.get('returnUrl') || '/workshop';
  
  const handleScan = (data: string) => {
    setScanResult(data);
    
    // Add to scan history (most recent first)
    setScanHistory(prev => [data, ...prev].slice(0, 10)); // Keep only last 10 scans
    
    // Try to parse as URL or JSON
    try {
      if (data.startsWith('http')) {
        // Handle as URL - might be internal link
        const url = new URL(data);
        if (url.origin === window.location.origin) {
          showToast('Navigating to scanned page...', 'info');
          setTimeout(() => navigate(url.pathname + url.search), 1000);
        } else {
          showToast('External URL detected. Click to open.', 'info');
        }
      } else if (data.startsWith('{')) {
        // Handle as JSON
        JSON.parse(data); // Just validate it's valid JSON
        showToast('QR code contains structured data', 'success');
        // Process based on JSON content
      } else {
        showToast('QR code scanned successfully', 'success');
      }
    } catch {
      // Not a URL or JSON, just plain text
      showToast('QR code contains text data', 'success');
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        showToast('Copied to clipboard!', 'success');
      })
      .catch(err => {
        showToast('Failed to copy: ' + err, 'error');
      });
  };
  
  const goBack = () => {
    navigate(returnUrl);
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold text-center flex-1">QR Code Scanner</h1>
        <div className="w-20" /> {/* Spacer for alignment */}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col items-center">
          <div className="mb-8 text-center">
            <div className="text-6xl mb-4 flex justify-center">
              <QrCode size={80} className="text-blue-500" />
            </div>
            <p className="text-gray-600 mb-2">
              Scan a QR code to view equipment details, record inspections, or access maintenance records.
            </p>
          </div>
          
          <div className="w-full">
            <QRScanner onScan={handleScan} />
          </div>
        </div>
      </div>
      
      {scanResult && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Scan Result</h2>
          <div className="bg-gray-50 rounded-md p-4 break-all">
            <div className="flex justify-between items-start">
              <p className="text-gray-800">{scanResult}</p>
              <button 
                onClick={() => copyToClipboard(scanResult)}
                className="ml-2 p-2 text-blue-500 hover:bg-blue-50 rounded"
                title="Copy to clipboard"
              >
                <Clipboard size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Scan History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setShowHistory(!showHistory)}
        >
          <h2 className="text-xl font-semibold">Scan History</h2>
          <span className="text-blue-500">{showHistory ? 'Hide' : 'Show'}</span>
        </div>
        
        {showHistory && scanHistory.length > 0 && (
          <div className="mt-4 space-y-2">
            {scanHistory.map((scan, index) => (
              <div key={index} className="flex justify-between bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-800 truncate flex-1">{scan}</p>
                <button 
                  onClick={() => copyToClipboard(scan)}
                  className="ml-2 p-1 text-blue-500 hover:bg-blue-50 rounded"
                  title="Copy to clipboard"
                >
                  <Clipboard size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {showHistory && scanHistory.length === 0 && (
          <p className="text-gray-500 mt-4 text-center">No scan history yet</p>
        )}
      </div>
    </div>
  );
};

export default QRScannerPage;
