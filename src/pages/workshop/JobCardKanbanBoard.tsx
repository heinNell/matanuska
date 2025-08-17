import { Button } from "../../components/ui/Button";
import Card, { CardContent, CardHeader } from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { AlertTriangle, CheckCircle, Clock, Inbox, Plus, Settings } from "lucide-react";
import React, { useState } from "react";
import JobCard from "../../components/WorkshopManagement/JobCard";
import JobCardCard from "../../components/WorkshopManagement/JobCardCard";

// Mock data for the job cards
const mockJobCards = [
  {
    id: "jc1",
    workOrderNumber: "JC-2025-0042",
    fleetNumber: "28H",
    title: "Brake pad replacement and rotor inspection",
    status: "open",
    priority: "high",
    assignedTo: "John Smith",
    createdAt: "2025-06-28T09:00:00Z",
    dueDate: "2025-06-30T17:00:00Z",
  },
  {
    id: "jc2",
    workOrderNumber: "JC-2025-0043",
    fleetNumber: "31H",
    title: "Oil change and general service",
    status: "open",
    priority: "medium",
    createdAt: "2025-06-28T10:30:00Z",
    dueDate: "2025-07-01T17:00:00Z",
  },
  {
    id: "jc3",
    workOrderNumber: "JC-2025-0040",
    fleetNumber: "22H",
    title: "Transmission fluid replacement",
    status: "in_progress",
    priority: "medium",
    assignedTo: "David Johnson",
    createdAt: "2025-06-27T14:00:00Z",
    dueDate: "2025-06-29T17:00:00Z",
  },
  {
    id: "jc4",
    workOrderNumber: "JC-2025-0038",
    fleetNumber: "23H",
    title: "Wheel alignment and balancing",
    status: "in_progress",
    priority: "low",
    assignedTo: "Maria Rodriguez",
    createdAt: "2025-06-26T11:00:00Z",
    dueDate: "2025-06-28T17:00:00Z",
  },
  {
    id: "jc5",
    workOrderNumber: "JC-2025-0035",
    fleetNumber: "21H",
    title: "Engine diagnostics and tune-up",
    status: "completed",
    priority: "high",
    assignedTo: "John Smith",
    createdAt: "2025-06-25T09:00:00Z",
    completedAt: "2025-06-27T15:00:00Z",
  },
  {
    id: "jc6",
    workOrderNumber: "JC-2025-0036",
    fleetNumber: "24H",
    title: "Replace air filter and cabin filter",
    status: "completed",
    priority: "low",
    assignedTo: "Sarah Williams",
    createdAt: "2025-06-25T10:30:00Z",
    completedAt: "2025-06-26T14:00:00Z",
  },
];

const JobCardKanbanBoard: React.FC = () => {
  const [jobCards, setJobCards] = useState(mockJobCards);
  const [showModal, setShowModal] = useState(false);

  // Function to group job cards by status
  const groupedJobCards = {
    open: jobCards.filter((card) => card.status === "open"),
    in_progress: jobCards.filter((card) => card.status === "in_progress"),
    completed: jobCards.filter((card) => card.status === "completed"),
    closed: jobCards.filter((card) => card.status === "closed"),
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
    const newStatus = destination.droppableId;

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
          {/* Open Column */}
          <Card>
            <CardHeader
              title={
                <div className="flex items-center">
                  <Inbox className="w-5 h-5 text-yellow-500 mr-2" />
                  <span>Open ({groupedJobCards.open.length})</span>
                </div>
              }
            />
            <Droppable droppableId="open">
              {(provided) => (
                <CardContent className="p-2 min-h-[300px]">
                  <div className="space-y-2" ref={provided.innerRef} {...provided.droppableProps}>
                    {groupedJobCards.open.map((card, index) => (
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
                    {groupedJobCards.open.length === 0 && (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No open job cards
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
                  <Clock className="w-5 h-5 text-blue-500 mr-2" />
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

          {/* Closed Column */}
          <Card>
            <CardHeader
              title={
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-gray-500 mr-2" />
                  <span>Closed ({groupedJobCards.closed ? groupedJobCards.closed.length : 0})</span>
                </div>
              }
            />
            <Droppable droppableId="closed">
              {(provided) => (
                <CardContent className="p-2 min-h-[300px]">
                  <div className="space-y-2" ref={provided.innerRef} {...provided.droppableProps}>
                    {groupedJobCards.closed &&
                      groupedJobCards.closed.map((card, index) => (
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
                    {(!groupedJobCards.closed || groupedJobCards.closed.length === 0) && (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No closed job cards
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
