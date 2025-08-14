import { Button } from "@/components/ui/Button";
import {
  AlertTriangle,
  BarChart3,
  DollarSign,
  Download,
  Filter,
  Package,
  PieChart,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";
import Card, { CardContent, CardHeader } from "../../components/ui/Card";
import PageWrapper from "../../components/ui/PageWrapper";
import { Badge } from "../../components/ui/badge";

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  reorderLevel: number;
  unitCost: number;
  totalValue: number;
  supplier: string;
  lastUpdated: string;
  status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "REORDER";
}

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  categoriesCount: number;
}

const InventoryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Mock data - in real app this would come from API/Firebase
  const inventoryItems: InventoryItem[] = [
    {
      id: "1",
      sku: "SKU367308",
      name: "Battery Plugs",
      category: "Electrical",
      quantity: 15,
      reorderLevel: 5,
      unitCost: 12.5,
      totalValue: 187.5,
      supplier: "MAT",
      lastUpdated: "2024-01-15",
      status: "IN_STOCK",
    },
    {
      id: "2",
      sku: "SKU340314",
      name: "Female Air Coupling",
      category: "Pneumatic",
      quantity: 3,
      reorderLevel: 5,
      unitCost: 25.0,
      totalValue: 75.0,
      supplier: "MAT",
      lastUpdated: "2024-01-14",
      status: "LOW_STOCK",
    },
    {
      id: "3",
      sku: "SKU312825",
      name: "Air Cleaner (Sinotruck) K2436B4",
      category: "Filters",
      quantity: 1,
      reorderLevel: 2,
      unitCost: 45.0,
      totalValue: 45.0,
      supplier: "MAT",
      lastUpdated: "2024-01-13",
      status: "LOW_STOCK",
    },
    {
      id: "4",
      sku: "SKU393395",
      name: "Air Bag (BPW Eco Plus)",
      category: "Suspension",
      quantity: 0,
      reorderLevel: 2,
      unitCost: 150.0,
      totalValue: 0.0,
      supplier: "BPW",
      lastUpdated: "2024-01-12",
      status: "OUT_OF_STOCK",
    },
    {
      id: "5",
      sku: "SKU159281",
      name: "Turbo Charger - Shacman X3000 / 420HP (Weichai engine)",
      category: "Engine",
      quantity: 1,
      reorderLevel: 1,
      unitCost: 10955.0,
      totalValue: 10955.0,
      supplier: "Amcotts",
      lastUpdated: "2024-01-10",
      status: "IN_STOCK",
    },
  ];

  // Calculate stats
  const stats: InventoryStats = {
    totalItems: inventoryItems.reduce((sum, item) => sum + item.quantity, 0),
    totalValue: inventoryItems.reduce((sum, item) => sum + item.totalValue, 0),
    lowStockItems: inventoryItems.filter((item) => item.status === "LOW_STOCK").length,
    outOfStockItems: inventoryItems.filter((item) => item.status === "OUT_OF_STOCK").length,
    categoriesCount: new Set(inventoryItems.map((item) => item.category)).size,
  };

  // Get unique categories
  const categories = ["ALL", ...new Set(inventoryItems.map((item) => item.category))];

  // Filter items
  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;
    const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "IN_STOCK":
        return "bg-green-100 text-green-800";
      case "LOW_STOCK":
        return "bg-yellow-100 text-yellow-800";
      case "OUT_OF_STOCK":
        return "bg-red-100 text-red-800";
      case "REORDER":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "IN_STOCK":
        return <TrendingUp className="w-4 h-4" />;
      case "LOW_STOCK":
        return <TrendingDown className="w-4 h-4" />;
      case "OUT_OF_STOCK":
        return <AlertTriangle className="w-4 h-4" />;
      case "REORDER":
        return <Package className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <PageWrapper title="Inventory Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600">
              Track stock levels, manage reorders, and monitor inventory value
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
            <Button
              onClick={() => console.log("Navigate to add item")}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Item
            </Button>
            <Button
              variant="outline"
              onClick={() => console.log("Navigate to receive parts")}
              icon={<Package className="w-4 h-4" />}
            >
              Receive Parts
            </Button>
            <Button
              variant="outline"
              onClick={() => console.log("Navigate to parts ordering")}
              icon={<BarChart3 className="w-4 h-4" />}
            >
              Order Parts
            </Button>
            <Button
              variant="outline"
              onClick={() => console.log("Export inventory")}
              icon={<Download className="w-4 h-4" />}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${stats.totalValue.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.lowStockItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.outOfStockItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <PieChart className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.categoriesCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "ALL" ? "All Categories" : category}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
                <option value="REORDER">Reorder</option>
              </select>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  icon={<Filter className="w-4 h-4" />}
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("ALL");
                    setSelectedStatus("ALL");
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader title="Inventory Items" icon={<Package className="w-5 h-5" />} />
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reorder Level
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Cost
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.sku}</div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900">{item.category}</td>

                      <td className="px-6 py-4">
                        <Badge
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                        >
                          {getStatusIcon(item.status)}
                          <span className="ml-1">{item.status.replace("_", " ")}</span>
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span
                          className={`text-sm font-medium ${
                            item.quantity <= item.reorderLevel ? "text-red-600" : "text-gray-900"
                          }`}
                        >
                          {item.quantity}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center text-sm text-gray-500">
                        {item.reorderLevel}
                      </td>

                      <td className="px-6 py-4 text-right text-sm text-gray-900">
                        ${item.unitCost.toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                        ${item.totalValue.toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900">{item.supplier}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredItems.length === 0 && (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery || selectedCategory !== "ALL" || selectedStatus !== "ALL"
                      ? "Try adjusting your search or filters."
                      : "Get started by adding your first inventory item."}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        {stats.lowStockItems > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="text-sm font-medium text-gray-900">
                    {stats.lowStockItems} item(s) are running low on stock
                  </span>
                </div>
                <Button size="sm" variant="outline" onClick={() => setSelectedStatus("LOW_STOCK")}>
                  View Low Stock Items
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
};

export default InventoryPage;
