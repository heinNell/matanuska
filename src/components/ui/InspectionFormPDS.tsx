// src/components/inspections/InspectionFormPDS.tsx

import React, { useState } from "react";

interface InspectionItem {
  sn: number;
  label: string;
  note?: string;
  status: "Good" | "Repair" | "Replace" | "NA" | "";
}

const SECTIONS = [
  {
    name: "Braking System",
    items: [
      "Brake Shoes",
      "Brake Chambers",
      "Brake drums",
    ],
  },
  {
    name: "Chassis & Suspension",
    items: [
      "Bell Housing",
      "Steering system linkage and joints",
      "Cab Shock",
      "Leaf springs",
      "King Pins",
      "Torque arm",
      "Equalizers",
      "Wheel bearings",
      "Steering Knuckle",
      "Ball Joint",
    ],
  },
  {
    name: "Cooling System",
    items: [
      "Coolant Sensors",
      "Thermostat",
      "Water Pump",
      "Radiator",
      "Radiator protection",
      "Hoses and Connections",
      "Cooling Fan",
      "Radiator Cap",
      "Heater Core",
      "Cooling Fan",
      "Radiator Cap",
    ],
  },
  {
    name: "Electrical System",
    items: [
      "Starter motor",
      "Battery",
      "Alternator",
      "Alternator V-Belt",
      "Electronic connections",
      "Fuses",
      "Lights",
      "Horns",
    ],
  },
  {
    name: "Engine",
    items: [
      "Turbocharger",
      "Belts and Hoses",
      "A/C Compressor",
      "Air Compressor",
      "Pulleys",
      "Engine Mounts",
      "Cylinder Head and Block",
      "Engine Sensors",
      "Crankcase Ventilation System",
      "Engine Sensors",
      "Fuel injectors",
      "Fuel pump",
    ],
  },
  {
    name: "External Fixtures",
    items: [
      "Reflectors",
      "Mirrors",
      "Mudflaps",
      "Dash and Cab",
      "Doors and Locks",
      "Windshield Wipers",
      "Windows",
      "Seats",
      "Seatbelts",
    ],
  },
  {
    name: "Fifth Wheel Inspection",
    items: [
      "Fifth Wheel",
      "Coupling mechanism",
      "Mounting and Bolts",
      "Mounting bolts and nuts",
      "Alignment",
      "Release Handle and Linkage",
      "Fifth Wheel Plate - Free from cracks, corrosion, and excessive wear",
    ],
  },
  {
    name: "Filters",
    items: [
      "Fuel filters 2x fuel filter",
      "Oil Filter 2x oil filter",
      "Water separator Filter 2x water seperators",
      "Air filter",
      "Gearbox Oil Filters 5litres gear box oil top up",
    ],
  },
  {
    name: "Fluids & Lubrication",
    items: [
      "Coolant",
      "Battery Water",
      "Brake fluid",
      "ATF Oil 1 ltre oil top up",
      "Diff Oil 5ltres diff oil top up",
      "Gearbox Oil 5litres gear oil top up",
      "Grease",
      "Engine oil 30 ltres engine oil",
    ],
  },
  {
    name: "Transmission & Driveline",
    items: [
      "Differential and Axle Components",
      "Clutch Assembly (for Manual Transmission)",
      "Transmission Mounts",
      "Universal Joints and Driveshaft",
      "Transmission Housing and Seals",
      "Gear Operation",
      "Clutch",
    ],
  },
];

const STATUS_OPTIONS = ["Good", "Repair", "Replace", "NA"];

export const InspectionFormPDS: React.FC = () => {
  const [inspectionDetails, setInspectionDetails] = useState({
    reportNumber: "",
    location: "",
    inspectionDate: "",
    inspectorName: "",
    vehicleNumber: "",
    vehicleCategory: "",
    meterReading: "",
    modelYear: "",
    vehicleStatus: "",
    overallCondition: "Good Condition",
    vehicleSafe: "Yes",
    additionalNote: "",
  });

  // Flattened list of all items for mapping status
  const allItems: InspectionItem[] = [];
  let sn = 1;
  for (const section of SECTIONS) {
    for (const item of section.items) {
      allItems.push({
        sn,
        label: item,
        note: "",
        status: "",
      });
      sn += 1;
    }
  }

  // Use state to manage item statuses
  const [itemStatuses, setItemStatuses] = useState<Record<number, InspectionItem>>(
    allItems.reduce((acc, item) => {
      acc[item.sn] = item;
      return acc;
    }, {} as Record<number, InspectionItem>)
  );

  const handleStatusChange = (sn: number, status: InspectionItem["status"]) => {
    setItemStatuses((prev) => ({
      ...prev,
      [sn]: { ...prev[sn], status },
    }));
  };

  const handleNoteChange = (sn: number, note: string) => {
    setItemStatuses((prev) => ({
      ...prev,
      [sn]: { ...prev[sn], note },
    }));
  };

  // Form submission handler (implement backend integration here)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Collect all form data
    const payload = {
      ...inspectionDetails,
      items: Object.values(itemStatuses),
    };
    console.log("Inspection form submitted:", payload);
    // TODO: API call to backend
    alert("Inspection submitted!");
  };

  return (
    <form className="p-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-3">Vehicle Inspection Report (Truck Service)</h2>
      {/* Inspection Details */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <input placeholder="Report #" value={inspectionDetails.reportNumber} onChange={e => setInspectionDetails({ ...inspectionDetails, reportNumber: e.target.value })} />
        <input placeholder="Location" value={inspectionDetails.location} onChange={e => setInspectionDetails({ ...inspectionDetails, location: e.target.value })} />
        <input placeholder="Inspection Date/Time" type="datetime-local" value={inspectionDetails.inspectionDate} onChange={e => setInspectionDetails({ ...inspectionDetails, inspectionDate: e.target.value })} />
        <input placeholder="Inspector Name" value={inspectionDetails.inspectorName} onChange={e => setInspectionDetails({ ...inspectionDetails, inspectorName: e.target.value })} />
      </div>
      {/* Vehicle Details */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <input placeholder="Vehicle #" value={inspectionDetails.vehicleNumber} onChange={e => setInspectionDetails({ ...inspectionDetails, vehicleNumber: e.target.value })} />
        <input placeholder="Vehicle Category" value={inspectionDetails.vehicleCategory} onChange={e => setInspectionDetails({ ...inspectionDetails, vehicleCategory: e.target.value })} />
        <input placeholder="Model/Year" value={inspectionDetails.modelYear} onChange={e => setInspectionDetails({ ...inspectionDetails, modelYear: e.target.value })} />
        <input placeholder="Meter Reading" value={inspectionDetails.meterReading} onChange={e => setInspectionDetails({ ...inspectionDetails, meterReading: e.target.value })} />
        <input placeholder="Vehicle Status" value={inspectionDetails.vehicleStatus} onChange={e => setInspectionDetails({ ...inspectionDetails, vehicleStatus: e.target.value })} />
      </div>
      {/* Inspection Sections */}
      {SECTIONS.map((section, idx) => (
        <div key={section.name} className="mb-4">
          <h3 className="font-semibold mb-2">{section.name}</h3>
          <table className="w-full border text-xs">
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Note</th>
                {STATUS_OPTIONS.map(opt => (
                  <th key={opt}>{opt}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.items.map((item, i) => {
                const itemSN = allItems.find(ai => ai.label === item && ai.sn > idx * 20)!.sn;
                const itemState = itemStatuses[itemSN];
                return (
                  <tr key={itemSN}>
                    <td>{itemSN}</td>
                    <td>{item}</td>
                    <td>
                      <input
                        className="w-32"
                        value={itemState.note}
                        onChange={e => handleNoteChange(itemSN, e.target.value)}
                      />
                    </td>
                    {STATUS_OPTIONS.map(opt => (
                      <td key={opt}>
                        <input
                          type="radio"
                          name={`status-${itemSN}`}
                          checked={itemState.status === opt}
                          onChange={() => handleStatusChange(itemSN, opt as InspectionItem["status"])}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
      {/* Additional Notes */}
      <textarea
        className="w-full my-4"
        rows={2}
        placeholder="Additional Note"
        value={inspectionDetails.additionalNote}
        onChange={e => setInspectionDetails({ ...inspectionDetails, additionalNote: e.target.value })}
      />
      {/* Condition & Safety */}
      <div className="flex items-center mb-4 gap-4">
        <label>
          Overall Condition:
          <select value={inspectionDetails.overallCondition} onChange={e => setInspectionDetails({ ...inspectionDetails, overallCondition: e.target.value })}>
            <option>Good Condition</option>
            <option>Needs Attention</option>
            <option>Not Roadworthy</option>
          </select>
        </label>
        <label>
          Vehicle Safe to Use:
          <select value={inspectionDetails.vehicleSafe} onChange={e => setInspectionDetails({ ...inspectionDetails, vehicleSafe: e.target.value })}>
            <option>Yes</option>
            <option>No</option>
          </select>
        </label>
      </div>
      {/* Submission */}
      <button type="submit" className="btn btn-primary">Submit Inspection</button>
    </form>
  );
};

export default InspectionFormPDS;
