import React from "react";

export interface JobCardTableRow {
  id: string;
  woNumber: string;
  createdAt: string;
  vehicle: string;
  dueDate: string;
  completedDate?: string;
  status: "INITIATED" | "SCHEDULED" | "INSPECTED" | "APPROVED" | "COMPLETED" | "CLOSED" | "OVERDUE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
  assigned: string[]; // Array of assigned tech/user names or IDs
  memo: string;
  overdue?: boolean;
}

interface JobCardTableProps {
  data: JobCardTableRow[];
  onAction: (id: string, action: "open" | "edit" | "print" | "close" | "escalate") => void;
  onView: (id: string) => void;
}

export const JobCardTable: React.FC<JobCardTableProps> = ({ data, onAction, onView }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm border">
      <thead>
        <tr>
          <th>Action</th>
          <th>WO Number</th>
          <th>Created Date</th>
          <th>Vehicle</th>
          <th>Due/Completed</th>
          <th>Status</th>
          <th>Priority</th>
          <th>Assigned</th>
          <th>Memo</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id} className={row.overdue ? "bg-red-50" : ""}>
            <td>
              <button onClick={() => onAction(row.id, "open")}>Open</button>
              {/* dropdown actions, e.g. */}
              {/* <ActionDropdown onAction={a => onAction(row.id, a)} /> */}
            </td>
            <td>
              <a className="text-blue-700 underline" onClick={() => onView(row.id)}>{row.woNumber}</a>
            </td>
            <td>{row.createdAt}</td>
            <td>{row.vehicle}</td>
            <td>
              {row.completedDate ? row.completedDate : row.dueDate}
              {row.overdue && <span className="ml-2 px-2 py-1 bg-red-500 text-white rounded text-xs">OVERDUE</span>}
            </td>
            <td>
              <span className={
                "px-2 py-1 rounded text-xs " +
                (row.status === "INITIATED" ? "bg-gray-200" :
                row.status === "SCHEDULED" ? "bg-blue-100" :
                row.status === "INSPECTED" ? "bg-yellow-100" :
                row.status === "APPROVED" ? "bg-green-100" :
                row.status === "COMPLETED" ? "bg-green-400 text-white" :
                row.status === "CLOSED" ? "bg-gray-400 text-white" :
                row.status === "OVERDUE" ? "bg-red-500 text-white" : "")
              }>
                {row.status}
              </span>
            </td>
            <td>
              <span className={
                "px-2 py-1 rounded text-xs " +
                (row.priority === "LOW" ? "bg-gray-100" :
                row.priority === "MEDIUM" ? "bg-yellow-300" :
                row.priority === "HIGH" ? "bg-orange-400 text-white" :
                row.priority === "EMERGENCY" ? "bg-red-600 text-white" : "")
              }>
                {row.priority}
              </span>
            </td>
            <td>
              {row.assigned.length > 1
                ? <span title={row.assigned.join(", ")}>{`👤 ${row.assigned.length}`}</span>
                : <span>{row.assigned[0]}</span>
              }
            </td>
            <td title={row.memo}>{row.memo.length > 30 ? row.memo.substring(0, 30) + "…" : row.memo}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
