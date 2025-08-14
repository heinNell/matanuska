import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Truck,
  ShoppingBag,
} from "lucide-react";

interface InventorySummary {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  stockTurnover: number;
  averageOrderTime: number;
}

interface StockMovement {
  month: string;
  received: number;
  issued: number;
  adjustments: number;
}

interface CategoryBreakdown {
  category: string;
  count: number;
  value: number;
  percentage: number;
}

interface TopItems {
  name: string;
  category: string;
  stockValue: number;
  quantityInStock: number;
  reorderPoint: number;
  turnoverRate: number;
}

interface VendorPerformance {
  vendor: string;
  onTimeDelivery: number;
  qualityScore: number;
  costVariance: number;
  avgLeadTime: number;
}

interface InventoryDashboardData {
  summary: InventorySummary;
  stockMovements: StockMovement[];
  categoryBreakdown: CategoryBreakdown[];
  topItems: TopItems[];
  vendorPerformance: VendorPerformance[];
  recentDeliveries: {
    id: string;
    vendor: string;
    date: string;
    items: number;
    value: number;
    status: "pending" | "received" | "partial" | "rejected";
  }[];
  pendingOrders: {
    id: string;
    vendor: string;
    orderDate: string;
    expectedDelivery: string;
    items: number;
    value: number;
    status: "processing" | "shipped" | "delayed";
  }[];
}

// Color palette for charts
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#8dd1e1",
  "#a4de6c",
  "#d0ed57",
];

const InventoryDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<InventoryDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFrame, setTimeFrame] = useState<"month" | "quarter" | "year">("month");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch dashboard data
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);

        // In a real app, you'd fetch this data from Firestore
        // For this demo, we'll use mock data
        const mockData: InventoryDashboardData = {
          summary: {
            totalItems: 1248,
            totalValue: 357950,
            lowStockItems: 42,
            outOfStockItems: 18,
            stockTurnover: 4.2,
            averageOrderTime: 4.8,
          },
          stockMovements: [
            { month: "Jan", received: 42000, issued: 38000, adjustments: -1200 },
            { month: "Feb", received: 38500, issued: 41200, adjustments: -800 },
            { month: "Mar", received: 44000, issued: 39600, adjustments: -1500 },
            { month: "Apr", received: 36800, issued: 37400, adjustments: -600 },
            { month: "May", received: 48500, issued: 43200, adjustments: -900 },
            { month: "Jun", received: 42600, issued: 45100, adjustments: -1100 },
            { month: "Jul", received: 46800, issued: 44300, adjustments: -700 },
            { month: "Aug", received: 41200, issued: 42700, adjustments: -500 },
            { month: "Sep", received: 52000, issued: 47800, adjustments: -1300 },
            { month: "Oct", received: 39500, issued: 41900, adjustments: -400 },
            { month: "Nov", received: 43700, issued: 40600, adjustments: -1000 },
            { month: "Dec", received: 47900, issued: 45200, adjustments: -1200 },
          ],
          categoryBreakdown: [
            { category: "Engine Parts", count: 315, value: 89750, percentage: 25.1 },
            { category: "Braking System", count: 248, value: 67540, percentage: 18.9 },
            { category: "Transmission", count: 186, value: 54680, percentage: 15.3 },
            { category: "Electrical", count: 224, value: 48320, percentage: 13.5 },
            { category: "Filters", count: 156, value: 24950, percentage: 7.0 },
            { category: "Lubricants", count: 98, value: 32480, percentage: 9.1 },
            { category: "Suspension", count: 112, value: 28750, percentage: 8.0 },
            { category: "Other", count: 109, value: 11480, percentage: 3.1 },
          ],
          topItems: [
            {
              name: "Air Filter XJ-4500",
              category: "Filters",
              stockValue: 12400,
              quantityInStock: 124,
              reorderPoint: 40,
              turnoverRate: 5.8,
            },
            {
              name: "Brake Pads BP-8800",
              category: "Braking System",
              stockValue: 18600,
              quantityInStock: 62,
              reorderPoint: 25,
              turnoverRate: 6.2,
            },
            {
              name: "Engine Oil 15W-40",
              category: "Lubricants",
              stockValue: 14850,
              quantityInStock: 198,
              reorderPoint: 75,
              turnoverRate: 7.4,
            },
            {
              name: "Alternator ALT-520",
              category: "Electrical",
              stockValue: 9860,
              quantityInStock: 28,
              reorderPoint: 12,
              turnoverRate: 3.2,
            },
            {
              name: "Fuel Filter FF-2200",
              category: "Filters",
              stockValue: 8740,
              quantityInStock: 112,
              reorderPoint: 45,
              turnoverRate: 5.6,
            },
          ],
          vendorPerformance: [
            {
              vendor: "AutoParts Plus",
              onTimeDelivery: 94,
              qualityScore: 4.6,
              costVariance: -2.5,
              avgLeadTime: 3.2,
            },
            {
              vendor: "Truck Parts Ltd",
              onTimeDelivery: 88,
              qualityScore: 4.2,
              costVariance: -1.8,
              avgLeadTime: 4.5,
            },
            {
              vendor: "Global Supplies",
              onTimeDelivery: 92,
              qualityScore: 4.7,
              costVariance: -3.2,
              avgLeadTime: 3.8,
            },
            {
              vendor: "FastTruck Components",
              onTimeDelivery: 86,
              qualityScore: 4.4,
              costVariance: -2.1,
              avgLeadTime: 5.2,
            },
            {
              vendor: "Premium Parts Co.",
              onTimeDelivery: 96,
              qualityScore: 4.8,
              costVariance: -0.8,
              avgLeadTime: 3.5,
            },
          ],
          recentDeliveries: [
            {
              id: "DEL-4872",
              vendor: "AutoParts Plus",
              date: "2025-07-08",
              items: 42,
              value: 12480,
              status: "received",
            },
            {
              id: "DEL-4871",
              vendor: "Truck Parts Ltd",
              date: "2025-07-06",
              items: 28,
              value: 8650,
              status: "partial",
            },
            {
              id: "DEL-4870",
              vendor: "Global Supplies",
              date: "2025-07-05",
              items: 35,
              value: 14720,
              status: "received",
            },
            {
              id: "DEL-4869",
              vendor: "FastTruck Components",
              date: "2025-07-03",
              items: 16,
              value: 5840,
              status: "rejected",
            },
            {
              id: "DEL-4868",
              vendor: "Premium Parts Co.",
              date: "2025-07-01",
              items: 24,
              value: 9650,
              status: "received",
            },
          ],
          pendingOrders: [
            {
              id: "PO-6754",
              vendor: "AutoParts Plus",
              orderDate: "2025-07-05",
              expectedDelivery: "2025-07-12",
              items: 38,
              value: 16250,
              status: "processing",
            },
            {
              id: "PO-6753",
              vendor: "Global Supplies",
              orderDate: "2025-07-04",
              expectedDelivery: "2025-07-11",
              items: 42,
              value: 18720,
              status: "shipped",
            },
            {
              id: "PO-6752",
              vendor: "Truck Parts Ltd",
              orderDate: "2025-07-02",
              expectedDelivery: "2025-07-10",
              items: 24,
              value: 8950,
              status: "delayed",
            },
            {
              id: "PO-6751",
              vendor: "Premium Parts Co.",
              orderDate: "2025-07-01",
              expectedDelivery: "2025-07-09",
              items: 16,
              value: 6240,
              status: "shipped",
            },
          ],
        };

        setDashboardData(mockData);
        setError(null);
      } catch (err) {
        console.error("Error fetching inventory dashboard data:", err);
        setError("Failed to load inventory dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, [timeFrame, categoryFilter]);

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  // Filter top items based on search query and category filter
  const filteredTopItems = dashboardData?.topItems.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Get stock status for visualization
  const getStockStatusColor = (quantity: number, reorderPoint: number) => {
    if (quantity <= reorderPoint * 0.5) return "text-red-500";
    if (quantity <= reorderPoint) return "text-amber-500";
    return "text-green-500";
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <p>{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            // This will trigger the useEffect to refetch data
            setTimeFrame(timeFrame);
          }}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Package className="mr-2 text-primary-600" size={28} />
          Inventory Dashboard
        </h1>

        <div className="flex items-center gap-2">
          <RefreshCw size={20} className="text-gray-500" />
          <select
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value as "month" | "quarter" | "year")}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <div className="bg-white shadow-md rounded-lg p-4 border-l-4 border-blue-500">
          <div className="text-sm text-gray-600 font-medium mb-1">Total Items</div>
          <div className="text-2xl font-bold">
            {dashboardData.summary.totalItems.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center text-xs text-gray-500">
            <Package size={14} className="mr-1" />
            <span>{dashboardData.categoryBreakdown.length} categories</span>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4 border-l-4 border-green-500">
          <div className="text-sm text-gray-600 font-medium mb-1">Inventory Value</div>
          <div className="text-2xl font-bold">
            {formatCurrency(dashboardData.summary.totalValue)}
          </div>
          <div className="mt-2 flex items-center text-xs text-green-600">
            <TrendingUp size={14} className="mr-1" />
            <span>3.2% from last month</span>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4 border-l-4 border-amber-500">
          <div className="text-sm text-gray-600 font-medium mb-1">Low Stock Items</div>
          <div className="text-2xl font-bold text-amber-600">
            {dashboardData.summary.lowStockItems}
          </div>
          <div className="mt-2 flex items-center text-xs text-amber-600">
            <AlertTriangle size={14} className="mr-1" />
            <span>Need attention</span>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4 border-l-4 border-red-500">
          <div className="text-sm text-gray-600 font-medium mb-1">Out of Stock</div>
          <div className="text-2xl font-bold text-red-600">
            {dashboardData.summary.outOfStockItems}
          </div>
          <div className="mt-2 flex items-center text-xs text-red-600">
            <AlertTriangle size={14} className="mr-1" />
            <span>Critical action needed</span>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4 border-l-4 border-purple-500">
          <div className="text-sm text-gray-600 font-medium mb-1">Stock Turnover</div>
          <div className="text-2xl font-bold">
            {dashboardData.summary.stockTurnover.toFixed(1)}x
          </div>
          <div className="mt-2 flex items-center text-xs text-purple-600">
            <RefreshCw size={14} className="mr-1" />
            <span>Annual rate</span>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4 border-l-4 border-indigo-500">
          <div className="text-sm text-gray-600 font-medium mb-1">Avg. Order Time</div>
          <div className="text-2xl font-bold">
            {dashboardData.summary.averageOrderTime.toFixed(1)} days
          </div>
          <div className="mt-2 flex items-center text-xs text-indigo-600">
            <Clock size={14} className="mr-1" />
            <span>Lead time</span>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Stock Movements */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Stock Movement Trends</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dashboardData.stockMovements}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value) => [formatCurrency(value as number), ""]} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="received"
                  name="Received"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                <Line type="monotone" dataKey="issued" name="Issued" stroke="#82ca9d" />
                <Line type="monotone" dataKey="adjustments" name="Adjustments" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Inventory by Category</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="category"
                  label={({ name, percent }) =>
                    `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                  }
                >
                  {dashboardData.categoryBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatCurrency(value as number), "Value"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Items */}
      <div className="bg-white shadow-md rounded-lg mb-8">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">High Turnover Items</h2>

            <div className="flex gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search items..."
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-500" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Categories</option>
                  {dashboardData.categoryBreakdown.map((cat) => (
                    <option key={cat.category} value={cat.category}>
                      {cat.category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Item
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    In Stock
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Value
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Turnover Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(filteredTopItems || []).map((item) => (
                  <tr key={item.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className={`mr-2 ${getStockStatusColor(item.quantityInStock, item.reorderPoint)}`}
                        >
                          ●
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.quantityInStock}
                          </div>
                          <div className="text-xs text-gray-500">
                            Reorder at: {item.reorderPoint}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {formatCurrency(item.stockValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`mr-1 ${item.turnoverRate > 5 ? "text-green-500" : "text-gray-500"}`}
                        >
                          {item.turnoverRate > 5 ? (
                            <TrendingUp size={16} />
                          ) : (
                            <TrendingDown size={16} />
                          )}
                        </div>
                        <span className="text-sm">{item.turnoverRate.toFixed(1)}x</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Deliveries */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Deliveries</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Vendor
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentDeliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {delivery.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {delivery.vendor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{new Date(delivery.date).toLocaleDateString()}</div>
                      <div className="text-xs">
                        {delivery.items} items, {formatCurrency(delivery.value)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                          delivery.status === "received"
                            ? "bg-green-100 text-green-800"
                            : delivery.status === "partial"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Pending Orders</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    PO #
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Vendor
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Delivery Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.pendingOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.vendor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{new Date(order.expectedDelivery).toLocaleDateString()}</div>
                      <div className="text-xs">
                        {order.items} items, {formatCurrency(order.value)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                          order.status === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "shipped"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Vendor Performance */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Vendor Performance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Vendor
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  On-Time Delivery
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Quality Score
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Cost Variance
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Lead Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.vendorPerformance.map((vendor) => (
                <tr key={vendor.vendor} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {vendor.vendor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                        <div
                          className={`h-2.5 rounded-full ${
                            vendor.onTimeDelivery >= 95
                              ? "bg-green-600"
                              : vendor.onTimeDelivery >= 90
                                ? "bg-green-500"
                                : vendor.onTimeDelivery >= 85
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                          }`}
                          style={{ width: `${vendor.onTimeDelivery}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{vendor.onTimeDelivery}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${star <= Math.round(vendor.qualityScore) ? "text-amber-500" : "text-gray-300"}`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-sm">{vendor.qualityScore.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm ${vendor.costVariance <= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {vendor.costVariance <= 0 ? "" : "+"}
                      {vendor.costVariance.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1 text-gray-500" />
                      <span className="text-sm">{vendor.avgLeadTime.toFixed(1)} days</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Action Items</h2>

        <div className="space-y-4">
          <div className="flex items-start p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertTriangle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={18} />
            <div>
              <p className="font-medium text-red-800">
                Critical: {dashboardData.summary.outOfStockItems} items out of stock
              </p>
              <p className="text-sm text-red-700 mt-1">
                Create purchase orders for these items immediately to avoid production delays.
              </p>
              <button
                className="mt-2 text-sm text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                onClick={() => {}}
              >
                View Items
              </button>
            </div>
          </div>

          <div className="flex items-start p-3 bg-amber-50 border border-amber-200 rounded-md">
            <AlertTriangle className="text-amber-500 mt-0.5 mr-3 flex-shrink-0" size={18} />
            <div>
              <p className="font-medium text-amber-800">
                {dashboardData.summary.lowStockItems} items below reorder point
              </p>
              <p className="text-sm text-amber-700 mt-1">
                These items need to be ordered soon to maintain adequate inventory levels.
              </p>
              <button
                className="mt-2 text-sm text-white bg-amber-600 hover:bg-amber-700 px-3 py-1 rounded"
                onClick={() => {}}
              >
                Generate POs
              </button>
            </div>
          </div>

          <div className="flex items-start p-3 bg-blue-50 border border-blue-200 rounded-md">
            <Truck className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" size={18} />
            <div>
              <p className="font-medium text-blue-800">2 deliveries scheduled for today</p>
              <p className="text-sm text-blue-700 mt-1">
                Prepare receiving area and personnel for upcoming deliveries from AutoParts Plus and
                Global Supplies.
              </p>
              <button
                className="mt-2 text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
                onClick={() => {}}
              >
                View Schedule
              </button>
            </div>
          </div>

          <div className="flex items-start p-3 bg-green-50 border border-green-200 rounded-md">
            <ShoppingBag className="text-green-500 mt-0.5 mr-3 flex-shrink-0" size={18} />
            <div>
              <p className="font-medium text-green-800">Bulk order discount available</p>
              <p className="text-sm text-green-700 mt-1">
                You can save 12% by combining your next 3 planned orders with Truck Parts Ltd.
              </p>
              <button
                className="mt-2 text-sm text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                onClick={() => {}}
              >
                Optimize Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
