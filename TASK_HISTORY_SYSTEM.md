# Task History System

A comprehensive task history logging system for the workshop management application, built with React + TypeScript + Firebase Firestore.

## Overview

The task history system provides:

- **Persistent logging** of all task/job-related activities
- **Real-time updates** via Firestore subscriptions
- **Structured data** with proper TypeScript interfaces
- **Easy integration** with existing React components
- **Context-based API** for consistent usage across the app

## Architecture

### Firestore Structure

```
tasks/{jobCardId}/
  - (job card data)
  taskHistory/{historyEntryId}
    - id: string
    - taskId: string
    - event: 'statusChanged' | 'assigned' | 'verified' | 'edited'
    - previousStatus?: string
    - newStatus?: string
    - by: string (user who performed the action)
    - at: timestamp (server timestamp)
    - notes?: string
```

### Core Components

1. **`/utils/taskHistory.ts`** - Core Firestore operations
2. **`/hooks/useTaskHistory.ts`** - React hook for real-time history
3. **`/components/Models/Workshop/TaskHistoryList.tsx`** - UI component
4. **`/contexts/TaskHistoryContext.tsx`** - Context provider for app-wide usage

## Quick Start

### 1. Basic Usage in Components

```tsx
import { useTaskHistory } from "../hooks/useTaskHistory";
import TaskHistoryList from "../components/Models/Workshop/TaskHistoryList";

function JobCardPage({ jobId }: { jobId: string }) {
  return (
    <div>
      {/* Your job card content */}

      {/* Task History Display */}
      <TaskHistoryList taskId={jobId} />
    </div>
  );
}
```

### 2. Logging Events Directly

```tsx
import { logStatusChange, logTaskAssignment } from "../utils/taskHistory";

// Log status change
await logStatusChange(
  "job123",
  "pending",
  "in_progress",
  "John Doe",
  "Started brake pad replacement"
);

// Log task assignment
await logTaskAssignment("job123", "Jane Smith", "John Doe", "Assigned brake inspection task");
```

### 3. Using the Context Provider

```tsx
// In your App root:
import { TaskHistoryProvider } from "./contexts/TaskHistoryContext";

function App() {
  return (
    <TaskHistoryProvider>
      <YourMainContent />
    </TaskHistoryProvider>
  );
}

// In any component:
import { useTaskHistoryContext } from "../contexts/TaskHistoryContext";

function SomeComponent() {
  const { logJobStatusChange } = useTaskHistoryContext();

  const handleStatusUpdate = async () => {
    await logJobStatusChange("job123", "pending", "completed", "John Doe");
  };
}
```

## Event Types

### Status Changes

```tsx
await logStatusChange(jobId, "pending", "in_progress", userName, "Work started");
```

### Task Assignment

```tsx
await logTaskAssignment(jobId, "Jane Smith", userName, "Brake system repair");
```

### Task Verification

```tsx
await logTaskVerification(jobId, userName, "QA check completed");
```

### General Updates

```tsx
await logTaskEdit(jobId, userName, "Updated estimated completion time");
```

## Integration Points

### JobCard Component

- Automatically logs status changes when tasks are updated
- Shows live task history in the sidebar
- Logs assignment changes and task completion

### Workshop Workflow

- **Job Creation**: Log initial job setup
- **Task Assignment**: Log when mechanics are assigned
- **Work Progress**: Log status transitions (pending → in_progress → completed)
- **Quality Assurance**: Log supervisor verification
- **Part Management**: Log parts assigned/removed
- **Invoice Generation**: Log invoice creation

### Maintenance Workflow

- **Scheduled Maintenance**: Log maintenance start/completion
- **Preventive Actions**: Log preventive measures taken
- **Issue Resolution**: Log root cause analysis and corrective actions

## UI Features

### TaskHistoryList Component

- **Real-time updates** - automatically refreshes when new entries are added
- **Event categorization** - different icons for different event types
- **User attribution** - shows who performed each action and when
- **Detailed timestamps** - human-readable date/time formatting
- **Loading states** - proper loading and error handling
- **Empty states** - helpful message when no history exists

### Event Icons

- 🔄 Status changes
- 👤 Task assignments
- ✅ Task verification
- ✏️ Task edits

## Best Practices

### 1. Consistent Logging

```tsx
// Good: Descriptive, actionable logs
await logTaskEdit(jobId, userName, "Updated brake pad specifications - switched to ceramic pads");

// Avoid: Vague or unhelpful logs
await logTaskEdit(jobId, userName, "Updated task");
```

### 2. Error Handling

```tsx
try {
  await logStatusChange(jobId, oldStatus, newStatus, userName);
} catch (error) {
  console.error("Failed to log status change:", error);
  // Handle gracefully - don't block the main workflow
}
```

### 3. Performance

- Use the `useTaskHistory` hook for real-time subscriptions
- Call `getTaskHistory` for one-time snapshots
- The system automatically manages Firestore subscriptions

### 4. User Context

Always include meaningful user identification:

```tsx
// Good
const currentUser = useAuth(); // Your auth system
await logTaskEdit(jobId, currentUser.displayName, "Completed brake inspection");

// Better
await logTaskEdit(jobId, `${currentUser.name} (${currentUser.role})`, "Completed brake inspection");
```

## Data Flow

1. **User Action** → Component event handler
2. **Event Handler** → Calls appropriate logging function
3. **Logging Function** → Writes to Firestore subcollection
4. **Firestore** → Triggers real-time subscription
5. **useTaskHistory Hook** → Updates component state
6. **TaskHistoryList** → Re-renders with new history

## Future Enhancements

- **Search & Filtering**: Filter history by event type, user, date range
- **Export**: Generate history reports (PDF, CSV)
- **Analytics**: Aggregate insights (average completion times, common issues)
- **Notifications**: Real-time notifications for critical events
- **Audit Trail**: Immutable logs for compliance requirements

## Troubleshooting

### Common Issues

**History not updating in real-time:**

- Check Firestore security rules allow reading the subcollection
- Verify the taskId parameter is correct
- Ensure component is properly subscribed via useTaskHistory

**Missing history entries:**

- Check that logging functions are being called with await
- Verify Firestore write permissions
- Check browser console for error messages

**Performance issues:**

- Limit history queries with pagination if needed
- Consider indexing frequently queried fields in Firestore
- Use proper cleanup in useEffect to avoid memory leaks
