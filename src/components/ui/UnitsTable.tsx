import { useWialonUnits } from "@/hooks/useWialonUnits";
import React, { useMemo, useState } from "react";

// Define comprehensive types
interface Position {
  x: number;
  y: number;
  z?: number;
  c?: number; // course
  s?: number; // speed
  t?: number; // timestamp
}

interface Unit {
  id: string | number;
  name: string;
  pos?: Position;
  nm?: string; // unit name
  cls?: number; // unit class
  hw?: string; // hardware type
  ph?: string; // phone number
  ph2?: string; // phone number 2
  psw?: string; // password
  cmds?: any[]; // commands
  prps?: any; // custom properties
  flds?: any; // custom fields
  aflds?: any; // admin fields
  pflds?: any; // profile fields
}

interface UnitsTableProps {
  sdkReady: boolean;
}

interface FilterOptions {
  searchTerm: string;
  showOnlineOnly: boolean;
  sortBy: "id" | "name" | "position";
  sortOrder: "asc" | "desc";
}

const UnitsTable: React.FC<UnitsTableProps> = ({ sdkReady }) => {
  const { units, loading, error } = useWialonUnits(sdkReady);

  // State for filtering and sorting
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: "",
    showOnlineOnly: false,
    sortBy: "name",
    sortOrder: "asc",
  });

  // Memoized filtered and sorted units
  const filteredAndSortedUnits = useMemo(() => {
    if (!units || units.length === 0) return [];

    let filtered = units.filter((unit: Unit) => {
      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          unit.name?.toLowerCase().includes(searchLower) ||
          unit.id?.toString().toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Online filter (if you have online status)
      if (filters.showOnlineOnly) {
        // Add your online logic here
        // This is a placeholder - adjust based on your data structure
        return true; // or check unit.online status
      }

      return true;
    });

    // Sorting
    filtered.sort((a: Unit, b: Unit) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (filters.sortBy) {
        case "id":
          aValue = a.id || "";
          bValue = b.id || "";
          break;
        case "name":
          aValue = a.name || "";
          bValue = b.name || "";
          break;
        case "position":
          aValue = a.pos ? `${a.pos.x},${a.pos.y}` : "";
          bValue = b.pos ? `${b.pos.x},${b.pos.y}` : "";
          break;
        default:
          aValue = a.name || "";
          bValue = b.name || "";
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue);
        return filters.sortOrder === "asc" ? comparison : -comparison;
      }

      if (aValue < bValue) return filters.sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [units, filters]);

  // Format position for display
  const formatPosition = (pos?: Position): string => {
    if (!pos || typeof pos.x !== "number" || typeof pos.y !== "number") {
      return "Unknown";
    }

    return `${pos.x.toFixed(6)}, ${pos.y.toFixed(6)}`;
  };

  // Get coordinates as Google Maps link
  const getMapLink = (pos?: Position): string | null => {
    if (!pos || typeof pos.x !== "number" || typeof pos.y !== "number") {
      return null;
    }
    return `https://maps.google.com/?q=${pos.x},${pos.y}`;
  };

  // Handle sort change
  const handleSort = (column: FilterOptions["sortBy"]) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
          fontSize: "16px",
        }}
      >
        <div>Loading units...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          padding: "20px",
          backgroundColor: "#fee",
          border: "1px solid #fcc",
          borderRadius: "4px",
          color: "#c33",
        }}
      >
        <strong>Error:</strong> {error}
      </div>
    );
  }

  // No units state
  if (!units || units.length === 0) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          color: "#666",
        }}
      >
        No units available
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ marginBottom: "10px" }}>Wialon Units ({filteredAndSortedUnits.length})</h2>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: "15px",
            alignItems: "center",
            marginBottom: "15px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={filters.searchTerm}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))}
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
              minWidth: "200px",
            }}
          />

          <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <input
              type="checkbox"
              checked={filters.showOnlineOnly}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, showOnlineOnly: e.target.checked }))
              }
            />
            Show online only
          </label>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "white",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <thead style={{ backgroundColor: "#f8f9fa" }}>
            <tr>
              <th
                onClick={() => handleSort("id")}
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  borderBottom: "2px solid #e9ecef",
                  cursor: "pointer",
                  userSelect: "none",
                  position: "relative",
                }}
              >
                ID
                {filters.sortBy === "id" && (
                  <span style={{ marginLeft: "5px" }}>
                    {filters.sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>

              <th
                onClick={() => handleSort("name")}
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  borderBottom: "2px solid #e9ecef",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                Name
                {filters.sortBy === "name" && (
                  <span style={{ marginLeft: "5px" }}>
                    {filters.sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>

              <th
                onClick={() => handleSort("position")}
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  borderBottom: "2px solid #e9ecef",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                Position
                {filters.sortBy === "position" && (
                  <span style={{ marginLeft: "5px" }}>
                    {filters.sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>

              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  borderBottom: "2px solid #e9ecef",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredAndSortedUnits.map((unit: Unit, index: number) => (
              <tr
                key={unit.id}
                style={{
                  backgroundColor: index % 2 === 0 ? "white" : "#f8f9fa",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e3f2fd")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = index % 2 === 0 ? "white" : "#f8f9fa")
                }
              >
                <td
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #e9ecef",
                    fontFamily: "monospace",
                  }}
                >
                  {unit.id}
                </td>

                <td
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #e9ecef",
                    fontWeight: "500",
                  }}
                >
                  {unit.name || "Unnamed"}
                </td>

                <td
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #e9ecef",
                    fontFamily: "monospace",
                    fontSize: "13px",
                  }}
                >
                  {formatPosition(unit.pos)}
                </td>

                <td
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #e9ecef",
                  }}
                >
                  {getMapLink(unit.pos) && (
                    <a
                      href={getMapLink(unit.pos)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#007bff",
                        textDecoration: "none",
                        padding: "4px 8px",
                        border: "1px solid #007bff",
                        borderRadius: "4px",
                        fontSize: "12px",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#007bff";
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#007bff";
                      }}
                    >
                      View on Map
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "15px",
          fontSize: "14px",
          color: "#666",
          textAlign: "center",
        }}
      >
        Showing {filteredAndSortedUnits.length} of {units.length} units
      </div>
    </div>
  );
};

export default UnitsTable;
