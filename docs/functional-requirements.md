# Functional Requirements

## Overview

This document defines the core functional requirements for the TODO app. These requirements describe the expected features and behaviors of the application and serve as a reference for development and testing.

---

## 1. Task Management

### 1.1 Create a Task
- The user can add a new task by entering a task name and submitting the form.
- A task name must not be empty.
- Upon successful creation, the new task appears in the task list immediately.

### 1.2 Edit a Task
- The user can edit the name of an existing task.
- The user can edit the due date of an existing task.
- Edited tasks are saved and reflected immediately in the task list.

### 1.3 Delete a Task
- The user can delete an individual task.
- Deleting a task removes it from the list immediately without requiring a page refresh.

### 1.4 Mark a Task as Complete
- The user can mark a task as complete or incomplete.
- Completed tasks are visually distinguished from incomplete tasks (e.g., strikethrough or different styling).

---

## 2. Due Dates

### 2.1 Add a Due Date
- The user can assign an optional due date to a task when creating or editing it.

### 2.2 Display Due Date
- Each task displays its due date if one has been set.

### 2.3 Overdue Indicator
- Tasks whose due date has passed and are not yet completed are visually marked as overdue.

---

## 3. Task Sorting & Filtering

### 3.1 Default Sort Order
- Tasks are sorted by creation date (newest first) by default.

### 3.2 Sort by Due Date
- The user can sort tasks by due date (ascending or descending).

### 3.3 Filter by Status
- The user can filter the task list to show:
  - All tasks
  - Only incomplete tasks
  - Only completed tasks

---

## 4. Persistence

### 4.1 Data Persistence
- Tasks are persisted in the backend database and survive page refreshes.

### 4.2 Initial Load
- All existing tasks are loaded and displayed when the application starts.

---

## 5. Error Handling & Feedback

### 5.1 User Feedback
- The user receives visual feedback when an operation (create, edit, delete) succeeds or fails.

### 5.2 Network Error Handling
- If the backend is unavailable, the app displays a user-friendly error message.
