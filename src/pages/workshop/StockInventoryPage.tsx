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
import React, { useMemo, useState } from "react";
import { StockItem, useWorkshop } from "../../context/WorkshopContext";
import { Button } from "@/components/ui/Button";

// Replace the empty interface with a type alias for clarity
type StockInventoryPageProps = object;

const StockInventoryPage: React.FC<StockInventoryPageProps> = () => {
  const { stockItems, vendors, addStockItem, updateStockItem, deleteStockItem, isLoading } =
    useWorkshop();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  // Form state
  const [formData, setFormData] = useState({
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
    lastRestocked: new Date().toISOString().split("T")[0],
  });

  // CSV import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  // Get unique categories for filter
  const categories = ["All", ...new Set(stockItems.map((item) => item.category))];

  // Filter items based on search and category
  const filteredItems = stockItems.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Derived metrics - MOVED TO THE CORRECT LOCATION
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

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Convert numeric fields
    if (name === "quantity" || name === "reorderLevel" || name === "cost") {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      });
    } else if (name === "vendor") {
      // Find the vendor ID when vendor name is selected
      const selectedVendor = vendors.find((v) => v.vendorName === value);
      setFormData({
        ...formData,
        vendor: value,
        vendorId: selectedVendor?.id || "",
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingItem) {
        await updateStockItem(editingItem.id, formData);
      } else {
        await addStockItem(formData);
      }

      // Reset form and state
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
        lastRestocked: new Date().toISOString().split("T")[0],
      });
      setEditingItem(null);
      setShowAddForm(false);
    } catch (error) {
      console.error("Error saving stock item:", error);
      alert("Failed to save stock item. Please try again.");
    }
  };

  // Setup form for editing
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
      lastRestocked: item.lastRestocked,
    });
    setShowAddForm(true);
  };

  // Handle delete
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

  // Export stock items to CSV
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
      lastRestocked: item.lastRestocked,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `stock_inventory_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle file selection for import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  // Handle CSV import
  const handleImportCSV = () => {
    if (!importFile) return;

    Papa.parse(importFile, {
      header: true,
      complete: async (results) => {
        const records = results.data as Partial<StockItem>[];

        const importResults = {
          success: 0,
          failed: 0,
          errors: [] as string[],
        };

        for (const record of records) {
          try {
            // Validate required fields
            if (!record.itemCode || !record.itemName || !record.category) {
              throw new Error(`Missing required fields for item ${record.itemCode || "unknown"}`);
            }

            // Find vendor ID if only name is provided
            if (record.vendor && !record.vendorId) {
              const vendor = vendors.find((v) => v.vendorName === record.vendor);
              if (vendor) {
                record.vendorId = vendor.id;
              }
            }

            // Prepare complete record
            const stockItem = {
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
              lastRestocked: record.lastRestocked || new Date().toISOString().split("T")[0],
            };

            // Check for existing item to update instead of adding duplicate
            const existingItem = stockItems.find((item) => item.itemCode === stockItem.itemCode);

            if (existingItem) {
              await updateStockItem(existingItem.id, stockItem);
            } else {
              await addStockItem(stockItem);
            }

            importResults.success++;
          } catch (error) {
            console.error("Error importing stock item:", error);
            importResults.failed++;
            importResults.errors.push(
              `${record.itemCode || "unknown"}: ${(error as Error).message}`
            );
          }
        }

        setImportResults(importResults);
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        alert("Failed to parse CSV file. Please check the format.");
      },
    });
  };

  // CSV template for download
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
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Package className="mr-2" /> Stock Inventory Management
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <PlusCircle size={18} className="mr-2" /> {editingItem ? "Edit Item" : "Add New Item"}
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <ArrowUpFromLine size={18} className="mr-2" /> Import CSV
          </button>
          <button
            onClick={handleExportCSV}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <ArrowDownToLine size={18} className="mr-2" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap items-center mb-6 gap-4">
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={18} />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-500">
          {filteredItems.length} items • Total value: **${totalInventoryValue.toFixed(2)}**
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">
            {editingItem ? "Edit Stock Item" : "Add New Stock Item"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Item Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Code *</label>
                <input
                  type="text"
                  name="itemCode"
                  value={formData.itemCode}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Sub-Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label>
                <input
                  type="text"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Vendor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <select
                  name="vendor"
                  value={formData.vendor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a vendor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.vendorName}>
                      {vendor.vendorName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($) *</label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Reorder Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reorder Level *
                </label>
                <input
                  type="number"
                  name="reorderLevel"
                  value={formData.reorderLevel}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Storage Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Last Restocked Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Restocked
                </label>
                <input
                  type="date"
                  name="lastRestocked"
                  value={formData.lastRestocked}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
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
                    lastRestocked: new Date().toISOString().split("T")[0],
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {editingItem ? "Update Item" : "Add Item"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Import Stock Items from CSV</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            {importResults && (
              <div className="mb-4 p-3 bg-gray-50 rounded border">
                <h3 className="font-medium text-gray-800">Import Results:</h3>
                <p className="text-green-600">
                  ✓ {importResults.success} items imported successfully
                </p>
                <p className="text-red-600">✗ {importResults.failed} items failed</p>

                {importResults.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-gray-800">Errors:</p>
                    <ul className="text-sm text-red-600 list-disc list-inside">
                      {importResults.errors.slice(0, 5).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {importResults.errors.length > 5 && (
                        <li>...and {importResults.errors.length - 5} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col space-y-3">
              <button
                onClick={downloadTemplate}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center justify-center"
              >
                <ArrowDownToLine size={16} className="mr-1" /> Download CSV Template
              </button>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportResults(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={handleImportCSV}
                  disabled={!importFile}
                  className={`px-4 py-2 rounded-md text-white focus:outline-none ${
                    importFile ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
                  }`}
                >
                  Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reorder Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendor
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading.stockItems ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  Loading stock items...
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  No stock items found
                </td>
              </tr>
            ) : (
              filteredItems.map((item: StockItem) => (
                <tr key={item.id} className={item.quantity <= item.reorderLevel ? "bg-red-50" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.itemCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.itemName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.category}
                    {item.subCategory && (
                      <span className="text-xs text-gray-400"> / {item.subCategory}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        item.quantity <= item.reorderLevel
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {item.quantity} {item.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.reorderLevel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${item.cost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.vendor || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Low Stock Warning */}
      {lowStockItems.length > 0 && (
        <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Low Stock Alert ({lowStockItems.length} items)
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {lowStockItems.slice(0, 5).map((item: StockItem) => (
                    <li key={item.id}>
                      {item.itemName} - {item.quantity} {item.unit} remaining (Reorder level:{" "}
                      {item.reorderLevel})
                    </li>
                  ))}
                  {lowStockItems.length > 5 && (
                    <li>... and {lowStockItems.length - 5} more items</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockInventoryPage;
