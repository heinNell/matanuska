import UnitsTable from "../../components/ui/UnitsTable";
import React from "react";

export const WialonUnitList: React.FC = () => {
  return <UnitsTable sdkReady={true} />;
};
export default WialonUnitList;
// This component fetches and displays a list of Wialon units using the custom hook useWialonUnits.
// It handles loading and error states, and displays unit details including position if available
