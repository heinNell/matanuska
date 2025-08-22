import React, { useState } from 'react';
import type { DropResult } from 'react-beautiful-dnd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { JobCard, JobCardStatus } from '../../types/workshop-tyre-inventory';
import JobCardCard from './JobCardCard';

interface JobCardKanbanBoardProps {
  jobCards: JobCard[];
  onStatusUpdate?: (jobCardId: string, newStatus: JobCardStatus) => Promise<void>;
  isLoading?: boolean;
}

const statusColumns: { [key in JobCardStatus]?: { title: string, color: string } } = {
  created: { title: 'Created', color: 'bg-blue-100 border-blue-300' },
  initiated: { title: 'New', color: 'bg-blue-100 border-blue-300' },
  assigned: { title: 'Assigned', color: 'bg-purple-100 border-purple-300' },
  in_progress: { title: 'In Progress', color: 'bg-yellow-100 border-yellow-300' },
  parts_pending: { title: 'Waiting Parts', color: 'bg-orange-100 border-orange-300' },
  completed: { title: 'Completed', color: 'bg-green-100 border-green-300' },
  invoiced: { title: 'Invoiced', color: 'bg-indigo-100 border-indigo-300' },
  rca_required: { title: 'RCA Required', color: 'bg-pink-100 border-pink-300' },
  overdue: { title: 'Overdue', color: 'bg-red-100 border-red-300' },
  inspected: { title: 'Inspected', color: 'bg-teal-100 border-teal-300' }
};

const JobCardKanbanBoard: React.FC<JobCardKanbanBoardProps> = ({
  jobCards,
  onStatusUpdate,
  isLoading = false
}) => {
  const [cards, setCards] = useState<JobCard[]>(jobCards);

  // Group job cards by status
  const groupedCards = cards.reduce((acc, card) => {
    const status = card.status as JobCardStatus;
    if (!acc[status]) acc[status] = [];
    acc[status].push(card);
    return acc;
  }, {} as Record<JobCardStatus, JobCard[]>);

  // Handle drag-and-drop to change status
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, source, destination } = result;

    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId as JobCardStatus;
    const jobCardId = draggableId;

    // Update locally first for immediate UI feedback
    setCards(prevCards =>
      prevCards.map(card =>
        card.id === jobCardId ? { ...card, status: newStatus } : card
      )
    );

    // Then call API if handler provided
    if (onStatusUpdate) {
      try {
        await onStatusUpdate(jobCardId, newStatus);
      } catch (error) {
        console.error('Failed to update job card status:', error);
        // Revert the UI if the API call fails
        setCards([...jobCards]); // Use jobCards directly instead of using a function with prevCards
      }
    }
  };

  return (
    <div className="h-full">
      {isLoading ? (
        <div className="h-full flex items-center justify-center">
          <div className="spinner border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="h-full flex space-x-4 overflow-x-auto pb-4">
            {Object.entries(statusColumns).map(([status, { title, color }]) => (
              <div key={status} className="w-72 flex-shrink-0">
                <div className={`${color} rounded-t-lg p-2 font-medium border-b-2`}>
                  <div className="flex justify-between items-center">
                    <h3>{title}</h3>
                    <span className="text-sm bg-white rounded-full px-2 py-0.5">
                      {groupedCards[status as JobCardStatus]?.length || 0}
                    </span>
                  </div>
                </div>

                <Droppable droppableId={status}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="bg-gray-50 rounded-b-lg h-full min-h-[500px] p-2"
                    >
                      {groupedCards[status as JobCardStatus]?.map((jobCard, index) => (
                        <Draggable
                          key={jobCard.id}
                          draggableId={jobCard.id}
                          index={index}
                          isDragDisabled={!onStatusUpdate}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="mb-2"
                            >
                              <JobCardCard
                                jobCard={jobCard}
                                showActions={false}
                                compact={true}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  );
};

export default JobCardKanbanBoard;
