import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Edit,
  Package,
  PlusCircle,
  Search,
  Trash2,
} from "lucide-react";
import Papa from "papaparse";
import { StockItem, useWorkshop } from "../../context/WorkshopContext";

type StockInventoryPageProps = object;
type StockItemFormData = Omit<StockItem, "id"> & {
  lastRestocked: string; // explicitly ensure string type
};

const StockInventoryPage: React.FC<StockInventoryPageProps> = () => {
  const { stockItems, vendors, addStockItem, updateStockItem, deleteStockItem } = useWorkshop();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  // Ensure lastRestocked is always a string
  const [formData, setFormData] = useState<StockItemFormData>({
    itemCode: "",
    itemName: "",
    category: "",
    subCategory: "",
    description: "",
    unit: "",
    quantity: 0,
    reorderLevel: 0,
    cost: 0,
    vendor: "",
    vendorId: "",
    location: "",
    lastRestocked: new Date().toISOString().split("T")[0] as string, // yyyy-mm-dd
  });

  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(stockItems.map((item) => item.category)))],
    [stockItems]
  );

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return stockItems.filter((item) => {
      const matchesSearch =
        !term ||
        item.itemName.toLowerCase().includes(term) ||
        item.itemCode.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term);

      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [stockItems, searchTerm, selectedCategory]);

  const totalInventoryValue: number = useMemo(() => {
    return stockItems.reduce((sum: number, item: StockItem) => {
      const unitCost = Number(item.cost) || 0;
      const qty = Number(item.quantity) || 0;
      return sum + unitCost * qty;
    }, 0);
  }, [stockItems]);

  const lowStockItems: StockItem[] = useMemo(() => {
    return stockItems.filter((item: StockItem) => item.quantity <= item.reorderLevel);
  }, [stockItems]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const field = name as keyof StockItemFormData;

    setFormData((prev) => {
      const next: StockItemFormData = { ...prev };
      if (field === "quantity" || field === "reorderLevel" || field === "cost") {
        (next as any)[field] = parseFloat(value) || 0;
      } else if (field === "vendor") {
        const selectedVendor = vendors.find((v) => v.vendorName === value);
        next.vendor = value;
        next.vendorId = selectedVendor?.id || "";
      } else {
        (next as any)[field] = value;
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateStockItem(editingItem.id, formData);
      } else {
        await addStockItem(formData);
      }
      setFormData({
        itemCode: "",
        itemName: "",
        category: "",
        subCategory: "",
        description: "",
        unit: "",
        quantity: 0,
        reorderLevel: 0,
        cost: 0,
        vendor: "",
        vendorId: "",
        location: "",
        lastRestocked: new Date().toISOString().split("T")[0] as string,
      });
      setEditingItem(null);
      setShowAddForm(false);
    } catch (error) {
      console.error("Error saving stock item:", error);
      alert("Failed to save stock item. Please try again.");
    }
  };

  const handleEdit = (item: StockItem) => {
    setEditingItem(item);
    setFormData({
      itemCode: item.itemCode,
      itemName: item.itemName,
      category: item.category,
      subCategory: item.subCategory || "",
      description: item.description,
      unit: item.unit,
      quantity: item.quantity,
      reorderLevel: item.reorderLevel,
      cost: item.cost,
      vendor: item.vendor,
      vendorId: item.vendorId,
      location: item.location,
      // guarantee string for lastRestocked
      lastRestocked: item.lastRestocked ?? new Date().toISOString().split("T")[0],
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteStockItem(id);
      } catch (error) {
        console.error("Error deleting stock item:", error);
        alert("Failed to delete stock item. Please try again.");
      }
    }
  };

  const handleExportCSV = () => {
    const csvData = stockItems.map((item) => ({
      itemCode: item.itemCode,
      itemName: item.itemName,
      category: item.category,
      subCategory: item.subCategory || "",
      description: item.description,
      unit: item.unit,
      quantity: item.quantity,
      reorderLevel: item.reorderLevel,
      cost: item.cost,
      vendor: item.vendor,
      vendorId: item.vendorId,
      location: item.location,
      lastRestocked: item.lastRestocked, // already a string by type
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `stock_inventory_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const handleImportCSV = () => {
    if (!importFile) return;
    Papa.parse(importFile, {
      header: true,
      complete: async (results) => {
        const records = results.data as Partial<StockItem>[];
        const result = {
          success: 0,
          failed: 0,
          errors: [] as string[],
        };
        for (const record of records) {
          try {
            if (!record.itemCode || !record.itemName || !record.category) {
              throw new Error(
                `Missing required fields for item ${record.itemCode || "unknown"}`
              );
            }
            if (record.vendor && !record.vendorId) {
              const vendor = vendors.find((v) => v.vendorName === record.vendor);
              if (vendor) {
                record.vendorId = vendor.id;
              }
            }
            // Ensure lastRestocked is a string
            const stockItem: StockItemFormData = {
              itemCode: record.itemCode || "",
              itemName: record.itemName || "",
              category: record.category || "",
              subCategory: record.subCategory || "",
              description: record.description || "",
              unit: record.unit || "ea",
              quantity: Number(record.quantity) || 0,
              reorderLevel: Number(record.reorderLevel) || 0,
              cost: Number(record.cost) || 0,
              vendor: record.vendor || "",
              vendorId: record.vendorId || "",
              location: record.location || "",
              lastRestocked: (record.lastRestocked ?? new Date().toISOString().split("T")[0]) as string,
            };
            const existingItem = stockItems.find((i) => i.itemCode === stockItem.itemCode);
            if (existingItem) {
              await updateStockItem(existingItem.id, stockItem);
            } else {
              await addStockItem(stockItem);
            }
            result.success++;
          } catch (error) {
            console.error("Error importing stock item:", error);
            result.failed++;
            result.errors.push(`${record.itemCode || "unknown"}: ${(error as Error).message}`);
          }
        }
        setImportResults(result);
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        alert("Failed to parse CSV file. Please check the format.");
      },
    });
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        itemCode: "FILTER-01",
        itemName: "Oil Filter",
        category: "Filters",
        subCategory: "Engine",
        description: "High quality oil filter for diesel engines",
        unit: "ea",
        quantity: 10,
        reorderLevel: 5,
        cost: 12.99,
        vendor: "Auto Parts Inc",
        vendorId: "",
        location: "Shelf A1",
        lastRestocked: new Date().toISOString().split("T")[0],
      },
    ];
    const csv = Papa.unparse(templateData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "stock_inventory_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Package className="text-blue-600" />
          <h1 className="text-xl font-semibold">Stock Inventory</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setShowAddForm(true)}
          >
            <PlusCircle size={16} />
            Add Item
          </button>
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-gray-50"
            onClick={() => setShowImportModal(true)}
          >
            <ArrowDownToLine size={16} />
            Import CSV
          </button>
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-gray-50"
            onClick={handleExportCSV}
          >
            <ArrowUpFromLine size={16} />
            Export CSV
          </button>
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-gray-50"
            onClick={downloadTemplate}
          >
            <ArrowDownToLine size={16} />
            Template
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            className="w-full pl-7 pr-3 py-2 border rounded-md"
            placeholder="Search by name, code, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 border rounded-md w-full md:w-56"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="border rounded-md p-4">
          <p className="text-sm text-gray-500">Total Items</p>
          <p className="text-xl font-semibold">{stockItems.length}</p>
        </div>
        <div className="border rounded-md p-4">
          <p className="text-sm text-gray-500">Inventory Value</p>
          <p className="text-xl font-semibold">
            ${totalInventoryValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="border rounded-md p-4">
          <p className="text-sm text-gray-500">Low Stock</p>
          <p className="text-xl font-semibold">{lowStockItems.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-[960px] w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-sm">
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Unit</th>
              <th className="px-3 py-2">Qty</th>
              <th className="px-3 py-2">Reorder</th>
              <th className="px-3 py-2">Cost</th>
              <th className="px-3 py-2">Vendor</th>
              <th className="px-3 py-2">Location</th>
              <th className="px-3 py-2">Last Restocked</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredItems.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-3 py-2">{item.itemCode}</td>
                <td className="px-3 py-2">{item.itemName}</td>
                <td className="px-3 py-2">{item.category}</td>
                <td className="px-3 py-2">{item.unit}</td>
                <td className="px-3 py-2">{item.quantity}</td>
                <td className="px-3 py-2">{item.reorderLevel}</td>
                <td className="px-3 py-2">{item.cost}</td>
                <td className="px-3 py-2">{item.vendor}</td>
                <td className="px-3 py-2">{item.location}</td>
                <td className="px-3 py-2">{item.lastRestocked}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      className="inline-flex items-center gap-1 px-2 py-1 rounded border hover:bg-gray-50"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      className="inline-flex items-center gap-1 px-2 py-1 rounded border hover:bg-gray-50 text-red-600"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-gray-500" colSpan={11}>
                  No items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-xl w-full max-w-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editingItem ? "Edit Stock Item" : "Add Stock Item"}
              </h2>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowAddForm(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Item Code</label>
                <input
                  name="itemCode"
                  className="w-full px-3 py-2 border rounded"
                  value={formData.itemCode}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Item Name</label>
                <input
                  name="itemName"
                  className="w-full px-3 py-2 border rounded"
                  value={formData.itemName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Category</label>
                <input
                  name="category"
                  className="w-full px-3 py-2 border rounded"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Sub-Category</label>
                <input
                  name="subCategory"
                  className="w-full px-3 py-2 border rounded"
                  value={formData.subCategory}
                  onChange={handleInputChange}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Description</label>
                <textarea
                  name="description"
                  className="w-full px-3 py-2 border rounded"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Unit</label>
                <input
                  name="unit"
                  className="w-full px-3 py-2 border rounded"
                  value={formData.unit}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Quantity</label>
                <input
                  name="quantity"
                  type="number"
                  className="w-full px-3 py-2 border rounded"
                  value={formData.quantity}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Reorder Level</label>
                <input
                  name="reorderLevel"
                  type="number"
                  className="w-full px-3 py-2 border rounded"
                  value={formData.reorderLevel}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Cost</label>
                <input
                  name="cost"
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded"
                  value={formData.cost}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Vendor</label>
                <select
                  name="vendor"
                  className="w-full px-3 py-2 border rounded"
                  value={formData.vendor}
                  onChange={handleInputChange}
                >
                  <option value="">—</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.vendorName}>
                      {v.vendorName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">Location</label>
                <input
                  name="location"
                  className="w-full px-3 py-2 border rounded"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Last Restocked</label>
                <input
                  name="lastRestocked"
                  type="date"
                  className="w-full px-3 py-2 border rounded"
                  value={formData.lastRestocked}
                  onChange={handleInputChange}
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="px-3 py-2 rounded border"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingItem(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  {editingItem ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Import Stock from CSV</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowImportModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <input type="file" accept=".csv" onChange={handleFileChange} />
              <div className="flex items-center gap-3">
                <button
                  className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  disabled={!importFile}
                  onClick={handleImportCSV}
                >
                  Import
                </button>
                <button
                  className="px-3 py-2 rounded border"
                  onClick={() => setShowImportModal(false)}
                >
                  Close
                </button>
              </div>

              {importResults && (
                <div className="border rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="text-gray-500" size={16} />
                    <span className="font-medium">Import Results</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                    <div>Success: <strong className="text-green-600">{importResults.success}</strong></div>
                    <div>Failed: <strong className="text-red-600">{importResults.failed}</strong></div>
                    <div>Total: <strong>{importResults.success + importResults.failed}</strong></div>
                  </div>
                  {importResults.errors.length > 0 && (
                    <ul className="list-disc pl-5 text-sm text-red-600 space-y-1 max-h-40 overflow-auto">
                      {importResults.errors.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockInventoryPage;
