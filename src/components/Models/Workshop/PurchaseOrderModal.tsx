import React, { useState } from "react";

export interface POItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  received?: boolean;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  title: string;
  description: string;
  status: "OPEN" | "SELF APPROVAL" | "APPROVED" | "ORDERED" | "RECEIVED" | "CLOSED";
  dueDate: string;
  vendor: string;
  requester: string;
  site: string;
  address: string;
  recipient: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  items: POItem[];
  attachments: { id: string; name: string; url?: string }[];
  linkedWorkOrderId?: string;
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
}

interface POProps {
  po: PurchaseOrder;
  onSave: (po: PurchaseOrder) => void;
  onClose: () => void;
  onDownloadPDF: (id: string) => void;
}

export const PurchaseOrderModal: React.FC<POProps> = ({ po, onSave, onClose, onDownloadPDF }) => {
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<PurchaseOrder>(po);

  // Edit logic handlers
  const updateField = <K extends keyof PurchaseOrder>(field: K, value: PurchaseOrder[K]) => {
    setDraft((d) => ({ ...d, [field]: value }));
  };

  // Add/Edit/Delete line items
  const handleItemChange = (idx: number, field: keyof POItem, value: any) => {
    const items = [...draft.items];
    items[idx] = { ...items[idx], [field]: value };
    if (field === "quantity" || field === "unitCost") {
      items[idx].totalCost = Number(items[idx].quantity) * Number(items[idx].unitCost);
    }
    setDraft((d) => ({ ...d, items }));
  };
  const handleAddItem = () => {
    setDraft((d) => ({
      ...d,
      items: [
        ...d.items,
        {
          id: Date.now().toString(),
          sku: "",
          name: "",
          quantity: 1,
          unit: "",
          unitCost: 0,
          totalCost: 0,
        },
      ],
    }));
  };
  const handleRemoveItem = (idx: number) => {
    const items = draft.items.filter((_, i) => i !== idx);
    setDraft((d) => ({ ...d, items }));
  };

  // Attachment logic (placeholder)
  const handleAttach = (file: File) => {
    // Upload logic here
  };

  // Save/Cancel
  const handleSave = () => {
    onSave(draft);
    setEditMode(false);
  };
  const handleCancel = () => {
    setDraft(po);
    setEditMode(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-4xl max-h-[95vh] overflow-auto rounded shadow-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <span className="font-bold text-lg">PO: {draft.poNumber}</span>
            <span className="ml-3 text-xs bg-blue-100 px-2 py-1 rounded">{draft.status}</span>
            <span className="ml-2 text-xs bg-yellow-100 px-2 py-1 rounded">{draft.priority}</span>
            <span className="ml-4 text-gray-500">{draft.vendor}</span>
            {draft.linkedWorkOrderId && (
              <span className="ml-4 text-blue-500 underline">WO: {draft.linkedWorkOrderId}</span>
            )}
          </div>
          <div>
            <button onClick={onClose}>Close</button>
            <button onClick={() => onDownloadPDF(draft.id)} className="ml-2">
              Download PDF
            </button>
            {editMode ? (
              <>
                <button onClick={handleSave} className="ml-2">
                  Save
                </button>
                <button onClick={handleCancel} className="ml-2">
                  Cancel
                </button>
              </>
            ) : (
              po.canEdit && (
                <button onClick={() => setEditMode(true)} className="ml-2">
                  Edit
                </button>
              )
            )}
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {editMode ? (
              <>
                <input
                  placeholder="Title"
                  value={draft.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className="border rounded p-2"
                />
                <input
                  placeholder="Due Date"
                  type="date"
                  value={draft.dueDate}
                  onChange={(e) => updateField("dueDate", e.target.value)}
                  className="border rounded p-2"
                />
                <input
                  placeholder="Vendor"
                  value={draft.vendor}
                  onChange={(e) => updateField("vendor", e.target.value)}
                  className="border rounded p-2"
                />
                <input
                  placeholder="Requester"
                  value={draft.requester}
                  onChange={(e) => updateField("requester", e.target.value)}
                  className="border rounded p-2"
                />
                {/* ...add all other fields as inputs */}
              </>
            ) : (
              <>
                <div>
                  <strong>Title:</strong> {draft.title}
                </div>
                <div>
                  <strong>Due Date:</strong> {draft.dueDate}
                </div>
                <div>
                  <strong>Vendor:</strong> {draft.vendor}
                </div>
                <div>
                  <strong>Requester:</strong> {draft.requester}
                </div>
                {/* ...add all other fields as text */}
              </>
            )}
          </div>
          <div>
            <h4 className="font-semibold mb-1">Line Items</h4>
            <table className="w-full text-xs border mb-2">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Name</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Unit Cost</th>
                  <th>Total</th>
                  {editMode && <th></th>}
                </tr>
              </thead>
              <tbody>
                {draft.items.map((item, idx) => (
                  <tr key={item.id}>
                    {editMode ? (
                      <>
                        <td>
                          <input
                            className="w-20"
                            value={item.sku}
                            onChange={(e) => handleItemChange(idx, "sku", e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            className="w-32"
                            value={item.name}
                            onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="w-16"
                            value={item.quantity}
                            min={1}
                            onChange={(e) =>
                              handleItemChange(idx, "quantity", Number(e.target.value))
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="w-12"
                            value={item.unit}
                            onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="w-20"
                            value={item.unitCost}
                            min={0}
                            onChange={(e) =>
                              handleItemChange(idx, "unitCost", Number(e.target.value))
                            }
                          />
                        </td>
                        <td>{item.totalCost.toFixed(2)}</td>
                        <td>
                          <button className="text-red-500" onClick={() => handleRemoveItem(idx)}>
                            Remove
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{item.sku}</td>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unit}</td>
                        <td>{item.unitCost.toFixed(2)}</td>
                        <td>{item.totalCost.toFixed(2)}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {editMode && <button onClick={handleAddItem}>Add Line Item</button>}
          </div>
          <div>
            <h4 className="font-semibold mb-1">Attachments</h4>
            {draft.attachments.map((att) => (
              <div key={att.id} className="mb-1">
                {att.name}{" "}
                {att.url && (
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 underline ml-1"
                  >
                    Download
                  </a>
                )}
              </div>
            ))}
            {editMode && (
              <input
                type="file"
                onChange={(e) => e.target.files && handleAttach(e.target.files[0])}
              />
            )}
          </div>
          <div>
            <h4 className="font-semibold mb-1">Notes / Description</h4>
            {editMode ? (
              <textarea
                value={draft.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="w-full border rounded p-2"
              />
            ) : (
              <div>{draft.description}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderModal;
