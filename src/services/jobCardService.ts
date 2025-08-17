import {
  collection, doc, onSnapshot, query, where, orderBy,
  FirestoreDataConverter, DocumentData
} from "firebase/firestore";
import { db } from "../firebase";
import {
  JobCard, JobCardTask, Note, TaskHistoryEntry, AssignedPart
} from "../types/jobCard";

// Lightweight converters so onSnapshot returns typed objects
const as = <T>(): FirestoreDataConverter<T> => ({
  toFirestore: (d: T): DocumentData => d as unknown as DocumentData,
  fromFirestore: (snap) => ({ id: snap.id, ...(snap.data() as DocumentData) } as T),
});

const jc = () => collection(db, "jobCards").withConverter(as<JobCard>());
const tasks = () => collection(db, "tasks").withConverter(as<JobCardTask>());
const notes = () => collection(db, "notes").withConverter(as<Note>());
const hist = () => collection(db, "taskHistory").withConverter(as<TaskHistoryEntry>());
const parts = () => collection(db, "assignedParts").withConverter(as<AssignedPart>());

export function watchJobCard(jobCardId: string, cb: (v: JobCard | null) => void) {
  return onSnapshot(doc(jc(), jobCardId), (snap) => cb(snap.exists() ? snap.data() : null));
}

export function watchTasks(jobCardId: string, cb: (v: JobCardTask[]) => void) {
  const q = query(tasks(), where("jobCardId", "==", jobCardId));
  return onSnapshot(q, (sn) => cb(sn.docs.map(d => d.data())));
}

export function watchNotes(jobCardId: string, cb: (v: Note[]) => void) {
  const q = query(notes(), where("jobCardId", "==", jobCardId), orderBy("createdAt", "asc"));
  return onSnapshot(q, (sn) => cb(sn.docs.map(d => d.data())));
}

export function watchTaskHistory(jobCardId: string, cb: (v: TaskHistoryEntry[]) => void) {
  const q = query(hist(), where("jobCardId", "==", jobCardId), orderBy("at", "asc"));
  return onSnapshot(q, (sn) => cb(sn.docs.map(d => d.data())));
}

export function watchAssignedParts(jobCardId: string, cb: (v: AssignedPart[]) => void) {
  const q = query(parts(), where("jobCardId", "==", jobCardId));
  return onSnapshot(q, (sn) => cb(sn.docs.map(d => d.data())));
}
