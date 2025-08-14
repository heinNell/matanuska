import React from "react";

const isCapacitor = !!(window as any).Capacitor;

export const ScanQRButton: React.FC = () => {
  const handleScan = async () => {
    if (!isCapacitor) {
      alert("QR scanning is only available in the mobile app.");
      return;
    }
    const { BarcodeScanner } = await import('@capacitor-community/barcode-scanner');
    await BarcodeScanner.checkPermission({ force: true });
    await BarcodeScanner.hideBackground();
    const result = await BarcodeScanner.startScan();
    if (result.hasContent) {
      window.location.href = result.content;
    }
    await BarcodeScanner.showBackground();
  };

  return (
    <button
      className="btn btn-primary rounded-lg px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg"
      onClick={handleScan}
    >
      Scan QR
    </button>
  );
};
