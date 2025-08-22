import React from "react";
import { useState } from "react";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Input } from "../../components/ui";
import { Badge } from "../../components/ui/badge";
import { Search, FileWarning } from "lucide-react";
import { DefectItemModal } from "../Models/Workshop/DefectItemModal";
import InspectionDetailsModal from "../Models/Workshop/InspectionDetailsModal";
import { parseInspectionDefects } from "../../utils/inspectionUtils";

// Define the inspection data type
interface Inspection {
  report: string;
  date: string;
  vehicle: string;
  location: string;
  inspector: string;
  faultCount: number;
  correctiveAction: string;
  workOrder: string;
  form: string;
  notes: string;
}

const inspections: Inspection[] = [
  {
    report: "Inspection1045",
    date: "11-Jul-2025 11:31 AM",
    vehicle: "28H AFQ1329",
    location: "Zimbabwe",
    inspector: "Workshop",
    faultCount: 10,
    correctiveAction: "NOT TAKEN",
    workOrder: "WO1120",
    form: "(SERVICE) TRUCK INSPECTION",
    notes:
      "Needs to go for wheel alignment, Needs replacement of intercooler horse x1, Replaced aluminum water pipe, 2 x fuel filters, 2 oil filters, 2 x water sep filters, Replace 1 x air filter, 3ltres battery water, 1 litre aft oil top up, 30 litres engine oil, 3ltres battery water",
  },
  {
    report: "Inspection1044",
    date: "10-Jul-2025 03:10 PM",
    vehicle: "2T ABB1578/ABB1577",
    location: "Zimbabwe",
    inspector: "Workshop",
    faultCount: 2,
    correctiveAction: "NOT TAKEN",
    workOrder: "WO1165",
    form: "(BI 2WEEKS) - INTERLINK INSPECTION",
    notes: "Needs replacement now at 6mm, Equalizer position 3 needs replacement",
  },
  {
    report: "Inspection1043",
    date: "04-Jul-2025 04:15 PM",
    vehicle: "24H AFQ1325",
    location: "Zimbabwe",
    inspector: "Workshop",
    faultCount: 7,
    correctiveAction: "TAKEN",
    workOrder: "WO1134",
    form: "(SERVICE) TRUCK INSPECTION",
    notes:
      "1 Ltr oil top up, 5ltres diff oil top up, 5ltres gear oil top up, 2x fuel filter, 2x oil filter, 2x water seperators, 30 ltres engine oil",
  },
  {
    report: "Inspection1042",
    date: "03-Jul-2025 01:19 PM",
    vehicle: "2H JFK964FS",
    location: "Zimbabwe",
    inspector: "Workshop",
    faultCount: 3,
    correctiveAction: "NOT TAKEN",
    workOrder: "WO1151",
    form: "(BI 2WEEKS) - TRUCK INSPECTION",
    notes:
      "To be driven to Harare for wheel alignment, Needs wheel alignment the truck is swerving more to the left hand side, Check the steering control on alignment, Steering swerving to left side",
  },
  {
    report: "Inspection1041",
    date: "03-Jul-2025 11:42 AM",
    vehicle: "23H AFQ1324",
    location: "Zimbabwe",
    inspector: "Workshop",
    faultCount: 5,
    correctiveAction: "NOT TAKEN",
    workOrder: "WO1150",
    form: "(SERVICE) TRUCK INSPECTION",
    notes:
      "Needs regasing air conditioning, 2x fuel filters, 2x oil filters, 2x water sep filters, 30ltres engine oil",
  },
];

const InspectionHistory = () => {
  // State for managing modals
  const [isDefectModalOpen, setIsDefectModalOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter inspections based on search term
  const filteredInspections = searchTerm
    ? inspections.filter(inspection =>
        inspection.report.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspection.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspection.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    : inspections;

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Inspection History</h2>
        <Button>Start New Inspection</Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <Input
            placeholder="Search"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Report Number</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Inspector</TableHead>
              <TableHead>Fault</TableHead>
              <TableHead>Corrective Action</TableHead>
              <TableHead>Linked WO</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInspections.map((inspection, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <Button variant="outline" size="sm">Action</Button>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{inspection.report}</div>
                  <div className="text-xs text-gray-500">
                    Inspection Form: {inspection.form} <FileWarning className="inline w-3 h-3 ml-1" />
                    <br />
                    <span className="font-medium text-gray-600">Note:</span> {inspection.notes.substring(0, 100)}
                    {inspection.notes.length > 100 && '...'}
                  </div>
                </TableCell>
                <TableCell>{inspection.date}</TableCell>
                <TableCell>{inspection.vehicle}</TableCell>
                <TableCell>{inspection.location}</TableCell>
                <TableCell>{inspection.inspector}</TableCell>
                <TableCell>
                  <button
                    className="border-0 bg-transparent p-0 cursor-pointer"
                    aria-label="View fault details"
                    onClick={() => {
                      setSelectedInspection(inspection);
                      setIsDefectModalOpen(true);
                    }}
                  >
                    <Badge className="bg-red-100 text-red-800">
                      ⚠ {inspection.faultCount}
                    </Badge>
                  </button>
                </TableCell>
                <TableCell>
                  <Badge
                    className={inspection.correctiveAction === "TAKEN"
                      ? "bg-green-100 text-green-800"
                      : "border border-gray-300 bg-white text-gray-800"}
                  >
                    {inspection.correctiveAction}
                  </Badge>
                </TableCell>
                <TableCell>
                  <a className="text-blue-600 font-semibold hover:underline" href="#">
                    {inspection.workOrder}
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Defect Item Modal */}
      {selectedInspection && (
        <DefectItemModal
          isOpen={isDefectModalOpen}
          onClose={() => setIsDefectModalOpen(false)}
          inspectionId={selectedInspection.report}
          vehicleId={selectedInspection.vehicle}
          faultCount={selectedInspection.faultCount}
          defectItems={parseInspectionDefects(selectedInspection.notes)}
        />
      )}

      {/* Inspection Details Modal */}
      {selectedInspection && (
        <InspectionDetailsModal
          inspection={{
            ...selectedInspection,
            defects: {
              repair: parseInspectionDefects(selectedInspection.notes)
                .filter(item => item.type === 'repair')
                .map(item => item.name),
              replace: parseInspectionDefects(selectedInspection.notes)
                .filter(item => item.type === 'replace')
                .map(item => item.name)
            },
            status: {
              inspection: "COMPLETED",
              workOrder: selectedInspection.workOrder || null,
              completion: selectedInspection.correctiveAction === "TAKEN" ? "COMPLETED" : null
            }
          }}
          onClose={() => setIsDefectModalOpen(false)}
        />
      )}
    </div>
  );
};

export default InspectionHistory;
