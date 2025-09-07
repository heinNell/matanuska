import { addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import {
  AlertTriangle,
  CheckCircle,
  CircleDot,
  Edit,
  FileDown,
  FileUp,
  Filter,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { firestore } from "../../firebase";
import { tyreConverter } from "../../types/TyreFirestoreConverter";

// Corrected Tyre interface to align with component logic
interface Tyre {
  id: string;
  brand: string;
  model: string;
  serialNumber: string;
  size: string;
  status: "new" | "in_use" | "worn" | "damaged" | "disposed";
  location: string;
  vehicleId?: string;
  vehicleReg?: string;
  position?: string;
  purchaseDate?: string; // Made optional
  purchasePrice: number;
  treadDepth?: number;
  lastInspection?: string;
  notes?: string;
}

const initialFormState: Omit<Tyre, "id"> = {
  brand: "",
  model: "",
  serialNumber: "",
  size: "",
  status: "new",
  location: "warehouse",
  purchaseDate: new Date().toISOString().split("T")[0],
  purchasePrice: 0,
};

const TyreInventoryManager: React.FC = () => {
  const [tyres, setTyres] = useState<Tyre[]>([]);
  const [filteredTyres, setFilteredTyres] = useState<Tyre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Omit<Tyre, "id">>(initialFormState);
  const [editingTyreId, setEditingTyreId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [sizeFilter, setSizeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [tyresPerPage] = useState(10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Offline cache + op queue keys
  const TYRES_CACHE_KEY = "tyres_cache_v1";
  const TYRES_OP_QUEUE_KEY = "tyres_op_queue_v1";

  type PendingOp =
    | { type: "add"; tempId: string; data: Omit<Tyre, "id"> }
    | { type: "update"; id: string; data: Partial<Omit<Tyre, "id">> }
    | { type: "delete"; id: string };

  const loadQueue = (): PendingOp[] => {
    try {
      return JSON.parse(localStorage.getItem(TYRES_OP_QUEUE_KEY) || "[]");
    } catch {
      return [];
    }
  };
  const saveQueue = (q: PendingOp[]) => localStorage.setItem(TYRES_OP_QUEUE_KEY, JSON.stringify(q));
  const enqueue = (op: PendingOp) => {
    const q = loadQueue();
    q.push(op);
    saveQueue(q);
  };

  const processQueue = async () => {
    if (!navigator.onLine) return;
    const q = loadQueue();
    if (!q.length) return;
    const remaining: PendingOp[] = [];
    for (const op of q) {
      try {
        if (op.type === "add") {
          const ref = await addDoc(collection(firestore, "tyres"), {
            ...op.data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          setTyres((prev) => prev.map((t) => (t.id === op.tempId ? { ...t, id: ref.id } : t)));
        } else if (op.type === "update") {
          await updateDoc(doc(firestore, "tyres", op.id), {
            ...op.data,
            updatedAt: new Date().toISOString(),
          });
        } else if (op.type === "delete") {
          await deleteDoc(doc(firestore, "tyres", op.id));
        }
      } catch (err) {
        console.warn("Queue op failed, retaining for retry", op, err);
        remaining.push(op);
      }
    }
    saveQueue(remaining);
  };

  const loadCache = () => {
    try {
      return JSON.parse(localStorage.getItem(TYRES_CACHE_KEY) || "[]") as Tyre[];
    } catch {
      return [];
    }
  };
  const saveCache = (list: Tyre[]) => {
    try {
      localStorage.setItem(TYRES_CACHE_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  };

  // ACTION HANDLERS
  const handleToggleAddForm = () => {
    setShowAddForm(!showAddForm);
    setEditingTyreId(null);
    setFormData(initialFormState);
  };

  const handleExportClick = () => {
    handleExportData();
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleClearFilters = () => {
    resetFilters();
  };

  const handleSaveOrUpdate = () => {
    if (editingTyreId) {
      handleUpdateTyre();
    } else {
      handleAddTyre();
    }
  };

  const handleEditClick = (tyre: Tyre) => handleEditTyre(tyre);
  const handleDeleteClick = (id: string) => handleDeleteTyre(id);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handleGotoPage = (page: number) => setCurrentPage(page);

  useEffect(() => {
    const cached = loadCache();
    if (cached.length) {
      setTyres(cached);
      applyFilters(cached, searchTerm, statusFilter, brandFilter, sizeFilter);
      setLoading(false);
    }
    const tyresRef = collection(firestore, "tyres").withConverter(tyreConverter as any);
    const unsubscribe = onSnapshot(
      tyresRef,
      (snapshot) => {
        const liveTyres: Tyre[] = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setTyres(liveTyres);
        applyFilters(liveTyres, searchTerm, statusFilter, brandFilter, sizeFilter);
        saveCache(liveTyres);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Error subscribing to tyres collection:", err);
        setError("Failed to load tyre inventory.");
        setLoading(false);
      }
    );
    window.addEventListener("online", processQueue);
    processQueue();
    return () => {
      unsubscribe();
      window.removeEventListener("online", processQueue);
    };
  }, []);

  const applyFilters = (
    tyreList: Tyre[],
    search: string = searchTerm,
    status: string = statusFilter,
    brand: string = brandFilter,
    size: string = sizeFilter
  ) => {
    let filtered = tyreList;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (tyre) =>
          tyre.serialNumber.toLowerCase().includes(searchLower) ||
          tyre.brand.toLowerCase().includes(searchLower) ||
          tyre.model.toLowerCase().includes(searchLower) ||
          tyre.vehicleReg?.toLowerCase().includes(searchLower) ||
          false
      );
    }
    if (status !== "all") {
      filtered = filtered.filter((tyre) => tyre.status === status);
    }
    if (brand !== "all") {
      filtered = filtered.filter((tyre) => tyre.brand === brand);
    }
    if (size !== "all") {
      filtered = filtered.filter((tyre) => tyre.size === size);
    }
    setFilteredTyres(filtered);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters(tyres, value, statusFilter, brandFilter, sizeFilter);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStatusFilter(value);
    applyFilters(tyres, searchTerm, value, brandFilter, sizeFilter);
  };

  const handleBrandFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setBrandFilter(value);
    applyFilters(tyres, searchTerm, statusFilter, value, sizeFilter);
  };

  const handleSizeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSizeFilter(value);
    applyFilters(tyres, searchTerm, statusFilter, brandFilter, value);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setBrandFilter("all");
    setSizeFilter("all");
    applyFilters(tyres, "", "all", "all", "all");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "purchasePrice" || name === "treadDepth" ? parseFloat(value) || 0 : value,
    });
  };

  const handleAddTyre = async () => {
    if (!formData.brand || !formData.serialNumber || !formData.size) {
      setError("Brand, serial number and size are required fields");
      return;
    }
    const tempId = `temp-${Date.now()}`;
    const optimistic: Tyre = { id: tempId, ...formData };
    setTyres((prev) => {
      const next = [...prev, optimistic];
      applyFilters([...prev, optimistic]);
      return next;
    });
    setShowAddForm(false);
    setFormData(initialFormState);
    setError(null);
    if (!navigator.onLine) {
      enqueue({ type: "add", tempId, data: formData });
      return;
    }
    try {
      const ref = await addDoc(collection(firestore, "tyres"), {
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setTyres((prev) => prev.map((t) => (t.id === tempId ? { ...t, id: ref.id } : t)));
    } catch (err) {
      console.error("Error adding tyre:", err);
      setError("Failed to add tyre – reverted.");
      setTyres((prev) => prev.filter((t) => t.id !== tempId));
      applyFilters(tyres, searchTerm, statusFilter, brandFilter, sizeFilter);
    }
  };

  const handleUpdateTyre = async () => {
    if (!editingTyreId) return;
    const previous = tyres.find((t) => t.id === editingTyreId);
    if (!previous) {
      setError("Tyre not found for update.");
      return;
    }

    const updated: Tyre = { ...previous, ...formData, id: editingTyreId };

    setTyres((prev) => {
      const next = prev.map((t) => (t.id === editingTyreId ? updated : t));
      applyFilters(next);
      return next;
    });
    setFormData(initialFormState);
    setEditingTyreId(null);
    setShowAddForm(false);
    if (!navigator.onLine) {
      enqueue({ type: "update", id: editingTyreId, data: formData });
      return;
    }
    try {
      await updateDoc(doc(firestore, "tyres", editingTyreId), {
        ...formData,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error updating tyre:", err);
      setError("Failed to update tyre – reverting.");
      if (previous) {
        setTyres((prev) => prev.map((t) => (t.id === editingTyreId ? previous : t)));
        applyFilters(tyres, searchTerm, statusFilter, brandFilter, sizeFilter);
      }
    }
  };

  const handleEditTyre = (tyre: Tyre) => {
    setFormData({
      brand: tyre.brand,
      model: tyre.model,
      serialNumber: tyre.serialNumber,
      size: tyre.size,
      status: tyre.status,
      location: tyre.location,
      vehicleId: tyre.vehicleId,
      vehicleReg: tyre.vehicleReg,
      position: tyre.position,
      purchaseDate: tyre.purchaseDate,
      purchasePrice: tyre.purchasePrice,
      treadDepth: tyre.treadDepth,
      lastInspection: tyre.lastInspection,
      notes: tyre.notes,
    });
    setEditingTyreId(tyre.id);
    setShowAddForm(true);
  };

  const handleDeleteTyre = async (id: string) => {
    const backup = tyres.find((t) => t.id === id);
    setTyres((prev) => {
      const next = prev.filter((t) => t.id !== id);
      applyFilters(next);
      return next;
    });
    if (!navigator.onLine) {
      enqueue({ type: "delete", id });
      return;
    }
    try {
      await deleteDoc(doc(firestore, "tyres", id));
    } catch (err) {
      console.error("Error deleting tyre:", err);
      setError("Failed to delete tyre – reverting.");
      if (backup) {
        setTyres((prev) => {
          const next = [...prev, backup];
          applyFilters(next);
          return next;
        });
      }
    }
  };

  const indexOfLastTyre = currentPage * tyresPerPage;
  const indexOfFirstTyre = indexOfLastTyre - tyresPerPage;
  const currentTyres = filteredTyres.slice(indexOfFirstTyre, indexOfLastTyre);
  const totalPages = Math.ceil(filteredTyres.length / tyresPerPage);

  // Export data
  const handleExportData = () => {
    const csvContent = [
      [
        "ID",
        "Brand",
        "Model",
        "Serial Number",
        "Size",
        "Status",
        "Location",
        "Vehicle Reg",
        "Position",
        "Purchase Date",
        "Price",
        "Tread Depth",
        "Last Inspection",
        "Notes",
      ],
      ...filteredTyres.map((tyre) => [
        tyre.id,
        tyre.brand,
        tyre.model,
        tyre.serialNumber,
        tyre.size,
        tyre.status,
        tyre.location,
        tyre.vehicleReg ?? "",
        tyre.position ?? "",
        tyre.purchaseDate ?? "",
        tyre.purchasePrice.toString(),
        tyre.treadDepth?.toString() ?? "",
        tyre.lastInspection ?? "",
        tyre.notes ?? "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `tyre-inventory-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (text: string) => {
    try {
      const lines = text.split("\n").filter((line) => line.trim() !== "");
      if (lines.length === 0) return [];

      const headerLine = lines[0] ?? "";
      const headers = headerLine.split(",");

      const data = lines.slice(1).map((line) => {
        const values = line.split(",");
        const entry: Record<string, string> = {};

        headers.forEach((header, index) => {
          const key = (header ?? "").trim();
          const value = (values[index] ?? "").trim();
          if (key) entry[key] = value;
        });

        return entry;
      });

      return data;
    } catch (error) {
      console.error("Error parsing CSV:", error);
      setError("Failed to parse CSV file. Please check the format.");
      return null;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const parsedData = parseCSV(text);

        if (!parsedData) return;

        const newTyres: Omit<Tyre, "id">[] = parsedData.map((item) => {
          const status = (item["Status"] || "new") as Tyre["status"];

          return {
            brand: item["Brand"] ?? "",
            model: item["Model"] ?? "",
            serialNumber: item["Serial Number"] ?? "",
            size: item["Size"] ?? "",
            status: status,
            location: item["Location"] ?? "warehouse",
            vehicleId: item["Vehicle ID"] ?? undefined,
            vehicleReg: item["Vehicle Reg"] ?? undefined,
            position: item["Position"] ?? undefined,
            purchaseDate: item["Purchase Date"] ?? new Date().toISOString().split("T")[0],
            purchasePrice: parseFloat(item["Price"] ?? "0") || 0,
            treadDepth: item["Tread Depth"] ? parseFloat(item["Tread Depth"]) : undefined,
            lastInspection: item["Last Inspection"] ?? undefined,
            notes: item["Notes"] ?? undefined,
          };
        });

        const tyresWithIds: Tyre[] = newTyres.map((tyre, index) => ({
          ...tyre,
          id: `imported-${Date.now()}-${index}`,
        }));

        const updatedTyres = [...tyres, ...tyresWithIds];
        setTyres(updatedTyres);
        applyFilters(updatedTyres, searchTerm, statusFilter, brandFilter, sizeFilter);

        setSuccess(`Successfully imported ${tyresWithIds.length} tyres.`);

      } catch (err) {
        console.error("Error importing tyres:", err);
        setError("Failed to import tyres. Please check the file format.");
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    reader.onerror = () => {
      setError("Failed to read file. Please try again.");
    };

    reader.readAsText(file);
  };

  const uniqueBrands = Array.from(new Set(tyres.map((tyre) => tyre.brand)));
  const uniqueSizes = Array.from(new Set(tyres.map((tyre) => tyre.size)));

  const getStatusStyle = (status: Tyre["status"]) => {
    switch (status) {
      case "new":
        return "bg-green-100 text-green-800";
      case "in_use":
        return "bg-blue-100 text-blue-800";
      case "worn":
        return "bg-yellow-100 text-yellow-800";
      case "damaged":
        return "bg-orange-100 text-orange-800";
      case "disposed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <CircleDot className="mr-2 text-primary-600" size={24} />
          Tyre Inventory Manager
        </h1>

        <div className="flex gap-3">
          <button
            onClick={handleToggleAddForm}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Plus size={18} className="mr-1" />
            Add New Tyre
          </button>
          <button
            onClick={handleExportClick}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FileDown size={18} className="mr-1" />
            Export
          </button>
          <button
            onClick={handleImportClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FileUp size={18} className="mr-1" />
            Import CSV
          </button>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertTriangle className="mr-2" size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
          <CheckCircle className="mr-2" size={18} />
          {success}
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">
            {editingTyreId ? "Edit Tyre" : "Add New Tyre"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand*</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number*</label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size*</label>
              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                placeholder="e.g. 295/80R22.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="new">New</option>
                <option value="in_use">In Use</option>
                <option value="worn">Worn</option>
                <option value="damaged">Damaged</option>
                <option value="disposed">Disposed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="warehouse">Warehouse</option>
                <option value="vehicle">Vehicle</option>
              </select>
            </div>

            {formData.location === "vehicle" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Registration
                  </label>
                  <input
                    type="text"
                    name="vehicleReg"
                    value={formData.vehicleReg || ""}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. ABC1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <select
                    name="position"
                    value={formData.position || ""}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Position</option>
                    <option value="front-left">Front Left</option>
                    <option value="front-right">Front Right</option>
                    <option value="rear-left-outer">Rear Left Outer</option>
                    <option value="rear-left-inner">Rear Left Inner</option>
                    <option value="rear-right-inner">Rear Right Inner</option>
                    <option value="rear-right-outer">Rear Right Outer</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
              <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate ?? ''}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Price ($)
              </label>
              <input
                type="number"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tread Depth (mm)
              </label>
              <input
                type="number"
                name="treadDepth"
                value={formData.treadDepth ?? ""}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="0"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Inspection
              </label>
              <input
                type="date"
                name="lastInspection"
                value={formData.lastInspection ?? ""}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes ?? ""}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
             />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingTyreId(null);
                setFormData(initialFormState);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveOrUpdate}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              {editingTyreId ? "Update" : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white shadow-md rounded-lg mb-6">
        <div className="p-4 border-b flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by serial number, brand, or vehicle reg..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in_use">In Use</option>
                <option value="worn">Worn</option>
                <option value="damaged">Damaged</option>
                <option value="disposed">Disposed</option>
              </select>
            </div>

            <select
              value={brandFilter}
              onChange={handleBrandFilterChange}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Brands</option>
              {uniqueBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>

            <select
              value={sizeFilter}
              onChange={handleSizeFilterChange}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Sizes</option>
              {uniqueSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>

            <button
              onClick={handleClearFilters}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Status summary */}
        <div className="px-4 py-2 bg-gray-50 border-b flex flex-wrap gap-3">
          <div className="text-sm">
            <span className="font-medium">Total: </span>
            {filteredTyres.length}
          </div>
          <div className="text-sm">
            <span className="font-medium">New: </span>
            {filteredTyres.filter((t) => t.status === "new").length}
          </div>
          <div className="text-sm">
            <span className="font-medium">In Use: </span>
            {filteredTyres.filter((t) => t.status === "in_use").length}
          </div>
          <div className="text-sm">
            <span className="font-medium">Worn: </span>
            {filteredTyres.filter((t) => t.status === "worn").length}
          </div>
          <div className="text-sm">
            <span className="font-medium">Damaged: </span>
            {filteredTyres.filter((t) => t.status === "damaged").length}
          </div>
        </div>

        {/* Tyres Table */}
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600" />
          </div>
        ) : filteredTyres.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CircleDot className="mx-auto mb-2" size={24} />
            <p>No tyres found matching your criteria.</p>
            <button
              onClick={handleClearFilters}
              className="mt-2 text-primary-600 hover:text-primary-700"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tyre Details
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Purchase Info
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTyres.map((tyre) => (
                  <tr key={tyre.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {tyre.brand} {tyre.model}
                      </div>
                      <div className="text-sm text-gray-500">SN: {tyre.serialNumber}</div>
                      <div className="text-xs text-gray-500">{tyre.size}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(tyre.status)}`}
                      >
                        {formatStatus(tyre.status)}
                      </span>
                      {tyre.treadDepth && (
                        <div className="text-xs text-gray-500 mt-1">Tread: {tyre.treadDepth}mm</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 capitalize">{tyre.location}</div>
                      {tyre.vehicleReg && (
                        <>
                          <div className="text-sm text-gray-600">{tyre.vehicleReg}</div>
                          <div className="text-xs text-gray-500 capitalize">
                            {tyre.position?.replace(/-/g, " ")}
                          </div>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${tyre.purchasePrice.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        {tyre.purchaseDate ? new Date(tyre.purchaseDate).toLocaleDateString() : 'N/A'}
                      </div>
                      {tyre.lastInspection && (
                        <div className="text-xs text-gray-500">
                          Last check: {new Date(tyre.lastInspection).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEditClick(tyre)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(tyre.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredTyres.length > tyresPerPage && (
          <div className="px-6 py-3 flex items-center justify-between border-t">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstTyre + 1}</span> to{" "}
              <span className="font-medium">{Math.min(indexOfLastTyre, filteredTyres.length)}</span>{" "}
              of <span className="font-medium">{filteredTyres.length}</span> tyres
            </div>
            <div className="flex space-x-1">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handleGotoPage(pageNum)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === pageNum
                        ? "bg-primary-100 text-primary-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            {filteredTyres.filter((t) => t.treadDepth && t.treadDepth < 4).length > 0 ? (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-blue-500" />
            )}
          </div>
          <div className="ml-3">
            {filteredTyres.filter((t) => t.treadDepth && t.treadDepth < 4).length > 0 ? (
              <p className="text-sm text-amber-700">
                Warning: {filteredTyres.filter((t) => t.treadDepth && t.treadDepth < 4).length}{" "}
                tyres have tread depth below 4mm and should be replaced soon.
              </p>
            ) : (
              <p className="text-sm text-blue-700">
                Pro Tip: Use the export feature to generate reports for your maintenance team or for
                regulatory compliance.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TyreInventoryManager;
