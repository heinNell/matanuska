import React from "react";

export interface WialonMapComponentProps {
  className?: string;
}

const WialonMapComponent: React.FC<WialonMapComponentProps> = ({ className }) => {
  return (
    <div className={className} style={{ background: "#eef6ff", minHeight: 300 }}>
      <div className="p-4 text-sm text-gray-600">Wialon live map placeholder</div>
    </div>
  );
};

export default WialonMapComponent;
