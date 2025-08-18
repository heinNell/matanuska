import React, { useState } from "react";
// Fixed incorrect relative import paths to shared UI components
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import Input from "../../ui/Input";

interface CostEntry {
  id: string;
  description: string;
  amount: number;
  category: "fuel" | "maintenance" | "tolls" | "parking" | "accommodation" | "meals" | "other";
  date: string;
  receipt?: File;
  isFlagged?: boolean;
}

interface CostEntryFormProps {
  onSubmit: (cost: CostEntry) => void;
  onCancel: () => void;
  existingCosts?: CostEntry[];
}

const CostEntryForm: React.FC<CostEntryFormProps> = ({
  onSubmit,
  onCancel,
  existingCosts = [],
}) => {
  const getCurrentDate = () => new Date().toISOString().split("T")[0] || "";

  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<CostEntry["category"]>("other");
  const [date, setDate] = useState<string>(getCurrentDate());
  const [receipt, setReceipt] = useState<File | null>(null);

  const categories = [
    { value: "fuel", label: "Fuel" },
    { value: "maintenance", label: "Maintenance" },
    { value: "tolls", label: "Tolls" },
    { value: "parking", label: "Parking" },
    { value: "accommodation", label: "Accommodation" },
    { value: "meals", label: "Meals" },
    { value: "other", label: "Other" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || amount <= 0) {
      alert("Please fill in all required fields");
      return;
    }

    const newCost: CostEntry = {
      id: Date.now().toString(),
      description,
      amount,
      category,
      date: date || getCurrentDate(),
      receipt: receipt || undefined,
      isFlagged: amount > 1000, // Auto-flag costs over R1000
    };

    onSubmit(newCost);

    // Reset form
    setDescription("");
    setAmount(0);
    setCategory("other");
    setDate(getCurrentDate());
    setReceipt(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceipt(e.target.files[0]);
    }
  };

  const totalCosts = existingCosts.reduce((sum, cost) => sum + cost.amount, 0);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Add Trip Costs</h3>

        {existingCosts.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Existing Costs (Total: R{totalCosts.toFixed(2)})</h4>
            <div className="space-y-2">
              {existingCosts.map((cost) => (
                <div key={cost.id} className="flex justify-between items-center text-sm">
                  <span className={cost.isFlagged ? "text-red-600" : ""}>
                    {cost.description} ({cost.category}){cost.isFlagged && " 🚩"}
                  </span>
                  <span>R{cost.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter cost description"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Amount (R) *</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CostEntry["category"])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value || "")} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Receipt (Optional)</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {receipt && <p className="text-sm text-gray-600 mt-1">Selected: {receipt.name}</p>}
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Back
            </Button>
            <Button type="submit">Add Cost</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CostEntryForm;
