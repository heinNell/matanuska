import React from "react";
import UnitsTable from "../ui/UnitsTable";
import { useWialonUnits } from "../../hooks/useWialonUnits";

const token = import.meta.env.VITE_WIALON_TOKEN;

export const WialonUnitList: React.FC = () => {
  const { units, loading, error } = useWialonUnits(token);
  return <UnitsTable units={units} loading={loading} error={error} />;
};

export default WialonUnitList;
