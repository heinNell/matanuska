import { Button } from "../../../components/ui/Button";
import React, { useState } from "react";

export interface RCAEntry {
  id: string;
  rootCause: string;
  rcaConductedBy: string;
  responsiblePerson: string;
  note: string;
  completedAt: string;
}

interface RCAModalProps {
  open: boolean;
  initial?: RCAEntry;
  onSubmit: (entry: RCAEntry) => void;
  onClose: () => void;
  userName: string; // autofill for RCA Conducted By
}

const rootCauseOptions = [
  "Driver/Employee Negligence",
  "Premature Failure/Defective Part",
  "Poor Installation",
  "Inadequate Maintenance",
  "Excessive Wear and Tear",
  "Other",
];

export const RCAModal: React.FC<RCAModalProps> = ({
  open,
  initial,
  onSubmit,
  onClose,
  userName,
}) => {
  const [entry, setEntry] = useState<RCAEntry>(
    initial || {
      id: "",
      rootCause: "",
      rcaConductedBy: userName || "",
      responsiblePerson: "",
      note: "",
      completedAt: "",
    }
  );
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof RCAEntry, value: any) => {
    setEntry((e) => ({ ...e, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = () => {
    if (!entry.rootCause || !entry.rcaConductedBy) {
      setError("Root Cause and RCA Conducted By are required.");
      return;
    }
    onSubmit({
      ...entry,
      completedAt: new Date().toISOString(),
      id: entry.id || Date.now().toString(),
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
        <div className="mb-4">
          <h2 className="font-bold text-xl">Root Cause Analysis (RCA)</h2>
          <div className="text-sm text-gray-600 mt-2">
            Completion of this form is mandatory for repeat/critical issues.
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block font-semibold">
              Root Cause <span className="text-red-500">*</span>
            </label>
            <select
              className="border rounded p-2 w-full"
              value={entry.rootCause}
              onChange={(e) => handleChange("rootCause", e.target.value)}
              required
            >
              <option value="">--Select Root Cause--</option>
              {rootCauseOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold">
              RCA Conducted By <span className="text-red-500">*</span>
            </label>
            <input
              className="border rounded p-2 w-full"
              value={entry.rcaConductedBy}
              onChange={(e) => handleChange("rcaConductedBy", e.target.value)}
              required
              autoComplete="name"
            />
          </div>
          <div>
            <label className="block font-semibold">Responsible Person</label>
            <input
              className="border rounded p-2 w-full"
              value={entry.responsiblePerson}
              onChange={(e) => handleChange("responsiblePerson", e.target.value)}
              autoComplete="name"
            />
          </div>
          <div>
            <label className="block font-semibold">Notes / Corrective Action</label>
            <textarea
              className="border rounded p-2 w-full"
              rows={3}
              value={entry.note}
              onChange={(e) => handleChange("note", e.target.value)}
              placeholder="Any relevant detail or corrective action..."
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
        <div className="flex justify-end mt-6 space-x-2">
          <Button onClick={onClose} size="sm" variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} size="sm" variant="primary">
            Submit RCA
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RCAModal;
