import { Button } from "../../components/ui/Button";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { useAppContext } from "../../context/AppContext";
import { db } from "../../firebase";
import { Card, CardContent, CardHeader } from "../ui/Card";
import SyncIndicator from "../ui/SyncIndicator";

interface StockItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  reorderLevel: number;
  supplier: string;
  location: string;
  lastOrderDate: string | null;
  unitCost: number;
  notes?: string;
}

interface Filter {
  category: string;
  supplier: string;
  belowReorder: boolean;
}

const StockManager: React.FC = () => {
  const { isLoading } = useAppContext();
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<StockItem[]>([]);
  const [filters, setFilters] = useState<Filter>({
    category: "",
    supplier: "",
    belowReorder: false,
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<StockItem>>({
    name: "",
    sku: "",
    category: "",
    quantity: 0,
    reorderLevel: 10,
    supplier: "",
    location: "",
    lastOrderDate: null,
    unitCost: 0,
    notes: "",
  });
  const [syncing, setSyncing] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Fetch stock items from Firestore
  useEffect(() => {
    setSyncing(true);
    // For demonstration, we're setting up a mock listener that would typically connect to Firestore
    const unsubscribe = setTimeout(() => {
      // Mock data - in a real app this would be from Firestore
      const mockData: StockItem[] = [
        {
          id: "1",
          name: "Brake Pads",
          sku: "BP-1001",
          category: "Brakes",
          quantity: 24,
          reorderLevel: 10,
          supplier: "AutoParts Inc",
          location: "Warehouse A, Shelf 3",
          lastOrderDate: "2023-09-15",
          unitCost: 45.99,
        },
        {
          id: "2",
          name: "Engine Oil Filter",
          sku: "OF-2002",
          category: "Filters",
          quantity: 8,
          reorderLevel: 15,
          supplier: "FilterMaster",
          location: "Warehouse B, Shelf 2",
          lastOrderDate: "2023-10-01",
          unitCost: 12.5,
        },
        {
          id: "3",
          name: "Headlight Assembly",
          sku: "HL-3003",
          category: "Lighting",
          quantity: 6,
          reorderLevel: 5,
          supplier: "LightBright Co",
          location: "Warehouse A, Shelf 7",
          lastOrderDate: "2023-08-22",
          unitCost: 89.95,
        },
        {
          id: "4",
          name: "Windshield Wipers",
          sku: "WW-4004",
          category: "Exterior",
          quantity: 3,
          reorderLevel: 8,
          supplier: "ClearView",
          location: "Warehouse C, Shelf 1",
          lastOrderDate: "2023-09-10",
          unitCost: 21.75,
        },
        {
          id: "5",
          name: "Air Filter",
          sku: "AF-5005",
          category: "Filters",
          quantity: 12,
          reorderLevel: 10,
          supplier: "FilterMaster",
          location: "Warehouse B, Shelf 3",
          lastOrderDate: "2023-10-05",
          unitCost: 18.25,
        },
      ];

      setStockItems(mockData);
      setFilteredItems(mockData);

      // Extract unique categories and suppliers for filter dropdowns
      const uniqueCategories = [...new Set(mockData.map((item) => item.category))];
      const uniqueSuppliers = [...new Set(mockData.map((item) => item.supplier))];

      setCategories(uniqueCategories);
      setSuppliers(uniqueSuppliers);
      setSyncing(false);
    }, 1000);

    // In a real app, this would be the unsubscribe function from onSnapshot
    return () => clearTimeout(unsubscribe);
  }, []);

  // Apply filters to stock items
  useEffect(() => {
    let results = [...stockItems];

    if (filters.category) {
      results = results.filter((item) => item.category === filters.category);
    }

    if (filters.supplier) {
      results = results.filter((item) => item.supplier === filters.supplier);
    }

    if (filters.belowReorder) {
      results = results.filter((item) => item.quantity < item.reorderLevel);
    }

    setFilteredItems(results);
  }, [filters, stockItems]);

  // Handle filter changes
  const handleFilterChange = (field: keyof Filter, value: string | boolean) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle new item form changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "reorderLevel" || name === "unitCost"
          ? parseFloat(value)
          : value,
    }));
  };

  // Add new stock item
  const resetNewItem = () => {
    setNewItem({
      name: "",
      sku: "",
      category: "",
      quantity: 0,
      reorderLevel: 10,
      supplier: "",
      location: "",
      lastOrderDate: null,
      unitCost: 0,
      notes: "",
    });
    setEditingItemId(null);
  };

  const handleAddItem = () => {
    const newId = (stockItems.length + 1).toString();
    const itemToAdd = { ...newItem, id: newId } as StockItem;
    setStockItems((prev) => [...prev, itemToAdd]);
    setIsAddModalOpen(false);
    resetNewItem();
    setNotification({ show: true, message: "Stock item added successfully", type: "success" });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const handleEditItem = (item: StockItem) => {
    setEditingItemId(item.id);
    setNewItem({ ...item });
    setIsAddModalOpen(true);
  };

  const handleUpdateItem = () => {
    if (!editingItemId) return;
    setStockItems((prev) =>
      prev.map((i) =>
        i.id === editingItemId ? { ...(newItem as StockItem), id: editingItemId } : i
      )
    );
    setIsAddModalOpen(false);
    setNotification({ show: true, message: "Stock item updated successfully", type: "success" });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
    resetNewItem();
  };

  const handleDeleteItem = (id: string) => {
    if (!window.confirm("Delete this stock item?")) return;
    setStockItems((prev) => prev.filter((i) => i.id !== id));
    setNotification({ show: true, message: "Stock item deleted", type: "success" });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // Export stock items as CSV
  const handleExport = () => {
    const headers = [
      "Name",
      "SKU",
      "Category",
      "Quantity",
      "Reorder Level",
      "Supplier",
      "Location",
      "Last Order Date",
      "Unit Cost",
      "Notes",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredItems.map((item) =>
        [
          item.name,
          item.sku,
          item.category,
          item.quantity,
          item.reorderLevel,
          item.supplier,
          item.location,
          item.lastOrderDate || "",
          item.unitCost,
          item.notes || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "stock_inventory.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Show success notification
  };

  // Export stock items as Excel
  const handleExportExcel = () => {
    try {
      // Prepare data for Excel export
      const excelData = filteredItems.map((item) => ({
        Name: item.name,
        SKU: item.sku,
        Category: item.category,
        Quantity: item.quantity,
        "Reorder Level": item.reorderLevel,
        Supplier: item.supplier,
        Location: item.location,
        "Last Order Date": item.lastOrderDate || "",
        "Unit Cost": item.unitCost,
        "Stock Value": item.quantity * item.unitCost,
        Notes: item.notes || "",
      }));

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventory");

      // Add some styling to headers
      const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + "1";
        if (!ws[address]) continue;
        ws[address].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "EFEFEF" } },
        };
      }

  // Save to file
  XLSX.writeFile(wb, `inventory_stock_${new Date().toISOString().slice(0, 10)}.xlsx`);

      // Show success notification
      alert("Excel file exported successfully!");
    } catch (error) {
      console.error("Failed to export Excel file:", error);
      alert("Failed to export Excel file. Please try again.");
    }
  };

  // Import stock items from CSV or Excel
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const data = event.target?.result;
        let parsedData: Partial<StockItem>[] = [];

        if (file.name.endsWith(".csv")) {
          // Handle CSV import
          const text = data as string;
          const rows = text.split("\n");

          // Check if rows array is empty or first row is undefined
          if (rows.length === 0 || !rows[0]) {
            throw new Error("Invalid CSV file: No data found");
          }

          const headers = rows[0].split(",").map((h) => h.trim());

          // Normalize helper for header keys
          const norm = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");

          // Map normalized header -> StockItem key
          const headerKeyMap: Record<string, keyof StockItem> = {
            // identity
            [norm("Name")]: "name",
            [norm("SKU")]: "sku",
            [norm("Category")]: "category",
            [norm("Quantity")]: "quantity",
            [norm("Reorder Level")]: "reorderLevel",
            [norm("Supplier")]: "supplier",
            [norm("Location")]: "location",
            [norm("Last Order Date")]: "lastOrderDate",
            [norm("Unit Cost")]: "unitCost",
            [norm("Notes")]: "notes",
            // fallbacks for common variants
            [norm("reorderlevel")]: "reorderLevel",
            [norm("lastorderdate")]: "lastOrderDate",
            [norm("unitcost")]: "unitCost",
          };

          // Map CSV rows to StockItem objects
          parsedData = rows
            .slice(1)
            .map((row) => {
              if (!row.trim()) return {}; // Skip empty rows

              const values = row.split(",").map((v) => v.trim());
              const item: Partial<StockItem> = {};

              headers.forEach((header, index) => {
                if (index < values.length) {
                  const value = values[index];
                  const mappedKey = headerKeyMap[norm(header)];

                  // Handle numeric fields explicitly
                  if (!mappedKey) return; // Unknown header, skip

                  if (mappedKey === "quantity" || mappedKey === "reorderLevel" || mappedKey === "unitCost") {
                    const numValue = parseFloat(value || "0");
                    if (!isNaN(numValue)) {
                      (item as Partial<StockItem>)[mappedKey] = numValue as any;
                    }
                  } else if (mappedKey === "lastOrderDate") {
                    if (value) {
                      (item as Partial<StockItem>)[mappedKey] = value as any;
                    } else {
                      (item as Partial<StockItem>)[mappedKey] = null;
                    }
                  } else {
                    (item as Partial<StockItem>)[mappedKey] = value as any;
                  }
                }
              });

              return item;
            })
            .filter((item) => Object.keys(item).length > 0);
        } else {
          // Handle Excel import
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          if (!sheetName) {
            throw new Error("Excel file contains no sheets");
          }
          const worksheet = workbook.Sheets[sheetName];
          if (!worksheet) {
            throw new Error(`Could not read sheet "${sheetName}"`);
          }
          const excelData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

          // Map Excel rows to StockItem objects
          parsedData = excelData.map((row) => {
            const item: Partial<StockItem> = {
              name: String(row["Name"] || row["name"] || ""),
              sku: String(row["SKU"] || row["sku"] || ""),
              category: String(row["Category"] || row["category"] || ""),
              quantity: Number(row["Quantity"] || row["quantity"] || 0),
              reorderLevel: Number(row["Reorder Level"] || row["reorderLevel"] || 10),
              supplier: String(row["Supplier"] || row["supplier"] || ""),
              location: String(row["Location"] || row["location"] || ""),
              lastOrderDate: row["Last Order Date"] || row["lastOrderDate"] || null,
              unitCost: Number(row["Unit Cost"] || row["unitCost"] || 0),
              notes: row["Notes"] || row["notes"] || "",
            };
            return item;
          });
        }

        // Validate the data
        if (parsedData.length === 0) {
          throw new Error("No valid data found in the file");
        }

        // Add the imported items to Firestore
        let added = 0;
        let updated = 0;
        let skipped = 0;

        for (const item of parsedData) {
          if (!item.name || !item.sku) {
            skipped++;
            continue; // Skip items without required fields
          }

          // Check if item with same SKU exists
          const existingItem = stockItems.find((i) => i.sku === item.sku);

          if (existingItem) {
            // Update existing item
            await updateDoc(doc(db, "inventory", existingItem.id), {
              ...item,
              updatedAt: new Date().toISOString(),
            });
            updated++;
          } else {
            // Add new item
            await addDoc(collection(db, "inventory"), {
              ...item,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            added++;
          }
        }

        alert(
          `Import successful: ${added} items added, ${updated} items updated, ${skipped} items skipped.`
        );

        // Reset the input field so the same file can be imported again if needed
        e.target.value = "";
      } catch (error) {
        console.error("Error importing file:", error);
        alert(`Error importing file: ${(error as Error).message || "Unknown error"}`);
        e.target.value = "";
      }
    };

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Stock Management</h2>
        <div className="flex items-center space-x-2">
          {syncing ? <SyncIndicator /> : null}
          <Button onClick={() => setIsAddModalOpen(true)} variant="primary">
            Add New Item
          </Button>
          <Button onClick={handleExport} variant="secondary">
            Export CSV
          </Button>
          <Button onClick={handleExportExcel} variant="secondary">
            Export Excel
          </Button>
          <label className="cursor-pointer px-3 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200">
            Import CSV/Excel
            <input
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileImport}
            />
          </label>
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div
          className={`p-3 rounded-md ${notification.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {notification.message}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-0">
          <h3 className="text-lg font-medium">Filters</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={filters.supplier}
                onChange={(e) => handleFilterChange("supplier", e.target.value)}
              >
                <option value="">All Suppliers</option>
                {suppliers.map((sup) => (
                  <option key={sup} value={sup}>
                    {sup}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="belowReorder"
                checked={filters.belowReorder}
                onChange={(e) => handleFilterChange("belowReorder", e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="belowReorder" className="ml-2 text-sm font-medium text-gray-700">
                Below Reorder Level
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Items Table */}
      <Card>
        <CardHeader className="pb-0">
          <h3 className="text-lg font-medium">Inventory Items ({filteredItems.length})</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center">
                      Loading inventory data...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center">
                      No items found matching your filters
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.sku}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.quantity <= 0
                              ? "bg-red-100 text-red-800"
                              : item.quantity < item.reorderLevel
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.quantity <= 0
                            ? "Out of Stock"
                            : item.quantity < item.reorderLevel
                              ? "Low Stock"
                              : "In Stock"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.supplier}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ${(item.quantity * item.unitCost).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                          onClick={() => handleEditItem(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <h3 className="text-lg font-medium mb-4">
              {editingItemId ? 'Edit' : 'Add New'} Inventory Item
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={newItem.name}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={newItem.sku}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  name="category"
                  value={newItem.category}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={newItem.quantity}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reorder Level
                </label>
                <input
                  type="number"
                  name="reorderLevel"
                  value={newItem.reorderLevel}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <input
                  type="text"
                  name="supplier"
                  value={newItem.supplier}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  list="suppliers"
                />
                <datalist id="suppliers">
                  {suppliers.map((sup) => (
                    <option key={sup} value={sup} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={newItem.location}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Cost ($)
                </label>
                <input
                  type="number"
                  name="unitCost"
                  value={newItem.unitCost}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={newItem.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetNewItem();
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={!newItem.name || !newItem.sku}
                onClick={editingItemId ? handleUpdateItem : handleAddItem}
              >
                {editingItemId ? 'Update' : 'Add'} Item
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManager;
