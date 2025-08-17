import { Button } from "../../components/ui/Button";
import { Edit, Plus, RefreshCcw, Save, Trash, X } from "lucide-react";
import React, { useState } from "react";
import { useTyreReferenceData } from "../../context/TyreReferenceDataContext";
import { Card, CardContent } from "../ui/Card";

// Tab management for the different sections
type TabType = "brands" | "sizes" | "patterns" | "positions";

const TyreReferenceManager: React.FC = () => {
  const {
    brands,
    sizes,
    patterns,
    vehiclePositions,
    loading,
    error,
    addBrand,
    updateBrand,
    deleteBrand,
    addSize,
    updateSize,
    deleteSize,
    addPattern,
    updatePattern,
    deletePattern,
    addVehiclePosition,
    updateVehiclePosition,
    deleteVehiclePosition,
    refreshData,
  } = useTyreReferenceData();

  const [activeTab, setActiveTab] = useState<TabType>("brands");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Brand form state
  const [brandForm, setBrandForm] = useState({ id: "", name: "" });
  const [editingBrand, setEditingBrand] = useState(false);

  // Size form state
  const [sizeForm, setSizeForm] = useState({ id: "", size: "" });
  const [editingSize, setEditingSize] = useState(false);

  // Pattern form state
  const [patternForm, setPatternForm] = useState({
    id: "",
    brand: "",
    pattern: "",
    size: "",
    position: "Drive",
  });
  const [editingPattern, setEditingPattern] = useState(false);

  // Vehicle Position form state
  const [positionForm, setPositionForm] = useState({
    id: "",
    vehicleType: "",
    name: "",
    positions: [] as { id: string; name: string }[],
  });
  const [newPosition, setNewPosition] = useState({ id: "", name: "" });
  const [editingPosition, setEditingPosition] = useState(false);

  // Handle refreshing data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  // --- BRAND MANAGEMENT ---
  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBrand) {
        await updateBrand(brandForm.id, brandForm.name);
      } else {
        await addBrand(brandForm.name);
      }
      setBrandForm({ id: "", name: "" });
      setEditingBrand(false);
    } catch (error) {
      console.error("Error saving brand:", error);
    }
  };

  const handleEditBrand = (brand: { id: string; name: string }) => {
    setBrandForm({ id: brand.id, name: brand.name });
    setEditingBrand(true);
  };

  const handleDeleteBrand = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this brand?")) {
      try {
        await deleteBrand(id);
      } catch (error) {
        console.error("Error deleting brand:", error);
      }
    }
  };

  const renderBrandsTab = () => (
    <div>
      <form onSubmit={handleBrandSubmit} className="mb-6">
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex-grow">
            <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 mb-1">
              Brand Name
            </label>
            <input
              id="brandName"
              type="text"
              value={brandForm.name}
              onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="self-end">
            <Button type="submit" className="h-10">
              {editingBrand ? (
                <Save size={16} className="mr-1" />
              ) : (
                <Plus size={16} className="mr-1" />
              )}
              {editingBrand ? "Update" : "Add"} Brand
            </Button>
          </div>
          {editingBrand && (
            <div className="self-end">
              <Button
                type="button"
                variant="outline"
                className="h-10"
                onClick={() => {
                  setBrandForm({ id: "", name: "" });
                  setEditingBrand(false);
                }}
              >
                <X size={16} className="mr-1" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map((brand) => (
          <div key={brand.id} className="p-3 border rounded-md flex justify-between items-center">
            <span className="font-medium">{brand.name}</span>
            <div className="space-x-2">
              <button
                onClick={() => handleEditBrand(brand)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDeleteBrand(brand.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // --- SIZE MANAGEMENT ---
  const handleSizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSize) {
        await updateSize(sizeForm.id, sizeForm.size);
      } else {
        await addSize(sizeForm.size);
      }
      setSizeForm({ id: "", size: "" });
      setEditingSize(false);
    } catch (error) {
      console.error("Error saving size:", error);
    }
  };

  const handleEditSize = (size: { id: string; size: string }) => {
    setSizeForm({ id: size.id, size: size.size });
    setEditingSize(true);
  };

  const handleDeleteSize = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this size?")) {
      try {
        await deleteSize(id);
      } catch (error) {
        console.error("Error deleting size:", error);
      }
    }
  };

  const renderSizesTab = () => (
    <div>
      <form onSubmit={handleSizeSubmit} className="mb-6">
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex-grow">
            <label htmlFor="tyreSize" className="block text-sm font-medium text-gray-700 mb-1">
              Tyre Size
            </label>
            <input
              id="tyreSize"
              type="text"
              value={sizeForm.size}
              onChange={(e) => setSizeForm({ ...sizeForm, size: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g. 315/80R22.5"
              required
            />
          </div>
          <div className="self-end">
            <Button type="submit" className="h-10">
              {editingSize ? (
                <Save size={16} className="mr-1" />
              ) : (
                <Plus size={16} className="mr-1" />
              )}
              {editingSize ? "Update" : "Add"} Size
            </Button>
          </div>
          {editingSize && (
            <div className="self-end">
              <Button
                type="button"
                variant="outline"
                className="h-10"
                onClick={() => {
                  setSizeForm({ id: "", size: "" });
                  setEditingSize(false);
                }}
              >
                <X size={16} className="mr-1" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sizes.map((size) => (
          <div key={size.id} className="p-3 border rounded-md flex justify-between items-center">
            <span className="font-medium">{size.size}</span>
            <div className="space-x-2">
              <button
                onClick={() => handleEditSize(size)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDeleteSize(size.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // --- PATTERN MANAGEMENT ---
  const handlePatternSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPattern) {
        await updatePattern(patternForm.id, {
          brand: patternForm.brand,
          pattern: patternForm.pattern,
          size: patternForm.size,
          position: patternForm.position,
        });
      } else {
        await addPattern({
          brand: patternForm.brand,
          pattern: patternForm.pattern,
          size: patternForm.size,
          position: patternForm.position,
        });
      }
      setPatternForm({ id: "", brand: "", pattern: "", size: "", position: "Drive" });
      setEditingPattern(false);
    } catch (error) {
      console.error("Error saving pattern:", error);
    }
  };

  const handleEditPattern = (pattern: {
    id: string;
    brand: string;
    pattern: string;
    size: string;
    position: string;
  }) => {
    setPatternForm({
      id: pattern.id,
      brand: pattern.brand,
      pattern: pattern.pattern,
      size: pattern.size,
      position: pattern.position,
    });
    setEditingPattern(true);
  };

  const handleDeletePattern = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this pattern?")) {
      try {
        await deletePattern(id);
      } catch (error) {
        console.error("Error deleting pattern:", error);
      }
    }
  };

  const renderPatternsTab = () => (
    <div>
      <form onSubmit={handlePatternSubmit} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="patternBrand" className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <select
              id="patternBrand"
              value={patternForm.brand}
              onChange={(e) => setPatternForm({ ...patternForm, brand: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.name}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="patternSize" className="block text-sm font-medium text-gray-700 mb-1">
              Size
            </label>
            <select
              id="patternSize"
              value={patternForm.size}
              onChange={(e) => setPatternForm({ ...patternForm, size: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Size</option>
              {sizes.map((size) => (
                <option key={size.id} value={size.size}>
                  {size.size}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="patternName" className="block text-sm font-medium text-gray-700 mb-1">
              Pattern Name
            </label>
            <input
              id="patternName"
              type="text"
              value={patternForm.pattern}
              onChange={(e) => setPatternForm({ ...patternForm, pattern: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g. X Multi Z"
              required
            />
          </div>

          <div>
            <label
              htmlFor="patternPosition"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Recommended Position
            </label>
            <select
              id="patternPosition"
              value={patternForm.position}
              onChange={(e) => setPatternForm({ ...patternForm, position: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="Drive">Drive</option>
              <option value="Steer">Steer</option>
              <option value="Trailer">Trailer</option>
              <option value="Multi">Multi / All Position</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit">
            {editingPattern ? (
              <Save size={16} className="mr-1" />
            ) : (
              <Plus size={16} className="mr-1" />
            )}
            {editingPattern ? "Update" : "Add"} Pattern
          </Button>

          {editingPattern && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPatternForm({ id: "", brand: "", pattern: "", size: "", position: "Drive" });
                setEditingPattern(false);
              }}
            >
              <X size={16} className="mr-1" />
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Brand
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Pattern
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Size
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Position
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {patterns.map((pattern) => (
              <tr key={pattern.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {pattern.brand}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {pattern.pattern || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {pattern.size}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {pattern.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditPattern(pattern)}
                    className="text-blue-600 hover:text-blue-800 mr-2"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeletePattern(pattern.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // --- VEHICLE POSITION MANAGEMENT ---
  const handlePositionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPosition) {
        await updateVehiclePosition(positionForm.id, {
          vehicleType: positionForm.vehicleType,
          name: positionForm.name,
          positions: positionForm.positions,
        });
      } else {
        await addVehiclePosition({
          vehicleType: positionForm.vehicleType,
          name: positionForm.name,
          positions: positionForm.positions,
        });
      }
      setPositionForm({
        id: "",
        vehicleType: "",
        name: "",
        positions: [],
      });
      setEditingPosition(false);
    } catch (error) {
      console.error("Error saving vehicle position:", error);
    }
  };

  const handleEditPosition = (position: {
    id: string;
    vehicleType: string;
    name: string;
    positions: { id: string; name: string }[];
  }) => {
    setPositionForm({
      id: position.id,
      vehicleType: position.vehicleType,
      name: position.name,
      positions: [...position.positions],
    });
    setEditingPosition(true);
  };

  const handleDeletePosition = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this vehicle position configuration?")) {
      try {
        await deleteVehiclePosition(id);
      } catch (error) {
        console.error("Error deleting vehicle position:", error);
      }
    }
  };

  const handleAddPositionItem = () => {
    if (newPosition.name.trim() === "") return;

    // Generate a temporary ID for the new position
    const tempId = Date.now().toString();

    setPositionForm({
      ...positionForm,
      positions: [...positionForm.positions, { id: tempId, name: newPosition.name }],
    });

    // Reset the new position input
    setNewPosition({ id: "", name: "" });
  };

  const handleRemovePositionItem = (id: string) => {
    setPositionForm({
      ...positionForm,
      positions: positionForm.positions.filter((pos) => pos.id !== id),
    });
  };

  const renderPositionsTab = () => (
    <div>
      <form onSubmit={handlePositionSubmit} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Type
            </label>
            <input
              id="vehicleType"
              type="text"
              value={positionForm.vehicleType}
              onChange={(e) => setPositionForm({ ...positionForm, vehicleType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g. Truck, Trailer, Bus"
              required
            />
          </div>

          <div>
            <label htmlFor="positionName" className="block text-sm font-medium text-gray-700 mb-1">
              Configuration Name
            </label>
            <input
              id="positionName"
              type="text"
              value={positionForm.name}
              onChange={(e) => setPositionForm({ ...positionForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g. Standard 18-Wheeler"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Tyre Positions</h3>
          <div className="flex flex-wrap gap-3 mb-2">
            <div className="flex-grow">
              <input
                type="text"
                value={newPosition.name}
                onChange={(e) => setNewPosition({ ...newPosition, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Position name (e.g. Front Left, Rear Right)"
              />
            </div>
            <div>
              <Button
                type="button"
                onClick={handleAddPositionItem}
                disabled={newPosition.name.trim() === ""}
              >
                <Plus size={16} className="mr-1" />
                Add Position
              </Button>
            </div>
          </div>

          <div className="mt-3">
            {positionForm.positions.length === 0 ? (
              <p className="text-gray-500 italic">
                No positions added yet. Add at least one position.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {positionForm.positions.map((pos) => (
                  <div
                    key={pos.id}
                    className="flex items-center justify-between p-2 border rounded-md"
                  >
                    <span>{pos.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePositionItem(pos.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={positionForm.positions.length === 0}>
            {editingPosition ? (
              <Save size={16} className="mr-1" />
            ) : (
              <Plus size={16} className="mr-1" />
            )}
            {editingPosition ? "Update" : "Add"} Vehicle Position
          </Button>

          {editingPosition && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPositionForm({
                  id: "",
                  vehicleType: "",
                  name: "",
                  positions: [],
                });
                setEditingPosition(false);
              }}
            >
              <X size={16} className="mr-1" />
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Vehicle Type
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Configuration Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Positions
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vehiclePositions.map((position) => (
              <tr key={position.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {position.vehicleType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {position.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex flex-wrap gap-1">
                    {position.positions.map((pos) => (
                      <span key={pos.id} className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                        {pos.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditPosition(position)}
                    className="text-blue-600 hover:text-blue-800 mr-2"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeletePosition(position.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Tab navigation
  const tabs: { id: TabType; label: string }[] = [
    { id: "brands", label: "Brands" },
    { id: "sizes", label: "Sizes" },
    { id: "patterns", label: "Patterns" },
    { id: "positions", label: "Vehicle Positions" },
  ];

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Tyre Reference Data Manager</h2>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCcw size={16} className={`mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Tab navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 font-medium text-sm border-b-2 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {loading[tab.id === "positions" ? "vehiclePositions" : tab.id] && (
                  <span className="ml-2 inline-block h-2 w-2 bg-blue-600 rounded-full animate-pulse"></span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">An error occurred</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error.message}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab content */}
        {activeTab === "brands" && renderBrandsTab()}
        {activeTab === "sizes" && renderSizesTab()}
        {activeTab === "patterns" && renderPatternsTab()}
        {activeTab === "positions" && renderPositionsTab()}
      </CardContent>
    </Card>
  );
};

export default TyreReferenceManager;
