import { Button } from "../../components/ui/Button";
import Card, { CardContent, CardHeader } from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { AlertTriangle, CheckCircle, Clock, Inbox, Plus, Settings } from "lucide-react";
import React, { useState } from "react";
import JobCard from "../../components/WorkshopManagement/JobCard";
import JobCardCard from "../../components/WorkshopManagement/JobCardCard";
import { JobCard as JobCardType, JobCardStatus, Priority } from "../../types/workshop-tyre-inventory";

// Mock data for the job cards conforming to the JobCard interface
const mockJobCards: JobCardType[] = [
  {
    id: "jc1",
    workOrderNumber: "JC-2025-0042",
    vehicleId: "28H",
    customerName: "Internal Service",
    workDescription: "Brake pad replacement and rotor inspection",
    status: "initiated" as JobCardStatus,
    priority: "high" as Priority,
    assignedTechnician: "John Smith",
    createdAt: "2025-06-28T09:00:00Z",
    createdDate: "2025-06-28T09:00:00Z",
    scheduledDate: "2025-06-30T17:00:00Z",
    estimatedHours: 4,
    laborRate: 75,
    partsCost: 250,
    totalEstimate: 550,
    tasks: [],
    totalLaborHours: 4,
    totalPartsValue: 250,
    notes: "",
    faultIds: [],
    attachments: [],
    remarks: [],
    timeLog: [],
    linkedPOIds: [],
    createdBy: "admin",
    updatedAt: "2025-06-28T09:00:00Z",
    odometer: 15000,
    model: "Volvo FH16",
    tyrePositions: [],
    memo: "",
    additionalCosts: 0,
    rcaRequired: false,
    rcaCompleted: false,
  },
  {
    id: "jc2",
    workOrderNumber: "JC-2025-0043",
    vehicleId: "31H",
    customerName: "Internal Service",
    workDescription: "Oil change and general service",
    status: "initiated" as JobCardStatus,
    priority: "medium" as Priority,
    createdAt: "2025-06-28T10:30:00Z",
    createdDate: "2025-06-28T10:30:00Z",
    scheduledDate: "2025-07-01T17:00:00Z",
    estimatedHours: 2,
    laborRate: 75,
    partsCost: 100,
    totalEstimate: 250,
    tasks: [],
    totalLaborHours: 2,
    totalPartsValue: 100,
    notes: "",
    faultIds: [],
    attachments: [],
    remarks: [],
    timeLog: [],
    linkedPOIds: [],
    createdBy: "admin",
    updatedAt: "2025-06-28T10:30:00Z",
    odometer: 25000,
    model: "Volvo FH16",
    tyrePositions: [],
    memo: "",
    additionalCosts: 0,
    rcaRequired: false,
    rcaCompleted: false,
  },
  {
    id: "jc3",
    workOrderNumber: "JC-2025-0040",
    vehicleId: "22H",
    customerName: "Internal Service",
    workDescription: "Transmission fluid replacement",
    status: "in_progress" as JobCardStatus,
    priority: "medium" as Priority,
    assignedTechnician: "David Johnson",
    createdAt: "2025-06-27T14:00:00Z",
    createdDate: "2025-06-27T14:00:00Z",
    scheduledDate: "2025-06-29T17:00:00Z",
    estimatedHours: 3,
    laborRate: 75,
    partsCost: 150,
    totalEstimate: 375,
    tasks: [],
    totalLaborHours: 3,
    totalPartsValue: 150,
    notes: "",
    faultIds: [],
    attachments: [],
    remarks: [],
    timeLog: [],
    linkedPOIds: [],
    createdBy: "admin",
    updatedAt: "2025-06-27T14:00:00Z",
    odometer: 30000,
    model: "Mercedes Actros",
    tyrePositions: [],
    memo: "",
    additionalCosts: 0,
    rcaRequired: false,
    rcaCompleted: false,
  },
  {
    id: "jc4",
    workOrderNumber: "JC-2025-0038",
    vehicleId: "23H",
    customerName: "Internal Service",
    workDescription: "Wheel alignment and balancing",
    status: "in_progress" as JobCardStatus,
    priority: "low" as Priority,
    assignedTechnician: "Maria Rodriguez",
    createdAt: "2025-06-26T11:00:00Z",
    createdDate: "2025-06-26T11:00:00Z",
    scheduledDate: "2025-06-28T17:00:00Z",
    estimatedHours: 2,
    laborRate: 75,
    partsCost: 0,
    totalEstimate: 150,
    tasks: [],
    totalLaborHours: 2,
    totalPartsValue: 0,
    notes: "",
    faultIds: [],
    attachments: [],
    remarks: [],
    timeLog: [],
    linkedPOIds: [],
    createdBy: "admin",
    updatedAt: "2025-06-26T11:00:00Z",
    odometer: 35000,
    model: "Volvo FH16",
    tyrePositions: [],
    memo: "",
    additionalCosts: 0,
    rcaRequired: false,
    rcaCompleted: false,
  },
  {
    id: "jc5",
    workOrderNumber: "JC-2025-0035",
    vehicleId: "21H",
    customerName: "Internal Service",
    workDescription: "Engine diagnostics and tune-up",
    status: "completed" as JobCardStatus,
    priority: "high" as Priority,
    assignedTechnician: "John Smith",
    createdAt: "2025-06-25T09:00:00Z",
    createdDate: "2025-06-25T09:00:00Z",
    scheduledDate: "2025-06-27T15:00:00Z",
    completedDate: "2025-06-27T15:00:00Z",
    estimatedHours: 5,
    laborRate: 75,
    partsCost: 200,
    totalEstimate: 575,
    tasks: [],
    totalLaborHours: 5,
    totalPartsValue: 200,
    notes: "",
    faultIds: [],
    attachments: [],
    remarks: [],
    timeLog: [],
    linkedPOIds: [],
    createdBy: "admin",
    updatedAt: "2025-06-27T15:00:00Z",
    odometer: 40000,
    model: "Mercedes Actros",
    tyrePositions: [],
    memo: "",
    additionalCosts: 0,
    rcaRequired: false,
    rcaCompleted: false,
  },
  {
    id: "jc6",
    workOrderNumber: "JC-2025-0036",
    vehicleId: "24H",
    customerName: "Internal Service",
    workDescription: "Replace air filter and cabin filter",
    status: "completed" as JobCardStatus,
    priority: "low" as Priority,
    assignedTechnician: "Sarah Williams",
    createdAt: "2025-06-25T10:30:00Z",
    createdDate: "2025-06-25T10:30:00Z",
    scheduledDate: "2025-06-26T14:00:00Z",
    completedDate: "2025-06-26T14:00:00Z",
    estimatedHours: 1,
    laborRate: 75,
    partsCost: 50,
    totalEstimate: 125,
    tasks: [],
    totalLaborHours: 1,
    totalPartsValue: 50,
    notes: "",
    faultIds: [],
    attachments: [],
    remarks: [],
    timeLog: [],
    linkedPOIds: [],
    createdBy: "admin",
    updatedAt: "2025-06-26T14:00:00Z",
    odometer: 45000,
    model: "Volvo FH16",
    tyrePositions: [],
    memo: "",
    additionalCosts: 0,
    rcaRequired: false,
    rcaCompleted: false,
  },
];

const JobCardKanbanBoard: React.FC = () => {
  const [jobCards, setJobCards] = useState(mockJobCards);
  const [showModal, setShowModal] = useState(false);

  // Function to group job cards by status
  const groupedJobCards = {
    initiated: jobCards.filter((card) => card.status === "initiated"),
    assigned: jobCards.filter((card) => card.status === "assigned"),
    in_progress: jobCards.filter((card) => card.status === "in_progress"),
    parts_pending: jobCards.filter((card) => card.status === "parts_pending"),
    completed: jobCards.filter((card) => card.status === "completed"),
    invoiced: jobCards.filter((card) => card.status === "invoiced"),
  };

  // Handle drag end (when a card is dropped)
  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    // If there's no destination or the card is dropped in the same place
    if (
      !destination ||
      (destination.droppableId === source.droppableId && destination.index === source.index)
    ) {
      return;
    }

    // Update the job card status
    const newStatus = destination.droppableId as JobCardStatus;

    // In a real application, this would update Firestore
    setJobCards((prev) =>
      prev.map((card) => (card.id === draggableId ? { ...card, status: newStatus } : card))
    );
  };

  // Open the job card modal
  const handleCardClick = (jobCardId: string) => {
    console.log("Card clicked:", jobCardId);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Job Card Board</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" icon={<Settings className="w-4 h-4" />}>
            Configure
          </Button>
          <Button size="sm" icon={<Plus className="w-4 h-4" />}>
            Add Job Card
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          {/* New/Initiated Column */}
          <Card>
            <CardHeader
              title={
                <div className="flex items-center">
                  <Inbox className="w-5 h-5 text-blue-500 mr-2" />
                  <span>New ({groupedJobCards.initiated.length})</span>
                </div>
              }
            />
            <Droppable droppableId="initiated">
              {(provided) => (
                <CardContent className="p-2 min-h-[300px]">
                  <div className="space-y-2" ref={provided.innerRef} {...provided.droppableProps}>
                    {groupedJobCards.initiated.map((card, index) => (
                      <Draggable key={card.id} draggableId={card.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => handleCardClick(card.id)}
                            className={snapshot.isDragging ? "opacity-50" : ""}
                          >
                            <JobCardCard jobCard={card} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {groupedJobCards.initiated.length === 0 && (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No new job cards
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Droppable>
          </Card>

          {/* In Progress Column */}
          <Card>
            <CardHeader
              title={
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-yellow-500 mr-2" />
                  <span>In Progress ({groupedJobCards.in_progress.length})</span>
                </div>
              }
            />
            <Droppable droppableId="in_progress">
              {(provided) => (
                <CardContent className="p-2 min-h-[300px]">
                  <div className="space-y-2" ref={provided.innerRef} {...provided.droppableProps}>
                    {groupedJobCards.in_progress.map((card, index) => (
                      <Draggable key={card.id} draggableId={card.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => handleCardClick(card.id)}
                            className={snapshot.isDragging ? "opacity-50" : ""}
                          >
                            <JobCardCard jobCard={card} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {groupedJobCards.in_progress.length === 0 && (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No job cards in progress
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Droppable>
          </Card>

          {/* Completed Column */}
          <Card>
            <CardHeader
              title={
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span>Completed ({groupedJobCards.completed.length})</span>
                </div>
              }
            />
            <Droppable droppableId="completed">
              {(provided) => (
                <CardContent className="p-2 min-h-[300px]">
                  <div className="space-y-2" ref={provided.innerRef} {...provided.droppableProps}>
                    {groupedJobCards.completed.map((card, index) => (
                      <Draggable key={card.id} draggableId={card.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => handleCardClick(card.id)}
                            className={snapshot.isDragging ? "opacity-50" : ""}
                          >
                            <JobCardCard jobCard={card} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {groupedJobCards.completed.length === 0 && (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No completed job cards
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Droppable>
          </Card>

          {/* Invoiced Column */}
          <Card>
            <CardHeader
              title={
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-indigo-500 mr-2" />
                  <span>Invoiced ({groupedJobCards.invoiced ? groupedJobCards.invoiced.length : 0})</span>
                </div>
              }
            />
            <Droppable droppableId="invoiced">
              {(provided) => (
                <CardContent className="p-2 min-h-[300px]">
                  <div className="space-y-2" ref={provided.innerRef} {...provided.droppableProps}>
                    {groupedJobCards.invoiced &&
                      groupedJobCards.invoiced.map((card, index) => (
                        <Draggable key={card.id} draggableId={card.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => handleCardClick(card.id)}
                              className={snapshot.isDragging ? "opacity-50" : ""}
                            >
                              <JobCardCard jobCard={card} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                    {(!groupedJobCards.invoiced || groupedJobCards.invoiced.length === 0) && (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No invoiced job cards
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Droppable>
          </Card>
        </DragDropContext>
      </div>

      {/* Job Card Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
        }}
        title="Job Card Details"
        maxWidth="2xl"
      >
        <JobCard />
      </Modal>

      <div className="mt-4 text-sm text-gray-500">
        <p className="font-medium">Note:</p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li>Click on a job card to view and edit its details</li>
          <li>Drag cards between columns to update their status</li>
          <li>Only supervisors can move cards to "Closed"</li>
          <li>Only completed job cards can be invoiced</li>
        </ul>
        <p className="mt-2">
          This is a simplified version of the Kanban board. In a production environment, it would
          include real-time updates from Firestore and proper drag-and-drop functionality.
        </p>
      </div>
    </div>
  );
};

export default JobCardKanbanBoard;
