import React, { useMemo, useState } from "react";
import { useWialonUnits, UnitInfo } from "@/hooks/useWialonUnits";

interface FilterOptions {
  searchTerm: string;
  showOnlineOnly: boolean;
  sortBy: "id" | "name" | "position";
  sortOrder: "asc" | "desc";
}

const UnitsTable: React.FC = () => {
  const { units, loading, error } = useWialonUnits();
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: "",
    showOnlineOnly: false,
    sortBy: "name",
    sortOrder: "asc",
  });

  // Main filtering and sorting
  const filteredAndSortedUnits = useMemo(() => {
    if (!units || units.length === 0) return [];

    let filtered = units.filter((unit: UnitInfo) => {
      // Search filter (name or id)
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          unit.name.toLowerCase().includes(searchLower) ||
          String(unit.id).toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Online filter (assume position exists means online)
      if (filters.showOnlineOnly) {
        if (
          !unit.position ||
          typeof unit.position.lat !== "number" ||
          typeof unit.position.lng !== "number"
        ) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue: string | number = "";
      let bValue: string | number = "";
      switch (filters.sortBy) {
        case "id":
          aValue = a.id;
          bValue = b.id;
          break;
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "position":
          aValue =
            a.position && typeof a.position.lat === "number" && typeof a.position.lng === "number"
              ? `${a.position.lat},${a.position.lng}`
              : "";
          bValue =
            b.position && typeof b.position.lat === "number" && typeof b.position.lng === "number"
              ? `${b.position.lat},${b.position.lng}`
              : "";
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue);
        return filters.sortOrder === "asc" ? comparison : -comparison;
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return filters.sortOrder === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }
      return 0;
    });

    return filtered;
  }, [units, filters]);

  // Format position for display
  const formatPosition = (pos?: { lat: number; lng: number }) =>
    pos && typeof pos.lat === "number" && typeof pos.lng === "number"
      ? `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`
      : "Unknown";

  // Google Maps link
  const getMapLink = (pos?: { lat: number; lng: number }) =>
    pos && typeof pos.lat === "number" && typeof pos.lng === "number"
      ? `https://maps.google.com/maps?q=${pos.lat},${pos.lng}`
      : null;

  // Handle sort change
  const handleSort = (column: FilterOptions["sortBy"]) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  if (loading) return <div className="p-6">Loading units...</div>;
  if (error) return <div className="p-4 bg-red-100 text-red-700">Error: {error}</div>;
  if (!units || units.length === 0)
    return <div className="p-6 text-gray-600">No units available</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-2">
        Wialon Units ({filteredAndSortedUnits.length})
      </h2>
      <div className="flex gap-4 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={filters.searchTerm}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
          }
          className="p-2 border border-gray-300 rounded"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.showOnlineOnly}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                showOnlineOnly: e.target.checked,
              }))
            }
          />
          Show online only
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded shadow">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort("id")}
                className="py-2 px-4 text-left cursor-pointer select-none"
              >
                ID {filters.sortBy === "id" && (filters.sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("name")}
                className="py-2 px-4 text-left cursor-pointer select-none"
              >
                Name {filters.sortBy === "name" && (filters.sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("position")}
                className="py-2 px-4 text-left cursor-pointer select-none"
              >
                Position {filters.sortBy === "position" && (filters.sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedUnits.map((unit, i) => {
              const pos = unit.position;
              return (
                <tr key={unit.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="py-2 px-4 font-mono">{unit.id}</td>
                  <td className="py-2 px-4">{unit.name || "Unnamed"}</td>
                  <td className="py-2 px-4 font-mono text-xs">{formatPosition(pos)}</td>
                  <td className="py-2 px-4">
                    {getMapLink(pos) && (
                      <a
                        href={getMapLink(pos)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View on Map
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-sm text-gray-500 text-center">
        Showing {filteredAndSortedUnits.length} of {units.length} units
      </div>
    </div>
  );
};

export default UnitsTable;
