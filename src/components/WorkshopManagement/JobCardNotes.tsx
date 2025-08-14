import React, { useState } from "react";
import Card, { CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MessageSquare, Edit, Save, X, User, Clock } from "lucide-react";
import { formatDateTime } from "@/utils/helpers";

interface JobCardNotesProps {
  notes: {
    id: string;
    text: string;
    createdBy: string;
    createdAt: string;
    type: "general" | "technician" | "customer" | "internal";
  }[];
  onAddNote: (text: string, type: "general" | "technician" | "customer" | "internal") => void;
  onEditNote?: (id: string, text: string) => void;
  onDeleteNote?: (id: string) => void;
  readonly?: boolean;
}

const JobCardNotes: React.FC<JobCardNotesProps> = ({
  notes,
  onAddNote,
  onEditNote,
  onDeleteNote,
  readonly = false,
}) => {
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState<"general" | "technician" | "customer" | "internal">(
    "general"
  );
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editedNoteText, setEditedNoteText] = useState("");

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    onAddNote(newNote, noteType);
    setNewNote("");
  };

  const startEditingNote = (note: { id: string; text: string }) => {
    setEditingNoteId(note.id);
    setEditedNoteText(note.text);
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setEditedNoteText("");
  };

  const saveEdit = (id: string) => {
    if (!editedNoteText.trim() || !onEditNote) return;

    onEditNote(id, editedNoteText);
    setEditingNoteId(null);
    setEditedNoteText("");
  };

  const getNoteTypeLabel = (type: string) => {
    switch (type) {
      case "technician":
        return "Technician Note";
      case "customer":
        return "Customer Note";
      case "internal":
        return "Internal Note";
      default:
        return "General Note";
    }
  };

  const getNoteTypeClass = (type: string) => {
    switch (type) {
      case "technician":
        return "bg-blue-100 text-blue-800";
      case "customer":
        return "bg-purple-100 text-purple-800";
      case "internal":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const action = e.currentTarget.textContent?.trim();

    if (action === "Cancel") {
      cancelEdit();
    } else if (action === "Save" && editingNoteId) {
      saveEdit(editingNoteId);
    } else if (action === "Add Note") {
      handleAddNote();
    } else {
      // Handle edit/delete based on icon
      const iconName = e.currentTarget.querySelector("svg")?.dataset.iconName;
      if (iconName === "edit" && e.currentTarget.parentElement) {
        const noteId = e.currentTarget.closest("[data-note-id]")?.getAttribute("data-note-id");
        const note = notes.find((n) => n.id === noteId);
        if (note) startEditingNote(note);
      } else if (iconName === "x" && onDeleteNote) {
        const noteId = e.currentTarget.closest("[data-note-id]")?.getAttribute("data-note-id");
        if (noteId) onDeleteNote(noteId);
      }
    }
  };

  return (
    <Card>
      <CardHeader title="Notes & Communication" />
      <CardContent>
        {/* Note List */}
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notes</h3>
            <p className="mt-1 text-sm text-gray-500">
              {readonly
                ? "No notes have been added to this job card."
                : "Add a note to track important details or communication."}
            </p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`p-4 rounded-lg border ${
                  note.type === "technician"
                    ? "bg-blue-50 border-blue-200"
                    : note.type === "customer"
                      ? "bg-purple-50 border-purple-200"
                      : note.type === "internal"
                        ? "bg-orange-50 border-orange-200"
                        : "bg-gray-50 border-gray-200"
                }`}
              >
                {editingNoteId === note.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editedNoteText}
                      onChange={(e) => setEditedNoteText(e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                      rows={3}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={onClick}
                        icon={<X className="w-3 h-3" />}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={onClick} icon={<Save className="w-3 h-3" />}>
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNoteTypeClass(note.type)}`}
                        >
                          {getNoteTypeLabel(note.type)}
                        </span>
                      </div>
                      {!readonly && onEditNote && onDeleteNote && (
                        <div className="flex space-x-2">
                          <button className="text-gray-400 hover:text-gray-500" onClick={onClick}>
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-400 hover:text-red-500" onClick={onClick}>
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">{note.text}</p>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <User className="w-3 h-3 mr-1" />
                      <span className="mr-2">{note.createdBy}</span>
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{formatDateTime(note.createdAt)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Note Form */}
        {!readonly && (
          <div className="space-y-3 pt-3 border-t">
            <h4 className="text-sm font-medium text-gray-700">Add a Note</h4>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              rows={3}
              placeholder="Type your note here..."
            />
            <div className="flex justify-between items-center">
              <select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value as any)}
                className="border rounded-md px-3 py-1 text-sm"
              >
                <option value="general">General Note</option>
                <option value="technician">Technician Note</option>
                <option value="customer">Customer Note</option>
                <option value="internal">Internal Note</option>
              </select>
              <Button
                size="sm"
                onClick={onClick}
                disabled={!newNote.trim()}
                icon={<MessageSquare className="w-4 h-4" />}
              >
                Add Note
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobCardNotes;
