import UnitsTable from "../../components/ui/UnitsTable";
import React from "react";

// Assuming you have your Wialon token readily available.
// It's a good practice to manage tokens securely, e.g., via environment variables.
const WIALON_TOKEN = "c1099bc37c906fd0832d8e783b60ae0dD9D1A721B294486AC08F8AA3ACAC2D2FD45FF053";

export const WialonUnitList: React.FC = () => {
    // Corrected: Pass the Wialon token to the UnitsTable component.
    return <UnitsTable wialonToken={WIALON_TOKEN} />;
};

export default WialonUnitList;
