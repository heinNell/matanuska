import { Button } from "@/components/ui/Button";
import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppContext } from "../../context/AppContext";
import { Card, CardContent, CardHeader } from "../ui/Card";
import SyncIndicator from "../ui/SyncIndicator";
import Modal from "../ui/Modal";
import CategoryForm from "./CategoryForm";
import { db } from "../../lib/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

interface CostCategory {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  trend: "up" | "down" | "stable";
  subcategories: {
    name: string;
    amount: number;
    percentage: number;
  }[];
}

interface MonthlyData {
  month: string;
  admin: number;
  facilities: number;
  it: number;
  utilities: number;
  other: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const IndirectCostBreakdown: React.FC = () => {
  const { isLoading, currentUser } = useAppContext();
  const [costCategories, setCostCategories] = useState<CostCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CostCategory | null>(null);
  const [timeRange, setTimeRange] = useState<"month" | "quarter" | "year">("month");
  const [historicalData, setHistoricalData] = useState<MonthlyData[]>([]);
  const [totalIndirectCost, setTotalIndirectCost] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);

  // Replace mock data with real Firestore calls
  useEffect(() => {
    const fetchCostCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, "indirectCosts"));
        const categories = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CostCategory[];
        setCostCategories(categories);
        setTotalIndirectCost(categories.reduce((sum, category) => sum + category.amount, 0));

        const mockHistoricalData: MonthlyData[] = [
          { month: "Jan", admin: 11200, facilities: 9500, it: 6800, utilities: 5600, other: 4100 },
          { month: "Feb", admin: 11500, facilities: 9600, it: 6900, utilities: 5500, other: 4200 },
          { month: "Mar", admin: 11800, facilities: 9700, it: 7000, utilities: 5400, other: 4200 },
          { month: "Apr", admin: 12000, facilities: 9700, it: 7100, utilities: 5400, other: 4300 },
          { month: "May", admin: 12200, facilities: 9800, it: 7200, utilities: 5400, other: 4300 },
          { month: "Jun", admin: 12500, facilities: 9800, it: 7200, utilities: 5400, other: 4300 },
        ];

        setHistoricalData(mockHistoricalData);
      } catch (error) {
        console.error("Error fetching cost categories:", error);
      }
    };

    fetchCostCategories();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCategoryClick = (category: CostCategory) => {
    setSelectedCategory(category);
  };

  const handleUpdateCategory = async (categoryId: string, updates: Partial<CostCategory>) => {
    try {
      await updateDoc(doc(db, "indirectCosts", categoryId), {
        ...updates,
        lastUpdated: new Date().toISOString(),
        updatedBy: currentUser?.email,
      });
      // Refresh data
      fetchCostCategories();
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    if (trend === "up") return <span className="text-red-500">↑</span>;
    if (trend === "down") return <span className="text-green-500">↓</span>;
    return <span className="text-gray-500">→</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Indirect Cost Breakdown</h2>
        <SyncIndicator />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium">
                Total Indirect Costs: {formatCurrency(totalIndirectCost)}
              </h3>
              <p className="text-sm text-gray-500">For Current Period</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span>Time Range:</span>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as "month" | "quarter" | "year")}
                className="border rounded-md p-1"
              >
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <Button>Export Report</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-md font-medium mb-4">Cost Distribution</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={costCategories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="amount"
                        nameKey="name"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                      >
                        {costCategories.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            onClick={() => handleCategoryClick(entry)}
                            cursor="pointer"
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium mb-4">Cost Trends (6 Months)</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={historicalData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Bar dataKey="admin" name="Administrative" fill={COLORS[0]} />
                      <Bar dataKey="facilities" name="Facilities" fill={COLORS[1]} />
                      <Bar dataKey="it" name="IT Infrastructure" fill={COLORS[2]} />
                      <Bar dataKey="utilities" name="Utilities" fill={COLORS[3]} />
                      <Bar dataKey="other" name="Other" fill={COLORS[4]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <h4 className="text-md font-medium mb-4">Cost Breakdown by Category</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                    <th className="px-4 py-2 text-center">Percentage</th>
                    <th className="px-4 py-2 text-center">Trend</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {costCategories.map((category) => (
                    <tr
                      key={category.id}
                      className={`border-b hover:bg-gray-50 ${selectedCategory?.id === category.id ? "bg-blue-50" : ""}`}
                    >
                      <td className="px-4 py-2">{category.name}</td>
                      <td className="px-4 py-2 text-right font-medium">
                        {formatCurrency(category.amount)}
                      </td>
                      <td className="px-4 py-2 text-center">{category.percentage}%</td>
                      <td className="px-4 py-2 text-center">{getTrendIcon(category.trend)}</td>
                      <td className="px-4 py-2 text-right">
                        <Button
                          variant="outline"
                          className="text-sm"
                          onClick={() => handleCategoryClick(category)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-medium">
                    <td className="px-4 py-2">Total</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(totalIndirectCost)}</td>
                    <td className="px-4 py-2 text-center">100%</td>
                    <td className="px-4 py-2" />
                    <td className="px-4 py-2" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedCategory && (
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <h3 className="text-lg font-medium">
                {selectedCategory.name} - {formatCurrency(selectedCategory.amount)}
              </h3>
              <Button variant="outline" onClick={() => setSelectedCategory(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="mb-4 font-medium">Subcategory Breakdown</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={selectedCategory.subcategories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="amount"
                        nameKey="name"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                      >
                        {selectedCategory.subcategories.map((_, index) => (
                          <Cell
                            key={`subcell-${index}`}
                            fill={COLORS[(index + 3) % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h4 className="mb-4 font-medium">Subcategory Details</h4>
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">Subcategory</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                      <th className="px-4 py-2 text-center">% of Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCategory.subcategories.map((sub, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="px-4 py-2">{sub.name}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(sub.amount)}</td>
                        <td className="px-4 py-2 text-center">{sub.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-medium">
                      <td className="px-4 py-2">Total {selectedCategory.name}</td>
                      <td className="px-4 py-2 text-right">
                        {formatCurrency(selectedCategory.amount)}
                      </td>
                      <td className="px-4 py-2 text-center">100%</td>
                    </tr>
                  </tfoot>
                </table>

                <div className="mt-6">
                  <h5 className="font-medium mb-2">Cost Optimization Opportunities:</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedCategory.name === "Administrative" && (
                      <>
                        <li className="text-sm">
                          Consolidate software subscriptions (~15% savings)
                        </li>
                        <li className="text-sm">
                          Negotiate better rates for professional services
                        </li>
                      </>
                    )}
                    {selectedCategory.name === "Facilities" && (
                      <>
                        <li className="text-sm">Review maintenance contracts for better rates</li>
                        <li className="text-sm">Implement energy efficiency measures</li>
                      </>
                    )}
                    {selectedCategory.name === "IT Infrastructure" && (
                      <>
                        <li className="text-sm">Optimize cloud resource utilization</li>
                        <li className="text-sm">
                          Consolidate hardware purchases for bulk discounts
                        </li>
                      </>
                    )}
                    {selectedCategory.name === "Utilities" && (
                      <>
                        <li className="text-sm">Switch to more cost-effective energy provider</li>
                        <li className="text-sm">Implement smart controls for energy usage</li>
                      </>
                    )}
                    {selectedCategory.name === "Other" && (
                      <>
                        <li className="text-sm">Move to virtual training where possible</li>
                        <li className="text-sm">Optimize travel scheduling to reduce costs</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isEditMode && (
        <Modal isOpen={isEditMode} onClose={() => setIsEditMode(false)} title="Edit Cost Category">
          <CategoryForm
            category={selectedCategory}
            onSave={handleUpdateCategory}
            onCancel={() => setIsEditMode(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default IndirectCostBreakdown;
