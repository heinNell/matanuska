import { useEffect, useState } from "react";
import { JobCard, JobCardTask, Note, TaskHistoryEntry, AssignedPart } from "@/types/jobCard";
import {
  watchJobCard,
  watchTasks,
  watchNotes,
  watchTaskHistory,
  watchAssignedParts,
} from "@/services/jobCardService";

export function useJobCard(jobCardId: string) {
  const [jobCard, setJobCard] = useState<JobCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = watchJobCard(jobCardId, (d) => {
      setJobCard(d);
      setLoading(false);
    });
    return () => unsub();
  }, [jobCardId]);

  return { jobCard, loading };
}

export function useJobTasks(jobCardId: string) {
  const [tasks, setTasks] = useState<JobCardTask[]>([]);
  useEffect(() => {
    const unsub = watchTasks(jobCardId, setTasks);
    return () => unsub();
  }, [jobCardId]);
  return { tasks };
}

export function useJobNotes(jobCardId: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  useEffect(() => {
    const unsub = watchNotes(jobCardId, setNotes);
    return () => unsub();
  }, [jobCardId]);
  return { notes };
}

export function useTaskHistory(jobCardId: string) {
  const [history, setHistory] = useState<TaskHistoryEntry[]>([]);
  useEffect(() => {
    const unsub = watchTaskHistory(jobCardId, setHistory);
    return () => unsub();
  }, [jobCardId]);
  return { history };
}

export function useAssignedParts(jobCardId: string) {
  const [parts, setParts] = useState<AssignedPart[]>([]);
  useEffect(() => {
    const unsub = watchAssignedParts(jobCardId, setParts);
    return () => unsub();
  }, [jobCardId]);
  return { parts };
}
