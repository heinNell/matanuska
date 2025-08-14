import { addDays, subDays } from "date-fns";
import { useEffect, useState } from "react";
import { JobCardCategory } from "../types/jobCard";

interface JobCard {
  id: string;
  title: string;
  vehicleId: string;
  vehicleType: "truck" | "trailer" | "both";
  templateId: string;
  startDate: Date;
  endDate: Date;
  status: "open" | "closed" | "booked" | "in_progress";
  category: JobCardCategory;
  assignedTechnician?: string;
  priority: "low" | "medium" | "high" | "urgent";
  notes?: string;
  completedTasks: number;
  totalTasks: number;
}

// Mock data for development
const MOCK_JOB_CARDS: JobCard[] = [
  {
    id: "jc-001",
    title: "5,000km Truck Service - Fleet 101",
    vehicleId: "TRK-101",
    vehicleType: "truck",
    templateId: "truck_service_5000km",
    startDate: new Date(),
    endDate: new Date(),
    status: "in_progress",
    category: "preventive_maintenance",
    assignedTechnician: "John Smith",
    priority: "medium",
    completedTasks: 2,
    totalTasks: 3,
  },
  {
    id: "jc-002",
    title: "Emergency Brake Repair - Fleet 102",
    vehicleId: "TRK-102",
    vehicleType: "truck",
    templateId: "brake_repair_urgent",
    startDate: addDays(new Date(), 1),
    endDate: addDays(new Date(), 1),
    status: "booked",
    category: "emergency_repair",
    assignedTechnician: "Maria Garcia",
    priority: "urgent",
    notes: "Driver reported unusual noise when braking",
    completedTasks: 0,
    totalTasks: 3,
  },
  {
    id: "jc-003",
    title: "Trailer Inspection - Trailer 201",
    vehicleId: "TRL-201",
    vehicleType: "trailer",
    templateId: "trailer_inspection_service",
    startDate: subDays(new Date(), 1),
    endDate: subDays(new Date(), 1),
    status: "closed",
    category: "inspection_followup",
    assignedTechnician: "David Johnson",
    priority: "medium",
    completedTasks: 3,
    totalTasks: 3,
  },
  {
    id: "jc-004",
    title: "Tyre Replacement - Fleet 103",
    vehicleId: "TRK-103",
    vehicleType: "truck",
    templateId: "tyre_service_complete",
    startDate: addDays(new Date(), 2),
    endDate: addDays(new Date(), 2),
    status: "open",
    category: "tyre_service",
    priority: "high",
    completedTasks: 0,
    totalTasks: 3,
  },
  {
    id: "jc-005",
    title: "10,000km Service - Fleet 104",
    vehicleId: "TRK-104",
    vehicleType: "truck",
    templateId: "truck_service_5000km",
    startDate: addDays(new Date(), 3),
    endDate: addDays(new Date(), 3),
    status: "booked",
    category: "preventive_maintenance",
    assignedTechnician: "Sarah Lee",
    priority: "low",
    completedTasks: 0,
    totalTasks: 3,
  },
  {
    id: "jc-006",
    title: "Trailer Coupling Repair - Trailer 202",
    vehicleId: "TRL-202",
    vehicleType: "trailer",
    templateId: "trailer_inspection_service",
    startDate: subDays(new Date(), 2),
    endDate: subDays(new Date(), 2),
    status: "closed",
    category: "corrective_maintenance",
    assignedTechnician: "John Smith",
    priority: "medium",
    completedTasks: 3,
    totalTasks: 3,
  },
];

// Helper types for workshop statistics
interface WorkshopStats {
  totalOpen: number;
  totalInProgress: number;
  totalClosed: number;
  totalBooked: number;
  completionRate: number;
  averageDuration: number;
  jobsByCategory: Record<JobCardCategory, number>;
  jobsByPriority: Record<string, number>;
}

export const useWorkshopJobCards = (initialDate: Date = new Date()) => {
  const [jobCards, setJobCards] = useState<JobCard[]>(MOCK_JOB_CARDS);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentWeek, setCurrentWeek] = useState<Date>(initialDate);
  const [stats, setStats] = useState<WorkshopStats | null>(null);

  // Fetch job cards from your data source
  useEffect(() => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      // In a real app, you would fetch from your API based on the current week
      setJobCards(MOCK_JOB_CARDS);
      calculateStats(MOCK_JOB_CARDS);
      setLoading(false);
    }, 500);
  }, [currentWeek]);

  // Calculate workshop statistics
  const calculateStats = (cards: JobCard[]) => {
    const totalOpen = cards.filter((card) => card.status === "open").length;
    const totalInProgress = cards.filter((card) => card.status === "in_progress").length;
    const totalClosed = cards.filter((card) => card.status === "closed").length;
    const totalBooked = cards.filter((card) => card.status === "booked").length;

    const completedTasksCount = cards.reduce((sum, card) => sum + card.completedTasks, 0);
    const totalTasksCount = cards.reduce((sum, card) => sum + card.totalTasks, 0);
    const completionRate = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;

    // Initialize category counters
    const jobsByCategory: Record<JobCardCategory, number> = {
      preventive_maintenance: 0,
      corrective_maintenance: 0,
      inspection_followup: 0,
      safety_repair: 0,
      emergency_repair: 0,
      tyre_service: 0,
      body_repair: 0,
    };

    // Initialize priority counters
    const jobsByPriority: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };

    // Count jobs by category and priority
    cards.forEach((card) => {
      jobsByCategory[card.category]++;
      jobsByPriority[card.priority]++;
    });

    // Calculate average duration (simple approximation)
    // In a real app, you would calculate based on actual completion times
    const averageDuration = 3.5; // hours

    setStats({
      totalOpen,
      totalInProgress,
      totalClosed,
      totalBooked,
      completionRate,
      averageDuration,
      jobsByCategory,
      jobsByPriority,
    });
  };

  const addJobCard = (newJobCard: Omit<JobCard, "id">) => {
    const id = `jc-${(jobCards.length + 1).toString().padStart(3, "0")}`;
    const jobCardWithId = { ...newJobCard, id };
    setJobCards([...jobCards, jobCardWithId]);
    calculateStats([...jobCards, jobCardWithId]);
    return jobCardWithId;
  };

  const updateJobCard = (updatedJobCard: JobCard) => {
    const updatedCards = jobCards.map((card) =>
      card.id === updatedJobCard.id ? updatedJobCard : card
    );
    setJobCards(updatedCards);
    calculateStats(updatedCards);
  };

  const changeJobCardStatus = (id: string, status: JobCard["status"]) => {
    const updatedCards = jobCards.map((card) => {
      if (card.id === id) {
        return { ...card, status };
      }
      return card;
    });
    setJobCards(updatedCards);
    calculateStats(updatedCards);
  };

  const assignTechnician = (id: string, technicianName: string) => {
    const updatedCards = jobCards.map((card) => {
      if (card.id === id) {
        return { ...card, assignedTechnician: technicianName };
      }
      return card;
    });
    setJobCards(updatedCards);
  };

  const updateTaskCompletion = (jobCardId: string, completedTasks: number) => {
    const updatedCards = jobCards.map((card) => {
      if (card.id === jobCardId) {
        return {
          ...card,
          completedTasks,
          // Auto-update status if all tasks are completed
          status: completedTasks === card.totalTasks ? "closed" : card.status,
        };
      }
      return card;
    });
    setJobCards(updatedCards);
    calculateStats(updatedCards);
  };

  // Get cards for a specific date range
  const getJobCardsForDateRange = (startDate: Date, endDate: Date) => {
    return jobCards.filter((card) => {
      const cardDate = new Date(card.startDate);
      return cardDate >= startDate && cardDate <= endDate;
    });
  };

  // Navigate to different weeks
  const goToPreviousWeek = () => {
    setCurrentWeek((prevWeek) => subDays(prevWeek, 7));
  };

  const goToNextWeek = () => {
    setCurrentWeek((prevWeek) => addDays(prevWeek, 7));
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  return {
    jobCards,
    loading,
    stats,
    currentWeek,
    addJobCard,
    updateJobCard,
    changeJobCardStatus,
    assignTechnician,
    updateTaskCompletion,
    getJobCardsForDateRange,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
  };
};

export default useWorkshopJobCards;
